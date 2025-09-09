'use server'

import { clerkClient } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'

export async function updateUserIntakeMetadata(
  userId: string,
  metadata: {
    intakeCompleted: boolean
    paymentCompleted: boolean
    intakeCompletedAt?: string
    membershipPlan?: string
    userType?: string
    stripeCustomerId?: string
  }
) {
  try {
    const client = await clerkClient()
    
    // Update user's public metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
        userType: metadata.userType || 'student',
      }
    })
    
    // Updated Clerk metadata
    return { success: true }
  } catch (error) {
    // Failed to update Clerk metadata
    throw new Error('Failed to update user metadata')
  }
}

export async function getCurrentUserMetadata() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }
    
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    return user.publicMetadata
  } catch (error) {
    // Failed to get user metadata
    return null
  }
}

export async function markIntakeComplete(userId: string, membershipPlan: string, stripeCustomerId?: string) {
  return updateUserIntakeMetadata(userId, {
    intakeCompleted: true,
    paymentCompleted: true,
    intakeCompletedAt: new Date().toISOString(),
    membershipPlan,
    userType: 'student',
    ...(stripeCustomerId && { stripeCustomerId }),
  })
}

export async function syncStripeCustomerId(userId: string, stripeCustomerId: string) {
  try {
    const client = await clerkClient()
    
    // Update user's public metadata with Stripe customer ID
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        stripeCustomerId,
      }
    })
    
    // Synced Stripe customer ID
    return { success: true }
  } catch (error) {
    // Failed to sync Stripe customer ID
    throw new Error('Failed to sync Stripe customer ID')
  }
}