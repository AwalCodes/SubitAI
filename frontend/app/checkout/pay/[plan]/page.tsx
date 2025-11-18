"use client"

import { useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

// Real payment links provided by the client
const PAYMENT_LINKS = {
  pro: {
    card: 'https://buy.stripe.com/14AfZgbf95WU91EcTDd3i01', // $10/mo Stripe
    crypto: 'https://nowpayments.io/payment/?iid=4428171539', // $10 crypto
  },
  premium: {
    card: 'https://buy.stripe.com/aFabJ0gzt8522Dg7zjd3i02', // $50/mo Stripe
    crypto: 'https://nowpayments.io/payment/?iid=4445746126', // $50 crypto
  },
}

export default function PaymentRedirectPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const planKey = String(params.plan || 'pro').toLowerCase() as 'pro' | 'premium'
  const method = (searchParams.get('method') || 'card') as 'card' | 'crypto'

  useEffect(() => {
    // Get the correct payment link based on plan and method
    const paymentUrl = PAYMENT_LINKS[planKey]?.[method] || PAYMENT_LINKS.pro.card
    
    // Redirect to the payment provider
    window.location.href = paymentUrl
  }, [planKey, method])

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-subit-100 mb-4">
          <svg className="animate-spin h-8 w-8 text-subit-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Redirecting to Payment...</h2>
        <p className="text-neutral-600 mb-6">
          {method === 'card' ? 'Taking you to Stripe checkout' : 'Taking you to crypto payment gateway'}
        </p>
        <p className="text-sm text-neutral-500">If you&apos;re not redirected automatically, <a href={PAYMENT_LINKS[planKey]?.[method]} className="text-subit-600 hover:text-subit-700 underline">click here</a></p>
      </div>
    </div>
  )
}
