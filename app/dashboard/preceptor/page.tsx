'use client'

// import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
// import { Id } from '@/convex/_generated/dataModel'
// import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
// import { QuickActions } from '@/components/dashboard/quick-actions'
import { NotificationPanel } from '@/components/dashboard/notification-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  School, 
  Calendar, 
  Clock, 
  MapPin, 
  // Phone, 
  Mail, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  CreditCard,
  Star,
  Stethoscope,
  Target,
  User,
  // BookOpen,
  ChartBar
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
  const recentActivity = useQuery(api.preceptors.getPreceptorRecentActivity, { limit: 5 })
  const notifications = useQuery(api.preceptors.getPreceptorNotifications)
  const activeStudents = useQuery(api.matches.getActiveStudentsForPreceptor,
    user ? { preceptorId: user._id } : "skip"
  )

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

  const { preceptor, user: _userData } = dashboardStats
  const hasCompletedIntake = !!preceptor
  const intakeProgress = dashboardStats.profileCompletionPercentage

  // Quick actions configuration
  // const quickActions = [
  //   {
  //     id: 'matches',
  //     title: 'Review Matches',
  //     description: 'Review and respond to student match requests',
  //     icon: Target,
  //     href: '/dashboard/preceptor/matches',
  //     badge: dashboardStats.pendingMatchesCount > 0 ? {
  //       text: dashboardStats.pendingMatchesCount.toString(),
  //       variant: 'default' as const
  //     } : undefined
  //   },
  //   {
  //     id: 'students', 
  //     title: 'My Students',
  //     description: 'Manage your current and past students',
  //     icon: Users,
  //     href: '/dashboard/preceptor/students',
  //     variant: 'outline' as const
  //   },
  //   {
  //     id: 'schedule',
  //     title: 'Manage Schedule', 
  //     description: 'Update your availability and schedule',
  //     icon: Calendar,
  //     href: '/dashboard/preceptor/schedule',
  //     variant: 'outline' as const
  //   },
  //   {
  //     id: 'profile',
  //     title: 'Update Profile',
  //     description: 'Edit your preceptor profile and preferences',
  //     icon: User,
  //     href: '/preceptor-intake',
  //     variant: 'outline' as const
  //   }
  // ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Manage your student preceptees and clinical mentoring
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {!hasCompletedIntake && (
            <Button asChild size="lg">
              <Link href="/preceptor-intake">
                Complete Your Profile
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/preceptor/matches">
              <Target className="h-4 w-4 mr-2" />
              Review Matches
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/preceptor/students">
              <Users className="h-4 w-4 mr-2" />
              My Students
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/preceptor/schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Manage Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Profile Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{intakeProgress}%</span>
                {hasCompletedIntake ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Incomplete
                  </Badge>
                )}
              </div>
              <Progress value={intakeProgress} />
              {!hasCompletedIntake && (
                <p className="text-xs text-muted-foreground">
                  Complete your intake to start receiving student matches
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Student Matches */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Matches</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <span className="text-2xl font-bold">
                {dashboardStats.pendingMatchesCount}
              </span>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Awaiting your response
              </div>
              {dashboardStats.pendingMatchesCount > 0 && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/dashboard/preceptor/matches">
                    Review Matches
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <span className="text-2xl font-bold">
                {dashboardStats.activeStudentsCount}
              </span>
              <div className="flex items-center text-xs text-muted-foreground">
                <School className="h-3 w-3 mr-1" />
                This semester
              </div>
              {dashboardStats.activeStudentsCount > 0 && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/dashboard/preceptor/students">
                    Manage Students
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mentorship Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {dashboardStats.averageRating}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-3 w-3 ${
                        star <= Math.floor(dashboardStats.averageRating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                From {dashboardStats.totalStudentsMentored} students
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Current Students */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeStudents && activeStudents.length > 0 ? (
                <div className="space-y-4">
                  {activeStudents.map((match, index) => {
                    const totalWeeks = Math.ceil(
                      (new Date(match.rotationDetails.endDate).getTime() - new Date(match.rotationDetails.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
                    );
                    const totalHours = match.rotationDetails.weeklyHours * totalWeeks;
                    // const progressPercentage = totalHours ? 
                    //   Math.round((match.hoursCompleted / totalHours) * 100) : 0;
                    const currentWeek = Math.ceil(
                      (Date.now() - new Date(match.rotationDetails.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
                    );
                    
                    return (
                      <div key={match._id}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{match.studentName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {match.degreeTrack} Track • {match.schoolName}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Week {Math.min(currentWeek, totalWeeks)} of {totalWeeks}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {match.hoursCompleted}/{totalHours} hours
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {match.status === 'active' ? 'Active' : match.status}
                          </Badge>
                        </div>
                        {index < activeStudents.length - 1 && <Separator className="mt-4" />}
                      </div>
                    );
                  })}
                  
                  <div className="flex gap-2 pt-4">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/preceptor/students">
                        <Users className="h-4 w-4 mr-2" />
                        View All Students
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      <ChartBar className="h-4 w-4 mr-2" />
                      Progress Reports
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Students</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your profile to start receiving student match requests
                  </p>
                  {!hasCompletedIntake && (
                    <Button asChild>
                      <Link href="/preceptor-intake">
                        Complete Profile
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {recentActivity && (
            <ActivityFeed 
              activities={recentActivity as Array<{
                id: string
                type: 'match' | 'rotation' | 'evaluation' | 'payment' | 'message' | 'system'
                title: string
                description: string
                timestamp: number
                status?: 'success' | 'warning' | 'error' | 'info'
                actor?: {
                  name: string
                  type: 'student' | 'preceptor' | 'admin' | 'system'
                }
              }>}
              title="Recent Activity"
            />
          )}
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Notifications */}
          {notifications && notifications.length > 0 && (
            <NotificationPanel notifications={notifications} />
          )}
          {/* Profile Summary */}
          {hasCompletedIntake && preceptor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{preceptor.personalInfo.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span>{preceptor.personalInfo.specialty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{preceptor.practiceInfo.practiceName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{preceptor.personalInfo.email}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href="/dashboard/preceptor/profile">
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mentorship Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mentorship Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Students Mentored</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {dashboardStats.totalStudentsMentored}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Completion Rate</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {dashboardStats.completionRate}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Average Rating</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {dashboardStats.averageRating}/5.0
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/help">
                  <FileText className="h-4 w-4 mr-2" />
                  Help Center
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/contact">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/dashboard/billing">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}