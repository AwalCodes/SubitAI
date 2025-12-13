'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react'
import { logClientError } from '@/lib/logging'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error boundary caught:', error)
    logClientError(error, {
      source: 'dashboard-error-boundary',
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
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
            An error occurred while loading the dashboard. You can try again or return to a safe page.
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
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-neutral-200 text-subit-700 font-semibold hover:shadow-card transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
