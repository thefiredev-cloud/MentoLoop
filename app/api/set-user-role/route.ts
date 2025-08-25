import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await req.json()
    
    if (!role || !['student', 'preceptor', 'enterprise'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get the user from Convex
    const user = await convex.query(api.users.getUserByClerkId, { clerkId: userId })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update the user's role
    await convex.mutation(api.users.updateUserType, {
      userId: user._id,
      userType: role as 'student' | 'preceptor' | 'enterprise'
    })

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Error setting user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}