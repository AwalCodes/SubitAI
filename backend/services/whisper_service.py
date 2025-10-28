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
import whisper
import torch
from services.video_service import video_service

logger = logging.getLogger(__name__)

class WhisperService:
    """Service for Whisper AI transcription"""
    
    def __init__(self):
        self.model = None
        self.temp_dir = tempfile.gettempdir()
        self._load_model()
    
    def _load_model(self):
        """Load Whisper model"""
        try:
            # Use GPU if available, otherwise CPU
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Loading Whisper model on {device}")
            
            # Load the large-v3 model for best accuracy
            self.model = whisper.load_model("large-v3", device=device)
            logger.info("Whisper model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise HTTPException(status_code=500, detail="Failed to initialize AI model")
    
    async def transcribe_video(self, file_path: str, language: str = "en") -> Dict[str, Any]:
        """Transcribe video using Whisper AI"""
        try:
            # Download video from storage
            video_data = await video_service.download_video(file_path)
            
            # Create temporary file
            temp_file = os.path.join(self.temp_dir, f"temp_{uuid.uuid4()}.mp4")
            
            # Write video data to temporary file
            with open(temp_file, "wb") as f:
                f.write(video_data)
            
            # Transcribe with Whisper
            logger.info(f"Starting transcription for {file_path}")
            result = self.model.transcribe(
                temp_file,
                language=language if language != "auto" else None,
                verbose=True,
                word_timestamps=True
            )
            
            # Clean up temporary file
            os.unlink(temp_file)
            
            # Process results
            segments = []
            for segment in result["segments"]:
                segments.append({
                    "id": segment["id"],
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": segment["text"].strip(),
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





