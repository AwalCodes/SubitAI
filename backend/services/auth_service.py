"""
Authentication service for handling user authentication and authorization
"""

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging
from services.supabase_client import get_supabase_client, get_user_from_token

logger = logging.getLogger(__name__)
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        user = get_user_from_token(token)
        return user
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        user = get_user_from_token(token)
        return user
    except Exception:
        return None

def check_subscription_tier(user: dict, required_tier: str) -> bool:
    """Check if user has required subscription tier"""
    user_tier = user.get("subscription_tier", "free")
    
    tier_hierarchy = {
        "free": 0,
        "pro": 1,
        "team": 2
    }
    
    return tier_hierarchy.get(user_tier, 0) >= tier_hierarchy.get(required_tier, 0)

def check_video_size_limit(user: dict, file_size: int) -> bool:
    """Check if video file size is within user's limit"""
    tier = user.get("subscription_tier", "free")
    
    limits = {
        "free": 200 * 1024 * 1024,  # 200MB
        "pro": 500 * 1024 * 1024,   # 500MB
        "team": 1024 * 1024 * 1024  # 1GB
    }
    
    return file_size <= limits.get(tier, limits["free"])

def check_video_duration_limit(user: dict, duration: int) -> bool:
    """Check if video duration is within user's limit"""
    tier = user.get("subscription_tier", "free")
    
    limits = {
        "free": 5 * 60,    # 5 minutes
        "pro": 30 * 60,    # 30 minutes
        "team": float('inf')  # unlimited
    }
    
    return duration <= limits.get(tier, limits["free"])





