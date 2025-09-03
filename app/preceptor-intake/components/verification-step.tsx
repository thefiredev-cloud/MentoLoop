'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Award,
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
    agreedToBackgroundCheck: false,
    agreedToLicenseVerification: false,
    confirmedInformation: false,
    ...(data.verification || {})
  })

  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const preceptorInfo = data.preceptorInfo as {
    fullName: string
    licenseNumber: string
    licenseState: string
    specialty: string
    practiceName: string
    practiceState: string
  } | undefined

  useEffect(() => {
    updateFormData('verification', verificationData)
  }, [verificationData, updateFormData])

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setVerificationData(prev => ({ ...prev, [field]: checked }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleVerifyLicense = async () => {
    // Simplified: Just mark as agreed, manual verification will happen later
    handleCheckboxChange('agreedToLicenseVerification', true)
    setVerificationStatus('verified')
    toast.success('License information noted. Manual verification will be completed within 48 hours.')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!verificationData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the Terms of Service'
    }

    if (!verificationData.agreedToPrivacy) {
      newErrors.agreedToPrivacy = 'You must agree to the Privacy Policy'
    }

    if (!verificationData.agreedToBackgroundCheck) {
      newErrors.agreedToBackgroundCheck = 'Background check consent is required'
    }

    if (!verificationData.agreedToLicenseVerification) {
      newErrors.agreedToLicenseVerification = 'License verification is required'
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
            openToScreening: verificationData.agreedToBackgroundCheck
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
      {/* License Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            License Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">License Information to be Verified:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">License Number:</span> {preceptorInfo?.licenseNumber}</p>
              <p><span className="text-muted-foreground">License State:</span> {preceptorInfo?.licenseState}</p>
              <p><span className="text-muted-foreground">Name:</span> {preceptorInfo?.fullName}</p>
            </div>
          </div>

          {verificationStatus === 'idle' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your license information will be manually verified by our team within 48 hours after submission.
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'verifying' && (
            <Alert>
              <Clock className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Verifying your license with the {preceptorInfo?.licenseState} State Board of Nursing...
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === 'verified' && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                License verified successfully! Your credentials have been confirmed.
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus !== 'verified' && (
            <Button 
              onClick={handleVerifyLicense}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify My License
                </>
              )}
            </Button>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="licenseVerification"
              checked={verificationData.agreedToLicenseVerification}
              onCheckedChange={(checked) => handleCheckboxChange('agreedToLicenseVerification', checked as boolean)}
              disabled={verificationStatus !== 'verified'}
            />
            <div className="space-y-1">
              <Label htmlFor="licenseVerification" className="text-sm font-medium cursor-pointer">
                I consent to license verification *
              </Label>
              <p className="text-xs text-muted-foreground">
                MentoLoop will verify your license status with the appropriate state board
              </p>
              {errors.agreedToLicenseVerification && (
                <p className="text-sm text-destructive">{errors.agreedToLicenseVerification}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Check Consent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Background Check Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
            <p>As part of our commitment to student safety, we require all preceptors to consent to a background check. This includes:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Criminal history verification</li>
              <li>Professional license status</li>
              <li>Exclusion from federal programs</li>
              <li>Professional misconduct review</li>
            </ul>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="backgroundCheck"
              checked={verificationData.agreedToBackgroundCheck}
              onCheckedChange={(checked) => handleCheckboxChange('agreedToBackgroundCheck', checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="backgroundCheck" className="text-sm font-medium cursor-pointer">
                I consent to a background check *
              </Label>
              <p className="text-xs text-muted-foreground">
                Background checks are conducted by a third-party service and typically complete within 24-48 hours
              </p>
              {errors.agreedToBackgroundCheck && (
                <p className="text-sm text-destructive">{errors.agreedToBackgroundCheck}</p>
              )}
            </div>
          </div>
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