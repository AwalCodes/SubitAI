"use client"

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Check, CreditCard, Bitcoin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations'

const PLAN_DETAILS: Record<string, { title: string; price: string; features: string[] }>= {
  pro: {
    title: 'Pro Plan',
    price: '$10/month',
    features: [
      '300 energy  per day',
      'Advanced subtitle generation',
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-10"
        >
          <motion.h1 variants={staggerItem} className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Subscribe to {planKey === 'premium' ? 'Premium' : 'Pro'} Plan
          </motion.h1>
          <motion.p variants={staggerItem} className="text-neutral-600 mt-3 text-lg">
            Get {planKey === 'premium' ? 'unlimited' : '300'} energy and unlock advanced features
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto space-y-6"
        >
          {/* Plan card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-subit-500 to-subit-600 text-white font-semibold px-6 py-4 flex items-center justify-between">
              <span>{plan.title}</span>
              <span className="text-2xl">{plan.price}</span>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4 text-lg">What&apos;s included:</h3>
              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-neutral-600">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900 text-lg">Choose Payment Method</h3>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => setMethod('card')}
                className={`w-full flex items-center px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                  method === 'card'
                    ? 'border-subit-500 bg-subit-500/10 shadow-md'
                    : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                  method === 'card' ? 'bg-subit-600' : 'bg-neutral-100'
                }`}>
                  <CreditCard className={`w-6 h-6 ${method === 'card' ? 'text-white' : 'text-neutral-500'}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-neutral-900">Pay with Card</div>
                  <div className="text-sm text-neutral-600">Credit/Debit Card, Apple Pay, Google Pay</div>
                </div>
                {method === 'card' && (
                  <div className="w-5 h-5 rounded-full bg-subit-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setMethod('crypto')}
                className={`w-full flex items-center px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                  method === 'crypto'
                    ? 'border-subit-500 bg-subit-500/10 shadow-md'
                    : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                  method === 'crypto' ? 'bg-subit-600' : 'bg-neutral-100'
                }`}>
                  <Bitcoin className={`w-6 h-6 ${method === 'crypto' ? 'text-white' : 'text-neutral-500'}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-neutral-900">Pay with Crypto</div>
                  <div className="text-sm text-neutral-600">BTC, ETH, USDT, and more</div>
                </div>
                {method === 'crypto' && (
                  <div className="w-5 h-5 rounded-full bg-subit-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>

              <Button
                onClick={() => router.push(`/checkout/pay/${planKey}?method=${method}`)}
                size="lg"
                variant="premium"
                className="w-full mt-6"
              >
                Continue to Payment
              </Button>

              <p className="text-xs text-neutral-500 text-center pt-2">
                By proceeding, you agree to our{' '}
                <Link href="/terms" className="text-subit-600 hover:text-subit-700 underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-subit-600 hover:text-subit-700 underline">Privacy Policy</Link>
              </p>

              <div className="text-center pt-4">
                <Link href="/pricing" className="text-subit-600 hover:text-subit-700 font-medium">
                  ← Back to Pricing
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
