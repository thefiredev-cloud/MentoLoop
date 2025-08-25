import { NextResponse, NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { withRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  return withRateLimit(
    request,
    async () => {
      try {
        // Verify authentication
        const { userId } = await auth();
        
        if (!userId) {
          const response = NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
          return addSecurityHeaders(response);
        }
        
        // Get user details to check admin role
        const user = await currentUser();
        const userRole = user?.publicMetadata?.role as string | undefined;
        
        // Check for admin role
        if (userRole !== 'admin') {
          const response = NextResponse.json(
            { error: 'Insufficient permissions. Admin access required.' },
            { status: 403 }
          );
          return addSecurityHeaders(response);
        }

    // Basic security metrics that would be collected from various sources
    const metrics = {
      timestamp: new Date().toISOString(),
      period: '24h',
      security: {
        failed_login_attempts: 0, // Would query from failedLogins table
        blocked_ips: 0,
        active_sessions: 0, // Would query from userSessions table
        password_reset_requests: 0,
        account_lockouts: 0,
      },
      compliance: {
        hipaa_violations: 0,
        data_access_logs: 0, // Would query from dataAccessLogs table
        audit_events: 0, // Would query from auditLogs table
        policy_violations: 0,
      },
      performance: {
        average_response_time: 150, // ms
        error_rate: 0.01, // percentage
        uptime: 99.9, // percentage
        requests_per_second: 10.5,
      },
      alerts: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        resolved_24h: 0,
      },
    };

        const response = NextResponse.json(metrics, {
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Content-Type': 'application/json',
          },
        });
        
        return addSecurityHeaders(response);
      } catch (error) {
        console.error('Security metrics error:', error);
        const response = NextResponse.json(
          { error: 'Failed to retrieve security metrics' },
          { status: 500 }
        );
        return addSecurityHeaders(response);
      }
    },
    {
      interval: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests per minute for admin endpoints
    }
  );
}

// Only allow GET requests
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}