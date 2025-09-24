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


// Hook to capture request errors from nested React Server Components
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#errors-from-nested-react-server-components
export function onRequestError(err: unknown) {
  try {
    if (typeof Sentry.captureRequestError === 'function') {
      // @ts-ignore
      Sentry.captureRequestError(err)
    } else {
      Sentry.captureException(err instanceof Error ? err : new Error(String(err)))
    }
  } catch {
    // no-op
  }
}


