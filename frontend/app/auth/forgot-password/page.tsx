'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/login`,
      })

      if (error) {
        toast.error(error.message || 'Failed to send reset email')
        return
      }

      toast.success('Password reset email sent. Check your inbox.')
      router.push('/auth/login')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Forgot password</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Enter the email associated with your account and well send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-subit-600 focus:border-transparent"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-subit-600 text-white font-medium hover:bg-subit-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 text-center">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-subit-600 hover:text-subit-700 font-medium">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
