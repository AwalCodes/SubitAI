'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, Video, X, CheckCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useUser } from '@/lib/providers'
import toast from 'react-hot-toast'
import Link from 'next/link'

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

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await apiClient.projects.uploadVideo(file, title)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      toast.success('Video uploaded successfully!')
      
      // Redirect to project page
      setTimeout(() => {
        router.push(`/dashboard/projects/${response.data.project.id}`)
      }, 1000)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.detail || 'Failed to upload video')
      setUploading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quick Subtitle Generator</h1>
              <p className="text-gray-600">Upload your video and get AI-generated subtitles in seconds</p>
            </div>
            <Link href="/dashboard">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Stepper */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-center space-x-10">
              {[
                { key: 'upload', label: 'Upload', icon: Upload },
                { key: 'process', label: 'Process', icon: Video },
                { key: 'result', label: 'Result', icon: CheckCircle },
              ].map((step, idx) => {
                const isActive = currentStep === step.key
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'}`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className={`mt-2 text-sm ${isActive ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>{step.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Upload Area */}
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragActive ? 'Drop your video here' : 'Drag and drop your video here'}
              </h3>
              <p className="text-gray-600 mb-4">or click to browse</p>
              <p className="text-sm text-gray-500">
                Supported formats: MP4, AVI, MOV, WMV, FLV, WEBM, MKV (Max 1GB)
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              {/* File Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  placeholder="Enter a title for your project"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Uploading your video...</span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Uploading your video file...</p>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || !title.trim()}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Your video will be uploaded to secure storage</li>
                      <li>• AI will automatically analyze and transcribe the audio</li>
                      <li>• You can then edit and customize the subtitles</li>
                      <li>• Export your video with embedded subtitles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plan Limits */}
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Plan Limits</h3>
            {(() => { const tier = (user as any)?.user_metadata?.subscription_tier || 'free'; return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Max video length</span>
                <span className="font-medium text-gray-900">
                  {tier === 'team' ? 'Unlimited' : tier === 'pro' ? '30 minutes' : '5 minutes'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Max file size</span>
                <span className="font-medium text-gray-900">
                  {tier === 'team' ? '1 GB' : tier === 'pro' ? '500 MB' : '200 MB'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Watermark</span>
                <span className="font-medium text-gray-900">
                  {tier === 'pro' || tier === 'team' ? 'No watermark' : 'With watermark'}
                </span>
              </div>
            </div>
            )})()}
            {(!((user as any)?.user_metadata?.subscription_tier) || (user as any)?.user_metadata?.subscription_tier === 'free') && (
              <Link href="/pricing">
                <button className="w-full mt-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  Upgrade for More Features
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
