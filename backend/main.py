"""
SUBIT.AI - FastAPI Backend
Main application entry point for the AI subtitle generation platform
"""

# Load environment variables FIRST before any other imports
import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import logging

from routes import auth, projects, subtitles, billing, export
from services.supabase_client import get_supabase_client
from workers.celery import celery_app

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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://subit-ai.vercel.app",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(subtitles.router, prefix="/api/subtitles", tags=["subtitles"])
app.include_router(export.router, prefix="/api/export", tags=["export"])
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
        
        # Check Celery worker
        try:
            celery_stats = celery_app.control.inspect().stats()
            celery_status = "connected" if celery_stats else "no workers"
        except Exception:
            celery_status = "disconnected"
        
        return {
            "status": "healthy",
            "database": "connected",
            "celery": celery_status
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

