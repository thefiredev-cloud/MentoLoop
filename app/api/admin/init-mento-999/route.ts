import { NextResponse } from 'next/server'
import { api } from '@/convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const adminSecret = process.env.ADMIN_SECRET || 'admin-secret-key'

    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await convex.action(api.payments.createDiscountCoupon, {
      code: 'MENTO12345',
      percentOff: 99.9,
      duration: 'once',
      metadata: {
        description: '99.9% off for special promotion',
        createdBy: 'admin_api',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Discount code MENTO12345 (99.9%) initialized successfully',
      result,
    })
  } catch (error) {
    console.error('Failed to initialize MENTO12345 (99.9%)', error)
    return NextResponse.json(
      {
        error: 'Failed to initialize MENTO12345',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
