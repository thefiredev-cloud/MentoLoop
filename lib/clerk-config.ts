
// Clerk configuration constants
import { dark } from '@clerk/themes'
export const CLERK_CONFIG = {
  // Sign in/up URLs (code-side configuration as recommended by Clerk)
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
  
  // Fallback redirect URLs - where to redirect after authentication
  signInFallbackRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/dashboard',
  signUpFallbackRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/dashboard',
  
  // Force redirect URLs - always redirect here regardless of where user came from
  signInForceRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL || '/dashboard',
  signUpForceRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || '/dashboard',
  
  // Appearance configuration
  appearance: {
    baseTheme: dark,
    layout: {
      socialButtonsPlacement: 'bottom' as const,
      socialButtonsVariant: 'blockButton' as const,
    },
    variables: {
      colorPrimary: 'hsl(var(--primary))',
      colorTextOnPrimary: 'hsl(var(--primary-foreground))',
      colorBackground: 'hsl(var(--background))',
      colorInputBackground: 'hsl(var(--card))',
      colorText: 'hsl(var(--foreground))',
      colorTextSecondary: 'hsl(var(--muted-foreground))',
      colorDanger: 'hsl(var(--destructive))',
      colorSuccess: 'hsl(var(--success))',
      colorWarning: 'hsl(var(--warning))',
      colorNeutral: 'hsl(var(--muted-foreground))',
      borderRadius: '0.5rem',
      fontFamily: 'var(--font-geist-sans)',
      colorAlphaShade: 'hsla(var(--primary),0.08)',
      colorInputText: 'hsl(var(--foreground))',
      colorInputBorder: 'hsla(var(--border),0.6)',
      colorShimmer: 'hsla(var(--primary),0.12)',
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
  // Parse domain from publishable key (Clerk's recommended approach)
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
  
  // For live keys, extract the encoded domain
  if (key.startsWith('pk_live_')) {
    try {
      // Live keys have the domain base64 encoded after pk_live_
      const encodedDomain = key.substring(8).split('$')[0]
      const domain = Buffer.from(encodedDomain, 'base64').toString('utf-8')
      return `https://${domain}`
    } catch (error) {
      console.warn('Failed to parse Clerk live key domain', error)
      return 'https://loved-lamprey-34.clerk.accounts.dev'
    }
  }
  
  // For test keys, extract the subdomain
  const match = key.match(/pk_test_(.+?)\./)
  if (match) {
    return `https://${match[1]}.clerk.accounts.dev`
  }
  
  return 'https://loved-lamprey-34.clerk.accounts.dev'
}

// Helper to get OAuth redirect URLs for current environment
export function getOAuthRedirectUrls(): string[] {
  const normalizeUrl = (url: string | undefined): string | null => {
    if (!url) return null
    const trimmed = url.trim().replace(/\/$/, '')
    if (!trimmed) return null
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`.replace(/\/$/, '')
    }
    return trimmed
  }

  const defaultAppUrl = 'http://localhost:3000'
  const primaryAppUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) || defaultAppUrl
  const defaultNetlifyUrl = 'https://bejewelled-cassata-453411.netlify.app'
  const candidateFallbackUrls = [
    process.env.NEXT_PUBLIC_FALLBACK_APP_URL,
    process.env.NEXT_PUBLIC_SANDBOX_APP_URL,
    process.env.NETLIFY_LIVE_URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.URL,
    process.env.NETLIFY_SITE_URL,
    process.env.NETLIFY_VCS_URL,
    defaultNetlifyUrl,
  ]

  const basePaths = ['/sso-callback/google', '/sign-in', '/sign-up', '/dashboard']
  const urls = new Set<string>()

  basePaths.forEach((path) => {
    urls.add(`${primaryAppUrl}${path}`)
  })

  if (process.env.NODE_ENV === 'production') {
    candidateFallbackUrls
      .map((url) => normalizeUrl(url))
      .filter((url): url is string => Boolean(url))
      .forEach((url) => {
        basePaths.forEach((path) => {
          urls.add(`${url}${path}`)
        })
      })
  }

  return Array.from(urls)
}
