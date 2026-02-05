'use client'

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs'
import { ReactNode } from 'react'

interface ConditionalClerkProviderProps {
    children: ReactNode
}

/**
 * Wrapper around ClerkProvider that handles invalid/missing publishable keys gracefully.
 * This allows the app to build on Vercel even when the Clerk key is misconfigured,
 * since static page generation (SSG) doesn't need authentication at build time.
 */
export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

    // Check if the key looks like a valid Clerk publishable key (starts with pk_)
    const isValidClerkKey = publishableKey && publishableKey.startsWith('pk_')

    // If no valid Clerk key, render children without Clerk wrapper
    // This allows SSG to work during build without a real Clerk key
    if (!isValidClerkKey) {
        // In development/build, log a warning
        if (typeof window === 'undefined') {
            console.warn(
                '[ConditionalClerkProvider] Invalid or missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. ' +
                'Clerk authentication features will be disabled. ' +
                'Get your key from https://dashboard.clerk.com/last-active?path=api-keys'
            )
        }
        return <>{children}</>
    }

    return <BaseClerkProvider>{children}</BaseClerkProvider>
}
