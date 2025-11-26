'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface UserContextType {
  user: User | null
  loading: boolean
  subscription: any
  refetch: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const supabase = createClient()

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error getting Supabase user:', error)
      }
      setUser(user)

      if (user) {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token
        if (accessToken) {
          localStorage.setItem('access_token', accessToken)
        } else {
          localStorage.removeItem('access_token')
        }
        
        // Fetch user's subscription tier from users table (this is the source of truth)
        try {
          const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', user.id)
            .maybeSingle()

          if (userDataError && userDataError.code !== 'PGRST116') {
            console.error('User data fetch error:', userDataError)
          }

          // Fetch active billing subscription (for Stripe subscriptions)
          try {
            const { data: subscriptionData, error: subscriptionError } = await supabase
              .from('billing')
              .select('plan, status, current_period_start, current_period_end, created_at, updated_at')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .order('current_period_end', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (subscriptionError && subscriptionError.code !== 'PGRST116') {
              console.error('Subscription fetch error:', subscriptionError)
            } else if (subscriptionData) {
              // Check if subscription is still active
              if (subscriptionData.current_period_end) {
                const periodEnd = new Date(subscriptionData.current_period_end)
                if (periodEnd < new Date()) {
                  setSubscription(null)
                } else {
                  // Use billing plan if active, otherwise use subscription_tier from users table
                  setSubscription(subscriptionData)
                }
              } else {
                setSubscription(subscriptionData)
              }
            } else {
              // No active billing subscription, use subscription_tier from users table
              if (userData?.subscription_tier) {
                setSubscription({ plan: userData.subscription_tier, status: 'active' })
              } else {
                setSubscription(null)
              }
            }
          } catch (error) {
            console.error('Subscription fetch error:', error)
            // Fallback to subscription_tier from users table
            if (userData?.subscription_tier) {
              setSubscription({ plan: userData.subscription_tier, status: 'active' })
            } else {
              setSubscription(null)
            }
          }
        } catch (error) {
          console.error('User data fetch error:', error)
          setSubscription(null)
        }
      } else {
        setSubscription(null)
        localStorage.removeItem('access_token')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
      setSubscription(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setUser(session?.user ?? null)
          if (session?.access_token) {
            localStorage.setItem('access_token', session.access_token)
          } else {
            localStorage.removeItem('access_token')
          }
          // Refetch user data when auth state changes to get updated subscription tier
          if (session?.user) {
            await fetchUser()
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSubscription(null)
          localStorage.removeItem('access_token')
        } else if (event === 'INITIAL_SESSION') {
          // Handle initial session on page load without extra auth calls
          if (session?.user) {
            setUser(session.user)
            if (session.access_token) {
              localStorage.setItem('access_token', session.access_token)
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchUser, supabase.auth])

  const refetch = () => {
    fetchUser()
  }

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