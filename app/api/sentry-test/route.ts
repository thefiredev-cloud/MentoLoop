import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  try {
    const messageId = Sentry.captureMessage('mentoloop sentry test message ' + Date.now())
    const errorId = Sentry.captureException(new Error('mentoloop sentry test error ' + Date.now()))
    return NextResponse.json(
      { ok: true, messageId, errorId },
      { status: 200 }
    )
  } catch (e) {
    try {
      Sentry.captureException(e instanceof Error ? e : new Error(String(e)))
    } catch {}
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


