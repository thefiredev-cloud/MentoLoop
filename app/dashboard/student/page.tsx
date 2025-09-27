'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  Target,
  Calendar,
  Clock,
  MessageCircle,
  User,
  Search,
  FileText,
  AlertCircle,
} from "lucide-react"
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { motion } from "motion/react"
import { PageTransition } from "@/components/ui/page-transition"
import { StaggeredList, StaggeredListItem } from "@/components/ui/staggered-list"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"

export default function StudentDashboardPage() {
  return (
    <RoleGuard requiredRole="student">
      <StudentDashboardContent />
    </RoleGuard>
  )
}

function StudentDashboardContent() {
  const { user: clerkUser } = useUser()
  const currentUser = useQuery(api.users.current)
  const dashboardStats = useQuery(api.students.getStudentDashboardStats)
  
  // Check if we're still loading
  if (currentUser === undefined || dashboardStats === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-lg space-y-6" role="status" aria-live="polite">
          <span className="sr-only">Loading your dashboard...</span>
          <ShimmerSkeleton className="h-8 w-48 mx-auto" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <ShimmerSkeleton key={index} className="h-32" />
            ))}
          </div>
          <ShimmerSkeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  // If user exists but dashboardStats is null, they haven't completed intake
  if (currentUser && dashboardStats === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Complete Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Welcome to MentoLoop! Complete your student intake form to start finding preceptors.
            </p>
            <p className="text-sm text-muted-foreground">
              Our intake process takes just a few minutes and will help us match you with the perfect preceptor for your clinical rotations.
            </p>
            <div className="flex gap-3 pt-2">
              <Link href="/student-intake" className="flex-1">
                <Button className="w-full">Complete Intake Form</Button>
              </Link>
              <Link href="/help" className="flex-1">
                <Button variant="outline" className="w-full">Get Help</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no user or dashboard stats, something went wrong
  if (!currentUser || !dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Unable to Load Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We&apos;re having trouble loading your dashboard. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { student, currentMatch } = dashboardStats

  return (
    <PageTransition preset="scale-fade">
      <motion.div className="space-y-8" initial="hidden" animate="visible">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-3xl font-bold tracking-tight dashboard-gradient-text">
          Welcome back, {(student?.personalInfo?.fullName?.split(" ")[0]) || (clerkUser?.firstName ?? "Student")}!
        </h1>
        <p className="text-muted-foreground">
          {(student?.schoolInfo?.degreeTrack || "Nursing")} Student • {(student?.schoolInfo?.programName || "Program")}
        </p>
      </motion.div>

      {/* Key Metrics */}
      <StaggeredList className="grid gap-6 md:grid-cols-3">
        <StaggeredListItem>
          <Card className="dashboard-card">
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
                {dashboardStats.profileCompletionPercentage === 100 ? "Complete" : "In Progress"}
              </p>
            </CardContent>
          </Card>
        </StaggeredListItem>

        <StaggeredListItem>
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rotation</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMatch?.rotationDetails?.rotationType || "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentMatch?.rotationDetails?.weeklyHours
                  ? `${currentMatch.rotationDetails.weeklyHours}h/week`
                  : "No active rotation"}
              </p>
            </CardContent>
          </Card>
        </StaggeredListItem>

        <StaggeredListItem>
          <Card className="dashboard-card">
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
                  style={{
                    width: `${(dashboardStats.hoursCompleted / dashboardStats.hoursRequired) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((dashboardStats.hoursCompleted / dashboardStats.hoursRequired) * 100)}% Complete
              </p>
            </CardContent>
          </Card>
        </StaggeredListItem>
      </StaggeredList>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <StaggeredList className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StaggeredListItem>
            <Link href="/dashboard/student/search">
              <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="rounded-full bg-info/10 p-3 mr-4">
                    <Search className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Find Preceptors</h3>
                    <p className="text-sm text-muted-foreground">Search and request matches</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggeredListItem>

          <StaggeredListItem>
            <Link href="/dashboard/student/matches">
              <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="rounded-full bg-success/10 p-3 mr-4">
                    <Target className="h-6 w-6 text-success" />
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
          </StaggeredListItem>

          <StaggeredListItem>
            <Link href="/dashboard/student/hours">
              <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="rounded-full bg-accent/10 p-3 mr-4">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Clinical Hours</h3>
                    <p className="text-sm text-muted-foreground">Log your hours</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggeredListItem>

          <StaggeredListItem>
            <Link href="/dashboard/student/rotations">
              <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="rounded-full bg-warning/10 p-3 mr-4">
                    <Calendar className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Rotations</h3>
                    <p className="text-sm text-muted-foreground">View your schedule</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggeredListItem>

          <StaggeredListItem>
            <Link href="/dashboard/student/documents">
              <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="rounded-full bg-warning/10 p-3 mr-4">
                    <FileText className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Documents</h3>
                    <p className="text-sm text-muted-foreground">Manage your files</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggeredListItem>

          <StaggeredListItem>
            <Link href="/dashboard/messages">
              <Card className="dashboard-card dashboard-card-pressable cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className="rounded-full bg-accent/10 p-3 mr-4">
                    <MessageCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Messages</h3>
                    <p className="text-sm text-muted-foreground">Chat with preceptors</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggeredListItem>
        </StaggeredList>
      </div>
      </motion.div>
    </PageTransition>
  )
}
