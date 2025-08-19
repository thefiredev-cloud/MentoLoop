'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  Phone, 
  Mail, 
  FileText,
  MessageSquare,
  Star,
  Target,
  GraduationCap,
  Eye,
  ChartBar,
  Users,
  Edit,
  Send,
  Award,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface Activity {
  date: string
  activity: string
  type: 'hours' | 'evaluation' | 'assessment' | 'assignment'
}

interface StudentData {
  _id: string
  student: {
    _id: string
    fullName: string
    email: string
    phone: string
    school: string
    programName: string
    degreeTrack: string
    yearInProgram: string
    expectedGraduation: string
    gpa: number
  }
  startDate: string
  endDate: string
  totalWeeks: number
  currentWeek: number
  hoursPerWeek: number
  totalHours: number
  completedHours: number
  progress: number
  currentRotation: string
  performance: {
    overallRating: number
    clinicalSkills: number
    professionalism: number
    communication: number
    criticalThinking: number
  }
  recentActivities: Activity[]
  upcomingDeadlines: Array<{
    title: string
    date: string
    type: 'hours' | 'evaluation' | 'assessment' | 'assignment'
  }>
}

export default function PreceptorStudents() {
  const user = useQuery(api.users.current)
  const activeStudents = useQuery(api.matches.getActiveStudentsForPreceptor,
    user ? { preceptorId: user._id } : "skip"
  )

  // Handle loading state for both user and students data
  if (user === undefined) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  // Mock current students data - in real app would come from Convex with populated student data
  const mockActiveStudents = [
    {
      _id: "student_1",
      student: {
        _id: "student_obj_1",
        fullName: "Emily Rodriguez",
        email: "emily.rodriguez@utexas.edu", 
        phone: "+1 (555) 234-5678",
        school: "University of Texas at Austin",
        programName: "Family Nurse Practitioner",
        degreeTrack: "FNP",
        yearInProgram: "2nd Year",
        expectedGraduation: "May 2025",
        gpa: 3.89
      },
      startDate: "2025-01-15",
      endDate: "2025-03-12",
      totalWeeks: 8,
      currentWeek: 4,
      hoursPerWeek: 32,
      totalHours: 256,
      completedHours: 128,
      progress: 50,
      currentRotation: "Family Practice",
      performance: {
        overallRating: 4.5,
        clinicalSkills: 4.3,
        professionalism: 4.7,
        communication: 4.4,
        criticalThinking: 4.2
      },
      recentActivities: [
        {
          date: "2025-01-18",
          activity: "Completed 32 hours for week 4",
          type: "hours" as const
        },
        {
          date: "2025-01-17", 
          activity: "Mid-rotation evaluation submitted",
          type: "evaluation" as const
        },
        {
          date: "2025-01-15",
          activity: "Clinical competency assessment passed",
          type: "assessment" as const
        }
      ],
      upcomingDeadlines: [
        {
          title: "Weekly hours submission",
          date: "2025-01-25",
          type: "hours" as const
        },
        {
          title: "Final evaluation",
          date: "2025-03-12",
          type: "evaluation" as const
        }
      ]
    },
    {
      _id: "student_2",
      student: {
        _id: "student_obj_2", 
        fullName: "Marcus Chen",
        email: "marcus.chen@baylor.edu",
        phone: "+1 (555) 987-6543",
        school: "Baylor University",
        programName: "Adult-Gerontology Acute Care Nurse Practitioner",
        degreeTrack: "AGACNP",
        yearInProgram: "3rd Year", 
        expectedGraduation: "December 2025",
        gpa: 3.92
      },
      startDate: "2025-01-08",
      endDate: "2025-03-19",
      totalWeeks: 10,
      currentWeek: 2,
      hoursPerWeek: 40,
      totalHours: 400,
      completedHours: 80,
      progress: 20,
      currentRotation: "Acute Care",
      performance: {
        overallRating: 4.2,
        clinicalSkills: 4.0,
        professionalism: 4.5,
        communication: 4.1,
        criticalThinking: 4.3
      },
      recentActivities: [
        {
          date: "2025-01-18",
          activity: "Completed 40 hours for week 2", 
          type: "hours" as const
        },
        {
          date: "2025-01-16",
          activity: "Case study presentation completed",
          type: "assignment" as const
        },
        {
          date: "2025-01-14",
          activity: "Initial assessment completed",
          type: "assessment" as const
        }
      ],
      upcomingDeadlines: [
        {
          title: "Weekly hours submission",
          date: "2025-01-25",
          type: "hours" as const
        },
        {
          title: "Mid-rotation evaluation",
          date: "2025-02-15", 
          type: "evaluation" as const
        }
      ]
    }
  ]

  const activeCount = mockActiveStudents.length
  const totalHoursSupervised = mockActiveStudents.reduce((sum, s) => sum + s.completedHours, 0)
  const avgPerformance = mockActiveStudents.reduce((sum, s) => sum + s.performance.overallRating, 0) / mockActiveStudents.length

  const renderStudentCard = (student: StudentData) => (
    <Card key={student._id} className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{student.student.fullName}</CardTitle>
                <CardDescription>{student.student.degreeTrack} • {student.student.school}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Week {student.currentWeek} of {student.totalWeeks}
              </Badge>
              <Badge variant="outline">
                {student.currentRotation}
              </Badge>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{student.performance.overallRating}/5.0</span>
            </div>
            <p className="text-xs text-muted-foreground">Performance</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rotation Progress</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Hours Completed</span>
                <span className="font-mono">{student.completedHours}/{student.totalHours}</span>
              </div>
              <Progress value={student.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{student.startDate} - {student.endDate}</span>
                <span>{student.hoursPerWeek} hrs/week</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.student.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{student.student.yearInProgram} • GPA: {student.student.gpa}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Performance Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{student.performance.clinicalSkills}</div>
              <div className="text-xs text-muted-foreground">Clinical Skills</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{student.performance.professionalism}</div>
              <div className="text-xs text-muted-foreground">Professionalism</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{student.performance.communication}</div>
              <div className="text-xs text-muted-foreground">Communication</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{student.performance.criticalThinking}</div>
              <div className="text-xs text-muted-foreground">Critical Thinking</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent Activity */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Recent Activity</h4>
          <div className="space-y-3">
            {student.recentActivities.map((activity: Activity, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'hours' ? 'bg-blue-500' :
                  activity.type === 'evaluation' ? 'bg-green-500' :
                  'bg-yellow-500'
                }`}></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{activity.activity}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/preceptor/students/${student.student._id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          </Button>
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message Student
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Add Evaluation
          </Button>
          <Button size="sm" variant="outline">
            <ChartBar className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground">
            Manage and track your current preceptees
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Currently supervising</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Supervised</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursSupervised}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformance.toFixed(1)}/5.0</div>
            <p className="text-xs text-muted-foreground">Student ratings</p>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <div className="space-y-6">
        {activeCount === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Students</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                You don&apos;t have any active preceptees at the moment. 
                Accept student match requests to start mentoring.
              </p>
              <Button asChild>
                <Link href="/dashboard/preceptor/matches">
                  <Target className="h-4 w-4 mr-2" />
                  View Pending Matches
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Current Students ({activeCount})</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send Update
                </Button>
              </div>
            </div>
            
            {mockActiveStudents.map(student => renderStudentCard(student))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {activeCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common tasks for managing your students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
                <Edit className="h-5 w-5" />
                <span className="text-xs">Add Evaluations</span>
              </Button>
              <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
                <ChartBar className="h-5 w-5" />
                <span className="text-xs">View Analytics</span>
              </Button>
              <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">Send Messages</span>
              </Button>
              <Button variant="outline" size="sm" className="h-auto flex-col gap-2 p-4">
                <Award className="h-5 w-5" />
                <span className="text-xs">Generate Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}