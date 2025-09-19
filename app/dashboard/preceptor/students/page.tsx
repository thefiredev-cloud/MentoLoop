'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
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
  TrendingUp,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Activity {
  date: string
  activity: string
  type: 'hours' | 'evaluation' | 'assessment' | 'assignment'
}

interface StudentData {
  _id: string
  matchId: string
  student: {
    _id: string
    fullName: string
    email?: string
    phone?: string
    school?: string
    programName?: string
    degreeTrack?: string
    yearInProgram?: string
    expectedGraduation?: string
    gpa?: number
  }
  startDate?: string
  endDate?: string
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
  upcomingDeadlines: Array<{ title: string; date: string; type: Activity['type'] }>
}

interface StudentRecord {
  _id?: string
  personalInfo?: {
    fullName?: string
    email?: string
    phone?: string
  }
  schoolInfo?: {
    programName?: string
    degreeTrack?: string
    expectedGraduation?: string
  }
  learningStyle?: {
    programStage?: string
  }
  academicInfo?: {
    cumulativeGpa?: number
  }
}

interface ActiveMatchRecord {
  _id: Id<'matches'>
  student?: StudentRecord
  studentName?: string
  schoolName?: string
  degreeTrack?: string
  rotationDetails?: {
    rotationType?: string
    startDate?: string
    endDate?: string
    weeklyHours?: number
    location?: string
  }
  mentorFitScore?: number
  status?: string
  hoursCompleted?: number
  title?: string
}

export default function PreceptorStudents() {
  const user = useQuery(api.users.current)
  const _activeStudents = useQuery(api.matches.getActiveStudentsForPreceptor,
    user ? { preceptorId: user._id } : "skip"
  )

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')
  const [isSendingUpdate, setIsSendingUpdate] = useState(false)
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation)
  const sendMessage = useMutation(api.messages.sendMessage)

  const activeMatchRecords = useMemo<ActiveMatchRecord[]>(
    () => (Array.isArray(_activeStudents) ? (_activeStudents as ActiveMatchRecord[]) : []),
    [_activeStudents]
  )

  const activeStudents: StudentData[] = useMemo(() => {
    if (!activeMatchRecords.length) return []

    const weeksBetween = (start?: string, end?: string) => {
      if (!start || !end) return 8
      const startDate = new Date(start)
      const endDate = new Date(end)
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 8
      const diffMs = Math.max(endDate.getTime() - startDate.getTime(), 0)
      const weeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7))
      return weeks > 0 ? weeks : 8
    }

    return activeMatchRecords.map((match) => {
      const studentRecord: StudentRecord = match.student ?? {}
      const personalInfo = studentRecord.personalInfo ?? {}
      const schoolInfo = studentRecord.schoolInfo ?? {}
      const rotation = match.rotationDetails ?? {}
      const totalWeeks = weeksBetween(rotation.startDate, rotation.endDate)
      const weeklyHours = rotation.weeklyHours ?? 32
      const totalHours = weeklyHours * totalWeeks
      const calculatedHoursCompleted = match.hoursCompleted ?? (match.status === 'completed' ? totalHours : Math.round(totalHours * 0.6))
      const progress = totalHours > 0 ? Math.min(100, Math.round((calculatedHoursCompleted / totalHours) * 100)) : (match.status === 'completed' ? 100 : 0)
      const currentWeek = totalWeeks > 0 ? Math.min(totalWeeks, Math.max(1, Math.ceil((progress / 100) * totalWeeks))) : 0

      const displayName = personalInfo.fullName ?? match.studentName ?? 'Student'
      const recentActivities: Activity[] = rotation.startDate ? [
        {
          date: new Date(rotation.startDate).toLocaleDateString(),
          activity: `${rotation.rotationType ?? 'Clinical rotation'} kicked off`,
          type: 'hours'
        }
      ] : []

      const upcomingDeadlines = rotation.endDate ? [
        {
          title: 'Rotation completion',
          date: new Date(rotation.endDate).toLocaleDateString(),
          type: 'evaluation' as Activity['type']
        }
      ] : []

      return {
        _id: match._id,
        matchId: match._id,
        student: {
          _id: studentRecord?._id ?? '',
          fullName: displayName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          school: schoolInfo.programName ?? match.schoolName ?? 'N/A',
          programName: schoolInfo.programName ?? match.title ?? rotation.rotationType ?? 'Clinical Rotation',
          degreeTrack: schoolInfo.degreeTrack ?? match.degreeTrack ?? 'N/A',
          yearInProgram: studentRecord?.learningStyle?.programStage ?? 'In program',
          expectedGraduation: schoolInfo.expectedGraduation,
          gpa: studentRecord?.academicInfo?.cumulativeGpa ?? 0,
        },
        startDate: rotation.startDate,
        endDate: rotation.endDate,
        totalWeeks,
        currentWeek,
        hoursPerWeek: weeklyHours,
        totalHours,
        completedHours: calculatedHoursCompleted,
        progress,
        currentRotation: rotation.rotationType ?? 'Clinical Rotation',
        performance: {
          overallRating: match.mentorFitScore ?? 4.5,
          clinicalSkills: match.mentorFitScore ?? 4.5,
          professionalism: match.mentorFitScore ?? 4.5,
          communication: match.mentorFitScore ?? 4.5,
          criticalThinking: match.mentorFitScore ?? 4.5,
        },
        recentActivities,
        upcomingDeadlines,
      }
    })
  }, [activeMatchRecords])

  // Handle loading state for both user and students data
  if (user === undefined) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const activeCount = activeStudents.length
  const totalHoursSupervised = activeStudents.reduce((sum, s) => sum + s.completedHours, 0)
  const avgPerformance = activeCount > 0
    ? activeStudents.reduce((sum, s) => sum + s.performance.overallRating, 0) / activeCount
    : 0

  const renderStudentCard = (student: StudentData) => {
    const startLabel = student.startDate ? new Date(student.startDate).toLocaleDateString() : 'TBD'
    const endLabel = student.endDate ? new Date(student.endDate).toLocaleDateString() : 'TBD'
    const emailDisplay = student.student.email ?? 'Not provided'
    const phoneDisplay = student.student.phone ?? 'Not provided'
    const yearDisplay = student.student.yearInProgram ?? 'In program'
    const gpaDisplay = student.student.gpa ? student.student.gpa.toFixed(2) : 'N/A'

    return (
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
                <span>{startLabel} - {endLabel}</span>
                <span>{student.hoursPerWeek} hrs/week</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{emailDisplay}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{phoneDisplay}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{yearDisplay} • GPA: {gpaDisplay}</span>
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
            {student.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity logged yet.</p>
            ) : (
              student.recentActivities.map((activity: Activity, index: number) => (
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
              ))
            )}
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
  }

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
                <Dialog
                  open={isUpdateDialogOpen}
                  onOpenChange={(open) => {
                    if (!open && !isSendingUpdate) {
                      setIsUpdateDialogOpen(false)
                      setUpdateMessage('')
                    } else if (open && activeMatchRecords.length > 0) {
                      setIsUpdateDialogOpen(true)
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activeMatchRecords.length === 0}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Update
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Send update to active students</DialogTitle>
                      <DialogDescription>
                        This message will be sent to {activeMatchRecords.length}{' '}
                        student{activeMatchRecords.length === 1 ? '' : 's'} currently assigned to you.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Textarea
                        value={updateMessage}
                        onChange={(event) => setUpdateMessage(event.target.value)}
                        placeholder="Share rotation updates, reminders, or guidance..."
                        rows={6}
                        maxLength={5000}
                        disabled={isSendingUpdate}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {updateMessage.length}/5000
                      </p>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (isSendingUpdate) return
                          setIsUpdateDialogOpen(false)
                          setUpdateMessage('')
                        }}
                        disabled={isSendingUpdate}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={async () => {
                          const trimmed = updateMessage.trim()
                          if (!trimmed) {
                            toast.error('Please enter a message before sending.')
                            return
                          }
                          if (!activeMatchRecords.length) {
                            toast.info('No active students to message right now.')
                            setIsUpdateDialogOpen(false)
                            return
                          }
                          setIsSendingUpdate(true)
                          try {
                            for (const match of activeMatchRecords) {
                              const conversationId = await getOrCreateConversation({ matchId: match._id })
                              await sendMessage({ conversationId, content: trimmed, messageType: 'text' })
                            }
                            toast.success(`Update sent to ${activeMatchRecords.length} student${activeMatchRecords.length === 1 ? '' : 's'}.`)
                            setUpdateMessage('')
                            setIsUpdateDialogOpen(false)
                          } catch (error) {
                            console.error('Failed to send update', error)
                            toast.error('Failed to send update. Please try again.')
                          } finally {
                            setIsSendingUpdate(false)
                          }
                        }}
                        disabled={isSendingUpdate || updateMessage.trim().length === 0}
                      >
                        {isSendingUpdate ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Update'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {activeStudents.map(student => renderStudentCard(student))}
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
