'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
import { DashboardContainer, DashboardGrid, DashboardSection } from '@/components/dashboard/dashboard-container'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { NotificationPanel } from '@/components/dashboard/notification-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  Target, 
  Calendar, 
  Clock, 
  MessageCircle, 
  User,
  TrendingUp,
  // FileText,
  // BookOpen,
  // AlertCircle,
  Search
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
  const recentActivity = useQuery(api.students.getStudentRecentActivity, { limit: 5 })
  const notifications = useQuery(api.students.getStudentNotifications)
  
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

  // Quick actions configuration
  const quickActions = [
    {
      id: 'matches',
      title: 'View My Matches',
      description: 'Review and respond to preceptor matches',
      icon: Target,
      href: '/dashboard/student/matches',
      badge: dashboardStats.pendingMatchesCount > 0 ? {
        text: dashboardStats.pendingMatchesCount.toString(),
        variant: 'default' as const
      } : undefined
    },
    {
      id: 'search',
      title: 'Find Preceptors',
      description: 'Search and request matches with preceptors',
      icon: Search,
      href: '/dashboard/student/search',
      variant: 'outline' as const
    },
    {
      id: 'hours',
      title: 'Log Clinical Hours',
      description: 'Track your rotation hours and activities',
      icon: Clock,
      href: '/dashboard/student/hours',
      variant: 'outline' as const
    },
    {
      id: 'messages',
      title: 'Message Preceptor',
      description: 'Communicate with your assigned preceptor',
      icon: MessageCircle,
      href: '/dashboard/messages',
      variant: 'outline' as const,
      disabled: !currentMatch
    },
    {
      id: 'rotations',
      title: 'View Rotations',
      description: 'Manage your current and upcoming rotations',
      icon: Calendar,
      href: '/dashboard/student/rotations',
      variant: 'outline' as const
    }
  ]

  return (
    <DashboardContainer
      title={`Welcome back, ${student.personalInfo.fullName.split(' ')[0]}!`}
      subtitle={`${student.schoolInfo.degreeTrack} Student • ${student.schoolInfo.programName} • Expected graduation ${student.schoolInfo.expectedGraduation}`}
      headerAction={
        <div className="flex items-center gap-2">
          <Badge variant={student.status === 'submitted' ? 'default' : 'secondary'}>
            {student.status === 'submitted' ? 'Active' : student.status}
          </Badge>
          {dashboardStats.mentorFitScore > 0 && (
            <Badge variant="outline">
              MentorFit: {dashboardStats.mentorFitScore}/10
            </Badge>
          )}
        </div>
      }
    >
      {/* Quick Stats */}
      <DashboardGrid columns={4}>
        <StatsCard
          title="Profile Completion"
          value={`${dashboardStats.profileCompletionPercentage}%`}
          icon={User}
          progress={{
            value: dashboardStats.profileCompletionPercentage,
            max: 100
          }}
          badge={dashboardStats.profileCompletionPercentage === 100 ? {
            text: 'Complete',
            variant: 'default'
          } : {
            text: 'In Progress',
            variant: 'secondary'
          }}
        />

        <StatsCard
          title="Pending Matches"
          value={dashboardStats.pendingMatchesCount}
          icon={Target}
          description={dashboardStats.pendingMatchesCount > 0 ? 'Awaiting your review' : 'No pending matches'}
          badge={dashboardStats.pendingMatchesCount > 0 ? {
            text: 'Action Required',
            variant: 'destructive'
          } : undefined}
        />

        <StatsCard
          title="Clinical Hours"
          value={dashboardStats.hoursCompleted}
          icon={Clock}
          progress={{
            value: dashboardStats.hoursCompleted,
            max: dashboardStats.hoursRequired
          }}
          description={`${dashboardStats.hoursCompleted} / ${dashboardStats.hoursRequired} completed`}
        />

        <StatsCard
          title="Next Rotation"
          value={dashboardStats.nextRotationDate ? new Date(dashboardStats.nextRotationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
          icon={Calendar}
          description={currentMatch ? currentMatch.rotationDetails.rotationType : 'No rotation scheduled'}
          badge={currentMatch ? {
            text: currentMatch.status === 'confirmed' ? 'Confirmed' : 'Active',
            variant: 'default'
          } : undefined}
        />
      </DashboardGrid>

      {/* Main Content Grid */}
      <DashboardSection>
        <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <QuickActions
          title="Quick Actions"
          actions={quickActions}
          columns={1}
        />

        {/* Current Rotation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Current Rotation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{currentMatch.rotationDetails.rotationType}</p>
                    <p className="text-sm text-muted-foreground">
                      MentorFit Score: {currentMatch.mentorFitScore}/10
                    </p>
                  </div>
                  <Badge variant={currentMatch.status === 'confirmed' ? 'default' : 'secondary'}>
                    {currentMatch.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {new Date(currentMatch.rotationDetails.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weekly Hours</p>
                    <p className="font-medium">{currentMatch.rotationDetails.weeklyHours}h</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href="/dashboard/student/rotations">
                      View Details
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href="/dashboard/messages">
                      Contact Preceptor
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No active rotation</p>
                <Button asChild size="sm">
                  <Link href="/dashboard/student/matches">
                    Find Matches
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </DashboardSection>

      {/* Progress & Activity Row */}
      <DashboardSection>
        <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Profile Completion</span>
                <span>{dashboardStats.profileCompletionPercentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${dashboardStats.profileCompletionPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Clinical Hours</span>
                <span>{Math.round((dashboardStats.hoursCompleted / dashboardStats.hoursRequired) * 100)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${(dashboardStats.hoursCompleted / dashboardStats.hoursRequired) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Completed Rotations</span>
                <span>{dashboardStats.completedRotations}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {dashboardStats.profileCompletionPercentage === 100 && dashboardStats.hoursCompleted > 0
                  ? "You're making great progress!"
                  : dashboardStats.profileCompletionPercentage < 100
                  ? "Complete your profile to improve matching"
                  : "Ready to start your clinical journey!"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
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
          }> || []}
          title="Recent Activity"
          maxItems={5}
        />
        </div>
      </DashboardSection>

      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <DashboardSection>
          <NotificationPanel
            notifications={notifications}
          />
        </DashboardSection>
      )}
    </DashboardContainer>
  )
}