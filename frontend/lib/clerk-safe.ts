'use client'

import { useClerk as useClerkOriginal, useAuth as useAuthOriginal, useUser as useUserOriginal } from '@clerk/nextjs'
import { ReactNode, useMemo } from 'react'

/**
 * Check if Clerk is properly configured (key starts with pk_)
 */
function isClerkConfigured(): boolean {
    if (typeof window === 'undefined') return false
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    return Boolean(key && key.startsWith('pk_'))
}

/**
 * Safe wrapper for useClerk that returns a mock when Clerk is not configured
 */
export function useClerk() {
    const configured = isClerkConfigured()

    // Only call the real hook if Clerk is configured
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const clerk = configured ? useClerkOriginal() : null

    // Return a mock that does nothing when Clerk is not configured
    return useMemo(() => {
        if (configured && clerk) {
            return clerk
        }

        // Mock clerk object when not configured
        return {
            signOut: async () => {
                console.warn('[useClerk] Clerk is not configured. Sign out is a no-op.')
                // Clear any local storage auth state
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('supabase.auth.token')
                }
                window.location.href = '/auth/login'
            },
            openSignIn: () => {
                console.warn('[useClerk] Clerk is not configured. Redirecting to login page.')
                window.location.href = '/auth/login'
            },
            openSignUp: () => {
                console.warn('[useClerk] Clerk is not configured. Redirecting to signup page.')
                window.location.href = '/auth/signup'
            },
            openUserProfile: () => {
                console.warn('[useClerk] Clerk is not configured.')
            },
            session: null,
            user: null,
            loaded: true,
            client: null,
        }
    }, [configured, clerk])
}

/**
 * Safe wrapper for useAuth that returns a mock when Clerk is not configured
 */
export function useAuth() {
    const configured = isClerkConfigured()

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const auth = configured ? useAuthOriginal() : null

    return useMemo(() => {
        if (configured && auth) {
            return auth
        }

        // Mock auth object when Clerk is not configured
        return {
            isLoaded: true,
            isSignedIn: false,
            userId: null,
            sessionId: null,
            actor: null,
            orgId: null,
            orgRole: null,
            orgSlug: null,
            orgPermissions: null,
            has: () => false,
            signOut: async () => {
                window.location.href = '/auth/login'
            },
            getToken: async () => null,
        }
    }, [configured, auth])
}

/**
 * Export whether Clerk is configured for components to check
 */
export { isClerkConfigured }
