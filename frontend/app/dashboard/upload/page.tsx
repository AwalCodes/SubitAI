'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, Video, X, CheckCircle, AlertCircle, Cloud, Zap, Sparkles, ArrowRight, Loader } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { transcribeFile } from '@/lib/api-v2'
import { useUser } from '@/lib/providers'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { AnimatedCard, fadeInUp, scaleIn } from '@/components/ui/animations'

export default function UploadPage() {
  const { user } = useUser()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<'upload'|'process'|'result'>('upload')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      toast.success('File selected!')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 1024, // 1GB
  })

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a video file')
      return
    }

    setUploading(true)
    setCurrentStep('process')
    setUploadProgress(0)

    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Simulate upload progress
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            if (progressInterval) clearInterval(progressInterval)
            return 95 // Stop at 95%, wait for API
          }
          return prev + 10
        })
      }, 500)

      const supabase = createClient()
      
      // Create project in database
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

      // Upload video to storage
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
        .eq('id', projectData.id)

      // Clear interval and complete progress
      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(100)

      toast.success('Video uploaded successfully!', {
        icon: '🎉',
        duration: 3000,
      })
      
      setTimeout(() => {
        router.push(`/dashboard/projects/${projectData.id}`)
      }, 1000)
    } catch (error: any) {
      console.error('Upload error:', error)
      // Clear interval on error
      if (progressInterval) clearInterval(progressInterval)
      toast.error(error.response?.data?.detail || 'Failed to upload video')
      setUploading(false)
      setCurrentStep('upload')
      setUploadProgress(0)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setTitle('')
    setUploadProgress(0)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const steps = [
    { key: 'upload', label: 'Upload', icon: Upload },
    { key: 'process', label: 'Process', icon: Video },
    { key: 'result', label: 'Result', icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-subit-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-subit-600 via-subit-500 to-subit-400 border-b border-subit-300/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Quick Subtitle Generator
              </h1>
              <p className="text-subit-50 text-lg">Upload your video and get AI-generated subtitles in seconds</p>
            </div>
            <Link href="/dashboard">
              <button className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Stepper */}
          <AnimatedCard className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-glass p-8 mb-8">
            <div className="flex items-center justify-center space-x-8 sm:space-x-12">
              {steps.map((step, idx) => {
                const isActive = currentStep === step.key
                const isPast = steps.findIndex(s => s.key === currentStep) > idx
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-subit-600 bg-subit-50 dark:bg-subit-900/30 text-subit-600 dark:text-subit-400 scale-110 shadow-glow' 
                        : isPast
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
                    }`}>
                      {isPast && !isActive ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : uploading && step.key === 'process' ? (
                        <Loader className="w-8 h-8 animate-spin" />
                      ) : (
                        <step.icon className="w-8 h-8" />
                      )}
                    </div>
                    <span className={`mt-3 text-sm font-medium transition-colors ${
                      isActive ? 'text-subit-700 dark:text-subit-400 font-semibold' : 
                      isPast ? 'text-green-600 dark:text-green-400' : 
                      'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {step.label}
                    </span>
                    {idx < steps.length - 1 && (
                      <div className={`absolute left-[calc(50%+40px)] top-8 w-8 sm:w-16 h-0.5 transition-colors ${
                        isPast ? 'bg-green-500 dark:bg-green-400' : 'bg-neutral-200 dark:bg-neutral-700'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </AnimatedCard>

          {/* Upload Area */}
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-subit-500 bg-gradient-to-br from-subit-50 to-blue-50 dark:from-subit-900/30 dark:to-blue-900/30 scale-[1.02] shadow-glow'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-subit-400 dark:hover:border-subit-500 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm'
              }`}
            >
              <input {...getInputProps()} />
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-subit-500 to-subit-600 rounded-full opacity-20 blur-xl scale-150 animate-pulse" />
                <Cloud className={`relative w-20 h-20 ${isDragActive ? 'text-subit-600' : 'text-neutral-400'} transition-colors`} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                {isDragActive ? '🎉 Drop your video here!' : 'Drag and drop your video here'}
              </h3>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">or click to browse</p>
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-subit-50 border border-subit-200 rounded-xl text-subit-700 font-medium">
                <Upload className="w-5 h-5" />
                <span>Choose File</span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6">
                Supported: MP4, AVI, MOV, WMV, FLV, WEBM, MKV (Max 1GB)
              </p>
            </div>
          ) : (
            <AnimatedCard className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-glass p-8 space-y-6">
              {/* File Info */}
              <div className="flex items-start justify-between p-6 bg-gradient-to-r from-subit-50 to-blue-50 dark:from-subit-900/30 dark:to-blue-900/30 rounded-xl border border-subit-100 dark:border-subit-800">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-subit-500 rounded-xl opacity-20 blur-lg" />
                    <div className="relative p-4 bg-subit-500 rounded-xl shadow-lg">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg mb-1 truncate">{file.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center">
                        <Cloud className="w-4 h-4 mr-1" />
                        {formatFileSize(file.size)}
                      </span>
                      <span className="flex items-center">
                        <Video className="w-4 h-4 mr-1" />
                        Video File
                      </span>
                    </div>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-600 transition-colors transition-transform hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Project Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  placeholder="Enter a title for your project"
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-subit-500 focus:border-subit-500 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed transition-all bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <AnimatedCard className="p-6 bg-gradient-to-r from-blue-50 to-subit-50 dark:from-blue-900/30 dark:to-subit-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-5 h-5 text-subit-600 dark:text-subit-400 animate-spin" />
                      <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Uploading your video...</span>
                    </div>
                    <span className="text-lg font-bold text-subit-600 dark:text-subit-400">{uploadProgress}%</span>
                  </div>
                  <div className="relative w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-subit-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </AnimatedCard>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || !title.trim()}
                className="group w-full py-4 bg-gradient-to-r from-subit-500 to-subit-600 text-white rounded-xl font-bold text-lg hover:shadow-glow-lg disabled:from-neutral-400 disabled:to-neutral-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-5 h-5" />
                    <span>Upload Video</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Info */}
              <div className="bg-gradient-to-r from-blue-50 to-subit-50 dark:from-blue-900/30 dark:to-subit-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="text-base text-blue-900 dark:text-blue-100">
                    <p className="font-bold mb-2">What happens next?</p>
                    <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Your video will be uploaded to secure cloud storage</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>AI will automatically analyze and transcribe the audio</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>You can edit and customize the subtitles</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Export your video with embedded subtitles</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Plan Limits */}
          <AnimatedCard delay={0.2} className="mt-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-glass p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Your Plan Limits</h3>
            </div>
            {(() => { const tier = (user as any)?.user_metadata?.subscription_tier || 'free'; return (
                              <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">Max video length</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">
                      {tier === 'team' ? 'Unlimited' : tier === 'pro' ? '30 minutes' : '5 minutes'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">Max file size</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">
                      {tier === 'team' ? '1 GB' : tier === 'pro' ? '500 MB' : '200 MB'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">Watermark</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">
                    {tier === 'pro' || tier === 'team' ? 'No watermark' : 'With watermark'}
                  </span>
                </div>
              </div>
            )})()}
            {(!((user as any)?.user_metadata?.subscription_tier) || (user as any)?.user_metadata?.subscription_tier === 'free') && (
              <Link href="/pricing">
                <button className="w-full mt-6 py-4 border-2 border-subit-500 text-subit-600 rounded-xl font-bold hover:bg-subit-50 transition-all duration-200 transform hover:-translate-y-0.5">
                  Upgrade for More Features
                  <ArrowRight className="inline-block w-5 h-5 ml-2" />
                </button>
              </Link>
            )}
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
