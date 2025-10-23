'use client'

import { createContext, useContext, useEffect, useState } from 'react'
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

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Fetched session:', session?.user)
      setUser(session?.user ?? null)
      setSubscription(null) // Skip subscription for now
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
      setSubscription(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setUser(session?.user ?? null)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSubscription(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
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