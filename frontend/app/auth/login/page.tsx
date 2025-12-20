'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import Logo from '@/components/shared/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const getSiteUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL
    const normalizedEnvUrl = typeof envUrl === 'string' ? envUrl.replace(/\/$/, '') : ''
    if (normalizedEnvUrl) return normalizedEnvUrl
    if (process.env.NODE_ENV === 'production') return 'https://www.subitai.com'
    return window.location.origin
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        toast.success('Welcome back! 🎉')
        router.push('/dashboard')
      } else {
        toast.error('Login failed - no user data returned')
        setLoading(false)
      }
    } catch (error) {
      toast.error('An error occurred during login')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${getSiteUrl()}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) {
        toast.error(error.message || 'Failed to initiate Google login')
      }
      // Note: User will be redirected to Google, then back to callback
    } catch (error: any) {
      console.error('Google login error:', error)
      toast.error(error?.message || 'An error occurred during Google login')
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-subit-200/40 via-white to-subit-200/40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a0a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-subit-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-subit-200/40 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <Logo withText href="/" className="mb-12" />
          
          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Generate subtitles<br />
            <span className="bg-gradient-to-r from-subit-500 to-subit-700 bg-clip-text text-transparent">
              10x faster
            </span>
          </h1>
          
          <p className="text-neutral-600 text-lg mb-8 max-w-md">
            AI-powered subtitle generation with 95%+ accuracy. Perfect for content creators worldwide.
          </p>

          <div className="flex items-center gap-6">
            {[
              { value: '10K+', label: 'Creators' },
              { value: '95%', label: 'Accuracy' },
              { value: '50+', label: 'Languages' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-neutral-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Logo withText href="/" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back</h2>
            <p className="text-neutral-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-subit-600 hover:text-subit-700 font-medium transition-colors">
                Sign up free
              </Link>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-8">
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-subit-600" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-subit-500 focus:border-subit-500 transition-all text-neutral-900 placeholder-neutral-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-subit-600 hover:text-subit-700 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-subit-600" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-subit-500 focus:border-subit-500 transition-all text-neutral-900 placeholder-neutral-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 bg-subit-600 hover:bg-subit-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-neutral-500 text-sm">or</span>
                </div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3.5 bg-white hover:shadow-card text-subit-700 border border-neutral-200 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          <p className="text-center text-neutral-500 text-sm mt-6">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-neutral-600 hover:text-neutral-900 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-neutral-600 hover:text-neutral-900 transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
