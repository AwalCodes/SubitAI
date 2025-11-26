"""
Video processing service for handling video uploads, processing, and metadata extraction
"""

import os
import tempfile
import uuid
from typing import Dict, Any, Optional
import logging
from fastapi import HTTPException
import aiofiles
import ffmpeg
from services.supabase_client import get_supabase_client

try:
    from httpx import Response
except ImportError:  # pragma: no cover
    Response = None  # type: ignore

logger = logging.getLogger(__name__)

class VideoService:
    """Service for video processing operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
        self.temp_dir = tempfile.gettempdir()
        if self.supabase is None:
            logger.warning("Supabase client not available - running in test mode")
    
    async def upload_video(self, file: bytes, filename: str, user_id: str) -> Dict[str, Any]:
        """Upload video to Supabase Storage"""
        try:
            # Generate unique filename
            file_extension = os.path.splitext(filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = f"{user_id}/{unique_filename}"
            
            # Upload to Supabase Storage
            try:
                result = self.supabase.storage.from_("videos").upload(
                    path=file_path,
                    file=file,
                    file_options={"content-type": "video/mp4"}
                )
            except Exception as storage_error:
                logger.error(f"Supabase storage error: {storage_error}")
                raise HTTPException(status_code=400, detail="Failed to upload video")

            response_data = None
            if Response is not None and isinstance(result, Response):
                try:
                    response_data = result.json()
                except Exception:  # pragma: no cover
                    response_data = None
            elif isinstance(result, dict):
                response_data = result

            if isinstance(response_data, dict) and response_data.get("error"):
                logger.error(f"Supabase storage responded with error: {response_data}")
                raise HTTPException(status_code=400, detail="Failed to upload video")

            # Get public URL
            public_url = self.supabase.storage.from_("videos").get_public_url(file_path)
            
            return {
                "filename": unique_filename,
                "path": file_path,
                "url": public_url,
                "size": len(file)
            }
            
        except Exception as e:
            logger.error(f"Video upload failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload video")
    
    async def get_video_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extract video metadata using FFmpeg"""
        try:
            # Create temporary file
            temp_file = os.path.join(self.temp_dir, f"temp_{uuid.uuid4()}.mp4")
            
            # Download video from Supabase Storage
            video_data = self.supabase.storage.from_("videos").download(file_path)
            
            # Write to temporary file
            async with aiofiles.open(temp_file, "wb") as f:
                await f.write(video_data)
            
            # Extract metadata using FFmpeg
            probe = ffmpeg.probe(temp_file)
            video_stream = next(
                (stream for stream in probe["streams"] if stream["codec_type"] == "video"),
                None
            )
            
            if not video_stream:
                raise HTTPException(status_code=400, detail="Invalid video file")
            
            # Extract duration
            duration = float(probe["format"]["duration"])
            
            # Extract resolution
            width = int(video_stream["width"])
            height = int(video_stream["height"])
            
            # Clean up temporary file
            os.unlink(temp_file)
            
            return {
                "duration": duration,
                "width": width,
                "height": height,
                "format": probe["format"]["format_name"],
                "size": int(probe["format"]["size"])
            }
            
        except Exception as e:
            logger.error(f"Metadata extraction failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to extract video metadata")
    
    async def download_video(self, file_path: str) -> bytes:
        """Download video from Supabase Storage"""
        try:
            video_data = self.supabase.storage.from_("videos").download(file_path)
            return video_data
        except Exception as e:
            logger.error(f"Video download failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to download video")
    
    async def delete_video(self, file_path: str) -> bool:
        """Delete video from Supabase Storage"""
        try:
            result = self.supabase.storage.from_("videos").remove([file_path])
            return not result.get("error")
        except Exception as e:
            logger.error(f"Video deletion failed: {e}")
            return False
    
    def get_signed_video_url(self, file_path: str, expires_in: int = 3600) -> str:
        """Generate a signed URL for private video access"""
        try:
            # Generate signed URL that expires in expires_in seconds
            signed_url = self.supabase.storage.from_("videos").create_signed_url(file_path, expires_in)
            if isinstance(signed_url, dict) and 'signedURL' in signed_url:
                return signed_url['signedURL']
            elif isinstance(signed_url, str):
                return signed_url
            else:
                # Fallback to public URL if signed URL generation fails
                return self.supabase.storage.from_("videos").get_public_url(file_path)
        except Exception as e:
            logger.warning(f"Failed to generate signed URL: {e}, falling back to public URL")
            # Fallback to public URL
            return self.supabase.storage.from_("videos").get_public_url(file_path)
    
    def validate_video_file(self, filename: str, file_size: int) -> bool:
        """Validate video file format and size"""
        # Check file extension
        allowed_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
        file_extension = os.path.splitext(filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            return False
        
        # Check file size (max 1GB)
        max_size = 1024 * 1024 * 1024  # 1GB
        if file_size > max_size:
            return False
        
        return True

# Global instance
video_service = VideoService()

