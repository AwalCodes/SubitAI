'use client'

/**
 * Project View Page V2 - Completely Refactored
 * Features:
 * - Optimized video player
 * - Real-time subtitle editing
 * - Download SRT/VTT
 * - Mobile responsive
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Download, Edit, Save, Trash2, Plus, 
  Play, Pause, SkipBack, SkipForward,
  Loader, AlertCircle, CheckCircle
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useUser } from '@/lib/providers'
import toast from 'react-hot-toast'
import { SubtitleEditor } from '@/components/subtitle-editor-v2'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Project {
  id: string
  title: string
  video_url: string
  video_filename: string
  status: string
  created_at: string
}

interface Subtitle {
  id: string
  srt_data: string
  json_data: {
    text: string
    language: string
    segments: Array<{
      id: number
      start: number
      end: number
      text: string
    }>
    duration: number
  }
  language: string
}

export default function ProjectViewV2() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const projectId = params.id as string

  // State
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [subtitle, setSubtitle] = useState<Subtitle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Video ref
  const videoRef = useRef<HTMLVideoElement>(null)

  // Load project and subtitles
  useEffect(() => {
    loadProject()
  }, [projectId, loadProject])

  const loadProject = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user?.id)
        .single()

      if (projectError) throw projectError
      if (!projectData) throw new Error('Project not found')

      setProject(projectData)

      // Fetch subtitles
      const { data: subtitleData, error: subtitleError } = await supabase
        .from('subtitles')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (!subtitleError && subtitleData) {
        setSubtitle(subtitleData)
      }

    } catch (err: any) {
      console.error('Failed to load project:', err)
      setError(err.message || 'Failed to load project')
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [projectId, user?.id])

  // Update subtitle segments
  const handleUpdateSubtitles = useCallback((newSegments: any[]) => {
    if (!subtitle) return

    setSubtitle({
      ...subtitle,
      json_data: {
        ...subtitle.json_data,
        segments: newSegments,
      },
    })
  }, [subtitle])

  // Save subtitles
  const handleSave = async () => {
    if (!subtitle) return

    try {
      setSaving(true)

      // Generate SRT from segments
      const srtContent = generateSRT(subtitle.json_data.segments)

      const { error } = await supabase
        .from('subtitles')
        .update({
          srt_data: srtContent,
          json_data: subtitle.json_data,
        })
        .eq('id', subtitle.id)

      if (error) throw error

      toast.success('Subtitles saved successfully')
    } catch (err: any) {
      console.error('Failed to save subtitles:', err)
      toast.error('Failed to save subtitles')
    } finally {
      setSaving(false)
    }
  }

  // Download SRT
  const handleDownloadSRT = () => {
    if (!subtitle) return

    const blob = new Blob([subtitle.srt_data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.title || 'subtitles'}.srt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('SRT downloaded')
  }

  // Download VTT
  const handleDownloadVTT = () => {
    if (!subtitle) return

    const vttContent = generateVTT(subtitle.json_data.segments)
    const blob = new Blob([vttContent], { type: 'text/vtt' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.title || 'subtitles'}.vtt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('VTT downloaded')
  }

  // Video controls
  const handlePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (time: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  // Get current subtitle
  const getCurrentSubtitle = () => {
    if (!subtitle) return null
    
    return subtitle.json_data.segments.find(
      seg => currentTime >= seg.start && currentTime <= seg.end
    )
  }

  const currentSubtitle = getCurrentSubtitle()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-subit-600 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Error Loading Project
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error || 'Project not found'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-subit-600 text-white rounded-xl hover:bg-subit-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {project.title}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !subtitle}
                className="px-4 py-2 bg-subit-600 text-white rounded-lg hover:bg-subit-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save</span>
              </button>
              <button
                onClick={handleDownloadSRT}
                disabled={!subtitle}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">SRT</span>
              </button>
              <button
                onClick={handleDownloadVTT}
                disabled={!subtitle}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">VTT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Video Player */}
          <div className="space-y-4">
            <div className="bg-black rounded-xl overflow-hidden shadow-xl aspect-video">
              <video
                ref={videoRef}
                src={project.video_url}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>

            {/* Current Subtitle Display */}
            {currentSubtitle && (
              <div className="bg-neutral-900 text-white rounded-lg p-4 text-center">
                <p className="text-lg font-medium">
                  {currentSubtitle.text}
                </p>
              </div>
            )}

            {/* Video Controls */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleSeek(Math.max(0, currentTime - 5))}
                  className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="p-4 bg-subit-600 text-white rounded-full hover:bg-subit-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <button
                  onClick={() => handleSeek(currentTime + 5)}
                  className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Subtitle Editor */}
          <div className="space-y-4">
            {subtitle ? (
              <SubtitleEditor
                segments={subtitle.json_data.segments}
                onUpdate={handleUpdateSubtitles}
                currentTime={currentTime}
                onSeekTo={handleSeek}
              />
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
                <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  No Subtitles Yet
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Generate subtitles for this video to get started
                </p>
                <button
                  onClick={() => router.push(`/dashboard/projects/${projectId}/generate`)}
                  className="px-6 py-3 bg-subit-600 text-white rounded-lg hover:bg-subit-700 transition-colors"
                >
                  Generate Subtitles
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// Helper functions
function generateSRT(segments: any[]): string {
  return segments.map((seg, idx) => {
    const start = formatTimestamp(seg.start, 'srt')
    const end = formatTimestamp(seg.end, 'srt')
    return `${idx + 1}\n${start} --> ${end}\n${seg.text}\n`
  }).join('\n')
}

function generateVTT(segments: any[]): string {
  const lines = ['WEBVTT\n']
  segments.forEach((seg, idx) => {
    const start = formatTimestamp(seg.start, 'vtt')
    const end = formatTimestamp(seg.end, 'vtt')
    lines.push(`${idx + 1}\n${start} --> ${end}\n${seg.text}\n`)
  })
  return lines.join('\n')
}

function formatTimestamp(seconds: number, format: 'srt' | 'vtt'): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  const sep = format === 'srt' ? ',' : '.'
  return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(ms, 3)}`
}

function pad(num: number, size: number = 2): string {
  return String(num).padStart(size, '0')
}

