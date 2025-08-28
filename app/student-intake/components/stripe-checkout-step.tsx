'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Lock
} from 'lucide-react'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'

interface StripeCheckoutStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function StripeCheckoutStep({ 
  data, 
  updateFormData, 
  onNext,
  onPrev,
  isFirstStep 
}: StripeCheckoutStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const { isLoaded, isSignedIn } = useAuth()
  
  const createStudentCheckoutSession = useAction(api.payments.createStudentCheckoutSession)
  const createOrUpdateStudent = useMutation(api.students.createOrUpdateStudent)
  const ensureUserExists = useMutation(api.users.ensureUserExists)

  // Get the student info and membership data from previous steps
  const studentInfo = data.studentInfo as {
    fullName: string
    email: string
    school: string
    specialty: string
    hoursRequired: string
    state: string
  }
  
  const membership = data.membership as {
    plan: string
    planName: string
    price: number
    priceId: string
  }

  const handlePayment = async () => {
    // Check authentication
    if (!isLoaded || !isSignedIn) {
      setError('You must be signed in to complete payment. Please sign in and try again.')
      return
    }

    if (!studentInfo || !membership) {
      setError('Missing required information. Please complete all previous steps.')
      return
    }

    setIsProcessing(true)
    setError('')
    
    try {
      // First ensure user exists in database
      await ensureUserExists()
      
      // Create or update student record with initial data
      await createOrUpdateStudent({
        personalInfo: {
          fullName: studentInfo.fullName,
          email: studentInfo.email,
          phone: '', // Will be updated later
          dateOfBirth: '', // Will be updated later
          preferredContact: 'email'
        },
        schoolInfo: {
          programName: studentInfo.school,
          degreeTrack: studentInfo.specialty as "FNP" | "PNP" | "PMHNP" | "AGNP" | "ACNP" | "WHNP" | "NNP" | "DNP",
          schoolLocation: {
            city: '',
            state: studentInfo.state
          },
          programFormat: 'hybrid',
          expectedGraduation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
        },
        rotationNeeds: {
          rotationTypes: [studentInfo.specialty.toLowerCase().replace('np', '') as "family-practice"],
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days from now
          weeklyHours: '24-32',
          daysAvailable: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          willingToTravel: false,
          preferredLocation: {
            city: '',
            state: studentInfo.state
          }
        },
        matchingPreferences: {
          comfortableWithSharedPlacements: false
        },
        learningStyle: {
          learningMethod: 'hands-on',
          clinicalComfort: 'somewhat-comfortable',
          feedbackPreference: 'real-time',
          structurePreference: 'general-guidance',
          mentorRelationship: 'teacher-coach',
          observationPreference: 'mix-both',
          correctionStyle: 'supportive-private',
          retentionStyle: 'watching-doing',
          additionalResources: 'occasionally',
          proactiveQuestions: 3
        },
        agreements: {
          agreedToPaymentTerms: true,
          agreedToTermsAndPrivacy: true,
          digitalSignature: studentInfo.fullName,
          submissionDate: new Date().toISOString().split('T')[0]
        },
        membershipPlan: membership.plan as 'core' | 'pro' | 'premium'
      })
      
      // Create Stripe checkout session
      const session = await createStudentCheckoutSession({
        priceId: membership.priceId,
        customerEmail: studentInfo.email,
        customerName: studentInfo.fullName,
        membershipPlan: membership.plan,
        metadata: {
          studentName: studentInfo.fullName,
          school: studentInfo.school,
          specialty: studentInfo.specialty,
          membershipPlan: membership.plan
        },
        successUrl: `${window.location.origin}/student-intake/confirmation?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/student-intake`
      })

      if (session.sessionUrl) {
        // Store session ID for tracking
        updateFormData('payment', {
          sessionId: session.sessionId,
          status: 'redirecting'
        })
        
        // Redirect to Stripe checkout
        window.location.href = session.sessionUrl
      } else {
        throw new Error("No checkout session URL returned")
      }
    } catch (err) {
      console.error("Payment initialization failed:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize payment. Please try again.")
      toast.error("Payment initialization failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{membership?.planName || 'Membership Plan'}</p>
                <p className="text-sm text-muted-foreground">
                  Clinical rotation placement with MentoLoop
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(membership?.price || 0)}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student</span>
                <span>{studentInfo?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">School</span>
                <span>{studentInfo?.school}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialty</span>
                <span>{studentInfo?.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">State</span>
                <span>{studentInfo?.state}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Due Today</span>
              <span>{formatCurrency(membership?.price || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Secure Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              You will be redirected to Stripe&apos;s secure checkout page to complete your payment. 
              We accept all major credit cards, debit cards, Apple Pay, and Google Pay.
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <p className="text-sm font-medium">Payment Methods Accepted:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Badge variant="secondary" className="justify-center">Visa</Badge>
              <Badge variant="secondary" className="justify-center">Mastercard</Badge>
              <Badge variant="secondary" className="justify-center">Amex</Badge>
              <Badge variant="secondary" className="justify-center">Discover</Badge>
              <Badge variant="secondary" className="justify-center">Apple Pay</Badge>
              <Badge variant="secondary" className="justify-center">Google Pay</Badge>
              <Badge variant="secondary" className="justify-center">ACH</Badge>
              <Badge variant="secondary" className="justify-center">Afterpay</Badge>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security & Trust */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-1" />
            <div className="space-y-2">
              <p className="font-medium">Your Payment is Secure</p>
              <p className="text-sm text-muted-foreground">
                Your payment information is processed securely through Stripe, the industry leader in payment processing. 
                We never store your card details on our servers.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  PCI Compliant
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  SSL Encrypted
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Secure Checkout
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={isFirstStep || isProcessing}
        >
          Back to Membership
        </Button>
        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          size="lg"
          className="px-8"
        >
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pay {formatCurrency(membership?.price || 0)}
            </>
          )}
        </Button>
      </div>

      {/* Terms */}
      <div className="text-xs text-center text-muted-foreground">
        By proceeding with payment, you agree to our{' '}
        <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
        Refunds available per our refund policy.
      </div>
    </div>
  )
}