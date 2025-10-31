import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Pricing from '@/components/landing/Pricing'

export const metadata: Metadata = {
  title: 'Pricing | SUBIT.AI',
  description: 'Flexible pricing plans for creators. Choose the plan that fits your workflow and pay with card or cryptocurrency.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
