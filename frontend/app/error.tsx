'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home, Zap } from 'lucide-react'
import { logClientError } from '@/lib/logging'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error boundary caught:', error)
    logClientError(error, {
      source: 'app-error-boundary',
      digest: error.digest,
    })
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-subit-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-subit-600 flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-900">
            SUBITAI
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-neutral-600 mb-6">
            An unexpected error occurred. You can try again, or return to a safe page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-subit-600 hover:bg-subit-700 text-white font-semibold transition-all shadow-glow"
            >
              <RefreshCw className="w-5 h-5" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-neutral-200 text-subit-700 font-semibold hover:shadow-card transition-colors"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>
        </div>
        
        <p className="mt-4 text-xs text-neutral-500">
          If the problem persists, please refresh the page or contact support.
        </p>
      </div>
    </main>
  )
}
