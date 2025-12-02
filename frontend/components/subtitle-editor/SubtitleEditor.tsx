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
  Settings,
  Sparkles,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Move,
  Lock,
  Unlock,
  Zap
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
  const [activeTab, setActiveTab] = useState<'style' | 'edit' | 'export'>('style')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

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
    if (!isPlaying || !videoRef.current) return

    const drawSubtitles = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

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
  }, [isPlaying, editingSubtitles, style])

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
      videoRef.current.currentTime = time
      setCurrentTime(time)
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

      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) {
        throw new Error('Video or canvas not available')
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth || 1920
      canvas.height = video.videoHeight || 1080

      // Create MediaRecorder for video export
      const stream = canvas.captureStream(30) // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      })

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `subtitle-video-${Date.now()}.webm`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Video exported successfully!')
        setExporting(false)
      }

      // Start recording
      video.currentTime = 0
      await video.play()
      mediaRecorder.start()

      // Draw subtitles frame by frame
      const drawFrame = () => {
        if (video.ended || video.paused) {
          mediaRecorder.stop()
          video.pause()
          return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Draw active subtitle
        const activeSeg = editingSubtitles.find(
          s => video.currentTime >= s.start && video.currentTime <= s.end
        )

        if (activeSeg) {
          drawSubtitleOnCanvas(ctx, canvas, activeSeg.text, style)
        }

        requestAnimationFrame(drawFrame)
      }

      drawFrame()
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export video')
      setExporting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isFeatureLocked = (premium: boolean) => {
    if (!premium) return false
    return !isPremium
  }

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'bg-subit-50 dark:bg-subit-900/20 text-subit-600 dark:text-subit-400 border-b-2 border-subit-600'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Palette className="w-4 h-4" />
            <span>Style</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'edit'
              ? 'bg-subit-50 dark:bg-subit-900/20 text-subit-600 dark:text-subit-400 border-b-2 border-subit-600'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Type className="w-4 h-4" />
            <span>Edit</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'export'
              ? 'bg-subit-50 dark:bg-subit-900/20 text-subit-600 dark:text-subit-400 border-b-2 border-subit-600'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </div>
        </button>
      </div>

      <div className="p-6">
        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-neutral-900 rounded-lg p-8 relative overflow-hidden" style={{ minHeight: '200px' }}>
              {isAudio ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Film className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-neutral-400 text-sm">Audio preview - subtitles will appear in exported video</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget
                      const canvas = canvasRef.current
                      if (canvas && video) {
                        canvas.width = video.videoWidth || 1920
                        canvas.height = video.videoHeight || 1080
                      }
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              )}
              {activeSegment !== null && editingSubtitles[activeSegment] && (
                <div
                  ref={previewRef}
                  className="absolute pointer-events-none"
                  style={{
                    fontFamily: style.fontFamily,
                    fontSize: `${style.fontSize}px`,
                    fontWeight: style.fontWeight,
                    color: style.color,
                    textAlign: style.textAlign,
                    left: style.position === 'center' ? '50%' : style.horizontalOffset !== 0 ? `${50 + style.horizontalOffset / 10}%` : '50%',
                    top: style.position === 'top' ? `${style.verticalOffset}px` : style.position === 'center' ? '50%' : 'auto',
                    bottom: style.position === 'bottom' ? `${style.verticalOffset}px` : 'auto',
                    transform: style.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
                    backgroundColor: style.backgroundColor,
                    opacity: style.backgroundOpacity,
                    padding: `${style.padding}px`,
                    borderRadius: `${style.borderRadius}px`,
                    textShadow: `${style.outlineWidth}px ${style.outlineWidth}px 0 ${style.outlineColor}, -${style.outlineWidth}px -${style.outlineWidth}px 0 ${style.outlineColor}, ${style.outlineWidth}px -${style.outlineWidth}px 0 ${style.outlineColor}, -${style.outlineWidth}px ${style.outlineWidth}px 0 ${style.outlineColor}`,
                    letterSpacing: `${style.letterSpacing}px`,
                    lineHeight: style.lineHeight,
                  }}
                >
                  {editingSubtitles[activeSegment].text}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Font Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Font Settings
                </h3>
                
                <div>
                  <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Font Family</label>
                  <select
                    value={style.fontFamily}
                    onChange={(e) => setStyle({ ...style, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="normal">Normal</option>
                    <option value="600">Semi-Bold</option>
                    <option value="bold">Bold</option>
                    <option value="700">Extra Bold</option>
                  </select>
                </div>
              </div>

              {/* Color Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Colors
                </h3>
                
                <div>
                  <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={style.color}
                      onChange={(e) => setStyle({ ...style, color: e.target.value })}
                      className="w-16 h-10 border border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={style.color}
                      onChange={(e) => setStyle({ ...style, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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
                      className="w-16 h-10 border border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={style.backgroundColor}
                      onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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

              {/* Position Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Position
                </h3>
                
                <div>
                  <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Vertical Position</label>
                  <div className="flex gap-2">
                    {POSITION_OPTIONS.map(pos => (
                      <button
                        key={pos.value}
                        onClick={() => {
                          if (isFeatureLocked(pos.premium)) {
                            toast.error('Center position is available for Premium plans')
                            return
                          }
                          setStyle({ ...style, position: pos.value as any })
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                          style.position === pos.value
                            ? 'bg-subit-600 text-white border-subit-600'
                            : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                        } ${isFeatureLocked(pos.premium) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isFeatureLocked(pos.premium)}
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
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      <AlignLeft className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setStyle({ ...style, textAlign: 'center' })}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                        style.textAlign === 'center'
                          ? 'bg-subit-600 text-white border-subit-600'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      <AlignCenter className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setStyle({ ...style, textAlign: 'right' })}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                        style.textAlign === 'right'
                          ? 'bg-subit-600 text-white border-subit-600'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      <AlignRight className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Animation Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Animation
                </h3>
                
                <div>
                  <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Animation Type</label>
                  <select
                    value={style.animation}
                    onChange={(e) => {
                      const anim = e.target.value as any
                      const option = ANIMATION_OPTIONS.find(o => o.value === anim)
                      if (option && isFeatureLocked(option.premium)) {
                        toast.error('This animation is available for Premium plans')
                        return
                      }
                      setStyle({ ...style, animation: anim })
                    }}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    {ANIMATION_OPTIONS.map(anim => (
                      <option key={anim.value} value={anim.value} disabled={isFeatureLocked(anim.premium)}>
                        {anim.label} {anim.premium && !isPremium ? '🔒' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    Animation Duration: {style.animationDuration}s
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={style.animationDuration}
                    onChange={(e) => setStyle({ ...style, animationDuration: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </button>
              
              {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
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
                        className="w-16 h-10 border border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={style.outlineColor}
                        onChange={(e) => setStyle({ ...style, outlineColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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
        )}

        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {editingSubtitles.map((subtitle, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-colors ${
                  activeSegment === index
                    ? 'border-subit-500 bg-subit-50 dark:bg-subit-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    {formatTime(subtitle.start)} → {formatTime(subtitle.end)}
                  </span>
                  <button
                    onClick={() => handleSeek(subtitle.start)}
                    className="text-xs text-subit-600 hover:text-subit-700"
                  >
                    Jump to
                  </button>
                </div>
                <textarea
                  value={subtitle.text}
                  onChange={(e) => {
                    const updated = [...editingSubtitles]
                    updated[index].text = e.target.value
                    setEditingSubtitles(updated)
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 resize-none"
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-subit-50 to-subit-100 dark:from-subit-900/20 dark:to-subit-800/20 rounded-lg p-6 border border-subit-200 dark:border-subit-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Export Options</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Choose how you want to export your subtitles
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleExportVideo}
                  disabled={exporting || !isPro}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isPro
                      ? 'border-subit-500 bg-white dark:bg-neutral-800 hover:bg-subit-50 dark:hover:bg-subit-900/20 cursor-pointer'
                      : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isPro ? 'bg-subit-100 dark:bg-subit-900' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                      <Film className={`w-5 h-5 ${isPro ? 'text-subit-600' : 'text-neutral-500'}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">Export Video</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {isPro ? 'Video with burned-in subtitles' : 'Pro/Premium only'}
                      </div>
                    </div>
                    {!isPro && <Lock className="w-4 h-4 text-neutral-400 ml-auto" />}
                  </div>
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-4 rounded-lg border-2 border-subit-500 bg-white dark:bg-neutral-800 hover:bg-subit-50 dark:hover:bg-subit-900/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-subit-100 dark:bg-subit-900">
                      <Save className="w-5 h-5 text-subit-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {saving ? 'Saving...' : 'Save Style'}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Save subtitles and style settings
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {!isPro && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        Upgrade to Pro or Premium
                      </div>
                      <div className="text-sm text-amber-700 dark:text-amber-300">
                        Unlock video export with burned-in subtitles and advanced animations
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

