import Link from 'next/link'
import { Home, FileText, CreditCard, Settings } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-neutral-50 p-4">
        <nav>
          <ul className="space-y-1">
            <li>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-700 hover:bg-subit-50 hover:text-subit-600"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/projects" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-700 hover:bg-subit-50 hover:text-subit-600"
              >
                <FileText className="w-4 h-4" />
                My Projects
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/billing" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-700 hover:bg-subit-50 hover:text-subit-600"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-700 hover:bg-subit-50 hover:text-subit-600"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6 bg-white">
        {children}
      </main>
    </div>
  )
}
