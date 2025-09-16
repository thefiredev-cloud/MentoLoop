'use client'

import { useAuth, useClerk } from '@clerk/nextjs'
import logger from '@/lib/logger'
import { useCallback } from 'react'

export function useAuthModal() {
  const { isSignedIn, isLoaded } = useAuth()
  const { openSignIn, openSignUp } = useClerk()

  const safeOpenSignIn = useCallback((props?: any) => {
    // Prevent opening sign-in modal if user is already signed in
    if (isLoaded && isSignedIn) {
      logger.debug('User is already signed in, redirecting to dashboard')
      window.location.href = '/dashboard'
      return
    }
    
    // Only open modal if user is not signed in
    if (isLoaded && !isSignedIn) {
      openSignIn(props)
    }
  }, [isLoaded, isSignedIn, openSignIn])

  const safeOpenSignUp = useCallback((props?: any) => {
    // Prevent opening sign-up modal if user is already signed in
    if (isLoaded && isSignedIn) {
      logger.debug('User is already signed in, redirecting to dashboard')
      window.location.href = '/dashboard'
      return
    }
    
    // Only open modal if user is not signed in
    if (isLoaded && !isSignedIn) {
      openSignUp(props)
    }
  }, [isLoaded, isSignedIn, openSignUp])

  return {
    openSignIn: safeOpenSignIn,
    openSignUp: safeOpenSignUp,
    isSignedIn,
    isLoaded
  }
}
