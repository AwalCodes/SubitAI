'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/lib/providers'
import { useRouter } from 'next/navigation'
import { Plus, Video, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  created_at: string
  video_duration?: number
  export_url?: string
}

export default function Dashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      setInitialLoad(false)
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true)
      const response = await apiClient.projects.getProjects({ limit: 10 })
      setProjects(response.data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      // Set empty projects array to show empty state instead of infinite loading
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

  if (loading || initialLoad) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Manage your video projects and subtitles</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Energy indicator */}
              <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">30</span>
                <span className="text-yellow-700 text-sm">energy</span>
              </div>
              <Link href="/dashboard/upload">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Energy Used</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Get started by uploading your first video</p>
              <Link href="/dashboard/upload">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mx-auto">
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Project</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {projects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(project.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {project.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Created {formatDate(project.created_at)}</span>
                          {project.video_duration && (
                            <span>Duration: {Math.round(project.video_duration / 60)}m</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(project.status)}
                      </span>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}