'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/shared/Logo'
import { Plus, LayoutDashboard, Settings, Home, ChevronLeft } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isRoot = pathname === '/dashboard'

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
            </div>
            <div className="flex items-center gap-2" />
          </div>
        </div>
      </div>
      <div className="pt-16">{children}</div>
    </div>
  )
}
