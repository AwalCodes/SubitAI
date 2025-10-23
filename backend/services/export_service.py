"""
Export service for generating videos with burned-in subtitles
"""

import os
import tempfile
import uuid
from typing import Dict, Any, List
import logging
from fastapi import HTTPException
import ffmpeg
# from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
from services.supabase_client import get_supabase_client
from services.video_service import video_service

logger = logging.getLogger(__name__)

class ExportService:
    """Service for video export operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
        self.temp_dir = tempfile.gettempdir()
    
    async def export_video_with_subtitles(
        self,
        file_path: str,
        subtitles: List[Dict],
        user_id: str,
        options: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Export video with burned-in subtitles"""
        try:
            # Default options
            default_options = {
                "font_family": "Arial",
                "font_size": 24,
                "font_color": "white",
                "background_color": "black",
                "background_opacity": 0.7,
                "position": "bottom",
                "margin": 50
            }
            options = {**default_options, **(options or {})}
            
            # Download original video
            video_data = await video_service.download_video(file_path)
            
            # Create temporary files
            temp_video = os.path.join(self.temp_dir, f"temp_video_{uuid.uuid4()}.mp4")
            temp_output = os.path.join(self.temp_dir, f"temp_output_{uuid.uuid4()}.mp4")
            
            # Write video to temporary file
            with open(temp_video, "wb") as f:
                f.write(video_data)
            
            # Create subtitle file
            subtitle_file = self._create_subtitle_file(subtitles, options)
            
            # Use FFmpeg to burn subtitles
            await self._burn_subtitles_ffmpeg(temp_video, subtitle_file, temp_output, options)
            
            # Upload exported video
            with open(temp_output, "rb") as f:
                exported_data = f.read()
            
            # Generate unique filename
            unique_filename = f"export_{uuid.uuid4()}.mp4"
            export_path = f"{user_id}/exports/{unique_filename}"
            
            # Upload to Supabase Storage
            result = self.supabase.storage.from_("exports").upload(
                path=export_path,
                file=exported_data,
                file_options={"content-type": "video/mp4"}
            )
            
            if result.get("error"):
                raise HTTPException(status_code=400, detail="Failed to upload exported video")
            
            # Get public URL
            public_url = self.supabase.storage.from_("exports").get_public_url(export_path)
            
            # Clean up temporary files
            os.unlink(temp_video)
            os.unlink(temp_output)
            os.unlink(subtitle_file)
            
            return {
                "filename": unique_filename,
                "path": export_path,
                "url": public_url,
                "size": len(exported_data)
            }
            
        except Exception as e:
            logger.error(f"Video export failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to export video")
    
    def _create_subtitle_file(self, subtitles: List[Dict], options: Dict[str, Any]) -> str:
        """Create SRT subtitle file for FFmpeg"""
        subtitle_file = os.path.join(self.temp_dir, f"subtitles_{uuid.uuid4()}.srt")
        
        srt_content = []
        for i, subtitle in enumerate(subtitles, 1):
            start_time = self._format_timestamp(subtitle["start"])
            end_time = self._format_timestamp(subtitle["end"])
            text = subtitle["text"]
            
            srt_content.append(f"{i}")
            srt_content.append(f"{start_time} --> {end_time}")
            srt_content.append(text)
            srt_content.append("")
        
        with open(subtitle_file, "w", encoding="utf-8") as f:
            f.write("\n".join(srt_content))
        
        return subtitle_file
    
    def _format_timestamp(self, seconds: float) -> str:
        """Format timestamp for SRT format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
    
    async def _burn_subtitles_ffmpeg(
        self,
        input_video: str,
        subtitle_file: str,
        output_video: str,
        options: Dict[str, Any]
    ):
        """Use FFmpeg to burn subtitles into video"""
        try:
            # FFmpeg command for burning subtitles
            (
                ffmpeg
                .input(input_video)
                .output(
                    output_video,
                    vcodec='libx264',
                    acodec='aac',
                    vf=f"subtitles={subtitle_file}:force_style='FontName={options['font_family']},FontSize={options['font_size']},PrimaryColour=&H{self._color_to_hex(options['font_color'])},BackColour=&H{self._color_to_hex(options['background_color'])}'"
                )
                .overwrite_output()
                .run(quiet=True)
            )
            
        except ffmpeg.Error as e:
            logger.error(f"FFmpeg error: {e}")
            raise HTTPException(status_code=500, detail="Failed to process video with FFmpeg")
    
    def _color_to_hex(self, color_name: str) -> str:
        """Convert color name to hex format for FFmpeg"""
        color_map = {
            "white": "ffffff",
            "black": "000000",
            "red": "ff0000",
            "green": "00ff00",
            "blue": "0000ff",
            "yellow": "ffff00"
        }
        return color_map.get(color_name.lower(), "ffffff")
    
    async def generate_srt_file(
        self,
        subtitles: List[Dict],
        user_id: str,
        project_id: str
    ) -> Dict[str, Any]:
        """Generate and upload SRT subtitle file"""
        try:
            # Create SRT content
            srt_content = []
            for i, subtitle in enumerate(subtitles, 1):
                start_time = self._format_timestamp(subtitle["start"])
                end_time = self._format_timestamp(subtitle["end"])
                text = subtitle["text"]
                
                srt_content.append(f"{i}")
                srt_content.append(f"{start_time} --> {end_time}")
                srt_content.append(text)
                srt_content.append("")
            
            srt_text = "\n".join(srt_content)
            
            # Upload SRT file
            unique_filename = f"subtitles_{uuid.uuid4()}.srt"
            srt_path = f"{user_id}/subtitles/{project_id}/{unique_filename}"
            
            result = self.supabase.storage.from_("subtitles").upload(
                path=srt_path,
                file=srt_text.encode("utf-8"),
                file_options={"content-type": "text/plain"}
            )
            
            if result.get("error"):
                raise HTTPException(status_code=400, detail="Failed to upload SRT file")
            
            # Get public URL
            public_url = self.supabase.storage.from_("subtitles").get_public_url(srt_path)
            
            return {
                "filename": unique_filename,
                "path": srt_path,
                "url": public_url,
                "content": srt_text
            }
            
        except Exception as e:
            logger.error(f"SRT generation failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate SRT file")

# Global instance
export_service = ExportService()





