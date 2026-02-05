import type { Metadata } from 'next'
import { ConditionalClerkProvider } from '@/components/providers/conditional-clerk-provider'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/lib/providers'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { OrganizationSchema, WebsiteSchema, SoftwareApplicationSchema } from '@/components/seo/structured-data'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const CommandPalette = dynamic(() => import('@/components/command-palette').then(mod => ({ default: mod.CommandPalette })), {
  ssr: false,
})
const FloatingHelp = dynamic(() => import('@/components/floating-help').then(mod => ({ default: mod.FloatingHelp })), {
  ssr: false,
})


export const metadata: Metadata = {
  title: 'SUBITAI - Free Subtitle Generator',
  description: 'Generate professional subtitles for your videos in seconds. Fast, accurate, and customizable.',
  keywords: ['AI', 'subtitles', 'video', 'transcription', 'Whisper', 'accessibility'],
  authors: [{ name: 'SUBITAI Team' }],
  creator: 'SUBITAI',
  publisher: 'SUBITAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://subitai.com'),
  icons: {
    icon: [
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=2', type: 'image/x-icon' },
      { url: '/favicon-96x96.png?v=2', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=2',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SUBITAI',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SUBITAI - Free Subtitle Generator',
    description: 'Generate professional subtitles for your videos in seconds. Fast, accurate, and customizable.',
    siteName: 'SUBITAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SUBITAI - Free Subtitle Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUBITAI - Free Subtitle Generator',
    description: 'Generate professional subtitles for your videos in seconds.',
    images: ['/og-image.png'],
    site: '@subitai',
    creator: '@subitai',
  },
  alternates: {
    canonical: 'https://subitai.com',
  },
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Client-side safeguard: reload page if a stale runtime tries to load missing chunks
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const msg = String((event as any)?.reason?.message || '');
      if (msg.includes('ChunkLoadError') || msg.includes('Loading chunk')) {
        // Force a hard reload to fetch fresh HTML and chunk mappings
        window.location.reload();
      }
    });
    window.addEventListener('error', (event: ErrorEvent) => {
      const msg = String(event.message || '');
      if (msg.includes('ChunkLoadError') || msg.includes('Loading chunk')) {
        window.location.reload();
      }
    });
  }
  return (
    <ConditionalClerkProvider>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <head>
          <OrganizationSchema />
          <WebsiteSchema />
          <SoftwareApplicationSchema />
        </head>
        <body className={`font-sans h-full antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
            <Providers>
              {children}
              <CommandPalette />
              <FloatingHelp />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ConditionalClerkProvider>
  )
}
