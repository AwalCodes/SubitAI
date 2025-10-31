'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { setAuthTokens } from '@/lib/api'
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

  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error getting Supabase user:', error)
      }
      console.log('Fetched user:', user)
      setUser(user)

      if (user) {
        const { data: sessionData } = await supabase.auth.getSession()
        setAuthTokens(sessionData.session?.access_token ?? null)
        // Fetch user subscription (optional)
        try {
          const response = await fetch('/api/billing/subscription', {
            headers: {
              'Authorization': `Bearer ${sessionData.session?.access_token ?? ''}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setSubscription(data.subscription)
          }
        } catch (error) {
          console.log('No subscription endpoint available')
        }
      } else {
        setSubscription(null)
        setAuthTokens(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user)
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null)
          setAuthTokens(session?.access_token ?? null)
          await fetchUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSubscription(null)
          setAuthTokens(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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