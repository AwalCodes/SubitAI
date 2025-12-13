import Link from 'next/link'
import { LayoutDashboard, FolderOpen } from 'lucide-react'

export default function DashboardNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <p className="text-6xl font-bold bg-gradient-to-r from-subit-500 to-subit-700 bg-clip-text text-transparent mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">
          Dashboard page not found
        </h1>
        <p className="text-neutral-600 mb-8">
          The dashboard page you are looking for does not exist or you may not have access to it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-subit-600 hover:bg-subit-700 text-white font-semibold transition-all shadow-glow"
          >
            <LayoutDashboard className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-neutral-200 text-subit-700 font-semibold hover:shadow-card transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
            View My Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
