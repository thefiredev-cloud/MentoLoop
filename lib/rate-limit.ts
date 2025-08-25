import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  interval?: number; // Time window in milliseconds
  maxRequests?: number; // Maximum requests per interval
  skipSuccessfulRequests?: boolean; // Only count failed requests
  skipFailedRequests?: boolean; // Only count successful requests
}

const defaultOptions: RateLimitOptions = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export class RateLimiter {
  private options: Required<RateLimitOptions>;
  
  constructor(options?: RateLimitOptions) {
    this.options = { ...defaultOptions, ...options } as Required<RateLimitOptions>;
  }
  
  private getKey(identifier: string, endpoint?: string): string {
    return endpoint ? `${identifier}:${endpoint}` : identifier;
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
      if (data.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  public async check(identifier: string, endpoint?: string): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
    limit: number;
  }> {
    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      this.cleanup();
    }
    
    const key = this.getKey(identifier, endpoint);
    const now = Date.now();
    const resetTime = now + this.options.interval;
    
    let data = rateLimitStore.get(key);
    
    if (!data || data.resetTime < now) {
      data = { count: 1, resetTime };
      rateLimitStore.set(key, data);
      
      return {
        success: true,
        remaining: this.options.maxRequests - 1,
        reset: resetTime,
        limit: this.options.maxRequests,
      };
    }
    
    if (data.count >= this.options.maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: data.resetTime,
        limit: this.options.maxRequests,
      };
    }
    
    data.count++;
    rateLimitStore.set(key, data);
    
    return {
      success: true,
      remaining: this.options.maxRequests - data.count,
      reset: data.resetTime,
      limit: this.options.maxRequests,
    };
  }
  
  public reset(identifier: string, endpoint?: string): void {
    const key = this.getKey(identifier, endpoint);
    rateLimitStore.delete(key);
  }
}

// Specific rate limiters for different purposes
export const apiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

export const authRateLimiter = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 failed attempts per 15 minutes
});

export const webhookRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  maxRequests: 50, // 50 webhook calls per minute
});

// Helper function to get client identifier
export function getClientIdentifier(request: NextRequest): string {
  // Try to get authenticated user ID first
  const userId = request.headers.get('x-user-id');
  if (userId) return `user:${userId}`;
  
  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

// Middleware helper for rate limiting
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options?: RateLimitOptions
): Promise<NextResponse> {
  const limiter = new RateLimiter(options);
  const identifier = getClientIdentifier(request);
  const endpoint = request.nextUrl.pathname;
  
  const { success, remaining, reset, limit } = await limiter.check(identifier, endpoint);
  
  if (!success) {
    const response = NextResponse.json(
      {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      { status: 429 }
    );
    
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', reset.toString());
    response.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString());
    
    return response;
  }
  
  const response = await handler();
  
  // Add rate limit headers to successful responses
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  
  return response;
}

// Helper for protecting against brute force attacks
export class BruteForceProtection {
  private attempts = new Map<string, { count: number; blockedUntil?: number }>();
  private readonly maxAttempts = 5;
  private readonly blockDuration = 15 * 60 * 1000; // 15 minutes
  
  public recordFailedAttempt(identifier: string): { blocked: boolean; remainingAttempts: number } {
    const now = Date.now();
    let data = this.attempts.get(identifier);
    
    if (!data) {
      data = { count: 1 };
      this.attempts.set(identifier, data);
      return { blocked: false, remainingAttempts: this.maxAttempts - 1 };
    }
    
    if (data.blockedUntil && data.blockedUntil > now) {
      return { blocked: true, remainingAttempts: 0 };
    }
    
    data.count++;
    
    if (data.count >= this.maxAttempts) {
      data.blockedUntil = now + this.blockDuration;
      this.attempts.set(identifier, data);
      return { blocked: true, remainingAttempts: 0 };
    }
    
    this.attempts.set(identifier, data);
    return { blocked: false, remainingAttempts: this.maxAttempts - data.count };
  }
  
  public recordSuccessfulAttempt(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  public isBlocked(identifier: string): boolean {
    const data = this.attempts.get(identifier);
    if (!data) return false;
    
    const now = Date.now();
    if (data.blockedUntil && data.blockedUntil > now) {
      return true;
    }
    
    return false;
  }
  
  public cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.attempts.entries()) {
      if (data.blockedUntil && data.blockedUntil < now) {
        this.attempts.delete(key);
      }
    }
  }
}

export const bruteForceProtection = new BruteForceProtection();