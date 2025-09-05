'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@clerk/nextjs'

export function UserSyncWrapper({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const ensureUserExists = useMutation(api.users.ensureUserExists)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const syncAttemptRef = useRef(0)
  const lastUserIdRef = useRef<string | null>(null)
  const maxRetries = 3

  useEffect(() => {
    const syncUser = async () => {
      // Don't sync if not loaded or not signed in
      if (!isLoaded || !isSignedIn || !userId) {
        setSyncStatus('idle')
        return
      }
      
      // If user changed, reset sync status
      if (lastUserIdRef.current !== userId) {
        lastUserIdRef.current = userId
        syncAttemptRef.current = 0
        setSyncStatus('idle')
        setSyncError(null)
      }
      
      // Don't sync if already synced for this user
      if (syncStatus === 'synced' || syncStatus === 'syncing') return
      
      // Don't retry if we've exceeded max retries
      if (syncAttemptRef.current >= maxRetries) {
        setSyncStatus('error')
        return
      }
      
      setSyncStatus('syncing')
      syncAttemptRef.current += 1
      
      try {
        const result = await ensureUserExists()
        console.log('[UserSyncWrapper] User sync successful:', {
          userId: result.userId,
          isNew: result.isNew,
          clerkId: result.clerkId,
          attempt: syncAttemptRef.current
        })
        setSyncStatus('synced')
        setSyncError(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[UserSyncWrapper] Failed to sync user (attempt ${syncAttemptRef.current}/${maxRetries}):`, errorMessage)
        
        // Retry with exponential backoff for auth errors
        if (errorMessage.includes('Not authenticated') && syncAttemptRef.current < maxRetries) {
          setSyncError('Waiting for authentication to complete...')
          setSyncStatus('idle') // Reset to idle to allow retry
          // Exponential backoff: 1s, 2s, 4s
          const retryDelay = Math.min(1000 * Math.pow(2, syncAttemptRef.current - 1), 4000)
          setTimeout(() => {
            // Trigger re-render to retry
            setSyncStatus('idle')
          }, retryDelay)
        } else {
          setSyncStatus('error')
          setSyncError('Failed to sync user profile. Please refresh the page.')
          console.error('[UserSyncWrapper] Max retries reached or non-recoverable error.')
        }
      }
    }

    syncUser()
  }, [isLoaded, isSignedIn, userId, ensureUserExists, syncStatus])

  // Reset sync state when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setSyncStatus('idle')
      setSyncError(null)
      syncAttemptRef.current = 0
      lastUserIdRef.current = null
    }
  }, [isLoaded, isSignedIn])

  // Log sync status changes
  useEffect(() => {
    if (syncStatus !== 'idle') {
      console.log('[UserSyncWrapper] Sync status:', syncStatus, syncError || '')
    }
  }, [syncStatus, syncError])

  return <>{children}</>
}