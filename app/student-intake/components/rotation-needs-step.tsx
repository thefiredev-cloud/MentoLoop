'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { MapPin, Clock, Calendar, Crown, Stethoscope } from 'lucide-react'
import LockedSection from '@/components/form-protection/locked-section'
import { usePaymentProtection, canAccessFormSection } from '@/lib/payment-protection'

interface RotationNeedsStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

const ROTATION_TYPES = [
  { value: 'primary-care', label: 'Primary Care/Family Medicine' },
  { value: 'internal-medicine', label: 'Internal Medicine' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'women-health', label: "Women's Health/OB-GYN" },
  { value: 'emergency', label: 'Emergency Medicine' },
  { value: 'urgent-care', label: 'Urgent Care' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'psychiatry', label: 'Psychiatry/Mental Health' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'pulmonology', label: 'Pulmonology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'other', label: 'Other' }
]

const SCHEDULE_PREFERENCES = [
  { value: 'full-time', label: 'Full-time (5 days/week)' },
  { value: 'part-time', label: 'Part-time (2-4 days/week)' },
  { value: 'weekends', label: 'Weekends Available' },
  { value: 'evenings', label: 'Evening Shifts' },
  { value: 'flexible', label: 'Flexible Schedule' }
]

export default function RotationNeedsStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep 
}: RotationNeedsStepProps) {
  const paymentStatus = usePaymentProtection()
  const canAccessSection = canAccessFormSection(paymentStatus, 'rotation-needs')
  
  const [formData, setFormData] = useState({
    rotationTypes: [],
    schedulePreferences: [],
    preferredStartDate: '',
    maxTravelDistance: '',
    willingToTravel: false,
    transportationMethod: '',
    availableDays: [],
    timeCommitment: '',
    specialRequirements: '',
    previousExperience: '',
    learningObjectives: '',
    ...(data.rotationNeeds || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    updateFormData('rotationNeeds', { ...formData, [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[] || []
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value)
      
      const newData = { ...prev, [field]: newArray }
      updateFormData('rotationNeeds', newData)
      return newData
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    if (!canAccessSection) {
      return false
    }

    const newErrors: Record<string, string> = {}

    if (!formData.rotationTypes || (formData.rotationTypes as string[]).length === 0) {
      newErrors.rotationTypes = 'At least one rotation type is required'
    }

    if (!formData.schedulePreferences || (formData.schedulePreferences as string[]).length === 0) {
      newErrors.schedulePreferences = 'At least one schedule preference is required'
    }

    if (!formData.preferredStartDate.trim()) {
      newErrors.preferredStartDate = 'Preferred start date is required'
    }

    if (!formData.maxTravelDistance.trim()) {
      newErrors.maxTravelDistance = 'Maximum travel distance is required'
    }

    if (!formData.timeCommitment.trim()) {
      newErrors.timeCommitment = 'Time commitment is required'
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
        sectionTitle="Rotation Needs & Preferences"
        preview="Specific rotation types, scheduling preferences, availability, travel willingness, location preferences, and learning objectives for optimal preceptor matching."
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
            <Stethoscope className="h-5 w-5" />
            Rotation Needs & Preferences
            <div className="ml-auto flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                PRO REQUIRED
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rotation Types */}
          <div className="space-y-3">
            <Label>Rotation Types Needed *</Label>
            <div className="grid md:grid-cols-2 gap-2">
              {ROTATION_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rotation-${type.value}`}
                    checked={(formData.rotationTypes as string[])?.includes(type.value)}
                    onCheckedChange={(checked) => 
                      handleArrayChange('rotationTypes', type.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`rotation-${type.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.rotationTypes && (
              <p className="text-sm text-destructive">{errors.rotationTypes}</p>
            )}
          </div>

          {/* Schedule Preferences */}
          <div className="space-y-3">
            <Label>Schedule Preferences *</Label>
            <div className="grid md:grid-cols-2 gap-2">
              {SCHEDULE_PREFERENCES.map((schedule) => (
                <div key={schedule.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`schedule-${schedule.value}`}
                    checked={(formData.schedulePreferences as string[])?.includes(schedule.value)}
                    onCheckedChange={(checked) => 
                      handleArrayChange('schedulePreferences', schedule.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`schedule-${schedule.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {schedule.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.schedulePreferences && (
              <p className="text-sm text-destructive">{errors.schedulePreferences}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="timeCommitment">Time Commitment *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={formData.timeCommitment} onValueChange={(value) => handleInputChange('timeCommitment', value)}>
                  <SelectTrigger className={`pl-9 ${errors.timeCommitment ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select time commitment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8-12-weeks">8-12 weeks</SelectItem>
                    <SelectItem value="12-16-weeks">12-16 weeks</SelectItem>
                    <SelectItem value="16-20-weeks">16-20 weeks</SelectItem>
                    <SelectItem value="full-semester">Full semester</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.timeCommitment && (
                <p className="text-sm text-destructive">{errors.timeCommitment}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxTravelDistance">Maximum Travel Distance *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={formData.maxTravelDistance} onValueChange={(value) => handleInputChange('maxTravelDistance', value)}>
                  <SelectTrigger className={`pl-9 ${errors.maxTravelDistance ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select max travel distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10-miles">Up to 10 miles</SelectItem>
                    <SelectItem value="25-miles">Up to 25 miles</SelectItem>
                    <SelectItem value="50-miles">Up to 50 miles</SelectItem>
                    <SelectItem value="100-miles">Up to 100 miles</SelectItem>
                    <SelectItem value="unlimited">No distance limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.maxTravelDistance && (
                <p className="text-sm text-destructive">{errors.maxTravelDistance}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportationMethod">Transportation Method</Label>
              <Select value={formData.transportationMethod} onValueChange={(value) => handleInputChange('transportationMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transportation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="own-car">Own vehicle</SelectItem>
                  <SelectItem value="public-transport">Public transportation</SelectItem>
                  <SelectItem value="rideshare">Rideshare/Uber/Lyft</SelectItem>
                  <SelectItem value="bicycle">Bicycle</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="willingToTravel"
              checked={formData.willingToTravel}
              onCheckedChange={(checked) => handleInputChange('willingToTravel', checked)}
            />
            <Label htmlFor="willingToTravel" className="font-normal">
              I&apos;m willing to travel or relocate for exceptional opportunities
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningObjectives">Learning Objectives & Goals</Label>
            <Textarea
              id="learningObjectives"
              value={formData.learningObjectives}
              onChange={(e) => handleInputChange('learningObjectives', e.target.value)}
              placeholder="What specific skills or knowledge do you hope to gain from this rotation? What are your learning goals?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousExperience">Relevant Experience (Optional)</Label>
            <Textarea
              id="previousExperience"
              value={formData.previousExperience}
              onChange={(e) => handleInputChange('previousExperience', e.target.value)}
              placeholder="Describe any relevant clinical experience, certifications, or special training you have..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequirements">Special Requirements or Accommodations</Label>
            <Textarea
              id="specialRequirements"
              value={formData.specialRequirements}
              onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
              placeholder="Any special requirements, accommodations, or considerations we should know about..."
              rows={3}
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
          Continue to Matching Preferences
        </Button>
      </div>
    </div>
  )
}