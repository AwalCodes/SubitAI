import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    // Server-side: throw error
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
  } else {
    // Client-side: log error but don't crash
    console.error('Missing Supabase environment variables')
  }
}

// Create a default client for public requests
const supabaseClient = createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    persistSession: false, // Clerk will handle session persistence
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

/**
 * Client-side Supabase client accessor.
 * If a Clerk token is provided, it creates an authenticated client.
 */
export const createClient = (clerkToken?: string) => {
  if (!clerkToken) return supabaseClient

  return createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      persistSession: false,
    }
  })
}

// Supabase configuration
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
}

/**
 * Centrally manages the site URL for redirects and consistency.
 * Forces the official domain in production even if accessed via legacy URLs.
 */
export const getSiteUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://www.subitai.com'
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  const normalizedEnvUrl = typeof envUrl === 'string' ? envUrl.replace(/\/$/, '') : ''
  if (normalizedEnvUrl && !normalizedEnvUrl.includes('subit-ai.vercel.app')) return normalizedEnvUrl

  // Fallback for client-side
  if (typeof window !== 'undefined') {
    // If we're on the legacy domain, force the new one even in client-side fallback
    if (window.location.hostname === 'subit-ai.vercel.app') {
      return 'https://www.subitai.com'
    }
    return window.location.origin
  }

  return ''
}