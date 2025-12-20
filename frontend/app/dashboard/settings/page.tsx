'use client'

import { useUser } from '@/lib/providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Settings, User, Bell, Trash2, ArrowLeft, Zap, LogOut, Mail } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, loading, subscription } = useUser()
  const router = useRouter()
  const { signOut } = useClerk()

  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddress || ''
  const fullName = user?.fullName || (user?.firstName ? `${user?.firstName} ${user.lastName || ''}`.trim() : '')

  const planName = subscription?.plan === 'premium' || subscription?.plan === 'team'
    ? 'Premium Plan'
    : subscription?.plan === 'pro'
      ? 'Pro Plan'
      : 'Free Plan'

  const planEnergy = subscription?.plan === 'premium' || subscription?.plan === 'team'
    ? 'Unlimited energy'
    : subscription?.plan === 'pro'
      ? '300 energy per day'
      : '30 energy per day'

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/auth/login')
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not available yet. Please contact support.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-subit-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-subit-50 border-b border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-600 hover:text-subit-700 transition-colors border border-neutral-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
                <p className="text-neutral-600 text-sm">Manage your account preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
              <User className="w-5 h-5 text-subit-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Profile</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl">
                  <Mail className="w-5 h-5 text-subit-600" />
                  <span className="text-neutral-700">{userEmail || 'Not set'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  defaultValue={fullName}
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-subit-500 focus:border-subit-500 transition-all"
                />
              </div>
              <button className="px-5 py-2.5 bg-subit-600 hover:bg-subit-700 text-white rounded-xl font-medium transition-all shadow-glow">
                Update Profile
              </button>
            </div>
          </div>

          {/* Plan Section */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-neutral-900">Current Plan</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-900 font-semibold">{planName}</p>
                  <p className="text-neutral-600 text-sm">{planEnergy}</p>
                </div>
                {(subscription?.plan === 'free' || !subscription) && (
                  <Link
                    href="/pricing"
                    className="px-5 py-2.5 bg-white border border-neutral-200 hover:shadow-card text-subit-700 rounded-xl font-medium transition-all"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
              <Bell className="w-5 h-5 text-subit-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Preferences</h2>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-700">Email Notifications</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-subit-600"></div>
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-700">Marketing emails</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-subit-600"></div>
                </div>
              </label>
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-6">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white text-subit-700 border border-neutral-200 hover:shadow-card rounded-xl font-medium transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
            </div>
            <div className="p-6">
              <p className="text-neutral-600 text-sm mb-4">
                Permanently delete your account and all data. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
