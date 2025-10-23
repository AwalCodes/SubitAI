"use client"

import { useMemo, useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Bitcoin, Clock4, Copy, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const PLAN_PRICES: Record<string, { title: string; amount: number }>= {
  pro: { title: 'Pro Plan', amount: 10 },
  premium: { title: 'Premium Plan', amount: 50 },
}

export default function CryptoPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const search = useSearchParams();
  const method = (search.get('method') || 'crypto') as 'card'|'crypto'
  const planKey = String(params.plan || '').toLowerCase()
  const plan = useMemo(() => PLAN_PRICES[planKey] || PLAN_PRICES['pro'], [planKey])
  const [secondsLeft, setSecondsLeft] = useState(15 * 60)

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s-1)), 1000)
    return () => clearInterval(t)
  }, [])

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard') }
  const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  const amount = (plan.amount / 1000).toFixed(8) // demo amount

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => router.back()} className="text-blue-700 flex items-center mb-4"><ChevronLeft className="w-4 h-4 mr-1"/>Back</button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Complete Your Payment</h1>
        <p className="text-gray-600 text-center mt-2">{plan.title} • ${plan.amount} /month</p>

        <div className="max-w-4xl mx-auto mt-8 grid md:grid-cols-2 gap-6">
          {/* Select method */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm md:col-span-2">
            <div className="p-4 flex items-center justify-between">
              <div className="font-medium text-gray-900">Select Payment Method</div>
              <div className="text-sm text-gray-500">{method === 'crypto' ? 'Bitcoin (BTC)' : 'Card'}</div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-900">Payment Details</div>
              <div className="text-sm text-gray-600 flex items-center"><Clock4 className="w-4 h-4 mr-1"/> {`${Math.floor(secondsLeft/60).toString().padStart(2,'0')}:${(secondsLeft%60).toString().padStart(2,'0')}`}</div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="bg-gray-100 rounded-lg h-44 flex items-center justify-center text-gray-400">Scan with your wallet app</div>
              <div className="md:col-span-2 space-y-3">
                <div className="text-sm text-gray-600">Amount to Pay</div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="w-5 h-5 text-orange-500"/><span className="font-medium">{amount} BTC</span>
                  </div>
                  <div className="text-gray-700">${plan.amount.toFixed(2)}</div>
                </div>
                <div className="text-sm text-gray-600">Send to This Address</div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="truncate mr-2">{address}</div>
                  <button onClick={() => copy(address)} className="p-1.5 hover:bg-gray-100 rounded"><Copy className="w-4 h-4"/></button>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm flex items-center">Waiting for payment...</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="font-medium text-gray-900 mb-2">Payment Instructions</div>
              <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
                <li>Copy the Bitcoin address or scan the QR code</li>
                <li>Send exactly <strong>{amount} BTC</strong> to this address</li>
                <li>Once confirmed, your subscription will be activated automatically</li>
                <li>The payment window is active for 15 minutes</li>
              </ol>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => router.refresh()} className="text-blue-700">Reset Payment</button>
              <button onClick={() => { toast.success('Payment confirmed (demo)'); router.push('/dashboard') }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Simulate Payment (Demo)</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
