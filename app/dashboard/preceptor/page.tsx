'use client'

import { useAction, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Calendar, 
  FileText,
  Stethoscope,
  Target,
  ChartBar,
  DollarSign,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

export default function PreceptorDashboard() {
  return (
    <RoleGuard requiredRole="preceptor">
      <PreceptorDashboardContent />
    </RoleGuard>
  )
}

function PreceptorDashboardContent() {
  const user = useQuery(api.users.current)
  const dashboardStats = useQuery(api.preceptors.getPreceptorDashboardStats)
  const earnings = useQuery(api.preceptors.getPreceptorEarnings)
  const createAccountLink = useAction(api.payments.createPreceptorAccountLink)
  const refreshStatus = useAction(api.payments.refreshPreceptorConnectStatus)

  if (!user) {
    return <div>Loading...</div>
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

  const { preceptor } = dashboardStats
  const hasCompletedIntake = !!preceptor
  const verification = preceptor?.verificationStatus || 'pending'
  const connectStatus = preceptor?.stripeConnectStatus || 'none'
  const payoutsEnabled = !!preceptor?.payoutsEnabled

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight dashboard-gradient-text">
          Welcome back, {hasCompletedIntake ? preceptor.personalInfo.fullName.split(' ')[0] : 'Preceptor'}!
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-muted-foreground">Manage your student preceptees and clinical mentoring</p>
          <span className={`text-xs px-2 py-1 rounded border ${verification === 'verified' ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}`}>
            {verification === 'verified' ? 'Verified' : verification.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeStudentsCount}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.pendingMatchesCount > 0 && `${dashboardStats.pendingMatchesCount} pending matches`}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              Status: {payoutsEnabled ? (
                <span className="text-success font-medium">Enabled</span>
              ) : (
                <span className="text-warning font-medium">{connectStatus === 'none' ? 'Not set up' : connectStatus}</span>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="text-sm underline"
                onClick={async () => {
                  try {
                    const { url } = await createAccountLink({})
                    if (url) {
                      window.location.href = url
                    } else {
                      console.error('Stripe account link missing URL')
                    }
                  } catch (error) {
                    console.error('Failed to create account link', error)
                  }
                }}
              >
                {payoutsEnabled ? 'Manage in Stripe' : 'Setup Payments'}
              </button>
              <button
                className="text-sm underline text-muted-foreground"
                onClick={async () => {
                  try {
                    await refreshStatus({})
                  } catch (error) {
                    console.error('Failed to refresh connect status', error)
                  }
                }}
              >
                Refresh
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating card removed for non-admin views */}

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${earnings ? (earnings.totalEarnings / 100).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              ${earnings ? (earnings.pendingEarnings / 100).toFixed(2) : '0.00'} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/preceptor/matches">
            <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-info/10 p-3 mr-4">
                  <Target className="h-6 w-6 text-info" />
                </div>
                <div>
                  <h3 className="font-semibold">Review Matches</h3>
                  <p className="text-sm text-muted-foreground">Review student requests</p>
                  {dashboardStats.pendingMatchesCount > 0 && (
                    <Badge className="mt-1" variant="destructive">
                      {dashboardStats.pendingMatchesCount} pending
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/preceptor/students">
            <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-success/10 p-3 mr-4">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">My Students</h3>
                  <p className="text-sm text-muted-foreground">Manage current students</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/preceptor/schedule">
            <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Schedule</h3>
                  <p className="text-sm text-muted-foreground">Manage availability</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/preceptor/evaluations">
            <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-warning/10 p-3 mr-4">
                  <ChartBar className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">Evaluations</h3>
                  <p className="text-sm text-muted-foreground">Review student progress</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/preceptor/documents">
            <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-warning/10 p-3 mr-4">
                  <FileText className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">Documents</h3>
                  <p className="text-sm text-muted-foreground">Manage files</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/messages">
            <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-accent/10 p-3 mr-4">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-sm text-muted-foreground">Chat with students</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Profile Setup CTA */}
      {!hasCompletedIntake && (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent className="p-6 text-center">
            <Stethoscope className="h-12 w-12 mx-auto text-warning mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
            <p className="text-muted-foreground mb-4">
              Finish setting up your preceptor profile to start receiving student match requests
            </p>
            <Link href="/preceptor-intake">
              <Badge className="bg-warning hover:bg-warning/90 text-warning-foreground px-4 py-2">
                Complete Profile Setup
              </Badge>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
