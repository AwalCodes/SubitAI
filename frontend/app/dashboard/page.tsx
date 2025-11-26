'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useUser } from '@/lib/providers'
import { useRouter } from 'next/navigation'
import { Plus, Video, Clock, CheckCircle, AlertCircle, Zap, ArrowRight, Sparkles, LayoutDashboard, Settings, LogOut, Home, FolderOpen, TrendingUp, Trash2, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { OnboardingModal } from '@/components/onboarding-modal'
import { fetchQuota, type QuotaInfo } from '@/lib/api-v2'
import toast from 'react-hot-toast'

interface Project {
  id: string
  title: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  created_at: string
  video_duration?: number
}

export default function Dashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      router.push('/auth/login')
    }
  }
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [quotaLoading, setQuotaLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      setInitialLoad(false)
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true)
        const supabase = createClient()
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id, title, status, created_at, video_duration')
          .eq('user_id', user?.id)
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
    }
    
    fetchProjects()
  }, [fetchProjects])

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

  const remainingEnergy = !quotaLoading && quota && quota.remaining !== null
    ? quota.remaining
    : 0

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setProjectsLoading(true)
      const supabase = createClient()
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
  }, [user?.id])

  const stats = useMemo(() => [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: Video,
      gradient: 'from-blue-500 to-blue-600'
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
      gradient: 'from-violet-500 to-fuchsia-600'
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-6" />
            <Sparkles className="w-6 h-6 text-violet-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-slate-400 text-lg font-medium">Loading your dashboard...</p>
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
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900/50 border-r border-slate-800">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              SUBIT<span className="text-violet-400">.AI</span>
            </span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                link.active
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-slate-500">Free Plan</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SUBIT<span className="text-violet-400">.AI</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link 
              href="/pricing"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg hover:bg-violet-500/20 transition-colors group"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">{remainingEnergy}</span>
              <Crown className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600/20 via-fuchsia-600/10 to-transparent border-b border-slate-800">
          <div className="px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Welcome back! 👋
                </h1>
                <p className="text-slate-400">Manage your video projects and subtitles</p>
              </div>
              <Link href="/dashboard/upload-v2">
                <button className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5">
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
                className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-300 relative"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  {stat.label === 'Energy' && (
                    <Link 
                      href="/pricing"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors group/upgrade"
                      title="Upgrade plan"
                    >
                      <Crown className="w-4 h-4 text-amber-400 group-hover/upgrade:scale-110 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Projects List */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
              </div>
              <span className="text-sm text-slate-500">{projects.length} projects</span>
            </div>

            {projects.length === 0 ? (
              <div className="p-12 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl rotate-6 opacity-20 blur-xl" />
                  <div className="relative w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center">
                    <Video className="w-10 h-10 text-slate-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm">
                  Upload your first video and let AI generate professional subtitles automatically
                </p>
                <Link href="/dashboard/upload-v2">
                  <button className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-200">
                    <Plus className="w-5 h-5" />
                    <span>Create First Project</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {projects.map((project) => (
                  <div key={project.id} className="group relative">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <div className="p-5 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              {getStatusIcon(project.status)}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-white group-hover:text-violet-400 transition-colors">
                                {project.title}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
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
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                              project.status === 'completed' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : project.status === 'processing' 
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                : project.status === 'failed' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {getStatusText(project.status)}
                            </span>
                            <button
                              onClick={(e) => handleDeleteProject(e, project.id)}
                              className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100"
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
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
