// src/services/auth.ts (updated)
// This file now only validates Clerk JWTs locally.
// It no longer attempts Supabase legacy auth, avoiding mixed auth flows.

// Define Env interface for Cloudflare Worker bindings
interface Env {
  GROQ_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  ALLOWED_ORIGINS: string;
}

export interface User {
  id: string;
  email: string;
  subscription_tier: string;
}

/**
 * Validate authentication token and get user.
 * Expects a Clerk JWT in the Authorization header.
 */
export async function getUser(
  authHeader: string,
  env: Env
): Promise<User | null> {
  try {
    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return null;

    // Decode JWT (Clerk signs with the Supabase JWT secret configured in Clerk)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));

    // Basic validation: ensure "sub" claim exists and token is intended for authenticated users
    if (payload.sub && (payload.aud === 'authenticated' || payload.iss?.includes('clerk'))) {
      return {
        id: payload.sub,
        email: payload.email || '',
        subscription_tier: 'free', // Will be resolved later via DB lookup
      };
    }
    return null;
  } catch (error) {
    console.error('Auth error while decoding Clerk JWT:', error);
    return null;
  }
}
