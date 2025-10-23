"""
Authentication routes for user management
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging
from services.supabase_client import get_supabase_client, verify_jwt_token
from services.auth_service import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.get("/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """Get current user information"""
    try:
        supabase = get_supabase_client()
        
        # Get user profile from database
        result = supabase.table("users").select("*").eq("id", user["id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return {
            "user": result.data[0],
            "message": "User information retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to get user info: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user information")

@router.put("/profile")
async def update_user_profile(
    profile_data: dict,
    user: dict = Depends(get_current_user)
):
    """Update user profile information"""
    try:
        supabase = get_supabase_client()
        
        # Update user profile
        result = supabase.table("users").update(profile_data).eq("id", user["id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update profile")
        
        return {
            "user": result.data[0],
            "message": "Profile updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to update profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.get("/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        token = credentials.credentials
        user = verify_jwt_token(token)
        
        return {
            "valid": True,
            "user_id": user.user.id,
            "message": "Token is valid"
        }
        
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )







