'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

interface UseCurrentUserOptions {
  // Whether to automatically sync user if not found
  autoSync?: boolean
  // Custom error handler
  onError?: (error: Error) => void
  // Custom loading component
  loadingFallback?: React.ReactNode
  // Custom error component
  errorFallback?: React.ReactNode
}

export function useCurrentUser(options: UseCurrentUserOptions = {}) {
  const { autoSync = true, onError } = options
  const { isLoaded, isSignedIn, userId: clerkUserId } = useAuth()
  const currentUser = useQuery(api.users.current)
  const ensureUserExists = useMutation(api.users.ensureUserExists)
  
  const [issyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<Error | null>(null)
  const [hasSyncAttempted, setHasSyncAttempted] = useState(false)
  const [lastClerkId, setLastClerkId] = useState<string | null>(null)

  // Detect Clerk ID changes (user switch)
  useEffect(() => {
    if (clerkUserId && clerkUserId !== lastClerkId) {
      console.log(`[useCurrentUser] Clerk ID changed from ${lastClerkId} to ${clerkUserId}`)
      setLastClerkId(clerkUserId)
      setHasSyncAttempted(false) // Reset sync attempt for new user
      setSyncError(null)
    }
  }, [clerkUserId, lastClerkId])

  useEffect(() => {
    const syncUser = async () => {
      // Only sync if:
      // 1. User is authenticated
      // 2. User data is not found
      // 3. Auto-sync is enabled
      // 4. We haven't already attempted sync for this Clerk ID
      if (
        isLoaded && 
        isSignedIn && 
        currentUser === null && 
        autoSync && 
        !hasSyncAttempted && 
        !issyncing &&
        clerkUserId
      ) {
        setIsSyncing(true)
        setHasSyncAttempted(true)
        
        console.log(`[useCurrentUser] Starting user sync for Clerk ID: ${clerkUserId}`)
        
        try {
          const result = await ensureUserExists()
          console.log(`[useCurrentUser] User sync successful:`, result)
          setSyncError(null)
        } catch (error) {
          const err = error as Error
          setSyncError(err)
          onError?.(err)
          console.error('[useCurrentUser] Failed to sync user:', {
            error: err.message,
            clerkId: clerkUserId,
            timestamp: new Date().toISOString()
          })
        } finally {
          setIsSyncing(false)
        }
      }
    }

    syncUser()
  }, [isLoaded, isSignedIn, currentUser, autoSync, hasSyncAttempted, issyncing, ensureUserExists, onError, clerkUserId])

  // Reset sync attempt when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setHasSyncAttempted(false)
      setSyncError(null)
    }
  }, [isLoaded, isSignedIn])

  return {
    user: currentUser,
    isLoading: !isLoaded || currentUser === undefined || issyncing,
    isAuthenticated: isSignedIn,
    error: syncError,
    refetch: async () => {
      setHasSyncAttempted(false)
      setSyncError(null)
    }
  }
}

// HOC to wrap components that require user authentication
export function withCurrentUser<P extends object>(
  Component: React.ComponentType<P & { currentUser: any }>,
  options: UseCurrentUserOptions = {}
) {
  return function WrappedComponent(props: P) {
    const { user, isLoading, error } = useCurrentUser(options)
    
    if (isLoading) {
      return options.loadingFallback || (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }
    
    if (error) {
      return options.errorFallback || (
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-destructive">Failed to load user profile</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-xs text-primary hover:underline"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    
    if (!user) {
      return options.errorFallback || (
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">User not found</p>
          </div>
        </div>
      )
    }
    
    return <Component {...props} currentUser={user} />
  }
}