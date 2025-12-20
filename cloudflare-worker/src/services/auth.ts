/**
 * Authentication service using Supabase
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

interface User {
  id: string;
  email: string;
  subscription_tier?: string;
}

interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    subscription_tier?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Validate authentication token and get user
 */
export async function getUser(
  authHeader: string,
  env: Env
): Promise<User | null> {
  try {
    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return null;
    }

    // 1. Try legacy Supabase Auth (if user is still using Supabase Auth)
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': env.SUPABASE_SERVICE_KEY,
      },
    });

    if (response.ok) {
      let data: SupabaseAuthUser | null = null;
      try {
        data = (await response.json()) as SupabaseAuthUser;
        if (data && data.id) {
          return {
            id: data.id,
            email: data.email || '',
            subscription_tier: data.user_metadata?.subscription_tier || 'free',
          };
        }
      } catch (error) {
        console.error('Failed to parse legacy auth response:', error);
      }
    }

    // 2. Try Clerk/Custom JWT Path
    // Since Clerk users aren't in Supabase Auth, we decode the JWT locally.
    // The JWT is signed with the Supabase JWT Secret (configured in Clerk).
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));

      // Basic validation of payload
      if (payload.sub && (payload.aud === 'authenticated' || payload.iss?.includes('clerk'))) {
        return {
          id: payload.sub,
          email: payload.email || '',
          subscription_tier: 'free', // Will be fetched from DB later
        };
      }
    } catch (error) {
      console.error('Failed to decode Clerk/JWT token:', error);
    }

    return null;

  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Validate JWT token
 */
export async function validateAuth(
  authHeader: string | undefined,
  env: Env
): Promise<boolean> {
  if (!authHeader) {
    return false;
  }

  const user = await getUser(authHeader, env);
  return user !== null;
}

/**
 * Check if user has required subscription tier
 */
export function checkSubscriptionTier(
  user: User,
  requiredTier: 'free' | 'pro' | 'team'
): boolean {
  const tiers = ['free', 'pro', 'team'];
  const userTierIndex = tiers.indexOf(user.subscription_tier || 'free');
  const requiredTierIndex = tiers.indexOf(requiredTier);

  return userTierIndex >= requiredTierIndex;
}
