'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/lib/providers'
import { useRouter } from 'next/navigation'
import { Plus, Video, Clock, CheckCircle, AlertCircle, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { AnimatedContainer, AnimatedCard, scaleIn, fadeInUp } from '@/components/ui/animations'
import { OnboardingModal } from '@/components/onboarding-modal'

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
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

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
  }, [user])

  useEffect(() => {
    // Show onboarding for new users (first time visiting dashboard)
    if (user && !projectsLoading && projects.length === 0) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      }
    }
  }, [user, projectsLoading, projects.length])

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

  // Show loading only if user auth is still loading, not if projects are loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 dark:from-neutral-900 dark:to-neutral-950 to-white dark:to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-subit-500/20 border-t-subit-500 rounded-full animate-spin mx-auto mb-6" />
            <Sparkles className="w-8 h-8 text-subit-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: Video,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Completed',
      value: projects.filter(p => p.status === 'completed').length,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      label: 'Processing',
      value: projects.filter(p => p.status === 'processing').length,
      icon: Clock,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Energy Remaining',
      value: 30,
      icon: Zap,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-subit-600 via-subit-500 to-subit-400 border-b border-subit-300/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-subit-50 text-lg">Manage your video projects and subtitles</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Energy indicator with glow */}
              <div className="flex items-center space-x-2 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-white text-lg">30</span>
                <span className="text-subit-100 text-sm">energy</span>
              </div>
              <Link href="/dashboard/upload-v2">
                <button className="group flex items-center space-x-2 px-6 py-3 bg-white text-subit-600 rounded-xl font-semibold hover:bg-subit-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-white/20">
                  <Plus className="w-5 h-5" />
                  <span>New Project</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards with animations */}
        <AnimatedContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <AnimatedCard
              key={stat.label}
              delay={index * 0.1}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-glass border border-neutral-200/50 hover:border-subit-200 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </AnimatedContainer>

        {/* Projects List */}
        <AnimatedCard
          delay={0.4}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass border border-neutral-200/50 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-transparent">
            <h2 className="text-xl font-bold text-neutral-900">Recent Projects</h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-16 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-subit-500 to-subit-600 rounded-3xl rotate-12 opacity-20 blur-xl" />
                <Video className="relative w-24 h-24 text-subit-500 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">No projects yet</h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                Get started by uploading your first video and let AI generate professional subtitles automatically
              </p>
              <Link href="/dashboard/upload">
                <button className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-subit-500 to-subit-600 text-white rounded-xl font-semibold hover:shadow-glow-lg transition-all duration-200 transform hover:-translate-y-0.5">
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Project</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {projects.map((project, index) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <div className="group p-6 hover:bg-gradient-to-r hover:from-subit-50/50 hover:to-transparent transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          {getStatusIcon(project.status)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-subit-600 transition-colors">
                            {project.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600 mt-1">
                            <span>Created {formatDate(project.created_at)}</span>
                            {project.video_duration && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {Math.round(project.video_duration / 60)}m
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                          project.status === 'completed' 
                            ? 'bg-green-100 text-green-700 group-hover:bg-green-200' 
                            : project.status === 'processing' 
                            ? 'bg-blue-100 text-blue-700 group-hover:bg-blue-200' 
                            : project.status === 'failed' 
                            ? 'bg-red-100 text-red-700 group-hover:bg-red-200'
                            : 'bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200'
                        }`}>
                          {getStatusText(project.status)}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="w-5 h-5 text-subit-600 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AnimatedCard>
      </div>

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
