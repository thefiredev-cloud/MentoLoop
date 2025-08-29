'use client'

import { useState, useCallback } from 'react'
import { Authenticated, Unauthenticated } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle } from 'lucide-react'
import ProtectedIntakeStep from './components/protected-intake-step'
import DetailedPersonalStep from './components/detailed-personal-step'
import RotationNeedsStep from './components/rotation-needs-step'
import AdvancedMatchingStep from './components/advanced-matching-step'
import MentorFitAssessmentStep from './components/mentorfit-assessment-step'
import MembershipSelectionStep from './components/membership-selection-step'
import StripeCheckoutStep from './components/stripe-checkout-step'

const steps = [
  { id: 1, name: 'Basic Information', component: ProtectedIntakeStep },
  { id: 2, name: 'Personal Details', component: DetailedPersonalStep },
  { id: 3, name: 'Rotation Needs', component: RotationNeedsStep },
  { id: 4, name: 'Matching Preferences', component: AdvancedMatchingStep },
  { id: 5, name: 'MentorFit Assessment', component: MentorFitAssessmentStep },
  { id: 6, name: 'Membership Selection', component: MembershipSelectionStep },
  { id: 7, name: 'Secure Payment', component: StripeCheckoutStep },
]

export default function StudentIntakePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState({
    studentInfo: {},
    detailedPersonalInfo: {},
    rotationNeeds: {},
    advancedMatching: {},
    mentorFitAssessment: {},
    membership: {},
    payment: {},
  })

  const updateFormData = useCallback((section: string, data: Record<string, unknown>) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }))
  }, [])

  // Validate if a step is completed based on form data
  const validateStep = useCallback((stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1: // Basic Student Information
        const studentInfo = formData.studentInfo as {
          fullName?: string
          email?: string
          school?: string
          specialty?: string
          hoursRequired?: string
          state?: string
        }
        return !!(studentInfo.fullName && studentInfo.email && studentInfo.school && 
                 studentInfo.specialty && studentInfo.hoursRequired && studentInfo.state)
      
      case 2: // Detailed Personal Information
        const personalInfo = formData.detailedPersonalInfo as {
          phoneNumber?: string
          dateOfBirth?: string
          preferredContactMethod?: string
          emergencyContactName?: string
          emergencyContactPhone?: string
        }
        return !!(personalInfo.phoneNumber && personalInfo.dateOfBirth && 
                 personalInfo.preferredContactMethod && personalInfo.emergencyContactName && 
                 personalInfo.emergencyContactPhone)
      
      case 3: // Rotation Needs
        const rotationNeeds = formData.rotationNeeds as {
          rotationTypes?: string[]
          schedulePreferences?: string[]
          preferredStartDate?: string
          maxTravelDistance?: string
          timeCommitment?: string
        }
        return !!(rotationNeeds.rotationTypes?.length && rotationNeeds.schedulePreferences?.length &&
                 rotationNeeds.preferredStartDate && rotationNeeds.maxTravelDistance && 
                 rotationNeeds.timeCommitment)
      
      case 4: // Advanced Matching
        const advancedMatching = formData.advancedMatching as {
          languagesSpoken?: string[]
          sharedPlacementComfort?: string
          communicationStyle?: string
          feedbackPreference?: string
        }
        return !!(advancedMatching.languagesSpoken?.length && advancedMatching.sharedPlacementComfort &&
                 advancedMatching.communicationStyle && advancedMatching.feedbackPreference)
      
      case 5: // MentorFit Assessment
        const mentorFit = formData.mentorFitAssessment as {
          assessmentAnswers?: Record<string, string>
        }
        const expectedQuestions = 15 // Total number of assessment questions
        const answeredQuestions = mentorFit.assessmentAnswers ? Object.keys(mentorFit.assessmentAnswers).length : 0
        return answeredQuestions >= expectedQuestions
      
      case 6: // Membership Selection
        const membership = formData.membership as {
          plan?: string
          planName?: string
          price?: number
        }
        return !!(membership.plan && membership.planName && membership.price)
      
      case 7: // Payment (this step completes with redirect)
        return false // This step is always validated externally via Stripe
      
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

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Unauthenticated>
          <div className="text-center space-y-6 py-12">
            <h1 className="text-3xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Please sign in to complete your student intake form and start your clinical journey with MentoLoop.
            </p>
            <SignInButton mode="modal">
              <Button size="lg">
                Sign In to Continue
              </Button>
            </SignInButton>
          </div>
        </Unauthenticated>

        <Authenticated>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Comprehensive Student Intake</h1>
          <p className="text-muted-foreground text-lg">
            Complete your comprehensive profile for precision preceptor matching
          </p>
          <p className="text-muted-foreground mt-4">
            Our detailed intake process includes basic information, detailed personal data, 
            rotation needs, matching preferences, and our proprietary MentorFit assessment 
            for the most accurate preceptor matching available.
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="mb-6" />
            
            <div className="flex justify-between">
              {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id)
                const isCurrent = step.id === currentStep
                const isAccessible = canAccessStep(step.id)
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div 
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2 ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isCurrent
                          ? 'border-primary text-primary'
                          : isAccessible
                          ? 'border-muted-foreground text-muted-foreground hover:border-primary cursor-pointer'
                          : 'border-gray-300 text-gray-300 cursor-not-allowed'
                      } transition-colors`}
                      onClick={() => {
                        if (isAccessible && step.id !== currentStep) {
                          setCurrentStep(step.id)
                        }
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    <span className={`text-xs text-center max-w-20 ${
                      isCompleted || isCurrent 
                        ? 'text-foreground' 
                        : isAccessible 
                        ? 'text-muted-foreground' 
                        : 'text-gray-400'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Section {currentStep}: {steps[currentStep - 1].name}</CardTitle>
          </CardHeader>
          <CardContent>
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
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            If you&apos;ve struggled to find a preceptor - or just want a better way - you&apos;re in the right place. 
            Let us take the stress out of your search - so you can focus on becoming the NP you&apos;re meant to be.
          </p>
        </div>
        </Authenticated>
      </div>
    </div>
  )
}