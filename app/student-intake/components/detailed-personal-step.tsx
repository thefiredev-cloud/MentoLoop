'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Phone, Calendar, Link as LinkIcon, Crown, User } from 'lucide-react'
import LockedSection from '@/components/form-protection/locked-section'
import { usePaymentProtection, canAccessFormSection } from '@/lib/payment-protection'

interface DetailedPersonalStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

export default function DetailedPersonalStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep 
}: DetailedPersonalStepProps) {
  const paymentStatus = usePaymentProtection()
  const canAccessSection = canAccessFormSection(paymentStatus, 'detailed-personal-info')
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    dateOfBirth: '',
    preferredContactMethod: '',
    linkedinUrl: '',
    resumeUrl: '',
    portfolioUrl: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    additionalNotes: '',
    ...(data.detailedPersonalInfo || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    updateFormData('detailedPersonalInfo', { ...formData, [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    if (!canAccessSection) {
      return false
    }

    const newErrors: Record<string, string> = {}

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number'
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    if (!formData.preferredContactMethod) {
      newErrors.preferredContactMethod = 'Preferred contact method is required'
    }

    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required'
    }

    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required'
    }

    if (formData.linkedinUrl && !formData.linkedinUrl.includes('linkedin.com')) {
      newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  if (!canAccessSection) {
    return (
      <LockedSection 
        sectionTitle="Detailed Personal Information"
        preview="Phone number, date of birth, preferred contact method, emergency contacts, and professional LinkedIn/resume links for comprehensive matching and safety compliance."
        requiredTier={['pro']}
        userTier={paymentStatus.membershipPlan}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detailed Personal Information
            <div className="ml-auto flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                PRO REQUIRED
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={`pl-9 ${errors.phoneNumber ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={`pl-9 ${errors.dateOfBirth ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredContactMethod">Preferred Contact Method *</Label>
            <Select value={formData.preferredContactMethod} onValueChange={(value) => handleInputChange('preferredContactMethod', value)}>
              <SelectTrigger className={errors.preferredContactMethod ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select your preferred contact method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="text">Text Message</SelectItem>
                <SelectItem value="any">Any Method</SelectItem>
              </SelectContent>
            </Select>
            {errors.preferredContactMethod && (
              <p className="text-sm text-destructive">{errors.preferredContactMethod}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                placeholder="Full name of emergency contact"
                className={errors.emergencyContactName ? 'border-destructive' : ''}
              />
              {errors.emergencyContactName && (
                <p className="text-sm text-destructive">{errors.emergencyContactName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={errors.emergencyContactPhone ? 'border-destructive' : ''}
              />
              {errors.emergencyContactPhone && (
                <p className="text-sm text-destructive">{errors.emergencyContactPhone}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn Profile URL (Optional)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className={`pl-9 ${errors.linkedinUrl ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.linkedinUrl && (
                <p className="text-sm text-destructive">{errors.linkedinUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume/CV URL (Optional)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                  placeholder="https://drive.google.com/file/..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio/Website URL (Optional)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                  placeholder="https://your-website.com"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Any additional information you'd like to share about yourself or special circumstances..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {!isFirstStep && (
          <Button 
            onClick={onPrev} 
            variant="outline"
            size="lg"
          >
            Previous
          </Button>
        )}
        <Button 
          onClick={handleNext}
          size="lg"
          className="ml-auto"
        >
          Continue to Rotation Needs
        </Button>
      </div>
    </div>
  )
}