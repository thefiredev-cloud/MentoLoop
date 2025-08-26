'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'

interface AuthContextType {
  isLoading: boolean
  isAuthenticated: boolean
  isConvexReady: boolean
  error: Error | null
  clearError: () => void
  retryConnection: () => void
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  isConvexReady: false,
  error: null,
  clearError: () => {},
  retryConnection: () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded: isClerkLoaded, isSignedIn } = useClerkAuth()
  const { isLoading: isConvexLoading, isAuthenticated: isConvexAuthenticated } = useConvexAuth()
  const { user } = useUser()
  
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isConvexReady, setIsConvexReady] = useState(false)

  // Track overall loading state
  const isLoading = !isClerkLoaded || isConvexLoading

  // Track authentication state
  const isAuthenticated = Boolean(isClerkLoaded && isSignedIn && user)

  // Monitor Convex connection status
  useEffect(() => {
    if (isAuthenticated && !isConvexLoading) {
      // Check if Convex is properly authenticated
      if (isConvexAuthenticated) {
        setIsConvexReady(true)
        setError(null)
        setRetryCount(0)
      } else if (retryCount < 3) {
        // Retry connection after a delay
        const timer = setTimeout(() => {
          console.log(`Retrying Convex connection (attempt ${retryCount + 1}/3)...`)
          setRetryCount(prev => prev + 1)
          // Force a re-render to trigger Convex reconnection
          window.location.reload()
        }, 2000 * (retryCount + 1))
        
        return () => clearTimeout(timer)
      } else {
        // Max retries reached
        setError(new Error('Failed to establish connection with backend services'))
      }
    }
  }, [isAuthenticated, isConvexLoading, isConvexAuthenticated, retryCount])

  // Clear error handler
  const clearError = () => {
    setError(null)
    setRetryCount(0)
  }

  // Manual retry connection
  const retryConnection = () => {
    clearError()
    window.location.reload()
  }

  // Log authentication state changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth State:', {
        isClerkLoaded,
        isSignedIn,
        isConvexLoading,
        isConvexAuthenticated,
        isConvexReady,
        hasUser: Boolean(user),
        error: error?.message
      })
    }
  }, [isClerkLoaded, isSignedIn, isConvexLoading, isConvexAuthenticated, isConvexReady, user, error])

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        isConvexReady,
        error,
        clearError,
        retryConnection
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthState() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthState must be used within AuthProvider')
  }
  return context
}