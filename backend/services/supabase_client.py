"""
Supabase client configuration and utilities
"""

import os
from supabase import create_client, Client
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class SupabaseClient:
    """Singleton Supabase client"""
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get Supabase client instance"""
        if cls._instance is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if not url or not key:
                # For testing, return a mock client
                logger.warning("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not set, using mock client")
                return None
            
            cls._instance = create_client(url, key)
            logger.info("Supabase client initialized")
        
        return cls._instance

def get_supabase_client() -> Client:
    """Get Supabase client for dependency injection"""
    return SupabaseClient.get_client()

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token with Supabase"""
    try:
        supabase = get_supabase_client()
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        logger.error(f"JWT verification failed: {e}")
        raise ValueError("Invalid token")

def get_user_from_token(token: str) -> dict:
    """Get user data from JWT token"""
    try:
        user_data = verify_jwt_token(token)
        return user_data.user.dict()
    except Exception as e:
        logger.error(f"Failed to get user from token: {e}")
        raise ValueError("Invalid token")

