'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  DollarSign, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building,
  FileText,
  TrendingUp,
  BanknoteIcon,
  ArrowRight
} from 'lucide-react'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'

interface StripeConnectStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function StripeConnectStep({ 
  data, 
  updateFormData, 
  onNext,
  onPrev,
  isFirstStep 
}: StripeConnectStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [connectStatus, setConnectStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const { isLoaded, isSignedIn } = useAuth()
  
  const createPreceptorConnectAccount = useAction(api.payments.createPreceptorConnectAccount)
  const createOrUpdatePreceptor = useMutation(api.preceptors.createOrUpdatePreceptor)
  const ensureUserExists = useMutation(api.users.ensureUserExists)

  // Get the preceptor info from previous steps
  const preceptorInfo = data.preceptorInfo as {
    fullName: string
    email: string
    phone: string
    licenseNumber: string
    licenseState: string
    specialty: string
    practiceName: string
    practiceCity: string
    practiceState: string
    yearsExperience: string
    availability: string[]
    maxStudents: string
    acceptNewGrads: boolean
    acceptInternational: boolean
  }

  const handleStripeConnect = async () => {
    // Check authentication
    if (!isLoaded || !isSignedIn) {
      setError('You must be signed in to set up payments. Please sign in and try again.')
      return
    }

    if (!preceptorInfo) {
      setError('Missing required information. Please complete all previous steps.')
      return
    }

    setIsProcessing(true)
    setError('')
    setConnectStatus('connecting')
    
    try {
      // First ensure user exists in database
      await ensureUserExists()
      
      // Save preceptor data
      await createOrUpdatePreceptor({
        personalInfo: {
          fullName: preceptorInfo.fullName,
          email: preceptorInfo.email,
          mobilePhone: preceptorInfo.phone,
          licenseType: 'NP' as const,
          specialty: (preceptorInfo.specialty === 'family-practice' ? 'FNP' :
                     preceptorInfo.specialty === 'pediatrics' ? 'PNP' :
                     preceptorInfo.specialty === 'mental-health' ? 'PMHNP' :
                     preceptorInfo.specialty === 'womens-health' ? 'WHNP' :
                     preceptorInfo.specialty === 'acute-care' ? 'ACNP' :
                     'other') as "FNP" | "PNP" | "PMHNP" | "AGNP" | "ACNP" | "WHNP" | "NNP" | "other",
          statesLicensed: [preceptorInfo.licenseState],
          npiNumber: ''
        },
        practiceInfo: {
          practiceName: preceptorInfo.practiceName,
          practiceSettings: [preceptorInfo.specialty.includes('telehealth') ? 'telehealth' : 
                           preceptorInfo.specialty.includes('hospital') ? 'hospital' : 'clinic'] as ("private-practice" | "urgent-care" | "hospital" | "clinic" | "telehealth" | "other")[],
          address: '',
          city: preceptorInfo.practiceCity || '',
          state: preceptorInfo.practiceState,
          zipCode: '',
          emrUsed: ''
        },
        availability: {
          daysAvailable: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[],
          currentlyAccepting: true,
          availableRotations: [preceptorInfo.specialty === 'family-practice' ? 'family-practice' :
                              preceptorInfo.specialty === 'pediatrics' ? 'pediatrics' :
                              preceptorInfo.specialty === 'mental-health' ? 'psych-mental-health' :
                              preceptorInfo.specialty === 'womens-health' ? 'womens-health' :
                              'other'] as ("family-practice" | "pediatrics" | "psych-mental-health" | "womens-health" | "adult-gero" | "acute-care" | "other")[],
          maxStudentsPerRotation: preceptorInfo.maxStudents as "1" | "2" | "3+",
          rotationDurationPreferred: '4-weeks' as "4-weeks" | "8-weeks" | "12-weeks" | "flexible",
          preferredStartDates: []
        },
        matchingPreferences: {
          studentDegreeLevelPreferred: preceptorInfo.acceptNewGrads 
            ? 'no-preference' as const
            : 'MSN' as const,
          comfortableWithFirstRotation: preceptorInfo.acceptNewGrads,
          schoolsWorkedWith: [],
          languagesSpoken: []
        },
        mentoringStyle: {
          mentoringApproach: 'coach-guide' as "coach-guide" | "support-needed" | "expect-initiative",
          rotationStart: 'orient-goals' as "orient-goals" | "observe-adjust" | "dive-in-learn",
          feedbackApproach: 'daily-checkins' as "real-time" | "daily-checkins" | "weekly-written",
          learningMaterials: 'sometimes' as "always" | "sometimes" | "rarely",
          patientInteractions: 'shadow-then-lead' as "lead-then-shadow" | "shadow-then-lead" | "lead-from-day-one",
          questionPreference: 'anytime-during' as "anytime-during" | "breaks-downtime" | "end-of-day",
          autonomyLevel: 'shared-decisions' as "close-supervision" | "shared-decisions" | "high-independence",
          evaluationFrequency: 'weekly' as "every-shift" | "weekly" | "end-of-rotation",
          newStudentPreference: 'flexible' as "prefer-coaching" | "flexible" | "prefer-independent",
          idealDynamic: 'learner-teacher' as "learner-teacher" | "teammates" | "supervisee-clinician"
        },
        agreements: {
          agreedToTermsAndPrivacy: true,
          digitalSignature: preceptorInfo.fullName,
          submissionDate: new Date().toISOString().split('T')[0],
          openToScreening: true
        }
      })
      
      // Create Stripe Connect account
      const result = await createPreceptorConnectAccount({
        email: preceptorInfo.email,
        returnUrl: `${window.location.origin}/preceptor-intake/confirmation?success=true&stripe_connect=complete`,
        refreshUrl: `${window.location.origin}/preceptor-intake?stripe_connect=refresh`
      })

      if (result.accountLink) {
        // Store Stripe Connect status
        updateFormData('stripeConnect', {
          status: 'redirecting',
          accountId: result.accountId
        })
        
        // Redirect to Stripe Connect onboarding
        window.location.href = result.accountLink
      } else {
        throw new Error("Failed to create Stripe Connect link")
      }
    } catch (err) {
      console.error("Stripe Connect setup failed:", err)
      setError(err instanceof Error ? err.message : "Failed to set up payment account. Please try again.")
      setConnectStatus('idle')
      toast.error("Payment setup failed")
    } finally {
      setIsProcessing(false)
    }
  }

  // Check if returning from Stripe Connect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const stripeConnectStatus = urlParams.get('stripe_connect')
    
    if (stripeConnectStatus === 'complete') {
      setConnectStatus('connected')
      updateFormData('stripeConnect', {
        status: 'connected',
        completedAt: new Date().toISOString()
      })
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [updateFormData])

  if (connectStatus === 'connected') {
    return (
      <div className="space-y-6">
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Payment Account Connected!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  Your Stripe Connect account has been successfully set up. You&apos;re ready to receive payments.
                </p>
              </div>
              <Link href="/preceptor-intake/confirmation?success=true&stripe_connect=complete">
                <Button size="lg" className="mt-4">
                  Continue to Confirmation
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Set Up Your Payment Account</h2>
        <p className="text-muted-foreground">
          Connect your bank account to receive payments from students
        </p>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            How Payments Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium">Students pay MentoLoop</p>
                <p className="text-sm text-muted-foreground">
                  Students complete payment when confirming their match with you
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium">MentoLoop processes payment</p>
                <p className="text-sm text-muted-foreground">
                  We handle all payment processing and compliance requirements
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium">You receive your stipend</p>
                <p className="text-sm text-muted-foreground">
                  Payments are deposited directly to your bank account weekly
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Payment Schedule</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payout Frequency:</span>
                <span className="font-medium">Weekly (every Friday)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Time:</span>
                <span className="font-medium">2-3 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Payout:</span>
                <span className="font-medium">$25</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Connect Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Connect Your Bank Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              We use Stripe Connect, the industry standard for secure payment processing. 
              Your banking information is encrypted and never stored on our servers.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm">You&apos;ll be redirected to Stripe to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Verify your identity</li>
              <li>Connect your bank account</li>
              <li>Set up tax information (for 1099 reporting)</li>
              <li>Configure payout preferences</li>
            </ul>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What you&apos;ll need:</h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Bank account details</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Social Security Number</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Date of birth</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Business address</span>
              </div>
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

      {/* Earnings Potential */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Earning Potential
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">$300-500</p>
              <p className="text-sm text-muted-foreground">Per student rotation</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">$1,800+</p>
              <p className="text-sm text-muted-foreground">Average annual earnings</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">4-6</p>
              <p className="text-sm text-muted-foreground">Students per year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Badge */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="h-5 w-5" />
            <div>
              <div className="font-medium">Bank-Level Security</div>
              <div>Your financial information is protected with 256-bit encryption and PCI compliance</div>
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
          Previous
        </Button>
        <Button 
          onClick={handleStripeConnect}
          disabled={isProcessing}
          size="lg"
          className="px-8"
        >
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Connect Stripe Account
            </>
          )}
        </Button>
      </div>
    </div>
  )
}