'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-subit-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 px-4">
      <div className="max-w-md w-full text-center bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-800/70 rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          Something went wrong
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          An unexpected error occurred. You can try again, or return to a safe page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-subit-600 text-white font-medium shadow-sm hover:bg-subit-700 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
        <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-500">
          If the problem persists, please refresh the page or contact support.
        </div>
      </div>
    </main>
  )
}
