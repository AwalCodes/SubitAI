"""
Celery configuration and background tasks for SUBIT.AI
"""

# Load environment variables first
import os
from dotenv import load_dotenv
load_dotenv()

import asyncio
from celery import Celery
import logging
from services.supabase_client import get_supabase_client
from services.whisper_service import whisper_service
from services.export_service import export_service

logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    'subit_ai',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    include=['workers.celery']
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

@celery_app.task(bind=True, name='transcribe_video', max_retries=3)
def transcribe_video_task(self, project_id: str, video_path: str):
    """Background task for video transcription using Whisper"""
    try:
        logger.info(f"====== CELERY TASK RECEIVED ======")
        logger.info(f"Task ID: {self.request.id}")
        logger.info(f"Project ID: {project_id}")
        logger.info(f"Video Path: {video_path}")
        logger.info(f"Starting transcription for project {project_id}")
        
        supabase = get_supabase_client()
        
        # Update project status
        supabase.table("projects")\
            .update({"status": "processing"})\
            .eq("id", project_id)\
            .execute()
        
        # Transcribe video (run async function in sync context)
        transcription_result = asyncio.run(whisper_service.transcribe_video(video_path))
        
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
        
        return {
            "project_id": project_id,
            "status": "completed",
            "segments_count": len(transcription_result["segments"]),
            "duration": transcription_result["duration"]
        }
        
    except Exception as e:
        logger.error(f"Transcription failed for project {project_id}: {e}")
        
        # Update project status to failed
        try:
            supabase.table("projects")\
                .update({"status": "failed"})\
                .eq("id", project_id)\
                .execute()
        except Exception as update_error:
            logger.error(f"Failed to update project status: {update_error}")
        
        # Retry task if it's a temporary error
        if self.request.retries < 3:
            logger.info(f"Retrying transcription for project {project_id} (attempt {self.request.retries + 1})")
            raise self.retry(countdown=60 * (2 ** self.request.retries))  # Exponential backoff
        
        raise e

@celery_app.task(bind=True, name='export_video')
def export_video_task(self, project_id: str, user_id: str, export_options: dict):
    """Background task for video export with burned-in subtitles"""
    try:
        logger.info(f"Starting video export for project {project_id}")
        
        supabase = get_supabase_client()
        
        # Get project and subtitles
        project_result = supabase.table("projects")\
            .select("*, subtitles(*)")\
            .eq("id", project_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not project_result.data:
            raise ValueError(f"Project {project_id} not found")
        
        project = project_result.data[0]
        
        if not project.get("subtitles") or len(project["subtitles"]) == 0:
            raise ValueError("No subtitles found for export")
        
        subtitle = project["subtitles"][0]
        
        # Export video with subtitles (run async function in sync context)
        video_path = f"{user_id}/{project['video_filename']}"
        export_result = asyncio.run(export_service.export_video_with_subtitles(
            video_path,
            subtitle["json_data"]["segments"],
            user_id,
            export_options
        ))
        
        # Update project with export URL
        supabase.table("projects")\
            .update({
                "export_url": export_result["url"],
                "status": "completed"
            })\
            .eq("id", project_id)\
            .execute()
        
        logger.info(f"Video export completed for project {project_id}")
        
        return {
            "project_id": project_id,
            "status": "completed",
            "export_url": export_result["url"]
        }
        
    except Exception as e:
        logger.error(f"Video export failed for project {project_id}: {e}")
        
        # Update project status to failed
        try:
            supabase.table("projects")\
                .update({"status": "failed"})\
                .eq("id", project_id)\
                .execute()
        except Exception as update_error:
            logger.error(f"Failed to update project status: {update_error}")
        
        # Retry task if it's a temporary error
        if self.request.retries < 2:
            logger.info(f"Retrying export for project {project_id} (attempt {self.request.retries + 1})")
            raise self.retry(countdown=120 * (2 ** self.request.retries))  # Exponential backoff
        
        raise e

@celery_app.task(name='cleanup_temp_files')
def cleanup_temp_files_task():
    """Periodic task to clean up temporary files"""
    try:
        import tempfile
        import os
        import glob
        import time
        
        temp_dir = tempfile.gettempdir()
        
        # Find temporary files older than 1 hour
        pattern = os.path.join(temp_dir, "temp_*")
        files = glob.glob(pattern)
        
        cleaned_count = 0
        current_time = time.time()
        
        for file_path in files:
            try:
                # Check if file is older than 1 hour
                if current_time - os.path.getmtime(file_path) > 3600:
                    os.unlink(file_path)
                    cleaned_count += 1
            except Exception as e:
                logger.warning(f"Failed to delete temp file {file_path}: {e}")
        
        logger.info(f"Cleaned up {cleaned_count} temporary files")
        return {"cleaned_files": cleaned_count}
        
    except Exception as e:
        logger.error(f"Cleanup task failed: {e}")
        raise e

# Periodic tasks
celery_app.conf.beat_schedule = {
    'cleanup-temp-files': {
        'task': 'cleanup_temp_files',
        'schedule': 3600.0,  # Run every hour
    },
}

celery_app.conf.timezone = 'UTC'







