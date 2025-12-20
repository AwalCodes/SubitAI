import { NextRequest, NextResponse } from 'next/server'

function getCanonicalSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  const normalizedEnvUrl = typeof envUrl === 'string' ? envUrl.replace(/\/$/, '') : ''

  if (normalizedEnvUrl) return normalizedEnvUrl
  if (process.env.NODE_ENV === 'production') return 'https://www.subitai.com'
  return ''
}

export function middleware(req: NextRequest) {
  const canonicalSiteUrl = getCanonicalSiteUrl()
  if (!canonicalSiteUrl) return NextResponse.next()

  const legacyHosts = new Set(['subit-ai.vercel.app'])
  const host = req.headers.get('host') || ''
  const hostWithoutPort = host.split(':')[0]

  if (!legacyHosts.has(hostWithoutPort)) return NextResponse.next()

  const url = req.nextUrl.clone()
  const canonical = new URL(canonicalSiteUrl)
  url.protocol = canonical.protocol
  url.host = canonical.host

  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: '/:path*',
}

