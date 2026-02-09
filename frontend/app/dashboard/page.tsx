'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useUser } from '@/lib/providers'
import { useRouter } from 'next/navigation'
import { useClerk } from '@/lib/clerk-safe'
import { Plus, Video, Clock, CheckCircle, AlertCircle, Zap, ArrowRight, Sparkles, LayoutDashboard, Settings, LogOut, Home, FolderOpen, TrendingUp, Trash2, Crown, User } from 'lucide-react'
import { OnboardingModal } from '@/components/onboarding-modal'
import { fetchQuota, type QuotaInfo } from '@/lib/api-v2'
import toast from 'react-hot-toast'
import Logo from '@/components/shared/Logo'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  created_at: string
  video_duration?: number
}

export default function Dashboard() {
  const { user, loading, subscription, supabase } = useUser()
  const router = useRouter()
  const { signOut } = useClerk()
  const [projects, setProjects] = useState<Project[]>([])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/auth/login')
    }
  }
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [quotaLoading, setQuotaLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isPremium = subscription?.plan === 'premium' || subscription?.plan === 'team'
  const remainingEnergy = isPremium
    ? '∞'
    : (!quotaLoading && quota && quota.remaining !== null ? quota.remaining : 0)

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return

    try {
      setProjectsLoading(true)
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, title, status, created_at, video_duration')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setProjects(projects || [])
    } catch (error: any) {
      console.error('Failed to fetch projects:', error)
      // Don't block the UI if projects fail to load
      setProjects([])
    } finally {
      setProjectsLoading(false)
      setInitialLoad(false)
    }
  }, [supabase, user?.id])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      setInitialLoad(false)
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetchProjects()
  }, [user, supabase, fetchProjects])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const loadQuota = async () => {
      try {
        setQuotaLoading(true)
        const data = await fetchQuota()
        if (!cancelled) {
          setQuota(data)
        }
      } catch (error) {
        console.error('Failed to fetch quota:', error)
        if (!cancelled) {
          setQuota(null)
        }
      } finally {
        if (!cancelled) {
          setQuotaLoading(false)
        }
      }
    }

    loadQuota()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    // Show onboarding for new users (first time visiting dashboard)
    if (user && !projectsLoading && projects.length === 0) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      }
    }
  }, [user, projectsLoading, projects.length])

  const stats = useMemo(() => [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: Video,
      gradient: 'from-subit-500 to-subit-600'
    },
    {
      label: 'Completed',
      value: projects.filter(p => p.status === 'completed').length,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      label: 'Processing',
      value: projects.filter(p => p.status === 'processing').length,
      icon: Clock,
      gradient: 'from-amber-500 to-amber-600'
    },
    {
      label: 'Energy',
      value: remainingEnergy,
      icon: Zap,
      gradient: 'from-subit-500 to-subit-600'
    }
  ], [projects, remainingEnergy])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'processing':
        return 'Processing'
      case 'failed':
        return 'Failed'
      case 'uploading':
        return 'Uploading'
      default:
        return 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user?.id)

      if (error) throw error

      toast.success('Project deleted successfully')
      // Refresh projects list
      await fetchProjects()
    } catch (error: any) {
      console.error('Failed to delete project:', error)
      toast.error(error?.message || 'Failed to delete project')
    }
  }

  // Show loading only if user auth is still loading, not if projects are loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-subit-500/20 border-t-subit-500 rounded-full animate-spin mx-auto mb-6" />
            <Sparkles className="w-6 h-6 text-subit-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-neutral-600 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const sidebarLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
    { href: '/dashboard/upload-v2', icon: Plus, label: 'New Project', active: false },
    { href: '/', icon: Home, label: 'Home', active: false },
  ]

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-neutral-50 border-r border-neutral-200">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200">
          <Logo withText href="/" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${link.active
                ? 'bg-subit-50 text-subit-700 border border-subit-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-neutral-200">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 mb-3 rounded-xl hover:bg-neutral-100 transition-all duration-200 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-subit-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-subit-700 transition-colors">{user?.email}</p>
              <p className="text-xs text-neutral-500">
                {subscription?.plan === 'premium' ? 'Premium Plan' :
                  subscription?.plan === 'pro' ? 'Pro Plan' :
                    'Free Plan'}
              </p>
            </div>
            <Settings className="w-4 h-4 text-neutral-500 group-hover:text-subit-700 transition-colors opacity-0 group-hover:opacity-100" />
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo withText href="/" />
          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-subit-50 border border-subit-200 rounded-lg hover:bg-subit-100 transition-colors group"
            >
              <Zap className="w-4 h-4 text-subit-600" />
              <span className="text-sm font-semibold text-neutral-900">{remainingEnergy}</span>
              <Crown className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/dashboard/settings"
              className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              title="Settings"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-subit-100 via-subit-50 to-transparent border-b border-neutral-200">
          <div className="px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">
                  Welcome back! 👋
                </h1>
                <p className="text-neutral-600">Manage your video projects and subtitles</p>
              </div>
              <Link href="/dashboard/upload-v2">
                <button className="group flex items-center gap-2 px-6 py-3 bg-subit-600 hover:bg-subit-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-glow hover:-translate-y-0.5">
                  <Plus className="w-5 h-5" />
                  <span>New Project</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="group bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-card transition-all duration-300 relative"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-neutral-600">{stat.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                  {stat.label === 'Energy' && (
                    <Link
                      href="/pricing"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 p-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors group/upgrade"
                      title="Upgrade plan"
                    >
                      <Crown className="w-4 h-4 text-amber-500 group-hover/upgrade:scale-110 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Projects List */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-subit-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Recent Projects</h2>
              </div>
              <span className="text-sm text-neutral-500">{projects.length} projects</span>
            </div>

            {projects.length === 0 ? (
              <div className="p-12 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-subit-500 rounded-2xl rotate-6 opacity-10 blur-xl" />
                  <div className="relative w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center">
                    <Video className="w-10 h-10 text-neutral-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">No projects yet</h3>
                <p className="text-neutral-600 mb-6 max-w-sm mx-auto text-sm">
                  Upload your first video and let AI generate professional subtitles automatically
                </p>
                <Link href="/dashboard/upload-v2">
                  <button className="group inline-flex items-center gap-2 px-6 py-3 bg-subit-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all duration-200">
                    <Plus className="w-5 h-5" />
                    <span>Create First Project</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {projects.map((project) => (
                  <div key={project.id} className="group relative">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <div className="p-5 hover:bg-neutral-50 transition-all duration-200 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              {getStatusIcon(project.status)}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-neutral-900 group-hover:text-subit-700 transition-colors">
                                {project.title}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-neutral-500 mt-0.5">
                                <span>{formatDate(project.created_at)}</span>
                                {project.video_duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.round(project.video_duration / 60)}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${project.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : project.status === 'processing'
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : project.status === 'failed'
                                  ? 'bg-red-50 text-red-600 border border-red-200'
                                  : 'bg-neutral-100 text-neutral-500'
                              }`}>
                              {getStatusText(project.status)}
                            </span>
                            <button
                              onClick={(e) => handleDeleteProject(e, project.id)}
                              className="p-2 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all opacity-0 group-hover:opacity-100"
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-subit-700 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false)
          localStorage.setItem('hasSeenOnboarding', 'true')
        }}
      />
    </div>
  )
}
