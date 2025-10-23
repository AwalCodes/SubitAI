"""
Export routes for video export with burned-in subtitles
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Dict, Any, Optional
import logging
from services.supabase_client import get_supabase_client
from services.auth_service import get_current_user, check_subscription_tier
from services.export_service import export_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/video/{project_id}")
async def export_video(
    project_id: str,
    export_options: Dict[str, Any],
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    """Export video with burned-in subtitles"""
    try:
        supabase = get_supabase_client()
        
        # Get project and subtitles
        project_result = supabase.table("projects")\
            .select("*, subtitles(*)")\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not project_result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project = project_result.data[0]
        
        if not project.get("subtitles") or len(project["subtitles"]) == 0:
            raise HTTPException(status_code=400, detail="No subtitles found for this project")
        
        subtitle = project["subtitles"][0]
        
        # Check if user has permission for watermark-free export
        watermark_free = check_subscription_tier(user, "pro")
        if not watermark_free and export_options.get("remove_watermark", False):
            raise HTTPException(
                status_code=403,
                detail="Watermark removal requires Pro or Team subscription"
            )
        
        # Start export in background
        background_tasks.add_task(
            _export_video_background,
            project_id,
            project["video_filename"],
            subtitle["json_data"]["segments"],
            user["id"],
            export_options
        )
        
        return {
            "message": "Video export started",
            "project_id": project_id,
            "status": "processing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start video export: {e}")
        raise HTTPException(status_code=500, detail="Failed to start video export")

async def _export_video_background(
    project_id: str,
    video_filename: str,
    subtitles: list,
    user_id: str,
    options: Dict[str, Any]
):
    """Background task for video export"""
    try:
        # Export video with subtitles
        export_result = await export_service.export_video_with_subtitles(
            f"{user_id}/{video_filename}",
            subtitles,
            user_id,
            options
        )
        
        # Update project with export URL
        supabase = get_supabase_client()
        supabase.table("projects")\
            .update({
                "export_url": export_result["url"],
                "status": "completed"
            })\
            .eq("id", project_id)\
            .execute()
        
        logger.info(f"Video export completed for project {project_id}")
        
    except Exception as e:
        logger.error(f"Background export failed: {e}")
        # Update project status to failed
        supabase = get_supabase_client()
        supabase.table("projects")\
            .update({"status": "failed"})\
            .eq("id", project_id)\
            .execute()

@router.get("/video/{project_id}/status")
async def get_export_status(
    project_id: str,
    user: dict = Depends(get_current_user)
):
    """Get video export status"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("projects")\
            .select("id, status, export_url")\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project = result.data[0]
        
        return {
            "project_id": project_id,
            "status": project["status"],
            "export_url": project.get("export_url"),
            "message": "Export status retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get export status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get export status")

@router.post("/srt/{project_id}")
async def export_srt_file(
    project_id: str,
    user: dict = Depends(get_current_user)
):
    """Export SRT subtitle file"""
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
        
        # Generate and upload SRT file
        srt_result = await export_service.generate_srt_file(
            subtitle["json_data"]["segments"],
            user["id"],
            project_id
        )
        
        # Update subtitle record with SRT URL
        supabase.table("subtitles")\
            .update({"srt_url": srt_result["url"]})\
            .eq("project_id", project_id)\
            .execute()
        
        return {
            "srt_file": srt_result,
            "message": "SRT file exported successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to export SRT file: {e}")
        raise HTTPException(status_code=500, detail="Failed to export SRT file")

@router.get("/download/{project_id}")
async def download_exported_video(
    project_id: str,
    user: dict = Depends(get_current_user)
):
    """Download exported video"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("projects")\
            .select("export_url, title")\
            .eq("id", project_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project = result.data[0]
        
        if not project.get("export_url"):
            raise HTTPException(status_code=400, detail="Video not yet exported")
        
        return {
            "download_url": project["export_url"],
            "filename": f"{project['title']}_with_subtitles.mp4",
            "message": "Export URL retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get download URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to get download URL")







