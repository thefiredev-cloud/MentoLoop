'use client'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({ error }: { error: unknown }) {
  try {
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)))
  } catch {}
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-3">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">Please refresh the page or try again.</p>
          </div>
        </div>
      </body>
    </html>
  )
}


