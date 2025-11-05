'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  subtitleSegments?: Array<{ start: number; end: number; text: string }>
  currentTime?: number
  onTimeUpdate?: (time: number) => void
  className?: string
}

export function VideoPlayer({ 
  src, 
  subtitleSegments = [], 
  currentTime: controlledTime,
  onTimeUpdate,
  className = '' 
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [showControls, setShowControls] = React.useState(true)

  const time = controlledTime !== undefined ? controlledTime : currentTime

  // Get current subtitle
  const currentSubtitle = subtitleSegments.find(
    segment => time >= segment.start && time <= segment.end
  )

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      const current = video.currentTime
      setCurrentTime(current)
      onTimeUpdate?.(current)
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', () => setDuration(video.duration))

    return () => {
      video.removeEventListener('timeupdate', updateTime)
    }
  }, [onTimeUpdate])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (controlledTime !== undefined) {
      video.currentTime = controlledTime
    }
  }, [controlledTime])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false))
    } else {
      video.pause()
    }
  }, [isPlaying])

  const togglePlay = () => setIsPlaying(!isPlaying)
  const toggleMute = () => setIsMuted(m => !m)
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      videoRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden bg-black ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        muted={isMuted}
        className="w-full h-full"
        onClick={togglePlay}
      />

      {/* Current subtitle overlay */}
      {currentSubtitle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center px-6 py-3 bg-black/80 backdrop-blur-sm rounded-xl"
        >
          <span className="text-white text-lg font-medium">
            {currentSubtitle.text}
          </span>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
      >
        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-subit-500"
              initial={{ width: 0 }}
              animate={{ width: `${(time / duration) * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="text-white hover:text-subit-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
              className="text-white hover:text-subit-400 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </motion.button>

            <span className="text-white text-sm font-mono">
              {formatTime(time)} / {formatTime(duration)}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="text-white hover:text-subit-400 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6" />
            ) : (
              <Maximize className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

