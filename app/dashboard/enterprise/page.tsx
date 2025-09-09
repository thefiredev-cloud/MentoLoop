'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  Stethoscope,
  TrendingUp,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  Building,
  Shield
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
  
  // Get enterprise ID from user context
  const enterpriseId = user?.enterpriseId as Id<"enterprises"> | undefined
  
  const dashboardStats = useQuery(api.enterprises.getEnterpriseDashboardStats, 
    enterpriseId ? { enterpriseId } : "skip"
  )

  if (user && !enterpriseId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Enterprise Account</h2>
          <p className="text-muted-foreground">Your account is not associated with an enterprise.</p>
          <p className="text-sm text-muted-foreground mt-2">Please contact support if you believe this is an error.</p>
        </div>
      </div>
    )
  }

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || 'Administrator'}!
        </h1>
        <p className="text-muted-foreground">
          Enterprise Program Management Dashboard - {dashboardStats.enterprise.name}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.pendingApprovals > 0 && `${dashboardStats.pendingApprovals} pending approval`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rotations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeRotations}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.upcomingRotations} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preceptor Network</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalPreceptors}</div>
            <p className="text-xs text-muted-foreground">Available preceptors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.completionRate}%</div>
            <div className="mt-2 w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${dashboardStats.completionRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Program success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/enterprise/students">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Students</h3>
                  <p className="text-sm text-muted-foreground">View enrolled students</p>
                  {dashboardStats.pendingApprovals > 0 && (
                    <Badge className="mt-1" variant="destructive">
                      {dashboardStats.pendingApprovals} pending
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/enterprise/preceptors">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Preceptor Network</h3>
                  <p className="text-sm text-muted-foreground">Manage preceptors</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/enterprise/reports">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Reports</h3>
                  <p className="text-sm text-muted-foreground">Generate reports</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/enterprise/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-orange-100 p-3 mr-4">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track performance</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/enterprise/compliance">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Compliance</h3>
                  <p className="text-sm text-muted-foreground">Monitor compliance</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/enterprise/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-pink-100 p-3 mr-4">
                  <Settings className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage preferences</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Enterprise Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6 text-center">
          <Building className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Enterprise Account Active</h3>
          <p className="text-muted-foreground mb-4">
            Managing {dashboardStats.totalStudents} students and {dashboardStats.totalPreceptors} preceptors
          </p>
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
            {dashboardStats.enterprise.status} Status
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}