import * as Sentry from '@sentry/nextjs'

export async function register() {
  // Initialize Sentry for both Node.js and Edge server runtimes
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    })
  }
}


