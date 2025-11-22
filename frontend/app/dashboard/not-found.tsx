import Link from 'next/link'

export default function DashboardNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <p className="text-sm font-semibold text-subit-600 mb-2">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
          Dashboard page not found
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          The dashboard page you are looking for does not exist or you may not have access to it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-subit-600 text-white font-medium shadow-sm hover:bg-subit-700 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            View My Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
