import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Initialize Convex client for health checks
const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  responseTime?: number;
  details?: Record<string, unknown>;
}

async function checkService(
  name: string, 
  checkFn: () => Promise<boolean | { success: boolean; details?: Record<string, unknown> }>
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const result = await checkFn();
    const responseTime = Date.now() - startTime;
    
    if (typeof result === 'boolean') {
      return {
        service: name,
        status: result ? 'healthy' : 'unhealthy',
        responseTime
      };
    } else {
      return {
        service: name,
        status: result.success ? 'healthy' : 'unhealthy',
        responseTime,
        details: result.details
      };
    }
  } catch (error) {
    return {
      service: name,
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    };
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();
    
    // For production, you might want to restrict this to admin users only
    // For now, we'll allow any authenticated user to check health
    
    const checks: HealthCheckResult[] = [];
    
    // 1. Check Clerk Authentication
    checks.push(await checkService('Clerk Auth', async () => {
      return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
             !!process.env.CLERK_SECRET_KEY;
    }));
    
    // 2. Check Convex Database
    checks.push(await checkService('Convex Database', async () => {
      try {
        // Try to query users to verify database connection
        await convexClient.query(api.users.getAllUsers);
        return true;
      } catch (error) {
        console.error('Convex check failed:', error);
        return false;
      }
    }));
    
    // 3. Check Stripe Configuration
    checks.push(await checkService('Stripe Payments', async () => {
      const hasKeys = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
                     !!process.env.STRIPE_SECRET_KEY;
      
      if (!hasKeys) return false;
      
      // Check if we're using test or live keys
      const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
      
      return {
        success: hasKeys,
        details: {
          mode: isTestMode ? 'test' : 'live',
          webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET
        }
      };
    }));
    
    // 4. Check SendGrid Email
    checks.push(await checkService('SendGrid Email', async () => {
      const hasConfig = !!process.env.SENDGRID_API_KEY && 
                       !!process.env.SENDGRID_FROM_EMAIL;
      
      return {
        success: hasConfig,
        details: {
          fromEmail: process.env.SENDGRID_FROM_EMAIL || 'not configured'
        }
      };
    }));
    
    // 5. Check Twilio SMS
    checks.push(await checkService('Twilio SMS', async () => {
      const hasConfig = !!process.env.TWILIO_ACCOUNT_SID && 
                       !!process.env.TWILIO_AUTH_TOKEN &&
                       !!process.env.TWILIO_PHONE_NUMBER;
      
      return {
        success: hasConfig,
        details: {
          phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'not configured'
        }
      };
    }));
    
    // 6. Check AI Services
    checks.push(await checkService('OpenAI', async () => {
      return !!process.env.OPENAI_API_KEY;
    }));
    
    checks.push(await checkService('Google Gemini', async () => {
      return !!process.env.GEMINI_API_KEY;
    }));
    
    // 7. Check Environment Configuration
    checks.push(await checkService('Environment', async () => {
      const nodeEnv = process.env.NODE_ENV;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      
      return {
        success: !!nodeEnv && !!appUrl,
        details: {
          environment: nodeEnv || 'not set',
          appUrl: appUrl || 'not configured',
          isProduction: nodeEnv === 'production'
        }
      };
    }));
    
    // Calculate overall health
    const healthyCount = checks.filter(c => c.status === 'healthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }
    
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks,
      summary: {
        total: checks.length,
        healthy: healthyCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount
      },
      dashboardAccess: {
        authenticated: !!userId,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      }
    };
    
    // Set appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : 
                       overallStatus === 'degraded' ? 206 : 503;
    
    return NextResponse.json(response, { status: statusCode });
    
  } catch (error) {
    console.error('Dashboard health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

// Allow OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}