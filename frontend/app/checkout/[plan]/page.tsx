"use client"

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Check, CreditCard, Bitcoin } from 'lucide-react'

const PLAN_DETAILS: Record<string, { title: string; price: string; features: string[] }>= {
  pro: {
    title: 'Pro Plan',
    price: '$10/month',
    features: [
      '300 energy  per day',
      'Advanced subtitle generation',
      'Watermark-free exports',
      'Full font library',
      'Basic positioning'
    ],
  },
  premium: {
    title: 'Premium Plan',
    price: '$50/month',
    features: [
      'Unlimited energy',
      'Premium subtitle generation',
      'Watermark-free exports',
      'Full font library + custom uploads',
      'Free positioning anywhere',
      'Advanced shadow & animation effects',
      'No video upload limits',
    ],
  },
}

export default function SubscribePlanPage() {
  const params = useParams()
  const router = useRouter()
  const planKey = String(params.plan || '').toLowerCase()
  const [method, setMethod] = useState<'card'|'crypto'>('card')
  const plan = useMemo(() => PLAN_DETAILS[planKey] || PLAN_DETAILS['pro'], [planKey])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Subscribe to {planKey === 'premium' ? 'Premium' : 'Pro'} Plan</h1>
        <p className="text-gray-600 text-center mt-2">Get {planKey === 'premium' ? 'unlimited' : '300'} energy and unlock advanced features</p>

        <div className="max-w-3xl mx-auto mt-8 space-y-6">
          {/* Plan card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-blue-50 text-blue-700 font-medium px-6 py-3">{plan.title} <span className="ml-2 text-sm text-blue-600">{plan.price}</span></div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">What's included:</h3>
              <ul className="space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Payment Method</h3>
            </div>
            <div className="p-6 space-y-4">
              <button onClick={() => setMethod('card')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${method==='card'?'border-blue-600 bg-blue-50':'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Pay with Card</div>
                    <div className="text-sm text-gray-500">Pay with Credit/Debit Card, Apple Pay, Google pay, etc.</div>
                  </div>
                </div>
              </button>
              <button onClick={() => setMethod('crypto')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${method==='crypto'?'border-blue-600 bg-blue-50':'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <Bitcoin className="w-5 h-5 text-gray-700" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Pay with Cryptocurrencies</div>
                    <div className="text-sm text-gray-500">Pay with supported cryptocurrencies (BTC, ETH, USDT, etc.)</div>
                  </div>
                </div>
              </button>
              <button onClick={() => router.push(`/checkout/pay/${planKey}?method=${method}`)} className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                Continue to Payment
              </button>
              <div className="text-xs text-gray-500 text-center">By proceeding, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link></div>
              <div className="text-center mt-4"><Link href="/pricing" className="text-blue-700">Back to Pricing</Link></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
