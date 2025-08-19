'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, FileText, Shield } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import Link from 'next/link'

interface AgreementsStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function AgreementsStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep 
}: AgreementsStepProps) {
  const [formData, setFormData] = useState({
    agreedToPaymentTerms: false,
    agreedToTermsAndPrivacy: false,
    digitalSignature: '',
    submissionDate: new Date().toISOString().split('T')[0],
    ...data.agreements
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const createOrUpdateStudent = useMutation(api.students.createOrUpdateStudent)

  useEffect(() => {
    updateFormData('agreements', formData)
  }, [formData])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.agreedToPaymentTerms) {
      newErrors.agreedToPaymentTerms = 'You must agree to the payment terms to continue'
    }

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
      // Submit all form data to Convex
      await createOrUpdateStudent({
        personalInfo: data.personalInfo,
        schoolInfo: data.schoolInfo,
        rotationNeeds: data.rotationNeeds,
        matchingPreferences: data.matchingPreferences,
        learningStyle: data.learningStyle,
        agreements: formData,
      })

      setIsSubmitted(true)
    } catch (error) {
      console.error('Failed to submit form:', error)
      setErrors({ submit: 'Failed to submit form. Please try again.' })
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
            Thank you for completing your MentoLoop student intake form.
          </p>
          <p className="text-sm text-muted-foreground">
            Our team will review your application and begin searching for potential preceptor matches. 
            You&apos;ll receive an email confirmation shortly and hear from us within 2-3 business days.
          </p>
        </div>
        <div className="bg-muted/50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. We&apos;ll review your application and verify your school enrollment</p>
            <p>2. Our MentorFit™ algorithm will identify compatible preceptors</p>
            <p>3. Our team will manually review top matches for quality assurance</p>
            <p>4. You&apos;ll receive match recommendations within 2-3 business days</p>
            <p>5. Once you confirm a match, we&apos;ll coordinate introductions and paperwork</p>
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
      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment & Agreement Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <h4 className="font-semibold mb-3">By submitting this form and/or completing payment, I understand and agree to the following:</h4>
            <div className="space-y-2 text-muted-foreground">
              <p>1. MentoLoop is a third-party platform that facilitates introductions between NP students and potential preceptors.</p>
              <p>2. MentoLoop does not supervise, employ, credential, or guarantee the actions of any preceptor.</p>
              <p>3. I am responsible for verifying that the selected preceptor meets the clinical requirements of my NP program.</p>
              <p>4. I release MentoLoop, its affiliates, and its representatives from any liability related to my clinical experience, academic credit, licensure, or graduation status.</p>
              <p>5. My match fee includes a stipend paid directly to the preceptor and an administrative fee to MentoLoop for support and coordination.</p>
              <p>6. MentoLoop does not refund fees after a confirmed match, except in cases where no match is provided within the agreed timeline.</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="paymentTerms"
              checked={formData.agreedToPaymentTerms}
              onCheckedChange={(checked) => handleInputChange('agreedToPaymentTerms', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="paymentTerms" className="text-sm font-medium">
                I acknowledge and agree to these terms *
              </Label>
              {errors.agreedToPaymentTerms && (
                <p className="text-sm text-destructive">{errors.agreedToPaymentTerms}</p>
              )}
            </div>
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

      {/* Privacy Notice */}
      <Card className="bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1 text-primary dark:text-primary-foreground">Your Data Security</p>
              <p className="text-xs text-primary/80 dark:text-primary-foreground/80">
                We prioritize student safety and data privacy with every interaction. Your information is encrypted, 
                HIPAA-compliant, and only shared with verified preceptors after you&apos;ve confirmed a match. 
                We never sell your data to third parties.
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