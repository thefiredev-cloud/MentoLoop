import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { addSecurityHeaders } from './lib/security-headers'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/student-intake', '/preceptor-intake'])
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/', '/api/webhook(.*)', '/help', '/terms', '/privacy'])
const isStudentRoute = createRouteMatcher(['/dashboard/student(.*)'])
const isPreceptorRoute = createRouteMatcher(['/dashboard/preceptor(.*)'])
const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)'])
const isStudentIntakeRoute = createRouteMatcher(['/student-intake(.*)'])
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  try {
    // Create response object first
    let response = NextResponse.next();
    
    // Add security headers to all responses
    response = addSecurityHeaders(response);
    
    // Handle authentication for protected routes
    if (isProtectedRoute(req)) {
      try {
        // Allow E2E tests to bypass auth redirects
        if (process.env.E2E_TEST === 'true') {
          return response
        }
        await auth.protect()
        
        // Note: User metadata checks are handled by RoleGuard component
        // Middleware only handles basic authentication
      } catch (error) {
        console.error('Auth protection error:', error)
        // Redirect to sign-in on auth error
        return NextResponse.redirect(new URL('/sign-in', req.url))
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