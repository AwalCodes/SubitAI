'use client'

import { useUser } from '@/lib/providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Settings, User, Bell, Trash2, ArrowLeft, Zap, LogOut, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, loading, subscription } = useUser()
  const router = useRouter()
  const supabase = createClient()

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
      await supabase.auth.signOut()
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600/20 via-fuchsia-600/10 to-transparent border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 text-sm">Manage your account preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
              <User className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Profile</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-400">{user?.email || 'Not set'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input 
                  type="text"
                  placeholder="Your name" 
                  defaultValue={user?.user_metadata?.name || user?.user_metadata?.full_name || ''} 
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
              </div>
              <button className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/25">
                Update Profile
              </button>
            </div>
          </div>

          {/* Plan Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Current Plan</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{planName}</p>
                  <p className="text-slate-400 text-sm">{planEnergy}</p>
                </div>
                {(subscription?.plan === 'free' || !subscription) && (
                  <Link
                    href="/pricing"
                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
              <Bell className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Preferences</h2>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Email Notifications</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Marketing emails</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </div>
              </label>
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-6">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
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
              <p className="text-slate-400 text-sm mb-4">
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
