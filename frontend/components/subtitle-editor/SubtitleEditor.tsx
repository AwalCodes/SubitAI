'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Type,
  Palette,
  Film,
  Download,
  Play,
  Pause,
  Save,
  Sparkles,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Move,
  Lock,
  Zap,
  Settings2,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Split,
  ChevronDown,
  FileText,
  FileJson
} from 'lucide-react'
import toast from 'react-hot-toast'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { generateSRT } from '@/lib/utils'

export interface SubtitleStyle {
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold' | '600' | '700'
  color: string
  backgroundColor: string
  backgroundOpacity: number
  textAlign: 'left' | 'center' | 'right'
  position: 'bottom' | 'center' | 'top'
  verticalOffset: number
  horizontalOffset: number
  animation: 'none' | 'fade' | 'slide' | 'slideDown' | 'slideLeft' | 'slideRight' | 'pop' | 'typewriter' | 'bounce' | 'glow' | 'karaoke' | 'zoom'
  animationDuration: number
  outlineColor: string
  outlineWidth: number
  borderRadius: number
  padding: number
  letterSpacing: number
  lineHeight: number
  displayMode: 'line-by-line' | 'multiple-lines' | 'word-by-word' | 'character-by-character'
  maxLines: number
  // Advanced effects (Phase 3)
  shadowOffsetX?: number
  shadowOffsetY?: number
  shadowBlur?: number
  shadowColor?: string
  backgroundBlur?: number
  glowIntensity?: number
  glowColor?: string
}

export interface Subtitle {
  id: number
  start: number
  end: number
  text: string
  words?: Array<{ start: number; end: number; text: string }>
}

interface SubtitleEditorProps {
  subtitles: Subtitle[]
  videoUrl: string
  videoDuration: number
  onSave: (subtitles: Subtitle[], style?: SubtitleStyle) => Promise<void>
  subscriptionTier: 'free' | 'pro' | 'premium'
  isAudio?: boolean
  savedStyle?: SubtitleStyle
}

const DEFAULT_STYLE: SubtitleStyle = {
  fontFamily: 'Inter',
  fontSize: 24,
  fontWeight: 'bold',
  color: '#FFFFFF',
  backgroundColor: '#000000',
  backgroundOpacity: 0.7,
  textAlign: 'center',
  position: 'bottom',
  verticalOffset: 80,
  horizontalOffset: 0,
  animation: 'fade',
  animationDuration: 0.3,
  outlineColor: '#000000',
  outlineWidth: 2,
  borderRadius: 8,
  padding: 12,
  letterSpacing: 0,
  lineHeight: 1.4,
  displayMode: 'line-by-line',
  maxLines: 2,
  // Advanced effects defaults
  shadowOffsetX: 0,
  shadowOffsetY: 2,
  shadowBlur: 4,
  shadowColor: '#000000',
  backgroundBlur: 0,
  glowIntensity: 0,
  glowColor: '#FFFFFF',
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', category: 'sans' },
  { value: 'Arial', label: 'Arial', category: 'sans' },
  { value: 'Helvetica', label: 'Helvetica', category: 'sans' },
  { value: 'Roboto', label: 'Roboto', category: 'sans' },
  { value: 'Open Sans', label: 'Open Sans', category: 'sans' },
  { value: 'Montserrat', label: 'Montserrat', category: 'sans' },
  { value: 'Poppins', label: 'Poppins', category: 'sans' },
  { value: 'Lato', label: 'Lato', category: 'sans' },
  { value: 'Nunito', label: 'Nunito', category: 'sans' },
  { value: 'Raleway', label: 'Raleway', category: 'sans' },
  { value: 'Ubuntu', label: 'Ubuntu', category: 'sans' },
  { value: 'Oswald', label: 'Oswald', category: 'display' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'serif' },
  { value: 'Lora', label: 'Lora', category: 'serif' },
  { value: 'Source Serif Pro', label: 'Source Serif', category: 'serif' },
  { value: 'Bebas Neue', label: 'Bebas Neue', category: 'display' },
  { value: 'Anton', label: 'Anton', category: 'display' },
  { value: 'Archivo Black', label: 'Archivo Black', category: 'display' },
  { value: 'Quicksand', label: 'Quicksand', category: 'sans' },
]

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'None', premium: false, description: 'No animation' },
  { value: 'fade', label: 'Fade In', premium: false, description: 'Smooth opacity fade' },
  { value: 'slide', label: 'Slide Up', premium: false, description: 'Slide from bottom' },
  { value: 'slideDown', label: 'Slide Down', premium: true, description: 'Slide from top' },
  { value: 'slideLeft', label: 'Slide Left', premium: true, description: 'Slide from right' },
  { value: 'slideRight', label: 'Slide Right', premium: true, description: 'Slide from left' },
  { value: 'pop', label: 'Pop', premium: true, description: 'Scale up with bounce' },
  { value: 'typewriter', label: 'Typewriter', premium: true, description: 'Letter by letter' },
  { value: 'bounce', label: 'Bounce', premium: true, description: 'Bouncy entrance' },
  { value: 'glow', label: 'Glow Pulse', premium: true, description: 'Pulsating glow effect' },
  { value: 'karaoke', label: 'Karaoke', premium: true, description: 'Word-by-word highlight' },
  { value: 'zoom', label: 'Zoom', premium: true, description: 'Scale from center' },
]

const POSITION_OPTIONS = [
  { value: 'bottom', label: 'Bottom', premium: false },
  { value: 'center', label: 'Center', premium: true },
  { value: 'top', label: 'Top', premium: false },
]

export default function SubtitleEditor({
  subtitles,
  videoUrl,
  videoDuration,
  onSave,
  subscriptionTier,
  isAudio = false,
  savedStyle,
}: SubtitleEditorProps) {
  // Merge saved style with defaults to ensure all fields are present
  const [style, setStyle] = useState<SubtitleStyle>(() => {
    if (savedStyle) {
      return {
        ...DEFAULT_STYLE,
        ...savedStyle,
        displayMode: savedStyle.displayMode || DEFAULT_STYLE.displayMode,
        maxLines: savedStyle.maxLines || DEFAULT_STYLE.maxLines,
      }
    }
    return DEFAULT_STYLE
  })
  const [editingSubtitles, setEditingSubtitles] = useState<Subtitle[]>(subtitles)
  const [activePanel, setActivePanel] = useState<'style' | 'edit'>('style')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const handleDownloadSRT = useCallback(() => {
    const valid = editingSubtitles.filter(s => s.text && s.text.trim())
    if (valid.length === 0) {
      toast.error('No valid subtitles to export')
      return
    }
    const content = generateSRTExport(valid)
    const filename = `subtitles-${Date.now()}.srt`
    downloadFileExport(content, filename, 'text/plain')
    toast.success('SRT file downloaded!')
  }, [editingSubtitles])
  const handleDownloadVTT = useCallback(() => {
    const valid = editingSubtitles.filter(s => s.text && s.text.trim())
    if (valid.length === 0) {
      toast.error('No valid subtitles to export')
      return
    }
    const content = generateVTTExport(valid)
    const filename = `subtitles-${Date.now()}.vtt`
    downloadFileExport(content, filename, 'text/vtt')
    toast.success('VTT file downloaded!')
  }, [editingSubtitles])
  const handleDownloadTXT = useCallback(() => {
    const valid = editingSubtitles.filter(s => s.text && s.text.trim())
    if (valid.length === 0) {
      toast.error('No valid subtitles to export')
      return
    }
    const content = generateTXTExport(valid)
    const filename = `subtitles-${Date.now()}.txt`
    downloadFileExport(content, filename, 'text/plain')
    toast.success('TXT file downloaded!')
  }, [editingSubtitles])
  const handleDownloadJSON = useCallback(() => {
    const valid = editingSubtitles.filter(s => s.text && s.text.trim())
    if (valid.length === 0) {
      toast.error('No valid subtitles to export')
      return
    }
    const content = generateJSONExport(valid)
    const filename = `subtitles-${Date.now()}.json`
    downloadFileExport(content, filename, 'application/json')
    toast.success('JSON file downloaded!')
  }, [editingSubtitles])

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timelineRef = useRef<HTMLDivElement | null>(null)

  const isPremium = subscriptionTier === 'premium'
  const isPro = subscriptionTier === 'pro' || isPremium

  useEffect(() => {
    setEditingSubtitles(subtitles)
  }, [subtitles])



  useEffect(() => {
    const mediaElement = videoRef.current
    if (!mediaElement) return

    const updateTime = () => {
      const newTime = mediaElement.currentTime
      setCurrentTime(newTime)
      const segIdx = editingSubtitles.findIndex(
        s => newTime >= s.start && newTime <= s.end
      )
      const newActiveSegment = segIdx >= 0 ? segIdx : null
      setActiveSegment(newActiveSegment)
    }

    const interval = setInterval(updateTime, 50) // Update more frequently for smoother preview
    return () => clearInterval(interval)
  }, [editingSubtitles])

  // Set video volume when it changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Update canvas dimensions when video metadata loads
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || isAudio) return

    const updateCanvasSize = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
    }

    video.addEventListener('loadedmetadata', updateCanvasSize)
    if (video.readyState >= 1) updateCanvasSize()

    return () => {
      video.removeEventListener('loadedmetadata', updateCanvasSize)
    }
  }, [videoUrl, isAudio])

  const drawSubtitleOnCanvas = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string,
    style: SubtitleStyle,
    elapsed: number = 0
  ) => {
    ctx.save()

    const fontSize = style.fontSize
    ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}, sans-serif`
    ctx.textAlign = style.textAlign === 'center' ? 'center' : style.textAlign === 'left' ? 'left' : 'right'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = `${style.letterSpacing}px`

    let displayText = text
    if (style.displayMode === 'word-by-word' || style.displayMode === 'character-by-character') {
      const words = text.split(' ')
      const chars = text.split('')
      const duration = 0.5
      const progress = Math.min(elapsed / duration, 1)
      if (style.displayMode === 'word-by-word') {
        const wordCount = Math.ceil(words.length * progress)
        displayText = words.slice(0, wordCount).join(' ')
      } else {
        const charCount = Math.ceil(chars.length * progress)
        displayText = chars.slice(0, charCount).join('')
      }
    }

    const lines = style.displayMode === 'multiple-lines'
      ? wrapText(ctx, displayText, canvas.width * 0.8, style.maxLines)
      : [displayText]

    let baseX = canvas.width / 2
    let baseY = canvas.height - style.verticalOffset
    if (style.position === 'center') {
      baseY = canvas.height / 2
    } else if (style.position === 'top') {
      baseY = style.verticalOffset
    }
    baseX += style.horizontalOffset
    if (style.textAlign === 'left') {
      baseX = style.horizontalOffset + (canvas.width * 0.1)
    } else if (style.textAlign === 'right') {
      baseX = canvas.width - style.horizontalOffset - (canvas.width * 0.1)
    }

    const lineHeight = fontSize * style.lineHeight
    const totalHeight = lines.length * lineHeight
    const startY = baseY - (totalHeight / 2) + (lineHeight / 2)

    if (style.backgroundColor && style.backgroundOpacity > 0 && lines.length > 0) {
      const lineWidths = lines.map(line => ctx.measureText(line).width)
      const maxWidth = Math.max(...lineWidths)
      const bgX = baseX - (style.textAlign === 'center' ? maxWidth / 2 : style.textAlign === 'left' ? 0 : maxWidth)
      const bgY = startY - (lineHeight / 2) - style.padding
      const bgWidth = maxWidth + style.padding * 2
      const bgHeight = totalHeight + style.padding * 2
      ctx.fillStyle = style.backgroundColor
      ctx.globalAlpha = style.backgroundOpacity
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(bgX, bgY, bgWidth, bgHeight, style.borderRadius)
      } else {
        const r = style.borderRadius
        ctx.moveTo(bgX + r, bgY)
        ctx.lineTo(bgX + bgWidth - r, bgY)
        ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + r)
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight - r)
        ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - r, bgY + bgHeight)
        ctx.lineTo(bgX + r, bgY + bgHeight)
        ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - r)
        ctx.lineTo(bgX, bgY + r)
        ctx.quadraticCurveTo(bgX, bgY, bgX + r, bgY)
        ctx.closePath()
      }
      ctx.fill()
    }

    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight)
      if (style.outlineWidth > 0) {
        ctx.strokeStyle = style.outlineColor
        ctx.lineWidth = style.outlineWidth
        ctx.globalAlpha = 1
        ctx.strokeText(line, baseX, y)
      }
      ctx.fillStyle = style.color
      ctx.globalAlpha = 1
      ctx.fillText(line, baseX, y)
    })
    ctx.restore()
  }, [])

  // Real-time subtitle rendering function - always reads current time directly
  const renderSubtitles = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || video.readyState < 1 || isAudio) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 1920
      canvas.height = video.videoHeight || 1080
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const currentVideoTime = video.currentTime
    const activeSeg = editingSubtitles.find(
      s => currentVideoTime >= s.start && currentVideoTime <= s.end
    )

    if (activeSeg) {
      const elapsed = isPlaying ? currentVideoTime - activeSeg.start : 0
      drawSubtitleOnCanvas(ctx, canvas, activeSeg.text, style, elapsed)
    }
  }, [editingSubtitles, style, isAudio, isPlaying, drawSubtitleOnCanvas])

  // REAL-TIME: Trigger immediate re-render when subtitles or style change
  useEffect(() => {
    if (!videoRef.current || isAudio) return

    // Force immediate render on any subtitle/style change
    const timeoutId = setTimeout(() => {
      renderSubtitles()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [editingSubtitles, style, renderSubtitles, isAudio])

  // Animation loop when playing
  useEffect(() => {
    if (!videoRef.current || isAudio) return

    const drawSubtitles = () => {
      renderSubtitles()

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(drawSubtitles)
      }
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawSubtitles)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, renderSubtitles, isAudio])



  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
        if (lines.length >= maxLines) break
      } else {
        currentLine = testLine
      }
    }

    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine)
    }

    return lines.length > 0 ? lines : [text]
  }

  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }, [])

  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, videoDuration))
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [videoDuration])

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const time = percentage * videoDuration
    handleSeek(time)
  }, [videoDuration, handleSeek])

  const handleSkip = useCallback((seconds: number) => {
    if (videoRef.current) {
      handleSeek(videoRef.current.currentTime + seconds)
    }
  }, [handleSeek])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol
      setIsMuted(vol === 0)
    }
  }, [])

  const handleMute = useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }, [isMuted, volume])

  const handleSave = useCallback(async () => {
    try {
      setSaving(true)
      await onSave(editingSubtitles, style)
      toast.success('Subtitles and style saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [onSave, editingSubtitles, style])

  const handleExportVideo = async () => {
    if (!isPro) {
      toast.error('Video export is available for Pro and Premium plans')
      return
    }

    if (!videoUrl || isAudio) {
      toast.error('Video not available for export')
      return
    }

    try {
      setExporting(true)
      const exportToast = toast.loading('Preparing video export...', { duration: Infinity })
      toast.loading('Sending to export server...', { id: exportToast })

      // Prepare request data
      const formData = new FormData()
      formData.append('videoUrl', videoUrl)

      // Filter empty subtitles
      const validSubtitles = editingSubtitles.filter(s => s.text && s.text.trim())
      if (validSubtitles.length === 0) {
        throw new Error('No valid subtitles to export')
      }
      formData.append('subtitles', JSON.stringify(validSubtitles))

      // Pass style
      formData.append('style', JSON.stringify(style))

      // Call our backend API which proxies to the Hugging Face service
      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null

      const response = await fetch('/api/export-video', {
        method: 'POST',
        body: formData,
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Export failed with status: ${response.status}`)
      }

      toast.loading('Downloading processed video...', { id: exportToast })

      // Get the blob from response
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      // Trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `subtitle-video-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.dismiss(exportToast)
      toast.success('Video exported successfully as MP4!')

    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export video')
    } finally {
      setExporting(false)
    }
  }

  // OLD CLIENT-SIDE EXPORT REMOVED - Now using FFmpeg.wasm above
  // Keeping this comment as marker - can delete the function below if needed
  const _oldClientSideExport = async (exportToast: string) => {
    // Fallback: Original client-side export (slow, WebM only)
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || isAudio) {
      throw new Error('Video or canvas not available for client-side export')
    }

    try {

      // Create a hidden canvas for composition - use original video dimensions for best quality
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = video.videoWidth || 1920
      exportCanvas.height = video.videoHeight || 1080
      const exportCtx = exportCanvas.getContext('2d', {
        alpha: false, // No transparency for better performance
        desynchronized: true, // Better performance
        willReadFrequently: false
      })
      if (!exportCtx) {
        throw new Error('Could not get canvas context')
      }

      // Enable high-quality rendering
      exportCtx.imageSmoothingEnabled = true
      exportCtx.imageSmoothingQuality = 'high'

      // Create a video element for processing with CORS
      const processingVideo = document.createElement('video')
      processingVideo.src = videoUrl
      processingVideo.crossOrigin = 'anonymous'
      processingVideo.preload = 'auto'
      processingVideo.muted = true // Required for autoplay

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video loading timeout'))
        }, 30000) // 30 second timeout

        processingVideo.onloadedmetadata = () => {
          clearTimeout(timeout)
          processingVideo.currentTime = 0
          resolve()
        }
        processingVideo.onerror = (e) => {
          clearTimeout(timeout)
          console.error('Video load error:', e)
          reject(new Error('Failed to load video for export. CORS may be blocking.'))
        }

        // Force load
        processingVideo.load()
      })

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        if (processingVideo.readyState >= 2) {
          resolve()
        } else {
          processingVideo.oncanplay = () => resolve()
        }
      })

      // Check for supported MIME types - Note: MP4 is rarely supported by MediaRecorder
      // Most browsers only support WebM. For true MP4, server-side processing is needed.
      const getSupportedMimeType = (): string => {
        const types = [
          'video/webm;codecs=vp9', // Best quality WebM
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4', // Rarely supported
        ]

        for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
            return type
          }
        }
        return 'video/webm' // Fallback
      }

      const mimeType = getSupportedMimeType()
      const isMP4 = mimeType.includes('mp4')

      // Note: Browser MediaRecorder API typically only supports WebM format
      // For true MP4 export, server-side processing with FFmpeg would be needed
      if (isMP4) {
        console.warn('MP4 export is rare in browsers - may fallback to WebM')
      }

      // Create MediaRecorder from canvas stream with maximum quality
      // Use 30 FPS for smoother, more reliable export
      const stream = exportCanvas.captureStream(30)

      // Calculate bitrate based on resolution for optimal quality
      const pixels = exportCanvas.width * exportCanvas.height
      // Higher bitrate for better quality: 8-12 Mbps range
      const bitrate = Math.max(8000000, Math.min(12000000, pixels * 3))

      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: bitrate,
      }

      const mediaRecorder = new MediaRecorder(stream, options)

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const fileExtension = isMP4 ? 'mp4' : 'webm'
        const blob = new Blob(chunks, { type: mimeType })

        // For WebM files, we can attempt server-side conversion to MP4
        // For now, export as high-quality WebM
        if (!isMP4) {
          // Check if server-side MP4 conversion is available
          try {
            toast.loading('Converting to MP4 format...', { id: exportToast })

            const formData = new FormData()
            formData.append('video', blob, 'video.webm')
            formData.append('subtitles', JSON.stringify(editingSubtitles))
            formData.append('style', JSON.stringify(style))

            const response = await fetch('/api/convert-to-mp4', {
              method: 'POST',
              body: formData,
            })

            if (response.ok) {
              const mp4Blob = await response.blob()
              const url = URL.createObjectURL(mp4Blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `subtitle-video-${Date.now()}.mp4`
              a.click()
              URL.revokeObjectURL(url)
              toast.success('Video exported as MP4!', { id: exportToast })
              return
            }
          } catch (error) {
            console.log('MP4 conversion not available, using WebM export')
          }
        }

        // Fallback to direct download (WebM or MP4 if supported)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `subtitle-video-${Date.now()}.${fileExtension}`
        a.click()
        URL.revokeObjectURL(url)

        if (!isMP4) {
          toast.success(
            `Video exported as high-quality WebM! Note: Browsers only support WebM format. You can convert to MP4 using online tools or VLC player.`,
            { id: exportToast, duration: 7000 }
          )
        } else {
          toast.success(`Video exported successfully as MP4!`, { id: exportToast })
        }
      }

      mediaRecorder.start()

      // Draw frames with optimal quality and timing
      const duration = video.duration
      const fps = 30 // Consistent 30 FPS for smooth export
      const frameTime = 1 / fps
      let currentTime = 0
      let frameCount = 0
      const totalFrames = Math.ceil(duration * fps)

      // Update progress
      const updateProgress = () => {
        const progress = Math.round((frameCount / totalFrames) * 100)
        toast.loading(`Exporting video... ${progress}%`, { id: exportToast })
      }

      const drawFrame = async (): Promise<void> => {
        if (currentTime >= duration) {
          mediaRecorder.stop()
          return
        }

        return new Promise<void>((resolve) => {
          const seekHandler = () => {
            try {
              // Clear and draw video frame with high quality
              exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height)
              exportCtx.imageSmoothingEnabled = true
              exportCtx.imageSmoothingQuality = 'high'
              exportCtx.drawImage(processingVideo, 0, 0, exportCanvas.width, exportCanvas.height)

              // Draw subtitle
              const activeSeg = editingSubtitles.find(
                s => currentTime >= s.start && currentTime <= s.end
              )
              if (activeSeg) {
                drawSubtitleOnCanvas(exportCtx, exportCanvas, activeSeg.text, style, currentTime - activeSeg.start)
              }

              processingVideo.removeEventListener('seeked', seekHandler)
              currentTime += frameTime
              frameCount++

              // Update progress every 10 frames
              if (frameCount % 10 === 0) {
                updateProgress()
              }

              // Use requestAnimationFrame for smoother, non-blocking frame processing
              requestAnimationFrame(() => {
                drawFrame().then(resolve).catch(resolve)
              })
            } catch (error) {
              console.error('Frame drawing error:', error)
              processingVideo.removeEventListener('seeked', seekHandler)
              resolve()
            }
          }

          processingVideo.addEventListener('seeked', seekHandler, { once: true })
          processingVideo.currentTime = currentTime
        })
      }

      updateProgress()
      await drawFrame()

    } catch (error: any) {
      console.error('Export error:', error)
      const errorMsg = error.message || 'Failed to export video'

      if (errorMsg.includes('CORS') || errorMsg.includes('cross-origin')) {
        toast.error('Video export failed due to CORS restrictions. The video file needs to allow cross-origin access. For now, please use the subtitle download options (SRT/VTT).', { duration: 8000 })
      } else {
        toast.error(`Export failed: ${errorMsg}. Client-side video export has limitations. Please try the subtitle file download options (SRT/VTT) instead.`, { duration: 6000 })
      }
    } finally {
      setExporting(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return
      }
      if (e.code === 'Space') {
        e.preventDefault()
        if (isPlaying) {
          handlePause()
        } else {
          handlePlay()
        }
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        handleSkip(-5)
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault()
        handleSkip(5)
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, handlePause, handlePlay, handleSkip, handleSave])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeFull = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isFeatureLocked = (premium: boolean) => {
    if (!premium) return false
    return !isPremium
  }

  return (
    <div className={`w-full bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl flex flex-col ${isFullscreen ? 'fixed inset-4 z-50' : 'h-[85vh] min-h-[600px]'}`}>
      {/* Sticky Header Toolbar */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 border-b border-neutral-700 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">Subtitle Editor</h2>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActivePanel('style')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${activePanel === 'style'
                  ? 'bg-subit-600 text-white shadow-md'
                  : 'bg-neutral-700/80 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Style</span>
                </div>
              </button>
              <button
                onClick={() => setActivePanel('edit')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${activePanel === 'edit'
                  ? 'bg-subit-600 text-white shadow-md'
                  : 'bg-neutral-700/80 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Edit Text</span>
                </div>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                title="Export video or subtitles"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-subit-200 shadow-xl z-20 py-2">
                    <button
                      onClick={() => { setShowExportMenu(false); handleExportVideo() }}
                      disabled={!isPro || exporting}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${!isPro ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-subit-50 text-gray-900'}`}
                      title={!isPro ? 'Video export requires Pro or Premium plan' : 'Export MP4 with subtitles'}
                    >
                      <Film className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium">{exporting ? 'Exporting...' : 'Export Video (MP4)'}</span>
                    </button>
                    <div className="px-4 pt-2 pb-1 text-[12px] text-neutral-500">Export Subtitles</div>
                    <button
                      onClick={() => { setShowExportMenu(false); handleDownloadSRT() }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-subit-50 transition-colors text-gray-900"
                    >
                      <FileText className="w-4 h-4 text-subit-500" />
                      <span className="text-sm font-medium">SRT</span>
                    </button>
                    <button
                      onClick={() => { setShowExportMenu(false); handleDownloadVTT() }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-subit-50 transition-colors text-gray-900"
                    >
                      <FileText className="w-4 h-4 text-subit-500" />
                      <span className="text-sm font-medium">VTT</span>
                    </button>
                    <button
                      onClick={() => { setShowExportMenu(false); handleDownloadTXT() }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-subit-50 transition-colors text-gray-900"
                    >
                      <FileText className="w-4 h-4 text-subit-500" />
                      <span className="text-sm font-medium">TXT</span>
                    </button>
                    <button
                      onClick={() => { setShowExportMenu(false); handleDownloadJSON() }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-subit-50 transition-colors text-gray-900"
                    >
                      <FileJson className="w-4 h-4 text-subit-500" />
                      <span className="text-sm font-medium">JSON</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-subit-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-subit-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 shadow-md"
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 sm:p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Flex Layout for Better Control */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 overflow-hidden min-h-0">
        {/* Video Preview - Left Side */}
        <div className="flex-[2] flex flex-col min-h-0 lg:min-w-0">
          <div
            className="bg-black rounded-xl overflow-hidden shadow-2xl relative flex-1 min-h-[200px]"
            style={{
              aspectRatio: videoAspectRatio ? `${videoAspectRatio}` : '16/9'
            }}
          >
            {isAudio ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-subit-700 to-subit-900">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-subit-500 to-subit-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Film className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-neutral-300 text-sm">Audio file - subtitles will appear in exported video</p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget
                    const canvas = canvasRef.current
                    if (canvas && video && video.videoWidth && video.videoHeight) {
                      canvas.width = video.videoWidth
                      canvas.height = video.videoHeight
                      // Calculate and set aspect ratio
                      const aspectRatio = video.videoWidth / video.videoHeight
                      setVideoAspectRatio(aspectRatio)
                    }
                  }}
                  muted={isMuted}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
                {/* Subtitle Overlay for Preview - Hidden as canvas handles rendering */}
              </>
            )}
          </div>

          {/* Video Controls */}
          <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
            {/* Timeline */}
            <div className="relative">
              <div
                ref={timelineRef}
                onClick={handleTimelineClick}
                className="h-2 bg-neutral-700 rounded-full cursor-pointer relative overflow-hidden"
              >
                <div
                  className="h-full bg-subit-600 rounded-full transition-all"
                  style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                />
                {/* Subtitle markers */}
                {editingSubtitles.map((sub, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 h-full w-0.5 bg-white/50"
                    style={{ left: `${(sub.start / videoDuration) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
                <span>{formatTimeFull(currentTime)}</span>
                <span>{formatTimeFull(videoDuration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSkip(-5)}
                  className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                  title="Skip back 5s"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="p-3 bg-subit-600 text-white rounded-full hover:bg-subit-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleSkip(5)}
                  className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                  title="Skip forward 5s"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleMute}
                  className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-subit-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel - Right Side */}
        <div className="flex-1 min-w-[280px] max-w-[400px] flex flex-col min-h-0 lg:max-h-full">
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {activePanel === 'style' ? (
              <StylePanel
                style={style}
                setStyle={setStyle}
                showAdvanced={showAdvanced}
                setShowAdvanced={setShowAdvanced}
                isPremium={isPremium}
                isPro={isPro}
              />
            ) : (
              <EditPanel
                subtitles={editingSubtitles}
                setSubtitles={setEditingSubtitles}
                currentTime={currentTime}
                activeSegment={activeSegment}
                onSeek={handleSeek}
                formatTime={formatTime}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimestampExport(seconds: number, format: 'srt' | 'vtt'): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  const sep = format === 'srt' ? ',' : '.'
  const pad = (num: number, size: number = 2) => String(num).padStart(size, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(ms, 3)}`
}

function downloadFileExport(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

function generateSRTExport(segments: Subtitle[]): string {
  return segments.map((seg, idx) => {
    const start = formatTimestampExport(seg.start, 'srt')
    const end = formatTimestampExport(seg.end, 'srt')
    return `${idx + 1}\n${start} --> ${end}\n${seg.text}\n`
  }).join('\n')
}

function generateVTTExport(segments: Subtitle[]): string {
  const lines = ['WEBVTT\n']
  segments.forEach((seg, idx) => {
    const start = formatTimestampExport(seg.start, 'vtt')
    const end = formatTimestampExport(seg.end, 'vtt')
    lines.push(`${idx + 1}\n${start} --> ${end}\n${seg.text}\n`)
  })
  return lines.join('\n')
}

function generateTXTExport(segments: Subtitle[]): string {
  return segments.map(seg => seg.text).join('\n\n')
}

function generateJSONExport(segments: Subtitle[]): string {
  return JSON.stringify({
    segments: segments.map(seg => ({
      start: seg.start,
      end: seg.end,
      text: seg.text
    }))
  }, null, 2)
}

function handleDownloadSRT(this: any) {
  // `this` not used; helper exists at module scope
}
function handleDownloadVTT(this: any) {}
function handleDownloadTXT(this: any) {}
function handleDownloadJSON(this: any) {}

// Style Panel Component
function StylePanel({
  style,
  setStyle,
  showAdvanced,
  setShowAdvanced,
  isPremium,
  isPro,
}: {
  style: SubtitleStyle
  setStyle: (style: SubtitleStyle) => void
  showAdvanced: boolean
  setShowAdvanced: (show: boolean) => void
  isPremium: boolean
  isPro: boolean
}) {
  // Style presets for quick selection
  const STYLE_PRESETS = [
    {
      name: 'Classic',
      emoji: '📝',
      style: { ...DEFAULT_STYLE, backgroundColor: '#000000', backgroundOpacity: 0.7, color: '#FFFFFF', fontFamily: 'Arial', outlineWidth: 0 }
    },
    {
      name: 'Modern',
      emoji: '✨',
      style: { ...DEFAULT_STYLE, backgroundColor: '#1a1a2e', backgroundOpacity: 0.85, color: '#FFFFFF', fontFamily: 'Poppins', borderRadius: 12 }
    },
    {
      name: 'Neon',
      emoji: '🌟',
      premium: true,
      style: { ...DEFAULT_STYLE, backgroundColor: 'transparent', backgroundOpacity: 0, color: '#00ff88', fontFamily: 'Montserrat', outlineColor: '#00ff88', outlineWidth: 1, glowIntensity: 15, glowColor: '#00ff88' }
    },
    {
      name: 'Minimal',
      emoji: '◻️',
      style: { ...DEFAULT_STYLE, backgroundColor: '#ffffff', backgroundOpacity: 0.9, color: '#000000', fontFamily: 'Inter', padding: 8, borderRadius: 4 }
    },
    {
      name: 'Cinematic',
      emoji: '🎬',
      premium: true,
      style: { ...DEFAULT_STYLE, backgroundColor: 'transparent', backgroundOpacity: 0, color: '#FFFFFF', fontFamily: 'Playfair Display', outlineWidth: 3, outlineColor: '#000000', shadowBlur: 10, shadowColor: '#000000' }
    },
    {
      name: 'Bold',
      emoji: '💪',
      style: { ...DEFAULT_STYLE, backgroundColor: '#ff4444', backgroundOpacity: 1, color: '#FFFFFF', fontFamily: 'Bebas Neue', fontSize: 28, padding: 16 }
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Style Settings
        </h3>

        {/* Style Presets */}
        <div className="mb-4">
          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-2">Quick Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  if (preset.premium && !isPro) return
                  setStyle({ ...style, ...preset.style })
                }}
                disabled={preset.premium && !isPro}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-xs ${preset.premium && !isPro
                    ? 'border-neutral-200 dark:border-neutral-700 opacity-50 cursor-not-allowed'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-subit-500 hover:bg-subit-50 dark:hover:bg-subit-900/20'
                  }`}
                title={preset.premium && !isPro ? 'Pro feature' : `Apply ${preset.name} style`}
              >
                <span className="text-base">{preset.emoji}</span>
                <span className="text-neutral-700 dark:text-neutral-300">{preset.name}</span>
                {preset.premium && !isPro && (
                  <span className="text-[8px] text-amber-500 font-medium">PRO</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Settings */}
        <div className="space-y-4 bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Font</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Font Family</label>
              <select
                value={style.fontFamily}
                onChange={(e) => setStyle({ ...style, fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Font Size: {style.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="72"
                value={style.fontSize}
                onChange={(e) => setStyle({ ...style, fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Font Weight</label>
              <select
                value={style.fontWeight}
                onChange={(e) => setStyle({ ...style, fontWeight: e.target.value as any })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
              >
                <option value="normal">Normal</option>
                <option value="600">Semi-Bold</option>
                <option value="bold">Bold</option>
                <option value="700">Extra Bold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4 bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Colors</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={style.color}
                  onChange={(e) => setStyle({ ...style, color: e.target.value })}
                  className="w-12 h-10 border border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={style.color}
                  onChange={(e) => setStyle({ ...style, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={style.backgroundColor}
                  onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                  className="w-12 h-10 border border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={style.backgroundColor}
                  onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Background Opacity: {Math.round(style.backgroundOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={style.backgroundOpacity}
                onChange={(e) => setStyle({ ...style, backgroundOpacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-4 bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Position</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Vertical Position</label>
              <div className="grid grid-cols-3 gap-2">
                {POSITION_OPTIONS.map(pos => (
                  <button
                    key={pos.value}
                    onClick={() => {
                      if (pos.premium && !isPremium) {
                        toast.error('Center position is available for Premium plans')
                        return
                      }
                      setStyle({ ...style, position: pos.value as any })
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${style.position === pos.value
                      ? 'bg-subit-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      } ${pos.premium && !isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={pos.premium && !isPremium}
                  >
                    {pos.premium && !isPremium && <Lock className="w-3 h-3 inline mr-1" />}
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Vertical Offset: {style.verticalOffset}px
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={style.verticalOffset}
                onChange={(e) => setStyle({ ...style, verticalOffset: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Text Align</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStyle({ ...style, textAlign: 'left' })}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${style.textAlign === 'left'
                    ? 'bg-subit-600 text-white border-subit-600'
                    : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                    }`}
                >
                  <AlignLeft className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setStyle({ ...style, textAlign: 'center' })}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${style.textAlign === 'center'
                    ? 'bg-subit-600 text-white border-subit-600'
                    : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                    }`}
                >
                  <AlignCenter className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setStyle({ ...style, textAlign: 'right' })}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${style.textAlign === 'right'
                    ? 'bg-subit-600 text-white border-subit-600'
                    : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                    }`}
                >
                  <AlignRight className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Display Mode */}
        <div className="space-y-4 bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Display Mode</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">How subtitles appear</label>
              <select
                value={style.displayMode}
                onChange={(e) => setStyle({ ...style, displayMode: e.target.value as any })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
              >
                <option value="line-by-line">Line by Line</option>
                <option value="multiple-lines">Multiple Lines (wrapped)</option>
                <option value="word-by-word">Word by Word</option>
                <option value="character-by-character">Character by Character</option>
              </select>
            </div>
            {style.displayMode === 'multiple-lines' && (
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Max Lines: {style.maxLines}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={style.maxLines}
                  onChange={(e) => setStyle({ ...style, maxLines: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Animation */}
        <div className="space-y-4 bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Animation</h4>
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Animation Type</label>
            <select
              value={style.animation}
              onChange={(e) => {
                const anim = e.target.value as any
                const option = ANIMATION_OPTIONS.find(o => o.value === anim)
                if (option && option.premium && !isPremium) {
                  toast.error('This animation is available for Premium plans')
                  return
                }
                setStyle({ ...style, animation: anim })
              }}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
            >
              {ANIMATION_OPTIONS.map(anim => (
                <option key={anim.value} value={anim.value} disabled={anim.premium && !isPremium}>
                  {anim.label} {anim.premium && !isPremium ? '🔒' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Outline Width: {style.outlineWidth}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={style.outlineWidth}
                  onChange={(e) => setStyle({ ...style, outlineWidth: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Outline Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={style.outlineColor}
                    onChange={(e) => setStyle({ ...style, outlineColor: e.target.value })}
                    className="w-12 h-10 border border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={style.outlineColor}
                    onChange={(e) => setStyle({ ...style, outlineColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Border Radius: {style.borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={style.borderRadius}
                  onChange={(e) => setStyle({ ...style, borderRadius: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Padding: {style.padding}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={style.padding}
                  onChange={(e) => setStyle({ ...style, padding: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Letter Spacing: {style.letterSpacing}px
                </label>
                <input
                  type="range"
                  min="-2"
                  max="5"
                  step="0.1"
                  value={style.letterSpacing}
                  onChange={(e) => setStyle({ ...style, letterSpacing: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Line Height: {style.lineHeight}
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={style.lineHeight}
                  onChange={(e) => setStyle({ ...style, lineHeight: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Effects Section - Premium */}
        <div className="space-y-4 bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              ✨ Effects
              {!isPro && (
                <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded font-medium">PRO</span>
              )}
            </h4>
          </div>

          {isPro ? (
            <div className="space-y-4">
              {/* Text Shadow */}
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-2">Text Shadow</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">Offset X: {style.shadowOffsetX ?? 0}px</label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      value={style.shadowOffsetX ?? 0}
                      onChange={(e) => setStyle({ ...style, shadowOffsetX: parseInt(e.target.value) })}
                      className="w-full accent-subit-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">Offset Y: {style.shadowOffsetY ?? 0}px</label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      value={style.shadowOffsetY ?? 2}
                      onChange={(e) => setStyle({ ...style, shadowOffsetY: parseInt(e.target.value) })}
                      className="w-full accent-subit-500"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-[10px] text-neutral-500 mb-1">Blur: {style.shadowBlur ?? 0}px</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={style.shadowBlur ?? 4}
                    onChange={(e) => setStyle({ ...style, shadowBlur: parseInt(e.target.value) })}
                    className="w-full accent-subit-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={style.shadowColor ?? '#000000'}
                    onChange={(e) => setStyle({ ...style, shadowColor: e.target.value })}
                    className="w-10 h-8 border border-neutral-300 dark:border-neutral-700 rounded cursor-pointer"
                  />
                  <span className="text-xs text-neutral-500">Shadow Color</span>
                </div>
              </div>

              {/* Glow Effect */}
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-2">Glow Effect</label>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">Intensity: {style.glowIntensity ?? 0}</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={style.glowIntensity ?? 0}
                    onChange={(e) => setStyle({ ...style, glowIntensity: parseInt(e.target.value) })}
                    className="w-full accent-subit-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={style.glowColor ?? '#FFFFFF'}
                    onChange={(e) => setStyle({ ...style, glowColor: e.target.value })}
                    className="w-10 h-8 border border-neutral-300 dark:border-neutral-700 rounded cursor-pointer"
                  />
                  <span className="text-xs text-neutral-500">Glow Color</span>
                </div>
              </div>

              {/* Background Blur */}
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Background Blur: {style.backgroundBlur ?? 0}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={style.backgroundBlur ?? 0}
                  onChange={(e) => setStyle({ ...style, backgroundBlur: parseInt(e.target.value) })}
                  className="w-full accent-subit-500"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-neutral-500 mb-2">Unlock shadows, glow, and blur effects</p>
              <a href="/pricing" className="text-xs text-subit-500 hover:text-subit-600 font-medium">
                Upgrade to Pro →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Edit Panel Component
function EditPanel({
  subtitles,
  setSubtitles,
  currentTime,
  activeSegment,
  onSeek,
  formatTime,
}: {
  subtitles: Subtitle[]
  setSubtitles: (subtitles: Subtitle[]) => void
  currentTime: number
  activeSegment: number | null
  onSeek: (time: number) => void
  formatTime: (seconds: number) => string
}) {
  const handleAddSubtitle = (index: number) => {
    const newSubtitles = [...subtitles]
    const prevSub = index >= 0 ? subtitles[index] : null
    const nextSub = index < subtitles.length - 1 ? subtitles[index + 1] : null

    let start = prevSub ? prevSub.end : (nextSub ? nextSub.start - 2 : currentTime)
    let end = nextSub ? nextSub.start : (prevSub ? prevSub.end + 2 : currentTime + 2)

    // Ensure valid time range
    if (start >= end) {
      end = start + 2
    }

    const newSub: Subtitle = {
      id: Date.now(),
      start,
      end,
      text: '',
    }

    newSubtitles.splice(index + 1, 0, newSub)
    setSubtitles(newSubtitles)
  }

  const handleRemoveSubtitle = (index: number) => {
    if (subtitles.length <= 1) {
      toast.error('Cannot remove the last subtitle')
      return
    }
    const newSubtitles = subtitles.filter((_, i) => i !== index)
    setSubtitles(newSubtitles)
  }

  const handleSplitSubtitle = (index: number) => {
    const sub = subtitles[index]
    const midpoint = (sub.start + sub.end) / 2
    const lines = sub.text.split('\n')

    if (lines.length > 1) {
      // Split by lines
      const newSubtitles = [...subtitles]
      newSubtitles[index] = { ...sub, text: lines[0], end: midpoint }
      newSubtitles.splice(index + 1, 0, {
        id: Date.now(),
        start: midpoint,
        end: sub.end,
        text: lines.slice(1).join('\n'),
      })
      setSubtitles(newSubtitles)
    } else {
      // Split by midpoint time
      const words = sub.text.split(' ')
      const midWord = Math.ceil(words.length / 2)
      const newSubtitles = [...subtitles]
      newSubtitles[index] = { ...sub, text: words.slice(0, midWord).join(' '), end: midpoint }
      newSubtitles.splice(index + 1, 0, {
        id: Date.now(),
        start: midpoint,
        end: sub.end,
        text: words.slice(midWord).join(' '),
      })
      setSubtitles(newSubtitles)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <Type className="w-5 h-5" />
        Edit Subtitles
      </h3>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {subtitles.map((subtitle, index) => {
          const isActive = activeSegment === index
          const isCurrent = currentTime >= subtitle.start && currentTime <= subtitle.end
          return (
            <div key={index} className="relative group">
              {/* Add button above */}
              {index === 0 && (
                <div className="flex justify-center mb-1">
                  <button
                    onClick={() => handleAddSubtitle(-1)}
                    className="p-1 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-subit-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Add subtitle at beginning"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
              {index > 0 && (
                <div className="flex justify-center mb-1">
                  <button
                    onClick={() => handleAddSubtitle(index - 1)}
                    className="p-1 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-subit-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Add subtitle above"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div
                className={`group p-3 rounded-lg border transition-all ${isCurrent
                  ? 'border-subit-500 bg-subit-50 dark:bg-subit-900/20 shadow-md'
                  : isActive
                    ? 'border-subit-300 dark:border-subit-500 bg-subit-50/50 dark:bg-subit-900/10'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-subit-300 dark:hover:border-subit-500'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    {formatTime(subtitle.start)} → {formatTime(subtitle.end)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSplitSubtitle(index)}
                      className="text-xs text-neutral-500 hover:text-subit-600 transition-colors p-1"
                      title="Split subtitle"
                    >
                      <Split className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onSeek(subtitle.start)}
                      className="text-xs text-subit-600 hover:text-subit-700 font-medium"
                    >
                      Jump
                    </button>
                  </div>
                </div>
                <textarea
                  value={subtitle.text}
                  onChange={(e) => {
                    const updated = [...subtitles]
                    updated[index].text = e.target.value
                    setSubtitles(updated)
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 resize-none text-sm"
                  rows={2}
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => handleRemoveSubtitle(index)}
                    disabled={subtitles.length <= 1}
                    className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove subtitle"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleAddSubtitle(index)}
                    className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-colors"
                    title="Add subtitle below"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
