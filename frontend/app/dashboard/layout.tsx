'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/shared/Logo'
import { Plus, LayoutDashboard, Settings, Home, ChevronLeft } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isRoot = pathname === '/dashboard'
  const trail = pathname.replace(/^\/dashboard\/?/, '')
  const segments = trail ? trail.split('/').filter(Boolean) : []
  const crumbs = segments.map((seg, i) => {
    const href = `/dashboard/${segments.slice(0, i + 1).join('/')}`
    const label = seg.replace(/\[|\]/g, '')
    return { href, label }
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isRoot && (
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-neutral-200 text-subit-700 hover:shadow-card">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Link>
              )}
              <Logo withText href="/" />
              {!isRoot && crumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="ml-2 hidden sm:block">
                  <ol className="flex items-center text-sm text-neutral-600">
                    <li>
                      <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
                    </li>
                    {crumbs.map((c, i) => (
                      <li key={c.href} className="flex items-center">
                        <span className="mx-2 text-neutral-300">/</span>
                        <Link href={c.href} className="hover:text-neutral-900">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:shadow-card"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/upload-v2"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-subit-600 hover:bg-subit-700 text-white"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:shadow-card"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:shadow-card"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-16">{children}</div>
    </div>
  )
}
