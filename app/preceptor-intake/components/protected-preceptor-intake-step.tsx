'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, Phone, MapPin, Stethoscope, Lock } from 'lucide-react'
import LockedSection from '@/components/form-protection/locked-section'
import { usePaymentProtection } from '@/lib/payment-protection'

interface ProtectedPreceptorIntakeStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const SPECIALTIES = [
  { value: 'FNP', label: 'Family Nurse Practitioner (FNP)' },
  { value: 'PNP', label: 'Pediatric Nurse Practitioner (PNP)' },
  { value: 'PMHNP', label: 'Psychiatric Mental Health NP (PMHNP)' },
  { value: 'AGNP', label: 'Adult-Gerontology NP (AGNP)' },
  { value: 'ACNP', label: 'Acute Care NP (ACNP)' },
  { value: 'WHNP', label: 'Women\'s Health NP (WHNP)' },
  { value: 'NNP', label: 'Neonatal NP (NNP)' },
  { value: 'other', label: 'Other' }
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function ProtectedPreceptorIntakeStep({
  data,
  updateFormData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep: _isLastStep
}: ProtectedPreceptorIntakeStepProps) {
  const paymentStatus = usePaymentProtection()
  
  // For preceptors, we show basic form but protect advanced sections
  // This allows them to start registration but shows what they'd get with payment
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    state: '',
    ...(data.preceptorInfo || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    updateFormData('preceptorInfo', newData)
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.specialty) {
      newErrors.specialty = 'Specialty is required'
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

  return (
    <div className="space-y-6">
      {/* Basic Information - Always accessible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Preceptor Information
            <div className="ml-auto">
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                FREE ACCESS
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className={`pl-9 ${errors.phone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Primary Specialty *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Practice State *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
              <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                <SelectTrigger className={`pl-9 ${errors.state ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select your practice state" />
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

      {/* Protected Sections */}
      <LockedSection 
        sectionTitle="Detailed Practice Information"
        preview="Practice name, settings, address, website, EMR system used, and complete practice details for comprehensive student matching."
        requiredTier={['core']}
        userTier={paymentStatus.membershipPlan}
      />
      
      <LockedSection 
        sectionTitle="Licensing & Credentials"
        preview="License type, NPI number, states licensed, board certifications, and professional credentials verification."
        requiredTier={['core']}
        userTier={paymentStatus.membershipPlan}
      />

      <LockedSection 
        sectionTitle="Precepting Availability & Preferences"
        preview="Current availability, rotation types offered, maximum students per rotation, preferred duration, start dates, and scheduling preferences."
        requiredTier={['pro']}
        userTier={paymentStatus.membershipPlan}
      />
      
      <LockedSection 
        sectionTitle="Student Preferences & Matching Criteria"
        preview="Student degree level preferences, first rotation comfort, schools worked with, languages spoken, and detailed matching preferences."
        requiredTier={['pro']}
        userTier={paymentStatus.membershipPlan}
      />

      <LockedSection 
        sectionTitle="MentorFit Teaching Style Assessment"
        preview="Comprehensive 18-question assessment analyzing mentoring approach, teaching style, feedback preferences, supervision methods, and personality traits for optimal student matching."
        requiredTier={['elite', 'premium']}
        userTier={paymentStatus.membershipPlan}
      />

      {/* Warning Message */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Lock className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Protected Intellectual Property
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                Our comprehensive intake process and MentorFit matching algorithm are protected 
                to prevent competitors from copying our proprietary methodology. While you can 
                begin registration with basic information, advanced matching features require 
                platform access verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          Continue to Verification
        </Button>
      </div>
    </div>
  )
}
