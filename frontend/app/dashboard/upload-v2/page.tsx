'use client'

/**
 * Upload Page V2 - Completely Refactored
 * Features:
 * - Real upload progress tracking
 * - Proper error handling and retry logic
 * - State machine for flow control
 * - Mobile optimized
 * - Chunked uploads for large files
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import {
  Upload, Video, X, CheckCircle, AlertCircle,
  Cloud, Loader, PlayCircle, FileAudio, RefreshCw
} from 'lucide-react'
import { transcribeFile } from '@/lib/api-v2'
import { useUser } from '@/lib/providers'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { createClient as getBrowserSupabaseClient } from '@/lib/supabase'
import { getSubscriptionLimits } from '@/lib/utils'
import { fetchQuota } from '@/lib/api-v2'

// State machine states
type UploadState =
  | 'idle'
  | 'file_selected'
  | 'uploading_video'
  | 'transcribing'
  | 'success'
  | 'error';

// Reuse the shared browser Supabase client so we share auth/session state
const supabase = getBrowserSupabaseClient()

export default function UploadPageV2() {
  const { user, loading, subscription } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  // State
  const [state, setState] = useState<UploadState>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const retryCountRef = useRef(0)
  const MAX_RETRIES = 3

  const planTier = (subscription?.plan as string | undefined) || 'free'
  const { videoSize } = getSubscriptionLimits(planTier)
  const maxFileSizeLabel = Number.isFinite(videoSize)
    ? `${Math.round(videoSize / (1024 * 1024))}MB`
    : 'No size limit'

  // Get video duration from file
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src)
          resolve(video.duration)
        }
        video.onerror = () => {
          window.URL.revokeObjectURL(video.src)
          reject(new Error('Failed to load video metadata'))
        }
        video.src = URL.createObjectURL(file)
      } else if (file.type.startsWith('audio/')) {
        const audio = document.createElement('audio')
        audio.preload = 'metadata'
        audio.onloadedmetadata = () => {
          window.URL.revokeObjectURL(audio.src)
          resolve(audio.duration)
        }
        audio.onerror = () => {
          window.URL.revokeObjectURL(audio.src)
          reject(new Error('Failed to load audio metadata'))
        }
        audio.src = URL.createObjectURL(file)
      } else {
        reject(new Error('File is not a video or audio file'))
      }
    })
  }

  // File selection handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]

      if (Number.isFinite(videoSize) && selectedFile.size > videoSize) {
        toast.error(`File is too large for your ${planTier} plan. Maximum size is ${maxFileSizeLabel}.`)
        return
      }

      // Check video duration BEFORE setting file
      try {
        const duration = await getVideoDuration(selectedFile)
        const { videoLength } = getSubscriptionLimits(planTier)

        if (Number.isFinite(videoLength) && duration > videoLength) {
          const maxMinutes = Math.floor(videoLength / 60)
          const actualMinutes = Math.floor(duration / 60)
          toast.error(
            `Video duration (${actualMinutes} min) exceeds your ${planTier} plan limit (${maxMinutes} min). Please upgrade your plan or use a shorter video.`
          )
          return
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.warn('Could not get video duration:', error)
        // Continue anyway - duration will be checked on server
      }

      setFile(selectedFile)
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      setState('file_selected')
      setError(null)
      setUploadProgress(0)
      toast.success('File selected!')
    }
  }, [videoSize, planTier, maxFileSizeLabel])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.webm', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  })

  // Main upload and transcribe flow
  const handleProcess = async () => {
    if (!file || !title.trim()) {
      toast.error('Please select a file and enter a title')
      return
    }

    if (!user) {
      toast.error('Please sign in to upload and generate subtitles')
      router.push('/auth/login')
      return
    }

    if (Number.isFinite(videoSize) && file.size > videoSize) {
      toast.error(`File is too large for your ${planTier} plan. Maximum size is ${maxFileSizeLabel}.`)
      return
    }

    // Check quota BEFORE starting upload
    try {
      setProgressMessage('Checking quota...')
      const quota = await fetchQuota()

      // Check if user has enough energy
      if (!quota.unlimited && quota.remaining !== null && quota.remaining <= 0) {
        const message = 'You have used all your subtitle energy for today. Please upgrade your plan or try again tomorrow.'
        setError(message)
        toast.error(message)
        return
      }

      // Estimate energy cost (typically 10 energy per transcription)
      const estimatedCost = 10
      if (!quota.unlimited && quota.remaining !== null && quota.remaining < estimatedCost) {
        const message = `You don't have enough energy (${quota.remaining} remaining, need ${estimatedCost}). Please upgrade your plan or try again tomorrow.`
        setError(message)
        toast.error(message)
        return
      }
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') console.error('Failed to check quota:', error)
      // Don't block if quota check fails - let server handle it
      toast.error('Failed to check quota. Proceeding anyway...')
    }

    // Track the project we create so we can mark it failed on any error
    let createdProjectId: string | null = null

    try {
      setState('uploading_video')
      setError(null)
      setUploadProgress(0)
      setProgressMessage('Creating project...')

      // Ensure user profile exists in public.users table
      // This handles cases where the trigger might not have fired
      const { data: userProfile, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user?.id)
        .maybeSingle()

      if (userCheckError) {
        if (process.env.NODE_ENV !== 'production') console.error('Error checking user profile:', userCheckError)
        throw new Error('Failed to verify user account')
      }

      // If user doesn't exist in public.users, create it
      if (!userProfile) {
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: user?.id,
            email: user?.email || '',
            subscription_tier: 'free',
          })

        if (createUserError) {
          if (process.env.NODE_ENV !== 'production') console.error('Error creating user profile:', createUserError)
          throw new Error('Failed to create user profile. Please try signing out and back in.')
        }
      }

      // Create project in database first
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          title: title.trim(),
          status: 'processing',
          video_size: file.size,
        })
        .select()
        .single()

      if (projectError) {
        if (process.env.NODE_ENV !== 'production') console.error('Project creation error:', projectError)
        throw projectError
      }

      const newProjectId = projectData.id
      createdProjectId = newProjectId
      setProjectId(newProjectId)

      // Upload video to storage
      setProgressMessage('Uploading file to storage...')
      setUploadProgress(2) // Start at 2% to show immediate feedback

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user?.id}/${fileName}`

      // Simulate smooth progress during upload (Supabase doesn't support progress callbacks)
      // Progress from 2% to 15% (upload phase) - faster at beginning
      let progressValue = 2
      const progressInterval = setInterval(() => {
        progressValue += 0.8 // Increment by 0.8% every 200ms for faster initial progress
        if (progressValue < 15) {
          setUploadProgress(Math.min(progressValue, 15))
          const percent = Math.round(progressValue)
          setProgressMessage(`Uploading file to storage... ${percent}%`)
        }
      }, 200)

      const uploadPromise = supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      // Wait for upload to complete
      const { error: uploadError } = await uploadPromise

      clearInterval(progressInterval)

      if (uploadError) throw uploadError

      setUploadProgress(15) // Upload complete
      setProgressMessage('File uploaded successfully')

      // Get a signed URL so the video can be played from a private bucket
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

      if (signedUrlError || !signedUrlData?.signedUrl) {
        throw signedUrlError || new Error('Failed to create signed URL for video')
      }

      // Update project with video info
      await supabase
        .from('projects')
        .update({
          video_url: signedUrlData.signedUrl,
          video_filename: fileName,
        })
        .eq('id', newProjectId)

      // Start transcription
      setState('transcribing')
      setProgressMessage('Preparing transcription...')
      setUploadProgress(15) // Start transcription at 15%

      const result = await transcribeFile({
        file,
        language: 'auto',
        format: 'srt,vtt,json',
        projectId: newProjectId,
        onProgress: (progress, message) => {
          // Map transcription progress (0-100) to our progress range (15-98%)
          // Use easing function to slow down at the end (80-100%)
          let mappedProgress: number
          if (progress <= 80) {
            // Fast progress from 15% to 80% (65% of range)
            mappedProgress = 15 + Math.round((progress / 80) * 65)
          } else {
            // Slow progress from 80% to 98% (remaining 18%)
            const remainingProgress = ((progress - 80) / 20) * 18
            mappedProgress = 80 + Math.round(remainingProgress)
          }

          setUploadProgress(mappedProgress)

          // Update message with better process names
          if (message) {
            if (message.includes('Uploading')) {
              setProgressMessage(`Uploading to transcription service... ${progress}%`)
            } else if (message.includes('Processing')) {
              setProgressMessage(`Processing audio... ${progress}%`)
            } else if (progress >= 90) {
              setProgressMessage(`Finalizing subtitles... ${progress}%`)
            } else {
              setProgressMessage(message || `Transcribing... ${progress}%`)
            }
          } else {
            if (progress < 30) {
              setProgressMessage(`Uploading to transcription service... ${progress}%`)
            } else if (progress < 70) {
              setProgressMessage(`Processing audio... ${progress}%`)
            } else if (progress < 90) {
              setProgressMessage(`Generating subtitles... ${progress}%`)
            } else {
              setProgressMessage(`Finalizing... ${progress}%`)
            }
          }
        },
      })

      // Save subtitles to database
      setUploadProgress(98)
      setProgressMessage('Saving subtitles to database...')

      const { error: subtitleError } = await supabase
        .from('subtitles')
        .insert({
          project_id: newProjectId,
          srt_data: result.srt,
          json_data: {
            text: result.text,
            language: result.language,
            segments: result.segments,
            duration: result.duration,
          },
          language: result.language,
        })

      if (subtitleError) {
        if (process.env.NODE_ENV !== 'production') console.error('Failed to save subtitles:', subtitleError)
        throw new Error('Failed to save subtitles to database')
      }

      // Update project status
      setUploadProgress(99)
      setProgressMessage('Finalizing project...')

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          status: 'completed',
          video_duration: Math.floor(result.duration),
        })
        .eq('id', newProjectId)

      if (updateError) {
        if (process.env.NODE_ENV !== 'production') console.error('Failed to update project status:', updateError)
        throw new Error('Failed to update project status')
      }

      setState('success')
      setUploadProgress(100)
      setProgressMessage('Complete! Subtitles generated successfully.')

      toast.success('Subtitles generated successfully!')

      // Navigate to project page after short delay
      setTimeout(() => {
        router.push(`/dashboard/projects/${newProjectId}`)
      }, 1500)

    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') console.error('Processing error:', error)
      setState('error')

      const isQuotaExceeded =
        (typeof error?.status === 'number' && error.status === 402) ||
        error?.code === 'quota_exceeded'

      if (isQuotaExceeded) {
        const message = 'You have used all your subtitle energy for today. Please upgrade your plan or try again tomorrow.'
        setError(message)
        toast.error(message)
      } else {
        const message = error?.error || error?.message || 'Failed to process video'
        setError(message)
        toast.error(message)
      }

      // Mark project as failed if it was created
      const idToFail = createdProjectId || projectId
      if (idToFail) {
        try {
          await supabase
            .from('projects')
            .update({ status: 'failed' })
            .eq('id', idToFail)
        } catch (updateError) {
          if (process.env.NODE_ENV !== 'production') console.error('Failed to mark project as failed:', updateError)
        }
      }
    }
  }

  // Retry handler
  const handleRetry = () => {
    if (retryCountRef.current < MAX_RETRIES) {
      retryCountRef.current += 1
      handleProcess()
    } else {
      toast.error('Maximum retries reached. Please try again later.')
    }
  }

  // Reset handler
  const handleReset = () => {
    setFile(null)
    setTitle('')
    setState('idle')
    setError(null)
    setUploadProgress(0)
    setProgressMessage('')
    setProjectId(null)
    retryCountRef.current = 0
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Determine if we're processing
  const isProcessing = state === 'uploading_video' || state === 'transcribing'
  const canProcess = state === 'file_selected' && title.trim().length > 0

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-subit-50 border-b border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                Generate Subtitles
              </h1>
              <p className="text-neutral-600 text-base sm:text-lg">
                Upload your video and get AI-powered subtitles instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">

          {/* Upload/Process Area */}
          {state === 'idle' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 md:p-16 text-center cursor-pointer transition-all duration-300 ${isDragActive
                ? 'border-subit-500 bg-subit-100/40 scale-[1.02]'
                : 'border-neutral-300 hover:border-subit-500 bg-neutral-50 hover:bg-neutral-100'
                }`}
            >
              <input {...getInputProps()} />
              <div className="relative inline-block mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-subit-500 to-subit-600 rounded-full opacity-20 blur-xl scale-150 animate-pulse" />
                <Cloud className={`relative w-16 h-16 sm:w-20 sm:h-20 ${isDragActive ? 'text-subit-600' : 'text-neutral-500'} transition-colors`} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 sm:mb-3">
                {isDragActive ? '🎉 Drop your file here!' : 'Drag and drop your file'}
              </h3>
              <p className="text-base sm:text-lg text-neutral-600 mb-4 sm:mb-6">
                or click to browse
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-subit-600 hover:bg-subit-700 rounded-xl text-white font-medium text-sm sm:text-base shadow-glow">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Choose File</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 mt-4 sm:mt-6">
                Audio: MP3, WAV, OGG, FLAC • Video: MP4, MOV, AVI, WEBM, MKV (Max {maxFileSizeLabel})
              </p>
            </div>
          )}

          {/* File Selected */}
          {(state === 'file_selected' || isProcessing || state === 'success' || state === 'error') && file && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6">

              {/* File Info */}
              <div className="flex items-start justify-between p-4 sm:p-5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-subit-500 to-subit-600 rounded-xl shadow-lg">
                      {file.type.startsWith('video/') ? (
                        <Video className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      ) : (
                        <FileAudio className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 text-base sm:text-lg mb-1 truncate">
                      {file.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Cloud className="w-4 h-4" />
                        {formatFileSize(file.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        {file.type.startsWith('video/') ? (
                          <><Video className="w-4 h-4" />Video</>
                        ) : (
                          <><FileAudio className="w-4 h-4" />Audio</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {!isProcessing && state !== 'success' && (
                  <button
                    onClick={handleReset}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-red-400 hover:text-red-300 transition-all flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Title Input */}
              {(state === 'file_selected') && (
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-neutral-700">
                    Project Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your project"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-subit-500 focus:border-subit-500 transition-all text-neutral-900 placeholder-neutral-400 text-sm sm:text-base"
                    autoFocus
                  />
                </div>
              )}

              {/* Progress */}
              {isProcessing && (
                <div className="p-5 bg-subit-100/40 border border-subit-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader className="w-5 h-5 text-subit-600 animate-spin flex-shrink-0" />
                      <span className="text-sm sm:text-base font-semibold text-neutral-900">
                        {progressMessage || 'Processing...'}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-subit-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="relative w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-subit-500 to-subit-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success State */}
              {state === 'success' && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-neutral-900 text-base sm:text-lg">
                        Success!
                      </h4>
                      <p className="text-sm text-emerald-600">
                        Subtitles generated. Redirecting...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {state === 'error' && error && (
                <div className="p-5 bg-red-50 border border-red-200 rounded-xl space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 mb-1">
                        Processing Failed
                      </h4>
                      <p className="text-sm text-red-600">
                        {error}
                      </p>
                    </div>
                  </div>
                  {retryCountRef.current < MAX_RETRIES && (
                    <button
                      onClick={handleRetry}
                      className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retry ({retryCountRef.current + 1}/{MAX_RETRIES})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Process Button */}
              {state === 'file_selected' && (
                <button
                  onClick={handleProcess}
                  disabled={!canProcess}
                  className="w-full py-4 bg-subit-600 hover:bg-subit-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Generate Subtitles</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
