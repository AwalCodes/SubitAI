import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'

export const metadata: Metadata = {
  title: 'Features - SUBIT.AI',
  description: 'Discover all the powerful features of SUBIT.AI subtitle generation platform.',
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="pt-20">
          <Features />
          <HowItWorks />
        </div>
      </main>
      <Footer />
    </div>
  )
}
