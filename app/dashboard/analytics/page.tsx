'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  Activity
} from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'

type UserDoc = Doc<'users'>
type MatchDoc = Doc<'matches'>
type StudentDoc = Doc<'students'>
type PreceptorDoc = Doc<'preceptors'>
type PlatformStatDoc = Doc<'platformStats'>

type MatchWithRelations = MatchDoc & {
  student: StudentDoc | null
  preceptor: PreceptorDoc | null
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  
  // Fetch analytics data from Convex
  const usersData = useQuery(api.users.getAllUsers) as UserDoc[] | undefined
  const matchesData = useQuery(api.matches.getAllMatches, {}) as MatchWithRelations[] | undefined
  const platformStatsData = useQuery(api.platformStats.getActiveStats, {}) as PlatformStatDoc[] | undefined

  const users = usersData ?? []
  const matches = matchesData ?? []
  const platformStats = platformStatsData ?? []
  
  // Helper function to get stat value
  const getStatValue = (metric: string, fallback: string | number) => {
    const stat = platformStats.find((platformStat) => platformStat.metric === metric)
    return stat ? stat.value : fallback
  }
  
  // Calculate metrics
  const totalUsers = users.length
  const totalStudents = users.filter((user) => user.userType === 'student').length
  const totalPreceptors = users.filter((user) => user.userType === 'preceptor').length
  const activeMatches = matches.filter((match) => match.status === 'active').length
  const pendingMatches = matches.filter((match) => match.status === 'pending').length
  const completedMatches = matches.filter((match) => match.status === 'completed').length
  
  // Get dynamic values from platform stats
  const avgResponseTime = getStatValue('avg_response_time', '2.3h')
  const totalInstitutions = getStatValue('total_institutions', 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive platform metrics and insights
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {totalStudents} students • {totalPreceptors} preceptors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMatches}</div>
            <p className="text-xs text-muted-foreground">
              {pendingMatches} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Match Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers > 0 ? Math.round((completedMatches / (activeMatches + completedMatches || 1)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedMatches} successful matches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Match confirmation time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="matches">Match Analytics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <BarChart className="h-8 w-8 mr-2" />
                  User growth chart will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown by user type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Students</span>
                    <span className="text-sm font-medium">{totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Preceptors</span>
                    <span className="text-sm font-medium">{totalPreceptors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Institutions</span>
                    <span className="text-sm font-medium">{totalInstitutions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Statistics</CardTitle>
              <CardDescription>Overview of matching performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{activeMatches}</div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{pendingMatches}</div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{completedMatches}</div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Engagement</CardTitle>
              <CardDescription>User activity and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <Activity className="h-8 w-8 mr-2" />
                Engagement metrics will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Financial performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <DollarSign className="h-8 w-8 mr-2" />
                Revenue analytics will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
