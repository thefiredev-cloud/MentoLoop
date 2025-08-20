'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id, Doc } from '@/convex/_generated/dataModel'
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


export default function PreceptorMatches() {
  const router = useRouter()
  const user = useQuery(api.users.current)
  const pendingMatches = useQuery(api.matches.getPendingMatchesForPreceptor,
    user ? { preceptorId: user._id } : "skip"
  )
  const acceptedMatches = useQuery(api.matches.getAcceptedMatchesForPreceptor,
    user ? { preceptorId: user._id } : "skip"
  )
  const confirmedMatches = useQuery(api.matches.getAcceptedMatchesForPreceptor,
    user ? { preceptorId: user._id } : "skip"
  )
  
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


  const pendingCount = pendingMatches?.length || 0
  const reviewingCount = confirmedMatches?.length || 0
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
                <CardTitle className="text-xl">{match.studentName}</CardTitle>
                <CardDescription>{match.degreeTrack} • {match.schoolName}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={`${
                match.tier === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                match.tier === 'Silver' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                match.tier === 'Bronze' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-green-50 text-green-700 border-green-200'
              }`}>
                <Target className="h-3 w-3 mr-1" />
                {match.tier || 'High'} Match • {match.mentorFitScore}/10
              </Badge>
              <Badge variant="outline">
                {match.rotationDetails?.rotationType || 'Clinical Rotation'}
              </Badge>
            </div>
          </div>
          
          {match.status === 'pending' && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Clock className="h-3 w-3 mr-1" />
              Pending Response
            </Badge>
          )}
          {match.status === 'confirmed' && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Eye className="h-3 w-3 mr-1" />
              Confirmed
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
            <p className="text-sm leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-200">
              {match.matchReason}
            </p>
          </div>
        )}

        {/* Student Message */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Student&apos;s Message</h4>
          <p className="text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
            {match.adminNotes || "The student has not provided a personal message with this match request."}
          </p>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rotation Interests</h4>
          <div className="grid grid-cols-2 gap-2">
            {match.student?.rotationNeeds?.rotationTypes?.map((rotation: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
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
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Matches</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  You don&apos;t have any pending student match requests at the moment. 
                  New matches will appear here when students request you as a preceptor.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pendingMatches?.map((match) => renderStudentCard(match, true))}
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
                  Matches you&apos;ve requested more information about will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {confirmedMatches?.map((match) => renderStudentCard(match, false))}
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
                  Students you&apos;ve accepted as preceptees will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {acceptedMatches?.map((match) => (
                <Card key={match._id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{match.studentName}</CardTitle>
                            <CardDescription>{match.degreeTrack} • {match.schoolName}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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