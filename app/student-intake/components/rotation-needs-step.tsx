'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Calendar, Clock, Stethoscope } from 'lucide-react'

interface RotationNeedsStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const HOUR_REQUIREMENTS = [
  { value: '60', label: '60 hours' },
  { value: '120', label: '120 hours' },
  { value: '180', label: '180 hours' },
  { value: '240', label: '240 hours' },
  { value: '360', label: '360 hours' },
  { value: '480', label: '480 hours' },
  { value: '500', label: '500 hours' },
  { value: '600', label: '600 hours' },
  { value: '720', label: '720 hours' },
  { value: 'other', label: 'Other' }
]

const SPECIALTY_PREFERENCES = [
  { id: 'primary-care', label: 'Primary Care' },
  { id: 'specialty-care', label: 'Specialty Care' },
  { id: 'urgent-care', label: 'Urgent Care' },
  { id: 'emergency', label: 'Emergency Department' },
  { id: 'hospital', label: 'Hospital/Inpatient' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'womens-health', label: 'Women\'s Health' },
  { id: 'mental-health', label: 'Mental Health' },
  { id: 'geriatrics', label: 'Geriatrics' },
  { id: 'other', label: 'Other Specialty' }
]

const TIMEFRAME_OPTIONS = [
  { value: 'spring_2025', label: 'Spring 2025' },
  { value: 'summer_2025', label: 'Summer 2025' },
  { value: 'fall_2025', label: 'Fall 2025' },
  { value: 'winter_2025', label: 'Winter 2025' },
  { value: 'flexible', label: 'Flexible' }
]

export default function RotationNeedsStep({ 
  data, 
  updateFormData, 
  onNext,
  onPrev,
  isFirstStep,
  isLastStep: _isLastStep 
}: RotationNeedsStepProps) {
  const [formData, setFormData] = useState({
    requiredHours: '',
    customHours: '',
    specialtyPreferences: [] as string[],
    otherSpecialty: '',
    locationPreference: '',
    preferredStartDate: '',
    preferredEndDate: '',
    timeframe: '',
    ...(data.rotationNeeds || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    updateFormData('rotationNeeds', { ...formData, [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentValues = formData[field as keyof typeof formData] as string[]
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value)
    
    handleInputChange(field, newValues)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.requiredHours) {
      newErrors.requiredHours = 'Required hours is required'
    } else if (formData.requiredHours === 'other' && !formData.customHours) {
      newErrors.customHours = 'Please specify the number of hours'
    }

    if (formData.specialtyPreferences.length === 0) {
      newErrors.specialtyPreferences = 'Please select at least one specialty preference'
    }
    if (formData.specialtyPreferences.includes('other') && !formData.otherSpecialty.trim()) {
      newErrors.otherSpecialty = 'Please specify the other specialty'
    }

    if (!formData.locationPreference.trim()) {
      newErrors.locationPreference = 'Location preference is required'
    }

    if (!formData.preferredStartDate) {
      newErrors.preferredStartDate = 'Preferred start date is required'
    }

    if (!formData.timeframe) {
      newErrors.timeframe = 'Timeframe is required'
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Rotation Needs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requiredHours">Required Hours *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={formData.requiredHours} onValueChange={(value) => handleInputChange('requiredHours', value)}>
                  <SelectTrigger className={`pl-9 ${errors.requiredHours ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select required hours" />
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
              {errors.requiredHours && (
                <p className="text-sm text-destructive">{errors.requiredHours}</p>
              )}
            </div>

            {formData.requiredHours === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customHours">Specify Hours *</Label>
                <Input
                  id="customHours"
                  type="number"
                  value={formData.customHours}
                  onChange={(e) => handleInputChange('customHours', e.target.value)}
                  placeholder="Enter number of hours"
                  className={errors.customHours ? 'border-destructive' : ''}
                />
                {errors.customHours && (
                  <p className="text-sm text-destructive">{errors.customHours}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Specialty Preference(s) *</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {SPECIALTY_PREFERENCES.map((specialty) => (
                <div key={specialty.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty.id}
                    checked={formData.specialtyPreferences.includes(specialty.id)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('specialtyPreferences', specialty.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={specialty.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {specialty.label}
                  </label>
                </div>
              ))}
          </div>
          {errors.specialtyPreferences && (
            <p className="text-sm text-destructive">{errors.specialtyPreferences}</p>
          )}
          {formData.specialtyPreferences.includes('other') && (
            <div className="space-y-2">
              <Label htmlFor="otherSpecialty">Specify Other Specialty *</Label>
              <Input
                id="otherSpecialty"
                value={formData.otherSpecialty}
                onChange={(e) => handleInputChange('otherSpecialty', e.target.value)}
                placeholder="e.g., Cardiology, Endocrinology"
                className={errors.otherSpecialty ? 'border-destructive' : ''}
              />
              {errors.otherSpecialty && (
                <p className="text-sm text-destructive">{errors.otherSpecialty}</p>
              )}
            </div>
          )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationPreference">Location Preference *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="locationPreference"
                value={formData.locationPreference}
                onChange={(e) => handleInputChange('locationPreference', e.target.value)}
                placeholder="City, State or ZIP code"
                className={`pl-9 ${errors.locationPreference ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.locationPreference && (
              <p className="text-sm text-destructive">{errors.locationPreference}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe *</Label>
              <Select value={formData.timeframe} onValueChange={(value) => handleInputChange('timeframe', value)}>
                <SelectTrigger className={errors.timeframe ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timeframe && (
                <p className="text-sm text-destructive">{errors.timeframe}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredStartDate">Preferred Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="preferredStartDate"
                  type="date"
                  value={formData.preferredStartDate}
                  onChange={(e) => handleInputChange('preferredStartDate', e.target.value)}
                  className={`pl-9 ${errors.preferredStartDate ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.preferredStartDate && (
                <p className="text-sm text-destructive">{errors.preferredStartDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredEndDate">Preferred End Date (Optional)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="preferredEndDate"
                type="date"
                value={formData.preferredEndDate}
                onChange={(e) => handleInputChange('preferredEndDate', e.target.value)}
                className="pl-9"
              />
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
        >
          Continue to Membership Selection
        </Button>
      </div>
    </div>
  )
}
