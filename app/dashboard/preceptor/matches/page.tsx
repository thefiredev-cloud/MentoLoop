'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Target,
  GraduationCap,
  Stethoscope,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'


type MatchDoc = Doc<'matches'>
type StudentDoc = Doc<'students'>

type PreceptorMatch = MatchDoc & {
  student?: StudentDoc | null
  studentName?: string
  degreeTrack?: string
  schoolName?: string
  yearInProgram?: string
  matchScore?: number
  matchDetails?: {
    compatibility?: number
    strengths?: string[]
    concerns?: string[]
  }
  tier?: { name: string; color: string; description: string } | string | null
  notes?: string
  matchReason?: string | null
  adminNotes?: string
  hoursCompleted?: number
  hoursRequired?: number
  progressPercentage?: number
}

export default function PreceptorMatches() {
  const router = useRouter()
  const user = useQuery(api.users.current)
  const pendingMatchesData = useQuery(
    api.matches.getPendingMatchesForPreceptor,
    user ? { preceptorId: user._id } : 'skip'
  ) as PreceptorMatch[] | undefined
  const acceptedMatchesData = useQuery(
    api.matches.getAcceptedMatchesForPreceptor,
    user ? { preceptorId: user._id } : 'skip'
  ) as PreceptorMatch[] | undefined
  const reviewingMatchesData = useQuery(
    api.matches.getReviewingMatchesForPreceptor,
    user ? { preceptorId: user._id } : 'skip'
  ) as PreceptorMatch[] | undefined

  const pendingMatches: PreceptorMatch[] = pendingMatchesData ?? []
  const acceptedMatches: PreceptorMatch[] = acceptedMatchesData ?? []
  const reviewingMatches: PreceptorMatch[] = reviewingMatchesData ?? []
  
  const acceptMatch = useMutation(api.matches.acceptMatch)
  const declineMatch = useMutation(api.matches.declineMatch)
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation)

  const [processingMatchId, setProcessingMatchId] = useState<string | null>(null)

  const handleAcceptMatch = async (matchId: string) => {
    try {
      setProcessingMatchId(matchId)
      await acceptMatch({ matchId: matchId as Id<"matches"> })
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
      await declineMatch({ matchId: matchId as Id<"matches"> })
      toast.success("Match declined")
    } catch (error) {
      toast.error("Failed to decline match")
      console.error(error)
    } finally {
      setProcessingMatchId(null)
    }
  }

  const handleStartConversation = async (matchId: string) => {
    try {
      toast.info('Creating secure conversation...')
      await getOrCreateConversation({ 
        matchId: matchId as Id<'matches'>
      })
      toast.success('Conversation ready!')
      router.push('/dashboard/messages')
    } catch (error) {
      console.error('Failed to create conversation:', error)
      toast.error('Failed to start conversation')
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }


  const pendingCount = pendingMatches.length
  const reviewingCount = reviewingMatches.length
  const acceptedCount = acceptedMatches.length

  const renderStudentCard = (match: PreceptorMatch, showActions: boolean = true) => (
    <Card key={match._id} className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-info" />
              </div>
              <div>
                <CardTitle className="text-xl">{match.studentName}</CardTitle>
                <CardDescription>{match.degreeTrack} • {match.schoolName}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className={`${
                  (typeof match.tier === 'string' ? match.tier : match.tier?.name) === 'Gold'
                    ? 'bg-warning/10 text-warning border border-warning/30'
                    : (typeof match.tier === 'string' ? match.tier : match.tier?.name) === 'Silver'
                      ? 'bg-muted/20 text-muted-foreground border border-border'
                      : (typeof match.tier === 'string' ? match.tier : match.tier?.name) === 'Bronze'
                        ? 'bg-accent/10 text-accent border border-accent/30'
                        : 'bg-success/10 text-success border border-success/30'
                }`}
              >
                <Target className="h-3 w-3 mr-1" />
                {typeof match.tier === 'string' ? match.tier : match.tier?.name || 'High'} Match • {match.mentorFitScore}/10
              </Badge>
              <Badge variant="outline">
                {match.rotationDetails?.rotationType || 'Clinical Rotation'}
              </Badge>
            </div>
          </div>
          
          {match.status === 'pending' && (
            <Badge variant="outline" className="bg-warning/10 text-warning border border-warning/30">
              <Clock className="h-3 w-3 mr-1" />
              Pending Response
            </Badge>
          )}
          {match.status === 'confirmed' && (
            <Badge variant="outline" className="bg-info/10 text-info border border-info/30">
              <Eye className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
          )}
          {match.status === 'active' && (
            <Badge variant="outline" className="bg-success/10 text-success border border-success/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active Rotation
            </Badge>
          )}
          {match.status === 'completed' && (
            <Badge variant="outline" className="bg-accent/10 text-accent border border-accent/30">
              <GraduationCap className="h-3 w-3 mr-1" />
              Completed
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
                <span>{match.schoolName} Program</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Graduates {match.student?.schoolInfo?.expectedGraduation || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Weekly Hours: {match.rotationDetails?.weeklyHours || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{match.student?.personalInfo?.email || 'Email not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{match.student?.personalInfo?.phone || 'Phone not provided'}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rotation Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{match.rotationDetails?.startDate || 'TBD'} - {match.rotationDetails?.endDate || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{match.rotationDetails?.weeklyHours || 0} hours/week</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span>{match.rotationDetails?.location || 'Location TBD'}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Compatibility Analysis */}
        {match.matchReason && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Why This Match Works</h4>
            <p className="text-sm leading-relaxed bg-info/10 p-4 rounded-lg border border-info/30">
              {match.matchReason}
            </p>
          </div>
        )}

        {/* Student Message */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Student&apos;s Message</h4>
          <p className="text-sm leading-relaxed bg-muted/20 p-4 rounded-lg">
            {match.adminNotes || "The student has not provided a personal message with this match request."}
          </p>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rotation Interests</h4>
          <div className="grid grid-cols-2 gap-2">
            {match.student?.rotationNeeds?.rotationTypes?.map((rotation: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-success" />
                <span className="capitalize">{rotation.replace('-', ' ')}</span>
              </div>
            )) || (
              <div className="text-sm text-muted-foreground">No specific rotation interests specified</div>
            )}
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
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => handleStartConversation(match._id)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Student
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

        {match.status === 'suggested' && (
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
            <Card className="empty-card">
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">No Pending Matches</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    New student requests will appear here as soon as they choose you for a rotation.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pendingMatches.map((match) => renderStudentCard(match, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewing" className="space-y-6">
          {reviewingCount === 0 ? (
            <Card className="empty-card">
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                <div className="h-14 w-14 rounded-full bg-accent/15 flex items-center justify-center">
                  <Eye className="h-7 w-7 text-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">No Matches Under Review</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Matches you&apos;ve asked to review or requested details for will land here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviewingMatches.map((match) => renderStudentCard(match, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-6">
          {acceptedCount === 0 ? (
            <Card className="empty-card">
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-secondary-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">No Accepted Matches</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Once you accept a student, the rotation details will land in this section.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {acceptedMatches.map((match) => (
                <Card key={match._id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-success" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{match.studentName}</CardTitle>
                            <CardDescription>{match.degreeTrack} • {match.schoolName}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="bg-success/10 text-success border border-success/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accepted Match
                          </Badge>
                          <Badge variant="outline">
                            {match.rotationDetails?.rotationType || 'Clinical Rotation'}
                          </Badge>
                        </div>
                      </div>
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
                            <span>{match.schoolName} Program</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Graduates {match.student?.schoolInfo?.expectedGraduation || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{match.student?.personalInfo?.email || 'Email not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{match.student?.personalInfo?.phone || 'Phone not provided'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rotation Details</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{match.rotationDetails?.startDate || 'TBD'} - {match.rotationDetails?.endDate || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{match.rotationDetails?.weeklyHours || 0} hours/week</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span>{match.rotationDetails?.location || 'Location TBD'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleStartConversation(match._id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Student
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/preceptor/matches/${match._id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
