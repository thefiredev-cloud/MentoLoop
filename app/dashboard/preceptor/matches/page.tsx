'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Star,
  Target,
  BookOpen,
  GraduationCap,
  Stethoscope,
  Heart,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function PreceptorMatches() {
  const user = useQuery(api.users.current)
  const pendingMatches = useQuery(api.matches.getPendingMatchesForPreceptor,
    user ? { preceptorId: user._id } : "skip"
  )
  const acceptedMatches = useQuery(api.matches.getAcceptedMatchesForPreceptor,
    user ? { preceptorId: user._id } : "skip"
  )
  const reviewingMatches = useQuery(api.matches.getReviewingMatchesForPreceptor,
    user ? { preceptorId: user._id } : "skip"
  )
  
  const acceptMatch = useMutation(api.matches.acceptMatch)
  const declineMatch = useMutation(api.matches.declineMatch)

  const [processingMatchId, setProcessingMatchId] = useState<string | null>(null)

  const handleAcceptMatch = async (matchId: string) => {
    try {
      setProcessingMatchId(matchId)
      await acceptMatch({ matchId })
      toast.success("Match accepted successfully!")
    } catch (error) {
      toast.error("Failed to accept match")
      console.error(error)
    } finally {
      setProcessingMatchId(null)
    }
  }

  const handleDeclineMatch = async (matchId: string) => {
    try {
      setProcessingMatchId(matchId)
      await declineMatch({ matchId })
      toast.success("Match declined")
    } catch (error) {
      toast.error("Failed to decline match")
      console.error(error)
    } finally {
      setProcessingMatchId(null)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  // Mock student data - in real app would come from match queries with populated student data
  const mockStudentMatches = [
    {
      _id: "match_1",
      student: {
        fullName: "Sarah Kim",
        email: "sarah.kim@uthscsa.edu",
        phone: "+1 (555) 123-4567",
        school: "UT Health San Antonio",
        programName: "Family Nurse Practitioner",
        degreeTrack: "FNP",
        yearInProgram: "2nd Year",
        expectedGraduation: "May 2025",
        gpa: 3.85,
        clinicalHours: 200,
        requiredHours: 600
      },
      mentorFitScore: 9.4,
      rotationType: "Family Practice",
      startDate: "2025-02-15",
      endDate: "2025-04-11",
      hoursPerWeek: 32,
      schedule: "Monday-Thursday, 8 AM - 5 PM",
      status: "pending",
      requestDate: "2025-01-15",
      studentNote: "I'm particularly interested in family practice with a focus on pediatrics and women's health. I've completed my basic clinical rotations and am ready to work with a dedicated preceptor who can help me develop advanced assessment skills.",
      learningGoals: [
        "Advanced physical assessment techniques",
        "Chronic disease management", 
        "Pediatric care protocols",
        "Women's health procedures"
      ]
    },
    {
      _id: "match_2", 
      student: {
        fullName: "Marcus Chen",
        email: "marcus.chen@baylor.edu",
        phone: "+1 (555) 987-6543",
        school: "Baylor University",
        programName: "Adult-Gerontology Acute Care Nurse Practitioner",
        degreeTrack: "AGACNP", 
        yearInProgram: "3rd Year",
        expectedGraduation: "December 2025",
        gpa: 3.92,
        clinicalHours: 450,
        requiredHours: 750
      },
      mentorFitScore: 8.7,
      rotationType: "Acute Care",
      startDate: "2025-03-01", 
      endDate: "2025-05-10",
      hoursPerWeek: 40,
      schedule: "Monday-Friday, varies",
      status: "reviewing",
      requestDate: "2025-01-10",
      studentNote: "Seeking an acute care rotation with emphasis on critical care procedures and complex case management. I have strong clinical foundations and am eager to learn advanced diagnostic and therapeutic interventions.",
      learningGoals: [
        "Critical care procedures",
        "Ventilator management",
        "Complex case analysis", 
        "Emergency protocols"
      ]
    }
  ]

  const pendingCount = pendingMatches?.length || 0
  const reviewingCount = reviewingMatches?.length || 0
  const acceptedCount = acceptedMatches?.length || 0

  const renderStudentCard = (match: any, showActions: boolean = true) => (
    <Card key={match._id} className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{match.student.fullName}</CardTitle>
                <CardDescription>{match.student.degreeTrack} • {match.student.school}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Target className="h-3 w-3 mr-1" />
                MentorFit™ {match.mentorFitScore}/10
              </Badge>
              <Badge variant="outline">
                {match.rotationType}
              </Badge>
            </div>
          </div>
          
          {match.status === 'pending' && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Clock className="h-3 w-3 mr-1" />
              Pending Response
            </Badge>
          )}
          {match.status === 'reviewing' && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Eye className="h-3 w-3 mr-1" />
              Under Review
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Student Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Student Information</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{match.student.yearInProgram} • GPA: {match.student.gpa}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Graduates {match.student.expectedGraduation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{match.student.clinicalHours}/{match.student.requiredHours} clinical hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{match.student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{match.student.phone}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rotation Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{match.startDate} - {match.endDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{match.hoursPerWeek} hours/week</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span>{match.schedule}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Student Message */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Message from Student</h4>
          <p className="text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
            {match.studentNote}
          </p>
        </div>

        {/* Learning Goals */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Learning Goals</h4>
          <div className="grid grid-cols-2 gap-2">
            {match.learningGoals.map((goal: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {showActions && match.status === 'pending' && (
          <>
            <Separator />
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                size="lg" 
                onClick={() => handleAcceptMatch(match._id)}
                disabled={processingMatchId === match._id}
                className="flex-1"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Accept Match
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => handleDeclineMatch(match._id)}
                disabled={processingMatchId === match._id}
                className="flex-1"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/dashboard/preceptor/matches/${match._id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </div>
          </>
        )}

        {match.status === 'reviewing' && (
          <>
            <Separator />
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 py-2 px-4">
                <Eye className="h-4 w-4 mr-2" />
                Under Review - Decision pending
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Matches</h1>
          <p className="text-muted-foreground">
            Review and manage student preceptorship requests
          </p>
        </div>
      </div>

      {/* Tabs for different match states */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="reviewing" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Reviewing ({reviewingCount})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Accepted ({acceptedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {pendingCount === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Matches</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  You don't have any pending student match requests at the moment. 
                  New matches will appear here when students request you as a preceptor.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {mockStudentMatches
                .filter(match => match.status === 'pending')
                .map(match => renderStudentCard(match, true))
              }
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewing" className="space-y-6">
          {reviewingCount === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Matches Under Review</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Matches you've requested more information about will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {mockStudentMatches
                .filter(match => match.status === 'reviewing')
                .map(match => renderStudentCard(match, false))
              }
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-6">
          {acceptedCount === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Accepted Matches</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Students you've accepted as preceptees will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {mockStudentMatches
                .filter(match => match.status === 'accepted')
                .map(match => renderStudentCard(match, false))
              }
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}