'use client'

import { useState, useCallback } from 'react'
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

const steps = [
  { id: 1, name: 'Personal Information', component: PersonalInformationStep },
  { id: 2, name: 'School Information', component: SchoolInformationStep },
  { id: 3, name: 'Rotation Needs', component: RotationNeedsStep },
  { id: 4, name: 'Payment & Agreement', component: PaymentAgreementStep },
  { id: 5, name: 'Matching Preferences', component: MatchingPreferencesStep },
]

export default function StudentIntakePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState({
    personalInfo: {},
    schoolInfo: {},
    rotationNeeds: {},
    paymentAgreement: {},
    matchingPreferences: {},
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
      case 1: // Personal Information
        const personalInfo = formData.personalInfo as {
          fullName?: string
          email?: string
          phoneNumber?: string
          dateOfBirth?: string
        }
        return !!(personalInfo.fullName && personalInfo.email && 
                 personalInfo.phoneNumber && personalInfo.dateOfBirth)
      
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto px-4 max-w-5xl py-8 md:py-12">
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

        <Authenticated>
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
        <Card className="mb-8 shadow-lg border-2">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold bg-primary/10 px-3 py-1 rounded-full">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="mb-6 h-3" />
            
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
                        className={`absolute top-5 left-1/2 w-full h-0.5 ${
                          completedSteps.includes(step.id) 
                            ? 'bg-green-500' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        style={{ width: 'calc(100% - 2rem)', left: '60%' }}
                      />
                    )}
                    <div 
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 
                        transition-all duration-300 z-10 bg-background
                        ${isCompleted
                          ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30' 
                          : isCurrent
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110'
                          : isAccessible
                          ? 'border-muted-foreground text-muted-foreground hover:border-primary hover:shadow-md cursor-pointer'
                          : 'border-gray-300 text-gray-300 cursor-not-allowed opacity-50'
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
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
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
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground italic max-w-2xl mx-auto">
              &ldquo;If you&apos;ve struggled to find a preceptor - or just want a better way - you&apos;re in the right place. 
              Let us take the stress out of your search - so you can focus on becoming the NP you&apos;re meant to be.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">
                Your information is secure and will never be shared without your consent
              </span>
            </div>
          </CardContent>
        </Card>
        </Authenticated>
      </div>
    </div>
  )
}