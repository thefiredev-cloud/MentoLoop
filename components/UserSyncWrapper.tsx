'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@clerk/nextjs'

export function UserSyncWrapper({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const ensureUserExists = useMutation(api.users.ensureUserExists)
  const [hasSynced, setHasSynced] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    const syncUser = async () => {
      // Don't sync if not loaded, not signed in, already synced, or exceeded retries
      if (!isLoaded || !isSignedIn || hasSynced || retryCount >= maxRetries) return
      
      try {
        const result = await ensureUserExists()
        console.log('User sync successful:', result)
        setHasSynced(true)
        setSyncError(null)
        setRetryCount(0) // Reset retry count on success
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to sync user (attempt ${retryCount + 1}/${maxRetries}):`, errorMessage)
        
        // Only retry if it's not an authentication error or we haven't exceeded retries
        if (errorMessage.includes('Not authenticated') && retryCount < maxRetries - 1) {
          setSyncError('Waiting for authentication to complete...')
          // Exponential backoff: 2s, 4s, 8s
          const retryDelay = Math.min(2000 * Math.pow(2, retryCount), 8000)
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, retryDelay)
        } else {
          setSyncError('Failed to sync user profile. Some features may not work correctly.')
          // Don't retry anymore if we've hit max retries
          if (retryCount >= maxRetries - 1) {
            console.error('Max retries reached for user sync. Stopping retry attempts.')
          }
        }
      }
    }

    syncUser()
  }, [isLoaded, isSignedIn, hasSynced, ensureUserExists, retryCount, maxRetries])

  // Reset sync state when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setHasSynced(false)
      setSyncError(null)
      setRetryCount(0)
    }
  }, [isLoaded, isSignedIn])

  if (syncError) {
    console.warn('User sync error:', syncError)
  }

  return <>{children}</>
}