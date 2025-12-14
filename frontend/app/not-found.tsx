import Link from 'next/link'
import { Home, LayoutDashboard } from 'lucide-react'
import Logo from '@/components/shared/Logo'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-subit-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-subit-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Logo href="/" />
        </div>

        <p className="text-7xl font-bold bg-gradient-to-r from-subit-500 to-subit-700 bg-clip-text text-transparent mb-4">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
          Page not found
        </h1>
        <p className="text-neutral-600 mb-8">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-subit-600 hover:bg-subit-700 text-white font-semibold transition-all shadow-glow"
          >
            <LayoutDashboard className="w-5 h-5" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-neutral-200 text-subit-700 font-semibold hover:shadow-card transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
