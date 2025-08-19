'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
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

export default function StudentMatches() {
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


  // Mock data for demonstration - would come from actual queries
  const mockPendingMatches = [
    {
      _id: "1",
      preceptorId: "p1",
      preceptor: {
        personalInfo: {
          fullName: "Dr. Sarah Johnson, FNP",
          specialty: "FNP",
        },
        practiceInfo: {
          practiceName: "Johnson Family Clinic",
          city: "Austin",
          state: "TX",
          practiceSettings: ["private-practice"]
        },
        availability: {
          rotationDurationPreferred: "8-weeks",
          availableRotations: ["family-practice"]
        }
      },
      mentorFitScore: 9.2,
      matchReason: "Excellent alignment in learning preferences and communication style",
      status: "pending",
      createdAt: new Date().getTime() - 86400000, // 1 day ago
      rotationType: "family-practice",
      startDate: "2025-02-15",
      endDate: "2025-04-12"
    },
    {
      _id: "2", 
      preceptorId: "p2",
      preceptor: {
        personalInfo: {
          fullName: "Dr. Maria Rodriguez, PNP",
          specialty: "PNP",
        },
        practiceInfo: {
          practiceName: "Children's Health Center",
          city: "Dallas",
          state: "TX",
          practiceSettings: ["clinic"]
        },
        availability: {
          rotationDurationPreferred: "12-weeks",
          availableRotations: ["pediatrics"]
        }
      },
      mentorFitScore: 8.7,
      matchReason: "Strong match in pediatric focus and hands-on learning approach",
      status: "pending", 
      createdAt: new Date().getTime() - 172800000, // 2 days ago
      rotationType: "pediatrics",
      startDate: "2025-03-01",
      endDate: "2025-05-24"
    }
  ]

  const acceptMatch = useMutation(api.matches.acceptMatch)
  const declineMatch = useMutation(api.matches.declineMatch)

  const handleAcceptMatch = async (matchId: string) => {
    try {
      await acceptMatch({ matchId })
      // In real app, would show success message and refresh data
    } catch (error) {
      console.error('Failed to accept match:', error)
    }
  }

  const handleDeclineMatch = async (matchId: string) => {
    try {
      await declineMatch({ matchId })
      // In real app, would show success message and refresh data  
    } catch (error) {
      console.error('Failed to decline match:', error)
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
            Pending ({mockPendingMatches.length})
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
          {mockPendingMatches.length > 0 ? (
            <div className="grid gap-6">
              {mockPendingMatches.map((match) => (
                <Card key={match._id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl">
                            {match.preceptor.personalInfo.fullName}
                          </CardTitle>
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                            {match.preceptor.personalInfo.specialty}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {match.preceptor.practiceInfo.practiceName} • {match.preceptor.practiceInfo.city}, {match.preceptor.practiceInfo.state}
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          <span className="text-2xl font-bold text-primary">
                            {match.mentorFitScore}/10
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
                          <span className="capitalize">{match.rotationType.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Duration:</span>
                          <span>{match.preceptor.availability.rotationDurationPreferred}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Dates:</span>
                          <span>{new Date(match.startDate).toLocaleDateString()} - {new Date(match.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Setting:</span>
                          <span className="capitalize">{match.preceptor.practiceInfo.practiceSettings[0].replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Location:</span>
                          <span>{match.preceptor.practiceInfo.city}, {match.preceptor.practiceInfo.state}</span>
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
                          <p className="text-sm text-muted-foreground">{match.matchReason}</p>
                        </div>
                      </div>
                    </div>

                    {/* MentorFit Score Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">MentorFit™ Compatibility Breakdown:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Learning Style Alignment</span>
                          <div className="flex items-center gap-2">
                            <Progress value={92} className="w-20 h-2" />
                            <span className="font-medium">9.2/10</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Communication Preferences</span>
                          <div className="flex items-center gap-2">
                            <Progress value={88} className="w-20 h-2" />
                            <span className="font-medium">8.8/10</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Schedule Compatibility</span>
                          <div className="flex items-center gap-2">
                            <Progress value={95} className="w-20 h-2" />
                            <span className="font-medium">9.5/10</span>
                          </div>
                        </div>
                      </div>
                    </div>

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
                      <Button variant="outline">
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
              ))}
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
            <div className="space-y-4">
              {/* Active matches would be displayed here */}
              <p className="text-muted-foreground">Active rotations will appear here.</p>
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
            <div className="space-y-4">
              {/* Completed matches would be displayed here */}
              <p className="text-muted-foreground">Completed rotations will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}