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
import { createClient } from '@supabase/supabase-js'

// State machine states
type UploadState = 
  | 'idle' 
  | 'file_selected' 
  | 'uploading_video' 
  | 'transcribing' 
  | 'success' 
  | 'error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UploadPageV2() {
  const { user } = useUser()
  const router = useRouter()
  
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

  // File selection handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      setState('file_selected')
      setError(null)
      setUploadProgress(0)
      toast.success('File selected!')
    }
  }, [])

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

    try {
      setState('uploading_video')
      setError(null)
      setUploadProgress(0)
      setProgressMessage('Creating project...')

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

      if (projectError) throw projectError

      const newProjectId = projectData.id
      setProjectId(newProjectId)

      // Upload video to storage
      setProgressMessage('Uploading video...')
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user?.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

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
      setProgressMessage('Analyzing audio...')

      const result = await transcribeFile({
        file,
        language: 'auto',
        format: 'srt,vtt,json',
        onProgress: (progress, message) => {
          setUploadProgress(progress)
          if (message) setProgressMessage(message)
        },
      })

      // Save subtitles to database
      await supabase
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

      // Update project status
      await supabase
        .from('projects')
        .update({
          status: 'completed',
          video_duration: Math.floor(result.duration),
        })
        .eq('id', newProjectId)

      setState('success')
      setUploadProgress(100)
      setProgressMessage('Complete!')
      
      toast.success('Subtitles generated successfully!')
      
      // Navigate to project page after short delay
      setTimeout(() => {
        router.push(`/dashboard/projects/${newProjectId}`)
      }, 1500)

    } catch (error: any) {
      console.error('Processing error:', error)
      setState('error')
      setError(error.error || error.message || 'Failed to process video')
      
      // Mark project as failed if it was created
      if (projectId) {
        await supabase
          .from('projects')
          .update({ status: 'failed' })
          .eq('id', projectId)
      }

      toast.error(error.error || error.message || 'Processing failed')
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-subit-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-subit-600 via-subit-500 to-subit-400 border-b border-subit-300/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                Generate Subtitles
              </h1>
              <p className="text-subit-50 text-base sm:text-lg">
                Upload your video and get AI-powered subtitles instantly
              </p>
            </div>
            <Link href="/dashboard">
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 text-sm sm:text-base">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Upload/Process Area */}
          {state === 'idle' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 md:p-16 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-subit-500 bg-gradient-to-br from-subit-50 to-blue-50 dark:from-subit-900/30 dark:to-blue-900/30 scale-[1.02] shadow-glow'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-subit-400 dark:hover:border-subit-500 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm'
              }`}
            >
              <input {...getInputProps()} />
              <div className="relative inline-block mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-subit-500 to-subit-600 rounded-full opacity-20 blur-xl scale-150 animate-pulse" />
                <Cloud className={`relative w-16 h-16 sm:w-20 sm:h-20 ${isDragActive ? 'text-subit-600' : 'text-neutral-400'} transition-colors`} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 sm:mb-3">
                {isDragActive ? '🎉 Drop your file here!' : 'Drag and drop your file'}
              </h3>
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-4 sm:mb-6">
                or click to browse
              </p>
              <div className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-subit-50 border border-subit-200 rounded-xl text-subit-700 font-medium text-sm sm:text-base">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Choose File</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-4 sm:mt-6">
                Audio: MP3, WAV, OGG, FLAC • Video: MP4, MOV, AVI, WEBM, MKV (Max 500MB)
              </p>
            </div>
          )}

          {/* File Selected */}
          {(state === 'file_selected' || isProcessing || state === 'success' || state === 'error') && file && (
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg p-6 sm:p-8 space-y-6">
              
              {/* File Info */}
              <div className="flex items-start justify-between p-4 sm:p-6 bg-gradient-to-r from-subit-50 to-blue-50 dark:from-subit-900/30 dark:to-blue-900/30 rounded-xl border border-subit-100 dark:border-subit-800">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-subit-500 rounded-xl opacity-20 blur-lg" />
                    <div className="relative p-3 sm:p-4 bg-subit-500 rounded-xl shadow-lg">
                      {file.type.startsWith('video/') ? (
                        <Video className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      ) : (
                        <FileAudio className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base sm:text-lg mb-1 truncate">
                      {file.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center">
                        <Cloud className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {formatFileSize(file.size)}
                      </span>
                      <span className="flex items-center">
                        {file.type.startsWith('video/') ? (
                          <><Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />Video</>
                        ) : (
                          <><FileAudio className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />Audio</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {!isProcessing && state !== 'success' && (
                  <button
                    onClick={handleReset}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl text-red-500 hover:text-red-600 transition-all flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Title Input */}
              {(state === 'file_selected') && (
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Project Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your project"
                    className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-subit-500 focus:border-subit-500 transition-all bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm sm:text-base"
                    autoFocus
                  />
                </div>
              )}

              {/* Progress */}
              {isProcessing && (
                <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-subit-50 dark:from-blue-900/30 dark:to-subit-900/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-5 h-5 text-subit-600 dark:text-subit-400 animate-spin flex-shrink-0" />
                      <span className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {progressMessage || 'Processing...'}
                      </span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-subit-600 dark:text-subit-400">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="relative w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 sm:h-3 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-subit-500 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success State */}
              {state === 'success' && (
                <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-green-900 dark:text-green-100 text-base sm:text-lg">
                        Success!
                      </h4>
                      <p className="text-sm sm:text-base text-green-700 dark:text-green-200">
                        Subtitles generated. Redirecting...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {state === 'error' && error && (
                <div className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-800 rounded-xl space-y-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-red-900 dark:text-red-100 mb-1 text-base sm:text-lg">
                        Processing Failed
                      </h4>
                      <p className="text-sm sm:text-base text-red-700 dark:text-red-200">
                        {error}
                      </p>
                    </div>
                  </div>
                  {retryCountRef.current < MAX_RETRIES && (
                    <button
                      onClick={handleRetry}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
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
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-subit-500 to-subit-600 text-white rounded-xl font-bold text-base sm:text-lg hover:shadow-glow-lg disabled:from-neutral-400 disabled:to-neutral-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
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

