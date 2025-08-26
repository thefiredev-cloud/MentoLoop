import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getLocationFromIP, getClientIP, validateSupportedLocation } from './lib/location'
import { addSecurityHeaders, configureCORS } from './lib/security-headers'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/student-intake', '/preceptor-intake'])
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/', '/api/webhook(.*)', '/help', '/terms', '/privacy', '/location-restricted'])
const isStudentRoute = createRouteMatcher(['/dashboard/student(.*)'])
const isPreceptorRoute = createRouteMatcher(['/dashboard/preceptor(.*)'])
const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)'])
const isEnterpriseRoute = createRouteMatcher(['/dashboard/enterprise(.*)'])

export default clerkMiddleware(async (auth, req) => {
  try {
    // Create response object first
    let response = NextResponse.next();
    
    // Add security headers to all responses
    response = addSecurityHeaders(response);
    
    // Configure CORS for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      response = configureCORS(req, response);
    }
    
    // Allow public routes and API webhooks without location check
    if (isPublicRoute(req)) {
      if (isProtectedRoute(req)) {
        try {
          await auth.protect()
        } catch (error) {
          console.error('Auth protection error:', error)
          // Redirect to sign-in on auth error
          return NextResponse.redirect(new URL('/sign-in', req.url))
        }
      }
      return response
    }

  // Get client IP for location verification
  const clientIP = getClientIP(req)
  
  // Skip location check for localhost/development
  // ALWAYS skip in development mode to avoid region restrictions during testing
  if (process.env.NODE_ENV !== 'production' || clientIP === '127.0.0.1' || clientIP?.startsWith('192.168.') || clientIP?.startsWith('10.')) {
    if (isProtectedRoute(req)) await auth.protect()
    return response
  }

    // Check if user is accessing from a supported state
    if (clientIP) {
      const locationData = await getLocationFromIP(clientIP)
      
      // Block access from unsupported states
      if (!locationData || !validateSupportedLocation(locationData)) {
        response = NextResponse.redirect(new URL('/location-restricted', req.url))
        return addSecurityHeaders(response)
      }
    }

    // Proceed with normal authentication for users in supported states
    if (isProtectedRoute(req)) {
      try {
        await auth.protect()
      } catch (error) {
        console.error('Route protection error:', error)
        // Redirect to sign-in on auth error
        return NextResponse.redirect(new URL('/sign-in', req.url))
      }
      
      // Role-based route protection
      const { userId } = await auth()
      if (userId && isProtectedRoute(req)) {
        // For now, we'll implement basic route protection
        // In production, you'd fetch user role from database here
        
        // Redirect based on route access (simplified for this middleware)
        const pathname = req.nextUrl.pathname
        
        // Allow general dashboard access for role determination
        if (pathname === '/dashboard') {
          return response
        }
        
        // For now, allow all authenticated users to access their role-specific routes
        // Full role validation will be handled in the dashboard layouts and components
        return response
      }
    }
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On any middleware error, redirect to sign-in for protected routes
    if (isProtectedRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    // For public routes, continue with the request
    return NextResponse.next()
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