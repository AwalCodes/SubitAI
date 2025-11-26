import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (body) {
      console.error('Client error reported:', {
        name: body.name,
        message: body.message,
        stack: body.stack,
        context: body.context,
        url: body.url,
        userAgent: body.userAgent,
        timestamp: body.timestamp,
      })

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      // Only log to database if service key is available (server-side only)
      if (supabaseUrl && serviceKey) {
        try {
          const supabase = createSupabaseClient(supabaseUrl, serviceKey)
          const { error } = await supabase.from('client_error_logs').insert({
            name: body.name || 'Unknown Error',
            message: body.message || 'No message',
            stack: body.stack || null,
            context: body.context || null,
            url: body.url || null,
            user_agent: body.userAgent || null,
            path: body.path || body.context?.path || null,
            source: body.context?.source || null,
          })
          
          if (error) {
            console.error('Failed to persist client error log:', error)
          }
        } catch (dbError) {
          console.error('Failed to persist client error log:', dbError)
        }
      } else {
        // In production, service key should be set
        if (process.env.NODE_ENV === 'production') {
          console.error('Supabase logging skipped: missing SUPABASE_SERVICE_ROLE_KEY in production')
        }
      }
    } else {
      console.error('Client error reported with empty body')
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to handle client error report:', error)
    // Always return 204 to prevent error loops
    return new NextResponse(null, { status: 204 })
  }
}
