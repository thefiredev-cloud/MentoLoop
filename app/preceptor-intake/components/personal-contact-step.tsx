'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STATE_OPTIONS } from '@/lib/states-config'

interface PersonalContactStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const licenseTypes = [
  { value: 'NP', label: 'Nurse Practitioner (NP)' },
  { value: 'MD/DO', label: 'Medical Doctor (MD/DO)' },
  { value: 'PA', label: 'Physician Assistant (PA)' },
  { value: 'other', label: 'Other' },
]

const specialties = [
  { value: 'FNP', label: 'Family Nurse Practitioner (FNP)' },
  { value: 'PNP', label: 'Pediatric Nurse Practitioner (PNP)' },
  { value: 'PMHNP', label: 'Psychiatric Mental Health NP (PMHNP)' },
  { value: 'AGNP', label: 'Adult-Gerontology NP (AGNP)' },
  { value: 'ACNP', label: 'Acute Care NP (ACNP)' },
  { value: 'WHNP', label: 'Women\'s Health NP (WHNP)' },
  { value: 'NNP', label: 'Neonatal NP (NNP)' },
  { value: 'other', label: 'Other' },
]

// Supported states for licensing
const states = STATE_OPTIONS.map(opt => opt.label)

export default function PersonalContactStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep 
}: PersonalContactStepProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobilePhone: '',
    licenseType: '',
    specialty: '',
    statesLicensed: [] as string[],
    npiNumber: '',
    linkedinOrCV: '',
    ...(data.personalInfo || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stateInput, setStateInput] = useState('')

  useEffect(() => {
    updateFormData('personalInfo', formData)
  }, [formData, updateFormData])

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    handleInputChange('mobilePhone', formatted)
  }

  const validateNPI = (npi: string) => {
    return /^\d{10}$/.test(npi.replace(/\D/g, ''))
  }

  const addState = (state: string) => {
    if (state && !formData.statesLicensed.includes(state)) {
      setFormData(prev => ({
        ...prev,
        statesLicensed: [...prev.statesLicensed, state]
      }))
      setStateInput('')
    }
  }

  const removeState = (state: string) => {
    setFormData(prev => ({
      ...prev,
      statesLicensed: prev.statesLicensed.filter(s => s !== state)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.mobilePhone.trim()) {
      newErrors.mobilePhone = 'Mobile phone is required'
    } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(formData.mobilePhone) && !/^\d{10}$/.test(formData.mobilePhone.replace(/\D/g, ''))) {
      newErrors.mobilePhone = 'Please enter a valid phone number'
    }

    if (!formData.licenseType) {
      newErrors.licenseType = 'License type is required'
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Specialty is required'
    }

    if (formData.statesLicensed.length === 0) {
      newErrors.statesLicensed = 'Texas licensing is required'
    } else if (!formData.statesLicensed.includes('Texas')) {
      newErrors.statesLicensed = 'Must be licensed in Texas to participate'
    }

    if (!formData.npiNumber.trim()) {
      newErrors.npiNumber = 'NPI number is required'
    } else if (!validateNPI(formData.npiNumber)) {
      newErrors.npiNumber = 'Please enter a valid 10-digit NPI number'
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
      <div className="grid gap-6 md:grid-cols-2">
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
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobilePhone">Mobile Phone *</Label>
          <Input
            id="mobilePhone"
            value={formData.mobilePhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(555) 123-4567"
            className={errors.mobilePhone ? 'border-destructive' : ''}
          />
          {errors.mobilePhone && (
            <p className="text-sm text-destructive">{errors.mobilePhone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseType">License Type *</Label>
          <Select 
            value={formData.licenseType} 
            onValueChange={(value) => handleInputChange('licenseType', value)}
          >
            <SelectTrigger className={errors.licenseType ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select license type" />
            </SelectTrigger>
            <SelectContent>
              {licenseTypes.map((license) => (
                <SelectItem key={license.value} value={license.value}>
                  {license.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.licenseType && (
            <p className="text-sm text-destructive">{errors.licenseType}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty *</Label>
          <Select 
            value={formData.specialty} 
            onValueChange={(value) => handleInputChange('specialty', value)}
          >
            <SelectTrigger className={errors.specialty ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((specialty) => (
                <SelectItem key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.specialty && (
            <p className="text-sm text-destructive">{errors.specialty}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="npiNumber">NPI Number *</Label>
          <Input
            id="npiNumber"
            value={formData.npiNumber}
            onChange={(e) => handleInputChange('npiNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="1234567890"
            className={errors.npiNumber ? 'border-destructive' : ''}
          />
          {errors.npiNumber && (
            <p className="text-sm text-destructive">{errors.npiNumber}</p>
          )}
        </div>
      </div>

      {/* States Licensed - Texas Only */}
      <div className="space-y-3">
        <Label>State(s) Licensed In *</Label>
        <div className="bg-blue-50 p-3 rounded-lg mb-3">
          <div className="text-sm text-blue-900 font-medium">Texas Operations Only</div>
          <div className="text-xs text-blue-700">
            MentoLoop currently operates exclusively in Texas. You must be licensed in Texas to participate as a preceptor.
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.statesLicensed.map((state) => (
            <Badge key={state} variant="secondary" className="gap-1">
              {state}
              <button 
                onClick={() => removeState(state)}
                className="text-xs hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <Select 
          value="" 
          onValueChange={(value) => {
            addState(value)
          }}
        >
          <SelectTrigger className={errors.statesLicensed ? 'border-destructive' : ''}>
            <SelectValue placeholder="Add Texas license" />
          </SelectTrigger>
          <SelectContent>
            {states
              .filter(state => !formData.statesLicensed.includes(state))
              .map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.statesLicensed && (
          <p className="text-sm text-destructive">{errors.statesLicensed}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedinOrCV">LinkedIn Profile or CV (Optional)</Label>
        <Input
          id="linkedinOrCV"
          value={formData.linkedinOrCV}
          onChange={(e) => handleInputChange('linkedinOrCV', e.target.value)}
          placeholder="LinkedIn URL or CV file link"
        />
        <p className="text-xs text-muted-foreground">
          You can provide a LinkedIn profile URL or upload your CV to a cloud service and paste the link
        </p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
            <div>
              <p className="text-sm font-medium mb-1">Verification Process</p>
              <p className="text-xs text-muted-foreground">
                We verify all preceptor credentials including license status, NPI validation, and specialty verification. 
                This process helps maintain quality standards and gives students confidence in our network.
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
          Next: Practice Information
        </Button>
      </div>
    </div>
  )
}