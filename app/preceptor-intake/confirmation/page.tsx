'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  Shield,
  DollarSign,
  User,
  Calendar,
  MessageSquare,
  Award,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default function PreceptorIntakeConfirmationPage() {
  // const router = useRouter() // Will be used for future navigation
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const stripeConnect = searchParams.get('stripe_connect')

  useEffect(() => {
    // Clear any stored form data after successful submission
    if (success === 'true' || stripeConnect === 'complete') {
      sessionStorage.removeItem('preceptorIntakeData')
    }
  }, [success, stripeConnect])

  if (success !== 'true' && stripeConnect !== 'complete') {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Registration Incomplete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Your registration was not completed. Please try again.</p>
              <Link href="/preceptor-intake">
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
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to the MentoLoop Network!</h1>
          <p className="text-lg text-muted-foreground">
            Your preceptor application has been submitted successfully
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
              <p className="font-medium">License Verification</p>
              <p className="text-xs text-muted-foreground mt-1">24-48 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-5 w-5 text-primary" />
                <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
              </div>
              <p className="font-medium">Background Check</p>
              <p className="text-xs text-muted-foreground mt-1">2-3 business days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <p className="font-medium">Payment Account</p>
              <p className="text-xs text-muted-foreground mt-1">Ready to receive</p>
            </CardContent>
          </Card>
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
                <p className="font-medium">We Verify Your Credentials</p>
                <p className="text-sm text-muted-foreground">
                  Our team will verify your license and complete a background check (2-3 business days)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium">Profile Goes Live</p>
                <p className="text-sm text-muted-foreground">
                  Once approved, your profile becomes visible to students seeking preceptors
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium">Receive Match Requests</p>
                <p className="text-sm text-muted-foreground">
                  Students will be matched based on your preferences and availability
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">4</span>
              </div>
              <div>
                <p className="font-medium">Start Mentoring & Earning</p>
                <p className="text-sm text-muted-foreground">
                  Accept matches, mentor students, and receive weekly payments
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
              <span>Application submitted successfully</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-green-600" />
              <span>Confirmation email sent to your registered email</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-green-600" />
              <span>Preceptor profile created</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>Stripe Connect account linked</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Verification in progress</span>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Alert className="mb-6">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>Check your email!</strong> We&apos;ve sent you important information about your account 
            and the verification process. You&apos;ll receive updates as your application progresses.
          </AlertDescription>
        </Alert>

        {/* Expected Earnings */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Your Expected Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">$300-500</p>
                <p className="text-sm text-muted-foreground">Per student rotation</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">4-6</p>
                <p className="text-sm text-muted-foreground">Average students/year</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">$1,800+</p>
                <p className="text-sm text-muted-foreground">Average annual earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Link href="/dashboard/preceptor">
                <Button className="w-full" variant="default">
                  <User className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/preceptor/profile">
                <Button className="w-full" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Link href="/dashboard/preceptor/availability">
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Set Availability
                </Button>
              </Link>
              <Link href="/dashboard/preceptor/messages">
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Messages
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Preceptor Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/resources/preceptor-guide" className="text-primary hover:underline text-sm block">
              → Preceptor Best Practices Guide
            </Link>
            <Link href="/resources/student-expectations" className="text-primary hover:underline text-sm block">
              → Understanding Student Expectations
            </Link>
            <Link href="/resources/evaluation-forms" className="text-primary hover:underline text-sm block">
              → Evaluation Forms & Templates
            </Link>
            <Link href="/resources/faq" className="text-primary hover:underline text-sm block">
              → Frequently Asked Questions
            </Link>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Need help? Contact our preceptor support team at{' '}
            <a href="mailto:preceptors@mentoloop.com" className="text-primary hover:underline">
              preceptors@mentoloop.com
            </a>
          </p>
          <p className="mt-2">
            Or call us at{' '}
            <a href="tel:1-800-MENTOR" className="text-primary hover:underline">
              1-800-MENTOR
            </a>
            {' '}(Monday-Friday, 9am-5pm EST)
          </p>
        </div>
      </div>
    </div>
  )
}