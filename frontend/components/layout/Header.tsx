 'use client'

import { useState, useEffect } from 'react'
 import Link from 'next/link'
 import { usePathname, useRouter } from 'next/navigation'
 import { useUser } from '@/lib/providers'
 import { createClient } from '@/lib/supabase'
import { Menu, X, LayoutDashboard, LogOut, User, ChevronDown } from 'lucide-react'
import Logo from '@/components/shared/Logo'

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
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, loading, subscription } = useUser()
  const supabase = createClient()

  const planName = subscription?.plan === 'premium' || subscription?.plan === 'team' 
    ? 'Premium Plan' 
    : subscription?.plan === 'pro' 
    ? 'Pro Plan' 
    : 'Free Plan'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Sign out error:', error)
      router.push('/auth/login')
    }
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Blue-white theme: always light header
  const isDarkPage = false

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 backdrop-blur-xl border-b border-neutral-200 shadow-sm'
        : 'bg-white/80 backdrop-blur-xl'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Logo withText href="/" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-subit-600 bg-subit-50'
                    : 'text-neutral-600 hover:text-subit-600 hover:bg-neutral-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-subit-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-white rounded-xl shadow-xl border border-neutral-200 z-20">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900 truncate">{user.email}</p>
                        <p className="text-xs text-neutral-500">{planName}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Settings
                      </Link>
                      <div className="border-t border-neutral-100 mt-2 pt-2">
                  <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            handleSignOut()
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                      </div>
                    </div>
                </>
                )}
              </div>
              ) : (
                <>
                <Link 
                  href="/auth/login" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    'text-neutral-600 hover:text-subit-600'
                  }`}
                >
                    Log in
                  </Link>
                <Link 
                  href="/auth/signup" 
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-subit-600 hover:bg-subit-700 text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get Started
                  </Link>
                </>
              )}
            </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              'text-neutral-600 hover:bg-neutral-100'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-6 pt-2">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-subit-600 bg-subit-50'
                      : 'text-neutral-700 hover:text-subit-600 hover:bg-neutral-100'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2">
              {loading ? (
                <div className="h-12 bg-neutral-100 rounded-xl animate-pulse" />
              ) : user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-base font-semibold bg-subit-600 text-white"
                    >
                    <LayoutDashboard className="w-5 h-5" />
                    Go to Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignOut()
                      }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-base font-medium text-red-600 bg-red-50"
                    >
                    <LogOut className="w-5 h-5" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 rounded-xl text-center text-base font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 rounded-xl text-center text-base font-semibold bg-subit-600 text-white"
                    >
                    Get Started Free
                    </Link>
                  </>
                )}
              </div>
          </div>
        )}
      </div>
    </header>
  )
}
