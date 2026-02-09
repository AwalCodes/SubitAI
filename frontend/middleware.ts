import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NextFetchEvent } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/features',
  '/about',
  '/blog(.*)',
  '/auth/login(.*)',
  '/auth/signup(.*)',
  '/auth/forgot-password(.*)',
  '/terms',
  '/privacy',
  '/sitemap.xml',
  '/robots.txt',
  '/api/(.*)',
]);

function getCanonicalSiteUrl() {
  if (process.env.NODE_ENV === 'production') return 'https://www.subitai.com'
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  const normalizedEnvUrl = typeof envUrl === 'string' ? envUrl.replace(/\/$/, '') : ''
  if (normalizedEnvUrl) return normalizedEnvUrl
  return ''
}

function hasClerkEnv() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY
  // Only enable Clerk if the publishable key is a valid Clerk key (starts with pk_)
  return Boolean(publishableKey && publishableKey.startsWith('pk_') && secretKey && secretKey.startsWith('sk_'))
}

function maybeLegacyRedirect(req: NextRequest) {
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

  return null
}

const clerkHandler = hasClerkEnv()
  ? clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  })
  : null

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const redirect = maybeLegacyRedirect(req)
  if (redirect) return redirect

  if (!clerkHandler) {
    return NextResponse.next()
  }

  return clerkHandler(req, event)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
