'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AddCardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Add Credit Card</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Card Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Card Number</label>
              <input 
                type="text" 
                placeholder="1234 5678 9012 3456" 
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Cardholder Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Expiry Date</label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">CVV</label>
              <input 
                type="text" 
                placeholder="123" 
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button>Save Card</Button>
            <Link href="/dashboard/billing/payment-methods/add">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
