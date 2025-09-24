'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Authenticated, Unauthenticated } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle } from 'lucide-react'
import PersonalInformationStep from './components/personal-information-step'
import SchoolInformationStep from './components/school-information-step'
import RotationNeedsStep from './components/rotation-needs-step'
import PaymentAgreementStep from './components/payment-agreement-step'
import MatchingPreferencesStep from './components/matching-preferences-step'
import MentorFitAssessmentStep from './components/mentorfit-assessment-step'

declare global {
  interface Window {
    __MENTOLOOP_TEST_CHECKOUT__?: {
      sessionUrl?: string
      sessionId?: string
    }
  }
}

const steps = [
  { id: 1, name: 'Personal Information', component: PersonalInformationStep },
  { id: 2, name: 'School Information', component: SchoolInformationStep },
  { id: 3, name: 'Rotation Needs', component: RotationNeedsStep },
  { id: 4, name: 'Payment & Agreement', component: PaymentAgreementStep },
  { id: 5, name: 'Matching Preferences', component: MatchingPreferencesStep },
  { id: 6, name: 'MentorFit Assessment', component: MentorFitAssessmentStep },
]

export default function StudentIntakePage() {
  const searchParams = useSearchParams()
  // Load saved state from sessionStorage on mount
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('studentIntakeCurrentStep')
      return saved ? parseInt(saved, 10) : 1
    }
    return 1
  })

  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('studentIntakeCompletedSteps')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('studentIntakeFormData')
      return saved ? JSON.parse(saved) : {
        personalInfo: {},
        schoolInfo: {},
        rotationNeeds: {},
        paymentAgreement: {},
        matchingPreferences: {},
        mentorFitAssessment: {},
      }
    }
    return {
      personalInfo: {},
      schoolInfo: {},
      rotationNeeds: {},
      paymentAgreement: {},
      matchingPreferences: {},
      mentorFitAssessment: {},
    }
  })

  const [forceAuth, setForceAuth] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mentoloopTestForceAuth') === 'true'
    }
    return false
  })

  const updateFormData = useCallback((section: string, data: Record<string, unknown>) => {
    setFormData((prev: Record<string, Record<string, unknown>>) => {
      const newFormData = {
        ...prev,
        [section]: { ...prev[section as keyof typeof prev], ...data }
      }
      // Save to sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('studentIntakeFormData', JSON.stringify(newFormData))
      }
      return newFormData
    })
  }, [])

  // Save current step to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('studentIntakeCurrentStep', currentStep.toString())
    }
  }, [currentStep])

  // Save completed steps to sessionStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('studentIntakeCompletedSteps', JSON.stringify(completedSteps))
    }
  }, [completedSteps])

  // Allow automated tests to bypass auth when the test checkout override is injected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__MENTOLOOP_TEST_CHECKOUT__) {
      sessionStorage.setItem('mentoloopTestForceAuth', 'true')
      setForceAuth(true)
    }
  }, [])

  // Check if returning from Stripe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returningFromStripe = sessionStorage.getItem('returningFromStripe')
      if (returningFromStripe === 'true') {
        // Clear the flag
        sessionStorage.removeItem('returningFromStripe')

        // Check if payment was successful (would be redirected to confirmation page)
        // If still on this page, payment was cancelled - stay on step 4
        if (currentStep < 4) {
          setCurrentStep(4)
        }
      }
    }
  }, [currentStep])

  // Allow explicit step navigation via query param (?step=1..6)
  useEffect(() => {
    const stepParam = searchParams?.get('step')
    if (stepParam) {
      const stepNum = parseInt(stepParam, 10)
      if (!Number.isNaN(stepNum) && stepNum >= 1 && stepNum <= steps.length) {
        setCurrentStep(stepNum)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Validate if a step is completed based on form data
  const validateStep = useCallback((stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1: // Personal Information
        const personalInfo = formData.personalInfo as {
          dateOfBirth?: string
        }
        return !!personalInfo.dateOfBirth
      
      case 2: // School Information
        const schoolInfo = formData.schoolInfo as {
          university?: string
          npTrack?: string
          specialty?: string
          academicYear?: string
          coordinatorName?: string
          coordinatorEmail?: string
        }
        return !!(schoolInfo.university && schoolInfo.npTrack && 
                 schoolInfo.specialty && schoolInfo.academicYear)
      
      case 3: // Rotation Needs
        const rotationNeeds = formData.rotationNeeds as {
          requiredHours?: string
          specialtyPreferences?: string[]
          locationPreference?: string
          preferredStartDate?: string
          preferredEndDate?: string
        }
        return !!(rotationNeeds.requiredHours && rotationNeeds.specialtyPreferences?.length &&
                 rotationNeeds.locationPreference && rotationNeeds.preferredStartDate)
      
      case 4: // Payment & Agreement
        const paymentAgreement = formData.paymentAgreement as {
          membershipBlock?: string
          addOnHours?: number
          totalPrice?: number
          agreedToTerms?: boolean
          paymentCompleted?: boolean
        }
        return !!(paymentAgreement.membershipBlock && paymentAgreement.agreedToTerms && 
                 paymentAgreement.paymentCompleted)
      
      case 5: // Matching Preferences
        const matchingPreferences = formData.matchingPreferences as {
          practiceStyle?: string
          teachingPreferences?: string
          communicationStyle?: string
          schedulingFlexibility?: string
          mentorshipGoals?: string
        }
        return !!(matchingPreferences.practiceStyle && matchingPreferences.teachingPreferences &&
                 matchingPreferences.communicationStyle && matchingPreferences.schedulingFlexibility)
      
      case 6: // MentorFit Assessment
        const mentorFitAssessment = formData.mentorFitAssessment as {
          assessmentAnswers?: Record<string, string>
        }
        // Check if all 15 questions are answered
        const answeredQuestions = Object.keys(mentorFitAssessment.assessmentAnswers || {}).length
        return answeredQuestions >= 15
      
      default:
        return false
    }
  }, [formData])

  const nextStep = useCallback(() => {
    // Validate current step before proceeding
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep])
      }
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }, [currentStep, validateStep, completedSteps])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  // Prevent users from jumping to steps they haven't completed
  const canAccessStep = useCallback((stepNumber: number): boolean => {
    if (stepNumber === 1) return true // First step is always accessible
    return completedSteps.includes(stepNumber - 1) // Can only access if previous step is completed
  }, [completedSteps])

  const progress = (currentStep / steps.length) * 100
  const CurrentStepComponent = steps[currentStep - 1].component

  const intakeContent = (
    <>
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <CheckCircle className="w-4 h-4" />
          Secure & Confidential
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Student Intake Form
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete your profile for precision preceptor matching
        </p>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Our streamlined intake process collects your information, helps you select the right 
          membership plan, and then uses our proprietary MentorFit™ assessment for optimal matching.
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="mb-8 dashboard-card">
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold bg-primary/10 px-3 py-1 rounded-full">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="mb-6 h-2" />
          
          <div className="flex justify-between items-start">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = step.id === currentStep
              const isAccessible = canAccessStep(step.id)
              const isPaymentStep = step.id === 4
              const isGatedStep = step.id === 5
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1 relative">
                  {index < steps.length - 1 && (
                    <div 
                      className={`absolute top-5 left-1/2 -translate-x-1/2 h-0.5 ${
                        completedSteps.includes(step.id)
                          ? 'bg-accent'
                          : 'bg-muted'
                      }`}
                      style={{ width: 'calc(100% - 2.5rem)' }}
                    />
                  )}
                  <div 
                    className={`
                      flex items-center justify-center w-9 h-9 rounded-full border mb-2 
                      transition-all duration-200 z-10
                      ${isCompleted
                        ? 'bg-accent border-accent text-accent-foreground'
                        : isCurrent
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isAccessible
                        ? 'border-border bg-muted/40 text-muted-foreground hover:border-primary cursor-pointer'
                        : 'border-border text-muted-foreground/50 cursor-not-allowed opacity-50'
                      }
                    `}
                    onClick={() => {
                      if (isAccessible && step.id !== currentStep) {
                        setCurrentStep(step.id)
                      }
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : isPaymentStep ? (
                      <span className="text-sm">💳</span>
                    ) : isGatedStep ? (
                      <span className="text-sm">🔒</span>
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  <span className={`
                    text-xs text-center max-w-24 font-medium
                    ${isCompleted || isCurrent 
                      ? 'text-foreground' 
                      : isAccessible 
                      ? 'text-muted-foreground' 
                      : 'text-gray-400'
                    }
                  `}>
                    {step.name}
                    {isGatedStep && !isCompleted && (
                      <span className="block text-[10px] text-muted-foreground mt-1">
                        (Unlocks after payment)
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card className="dashboard-card">
        <CardHeader className="border-b bg-background/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Section {currentStep}: {steps[currentStep - 1].name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStep < 4 && "Complete this section to proceed"}
                {currentStep === 4 && "Select your membership and complete payment"}
                {currentStep === 5 && "Complete your matching preferences"}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-background px-4 py-2 rounded-lg border">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <CurrentStepComponent 
            data={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirstStep={currentStep === 1}
            isLastStep={currentStep === steps.length}
          />
        </CardContent>
      </Card>

      {/* Footer Message */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Your information is secure and will never be shared without your consent</span>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-4xl py-8 md:py-12">
        {!forceAuth && (
          <Unauthenticated>
            <Card className="max-w-md mx-auto shadow-xl border-2">
              <CardContent className="pt-12 pb-8 text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold">Sign In Required</h1>
                  <p className="text-muted-foreground text-lg">
                    Please sign in to complete your student intake form and start your clinical journey with MentoLoop.
                  </p>
                </div>
                <SignInButton mode="modal">
                  <Button size="lg" className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                    Sign In to Continue
                  </Button>
                </SignInButton>
              </CardContent>
            </Card>
          </Unauthenticated>
        )}

        {forceAuth ? intakeContent : (
          <Authenticated>
            {intakeContent}
          </Authenticated>
        )}
      </div>
    </div>
  )
}
