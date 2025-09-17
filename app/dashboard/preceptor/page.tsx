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
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {hasCompletedIntake ? preceptor.personalInfo.fullName.split(' ')[0] : 'Preceptor'}!
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-muted-foreground">Manage your student preceptees and clinical mentoring</p>
          <span className={`text-xs px-2 py-1 rounded ${verification === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {verification === 'verified' ? 'Verified' : verification.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              Status: {payoutsEnabled ? (
                <span className="text-green-600 font-medium">Enabled</span>
              ) : (
                <span className="text-yellow-700 font-medium">{connectStatus === 'none' ? 'Not set up' : connectStatus}</span>
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

        <Card>
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
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <Target className="h-6 w-6 text-blue-600" />
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
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Students</h3>
                  <p className="text-sm text-muted-foreground">Manage current students</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/preceptor/schedule">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-orange-100 p-3 mr-4">
                  <ChartBar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Evaluations</h3>
                  <p className="text-sm text-muted-foreground">Review student progress</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/preceptor/documents">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Documents</h3>
                  <p className="text-sm text-muted-foreground">Manage files</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/messages">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-pink-100 p-3 mr-4">
                  <MessageSquare className="h-6 w-6 text-pink-600" />
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
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <Stethoscope className="h-12 w-12 mx-auto text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
            <p className="text-muted-foreground mb-4">
              Finish setting up your preceptor profile to start receiving student match requests
            </p>
            <Link href="/preceptor-intake">
              <Badge className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2">
                Complete Profile Setup
              </Badge>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
