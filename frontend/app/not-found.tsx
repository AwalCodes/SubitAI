import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-subit-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-sm font-semibold text-subit-600 mb-2">404</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
          Page not found
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-subit-600 text-white font-medium shadow-sm hover:bg-subit-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
