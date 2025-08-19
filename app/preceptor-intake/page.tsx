'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle } from 'lucide-react'
import PersonalContactStep from './components/personal-contact-step'
import PracticeInfoStep from './components/practice-info-step'
import AvailabilityStep from './components/availability-step'
import MentoringStyleStep from './components/mentoring-style-step'
import PreceptorAgreementsStep from './components/preceptor-agreements-step'

const steps = [
  { id: 1, name: 'Personal & Contact', component: PersonalContactStep },
  { id: 2, name: 'Practice Information', component: PracticeInfoStep },
  { id: 3, name: 'Availability', component: AvailabilityStep },
  { id: 4, name: 'Mentoring Style', component: MentoringStyleStep },
  { id: 5, name: 'Agreements', component: PreceptorAgreementsStep },
]

export default function PreceptorIntakePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    personalInfo: {},
    practiceInfo: {},
    availability: {},
    matchingPreferences: {},
    mentoringStyle: {},
    agreements: {},
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Shape the future of advanced nursing</h1>
          <p className="text-muted-foreground text-lg">
            One student at a time.
          </p>
          <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
            Thank you for your interest in becoming a preceptor with MentoLoop. We connect experienced, 
            mission-driven NPs and clinicians with students who are eager to learn, grow, and serve their communities. 
            Whether you&apos;ve mentored before or are new to teaching, we make the process simple, rewarding, and fully supported.
          </p>
          <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
            Make a lasting impact and pass on your knowledge, skills, and experience to the next generation of nurse practitioners. 
            We handle the details, from matching to school paperwork, we streamline the entire placement process, 
            so you can focus on teaching.
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
      </div>
    </div>
  )
}