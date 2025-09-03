'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  Clock,
  Send
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'

interface VerificationStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function VerificationStep({ 
  data, 
  updateFormData, 
  onNext,
  onPrev,
  isFirstStep,
  isLastStep 
}: VerificationStepProps) {
  const [verificationData, setVerificationData] = useState({
    agreedToTerms: false,
    agreedToPrivacy: false,
    confirmedInformation: false,
    ...(data.verification || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    updateFormData('verification', verificationData)
  }, [verificationData, updateFormData])

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setVerificationData(prev => ({ ...prev, [field]: checked }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }


  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!verificationData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the Terms of Service'
    }

    if (!verificationData.agreedToPrivacy) {
      newErrors.agreedToPrivacy = 'You must agree to the Privacy Policy'
    }

    if (!verificationData.confirmedInformation) {
      newErrors.confirmedInformation = 'You must confirm that your information is accurate'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const router = useRouter()
  const createOrUpdatePreceptor = useMutation(api.preceptors.createOrUpdatePreceptor)
  const ensureUserExists = useMutation(api.users.ensureUserExists)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = async () => {
    if (!validateForm()) {
      return
    }

    // If this is the last step, submit the data
    if (isLastStep) {
      setIsSubmitting(true)
      
      try {
        // Ensure user exists in database
        await ensureUserExists()
        
        // Prepare preceptor data from form with safe defaults
        interface PreceptorFormData {
          fullName?: string
          email?: string
          phone?: string
          specialty?: string
          state?: string
          npiNumber?: string
          practiceName?: string
          address?: string
          city?: string
          zipCode?: string
          emrUsed?: string
        }
        
        const preceptorFormData = (data.preceptorInfo || {}) as PreceptorFormData
        
        // Map specialty properly - the form has the value already mapped to the correct format
        const specialty = preceptorFormData.specialty || 'other'
        
        // Map state to array for statesLicensed
        const statesLicensed = preceptorFormData.state ? [preceptorFormData.state] : ['CA']
        
        // Save preceptor data with safe defaults for all required fields
        await createOrUpdatePreceptor({
          personalInfo: {
            fullName: preceptorFormData.fullName || 'Unknown',
            email: preceptorFormData.email || '',
            mobilePhone: preceptorFormData.phone || '',
            licenseType: 'NP' as const,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            specialty: specialty as any,
            statesLicensed: statesLicensed,
            npiNumber: preceptorFormData.npiNumber || ''
          },
          practiceInfo: {
            practiceName: preceptorFormData.practiceName || 'Private Practice',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            practiceSettings: ['clinic'] as any[],
            address: preceptorFormData.address || '',
            city: preceptorFormData.city || '',
            state: preceptorFormData.state || 'CA',
            zipCode: preceptorFormData.zipCode || '',
            emrUsed: preceptorFormData.emrUsed || ''
          },
          availability: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            daysAvailable: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as any[],
            currentlyAccepting: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            availableRotations: ['family-practice'] as any[],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            maxStudentsPerRotation: '1' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rotationDurationPreferred: '4-weeks' as any,
            preferredStartDates: []
          },
          matchingPreferences: {
            studentDegreeLevelPreferred: 'no-preference' as const,
            comfortableWithFirstRotation: true,
            schoolsWorkedWith: [],
            languagesSpoken: []
          },
          mentoringStyle: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mentoringApproach: 'coach-guide' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rotationStart: 'orient-goals' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            feedbackApproach: 'daily-checkins' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            learningMaterials: 'sometimes' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            patientInteractions: 'shadow-then-lead' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            questionPreference: 'anytime-during' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            autonomyLevel: 'shared-decisions' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            evaluationFrequency: 'weekly' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            newStudentPreference: 'flexible' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            idealDynamic: 'learner-teacher' as any
          },
          agreements: {
            agreedToTermsAndPrivacy: verificationData.agreedToTerms && verificationData.agreedToPrivacy,
            digitalSignature: preceptorFormData.fullName || 'Unknown',
            submissionDate: new Date().toISOString().split('T')[0],
            openToScreening: true
          }
        })
        
        toast.success('Application submitted successfully! Our team will review your credentials within 48 hours.')
        
        // Redirect to preceptor dashboard
        router.push('/dashboard/preceptor?onboarding=complete')
      } catch (error) {
        console.error('Failed to submit preceptor profile:', error)
        toast.error('Failed to submit profile. Please try again.')
        setIsSubmitting(false)
      }
    } else {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Almost Done!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Thank you for your interest in becoming a MentoLoop preceptor! 
            Please review and agree to our terms to complete your registration.
            Our team will review your information within 48 hours.
          </p>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Terms & Agreements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <h4 className="font-semibold mb-3">By joining MentoLoop as a preceptor, you agree to:</h4>
            <div className="space-y-2 text-muted-foreground">
              <p>1. Provide accurate and truthful information about your credentials and experience</p>
              <p>2. Maintain appropriate professional boundaries with students</p>
              <p>3. Comply with all applicable laws and regulations regarding clinical education</p>
              <p>4. Notify MentoLoop of any changes to your license status or eligibility to precept</p>
              <p>5. Participate in good faith in the matching and placement process</p>
              <p>6. Provide educational experiences that meet students&apos; learning objectives</p>
              <p>7. Complete evaluations and provide feedback as requested</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={verificationData.agreedToTerms}
                onCheckedChange={(checked) => handleCheckboxChange('agreedToTerms', checked as boolean)}
              />
              <div className="space-y-1">
                <Label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                  I agree to MentoLoop&apos;s{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  {' '}*
                </Label>
                {errors.agreedToTerms && (
                  <p className="text-sm text-destructive">{errors.agreedToTerms}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={verificationData.agreedToPrivacy}
                onCheckedChange={(checked) => handleCheckboxChange('agreedToPrivacy', checked as boolean)}
              />
              <div className="space-y-1">
                <Label htmlFor="privacy" className="text-sm font-medium cursor-pointer">
                  I agree to MentoLoop&apos;s{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  {' '}*
                </Label>
                {errors.agreedToPrivacy && (
                  <p className="text-sm text-destructive">{errors.agreedToPrivacy}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="confirmInfo"
                checked={verificationData.confirmedInformation}
                onCheckedChange={(checked) => handleCheckboxChange('confirmedInformation', checked as boolean)}
              />
              <div className="space-y-1">
                <Label htmlFor="confirmInfo" className="text-sm font-medium cursor-pointer">
                  I confirm all information provided is accurate and complete *
                </Label>
                {errors.confirmedInformation && (
                  <p className="text-sm text-destructive">{errors.confirmedInformation}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1 text-primary dark:text-primary-foreground">Your Information is Secure</p>
              <p className="text-xs text-primary/80 dark:text-primary-foreground/80">
                All personal and professional information is encrypted and stored securely. 
                We never share your data with third parties without your explicit consent.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          size="lg"
          className="px-8"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : isLastStep ? (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Application
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  )
}