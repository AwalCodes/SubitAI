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
        // Fetch user subscription (optional - don't block on this)
        try {
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('billing')
            .select('plan, status, current_period_start, current_period_end, created_at, updated_at')
            .eq('user_id', user.id)
            .maybeSingle()

          if (subscriptionError && subscriptionError.code !== 'PGRST116') {
            throw subscriptionError
          }

          if (subscriptionData) {
            setSubscription(subscriptionData)
          } else {
            setSubscription(null)
          }
        } catch (error) {
          console.error('Subscription fetch error:', error)
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
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null)
          if (session?.access_token) {
            localStorage.setItem('access_token', session.access_token)
          }
          await fetchUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSubscription(null)
          localStorage.removeItem('access_token')
        } else if (event === 'INITIAL_SESSION') {
          // Handle initial session on page load
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