'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  User,
  UserCheck,
  Calendar,
  Target,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  FileText,
  MapPin,
  Stethoscope,
  GraduationCap,
  Bell,
  Mail,
  Phone
} from 'lucide-react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'

interface TestStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: number
  result?: string
}

export default function TestUserJourneys() {
  const [activeJourney, setActiveJourney] = useState<'student' | 'preceptor' | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Test scenarios for student journey
  const studentJourneySteps: TestStep[] = [
    {
      id: 'registration',
      title: 'Student Registration',
      description: 'Create student account, complete profile, upload documents',
      status: 'pending'
    },
    {
      id: 'preferences',
      title: 'Set Rotation Preferences',
      description: 'Select specialty, location preferences, schedule requirements',
      status: 'pending'
    },
    {
      id: 'matching',
      title: 'AI Matching Process',
      description: 'Run MentorFit algorithm, receive preceptor matches',
      status: 'pending'
    },
    {
      id: 'review-matches',
      title: 'Review Potential Matches',
      description: 'Browse AI-suggested preceptors, view compatibility scores',
      status: 'pending'
    },
    {
      id: 'payment',
      title: 'Payment Processing',
      description: 'Complete Stripe payment for confirmed match',
      status: 'pending'
    },
    {
      id: 'confirmation',
      title: 'Match Confirmation',
      description: 'Receive confirmation emails/SMS, access rotation details',
      status: 'pending'
    },
    {
      id: 'rotation-prep',
      title: 'Rotation Preparation',
      description: 'Coordinate paperwork, receive preceptor contact info',
      status: 'pending'
    },
    {
      id: 'feedback',
      title: 'Post-Rotation Survey',
      description: 'Complete evaluation survey, provide feedback',
      status: 'pending'
    }
  ]

  // Test scenarios for preceptor journey
  const preceptorJourneySteps: TestStep[] = [
    {
      id: 'registration',
      title: 'Preceptor Registration',
      description: 'Create account, verify credentials, complete profile',
      status: 'pending'
    },
    {
      id: 'availability',
      title: 'Set Availability',
      description: 'Configure schedule, rotation capacity, specialty areas',
      status: 'pending'
    },
    {
      id: 'student-matching',
      title: 'Student Match Notifications',
      description: 'Receive AI-matched student suggestions via email/SMS',
      status: 'pending'
    },
    {
      id: 'review-students',
      title: 'Review Student Profiles',
      description: 'Browse matched students, view compatibility analysis',
      status: 'pending'
    },
    {
      id: 'accept-match',
      title: 'Accept/Decline Matches',
      description: 'Make decisions on student matches, confirm availability',
      status: 'pending'
    },
    {
      id: 'paperwork',
      title: 'Rotation Setup',
      description: 'Complete required paperwork, coordinate with student',
      status: 'pending'
    },
    {
      id: 'mentoring',
      title: 'Active Mentoring',
      description: 'Supervise student, track hours, provide guidance',
      status: 'pending'
    },
    {
      id: 'evaluation',
      title: 'Student Evaluation',
      description: 'Complete student assessment, provide feedback',
      status: 'pending'
    }
  ]

  const [studentSteps, setStudentSteps] = useState(studentJourneySteps)
  const [preceptorSteps, setPreceptorSteps] = useState(preceptorJourneySteps)

  // Simulate step execution
  const simulateStep = async (step: TestStep, stepIndex: number, journeyType: 'student' | 'preceptor') => {
    const updateSteps = journeyType === 'student' ? setStudentSteps : setPreceptorSteps
    
    // Mark step as running
    updateSteps(prevSteps => 
      prevSteps.map((s, i) => 
        i === stepIndex ? { ...s, status: 'running' } : s
      )
    )

    // Simulate different processing times
    const processingTime = Math.random() * 2000 + 1000 // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime))

    // Randomly determine success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1

    updateSteps(prevSteps => 
      prevSteps.map((s, i) => 
        i === stepIndex ? { 
          ...s, 
          status: isSuccess ? 'completed' : 'failed',
          duration: Math.round(processingTime),
          result: isSuccess ? 'Success' : 'Failed - retry available'
        } : s
      )
    )

    return isSuccess
  }

  const runJourney = async (journeyType: 'student' | 'preceptor') => {
    setActiveJourney(journeyType)
    setIsRunning(true)
    setCurrentStep(0)

    const steps = journeyType === 'student' ? studentSteps : preceptorSteps
    
    toast.info(`Starting ${journeyType} journey test...`)

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      const success = await simulateStep(steps[i], i, journeyType)
      
      if (!success) {
        toast.error(`Step "${steps[i].title}" failed`)
        break
      } else {
        toast.success(`Step "${steps[i].title}" completed`)
      }
    }

    setIsRunning(false)
    toast.success(`${journeyType} journey test completed!`)
  }

  const resetJourney = (journeyType: 'student' | 'preceptor') => {
    const resetSteps = journeyType === 'student' ? studentJourneySteps : preceptorJourneySteps
    const updateSteps = journeyType === 'student' ? setStudentSteps : setPreceptorSteps
    
    updateSteps(resetSteps.map(step => ({ ...step, status: 'pending', duration: undefined, result: undefined })))
    setCurrentStep(0)
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 border-2 border-muted rounded-full" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'running':
        return <Badge className="bg-blue-500">Running</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const calculateProgress = (steps: TestStep[]) => {
    const completed = steps.filter(step => step.status === 'completed').length
    return (completed / steps.length) * 100
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Journey Testing</h1>
          <p className="text-muted-foreground">
            Comprehensive end-to-end testing of student and preceptor user experiences
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="student">Student Journey</TabsTrigger>
            <TabsTrigger value="preceptor">Preceptor Journey</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Journey Summary */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Student Journey Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm font-medium">{Math.round(calculateProgress(studentSteps))}%</span>
                  </div>
                  <Progress value={calculateProgress(studentSteps)} />
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="font-medium text-green-600">
                        {studentSteps.filter(s => s.status === 'completed').length}
                      </div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">
                        {studentSteps.filter(s => s.status === 'failed').length}
                      </div>
                      <div className="text-muted-foreground">Failed</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">
                        {studentSteps.filter(s => s.status === 'pending').length}
                      </div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => runJourney('student')}
                      disabled={isRunning}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning && activeJourney === 'student' ? 'Running...' : 'Run Test'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => resetJourney('student')}
                      disabled={isRunning}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Preceptor Journey Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm font-medium">{Math.round(calculateProgress(preceptorSteps))}%</span>
                  </div>
                  <Progress value={calculateProgress(preceptorSteps)} />
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="font-medium text-green-600">
                        {preceptorSteps.filter(s => s.status === 'completed').length}
                      </div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">
                        {preceptorSteps.filter(s => s.status === 'failed').length}
                      </div>
                      <div className="text-muted-foreground">Failed</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">
                        {preceptorSteps.filter(s => s.status === 'pending').length}
                      </div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => runJourney('preceptor')}
                      disabled={isRunning}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning && activeJourney === 'preceptor' ? 'Running...' : 'Run Test'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => resetJourney('preceptor')}
                      disabled={isRunning}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Coverage */}
            <Card>
              <CardHeader>
                <CardTitle>Test Coverage Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <User className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="font-medium">Authentication</div>
                    <div className="text-sm text-muted-foreground">Registration & Login</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="font-medium">AI Matching</div>
                    <div className="text-sm text-muted-foreground">MentorFit Algorithm</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <div className="font-medium">Payments</div>
                    <div className="text-sm text-muted-foreground">Stripe Integration</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <div className="font-medium">Communications</div>
                    <div className="text-sm text-muted-foreground">Email & SMS</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="student" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Student Journey Testing</h2>
                <p className="text-muted-foreground">Test the complete student experience from registration to rotation completion</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => runJourney('student')}
                  disabled={isRunning}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunning && activeJourney === 'student' ? 'Running...' : 'Run Full Journey'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => resetJourney('student')}
                  disabled={isRunning}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {studentSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium">
                          {index + 1}
                        </div>
                        {getStepIcon(step.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-muted-foreground">{step.description}</div>
                        {step.duration && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Completed in {step.duration}ms
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(step.status)}
                        {step.result && (
                          <div className="text-xs text-muted-foreground">{step.result}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preceptor" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Preceptor Journey Testing</h2>
                <p className="text-muted-foreground">Test the complete preceptor experience from registration to student evaluation</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => runJourney('preceptor')}
                  disabled={isRunning}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunning && activeJourney === 'preceptor' ? 'Running...' : 'Run Full Journey'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => resetJourney('preceptor')}
                  disabled={isRunning}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {preceptorSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium">
                          {index + 1}
                        </div>
                        {getStepIcon(step.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-muted-foreground">{step.description}</div>
                        {step.duration && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Completed in {step.duration}ms
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(step.status)}
                        {step.result && (
                          <div className="text-xs text-muted-foreground">{step.result}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}