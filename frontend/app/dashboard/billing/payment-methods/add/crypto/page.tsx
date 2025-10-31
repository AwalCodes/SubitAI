'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AddCryptoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Add Cryptocurrency</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported Cryptocurrencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:border-subit-500 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">₿</span>
                </div>
                <div>
                  <h3 className="font-medium">Bitcoin</h3>
                  <p className="text-sm text-gray-600">BTC</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:border-subit-500 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-bold">Ξ</span>
                </div>
                <div>
                  <h3 className="font-medium">Ethereum</h3>
                  <p className="text-sm text-gray-600">ETH</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:border-subit-500 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">₮</span>
                </div>
                <div>
                  <h3 className="font-medium">Tether</h3>
                  <p className="text-sm text-gray-600">USDT</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/dashboard/billing/payment-methods/add">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
