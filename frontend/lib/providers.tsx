'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useUser as useClerkUser, useAuth } from '@clerk/nextjs'

interface UserContextType {
  user: any
  loading: boolean
  subscription: any
  refetch: () => void
  supabase: any
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const { isLoaded, user: clerkUser } = useClerkUser()
  const { getToken } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null)

  // Get Supabase token from Clerk
  useEffect(() => {
    const loadToken = async () => {
      if (clerkUser) {
        try {
          // Provide 'supabase' as the template name configured in Clerk dashboard
          const token = await getToken({ template: 'supabase' })
          setSupabaseToken(token)
          if (token) {
            localStorage.setItem('access_token', token)
          } else {
            localStorage.removeItem('access_token')
          }
        } catch (e) {
          console.error('Error getting Supabase token from Clerk:', e)
          setSupabaseToken(null)
          localStorage.removeItem('access_token')
        }
      } else {
        setSupabaseToken(null)
      }
    }
    loadToken()
  }, [clerkUser, getToken])

  // Create an authenticated Supabase client whenever the token changes
  const supabase = useMemo(() => createClient(supabaseToken || undefined), [supabaseToken])

  const fetchSubscription = useCallback(async (userId: string) => {
    if (!supabaseToken) return;

    try {
      // Fetch user's subscription tier from users table
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .maybeSingle()

      if (userData?.subscription_tier) {
        const mappedTier = userData.subscription_tier === 'team' ? 'premium' : userData.subscription_tier
        setSubscription({ plan: mappedTier, status: 'active' })
        return
      }

      // Fallback: check billing table
      const { data: billingData } = await supabase
        .from('billing')
        .select('plan, status, current_period_end')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (billingData?.plan) {
        const periodEnd = billingData.current_period_end ? new Date(billingData.current_period_end) : null
        if (!periodEnd || periodEnd > new Date()) {
          setSubscription({ plan: billingData.plan, status: 'active' })
          return
        }
      }

      setSubscription(null)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setSubscription(null)
    }
  }, [supabase, supabaseToken])

  useEffect(() => {
    if (clerkUser) {
      fetchSubscription(clerkUser.id)
    } else {
      setSubscription(null)
    }
  }, [clerkUser, fetchSubscription])

  const refetch = useCallback(() => {
    if (clerkUser?.id) {
      fetchSubscription(clerkUser.id)
    }
  }, [clerkUser?.id, fetchSubscription])

  return (
    <UserContext.Provider value={{
      user: clerkUser,
      loading: !isLoaded,
      subscription,
      refetch,
      supabase
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
