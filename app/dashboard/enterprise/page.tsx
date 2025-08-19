'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users,
  GraduationCap,
  Stethoscope,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  Download
} from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function EnterpriseDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Queries
  const user = useQuery(api.users.current)
  const enterpriseData = useQuery(
    api.enterprises.getByUserId,
    user?._id ? { userId: user._id } : "skip"
  )
  const enterpriseStats = useQuery(
    api.enterprises.getEnterpriseAnalytics,
    enterpriseData?._id ? { enterpriseId: enterpriseData._id } : "skip"
  )

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s clinical education program
          </p>
          {enterpriseData && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-sm">
                {enterpriseData.type === 'school' ? 'Educational Institution' : 
                 enterpriseData.type === 'clinic' ? 'Clinical Site' :
                 enterpriseData.type === 'health-system' ? 'Health System' : enterpriseData.type}
              </Badge>
              <Badge className={enterpriseData.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                {enterpriseData.status}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Students
          </Button>
        </div>
      </div>

      {enterpriseStats && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="preceptors">Preceptors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enterpriseStats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {enterpriseStats.activeStudents} currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Preceptor Partners</CardTitle>
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enterpriseStats.totalPreceptors}</div>
                  <p className="text-xs text-muted-foreground">
                    {enterpriseStats.verifiedPreceptors} verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rotations</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enterpriseStats.activeMatches}</div>
                  <p className="text-xs text-muted-foreground">
                    {enterpriseStats.upcomingMatches} scheduled
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {enterpriseStats.totalMatches > 0 
                      ? Math.round((enterpriseStats.completedMatches / enterpriseStats.totalMatches) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {enterpriseStats.completedMatches} rotations completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Student Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enterpriseStats.recentStudents?.slice(0, 5).map((student: { _id: string; name: string; program: string; year: string; status: string; submittedAt: string }) => (
                      <div key={student._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.program} • {student.year}
                          </p>
                        </div>
                        <Badge 
                          variant={student.status === 'submitted' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {student.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Rotations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enterpriseStats.upcomingRotations?.slice(0, 5).map((rotation: { _id: string; studentName: string; preceptorName: string; specialty: string; startDate: string }) => (
                      <div key={rotation._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{rotation.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {rotation.rotationType} with Dr. {rotation.preceptorName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatDate(new Date(rotation.startDate).getTime())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rotation.weeklyHours}h/week
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {enterpriseStats.avgMatchScore?.toFixed(1) || '0.0'}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Match Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(enterpriseStats.onTimeCompletion * 100) || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">On-Time Completion</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {enterpriseStats.avgRotationHours || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Hours/Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your organization&apos;s students and their rotation assignments
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>Student management interface will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preceptors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preceptor Network</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage partnerships with clinical preceptors and sites
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4" />
                    <p>Preceptor management interface will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reporting</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed insights into your program&apos;s performance and outcomes
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Advanced analytics dashboard will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}