 'use client'

 import { useState } from 'react'
 import Link from 'next/link'
 import { usePathname, useRouter } from 'next/navigation'
 import Logo from '@/components/shared/Logo'
 import { useUser } from '@/lib/providers'
 import { createClient } from '@/lib/supabase'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, loading } = useUser()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      router.push('/auth/login')
    }
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="header-container">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          {!loading && (
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="nav-link text-red-500 hover:text-red-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="nav-link">
                    Log in
                  </Link>
                  <Link href="/auth/signup" className="btn-primary">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile toggle placeholder */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-subit-600 hover:bg-neutral-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4">
            <nav className="space-y-2 pt-2 pb-3 border-t border-neutral-100">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-2 py-2 rounded-lg nav-link ${
                    isActive(link.href) ? 'active' : ''
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {!loading && (
              <div className="mt-2 flex flex-col space-y-2 border-t border-neutral-100 pt-3">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="w-full text-center btn-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignOut()
                      }}
                      className="w-full text-center nav-link px-2 py-2 rounded-lg bg-white text-red-500 hover:text-red-600"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="w-full text-center nav-link px-2 py-2 rounded-lg bg-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="w-full text-center btn-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}