'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Zap } from 'lucide-react'

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic'

function AuthCallbackContent() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase OAuth returns the session in the URL hash
        // The session is automatically handled by Supabase client
        // We just need to check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=auth_failed')
          return
        }

        if (session?.user) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard')
        } else {
          // Wait a bit for the session to be processed from URL hash
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession?.user) {
              router.push('/dashboard')
            } else {
              router.push('/auth/login?error=no_session')
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/auth/login?error=callback_failed')
      }
    }

    handleAuthCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            SUBIT<span className="text-violet-400">.AI</span>
          </span>
        </div>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
        </div>
        <p className="text-slate-400 text-lg">Completing sign in...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

