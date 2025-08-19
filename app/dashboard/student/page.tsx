'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  School, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  CreditCard,
  Star,
  BookOpen,
  Target
} from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const user = useQuery(api.users.current)
  const student = useQuery(api.students.getByUserId, 
    user ? { userId: user._id } : "skip"
  )
  const activeMatches = useQuery(api.matches.getActiveMatchesForStudent,
    user ? { studentId: user._id } : "skip"
  )

  if (!user) {
    return <div>Loading...</div>
  }

  // Check if student has completed intake
  const hasCompletedIntake = !!student
  const intakeProgress = hasCompletedIntake ? 100 : 0

  // Mock data for demonstration - in real app this would come from Convex
  const rotationHours = {
    completed: 125,
    required: 200,
    percentage: 62.5
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Track your clinical placements and connect with preceptors
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {!hasCompletedIntake && (
            <Button asChild size="lg">
              <Link href="/student-intake">
                Complete Your Profile
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/student/matches">
              <Target className="h-4 w-4 mr-2" />
              View Matches
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/student/rotations">
              <Calendar className="h-4 w-4 mr-2" />
              My Rotations
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
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
                  Complete your intake to start receiving matches
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Matches */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <span className="text-2xl font-bold">
                {activeMatches?.length || 0}
              </span>
              <div className="flex items-center text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 mr-1" />
                Awaiting your response
              </div>
              {activeMatches && activeMatches.length > 0 && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/dashboard/student/matches">
                    Review Matches
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rotation Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rotation Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {rotationHours.completed}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{rotationHours.required}
                </span>
              </div>
              <Progress value={rotationHours.percentage} />
              <p className="text-xs text-muted-foreground">
                {rotationHours.required - rotationHours.completed} hours remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Current Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Placement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Current Placement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeMatches && activeMatches.length > 0 ? (
                <div className="space-y-4">
                  {/* This would map through actual matches */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">Dr. Sarah Johnson, FNP</h4>
                      <p className="text-sm text-muted-foreground">Family Practice • Johnson Family Clinic</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Austin, TX
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          8-week rotation
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Active
                    </Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <p className="font-medium">January 15, 2025</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <p className="font-medium">March 12, 2025</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Schedule:</span>
                      <p className="font-medium">Mon-Thu, 8 AM - 5 PM</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hours/Week:</span>
                      <p className="font-medium">32 hours</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Preceptor
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Placement</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your profile to start receiving preceptor matches
                  </p>
                  {!hasCompletedIntake && (
                    <Button asChild>
                      <Link href="/student-intake">
                        Complete Profile
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock recent activity - would be dynamic */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">New match available</p>
                    <p className="text-xs text-muted-foreground">Dr. Martinez in Pediatrics • MentorFit™ Score: 9.2/10</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Hours logged successfully</p>
                    <p className="text-xs text-muted-foreground">Week of Jan 8-12: 32 hours • Family Practice</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Evaluation reminder</p>
                    <p className="text-xs text-muted-foreground">Mid-rotation evaluation due Jan 30</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Profile Summary */}
          {hasCompletedIntake && student && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{student.personalInfo.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <span>{student.schoolInfo.programName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{student.schoolInfo.degreeTrack} Track</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{student.personalInfo.email}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href="/dashboard/student/profile">
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Mid-rotation evaluation</span>
                  <Badge variant="outline" className="text-xs">Jan 30</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Hours submission</span>
                  <Badge variant="outline" className="text-xs">Weekly</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Final evaluation</span>
                  <Badge variant="outline" className="text-xs">Mar 12</Badge>
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