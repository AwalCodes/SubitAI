
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/lib/providers'
import { createClient } from '@/lib/supabase'
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
  Share2,
  Zap,
  ChevronDown,
  FileText,
  FileJson,
  FileAudio
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import SubtitleEditor, { SubtitleStyle } from '@/components/subtitle-editor/SubtitleEditor'

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
  created_at: string
  video_filename?: string
  subtitles?: Array<{
    id: string
    srt_data: string
    json_data: {
      segments: Subtitle[]
      language: string
      style?: SubtitleStyle
    }
    language: string
  }>
}

// Helper function to detect if file is audio or video
const isAudioFile = (filename?: string, url?: string): boolean => {
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop()
    return ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext || '')
  }
  if (url) {
    const ext = url.toLowerCase().split('.').pop()?.split('?')[0]
    return ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext || '')
  }
  return false
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: userLoading, subscription } = useUser()
  const [project, setProject] = useState<Project | null>(null)
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [energyCost, setEnergyCost] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const [activeWord, setActiveWord] = useState<{ segment: number; word: number } | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Detect if file is audio or video
  const isAudio = project ? isAudioFile(project.video_filename, project.video_url) : false

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login')
    }
  }, [userLoading, user, router])

  useEffect(() => {
    if (!user || !params.id) return
    
    const fetchProject = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        const { data: projectData, error } = await supabase
          .from('projects')
          .select(`
            id, title, status, video_url, video_duration, created_at, video_filename,
            subtitles (id, srt_data, json_data, language)
          `)
          .eq('id', params.id as string)
          .single()
        
        if (error) throw error
        setProject(projectData)

        // Load subtitles if they exist
        if (projectData.subtitles && projectData.subtitles.length > 0) {
          const subtitleData = projectData.subtitles[0]
          if (subtitleData.json_data?.segments) {
            setSubtitles(subtitleData.json_data.segments)
          }
        }

        // Auto-start polling if project is processing and no subtitles
        if (projectData.status === 'processing' && (!projectData.subtitles || projectData.subtitles.length === 0)) {
          // Polling will be handled by the separate useEffect
          console.log('Project is processing, polling will start automatically')
        }
      } catch (error: any) {
        console.error('Failed to fetch project:', error)
        setError(error.message || 'Failed to load project')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProject()
  }, [user, params.id])

  useEffect(() => {
    if (!project?.id) return

    const fetchEnergy = async () => {
      try {
        const res = await fetch(`/api/project-energy/${project.id}`)
        if (!res.ok) {
          return
        }
        const data = await res.json()
        if (data && data.success) {
          setEnergyCost(typeof data.energyCost === 'number' ? data.energyCost : 0)
        }
      } catch (err) {
        console.error('Failed to fetch project energy usage:', err)
      }
    }

    fetchEnergy()
  }, [project?.id])

  // Auto-start polling if project is in processing state and we have no subtitles yet
  useEffect(() => {
    if (!project || project.status !== 'processing' || subtitles.length > 0) {
      return
    }

    setGenerating(true)
    let pollCount = 0
    let cancelled = false
    const maxPolls = 240 // 20 minutes at 5 second intervals (model download can take time)
    const projectId = project.id
    
    console.log('Starting subtitle polling for project:', projectId)
    
    const pollInterval = setInterval(async () => {
      if (cancelled) {
        clearInterval(pollInterval)
        return
      }
      try {
        pollCount++
        console.log(`Polling attempt ${pollCount}/${maxPolls} for project ${projectId}`)
        
        const supabase = createClient()
        const { data: updatedProject, error } = await supabase
          .from('projects')
          .select(`
            id, title, status, video_url, video_duration, created_at, video_filename,
            subtitles (id, srt_data, json_data, language)
          `)
          .eq('id', projectId)
          .single()
        
        if (error) throw error
        
        // Check if subtitles were generated
        if (updatedProject.subtitles && updatedProject.subtitles.length > 0) {
          const subtitleData = updatedProject.subtitles[0]
          if (subtitleData.json_data?.segments && subtitleData.json_data.segments.length > 0) {
            console.log('Subtitles found! Stopping polling.')
            clearInterval(pollInterval)
            setProject(updatedProject)
            setSubtitles(subtitleData.json_data.segments)
            setGenerating(false)
            toast.success('Subtitles generated successfully!')
            return
          }
        }
        
        // Check for failure status
        if (updatedProject.status === 'failed') {
          console.log('Subtitle generation failed')
          clearInterval(pollInterval)
          setGenerating(false)
          toast.error('Subtitle generation failed')
          return
        }
        
        // Check if status changed to completed (even without subtitles in response yet)
        if (updatedProject.status === 'completed') {
          // Give it one more poll to get subtitles
          if (pollCount >= 5) {
            console.log('Project marked as completed, fetching subtitles...')
            // Try fetching one more time
            const { data: finalProject, error: finalError } = await supabase
              .from('projects')
              .select(`
                id, title, status, video_url, video_duration, created_at, video_filename,
                subtitles (id, srt_data, json_data, language)
              `)
              .eq('id', projectId)
              .single()
            
            if (finalError) throw finalError
            if (finalProject.subtitles && finalProject.subtitles.length > 0) {
              const subtitleData = finalProject.subtitles[0]
              if (subtitleData.json_data?.segments && subtitleData.json_data.segments.length > 0) {
                clearInterval(pollInterval)
                setProject(finalProject)
                setSubtitles(subtitleData.json_data.segments)
                setGenerating(false)
                toast.success('Subtitles generated successfully!')
                return
              }
            }
          }
        }
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          console.log('Max polling attempts reached')
          clearInterval(pollInterval)
          setGenerating(false)
          toast.error('Subtitle generation is taking longer than expected. Please refresh the page.')
        }
      } catch (error) {
        console.error('Polling error:', error)
        pollCount++
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          setGenerating(false)
          toast.error('Error checking subtitle status. Please refresh the page.')
        }
      }
    }, 5000) // Poll every 5 seconds
    
    return () => {
      console.log('Cleaning up polling interval')
      cancelled = true
      clearInterval(pollInterval)
    }
  }, [project, subtitles.length])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: projectData, error } = await supabase
        .from('projects')
        .select(`
          id, title, status, video_url, video_duration, created_at, video_filename,
          subtitles (id, srt_data, json_data, language)
        `)
        .eq('id', params.id as string)
        .single()
      
      if (error) throw error
      setProject(projectData)

      // Load subtitles if they exist
      if (projectData.subtitles && projectData.subtitles.length > 0) {
        const subtitleData = projectData.subtitles[0]
        if (subtitleData.json_data?.segments) {
          console.log('Loaded subtitles:', subtitleData.json_data.segments)
          console.log('First subtitle:', subtitleData.json_data.segments[0])
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
      console.log(`Subtitle generation is currently handled by the worker UI flow`)
      toast('Subtitle generation from this page is not implemented yet.')
    } catch (error: any) {
      console.error('=== Generate Subtitles Error ===')
      console.error('Full error:', error)
      const errorMessage = (error as any)?.message || 'Failed to generate subtitles'
      toast.error(errorMessage)
    } finally {
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

  const handleSaveAll = async (updatedSubtitles?: Subtitle[], style?: SubtitleStyle) => {
    if (!project) return

    try {
      setSaving(true)
      const updateData: any = {
        json_data: {
          segments: updatedSubtitles || subtitles,
          language: project.subtitles?.[0]?.language || 'en'
        }
      }
      
      // Add style to json_data if provided
      if (style) {
        updateData.json_data.style = style
      }
      
      const supabase = createClient()
      const { error } = await supabase
        .from('subtitles')
        .update({ json_data: updateData.json_data })
        .eq('project_id', project.id)
      
      if (error) throw error
      
      // Update local state
      if (updatedSubtitles) {
        setSubtitles(updatedSubtitles)
      }
      
      toast.success('Subtitles saved successfully!')
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.response?.data?.detail || 'Failed to save subtitles')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAllClick = () => {
    handleSaveAll()
  }

  // Helper function to format timestamp
  const formatTimestamp = (seconds: number, format: 'srt' | 'vtt'): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    const sep = format === 'srt' ? ',' : '.'
    const pad = (num: number, size: number = 2) => String(num).padStart(size, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(ms, 3)}`
  }

  // Generate SRT content
  const generateSRT = (segments: Subtitle[]): string => {
    return segments.map((seg, idx) => {
      const start = formatTimestamp(seg.start, 'srt')
      const end = formatTimestamp(seg.end, 'srt')
      return `${idx + 1}\n${start} --> ${end}\n${seg.text}\n`
    }).join('\n')
  }

  // Generate VTT content
  const generateVTT = (segments: Subtitle[]): string => {
    const lines = ['WEBVTT\n']
    segments.forEach((seg, idx) => {
      const start = formatTimestamp(seg.start, 'vtt')
      const end = formatTimestamp(seg.end, 'vtt')
      lines.push(`${idx + 1}\n${start} --> ${end}\n${seg.text}\n`)
    })
    return lines.join('\n')
  }

  // Generate TXT content (plain text, no timestamps)
  const generateTXT = (segments: Subtitle[]): string => {
    return segments.map(seg => seg.text).join('\n\n')
  }

  // Generate JSON content
  const generateJSON = (segments: Subtitle[]): string => {
    return JSON.stringify({
      segments: segments.map(seg => ({
        start: seg.start,
        end: seg.end,
        text: seg.text
      }))
    }, null, 2)
  }

  // Download function
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadSRT = async () => {
    if (!project || subtitles.length === 0) return
    setShowExportMenu(false)
    try {
      const srtContent = generateSRT(subtitles)
      downloadFile(srtContent, `${project.title}.srt`, 'text/plain')
      toast.success('SRT file downloaded!')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Failed to download SRT file')
    }
  }

  const handleDownloadVTT = async () => {
    if (!project || subtitles.length === 0) return
    setShowExportMenu(false)
    try {
      const vttContent = generateVTT(subtitles)
      downloadFile(vttContent, `${project.title}.vtt`, 'text/vtt')
      toast.success('VTT file downloaded!')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Failed to download VTT file')
    }
  }

  const handleDownloadTXT = async () => {
    if (!project || subtitles.length === 0) return
    setShowExportMenu(false)
    try {
      const txtContent = generateTXT(subtitles)
      downloadFile(txtContent, `${project.title}.txt`, 'text/plain')
      toast.success('TXT file downloaded!')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Failed to download TXT file')
    }
  }

  const handleDownloadJSON = async () => {
    if (!project || subtitles.length === 0) return
    setShowExportMenu(false)
    try {
      const jsonContent = generateJSON(subtitles)
      downloadFile(jsonContent, `${project.title}.json`, 'application/json')
      toast.success('JSON file downloaded!')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Failed to download JSON file')
    }
  }

  const handleDelete = async () => {
    if (!project) return

    if (!confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleting(true)
      const supabase = createClient()
      
      // Attempt to delete the associated video file from storage first (best-effort)
      if (project.video_filename && user?.id) {
        const filePath = `${user.id}/${project.video_filename}`
        const { error: storageError } = await supabase.storage
          .from('videos')
          .remove([filePath])

        if (storageError) {
          console.error('Failed to delete video file from storage:', storageError)
        }
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
      
      if (error) throw error
      toast.success('Project deleted successfully')
      router.push('/dashboard/projects')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.response?.data?.detail || 'Failed to delete project')
    } finally {
      setDeleting(false)
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
    const mediaElement = isAudio ? audioRef.current : videoRef.current
    if (!mediaElement) return
    const t = mediaElement.currentTime
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

  // Only show the full-screen loading state before we have any project data.
  // Once a project has been loaded, keep showing it even if `loading` toggles
  // due to background refetches (e.g. when switching tabs or auth refresh).
  if (loading && !project) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-subit-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-neutral-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 dark:text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-2">Project not found</h2>
          <p className="text-gray-600 dark:text-neutral-400 mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-subit-600 text-white rounded-lg hover:bg-subit-700">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-subit-600 via-subit-500 to-subit-400 border-b border-subit-300/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard"
                className="flex items-center text-subit-50 hover:text-white mb-3 text-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-subit-50">
                <span className="flex items-center px-3 py-1 rounded-full bg-white/10">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(project.video_duration || 0)}
                </span>
                <span className="flex items-center px-3 py-1 rounded-full bg-white/10">
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {typeof energyCost === 'number' && (
                  <span className="flex items-center px-3 py-1 rounded-full bg-white/10">
                    <Zap className="w-3 h-3 mr-1" />
                    {energyCost} energy used
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {subtitles.length > 0 && (
                <>
                  <button
                    onClick={handleSaveAllClick}
                    disabled={saving}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-subit-600 rounded-lg font-medium hover:bg-subit-50 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white/10 border border-white/40 rounded-lg text-white hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showExportMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowExportMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-20 py-2">
                          <button
                            onClick={handleDownloadSRT}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-white"
                          >
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium">Download SRT</span>
                          </button>
                          <button
                            onClick={handleDownloadVTT}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-white"
                          >
                            <FileText className="w-4 h-4 text-violet-400" />
                            <span className="text-sm font-medium">Download VTT</span>
                          </button>
                          <button
                            onClick={handleDownloadTXT}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-white"
                          >
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium">Download TXT</span>
                          </button>
                          <button
                            onClick={handleDownloadJSON}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-white"
                          >
                            <FileJson className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">Download JSON</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 border border-red-200/70 bg-red-500/10 text-red-50 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-100 border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success banner */}
        {project.status === 'completed' && subtitles.length > 0 && (
          <div className="mb-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center">✓</div>
            <div className="text-gray-800 dark:text-neutral-200 font-medium">Subtitles Generated Successfully!</div>
          </div>
        )}

        {/* Subtitle Editor - Full Width */}
        {subtitles.length > 0 && project.status === 'completed' ? (
          <div className="mb-8">
            <SubtitleEditor
              subtitles={subtitles}
              videoUrl={project.video_url}
              videoDuration={project.video_duration || 0}
              onSave={handleSaveAll}
              subscriptionTier={(subscription?.plan as 'free' | 'pro' | 'premium') || 'free'}
              isAudio={isAudio}
              savedStyle={project.subtitles?.[0]?.json_data?.style}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Media Player (Video or Audio) */}
            <div>
              <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 p-6 sm:p-7 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
                  {isAudio ? 'Audio Preview' : 'Video Preview'}
                </h2>
                {isAudio ? (
                  <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg p-8 sm:p-12">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                        <FileAudio className="w-12 h-12 text-white" />
                      </div>
                      {project.video_url ? (
                        <audio
                          key={project.video_url}
                          src={project.video_url}
                          controls
                          className="w-full max-w-md"
                          ref={audioRef}
                          onPlay={() => {
                            if (rafRef.current) cancelAnimationFrame(rafRef.current)
                            rafRef.current = requestAnimationFrame(tick)
                          }}
                          onPause={() => {
                            if (rafRef.current) cancelAnimationFrame(rafRef.current)
                            rafRef.current = null
                          }}
                          onError={(e) => {
                            console.error('Audio playback error:', e)
                            toast.error('Failed to load audio. Please refresh the page.')
                          }}
                        >
                          Your browser does not support the audio tag.
                        </audio>
                      ) : (
                        <div className="text-center text-slate-400">
                          <p>Audio file not available</p>
                        </div>
                      )}
                      {project.title && (
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Now Playing</p>
                          <p className="text-lg font-semibold text-white mt-1">{project.title}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                    {project.video_url ? (
                      <>
                        <video
                          key={project.video_url}
                          src={project.video_url}
                          controls
                          className="w-full h-full"
                          ref={videoRef}
                          onPlay={handlePlay}
                          onPause={handlePause}
                          onError={(e) => {
                            console.error('Video playback error:', e)
                            toast.error('Failed to load video. Please refresh the page.')
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                        {/* Subtitle Overlay */}
                        {subtitles.length > 0 && activeSegment !== null && (
                          <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-8 px-4">
                            <div className="px-4 py-2 rounded-lg bg-black/70 text-white text-lg font-medium max-w-[90%] text-center">
                              {subtitles[activeSegment]?.text}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Video className="w-16 h-16 opacity-50" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Subtitles List */}
            <div>
              <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Subtitles</h2>
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
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {subtitles.map((subtitle, index) => {
                      const words = getSegmentWords(subtitle)
                      const isActiveSeg = activeSegment === index
                      return (
                        <div
                          key={index}
                          className={`border rounded-xl p-4 sm:p-5 transition-colors ${
                            isActiveSeg
                              ? 'border-subit-300 dark:border-subit-500 bg-subit-50/80 dark:bg-subit-900/20 shadow-sm'
                              : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-subit-300 dark:hover:border-subit-500 hover:bg-neutral-50 dark:hover:bg-neutral-900/80'
                          }`}
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
                              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-subit-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
                              rows={2}
                            />
                          ) : (
                            <p className="text-gray-900 dark:text-neutral-200 leading-7">
                              {subtitle.text || words.map((w, wi) => {
                                const on = activeWord && activeWord.segment === index && activeWord.word === wi
                                return (
                                  <span key={wi} className={on ? 'bg-yellow-200 rounded px-0.5' : ''}>{w.text}</span>
                                )
                              }).join('') || '[No text]'}
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
                    <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">No subtitles yet</h3>
                    <p className="text-gray-600 dark:text-neutral-400 mb-4">
                      Generate AI-powered subtitles for your video
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Next Steps - Export section removed since it's in header */}
        {project.status === 'completed' && subtitles.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h3 className="font-semibold text-white mb-3">Next Steps</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/dashboard/upload-v2')} 
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Process Another {isAudio ? 'Audio' : 'Video'}
                </button>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h3 className="font-semibold text-white mb-3">Share Project</h3>
              <div className="space-y-2">
                <button 
                  onClick={async () => {
                    if (!project?.id) {
                      toast.error('Project not found')
                      return
                    }
                    const shareUrl = `${window.location.origin}/dashboard/projects/${project.id}`
                    try {
                      await navigator.clipboard.writeText(shareUrl)
                      toast.success('Share link copied to clipboard!')
                    } catch (error) {
                      // Fallback for browsers that don't support clipboard API
                      const textArea = document.createElement('textarea')
                      textArea.value = shareUrl
                      textArea.style.position = 'fixed'
                      textArea.style.opacity = '0'
                      document.body.appendChild(textArea)
                      textArea.select()
                      try {
                        document.execCommand('copy')
                        toast.success('Share link copied to clipboard!')
                      } catch (err) {
                        toast.error('Failed to copy link. Please copy manually: ' + shareUrl)
                      }
                      document.body.removeChild(textArea)
                    }
                  }} 
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
