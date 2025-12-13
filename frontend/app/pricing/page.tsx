import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Pricing from '@/components/landing/Pricing'
import { PricingSchema } from '@/components/seo/structured-data'

export const metadata: Metadata = {
  title: 'Pricing Plans | SUBITAI - AI Subtitle Generator',
  description: 'Choose from Free, Pro, or Premium plans. Start free with 3 daily transcriptions or go unlimited. Pay with card or cryptocurrency.',
  keywords: ['subtitle generator pricing', 'AI transcription cost', 'video subtitle plans', 'affordable subtitles'],
  openGraph: {
    title: 'Pricing Plans | SUBITAI',
    description: 'Flexible pricing for AI-powered subtitle generation. Free tier available.',
    url: 'https://subitai.com/pricing',
  },
  alternates: {
    canonical: 'https://subitai.com/pricing',
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PricingSchema />
      <Header />
      <main className="pt-20">
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
