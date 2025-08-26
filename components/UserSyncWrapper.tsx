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

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !isSignedIn || hasSynced) return
      
      try {
        const result = await ensureUserExists()
        console.log('User sync successful:', result)
        setHasSynced(true)
        setSyncError(null)
      } catch (error) {
        console.error('Failed to sync user:', error)
        setSyncError('Failed to sync user profile. Some features may not work correctly.')
        // Retry after 3 seconds
        setTimeout(() => {
          setHasSynced(false)
        }, 3000)
      }
    }

    syncUser()
  }, [isLoaded, isSignedIn, hasSynced, ensureUserExists])

  // Reset sync state when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setHasSynced(false)
      setSyncError(null)
    }
  }, [isLoaded, isSignedIn])

  if (syncError) {
    console.warn('User sync error:', syncError)
  }

  return <>{children}</>
}