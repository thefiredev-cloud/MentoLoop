'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
import { DashboardContainer, DashboardGrid, DashboardSection } from '@/components/dashboard/dashboard-container'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  GraduationCap,
  Stethoscope,
  TrendingUp,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  Building,
  Target
} from 'lucide-react'
import Link from 'next/link'

export default function EnterpriseDashboardPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseDashboardContent />
    </RoleGuard>
  )
}

function EnterpriseDashboardContent() {
  const user = useQuery(api.users.current)
  
  // Mock data for now - will be replaced with actual API calls
  const dashboardStats = {
    totalStudents: 45,
    activeRotations: 12,
    totalPreceptors: 28,
    completionRate: 89,
    pendingApprovals: 3,
    upcomingRotations: 8
  }

  const recentActivity = [
    {
      id: '1',
      type: 'system' as const,
      title: 'New Student Enrolled',
      description: 'Sarah Johnson joined the program',
      timestamp: Date.now() - 3600000,
      status: 'success' as const
    },
    {
      id: '2',
      type: 'rotation' as const,
      title: 'Rotation Completed',
      description: 'Michael Chen completed Family Medicine rotation',
      timestamp: Date.now() - 7200000,
      status: 'info' as const
    },
    {
      id: '3',
      type: 'match' as const,
      title: 'New Match Created',
      description: 'Emily Davis matched with Dr. Robert Smith',
      timestamp: Date.now() - 10800000,
      status: 'success' as const
    }
  ]

  const quickActions = [
    {
      id: 'students',
      title: 'Manage Students',
      description: 'View and manage enrolled students',
      icon: GraduationCap,
      href: '/dashboard/enterprise/students',
      badge: dashboardStats.pendingApprovals > 0 ? {
        text: dashboardStats.pendingApprovals.toString(),
        variant: 'destructive' as const
      } : undefined
    },
    {
      id: 'preceptors',
      title: 'Manage Preceptors',
      description: 'View and manage preceptor network',
      icon: Stethoscope,
      href: '/dashboard/enterprise/preceptors',
      variant: 'outline' as const
    },
    {
      id: 'reports',
      title: 'Generate Reports',
      description: 'Create compliance and progress reports',
      icon: FileText,
      href: '/dashboard/enterprise/reports',
      variant: 'outline' as const
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Track program performance metrics',
      icon: BarChart3,
      href: '/dashboard/enterprise/analytics',
      variant: 'outline' as const
    }
  ]

  return (
    <DashboardContainer
      title={`Welcome back, ${user?.name || 'Administrator'}!`}
      subtitle="Enterprise Program Management Dashboard"
      headerAction={
        <div className="flex items-center gap-2">
          <Badge variant="default">
            <Building className="h-3 w-3 mr-1" />
            Enterprise Account
          </Badge>
        </div>
      }
    >
      {/* Quick Stats */}
      <DashboardGrid columns={4}>
        <StatsCard
          title="Total Students"
          value={dashboardStats.totalStudents}
          icon={GraduationCap}
          description="Enrolled in program"
          badge={{
            text: '+5 this month',
            variant: 'default'
          }}
        />

        <StatsCard
          title="Active Rotations"
          value={dashboardStats.activeRotations}
          icon={Calendar}
          description="Currently in progress"
        />

        <StatsCard
          title="Preceptor Network"
          value={dashboardStats.totalPreceptors}
          icon={Stethoscope}
          description="Available preceptors"
        />

        <StatsCard
          title="Completion Rate"
          value={`${dashboardStats.completionRate}%`}
          icon={TrendingUp}
          progress={{
            value: dashboardStats.completionRate,
            max: 100
          }}
          description="Overall program success"
        />
      </DashboardGrid>

      {/* Main Content Grid */}
      <DashboardSection>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <QuickActions
            title="Quick Actions"
            actions={quickActions}
            columns={2}
          />

          {/* Program Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Program Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Approvals</span>
                  <Badge variant={dashboardStats.pendingApprovals > 0 ? 'destructive' : 'secondary'}>
                    {dashboardStats.pendingApprovals}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Upcoming Rotations</span>
                  <Badge variant="outline">
                    {dashboardStats.upcomingRotations}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Students</span>
                  <span className="font-medium">{dashboardStats.totalStudents}</span>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/dashboard/enterprise/students">
                        View Students
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href="/dashboard/enterprise/reports">
                        Generate Report
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      {/* Activity Feed */}
      <DashboardSection>
        <ActivityFeed
          activities={recentActivity}
          title="Recent Activity"
          maxItems={5}
        />
      </DashboardSection>
    </DashboardContainer>
  )
}