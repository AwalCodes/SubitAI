"""
Subtitle routes for managing subtitle generation and editing
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
import logging
from services.supabase_client import get_supabase_client
from services.auth_service import get_current_user, check_subscription_tier
from services.whisper_service import whisper_service
# from services.export_service import export_service
# from workers.celery import transcribe_video_task

logger = logging.getLogger(__name__)
router = APIRouter()

async def process_video_transcription(project_id: str, video_filename: str, user_id: str):
    """Background task to transcribe video and save subtitles"""
    try:
        supabase = get_supabase_client()
        
        logger.info(f"Starting transcription for project {project_id}")
        
        # Construct full video path with user_id prefix if not already present
        if not video_filename.startswith(user_id):
            video_path = f"{user_id}/{video_filename}"
        else:
            video_path = video_filename
        
        # Transcribe video
        transcription_result = await whisper_service.transcribe_video(video_path, 'en')
        
        # Save subtitles to database
        subtitle_data = {
            "project_id": project_id,
            "srt_data": transcription_result["srt_content"],
            "json_data": {
                "text": transcription_result["text"],
                "language": transcription_result["language"],
                "segments": transcription_result["segments"],
                "duration": transcription_result["duration"]
            },
            "language": transcription_result["language"]
        }
        
        supabase.table("subtitles").insert(subtitle_data).execute()
        
        # Update project status to completed
        supabase.table("projects")\
            .update({"status": "completed"})\
            .eq("id", project_id)\
            .execute()
        
        logger.info(f"Transcription completed for project {project_id}")
        
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        # Update project status to failed
        try:
            supabase = get_supabase_client()
            supabase.table("projects")\
                .update({"status": "failed"})\
                .eq("id", project_id)\
                .execute()
        except:
            pass

@router.post("/generate/{project_id}")
async def generate_subtitles(
    project_id: str,
    background_tasks: BackgroundTasks,
    language: str = "en",
    user: dict = Depends(get_current_user)
):
    """Generate subtitles for a project using Whisper AI"""
    try:
        supabase = get_supabase_client()
        
        # Get project details
        project_result = supabase.table("projects")\
            .select("*")\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not project_result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project = project_result.data[0]
        
        # Check if subtitles already exist
        existing_subtitles = supabase.table("subtitles")\
            .select("*")\
            .eq("project_id", project_id)\
            .execute()
        
        if existing_subtitles.data:
            raise HTTPException(status_code=400, detail="Subtitles already exist for this project")
        
        # Update project status
        supabase.table("projects")\
            .update({"status": "processing"})\
            .eq("id", project_id)\
            .execute()
        
        # Start transcription in background
        background_tasks.add_task(
            process_video_transcription,
            project_id,
            project["video_filename"],
            user["id"]
        )
        
        return {
            "message": "Subtitle generation started",
            "project_id": project_id,
            "status": "processing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start subtitle generation: {e}")
        raise HTTPException(status_code=500, detail="Failed to start subtitle generation")

@router.get("/{project_id}")
async def get_subtitles(
    project_id: str,
    user: dict = Depends(get_current_user)
):
    """Get subtitles for a project"""
    try:
        supabase = get_supabase_client()
        
        # Verify project belongs to user
        project_result = supabase.table("projects")\
            .select("id")\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not project_result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get subtitles
        result = supabase.table("subtitles")\
            .select("*")\
            .eq("project_id", project_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Subtitles not found")
        
        subtitle = result.data[0]
        
        return {
            "subtitles": subtitle,
            "message": "Subtitles retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get subtitles: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve subtitles")

@router.put("/{project_id}")
async def update_subtitles(
    project_id: str,
    subtitle_data: dict,
    user: dict = Depends(get_current_user)
):
    """Update subtitle content"""
    try:
        supabase = get_supabase_client()
        
        # Verify project belongs to user
        project_result = supabase.table("projects")\
            .select("id")\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not project_result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update subtitles
        result = supabase.table("subtitles")\
            .update(subtitle_data)\
            .eq("project_id", project_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update subtitles")
        
        return {
            "subtitles": result.data[0],
            "message": "Subtitles updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update subtitles: {e}")
        raise HTTPException(status_code=500, detail="Failed to update subtitles")

@router.post("/{project_id}/translate")
async def translate_subtitles(
    project_id: str,
    target_language: str,
    user: dict = Depends(get_current_user)
):
    """Translate subtitles to target language (Premium feature)"""
    try:
        # Check if user has premium subscription
        if not check_subscription_tier(user, "pro"):
            raise HTTPException(
                status_code=403, 
                detail="Translation feature requires Pro or Team subscription"
            )
        
        supabase = get_supabase_client()
        
        # Get subtitles
        result = supabase.table("subtitles")\
            .select("*")\
            .eq("project_id", project_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Subtitles not found")
        
        subtitle = result.data[0]
        segments = subtitle["json_data"]["segments"]
        
        # Translate subtitles
        translation_result = await whisper_service.translate_subtitles(segments, target_language)
        
        # Update subtitles with translation
        updated_data = {
            "json_data": {
                **subtitle["json_data"],
                "segments": translation_result["segments"]
            },
            "srt_data": translation_result["srt_content"],
            "language": target_language
        }
        
        update_result = supabase.table("subtitles")\
            .update(updated_data)\
            .eq("project_id", project_id)\
            .execute()
        
        return {
            "subtitles": update_result.data[0],
            "message": "Subtitles translated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to translate subtitles: {e}")
        raise HTTPException(status_code=500, detail="Failed to translate subtitles")

@router.get("/{project_id}/download")
async def download_subtitles(
    project_id: str,
    format: str = "srt",
    user: dict = Depends(get_current_user)
):
    """Download subtitles in specified format"""
    try:
        supabase = get_supabase_client()
        
        # Get subtitles
        result = supabase.table("subtitles")\
            .select("*")\
            .eq("project_id", project_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Subtitles not found")
        
        subtitle = result.data[0]
        
        if format.lower() == "srt":
            content = subtitle["srt_data"]
            content_type = "text/plain"
            filename = f"subtitles_{project_id}.srt"
        elif format.lower() == "json":
            import json
            content = json.dumps(subtitle["json_data"], indent=2)
            content_type = "application/json"
            filename = f"subtitles_{project_id}.json"
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
        
        return {
            "content": content,
            "filename": filename,
            "content_type": content_type,
            "message": "Subtitles downloaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to download subtitles: {e}")
        raise HTTPException(status_code=500, detail="Failed to download subtitles")

