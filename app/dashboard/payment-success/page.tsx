'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Calendar, Users, Mail, MessageCircle } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export default function PaymentSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('matchId') as Id<"matches"> | null

  const [isLoading, setIsLoading] = useState(true)

  // Get match details
  const match = useQuery(api.matches.getMatchByIdPublic, matchId ? { matchId } : "skip")

  useEffect(() => {
    if (match !== undefined) {
      setIsLoading(false)
    }
  }, [match])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Confirming your payment...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-4">
              <CheckCircle className="h-12 w-12 mx-auto" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Match Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn&apos;t find the match associated with this payment.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg">
            Your rotation match has been confirmed and both parties have been notified.
          </p>
        </div>

        {/* Match Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Confirmed Match
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Rotation Type</div>
                <div className="font-semibold">{match.rotationDetails.rotationType}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Status</div>
                <Badge className="bg-success text-success-foreground">Confirmed & Paid</Badge>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Start Date</div>
                <div className="font-semibold">{match.rotationDetails.startDate}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">End Date</div>
                <div className="font-semibold">{match.rotationDetails.endDate}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Weekly Hours</div>
                <div className="font-semibold">{match.rotationDetails.weeklyHours} hours</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Location</div>
                <div className="font-semibold">{match.rotationDetails.location || "TBD"}</div>
              </div>
            </div>

            {/* MentorFit Score */}
            {match.mentorFitScore && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">MentorFit™ Compatibility Score</div>
                    <div className="text-sm text-muted-foreground">
                      This match scored highly on our compatibility algorithm
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {match.mentorFitScore}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Excellent Match</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {match.aiAnalysis && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-medium mb-2">AI Matching Insights</div>
                <p className="text-sm text-muted-foreground mb-3">{match.aiAnalysis.analysis}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-600">
                    {match.aiAnalysis.confidence} confidence
                  </Badge>
                  <Badge variant="outline" className="text-success">
                    Score: {match.aiAnalysis.enhancedScore}/10
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  1
                </div>
                <div>
                  <div className="font-medium">Notification Sent</div>
                  <div className="text-sm text-muted-foreground">
                    Both you and your preceptor have been notified via email and SMS about the confirmed match.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  2
                </div>
                <div>
                  <div className="font-medium">Paperwork Coordination</div>
                  <div className="text-sm text-muted-foreground">
                    Our team will reach out within 24 hours to coordinate required paperwork and contracts.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                  3
                </div>
                <div>
                  <div className="font-medium">Pre-Rotation Contact</div>
                  <div className="text-sm text-muted-foreground">
                    You&apos;ll receive contact information to connect with your preceptor before the rotation starts.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Need Support?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-muted-foreground">support@mentoloop.com</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">24/7 Rotation Hotline</div>
                  <div className="text-sm text-muted-foreground">Available during your rotation</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/matches')}
            className="flex-1"
          >
            View All Matches
          </Button>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="flex-1"
          >
            Return to Dashboard
          </Button>
        </div>

        {/* Receipt Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          A receipt for your payment has been sent to your email address.
          You can also find it in your{' '}
          <button 
            type="button"
            onClick={() => router.push('/dashboard/billing')}
            className="underline hover:text-foreground"
          >
            billing history
          </button>.
        </div>
      </div>
    </div>
  )
}
