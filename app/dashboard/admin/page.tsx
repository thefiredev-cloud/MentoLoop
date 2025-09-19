'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Brain,
  Mail,
  MessageSquare,
  Target,
  Database,
  BarChart3
} from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminDashboardContent />
    </RoleGuard>
  )
}

type UserDoc = Doc<'users'>
type MatchDoc = Doc<'matches'>
type StudentDoc = Doc<'students'>
type PreceptorDoc = Doc<'preceptors'>
type PaymentAttempt = Doc<'paymentAttempts'>

type MatchWithRelations = MatchDoc & {
  student: StudentDoc | null
  preceptor: PreceptorDoc | null
  aiAnalysis?: MatchDoc['aiAnalysis']
}

function AdminDashboardContent() {
  // Get real admin analytics data
  const allUsersData = useQuery(api.users.getAllUsers) as UserDoc[] | undefined
  const allMatchesData = useQuery(api.matches.getAllMatches, {}) as MatchWithRelations[] | undefined
  const paymentAttemptsData = useQuery(api.paymentAttempts.getAllPaymentAttempts) as PaymentAttempt[] | undefined

  if (!allUsersData || !allMatchesData || !paymentAttemptsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const allUsers = allUsersData
  const allMatches = allMatchesData
  const paymentAttempts = paymentAttemptsData

  // Calculate overview stats from real data
  const overviewStats = {
    totalUsers: allUsers.length,
    activeMatches: allMatches.filter(m => m.status === 'active' || m.status === 'confirmed').length,
    totalRevenue: paymentAttempts.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + (p.amount / 100), 0),
    aiSuccessRate: allMatches.filter(m => m.aiAnalysis).length ? 
      Math.round((allMatches.filter(m => m.aiAnalysis?.confidence === 'high').length / allMatches.filter(m => m.aiAnalysis).length) * 100) : 0,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor platform performance, users, and system health
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.activeMatches}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overviewStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Success Rate</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.aiSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">High confidence matches</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">System Management</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground">Manage all users</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/matches">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Match Management</h3>
                  <p className="text-sm text-muted-foreground">Review all matches</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/emails">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Communications</h3>
                  <p className="text-sm text-muted-foreground">Email & SMS logs</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/finance">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-orange-100 p-3 mr-4">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Financial</h3>
                  <p className="text-sm text-muted-foreground">Payments & revenue</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/audit">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Platform insights</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/sms">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-pink-100 p-3 mr-4">
                  <MessageSquare className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold">SMS Management</h3>
                  <p className="text-sm text-muted-foreground">SMS communications</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* System Health */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <Database className="h-12 w-12 mx-auto text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">System Status: Healthy</h3>
          <p className="text-muted-foreground mb-4">
            All systems operational • {overviewStats.totalUsers} users • {overviewStats.activeMatches} active matches
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-green-600 hover:bg-green-700 text-white px-4 py-2">
              Database: Online
            </Badge>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
              API: Healthy
            </Badge>
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2">
              AI: Operational
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
