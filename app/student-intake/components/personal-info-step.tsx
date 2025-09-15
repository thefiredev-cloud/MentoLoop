'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

interface PersonalInfoStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function PersonalInfoStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep: _isLastStep 
}: PersonalInfoStepProps) {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    preferredContact: '',
    linkedinOrResume: '',
    // hidden but stored for downstream use
    fullName: '',
    email: '',
    phone: '',
    ...(data.personalInfo || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})


  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    updateFormData('personalInfo', newFormData)
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  useEffect(() => {
    // Prefill from Clerk for hidden fields
    const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
    const email = user?.primaryEmailAddress?.emailAddress || ''
    const phone = user?.primaryPhoneNumber?.phoneNumber || ''
    const next = { ...formData, fullName, email, phone }
    setFormData(next)
    updateFormData('personalInfo', next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    // preferredContact optional now

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '')
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (_value: string) => {}

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className={errors.dateOfBirth ? 'border-destructive' : ''}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredContact">Preferred Contact Method (Optional)</Label>
          <Select 
            value={formData.preferredContact} 
            onValueChange={(value) => handleInputChange('preferredContact', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="text">Text/SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedinOrResume">LinkedIn Profile or Resume (Optional)</Label>
          <Input
            id="linkedinOrResume"
            value={formData.linkedinOrResume}
            onChange={(e) => handleInputChange('linkedinOrResume', e.target.value)}
            placeholder="LinkedIn URL or file upload link"
          />
          <p className="text-xs text-muted-foreground">Optional</p>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
            <div>
              <p className="text-sm font-medium mb-1">Privacy Notice</p>
              <p className="text-xs text-muted-foreground">
                Your personal information is securely stored and only shared with matched preceptors. 
                We follow HIPAA compliance standards and will never sell your data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next: School Information
        </Button>
      </div>
    </div>
  )
}
