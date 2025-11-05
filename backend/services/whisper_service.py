"""
Whisper service for AI-powered speech-to-text transcription
"""

import os
import tempfile
import uuid
import json
from typing import Dict, List, Any, Optional
import logging
from fastapi import HTTPException

# Try to import whisper - not required for basic functionality
try:
    import whisper
    import torch
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    whisper = None
    torch = None

from services.video_service import video_service

logger = logging.getLogger(__name__)

class WhisperService:
    """Service for Whisper AI transcription"""
    
    def __init__(self):
        self.model = None
        self.temp_dir = tempfile.gettempdir()
        self._model_loading = False
        # Don't load model on init - load lazily when needed
    
    def _load_model(self):
        """Load Whisper model lazily"""
        if not WHISPER_AVAILABLE:
            raise HTTPException(status_code=503, detail="Whisper AI model not installed. Please install: pip install openai-whisper torch")
        
        if self.model is not None:
            return
        
        if self._model_loading:
            # Wait for another thread to finish loading
            while self._model_loading:
                import time
                time.sleep(0.1)
            return
        
        try:
            self._model_loading = True
            # Use GPU if available, otherwise CPU
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Loading Whisper model on {device}")
            
            # Load the large-v3 model for best accuracy
            # Use base model for faster loading and processing
            model_name = os.getenv("WHISPER_MODEL", "base")
            self.model = whisper.load_model(model_name, device=device)
            logger.info("Whisper model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise HTTPException(status_code=500, detail="Failed to initialize AI model")
        finally:
            self._model_loading = False
    
    async def transcribe_video(self, file_path: str, language: str = "en") -> Dict[str, Any]:
        """Transcribe video using Whisper AI"""
        try:
            # Load model if not already loaded
            self._load_model()
            
            # Download video from storage
            video_data = await video_service.download_video(file_path)
            
            # Create temporary file
            temp_file = os.path.join(self.temp_dir, f"temp_{uuid.uuid4()}.mp4")
            
            # Write video data to temporary file
            with open(temp_file, "wb") as f:
                f.write(video_data)
            
            # Transcribe with Whisper
            logger.info(f"Starting transcription for {file_path}")
            
            # Determine if we're on CPU or GPU
            device = "cuda" if torch.cuda.is_available() else "cpu"
            fp16_enabled = device == "cuda"  # Only use fp16 on GPU
            
            result = self.model.transcribe(
                temp_file,
                language=language if language != "auto" else None,
                verbose=True,
                word_timestamps=True,
                fp16=fp16_enabled  # Disable fp16 on CPU for better compatibility
            )
            
            logger.info(f"Transcription completed. Found {len(result.get('segments', []))} segments")
            logger.info(f"Full text length: {len(result.get('text', ''))}")
            
            # Clean up temporary file
            os.unlink(temp_file)
            
            # Process results
            segments = []
            for segment in result["segments"]:
                text_content = segment.get("text", "").strip()
                logger.info(f"Segment {segment['id']}: '{text_content}' ({segment['start']:.2f}s - {segment['end']:.2f}s)")
                
                segments.append({
                    "id": segment["id"],
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": text_content,
                    "words": segment.get("words", [])
                })
            
            # Generate SRT content
            srt_content = self._generate_srt(segments)
            
            return {
                "text": result["text"],
                "language": result["language"],
                "segments": segments,
                "srt_content": srt_content,
                "duration": result.get("duration", 0)
            }
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to transcribe video")
    
    def _generate_srt(self, segments: List[Dict]) -> str:
        """Generate SRT format from segments"""
        srt_content = []
        
        for i, segment in enumerate(segments, 1):
            start_time = self._format_timestamp(segment["start"])
            end_time = self._format_timestamp(segment["end"])
            text = segment["text"]
            
            srt_content.append(f"{i}")
            srt_content.append(f"{start_time} --> {end_time}")
            srt_content.append(text)
            srt_content.append("")  # Empty line between segments
        
        return "\n".join(srt_content)
    
    def _format_timestamp(self, seconds: float) -> str:
        """Format timestamp for SRT format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
    
    async def translate_subtitles(self, segments: List[Dict], target_language: str) -> Dict[str, Any]:
        """Translate subtitles to target language using Whisper"""
        try:
            # This is a simplified translation - in production, you might want to use
            # a dedicated translation service like Google Translate or DeepL
            
            # For now, we'll use Whisper's built-in translation capability
            # Note: This requires the source text to be in audio form
            # A better approach would be to use a text translation API
            
            logger.warning("Translation feature requires audio input - using placeholder")
            
            # Placeholder translation (replace with actual translation service)
            translated_segments = []
            for segment in segments:
                translated_segments.append({
                    "id": segment["id"],
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": f"[TRANSLATED] {segment['text']}",  # Placeholder
                    "words": segment.get("words", [])
                })
            
            srt_content = self._generate_srt(translated_segments)
            
            return {
                "segments": translated_segments,
                "srt_content": srt_content,
                "target_language": target_language
            }
            
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to translate subtitles")

# Global instance
whisper_service = WhisperService()





