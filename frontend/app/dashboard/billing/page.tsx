'use client'

import { useUser } from '@/lib/providers'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BillingPage() {
  const { user, subscription } = useUser()
  const router = useRouter()

  // Default to free plan
  const planType = subscription?.plan || 'free'
  const planName = planType === 'premium' ? 'Premium' : planType === 'pro' ? 'Pro' : 'Free'
  const planPrice = planType === 'premium' ? '$50/month' : planType === 'pro' ? '$10/month' : 'Free'
  const planEnergy = planType === 'premium' ? 'Unlimited energy' : planType === 'pro' ? '300 energy/day' : '30 energy/day'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Billing & Plans</h2>
        <Link href="/pricing">
          <Button variant="outline">Change Plan</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">
                {planName}
              </p>
              <p className="text-sm text-gray-600">
                {planEnergy}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">
                {planPrice}
              </p>
              {planType !== 'free' && subscription?.ends_at && (
                <p className="text-sm text-gray-600">Next billing: {subscription.ends_at}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {planType === 'free'
                ? 'Upgrade to add payment methods' 
                : 'Manage your payment methods'}
            </p>
            {planType !== 'free' && (
              <Link href="/dashboard/billing/payment-methods">
                <Button>Manage Payment Methods</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
