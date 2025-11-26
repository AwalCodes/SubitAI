import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/lib/providers'
import { ThemeProvider } from '@/components/providers/theme-provider'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const CommandPalette = dynamic(() => import('@/components/command-palette').then(mod => ({ default: mod.CommandPalette })), {
  ssr: false,
})
const FloatingHelp = dynamic(() => import('@/components/floating-help').then(mod => ({ default: mod.FloatingHelp })), {
  ssr: false,
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SUBIT.AI - AI-Powered Subtitle Generator',
  description: 'Generate professional subtitles for your videos using advanced AI technology. Fast, accurate, and customizable.',
  keywords: ['AI', 'subtitles', 'video', 'transcription', 'Whisper', 'accessibility'],
  authors: [{ name: 'SUBIT.AI Team' }],
  creator: 'SUBIT.AI',
  publisher: 'SUBIT.AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SUBIT.AI - AI-Powered Subtitle Generator',
    description: 'Generate professional subtitles for your videos using advanced AI technology. Fast, accurate, and customizable.',
    siteName: 'SUBIT.AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SUBIT.AI - AI-Powered Subtitle Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUBIT.AI - AI-Powered Subtitle Generator',
    description: 'Generate professional subtitles for your videos using advanced AI technology.',
    images: ['/og-image.png'],
    creator: '@subit_ai',
  },
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
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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
  )
}








