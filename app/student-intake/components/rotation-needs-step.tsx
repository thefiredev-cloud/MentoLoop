'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface RotationNeedsStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const rotationTypes = [
  { value: 'family-practice', label: 'Family Practice' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'psych-mental-health', label: 'Psych/Mental Health' },
  { value: 'womens-health', label: 'Women\'s Health' },
  { value: 'adult-gero', label: 'Adult/Gero' },
  { value: 'acute-care', label: 'Acute Care' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'other', label: 'Other' },
]

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

export default function RotationNeedsStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep 
}: RotationNeedsStepProps) {
  const [formData, setFormData] = useState({
    rotationTypes: [] as string[],
    otherRotationType: '',
    startDate: '',
    endDate: '',
    weeklyHours: '',
    daysAvailable: [] as string[],
    willingToTravel: false,
    preferredCity: '',
    preferredState: '',
    ...(data.rotationNeeds || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const rotationData = {
      ...formData,
      preferredLocation: formData.willingToTravel ? {
        city: formData.preferredCity,
        state: formData.preferredState,
      } : undefined
    }
    updateFormData('rotationNeeds', rotationData)
  }, [formData])

  const handleInputChange = (field: string, value: string | boolean | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRotationTypeChange = (rotationType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      rotationTypes: checked 
        ? [...prev.rotationTypes, rotationType]
        : prev.rotationTypes.filter(type => type !== rotationType)
    }))
    if (errors.rotationTypes) {
      setErrors(prev => ({ ...prev, rotationTypes: '' }))
    }
  }

  const handleDayChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      daysAvailable: checked 
        ? [...prev.daysAvailable, day]
        : prev.daysAvailable.filter(d => d !== day)
    }))
    if (errors.daysAvailable) {
      setErrors(prev => ({ ...prev, daysAvailable: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.rotationTypes.length === 0) {
      newErrors.rotationTypes = 'Please select at least one rotation type'
    }

    if (formData.rotationTypes.includes('other') && !formData.otherRotationType.trim()) {
      newErrors.otherRotationType = 'Please specify the other rotation type'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Rotation start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Rotation end date is required'
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (!formData.weeklyHours) {
      newErrors.weeklyHours = 'Weekly hour requirements are required'
    }

    if (formData.daysAvailable.length === 0) {
      newErrors.daysAvailable = 'Please select at least one available day'
    }

    if (formData.willingToTravel && (!formData.preferredCity.trim() || !formData.preferredState.trim())) {
      newErrors.preferredLocation = 'Please specify preferred city and state for placement'
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
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Type(s) of Rotation Needed *</Label>
          <div className="grid gap-3 md:grid-cols-2">
            {rotationTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={formData.rotationTypes.includes(type.value)}
                  onCheckedChange={(checked) => handleRotationTypeChange(type.value, checked as boolean)}
                />
                <Label htmlFor={type.value} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.rotationTypes && (
            <p className="text-sm text-destructive">{errors.rotationTypes}</p>
          )}

          {formData.rotationTypes.includes('other') && (
            <div className="space-y-2">
              <Label htmlFor="otherRotationType">Please specify other rotation type *</Label>
              <Input
                id="otherRotationType"
                value={formData.otherRotationType}
                onChange={(e) => handleInputChange('otherRotationType', e.target.value)}
                placeholder="Specify other rotation type"
                className={errors.otherRotationType ? 'border-destructive' : ''}
              />
              {errors.otherRotationType && (
                <p className="text-sm text-destructive">{errors.otherRotationType}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Rotation Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={errors.startDate ? 'border-destructive' : ''}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Rotation End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={errors.endDate ? 'border-destructive' : ''}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeklyHours">Weekly Hour Requirements *</Label>
            <Select 
              value={formData.weeklyHours} 
              onValueChange={(value) => handleInputChange('weeklyHours', value)}
            >
              <SelectTrigger className={errors.weeklyHours ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select weekly hours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<8">Less than 8 hours</SelectItem>
                <SelectItem value="8-16">8-16 hours</SelectItem>
                <SelectItem value="16-24">16-24 hours</SelectItem>
                <SelectItem value="24-32">24-32 hours</SelectItem>
                <SelectItem value="32+">32+ hours</SelectItem>
              </SelectContent>
            </Select>
            {errors.weeklyHours && (
              <p className="text-sm text-destructive">{errors.weeklyHours}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Days Available *</Label>
          <div className="grid gap-3 md:grid-cols-4">
            {daysOfWeek.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={formData.daysAvailable.includes(day.value)}
                  onCheckedChange={(checked) => handleDayChange(day.value, checked as boolean)}
                />
                <Label htmlFor={day.value} className="text-sm font-normal">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.daysAvailable && (
            <p className="text-sm text-destructive">{errors.daysAvailable}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="willingToTravel"
              checked={formData.willingToTravel}
              onCheckedChange={(checked) => handleInputChange('willingToTravel', checked)}
            />
            <Label htmlFor="willingToTravel">Willing to travel for preceptor?</Label>
          </div>

          {formData.willingToTravel && (
            <div className="grid gap-4 md:grid-cols-2 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="preferredCity">Preferred City for Placement *</Label>
                <Input
                  id="preferredCity"
                  value={formData.preferredCity}
                  onChange={(e) => handleInputChange('preferredCity', e.target.value)}
                  placeholder="City"
                  className={errors.preferredLocation ? 'border-destructive' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredState">Preferred State for Placement *</Label>
                <Input
                  id="preferredState"
                  value={formData.preferredState}
                  onChange={(e) => handleInputChange('preferredState', e.target.value)}
                  placeholder="State"
                  className={errors.preferredLocation ? 'border-destructive' : ''}
                />
              </div>
              {errors.preferredLocation && (
                <p className="text-sm text-destructive md:col-span-2">{errors.preferredLocation}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
            <div>
              <p className="text-sm font-medium mb-1">Rotation Matching</p>
              <p className="text-xs text-muted-foreground">
                We&apos;ll use this information to find preceptors who can accommodate your schedule and rotation needs. 
                Our algorithm prioritizes matches based on your availability, specialty requirements, and location preferences.
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
          Next: Matching Preferences
        </Button>
      </div>
    </div>
  )
}