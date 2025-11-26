import Link from 'next/link'
import { LayoutDashboard, FolderOpen } from 'lucide-react'

export default function DashboardNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <p className="text-6xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-white mb-3">
          Dashboard page not found
        </h1>
        <p className="text-slate-400 mb-8">
          The dashboard page you are looking for does not exist or you may not have access to it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
          >
            <LayoutDashboard className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
            View My Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
