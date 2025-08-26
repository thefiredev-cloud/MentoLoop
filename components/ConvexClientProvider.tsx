'use client'

import { ReactNode, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@clerk/nextjs'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

// Error boundary component for authentication errors
function AuthErrorBoundary({ children, error }: { children: ReactNode; error: Error | null }) {
  if (error) {
    console.error('Authentication error:', error)
    // In production, you might want to show a user-friendly error message
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Authentication Error</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            There was an error connecting to our servers. Please refresh the page.
          </p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

// Loading component for authentication state
function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

// Dynamically import ConvexProviderWithClerk to prevent SSR issues
const ConvexProviderWrapper = dynamic(
  () => Promise.all([
    import('convex/react-clerk'),
    import('@clerk/nextjs'),
    import('convex/react')
  ]).then(([clerkReactMod, clerkMod, convexMod]) => {
    const convex = new convexMod.ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
      // Add retry logic for WebSocket connections
      maxReconnectAttempts: 5,
      reconnectBackoff: (attemptNumber: number) => {
        // Exponential backoff with jitter
        const baseDelay = Math.min(1000 * Math.pow(2, attemptNumber), 30000)
        const jitter = Math.random() * 1000
        return baseDelay + jitter
      }
    } as any)
    
    return {
      default: function ConvexProvider({ children }: { children: ReactNode }) {
        const [authError, setAuthError] = useState<Error | null>(null)
        const { isLoaded, isSignedIn } = clerkMod.useAuth()

        // Handle authentication errors
        useEffect(() => {
          const handleAuthError = (error: any) => {
            // Only set error for actual authentication failures, not loading states
            if (error?.message?.includes('No auth provider found') && isLoaded && isSignedIn) {
              console.warn('Auth provider mismatch detected, will retry...')
              // Clear error after a delay to allow retry
              setTimeout(() => setAuthError(null), 2000)
            }
          }

          // Listen for Convex connection errors
          if (typeof window !== 'undefined') {
            window.addEventListener('unhandledrejection', (event) => {
              if (event.reason?.message?.includes('auth')) {
                handleAuthError(event.reason)
              }
            })
          }

          return () => {
            if (typeof window !== 'undefined') {
              window.removeEventListener('unhandledrejection', () => {})
            }
          }
        }, [isLoaded, isSignedIn])

        // Show loading state while Clerk is initializing
        if (!isLoaded) {
          return <AuthLoading />
        }

        return (
          <AuthErrorBoundary error={authError}>
            <clerkReactMod.ConvexProviderWithClerk 
              client={convex} 
              useAuth={clerkMod.useAuth}
            >
              {children}
            </clerkReactMod.ConvexProviderWithClerk>
          </AuthErrorBoundary>
        )
      }
    }
  }),
  { 
    ssr: false, // Critical: prevents SSR to avoid Clerk context issues
    loading: () => <AuthLoading />
  }
)

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWrapper>
      {children}
    </ConvexProviderWrapper>
  )
}