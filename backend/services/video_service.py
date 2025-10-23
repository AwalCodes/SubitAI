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
            result = self.supabase.storage.from_("videos").upload(
                path=file_path,
                file=file,
                file_options={"content-type": "video/mp4"}
            )
            
            # Check if upload was successful
            # The result object from supabase-py doesn't have a .get() method
            # If there's an error, it will raise an exception
            logger.info(f"Video uploaded successfully to {file_path}")
            
            # Generate signed URL (valid for 1 hour) since bucket is private
            signed_url = self.supabase.storage.from_("videos").create_signed_url(file_path, 3600)
            
            return {
                "filename": unique_filename,
                "path": file_path,
                "url": signed_url['signedURL'] if isinstance(signed_url, dict) else signed_url,
                "size": len(file)
            }
            
        except Exception as e:
            logger.error(f"Video upload failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to upload video: {str(e)}")
    
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
            # Download from Supabase Storage
            data = self.supabase.storage.from_("videos").download(file_path)
            return data
        except Exception as e:
            logger.error(f"Failed to download video: {e}")
            raise HTTPException(status_code=500, detail="Failed to download video")
    
    async def delete_video(self, file_path: str) -> bool:
        """Delete video from Supabase Storage"""
        try:
            logger.info(f"Deleting video: {file_path}")
            # Delete from Supabase Storage
            result = self.supabase.storage.from_("videos").remove([file_path])
            logger.info(f"Video deleted successfully: {file_path}")
            return not result.get("error")
        except Exception as e:
            logger.error(f"Failed to delete video {file_path}: {e}")
            # Don't raise exception, just log - deletion can fail if file doesn't exist
            return False
    
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

