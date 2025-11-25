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

      if (supabaseUrl && serviceKey) {
        try {
          const supabase = createSupabaseClient(supabaseUrl, serviceKey)
          await supabase.from('client_error_logs').insert({
            name: body.name,
            message: body.message,
            stack: body.stack,
            context: body.context,
            url: body.url,
            user_agent: body.userAgent,
            path: body.path || body.context?.path || null,
            source: body.context?.source || null,
          })
        } catch (dbError) {
          console.error('Failed to persist client error log:', dbError)
        }
      } else {
        console.error('Supabase logging skipped: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      }
    } else {
      console.error('Client error reported with empty body')
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to handle client error report:', error)
    return new NextResponse(null, { status: 204 })
  }
}
