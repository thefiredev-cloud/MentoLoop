'use client'

import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { User, Mail, Briefcase, Calendar } from 'lucide-react'

interface SimplifiedPreceptorIntakeStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  isFirstStep?: boolean
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
  { value: 'other', label: 'Other' }
]

const AVAILABILITY_OPTIONS = [
  { value: 'full-time', label: 'Full-time (40+ hours/week)' },
  { value: 'part-time', label: 'Part-time (20-40 hours/week)' },
  { value: 'limited', label: 'Limited (< 20 hours/week)' },
  { value: 'flexible', label: 'Flexible/As Available' },
  { value: 'summer', label: 'Summer Only' },
  { value: 'fall', label: 'Fall Semester' },
  { value: 'spring', label: 'Spring Semester' },
  { value: 'year-round', label: 'Year-round' }
]

export default function SimplifiedPreceptorIntakeStep({ 
  data, 
  updateFormData, 
  onNext
}: SimplifiedPreceptorIntakeStepProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    otherSpecialty: '',
    practiceName: '',
    practiceCity: '',
    practiceState: '',
    availability: [] as string[],
    maxStudents: '1',
    acceptNewGrads: false,
    acceptInternational: false,
    ...(data.preceptorInfo || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    updateFormData('preceptorInfo', formData)
  }, [formData, updateFormData])

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAvailabilityChange = (value: string, checked: boolean) => {
    const newAvailability = checked 
      ? [...formData.availability, value]
      : formData.availability.filter((a: string) => a !== value)
    handleInputChange('availability', newAvailability)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Specialty is required'
    }

    if (formData.specialty === 'other' && !formData.otherSpecialty.trim()) {
      newErrors.otherSpecialty = 'Please specify your specialty'
    }

    if (!formData.practiceName.trim()) {
      newErrors.practiceName = 'Practice name is required'
    }

    if (!formData.practiceState) {
      newErrors.practiceState = 'Practice state is required'
    }

    if (formData.availability.length === 0) {
      newErrors.availability = 'Please select at least one availability option'
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
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
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
                placeholder="Dr. Jane Smith"
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
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Practice Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Practice Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialty">Primary Specialty *</Label>
            <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
              <SelectTrigger className={errors.specialty ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select your specialty" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((spec) => (
                  <SelectItem key={spec.value} value={spec.value}>
                    {spec.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialty && (
              <p className="text-sm text-destructive">{errors.specialty}</p>
            )}
          </div>

          {formData.specialty === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="otherSpecialty">Please Specify *</Label>
              <Input
                id="otherSpecialty"
                value={formData.otherSpecialty}
                onChange={(e) => handleInputChange('otherSpecialty', e.target.value)}
                placeholder="Enter your specialty"
                className={errors.otherSpecialty ? 'border-destructive' : ''}
              />
              {errors.otherSpecialty && (
                <p className="text-sm text-destructive">{errors.otherSpecialty}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="practiceName">Practice/Clinic Name *</Label>
            <Input
              id="practiceName"
              value={formData.practiceName}
              onChange={(e) => handleInputChange('practiceName', e.target.value)}
              placeholder="Main Street Medical Center"
              className={errors.practiceName ? 'border-destructive' : ''}
            />
            {errors.practiceName && (
              <p className="text-sm text-destructive">{errors.practiceName}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="practiceCity">Practice City</Label>
              <Input
                id="practiceCity"
                value={formData.practiceCity}
                onChange={(e) => handleInputChange('practiceCity', e.target.value)}
                placeholder="New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="practiceState">Practice State *</Label>
              <Select value={formData.practiceState} onValueChange={(value) => handleInputChange('practiceState', value)}>
                <SelectTrigger className={errors.practiceState ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.practiceState && (
                <p className="text-sm text-destructive">{errors.practiceState}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>When are you available to precept? *</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {AVAILABILITY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.availability.includes(option.value)}
                    onCheckedChange={(checked) => handleAvailabilityChange(option.value, checked as boolean)}
                  />
                  <Label
                    htmlFor={option.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.availability && (
              <p className="text-sm text-destructive">{errors.availability}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudents">Maximum Students at One Time</Label>
            <Select value={formData.maxStudents} onValueChange={(value) => handleInputChange('maxStudents', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select maximum students" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} student{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Additional Preferences</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptNewGrads"
                  checked={formData.acceptNewGrads}
                  onCheckedChange={(checked) => handleInputChange('acceptNewGrads', checked as boolean)}
                />
                <Label
                  htmlFor="acceptNewGrads"
                  className="text-sm font-normal cursor-pointer"
                >
                  Willing to precept new graduate NPs
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptInternational"
                  checked={formData.acceptInternational}
                  onCheckedChange={(checked) => handleInputChange('acceptInternational', checked as boolean)}
                />
                <Label
                  htmlFor="acceptInternational"
                  className="text-sm font-normal cursor-pointer"
                >
                  Willing to precept international students
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          size="lg"
          className="px-8"
        >
          Continue to Verification
        </Button>
      </div>
    </div>
  )
}