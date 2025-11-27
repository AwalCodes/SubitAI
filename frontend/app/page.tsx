import { Metadata } from 'next'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Pricing from '@/components/landing/Pricing'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'SUBITAI - AI-Powered Subtitle Generator | Fast & Accurate Transcription',
  description: 'Generate professional subtitles for your videos in seconds using advanced AI. Support for 50+ languages, multiple export formats (SRT, VTT, TXT), and a free tier to get started.',
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
    title: 'SUBITAI - AI-Powered Subtitle Generator',
    description: 'Generate professional subtitles for your videos in seconds. Free tier available.',
    url: 'https://subitai.com',
    type: 'website',
  },
  alternates: {
    canonical: 'https://subitai.com',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}