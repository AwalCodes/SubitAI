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
  VolumeX
} from 'lucide-react'
import toast from 'react-hot-toast'

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
  animation: 'none' | 'fade' | 'slide' | 'typewriter' | 'bounce' | 'glow'
  animationDuration: number
  outlineColor: string
  outlineWidth: number
  borderRadius: number
  padding: number
  letterSpacing: number
  lineHeight: number
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
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Lato', label: 'Lato' },
]

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'None', premium: false },
  { value: 'fade', label: 'Fade In', premium: false },
  { value: 'slide', label: 'Slide Up', premium: true },
  { value: 'typewriter', label: 'Typewriter', premium: true },
  { value: 'bounce', label: 'Bounce', premium: true },
  { value: 'glow', label: 'Glow', premium: true },
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
  const [style, setStyle] = useState<SubtitleStyle>(savedStyle || DEFAULT_STYLE)
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
      setCurrentTime(mediaElement.currentTime)
      const segIdx = editingSubtitles.findIndex(
        s => mediaElement.currentTime >= s.start && mediaElement.currentTime <= s.end
      )
      setActiveSegment(segIdx >= 0 ? segIdx : null)
    }

    const interval = setInterval(updateTime, 100)
    return () => clearInterval(interval)
  }, [editingSubtitles])

  useEffect(() => {
    if (!isPlaying || !videoRef.current || isAudio) return

    const drawSubtitles = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video || video.readyState < 2) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Ensure canvas matches video dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 1920
        canvas.height = video.videoHeight || 1080
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const activeSeg = editingSubtitles.find(
        s => video.currentTime >= s.start && video.currentTime <= s.end
      )

      if (activeSeg) {
        drawSubtitleOnCanvas(ctx, canvas, activeSeg.text, style)
      }

      animationFrameRef.current = requestAnimationFrame(drawSubtitles)
    }

    drawSubtitles()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, editingSubtitles, style, isAudio])

  const drawSubtitleOnCanvas = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string,
    style: SubtitleStyle
  ) => {
    ctx.save()

    // Set font
    ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}, sans-serif`
    ctx.textAlign = style.textAlign
    ctx.textBaseline = 'middle'

    // Calculate position
    let x = canvas.width / 2
    let y = canvas.height - style.verticalOffset

    if (style.position === 'center') {
      y = canvas.height / 2
    } else if (style.position === 'top') {
      y = style.verticalOffset
    }

    x += style.horizontalOffset

    // Measure text
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const textHeight = style.fontSize * style.lineHeight

    // Draw background
    if (style.backgroundColor && style.backgroundOpacity > 0) {
      ctx.fillStyle = style.backgroundColor
      ctx.globalAlpha = style.backgroundOpacity
      const bgX = x - textWidth / 2 - style.padding
      const bgY = y - textHeight / 2 - style.padding
      const bgWidth = textWidth + style.padding * 2
      const bgHeight = textHeight + style.padding * 2

      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(bgX, bgY, bgWidth, bgHeight, style.borderRadius)
      } else {
        // Fallback for browsers that don't support roundRect
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

    // Draw text outline
    if (style.outlineWidth > 0) {
      ctx.strokeStyle = style.outlineColor
      ctx.lineWidth = style.outlineWidth
      ctx.globalAlpha = 1
      ctx.strokeText(text, x, y)
    }

    // Draw text
    ctx.fillStyle = style.color
    ctx.globalAlpha = 1
    ctx.fillText(text, x, y)

    ctx.restore()
  }

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, videoDuration))
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const time = percentage * videoDuration
    handleSeek(time)
  }

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      handleSeek(videoRef.current.currentTime + seconds)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol
      setIsMuted(vol === 0)
    }
  }

  const handleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(editingSubtitles, style)
      toast.success('Subtitles and style saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleExportVideo = async () => {
    if (!isPro) {
      toast.error('Video export is available for Pro and Premium plans')
      return
    }

    try {
      setExporting(true)
      toast.loading('Exporting video with subtitles... This may take a while.')

      // Use API endpoint for video export
      const response = await fetch('/api/export-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          subtitles: editingSubtitles,
          style,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.comingSoon) {
          toast.error('Video export is coming soon! Please use the download options for subtitle files in the meantime.', { duration: 5000 })
        } else {
          throw new Error(data.error || 'Export failed')
        }
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subtitle-video-${Date.now()}.mp4`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Video exported successfully!')
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export video. Please try again later.')
    } finally {
      setExporting(false)
    }
  }

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
    <div className={`w-full bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xl ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 border-b border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Subtitle Editor</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePanel('style')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePanel === 'style'
                    ? 'bg-subit-600 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Style</span>
                </div>
              </button>
              <button
                onClick={() => setActivePanel('edit')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePanel === 'edit'
                    ? 'bg-subit-600 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <span>Edit Text</span>
                </div>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-subit-600 text-white rounded-lg font-medium hover:bg-subit-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Video Preview - Left Side (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-lg overflow-hidden shadow-2xl relative" style={{ aspectRatio: '16/9' }}>
            {isAudio ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-violet-900 to-fuchsia-900">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
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
                    }
                  }}
                  volume={volume}
                  muted={isMuted}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: '100%', height: '100%' }}
                />
                {/* Subtitle Overlay for Preview */}
                {activeSegment !== null && editingSubtitles[activeSegment] && (
                  <div
                    ref={previewRef}
                    className="absolute pointer-events-none z-10"
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: `clamp(16px, ${style.fontSize * 0.8}px, 48px)`,
                      fontWeight: style.fontWeight,
                      color: style.color,
                      textAlign: style.textAlign,
                      left: style.position === 'center' ? '50%' : style.horizontalOffset !== 0 ? `${50 + style.horizontalOffset / 10}%` : '50%',
                      top: style.position === 'top' ? `${style.verticalOffset * 0.8}px` : style.position === 'center' ? '50%' : 'auto',
                      bottom: style.position === 'bottom' ? `${style.verticalOffset * 0.8}px` : 'auto',
                      transform: style.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
                      backgroundColor: style.backgroundColor,
                      opacity: style.backgroundOpacity,
                      padding: `${style.padding * 0.8}px`,
                      borderRadius: `${style.borderRadius * 0.8}px`,
                      textShadow: `${style.outlineWidth}px ${style.outlineWidth}px 0 ${style.outlineColor}, -${style.outlineWidth}px -${style.outlineWidth}px 0 ${style.outlineColor}, ${style.outlineWidth}px -${style.outlineWidth}px 0 ${style.outlineColor}, -${style.outlineWidth}px ${style.outlineWidth}px 0 ${style.outlineColor}`,
                      letterSpacing: `${style.letterSpacing}px`,
                      lineHeight: style.lineHeight,
                      maxWidth: '90%',
                    }}
                  >
                    {editingSubtitles[activeSegment].text}
                  </div>
                )}
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

              <div className="flex items-center gap-3">
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
                  className="w-24"
                />
              </div>

              <button
                onClick={handleExportVideo}
                disabled={exporting || !isPro}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isPro
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{exporting ? 'Exporting...' : 'Export Video'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls Panel - Right Side (1/3 width) */}
        <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
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
  )
}

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
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Style Settings
        </h3>

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
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      style.position === pos.value
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
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    style.textAlign === 'left'
                      ? 'bg-subit-600 text-white border-subit-600'
                      : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  <AlignLeft className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setStyle({ ...style, textAlign: 'center' })}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    style.textAlign === 'center'
                      ? 'bg-subit-600 text-white border-subit-600'
                      : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  <AlignCenter className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setStyle({ ...style, textAlign: 'right' })}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    style.textAlign === 'right'
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
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all ${
                isCurrent
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
                <button
                  onClick={() => onSeek(subtitle.start)}
                  className="text-xs text-subit-600 hover:text-subit-700 font-medium"
                >
                  Jump
                </button>
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
