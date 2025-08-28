'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Phone,
  Mail,
  Building,
  Stethoscope,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Heart,
  BookOpen,
  Users,
  Award,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function StudentMatches() {
  const router = useRouter()
  const user = useQuery(api.users.current)
  const pendingMatches = useQuery(api.matches.getPendingMatchesForStudent,
    user ? { studentId: user._id } : "skip"
  )
  const activeMatches = useQuery(api.matches.getActiveMatchesForStudent,
    user ? { studentId: user._id } : "skip"
  )
  const completedMatches = useQuery(api.matches.getCompletedMatchesForStudent,
    user ? { studentId: user._id } : "skip"
  )


  // Helper function to get MentorFit tier from score
  const getMentorFitTier = (score: number) => {
    if (score >= 9.0) return { name: 'Gold', color: 'bg-yellow-500', textColor: 'text-yellow-700' }
    if (score >= 7.5) return { name: 'Silver', color: 'bg-gray-400', textColor: 'text-gray-700' }
    return { name: 'Bronze', color: 'bg-amber-600', textColor: 'text-amber-700' }
  }

  const acceptMatch = useMutation(api.matches.acceptMatch)
  const declineMatch = useMutation(api.matches.declineMatch)
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation)

  const handleAcceptMatch = async (matchId: Id<"matches">) => {
    try {
      await acceptMatch({ matchId })
      // In real app, would show success message and refresh data
    } catch (error) {
      console.error('Failed to accept match:', error)
    }
  }

  const handleDeclineMatch = async (matchId: Id<"matches">) => {
    try {
      await declineMatch({ matchId })
      // In real app, would show success message and refresh data  
    } catch (error) {
      console.error('Failed to decline match:', error)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Matches</h1>
        <p className="text-muted-foreground">
          Review potential preceptor matches powered by MentorFit™
        </p>
      </div>

      {/* Match Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({pendingMatches?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Active ({activeMatches?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Completed ({completedMatches?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Pending Matches */}
        <TabsContent value="pending" className="space-y-6">
          {pendingMatches && pendingMatches.length > 0 ? (
            <div className="grid gap-6">
              {pendingMatches.map((match) => {
                const tier = getMentorFitTier(match.mentorFitScore || 0)
                const preceptor = match.preceptor
                  
                return (
                  <Card key={match._id} className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl">
                                {preceptor?.personalInfo?.fullName || 'Preceptor Name'}
                              </CardTitle>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                {preceptor?.personalInfo?.specialty || 'Specialty'}
                              </Badge>
                              <Badge className={`${tier.color} text-white`}>
                                {tier.name} Match
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {preceptor?.practiceInfo?.practiceName || 'Practice'} • {preceptor?.practiceInfo?.city || 'City'}, {preceptor?.practiceInfo?.state || 'State'}
                            </CardDescription>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-2">
                              <Target className="h-5 w-5 text-primary" />
                              <span className="text-2xl font-bold text-primary">
                                {match.mentorFitScore?.toFixed(1) || '0.0'}/10
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">MentorFit™ Score</p>
                          </div>
                        </div>
                      </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Match Details */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Rotation:</span>
                          <span className="capitalize">{match.rotationDetails?.rotationType?.replace('-', ' ') || 'Rotation'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Duration:</span>
                          <span>{preceptor?.availability?.rotationDurationPreferred || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Dates:</span>
                          <span>
                            {match.rotationDetails?.startDate ? new Date(match.rotationDetails.startDate).toLocaleDateString() : 'TBD'}
                            {match.rotationDetails?.endDate ? ` - ${new Date(match.rotationDetails.endDate).toLocaleDateString()}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Setting:</span>
                          <span className="capitalize">
                            {preceptor?.practiceInfo?.practiceSettings?.[0]?.replace('-', ' ') || 'Practice Setting'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Location:</span>
                          <span>{preceptor?.practiceInfo?.city || 'City'}, {preceptor?.practiceInfo?.state || 'State'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Match Received:</span>
                          <span>{new Date(match.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* MentorFit Explanation */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Why this is a great match:</h4>
                          <p className="text-sm text-muted-foreground">{match.matchReason || 'Great compatibility based on learning preferences and clinical goals'}</p>
                        </div>
                      </div>
                    </div>

                    {/* MentorFit Score Breakdown */}
                    {match.compatibilityBreakdown && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">MentorFit™ Compatibility Breakdown:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Learning Style Alignment</span>
                            <div className="flex items-center gap-2">
                              <Progress value={match.compatibilityBreakdown.learningStyle * 10} className="w-20 h-2" />
                              <span className="font-medium">{match.compatibilityBreakdown.learningStyle.toFixed(1)}/10</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Communication Preferences</span>
                            <div className="flex items-center gap-2">
                              <Progress value={match.compatibilityBreakdown.communication * 10} className="w-20 h-2" />
                              <span className="font-medium">{match.compatibilityBreakdown.communication.toFixed(1)}/10</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Schedule Compatibility</span>
                            <div className="flex items-center gap-2">
                              <Progress value={match.compatibilityBreakdown.schedule * 10} className="w-20 h-2" />
                              <span className="font-medium">{match.compatibilityBreakdown.schedule.toFixed(1)}/10</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Mentorship Style</span>
                            <div className="flex items-center gap-2">
                              <Progress value={match.compatibilityBreakdown.mentorship * 10} className="w-20 h-2" />
                              <span className="font-medium">{match.compatibilityBreakdown.mentorship.toFixed(1)}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Button 
                        onClick={() => handleAcceptMatch(match._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept Match
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleDeclineMatch(match._id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleStartConversation(match._id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Preceptor
                      </Button>
                      <Button variant="outline">
                        <User className="h-4 w-4 mr-2" />
                        View Full Profile
                      </Button>
                    </div>
                  </CardContent>
                    </Card>
                  )
                })}
              </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Matches</h3>
                <p className="text-muted-foreground mb-4">
                  We&apos;re working on finding the perfect preceptor matches for you.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/student">
                    Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Active Matches */}
        <TabsContent value="active" className="space-y-6">
          {(!activeMatches || activeMatches.length === 0) ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Rotations</h3>
                <p className="text-muted-foreground mb-4">
                  Accept a pending match to start your clinical rotation.
                </p>
                <Button variant="outline" asChild>
                  <Link href="#pending">
                    View Pending Matches
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {activeMatches.map((match) => {
                const preceptor = match.preceptor
                
                return (
                  <Card key={match._id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-xl">
                              {preceptor?.personalInfo?.fullName || 'Preceptor Name'}
                            </CardTitle>
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              {preceptor?.personalInfo?.specialty || 'Specialty'}
                            </Badge>
                            <Badge className="bg-green-600 text-white">
                              Active
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {preceptor?.practiceInfo?.practiceName || 'Practice'} • {preceptor?.practiceInfo?.city || 'City'}, {preceptor?.practiceInfo?.state || 'State'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      {/* Rotation Details */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Rotation:</span>
                            <span className="capitalize">{match.rotationDetails?.rotationType?.replace('-', ' ') || 'Rotation'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Duration:</span>
                            <span>{match.rotationDetails?.startDate || 'TBD'} - {match.rotationDetails?.endDate || 'TBD'}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Hours:</span>
                            <span>{match.rotationDetails?.weeklyHours || 0} hours/week</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Contact:</span>
                            <span>{preceptor?.personalInfo?.email || 'Email not available'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <Button 
                          onClick={() => handleStartConversation(match._id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Preceptor
                        </Button>
                        <Button variant="outline">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        <Button variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Info
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Completed Matches */}
        <TabsContent value="completed" className="space-y-6">
          {(!completedMatches || completedMatches.length === 0) ? (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Rotations</h3>
                <p className="text-muted-foreground mb-4">
                  Completed clinical rotations will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {completedMatches.map((match) => {
                const preceptor = match.preceptor
                
                return (
                  <Card key={match._id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-xl">
                              {preceptor?.personalInfo?.fullName || 'Preceptor Name'}
                            </CardTitle>
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                              {preceptor?.personalInfo?.specialty || 'Specialty'}
                            </Badge>
                            <Badge variant="secondary">
                              Completed
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {preceptor?.practiceInfo?.practiceName || 'Practice'} • {preceptor?.practiceInfo?.city || 'City'}, {preceptor?.practiceInfo?.state || 'State'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      {/* Rotation Details */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Rotation:</span>
                            <span className="capitalize">{match.rotationDetails?.rotationType?.replace('-', ' ') || 'Rotation'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Completed:</span>
                            <span>{match.rotationDetails?.startDate || 'TBD'} - {match.rotationDetails?.endDate || 'TBD'}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Hours:</span>
                            <span>{match.rotationDetails?.weeklyHours || 0} hours/week</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Score:</span>
                            <span>{match.mentorFitScore?.toFixed(1) || '0.0'}/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <Button 
                          onClick={() => handleStartConversation(match._id)}
                          variant="outline"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Messages
                        </Button>
                        <Button variant="outline">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        <Button variant="outline">
                          <Heart className="h-4 w-4 mr-2" />
                          Leave Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}