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
from groq import Groq
from services.video_service import video_service

logger = logging.getLogger(__name__)

class WhisperService:
    """Service for AI-powered transcription using Groq's FREE Whisper API"""
    
    def __init__(self):
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            logger.error("GROQ_API_KEY not found in environment variables!")
            raise ValueError("GROQ_API_KEY is required")
        self.client = Groq(api_key=groq_api_key)
        self.temp_dir = tempfile.gettempdir()
        logger.info("Whisper service initialized with Groq FREE API")
    
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
            
            # Transcribe with Groq's FREE Whisper API
            logger.info(f"Starting transcription with Groq Whisper for {file_path}")
            
            with open(temp_file, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-large-v3",  # Groq's free Whisper model
                    file=audio_file,
                    response_format="verbose_json"
                )
            
            # Clean up temporary file
            os.unlink(temp_file)
            
            # Log the transcript structure for debugging
            logger.info(f"Transcript type: {type(transcript)}")
            logger.info(f"Transcript attributes: {dir(transcript)}")
            
            # Convert transcript to dict if it's an object
            if hasattr(transcript, 'model_dump'):
                transcript_dict = transcript.model_dump()
            elif hasattr(transcript, 'dict'):
                transcript_dict = transcript.dict()
            elif isinstance(transcript, dict):
                transcript_dict = transcript
            else:
                # Convert object attributes to dict
                transcript_dict = {
                    'text': getattr(transcript, 'text', ''),
                    'language': getattr(transcript, 'language', language),
                    'segments': getattr(transcript, 'segments', [])
                }
            
            logger.info(f"Transcript dict keys: {transcript_dict.keys()}")
            
            # Process segments
            segments = []
            raw_segments = transcript_dict.get('segments', [])
            
            for idx, segment in enumerate(raw_segments):
                # Ensure segment is a dict
                if not isinstance(segment, dict):
                    segment = {
                        'start': getattr(segment, 'start', 0),
                        'end': getattr(segment, 'end', 0),
                        'text': getattr(segment, 'text', '')
                    }
                
                segments.append({
                    "id": idx,
                    "start": float(segment.get('start', 0)),
                    "end": float(segment.get('end', 0)),
                    "text": str(segment.get('text', '')).strip(),
                    "words": []
                })
            
            logger.info(f"Processed {len(segments)} segments")
            
            # Generate SRT content
            srt_content = self._generate_srt(segments)
            
            return {
                "text": transcript_dict.get('text', ''),
                "language": transcript_dict.get('language', language),
                "segments": segments,
                "srt_content": srt_content,
                "duration": segments[-1]["end"] if segments else 0
            }
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to transcribe video: {str(e)}")
    
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





