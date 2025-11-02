import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a client with localStorage for persistence
const supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Client-side Supabase client accessor
export const createClient = () => supabaseClient

// Supabase configuration
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
}