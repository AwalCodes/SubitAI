import { Metadata } from 'next'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'SUBITAI - 100% Free Professional Subtitle Generator | AI-Powered',
  description: 'Generate professional subtitles for your videos in seconds — completely free, no credit card required. 95%+ accuracy with AI, 50+ languages, unlimited exports. Trusted by 10,000+ creators.',
  keywords: [
    'AI subtitle generator',
    'automatic subtitles',
    'video transcription',
    'SRT generator',
    'VTT subtitles',
    'video captions',
    'speech to text',
    'YouTube subtitles',
    'TikTok captions',
    'free subtitle generator',
  ],
  openGraph: {
    title: 'SUBITAI - 100% Free Professional Subtitle Generator',
    description: 'Generate professional subtitles for your videos in seconds — completely free. No credit card, no watermarks, no limits.',
    url: 'https://subitai.com',
    type: 'website',
  },
  alternates: {
    canonical: 'https://subitai.com',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
