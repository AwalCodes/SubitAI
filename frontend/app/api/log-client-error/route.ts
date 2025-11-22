import { NextRequest, NextResponse } from 'next/server'

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
    } else {
      console.error('Client error reported with empty body')
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to handle client error report:', error)
    return new NextResponse(null, { status: 204 })
  }
}
