'use client'

import { useState, useCallback } from 'react'
import { Authenticated, Unauthenticated } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle } from 'lucide-react'
import SimplifiedPreceptorIntakeStep from './components/simplified-preceptor-intake-step'
import VerificationStep from './components/verification-step'

const steps = [
  { id: 1, name: 'Preceptor Information', component: SimplifiedPreceptorIntakeStep },
  { id: 2, name: 'Verification & Submission', component: VerificationStep },
]

export default function PreceptorIntakePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    preceptorInfo: {},
    verification: {},
  })

  const updateFormData = useCallback((section: string, data: Record<string, unknown>) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }))
  }, [])

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / steps.length) * 100
  const CurrentStepComponent = steps[currentStep - 1].component

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Unauthenticated>
          <div className="text-center space-y-6 py-12">
            <h1 className="text-3xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Please sign in to complete your preceptor application and join our network of healthcare professionals.
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
          <h1 className="text-3xl font-bold mb-2">Preceptor Intake Form</h1>
          <p className="text-muted-foreground text-lg">
            Join our network of healthcare professionals
          </p>
          <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
            Complete your profile and verify your credentials to start 
            receiving student match requests. The entire process takes less than 10 minutes.
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
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2 ${
                    step.id < currentStep 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : step.id === currentStep
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <span className={`text-xs text-center max-w-20 ${
                    step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
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
            Join our network of dedicated healthcare professionals making a difference in NP education. 
            Your expertise and mentorship will help shape the next generation of advanced practice nurses.
          </p>
        </div>
        </Authenticated>
      </div>
    </div>
  )
}