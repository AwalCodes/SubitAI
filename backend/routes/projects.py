"""
Project routes for managing video projects
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from typing import List, Optional
import logging
from services.supabase_client import get_supabase_client
from services.auth_service import get_current_user, check_video_size_limit, check_video_duration_limit
from services.video_service import video_service
# from workers.celery import transcribe_video_task

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """Upload video file and create project"""
    try:
        # Validate file
        if not video_service.validate_video_file(file.filename, file.size):
            raise HTTPException(status_code=400, detail="Invalid video file format or size")
        
        # Check user limits
        if not check_video_size_limit(user, file.size):
            raise HTTPException(
                status_code=400, 
                detail=f"File size exceeds limit for {user.get('subscription_tier', 'free')} plan"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Upload to Supabase Storage
        upload_result = await video_service.upload_video(
            file_content, 
            file.filename, 
            user["id"]
        )
        
        # Get video metadata
        metadata = await video_service.get_video_metadata(upload_result["path"])
        
        # Check duration limit
        if not check_video_duration_limit(user, int(metadata["duration"])):
            # Delete uploaded file
            await video_service.delete_video(upload_result["path"])
            raise HTTPException(
                status_code=400,
                detail=f"Video duration exceeds limit for {user.get('subscription_tier', 'free')} plan"
            )
        
        # Create project in database
        supabase = get_supabase_client()
        project_data = {
            "user_id": user["id"],
            "title": title or file.filename,
            "video_url": upload_result["url"],
            "video_filename": upload_result["filename"],
            "video_size": upload_result["size"],
            "video_duration": int(metadata["duration"]),
            "status": "completed"  # Changed from "uploading" to "completed" since transcription is done separately
        }
        
        result = supabase.table("projects").insert(project_data).execute()
        
        if not result.data:
            # Delete uploaded file if database insert fails
            await video_service.delete_video(upload_result["path"])
            raise HTTPException(status_code=400, detail="Failed to create project")
        
        project = result.data[0]
        
        return {
            "project": project,
            "upload": upload_result,
            "metadata": metadata,
            "message": "Video uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Video upload failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload video")

@router.get("/")
async def get_projects(
    user: dict = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0
):
    """Get user's projects"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("projects")\
            .select("*, subtitles(*)")\
            .eq("user_id", user["id"])\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        return {
            "projects": result.data,
            "count": len(result.data),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Failed to get projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve projects")

@router.get("/{project_id}")
async def get_project(
    project_id: str,
    user: dict = Depends(get_current_user)
):
    """Get specific project details"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("projects")\
            .select("*, subtitles(*)")\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project = result.data[0]
        
        # Generate fresh signed URL for the video if video_filename exists
        if project.get("video_filename"):
            video_path = f"{user['id']}/{project['video_filename']}"
            try:
                # Get a fresh signed URL (expires in 1 hour)
                signed_url = video_service.get_signed_video_url(video_path, expires_in=3600)
                project["video_url"] = signed_url
            except Exception as e:
                logger.warning(f"Failed to generate signed URL for video: {e}")
                # Keep existing URL if signed URL generation fails
        
        return {
            "project": project,
            "message": "Project retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get project: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve project")

@router.put("/{project_id}")
async def update_project(
    project_id: str,
    project_data: dict,
    user: dict = Depends(get_current_user)
):
    """Update project information"""
    try:
        supabase = get_supabase_client()
        
        # Check if project exists and belongs to user
        existing = supabase.table("projects")\
            .select("id")\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update project
        result = supabase.table("projects")\
            .update(project_data)\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update project")
        
        return {
            "project": result.data[0],
            "message": "Project updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update project: {e}")
        raise HTTPException(status_code=500, detail="Failed to update project")

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    user: dict = Depends(get_current_user)
):
    """Delete project and associated files"""
    try:
        supabase = get_supabase_client()
        
        # Get project details
        project_result = supabase.table("projects")\
            .select("*, subtitles(*)")\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not project_result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project = project_result.data[0]
        
        # Delete video file from storage
        if project.get("video_filename"):
            video_path = f"{user['id']}/{project['video_filename']}"
            await video_service.delete_video(video_path)
        
        # Delete SRT file from storage if exists
        if project.get("subtitles") and len(project["subtitles"]) > 0:
            subtitle = project["subtitles"][0]
            if subtitle.get("srt_url"):
                # Extract path from URL and delete
                # Implementation depends on your URL structure
                pass
        
        # Delete from database (cascade will handle subtitles)
        delete_result = supabase.table("projects")\
            .delete()\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        return {
            "message": "Project deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete project: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete project")

