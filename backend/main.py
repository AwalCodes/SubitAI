"""
SUBIT.AI - FastAPI Backend
Main application entry point for the AI subtitle generation platform
"""

import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from parent directory FIRST
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
load_dotenv(dotenv_path=str(project_root / '.env'))
load_dotenv(dotenv_path=str(backend_dir / '.env'), override=True)

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from routes import auth, projects, subtitles, billing
# from routes import export
from services.supabase_client import get_supabase_client
# from workers.celery import celery_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting SUBIT.AI backend...")
    yield
    # Shutdown
    logger.info("Shutting down SUBIT.AI backend...")

# Create FastAPI app
app = FastAPI(
    title="SUBIT.AI API",
    description="AI-powered subtitle generation platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Restrict origins in production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
if allowed_origins == ["*"] and os.getenv("ENVIRONMENT") == "production":
    logger.warning("CORS is set to allow all origins in production - this is insecure!")
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(subtitles.router, prefix="/api/subtitles", tags=["subtitles"])
# app.include_router(export.router, prefix="/api/export", tags=["export"])
app.include_router(billing.router, prefix="/api/billing", tags=["billing"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SUBIT.AI API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check Supabase connection
        supabase = get_supabase_client()
        supabase.table("users").select("id").limit(1).execute()
        
        # Check Celery worker (commented out for testing)
        # celery_app.control.inspect().stats()
        
        return {
            "status": "healthy",
            "database": "connected",
            "celery": "disabled"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

