'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AddPaymentMethodPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Add Payment Method</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/billing/payment-methods/add/card">
              <Card className="p-6 hover:border-subit-500 cursor-pointer transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v12h16V6H4zm4 4h8v2H8v-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Credit/Debit Card</h3>
                    <p className="text-sm text-gray-600">Visa, Mastercard, etc.</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/billing/payment-methods/add/crypto">
              <Card className="p-6 hover:border-subit-500 cursor-pointer transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Cryptocurrency</h3>
                    <p className="text-sm text-gray-600">BTC, ETH, USDT, etc.</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          <div className="pt-4">
            <Link href="/dashboard/billing/payment-methods">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
