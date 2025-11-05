'use client'

import Link from 'next/link'
import { Home, FileText, CreditCard, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-xl font-bold text-subit-600 dark:text-subit-400">
            SUBIT.AI
          </Link>
          <ThemeToggle />
        </div>
        <nav>
          <ul className="space-y-1">
            <li>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-subit-50 dark:hover:bg-subit-900/20 hover:text-subit-600 dark:hover:text-subit-400 transition-colors"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/projects" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-subit-50 dark:hover:bg-subit-900/20 hover:text-subit-600 dark:hover:text-subit-400 transition-colors"
              >
                <FileText className="w-4 h-4" />
                My Projects
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/billing" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-subit-50 dark:hover:bg-subit-900/20 hover:text-subit-600 dark:hover:text-subit-400 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-subit-50 dark:hover:bg-subit-900/20 hover:text-subit-600 dark:hover:text-subit-400 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6 bg-white dark:bg-neutral-950 transition-colors duration-300">
        {children}
      </main>
    </div>
  )
}
