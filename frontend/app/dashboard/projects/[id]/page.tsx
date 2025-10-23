
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/lib/providers'
import { apiClient } from '@/lib/api'
import {
  Video,
  Download,
  Play,
  Pause,
  Trash2,
  Save,
  Plus,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  Languages,
  Share2
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Subtitle {
  id: number
  start: number
  end: number
  text: string
  words?: Array<{ start: number; end: number; text: string }>
}

interface Project {
  id: string
  title: string
  status: string
  video_url: string
  video_duration: number
  export_url?: string
  created_at: string
  subtitles?: Array<{
    id: string
    srt_data: string
    json_data: {
      segments: Subtitle[]
      language: string
    }
    language: string
  }>
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [project, setProject] = useState<Project | null>(null)
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const [activeWord, setActiveWord] = useState<{ segment: number; word: number } | null>(null)

  useEffect(() => {
    if (user && params.id) {
      fetchProject()
    }
  }, [user, params.id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await apiClient.projects.getProject(params.id as string)
      const projectData = response.data.project
      setProject(projectData)

      // Load subtitles if they exist
      if (projectData.subtitles && projectData.subtitles.length > 0) {
        const subtitleData = projectData.subtitles[0]
        if (subtitleData.json_data?.segments) {
          setSubtitles(subtitleData.json_data.segments)
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch project:', error)
      toast.error('Failed to load project')
      if (error.response?.status === 404) {
        router.push('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSubtitles = async () => {
    console.log('=== Generate Subtitles Clicked ===')
    console.log('Project:', project)
    
    if (!project) {
      console.error('No project found!')
      toast.error('No project loaded')
      return
    }

    try {
      setGenerating(true)
      console.log(`Calling API: /subtitles/generate/${project.id}`)
      const response = await apiClient.subtitles.generateSubtitles(project.id, 'en')
      console.log('API Response:', response)
      toast.success('Subtitle generation started! This may take a few minutes.')
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const response = await apiClient.projects.getProject(project.id)
          const updatedProject = response.data.project
          
          if (updatedProject.status === 'completed' && updatedProject.subtitles?.length > 0) {
            clearInterval(pollInterval)
            setProject(updatedProject)
            const subtitleData = updatedProject.subtitles[0]
            if (subtitleData.json_data?.segments) {
              setSubtitles(subtitleData.json_data.segments)
            }
            setGenerating(false)
            toast.success('Subtitles generated successfully!')
          } else if (updatedProject.status === 'failed') {
            clearInterval(pollInterval)
            setGenerating(false)
            toast.error('Subtitle generation failed')
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, 5000) // Poll every 5 seconds

      // Stop polling after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        setGenerating(false)
      }, 600000)
    } catch (error: any) {
      console.error('=== Generate Subtitles Error ===')
      console.error('Full error:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      console.error('Error message:', error.message)
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate subtitles'
      toast.error(errorMessage)
      setGenerating(false)
    }
  }

  const handleEditSubtitle = (index: number) => {
    setEditingIndex(index)
    setEditText(subtitles[index].text)
  }

  const handleSaveEdit = () => {
    if (editingIndex === null) return
    
    const updatedSubtitles = [...subtitles]
    updatedSubtitles[editingIndex].text = editText
    setSubtitles(updatedSubtitles)
    setEditingIndex(null)
    setEditText('')
  }

  const handleDeleteSubtitle = (index: number) => {
    if (confirm('Are you sure you want to delete this subtitle?')) {
      const updatedSubtitles = subtitles.filter((_, i) => i !== index)
      setSubtitles(updatedSubtitles)
      toast.success('Subtitle deleted')
    }
  }

  const handleSaveAll = async () => {
    if (!project) return

    try {
      setSaving(true)
      const updateData = {
        json_data: {
          segments: subtitles,
          language: project.subtitles?.[0]?.language || 'en'
        }
      }
      
      await apiClient.subtitles.updateSubtitles(project.id, updateData)
      toast.success('Subtitles saved successfully!')
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.response?.data?.detail || 'Failed to save subtitles')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadSRT = async () => {
    if (!project) return

    try {
      const response = await apiClient.subtitles.downloadSubtitles(project.id, 'srt')
      const blob = new Blob([response.data.content], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.data.filename
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('SRT file downloaded!')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Failed to download SRT file')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSegmentWords = (s: Subtitle) => {
    if (s.words && s.words.length > 0) return s.words
    const tokens = s.text.split(/(\s+)/).filter(t => t.length > 0)
    const onlyWords = tokens.filter(t => !/^\s+$/.test(t))
    const total = onlyWords.length || 1
    const dur = Math.max(0.001, s.end - s.start)
    let idx = 0
    const built: Array<{ start: number; end: number; text: string }> = []
    for (const token of tokens) {
      if (/^\s+$/.test(token)) {
        const last = built[built.length - 1]
        if (last) last.text += token
        continue
      }
      const tStart = s.start + (dur * idx) / total
      const tEnd = s.start + (dur * (idx + 1)) / total
      built.push({ start: tStart, end: tEnd, text: token })
      idx += 1
    }
    return built
  }

  const tick = () => {
    const v = videoRef.current
    if (!v) return
    const t = v.currentTime
    let segIdx: number | null = null
    for (let i = 0; i < subtitles.length; i++) {
      const s = subtitles[i]
      if (t >= s.start && t <= s.end) { segIdx = i; break }
    }
    setActiveSegment(segIdx)
    if (segIdx !== null) {
      const words = getSegmentWords(subtitles[segIdx])
      let wIdx: number | null = null
      for (let j = 0; j < words.length; j++) {
        const w = words[j]
        if (t >= w.start && t <= w.end) { wIdx = j; break }
      }
      if (wIdx !== null) setActiveWord({ segment: segIdx, word: wIdx })
      else setActiveWord(null)
    } else {
      setActiveWord(null)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const handlePlay = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }

  const handlePause = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </span>
        )
      case 'processing':
        return (
          <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Clock className="w-4 h-4 mr-1 animate-spin" />
            Processing
          </span>
        )
      case 'failed':
        return (
          <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Failed
          </span>
        )
      default:
        return (
          <span className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Project not found</h2>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </Link>
            {getStatusBadge(project.status)}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600">
                Duration: {formatTime(project.video_duration || 0)} • 
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {subtitles.length > 0 && (
                <>
                  <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSRT}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download SRT</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success banner */}
        {project.status === 'completed' && subtitles.length > 0 && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center">✓</div>
            <div className="text-gray-800 font-medium">Subtitles Generated Successfully!</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Player */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Preview</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {project.video_url ? (
                  <video
                    src={project.video_url}
                    controls
                    className="w-full h-full"
                    ref={videoRef}
                    onPlay={handlePlay}
                    onPause={handlePause}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Video className="w-16 h-16 opacity-50" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subtitles Editor */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Subtitles</h2>
                {subtitles.length === 0 && !generating && (
                  <button
                    onClick={handleGenerateSubtitles}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Languages className="w-4 h-4" />
                    <span>Generate Subtitles</span>
                  </button>
                )}
              </div>

              {generating && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Generating subtitles... This may take a few minutes.</p>
                </div>
              )}

              {subtitles.length > 0 && (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {subtitles.map((subtitle, index) => {
                    const words = getSegmentWords(subtitle)
                    const isActiveSeg = activeSegment === index
                    return (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 transition-colors ${isActiveSeg ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            {formatTime(subtitle.start)} → {formatTime(subtitle.end)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {editingIndex === index ? (
                              <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={() => handleEditSubtitle(index)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleDeleteSubtitle(index)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {editingIndex === index ? (
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                          />
                        ) : (
                          <p className="text-gray-900 leading-7">
                            {words.map((w, wi) => {
                              const on = activeWord && activeWord.segment === index && activeWord.word === wi
                              return (
                                <span key={wi} className={on ? 'bg-yellow-200 rounded px-0.5' : ''}>{w.text}</span>
                              )
                            })}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {subtitles.length === 0 && !generating && (
                <div className="text-center py-12">
                  <Languages className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No subtitles yet</h3>
                  <p className="text-gray-600 mb-4">
                    Generate AI-powered subtitles for your video
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download and Next Steps */}
        {project.status === 'completed' && subtitles.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Download Options</h3>
              <div className="space-y-3">
                <button onClick={handleDownloadSRT} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Download SRT File</button>
                <button disabled className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-lg cursor-not-allowed">Download VTT File</button>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
              <div className="space-y-3">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">Customize Subtitles</button>
                <button onClick={() => window.location.assign('/dashboard/upload')} className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Process Another Video</button>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Export</h3>
              <div className="space-y-3">
                <button onClick={() => toast.success('Export started (demo)')} className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg">Export Video</button>
                <button onClick={() => toast.success('Share link copied (demo)')} className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Share</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
