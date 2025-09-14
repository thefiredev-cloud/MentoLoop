'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  Clock,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Brain
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { markIntakeComplete } from '@/app/actions/clerk-metadata'
import MentorFitAssessmentStep from '../components/mentorfit-assessment-step'

export default function StudentIntakeConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const sessionId = searchParams.get('session_id')
  const { userId } = useAuth()
  const [showMentorFit, setShowMentorFit] = useState(false)
  const [mentorFitData, setMentorFitData] = useState({})
  const [assessmentComplete, setAssessmentComplete] = useState(false)

  useEffect(() => {
    // Clear any stored form data and update metadata after successful submission
    if (success === 'true' && userId) {
      sessionStorage.removeItem('studentIntakeData')
      
      // Update Clerk metadata to mark intake as complete
      const membershipPlan = sessionStorage.getItem('selectedMembershipPlan') || 'core'
      
      const updateMetadata = async () => {
        try {
          await markIntakeComplete(userId, membershipPlan)
          console.log('User metadata updated successfully')
          sessionStorage.removeItem('selectedMembershipPlan')
          
          // Force reload after a short delay to ensure metadata changes are reflected
          setTimeout(() => {
            console.log('Metadata update complete, forcing page refresh to sync state')
          }, 1000)
        } catch (error) {
          console.error('Failed to update user metadata:', error)
          
          // Retry once after 2 seconds
          setTimeout(async () => {
            try {
              console.log('Retrying metadata update...')
              await markIntakeComplete(userId, membershipPlan)
              console.log('User metadata updated successfully on retry')
              sessionStorage.removeItem('selectedMembershipPlan')
            } catch (retryError) {
              console.error('Failed to update user metadata on retry:', retryError)
              // Consider showing an error message to the user here
            }
          }, 2000)
        }
      }
      
      updateMetadata()
    }
  }, [success, userId])

  if (success !== 'true') {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Payment Incomplete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Your payment was not completed. Please try again.</p>
              <Link href="/student-intake">
                <Button>Return to Intake Form</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to MentoLoop!</h1>
          <p className="text-lg text-muted-foreground">
            Your registration is complete and payment has been processed
          </p>
        </div>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium">We&apos;ll Match You</p>
                <p className="text-sm text-muted-foreground">
                  Our AI-powered system will find the perfect preceptor for your clinical rotation within 24-48 hours
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium">Review Your Match</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive an email with your preceptor match details and can review their profile
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium">Connect & Schedule</p>
                <p className="text-sm text-muted-foreground">
                  Once you accept your match, you can message your preceptor and schedule your rotation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Confirmation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Payment processed successfully</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-green-600" />
              <span>Confirmation email sent to your registered email</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-green-600" />
              <span>Student profile created</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-green-600" />
              <span>Matching process initiated</span>
            </div>
            {sessionId && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">
                  Reference ID: {sessionId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Information */}
        <Alert className="mb-6">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>Check your email!</strong> We&apos;ve sent you important information about your account, 
            including login credentials and next steps. If you don&apos;t see it, check your spam folder.
          </AlertDescription>
        </Alert>

        {/* MentorFit Assessment Section */}
        {!showMentorFit && !assessmentComplete && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Complete Your MentorFit™ Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI-powered assessment helps us match you with the perfect preceptor based on your learning style,
                preferences, and clinical goals. This takes about 5 minutes to complete.
              </p>
              <Button
                onClick={() => setShowMentorFit(true)}
                className="w-full"
                size="lg"
              >
                Start MentorFit™ Assessment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show MentorFit Assessment */}
        {showMentorFit && !assessmentComplete && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                MentorFit™ Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MentorFitAssessmentStep
                data={{ mentorFitAssessment: mentorFitData }}
                updateFormData={(section, data) => setMentorFitData(data)}
                onNext={() => {
                  setAssessmentComplete(true)
                  setShowMentorFit(false)
                }}
                onPrev={() => setShowMentorFit(false)}
                isFirstStep={false}
              />
            </CardContent>
          </Card>
        )}

        {/* Assessment Complete Message */}
        {assessmentComplete && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>MentorFit™ Assessment Complete!</strong> Your responses have been saved and will be used
              to find your perfect preceptor match.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Link href="/dashboard/student/profile">
                <Button className="w-full" variant="default">
                  <User className="h-4 w-4 mr-2" />
                  Complete Profile
                </Button>
              </Link>
              <Link href="/dashboard/student">
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>
            <Link href="/dashboard/student/messages">
              <Button className="w-full" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Messages
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@mentoloop.com" className="text-primary hover:underline">
              support@mentoloop.com
            </a>
          </p>
          <p className="mt-2">
            Or visit our{' '}
            <Link href="/help" className="text-primary hover:underline">
              Help Center
            </Link>
            {' '}for FAQs and resources
          </p>
        </div>
      </div>
    </div>
  )
}