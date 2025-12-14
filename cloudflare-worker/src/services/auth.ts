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

    // Verify token with Supabase
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': env.SUPABASE_SERVICE_KEY,
      },
    });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('Supabase auth failed:', response.status, errorText);
    return null;
  }

  let data: SupabaseAuthUser | null = null;
  try {
    data = (await response.json()) as SupabaseAuthUser;
  } catch (error) {
    console.error('Failed to parse auth response:', error);
    return null;
  }
  
  if (!data || typeof data !== 'object' || !data.id) {
    console.error('Invalid auth response data');
    return null;
  }
  
  return {
    id: data.id,
    email: data.email || '',
    subscription_tier: data.user_metadata?.subscription_tier || 'free',
  };

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
