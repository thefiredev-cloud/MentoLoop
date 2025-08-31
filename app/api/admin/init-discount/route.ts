import { NextResponse } from 'next/server'
import { api } from '@/convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: Request) {
  try {
    // Check for admin authorization (you should add proper auth here)
    const authHeader = request.headers.get('authorization')
    const adminSecret = process.env.ADMIN_SECRET || 'admin-secret-key'
    
    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Initialize the NP12345 discount code
    const result = await convex.action(api.payments.initializeNPDiscountCode)
    
    return NextResponse.json({
      success: true,
      message: 'Discount code NP12345 initialized successfully',
      result
    })
  } catch (error) {
    console.error('Failed to initialize discount code:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initialize discount code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to initialize the NP12345 discount code',
    instructions: 'Send a POST request with Authorization header: Bearer [admin-secret]'
  })
}