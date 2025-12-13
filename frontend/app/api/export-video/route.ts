import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Video export endpoint with server-side processing
// For production, implement one of these solutions:
// 1. FFmpeg server (separate backend service)
// 2. Video processing API (Mux, Cloudflare Stream, IMG.LY)
// 3. Cloudflare Workers with FFmpeg.wasm (limited)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoUrl = formData.get('videoUrl') as string
    const subtitles = JSON.parse(formData.get('subtitles') as string)
    const style = JSON.parse(formData.get('style') as string || '{}')

    if (!videoUrl || !subtitles) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Authenticate user
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Forward to video export service
    // In production this URL should be in environment variables
    const EXPORT_SERVICE_URL = process.env.VIDEO_EXPORT_SERVICE_URL || 'https://samzeret78gmail-video-export-service.hf.space'

    // Create new FormData for the backend service
    const serviceFormData = new FormData()
    serviceFormData.append('videoUrl', videoUrl)
    serviceFormData.append('subtitles', JSON.stringify(subtitles))
    serviceFormData.append('style', JSON.stringify(style))

    console.log(`Forwarding export request to ${EXPORT_SERVICE_URL}/export`)

    const response = await fetch(`${EXPORT_SERVICE_URL}/export`, {
      method: 'POST',
      body: serviceFormData,
      // We don't set Content-Type header here because fetch with FormData sets it automatically with boundary
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorJson = JSON.parse(errorText)
        throw new Error(errorJson.error || `Export service failed with status ${response.status}`)
      } catch (e) {
        throw new Error(`Export service failed: ${errorText}`)
      }
    }

    // Stream the response back to client
    const headers = new Headers(response.headers)

    // Ensure we have correct headers for file download
    if (!headers.has('Content-Disposition')) {
      headers.set('Content-Disposition', 'attachment; filename="video.mp4"')
    }

    return new NextResponse(response.body, {
      status: 200,
      headers
    })

  } catch (error: any) {
    console.error('Export video error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export video' },
      { status: 500 }
    )
  }
}