import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  try {
    const slug = 'mentoloop-heartbeat'
    let checkInId: string | undefined
    try {
      if (typeof Sentry.captureCheckIn === 'function') {
        checkInId = Sentry.captureCheckIn({ monitorSlug: slug, status: 'ok' })
      } else {
        Sentry.captureMessage(`heartbeat:${slug}`)
      }
    } catch (e) {
      Sentry.captureException(e instanceof Error ? e : new Error(String(e)))
    }
    return NextResponse.json({ ok: true, slug, checkInId }, { status: 200 })
  } catch (e) {
    try {
      Sentry.captureException(e instanceof Error ? e : new Error(String(e)))
    } catch {}
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


