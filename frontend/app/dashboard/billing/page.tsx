'use client'

import { useUser } from '@/lib/providers'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BillingPage() {
  const { user } = useUser()
  const router = useRouter()

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
                {user?.subscription_plan === 'premium' ? 'Premium' : user?.subscription_plan === 'pro' ? 'Pro' : 'Free'}
              </p>
              <p className="text-sm text-gray-600">
                {user?.subscription_plan === 'premium' ? 'Unlimited energy' : 
                 user?.subscription_plan === 'pro' ? '300 energy/day' : '30 energy/day'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">
                {user?.subscription_plan === 'premium' ? '$50/month' : 
                 user?.subscription_plan === 'pro' ? '$10/month' : 'Free'}
              </p>
              {user?.subscription_plan !== 'free' && (
                <p className="text-sm text-gray-600">Next billing: {user?.subscription_ends_at}</p>
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
              {user?.subscription_plan === 'free' 
                ? 'Upgrade to add payment methods' 
                : 'Manage your payment methods'}
            </p>
            {user?.subscription_plan !== 'free' && (
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
