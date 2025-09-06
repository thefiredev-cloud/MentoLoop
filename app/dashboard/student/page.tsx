'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  Target, 
  Calendar, 
  Clock, 
  MessageCircle, 
  User,
  Search,
  FileText,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboardPage() {
  return (
    <RoleGuard requiredRole="student">
      <StudentDashboardContent />
    </RoleGuard>
  )
}

function StudentDashboardContent() {
  const dashboardStats = useQuery(api.students.getStudentDashboardStats)
  
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

  const { student, currentMatch } = dashboardStats

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {student.personalInfo.fullName.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          {student.schoolInfo.degreeTrack} Student • {student.schoolInfo.programName}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.profileCompletionPercentage}%</div>
            <div className="mt-2 w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${dashboardStats.profileCompletionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardStats.profileCompletionPercentage === 100 ? 'Complete' : 'In Progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rotation</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMatch ? currentMatch.rotationDetails.rotationType : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMatch ? `${currentMatch.rotationDetails.weeklyHours}h/week` : 'No active rotation'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clinical Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.hoursCompleted}/{dashboardStats.hoursRequired}
            </div>
            <div className="mt-2 w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${(dashboardStats.hoursCompleted / dashboardStats.hoursRequired) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((dashboardStats.hoursCompleted / dashboardStats.hoursRequired) * 100)}% Complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/student/search">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Find Preceptors</h3>
                  <p className="text-sm text-muted-foreground">Search and request matches</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/student/matches">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Matches</h3>
                  <p className="text-sm text-muted-foreground">Review match requests</p>
                  {dashboardStats.pendingMatchesCount > 0 && (
                    <Badge className="mt-1" variant="destructive">
                      {dashboardStats.pendingMatchesCount} pending
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/student/hours">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Clinical Hours</h3>
                  <p className="text-sm text-muted-foreground">Log your hours</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/student/rotations">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-orange-100 p-3 mr-4">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Rotations</h3>
                  <p className="text-sm text-muted-foreground">View your schedule</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/student/documents">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Documents</h3>
                  <p className="text-sm text-muted-foreground">Manage your files</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/messages">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-pink-100 p-3 mr-4">
                  <MessageCircle className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-sm text-muted-foreground">Chat with preceptors</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}