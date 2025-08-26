import { ClerkProvider } from '@clerk/nextjs'

// Clerk configuration constants
export const CLERK_CONFIG = {
  // Sign in/up URLs
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  
  // After auth URLs
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  
  // Force redirect URLs (from environment)
  signInForceRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL || '/dashboard',
  signUpForceRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || '/dashboard',
  signInFallbackRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/dashboard',
  signUpFallbackRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/dashboard',
  
  // Appearance configuration
  appearance: {
    layout: {
      socialButtonsPlacement: 'bottom' as const,
      socialButtonsVariant: 'blockButton' as const,
    },
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#000000',
      colorTextSecondary: '#64748b',
      colorDanger: '#ef4444',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorNeutral: '#6b7280',
      borderRadius: '0.5rem',
      fontFamily: 'var(--font-geist-sans)',
    },
    elements: {
      card: 'shadow-xl',
      headerTitle: 'text-2xl font-bold',
      headerSubtitle: 'text-muted-foreground',
      socialButtonsBlockButton: 'border-2',
      formButtonPrimary: 'bg-primary hover:bg-primary/90',
      footerActionLink: 'text-primary hover:text-primary/90',
      formFieldInput: 'border-input',
      formFieldLabel: 'text-sm font-medium',
      identityPreviewText: 'text-sm',
      identityPreviewEditButtonIcon: 'text-primary',
      formResendCodeLink: 'text-primary',
    }
  },
  
  // Localization
  localization: {
    signIn: {
      start: {
        title: 'Welcome back to MentoLoop',
        subtitle: 'Sign in to continue to your dashboard',
      }
    },
    signUp: {
      start: {
        title: 'Join MentoLoop',
        subtitle: 'Create your account to get started',
      }
    }
  }
}

// Helper to check if we're using development keys
export function isUsingDevKeys(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
  return key.startsWith('pk_test_')
}

// Helper to get the correct Clerk domain
export function getClerkDomain(): string {
  // Use the frontend API URL if available
  if (process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL) {
    return process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL
  }
  
  // Fallback to parsing from publishable key
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
  const match = key.match(/pk_test_(.+?)\./)
  if (match) {
    return `https://${match[1]}.clerk.accounts.dev`
  }
  
  return 'https://loved-lamprey-34.clerk.accounts.dev'
}