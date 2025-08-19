'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

// Dynamically import ConvexProviderWithClerk to prevent SSR issues
// This ensures that the Clerk authentication context is properly available
// before the ConvexProviderWithClerk tries to use it
const ConvexProviderWrapper = dynamic(
  () => Promise.all([
    import('convex/react-clerk'),
    import('@clerk/nextjs'),
    import('convex/react')
  ]).then(([clerkReactMod, clerkMod, convexMod]) => {
    const convex = new convexMod.ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    
    return {
      default: function ConvexProvider({ children }: { children: ReactNode }) {
        return (
          <clerkReactMod.ConvexProviderWithClerk client={convex} useAuth={clerkMod.useAuth}>
            {children}
          </clerkReactMod.ConvexProviderWithClerk>
        )
      }
    }
  }),
  { 
    ssr: false, // Critical: prevents SSR to avoid Clerk context issues
    loading: () => null // Prevent layout shift during loading
  }
)

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWrapper>
      {children}
    </ConvexProviderWrapper>
  )
}