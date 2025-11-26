'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface UserContextType {
  user: User | null
  loading: boolean
  subscription: any
  refetch: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Get supabase client once at module level
const supabase = createClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const fetchingRef = useRef(false)

  const fetchSubscription = useCallback(async (userId: string) => {
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
  }, [])

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        if (session.access_token) {
          localStorage.setItem('access_token', session.access_token)
        }
        await fetchSubscription(session.user.id)
      } else {
        setUser(null)
        setSubscription(null)
        localStorage.removeItem('access_token')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
      setSubscription(null)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [fetchSubscription])

  useEffect(() => {
    // Initial fetch
    fetchUser()

    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setSubscription(null)
          localStorage.removeItem('access_token')
          setLoading(false)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user)
            if (session.access_token) {
              localStorage.setItem('access_token', session.access_token)
            }
            // Fetch subscription in background without blocking
            fetchSubscription(session.user.id)
          }
          setLoading(false)
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            setUser(session.user)
            if (session.access_token) {
              localStorage.setItem('access_token', session.access_token)
            }
            fetchSubscription(session.user.id)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      authSubscription.unsubscribe()
    }
  }, [fetchUser, fetchSubscription])

  const refetch = useCallback(() => {
    if (user?.id) {
      fetchSubscription(user.id)
    }
  }, [user?.id, fetchSubscription])

  return (
    <UserContext.Provider value={{ user, loading, subscription, refetch }}>
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
