"""
Supabase client configuration and utilities
"""

import os
from typing import Optional
import logging
import inspect

import httpx
from supabase import create_client, Client

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
            
            _ensure_httpx_proxy_compat()
            cls._instance = create_client(url, key)
            logger.info("Supabase client initialized")
        
        return cls._instance

def get_supabase_client() -> Client:
    """Get Supabase client for dependency injection"""
    return SupabaseClient.get_client()


def _ensure_httpx_proxy_compat() -> None:
    """Patch httpx.Client to accept the legacy proxy keyword used by gotrue."""
    signature = inspect.signature(httpx.Client.__init__)
    if "proxy" in signature.parameters:
        return

    original_init = httpx.Client.__init__

    def patched_init(self, *args, proxy=None, **kwargs):
        if proxy is not None and "proxies" not in kwargs:
            kwargs["proxies"] = proxy
        return original_init(self, *args, **kwargs)

    httpx.Client.__init__ = patched_init  # type: ignore[assignment]

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token with Supabase"""
    try:
        supabase = get_supabase_client()
        if supabase is None:
            logger.error("Supabase client not initialized")
            raise ValueError("Supabase client not available")
        user = supabase.auth.get_user(token)
        if user is None or user.user is None:
            raise ValueError("Invalid token response")
        return user
    except Exception as e:
        logger.error(f"JWT verification failed: {e}")
        raise ValueError("Invalid token")

def get_user_from_token(token: str) -> dict:
    """Get user data from JWT token"""
    try:
        if not token or not isinstance(token, str) or token.strip() == "":
            raise ValueError("Token is required")
        user_data = verify_jwt_token(token)
        if user_data is None or user_data.user is None:
            raise ValueError("Invalid user data")
        return user_data.user.dict()
    except Exception as e:
        logger.error(f"Failed to get user from token: {e}")
        raise ValueError("Invalid token")

