'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, FileText, Shield, Star } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import Link from 'next/link'

interface PreceptorAgreementsStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function PreceptorAgreementsStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep 
}: PreceptorAgreementsStepProps) {
  const [formData, setFormData] = useState({
    openToScreening: false,
    wantSpotlightFeature: false,
    agreedToTermsAndPrivacy: false,
    digitalSignature: '',
    submissionDate: new Date().toISOString().split('T')[0],
    ...(data.agreements || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const createOrUpdatePreceptor = useMutation(api.preceptors.createOrUpdatePreceptor)
  
  // Type assertion for form data from previous steps
  type PersonalInfo = {
    fullName: string
    email: string
    mobilePhone: string
    licenseType: "NP" | "MD/DO" | "PA" | "other"
    specialty: "FNP" | "PNP" | "PMHNP" | "AGNP" | "ACNP" | "WHNP" | "NNP" | "other"
    statesLicensed: string[]
    npiNumber: string
    linkedinOrCV?: string
  }
  
  type PracticeInfo = {
    practiceName: string
    practiceSettings: ("private-practice" | "clinic" | "hospital" | "urgent-care" | "telehealth" | "other")[]
    address: string
    city: string
    state: string
    zipCode: string
    emrUsed?: string
    website?: string
  }
  
  type Availability = {
    currentlyAccepting: boolean
    availableRotations: ("family-practice" | "pediatrics" | "psych-mental-health" | "adult-gero" | "womens-health" | "acute-care" | "other")[]
    maxStudentsPerRotation: "1" | "2" | "3+"
    rotationDurationPreferred: "4-weeks" | "8-weeks" | "12-weeks" | "flexible"
    preferredStartDates: string[]
    daysAvailable: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[]
  }
  
  type MatchingPreferences = {
    studentDegreeLevelPreferred: "BSN-to-DNP" | "MSN" | "post-masters" | "no-preference"
    comfortableWithFirstRotation: boolean
    schoolsWorkedWith?: string[]
    languagesSpoken?: string[]
  }
  
  type MentoringStyle = {
    mentoringApproach: "coach-guide" | "support-needed" | "expect-initiative"
    rotationStart: "orient-goals" | "observe-adjust" | "dive-in-learn"
    feedbackApproach: "real-time" | "daily-checkins" | "weekly-written"
    learningMaterials: "always" | "sometimes" | "rarely"
    patientInteractions: "lead-then-shadow" | "shadow-then-lead" | "lead-from-day-one"
    questionPreference: "anytime-during" | "breaks-downtime" | "end-of-day"
    autonomyLevel: "close-supervision" | "shared-decisions" | "high-independence"
    evaluationFrequency: "every-shift" | "weekly" | "end-of-rotation"
    newStudentPreference: "prefer-coaching" | "flexible" | "prefer-independent"
    idealDynamic: "learner-teacher" | "teammates" | "supervisee-clinician"
  }

  useEffect(() => {
    updateFormData('agreements', formData)
  }, [formData, updateFormData])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.agreedToTermsAndPrivacy) {
      newErrors.agreedToTermsAndPrivacy = 'You must agree to the Terms of Service and Privacy Policy'
    }

    if (!formData.digitalSignature.trim()) {
      newErrors.digitalSignature = 'Digital signature is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Debug: Log the data being submitted
      console.log('Submitting preceptor intake form with data:')
      console.log('personalInfo:', data.personalInfo)
      console.log('practiceInfo:', data.practiceInfo)
      console.log('availability:', data.availability)
      console.log('matchingPreferences:', data.matchingPreferences)
      console.log('mentoringStyle:', data.mentoringStyle)
      console.log('agreements:', formData)
      
      // Validate required fields exist
      if (!data.personalInfo || Object.keys(data.personalInfo).length === 0) {
        throw new Error('Personal information is missing. Please complete all steps.')
      }
      if (!data.practiceInfo || Object.keys(data.practiceInfo).length === 0) {
        throw new Error('Practice information is missing. Please complete all steps.')
      }
      if (!data.availability || Object.keys(data.availability).length === 0) {
        throw new Error('Availability information is missing. Please complete all steps.')
      }
      if (!data.mentoringStyle || Object.keys(data.mentoringStyle).length === 0) {
        throw new Error('Mentoring style preferences are missing. Please complete all steps.')
      }
      
      // Ensure mentoring style has all required fields with defaults
      // Filter out empty strings from mentoringStyle data to allow defaults to be used
      const mentoringStyleData = data.mentoringStyle || {}
      const filteredMentoringStyle = Object.entries(mentoringStyleData).reduce((acc, [key, value]) => {
        // Only include non-empty values
        if (value !== '' && value !== undefined && value !== null) {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, unknown>)
      
      const mentoringStyleWithDefaults = {
        mentoringApproach: "coach-guide",
        rotationStart: "orient-goals",
        feedbackApproach: "real-time",
        learningMaterials: "sometimes",
        patientInteractions: "shadow-then-lead",
        questionPreference: "anytime-during",
        autonomyLevel: "shared-decisions",
        evaluationFrequency: "weekly",
        newStudentPreference: "flexible",
        idealDynamic: "learner-teacher",
        ...filteredMentoringStyle,
      } as MentoringStyle
      
      // Ensure matching preferences has defaults
      const matchingPreferencesWithDefaults = {
        studentDegreeLevelPreferred: "no-preference",
        comfortableWithFirstRotation: false,
        schoolsWorkedWith: [],
        languagesSpoken: [],
        ...(data.matchingPreferences || {}),
      } as MatchingPreferences
      
      // Submit all form data to Convex
      await createOrUpdatePreceptor({
        personalInfo: data.personalInfo as PersonalInfo,
        practiceInfo: data.practiceInfo as PracticeInfo,
        availability: data.availability as Availability,
        matchingPreferences: matchingPreferencesWithDefaults,
        mentoringStyle: mentoringStyleWithDefaults,
        agreements: formData,
      })

      setIsSubmitted(true)
    } catch (error) {
      console.error('Failed to submit form:', error)
      if (error instanceof Error) {
        setErrors({ submit: error.message })
      } else {
        setErrors({ submit: 'Failed to submit form. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-accent mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-4">
            Thank you for your interest in becoming a MentoLoop preceptor.
          </p>
          <p className="text-sm text-muted-foreground">
            Our team will review your application and verify your credentials. 
            You&apos;ll receive an email confirmation shortly and hear from us within 3-5 business days.
          </p>
        </div>
        <div className="bg-muted/50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. We&apos;ll verify your license, NPI number, and credentials</p>
            <p>2. Our team will review your practice information and availability</p>
            <p>3. You may receive a brief phone or video screening call</p>
            <p>4. Once approved, your profile will be active for student matching</p>
            <p>5. We&apos;ll send you potential student matches based on your MentorFit™ preferences</p>
          </div>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Preceptor Agreement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Preceptor Agreement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <h4 className="font-semibold mb-3">This agreement is entered into between MentoLoop and the undersigned (&quot;Preceptor&quot;) for participation in the NP student matching program.</h4>
            <div className="space-y-2 text-muted-foreground">
              <p>By participating, you agree to the following:</p>
              <p>1. You are a licensed healthcare professional (NP, MD, DO, or PA) in good standing.</p>
              <p>2. You understand that your participation is voluntary and that you may accept or decline any student match.</p>
              <p>3. You agree to provide a safe, educational, and respectful environment for the assigned student during the agreed-upon rotation dates.</p>
              <p>4. You understand that MentoLoop is not the employer, supervisor, or credentialing body for the student.</p>
              <p>5. You release MentoLoop from liability for clinical, educational, or legal issues that may arise during the rotation.</p>
              <p>6. You acknowledge that your stipend is a thank-you honorarium and not a contract for services.</p>
              <p>7. You agree to communicate any concerns or scheduling changes in a timely manner.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Follow-up Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="screening" className="text-sm font-medium">
                Open to phone/Zoom screening?
              </Label>
              <p className="text-xs text-muted-foreground">
                Brief 15-minute conversation to discuss your experience and answer questions
              </p>
            </div>
            <Switch
              id="screening"
              checked={formData.openToScreening}
              onCheckedChange={(checked) => handleInputChange('openToScreening', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="spotlight" className="text-sm font-medium">
                Want to be featured as a spotlight preceptor?
              </Label>
              <p className="text-xs text-muted-foreground">
                Optional feature highlighting experienced preceptors on our platform
              </p>
            </div>
            <Switch
              id="spotlight"
              checked={formData.wantSpotlightFeature}
              onCheckedChange={(checked) => handleInputChange('wantSpotlightFeature', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Terms and Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Terms of Service & Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="termsAndPrivacy"
              checked={formData.agreedToTermsAndPrivacy}
              onCheckedChange={(checked) => handleInputChange('agreedToTermsAndPrivacy', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="termsAndPrivacy" className="text-sm font-medium">
                I consent to MentoLoop&apos;s{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                {' '}*
              </Label>
              {errors.agreedToTermsAndPrivacy && (
                <p className="text-sm text-destructive">{errors.agreedToTermsAndPrivacy}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Digital Signature */}
      <Card>
        <CardHeader>
          <CardTitle>Digital Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="digitalSignature">Type your full name as your digital signature *</Label>
            <Input
              id="digitalSignature"
              value={formData.digitalSignature}
              onChange={(e) => handleInputChange('digitalSignature', e.target.value)}
              placeholder="Type your full name here"
              className={errors.digitalSignature ? 'border-destructive' : ''}
            />
            {errors.digitalSignature && (
              <p className="text-sm text-destructive">{errors.digitalSignature}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="submissionDate">Date</Label>
            <Input
              id="submissionDate"
              type="date"
              value={formData.submissionDate}
              onChange={(e) => handleInputChange('submissionDate', e.target.value)}
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1 text-primary dark:text-primary-foreground">Your Information Security</p>
              <p className="text-xs text-primary/80 dark:text-primary-foreground/80">
                We follow strict verification procedures and maintain HIPAA-compliant data security. 
                Your information is encrypted and only shared with verified students after mutual match approval. 
                We never sell preceptor data to third parties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {errors.submit && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive mb-1">Submission Error</p>
                <p className="text-xs text-destructive">{errors.submit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={isFirstStep || isSubmitting}
        >
          Previous
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          size="lg"
          className="px-8"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  )
}