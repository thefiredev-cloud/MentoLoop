'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { User, Mail, School, Clock, MapPin, Stethoscope, Lock, Crown, Zap } from 'lucide-react'
import LockedSection from '@/components/form-protection/locked-section'
import { usePaymentProtection, canAccessFormSection, getLockedSectionPreview } from '@/lib/payment-protection'

interface ProtectedIntakeStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  isFirstStep: boolean
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const SPECIALTIES = [
  { value: 'FNP', label: 'Family Nurse Practitioner (FNP)' },
  { value: 'PNP', label: 'Pediatric Nurse Practitioner (PNP)' },
  { value: 'PMHNP', label: 'Psychiatric Mental Health NP (PMHNP)' },
  { value: 'AGNP', label: 'Adult-Gerontology NP (AGNP)' },
  { value: 'ACNP', label: 'Acute Care NP (ACNP)' },
  { value: 'WHNP', label: 'Women\'s Health NP (WHNP)' },
  { value: 'NNP', label: 'Neonatal NP (NNP)' },
  { value: 'DNP', label: 'Doctor of Nursing Practice (DNP)' }
]

const HOUR_REQUIREMENTS = [
  { value: '120', label: '120 hours' },
  { value: '240', label: '240 hours' },
  { value: '360', label: '360 hours' },
  { value: '480', label: '480 hours' },
  { value: '500', label: '500 hours' },
  { value: '600', label: '600 hours' },
  { value: '720', label: '720 hours' },
  { value: 'other', label: 'Other' }
]

export default function ProtectedIntakeStep({ 
  data, 
  updateFormData, 
  onNext,
  isFirstStep 
}: ProtectedIntakeStepProps) {
  const paymentStatus = usePaymentProtection()
  const canAccessBasicInfo = canAccessFormSection(paymentStatus, 'personal-info')
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    school: '',
    specialty: '',
    hoursRequired: '',
    state: '',
    ...(data.studentInfo || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    updateFormData('studentInfo', { ...formData, [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    if (!canAccessBasicInfo) {
      return false // Block validation if no payment
    }

    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.school.trim()) {
      newErrors.school = 'School name is required'
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Specialty is required'
    }

    if (!formData.hoursRequired) {
      newErrors.hoursRequired = 'Clinical hours required is needed'
    }

    if (!formData.state) {
      newErrors.state = 'State is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  // Show payment protection message if no access
  if (!canAccessBasicInfo) {
    return (
      <div className="space-y-6">
        <LockedSection 
          sectionTitle="Student Information"
          preview="Complete your basic profile information including contact details, school, specialty, and clinical requirements to get started with MentoLoop."
          requiredTier={['core']}
          userTier={paymentStatus.membershipPlan}
        />
        
        {/* Show additional locked sections */}
        <LockedSection 
          sectionTitle="Detailed Personal Information" 
          preview="Phone number, date of birth, preferred contact method, and professional LinkedIn/resume links for comprehensive matching."
          requiredTier={['pro']}
          userTier={paymentStatus.membershipPlan}
        />
        
        <LockedSection 
          sectionTitle="Rotation Needs & Preferences"
          preview="Specific rotation types, scheduling preferences, availability, travel willingness, and location preferences for optimal preceptor matching."
          requiredTier={['pro']}
          userTier={paymentStatus.membershipPlan}
        />
        
        <LockedSection 
          sectionTitle="Advanced Matching Preferences"
          preview="Shared placement comfort, languages spoken, ideal preceptor qualities, and detailed matching criteria."
          requiredTier={['premium']}
          userTier={paymentStatus.membershipPlan}
        />
        
        <LockedSection 
          sectionTitle="MentorFit Learning Style Assessment"
          preview="Comprehensive 18-question assessment analyzing learning style, feedback preferences, mentoring approach, and personality traits for precise preceptor matching."
          requiredTier={['premium']}
          userTier={paymentStatus.membershipPlan}
        />

        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Protected Content</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our comprehensive intake forms and MentoFit matching system are protected 
            intellectual property. Complete your membership selection to access these 
            advanced features.
          </p>
          <p className="text-xs text-muted-foreground">
            ⚠️ This protection prevents competitors from copying our proprietary 
            matching methodology and form structure.
          </p>
        </div>
      </div>
    )
  }

  // Show normal form if payment completed
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
            <div className="ml-auto flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                {paymentStatus.membershipPlan?.toUpperCase()} MEMBER
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className={`pl-9 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">School Name *</Label>
            <div className="relative">
              <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="school"
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                placeholder="Enter your nursing school name"
                className={`pl-9 ${errors.school ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.school && (
              <p className="text-sm text-destructive">{errors.school}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty Track *</Label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                  <SelectTrigger className={`pl-9 ${errors.specialty ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.specialty && (
                <p className="text-sm text-destructive">{errors.specialty}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursRequired">Clinical Hours Required *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={formData.hoursRequired} onValueChange={(value) => handleInputChange('hoursRequired', value)}>
                  <SelectTrigger className={`pl-9 ${errors.hoursRequired ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select hours needed" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_REQUIREMENTS.map((hours) => (
                      <SelectItem key={hours.value} value={hours.value}>
                        {hours.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.hoursRequired && (
                <p className="text-sm text-destructive">{errors.hoursRequired}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
              <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                <SelectTrigger className={`pl-9 ${errors.state ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          size="lg"
          className="px-8"
        >
          Continue to Membership Selection
        </Button>
      </div>
    </div>
  )
}