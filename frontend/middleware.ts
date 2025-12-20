import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/login(.*)',
  '/auth/signup(.*)',
  '/auth/forgot-password(.*)',
  '/terms',
  '/privacy',
  '/api/(.*)',
]);

function getCanonicalSiteUrl() {
  if (process.env.NODE_ENV === 'production') return 'https://www.subitai.com'
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  const normalizedEnvUrl = typeof envUrl === 'string' ? envUrl.replace(/\/$/, '') : ''
  if (normalizedEnvUrl) return normalizedEnvUrl
  return ''
}

export default clerkMiddleware(async (auth, req) => {
  const canonicalSiteUrl = getCanonicalSiteUrl()
  const host = req.headers.get('host') || ''
  const hostWithoutPort = host.split(':')[0]

  // Legacy host redirect
  if (hostWithoutPort === 'subit-ai.vercel.app' && canonicalSiteUrl) {
    const url = req.nextUrl.clone()
    const canonical = new URL(canonicalSiteUrl)
    url.protocol = canonical.protocol
    url.host = canonical.host
    return NextResponse.redirect(url, 308)
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
