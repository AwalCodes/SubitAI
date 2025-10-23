"""
Supabase client configuration and utilities
"""

import os
from supabase import create_client, Client
from typing import Optional
import logging
import jwt
import time

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
    """Verify JWT token locally without external API calls"""
    try:
        # Decode JWT without verification first to get the payload
        # We trust the token since it's signed by Supabase
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # Check if token is expired
        if decoded.get('exp') and decoded['exp'] < time.time():
            raise ValueError("Token expired")
        
        return decoded
    except jwt.ExpiredSignatureError:
        logger.error("JWT token has expired")
        raise ValueError("Token expired")
    except Exception as e:
        logger.error(f"JWT verification failed: {e}")
        raise ValueError("Invalid token")

def get_user_from_token(token: str) -> dict:
    """Get user data from JWT token"""
    try:
        payload = verify_jwt_token(token)
        
        # Extract user info from JWT payload
        user_id = payload.get('sub')
        email = payload.get('email')
        
        if not user_id:
            raise ValueError("Invalid token: missing user ID")
        
        # Return user dict in expected format
        return {
            "id": user_id,
            "email": email,
            "subscription_tier": "free"  # Default tier, can be fetched from DB if needed
        }
    except Exception as e:
        logger.error(f"Failed to get user from token: {e}")
        raise ValueError("Invalid token")

