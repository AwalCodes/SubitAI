'use client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout is now handled within each dashboard page for more flexibility
  return <>{children}</>
}
