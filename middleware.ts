import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getLocationFromIP, getClientIP, validateTexasLocation } from './lib/location'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/', '/api/webhook(.*)'])
const isStudentRoute = createRouteMatcher(['/dashboard/student(.*)'])
const isPreceptorRoute = createRouteMatcher(['/dashboard/preceptor(.*)'])
const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)'])
const isEnterpriseRoute = createRouteMatcher(['/dashboard/enterprise(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes and API webhooks without location check
  if (isPublicRoute(req)) {
    if (isProtectedRoute(req)) await auth.protect()
    return
  }

  // Get client IP for location verification
  const clientIP = getClientIP(req)
  
  // Skip location check for localhost/development
  if (clientIP === '127.0.0.1' || clientIP?.startsWith('192.168.') || clientIP?.startsWith('10.') || process.env.NODE_ENV === 'development') {
    if (isProtectedRoute(req)) await auth.protect()
    return
  }

  try {
    // Check if user is accessing from Texas
    if (clientIP) {
      const locationData = await getLocationFromIP(clientIP)
      
      // Block non-Texas access
      if (!locationData || !validateTexasLocation(locationData)) {
        return NextResponse.redirect(new URL('/location-restricted', req.url))
      }
    }

    // Proceed with normal authentication for Texas users
    if (isProtectedRoute(req)) {
      await auth.protect()
      
      // Role-based route protection
      const { userId } = auth()
      if (userId && isProtectedRoute(req)) {
        // For now, we'll implement basic route protection
        // In production, you'd fetch user role from database here
        
        // Redirect based on route access (simplified for this middleware)
        const pathname = req.nextUrl.pathname
        
        // Allow general dashboard access for role determination
        if (pathname === '/dashboard') {
          return NextResponse.next()
        }
        
        // For now, allow all authenticated users to access their role-specific routes
        // Full role validation will be handled in the dashboard layouts and components
        return NextResponse.next()
      }
    }
  } catch (error) {
    console.error('Location verification error:', error)
    // Allow access on location service errors in production, log for monitoring
    if (isProtectedRoute(req)) await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}