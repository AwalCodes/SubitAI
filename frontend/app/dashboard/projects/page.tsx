'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@/lib/providers'
import { useRouter } from 'next/navigation'
import { Video, Clock, CheckCircle, AlertCircle, Trash2, ArrowRight, Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { AnimatedCard } from '@/components/ui/animations'
import toast from 'react-hot-toast'

interface Project {
  id: string
  title: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  created_at: string
  video_duration?: number
}

export default function ProjectsPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, userLoading, router])

  const fetchProjects = useCallback(async () => {
    try {
      setProjectsLoading(true)
      const supabase = createClient()
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, title, status, created_at, video_duration')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      setProjects(projects || [])
    } catch (error: any) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
      setProjects([])
    } finally {
      setProjectsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, fetchProjects])

  const handleDelete = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(projectId)
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
      
      if (error) throw error
      toast.success('Project deleted successfully')
      // Remove from list
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error: any) {
      console.error('Failed to delete project:', error)
      toast.error('Failed to delete project')
    } finally {
      setDeletingId(null)
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (userLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-subit-500/20 border-t-subit-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-neutral-400">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100 mb-2">My Projects</h1>
              <p className="text-gray-600 dark:text-neutral-400">Manage all your video projects</p>
            </div>
            <Link href="/dashboard/upload">
              <button className="flex items-center space-x-2 px-6 py-3 bg-subit-600 text-white rounded-lg hover:bg-subit-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span>New Project</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-subit-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <AnimatedCard className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-16 text-center">
            {searchQuery ? (
              <>
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-2">No projects found</h3>
                <p className="text-gray-600 dark:text-neutral-400">Try adjusting your search query</p>
              </>
            ) : (
              <>
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-2">No projects yet</h3>
                <p className="text-gray-600 dark:text-neutral-400 mb-6">Get started by uploading your first video</p>
                <Link href="/dashboard/upload">
                  <button className="inline-flex items-center space-x-2 px-6 py-3 bg-subit-600 text-white rounded-lg hover:bg-subit-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Project</span>
                  </button>
                </Link>
              </>
            )}
          </AnimatedCard>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <AnimatedCard
                key={project.id}
                className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                      <div className="flex items-center space-x-4 cursor-pointer group">
                        <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                          {getStatusIcon(project.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 group-hover:text-subit-600 dark:group-hover:text-subit-400 transition-colors truncate">
                            {project.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-neutral-400 mt-1">
                            <span>Created {formatDate(project.created_at)}</span>
                            {project.video_duration && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(project.video_duration)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            project.status === 'completed' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                              : project.status === 'processing' 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                              : project.status === 'failed' 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                          }`}>
                            {getStatusText(project.status)}
                          </span>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-subit-600 dark:group-hover:text-subit-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(project.id, project.title)
                      }}
                      disabled={deletingId === project.id}
                      className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete project"
                    >
                      {deletingId === project.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



