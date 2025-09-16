import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null)
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Basic shape validation
    if (payload.type !== 'web-vitals' || typeof payload.metric !== 'object') {
      return NextResponse.json({ error: 'Unsupported payload' }, { status: 400 })
    }

    const { name, value, rating, url, timestamp, userAgent, connection } = payload.metric as Record<string, unknown>

    // Minimal sanitization and logging to server logs (can be replaced with a datastore)
    // eslint-disable-next-line no-console
    console.info('[Analytics] Web Vital:', {
      name,
      value,
      rating,
      url,
      timestamp,
      userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 120) : undefined,
      connection,
    })

    return new NextResponse(null, { status: 204 })
  } catch (e) {
    return NextResponse.json({ error: 'Analytics error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

