'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@clerk/nextjs'

interface UseCurrentUserOptions {
  // Custom error handler
  onError?: (error: Error) => void
  // Custom loading component
  loadingFallback?: React.ReactNode
  // Custom error component
  errorFallback?: React.ReactNode
}

export function useCurrentUser(options: UseCurrentUserOptions = {}) {
  const { isLoaded, isSignedIn } = useAuth()
  const currentUser = useQuery(api.users.current)
  
  // The UserSyncWrapper handles all user syncing
  // This hook only queries the current user
  
  return {
    user: currentUser,
    isLoading: !isLoaded || currentUser === undefined,
    isAuthenticated: isSignedIn,
    error: null, // Errors are handled by UserSyncWrapper
    refetch: async () => {
      // No-op since we don't handle syncing here
      console.log('[useCurrentUser] Refetch requested - sync handled by UserSyncWrapper')
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
              type="button"
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
