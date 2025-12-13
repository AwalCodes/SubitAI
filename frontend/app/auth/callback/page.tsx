'use client'

import { useEffect, Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Zap, CheckCircle, Sparkles } from 'lucide-react'

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic'

function AuthCallbackContent() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Completing sign in...')

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    
    const handleAuthCallback = async () => {
      try {
        setMessage('Verifying authentication...')
        
        // Supabase OAuth returns the session in the URL hash
        // The session is automatically handled by Supabase client
        // We just need to check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Authentication failed')
          setTimeout(() => {
            router.push('/auth/login?error=auth_failed')
          }, 2000)
          return
        }

        if (session?.user) {
          // User is authenticated
          setStatus('success')
          setMessage('Sign in successful! Redirecting...')
          
          // Small delay to show success state
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        } else {
          // Wait a bit for the session to be processed from URL hash
          setMessage('Processing authentication...')
          timeoutId = setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession?.user) {
              setStatus('success')
              setMessage('Sign in successful! Redirecting...')
              setTimeout(() => {
                router.push('/dashboard')
              }, 1000)
            } else {
              setStatus('error')
              setMessage('No session found')
              setTimeout(() => {
                router.push('/auth/login?error=no_session')
              }, 2000)
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        setStatus('error')
        setMessage('An error occurred')
        setTimeout(() => {
          router.push('/auth/login?error=callback_failed')
        }, 2000)
      }
    }

    handleAuthCallback()
    
    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-subit-200/40 via-white to-subit-200/40" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a0a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-subit-200/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-subit-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-xl bg-subit-600 flex items-center justify-center shadow-glow">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-neutral-900">
            SUBITAI
          </span>
        </div>

        {/* Status indicator */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-subit-500/20 border-t-subit-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-subit-600 animate-pulse" />
              </div>
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
              <span className="text-3xl text-red-400">✕</span>
            </div>
          )}
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          {status === 'loading' && 'Completing Sign In'}
          {status === 'success' && 'Welcome Back!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        <p className="text-neutral-600 text-lg">{message}</p>

        {/* Loading dots animation */}
        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-subit-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-subit-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-subit-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-subit-500/20 border-t-subit-500 rounded-full animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
