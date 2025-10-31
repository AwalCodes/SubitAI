'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <Link href="/dashboard/billing/payment-methods/add">
          <Button>Add Payment Method</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No payment methods added</p>
            <Link href="/dashboard/billing/payment-methods/add">
              <Button>Add Your First Payment Method</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
