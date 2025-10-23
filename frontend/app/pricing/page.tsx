import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Pricing from '@/components/landing/Pricing'

export const metadata: Metadata = {
  title: 'Pricing - SUBIT.AI',
  description: 'Choose the perfect plan for your subtitle generation needs. Free, Pro, and Premium plans available.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="pt-20">
          <Pricing />
        </div>
      </main>
      <Footer />
    </div>
  )
}
