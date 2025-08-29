import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse) {
  // Basic Content Security Policy for core functionality
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.accounts.dev https://*.clerk.accounts.dev",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.convex.cloud https://*.clerk.accounts.dev https://api.stripe.com wss://*.convex.cloud https://clerk-telemetry.com",
    "frame-src 'self' https://checkout.stripe.com https://accounts.google.com https://clerk.accounts.dev",
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  // Apply basic security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}