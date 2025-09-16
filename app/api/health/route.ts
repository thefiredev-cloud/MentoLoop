import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

type HealthResults = {
  status: 'ok' | 'error'
  checks: Record<string, unknown>
  responseMs?: number
}

function bool(val: unknown) {
  return !!val && String(val).length > 0
}

export async function GET() {
  const startedAt = Date.now()
  const results: HealthResults = {
    status: 'ok',
    checks: {},
  }

  // Env presence checks (do not return secret values)
  const envPresence = {
    NEXT_PUBLIC_CONVEX_URL: bool(process.env.NEXT_PUBLIC_CONVEX_URL),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: bool(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    CLERK_SECRET_KEY: bool(process.env.CLERK_SECRET_KEY),
    STRIPE_SECRET_KEY: bool(process.env.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: bool(process.env.STRIPE_WEBHOOK_SECRET),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: bool(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    CONVEX_DEPLOY_KEY: bool(process.env.CONVEX_DEPLOY_KEY),
    OPENAI_API_KEY: bool(process.env.OPENAI_API_KEY),
    GEMINI_API_KEY: bool(process.env.GEMINI_API_KEY),
  }
  results.checks = { ...results.checks, envPresence }

  // Optional external pings (best-effort, never throw)
  const external: Record<string, unknown> = {}

  // Convex reachability
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (convexUrl) {
      const res = await fetch(convexUrl, { method: 'GET' })
      external.convex = { reachable: res.ok, status: res.status }
    } else {
      external.convex = { reachable: false, reason: 'missing_url' }
    }
  } catch (e) {
    external.convex = { reachable: false, error: 'fetch_failed' }
  }

  // Stripe minimal check (list 1 price)
  try {
    const sk = process.env.STRIPE_SECRET_KEY
    if (sk) {
      const res = await fetch('https://api.stripe.com/v1/prices?limit=1', {
        headers: { Authorization: `Bearer ${sk}` },
      })
      external.stripe = { reachable: res.ok, status: res.status }
    } else {
      external.stripe = { reachable: false, reason: 'missing_key' }
    }
  } catch (e) {
    external.stripe = { reachable: false, error: 'fetch_failed' }
  }

  results.checks = { ...results.checks, external }
  results.responseMs = Date.now() - startedAt

  const res = NextResponse.json(results, { status: 200 })
  res.headers.set('cache-control', 'no-store')
  res.headers.set('content-type', 'application/json; charset=utf-8')
  return res
}


