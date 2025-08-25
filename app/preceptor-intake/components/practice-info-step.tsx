'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { isSupportedZipCode, getStateFromZip } from '@/lib/states-config'
import { STATE_OPTIONS } from '@/lib/states-config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PracticeInfoStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const practiceSettings = [
  { value: 'private-practice', label: 'Private Practice' },
  { value: 'urgent-care', label: 'Urgent Care' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'other', label: 'Other' },
]

export default function PracticeInfoStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep 
}: PracticeInfoStepProps) {
  const [formData, setFormData] = useState({
    practiceName: '',
    practiceSettings: [] as string[],
    address: '',
    city: '',
    state: '', // No default state - user must select
    zipCode: '',
    website: '',
    emrUsed: '',
    ...(data.practiceInfo || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    updateFormData('practiceInfo', formData)
  }, [formData, updateFormData])

  const handleInputChange = (field: string, value: string | boolean | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSettingChange = (setting: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      practiceSettings: checked 
        ? [...prev.practiceSettings, setting]
        : prev.practiceSettings.filter(s => s !== setting)
    }))
    if (errors.practiceSettings) {
      setErrors(prev => ({ ...prev, practiceSettings: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.practiceName.trim()) {
      newErrors.practiceName = 'Practice name is required'
    }

    if (formData.practiceSettings.length === 0) {
      newErrors.practiceSettings = 'Please select at least one practice setting'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    } else if (!STATE_OPTIONS.find(opt => opt.value === formData.state)) {
      newErrors.state = 'Please select a supported state'
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code'
    } else if (!isSupportedZipCode(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code must be in a supported state'
    } else {
      // Check if ZIP matches selected state
      const zipState = getStateFromZip(formData.zipCode)
      if (zipState && formData.state && zipState !== formData.state) {
        newErrors.zipCode = `ZIP code is not in ${formData.state}`
      }
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const formatZipCode = (value: string) => {
    const zip = value.replace(/\D/g, '')
    if (zip.length <= 5) {
      return zip
    } else {
      return `${zip.slice(0, 5)}-${zip.slice(5, 9)}`
    }
  }

  const handleZipChange = (value: string) => {
    const formatted = formatZipCode(value)
    handleInputChange('zipCode', formatted)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="practiceName">Practice Name *</Label>
          <Input
            id="practiceName"
            value={formData.practiceName}
            onChange={(e) => handleInputChange('practiceName', e.target.value)}
            placeholder="Enter practice/clinic name"
            className={errors.practiceName ? 'border-destructive' : ''}
          />
          {errors.practiceName && (
            <p className="text-sm text-destructive">{errors.practiceName}</p>
          )}
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label>Practice Setting *</Label>
          <p className="text-sm text-muted-foreground">Select all that apply</p>
          <div className="grid gap-3 md:grid-cols-3">
            {practiceSettings.map((setting) => (
              <div key={setting.value} className="flex items-center space-x-2">
                <Checkbox
                  id={setting.value}
                  checked={formData.practiceSettings.includes(setting.value)}
                  onCheckedChange={(checked) => handleSettingChange(setting.value, checked as boolean)}
                />
                <Label htmlFor={setting.value} className="text-sm font-normal">
                  {setting.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.practiceSettings && (
            <p className="text-sm text-destructive">{errors.practiceSettings}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Street address"
            className={errors.address ? 'border-destructive' : ''}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="City"
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
            <SelectTrigger id="state" className={errors.state ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {STATE_OPTIONS.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select the state where your practice is located
          </p>
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleZipChange(e.target.value)}
            placeholder="ZIP code (e.g., 75201)"
            className={errors.zipCode ? 'border-destructive' : ''}
          />
          <p className="text-xs text-muted-foreground">
            Enter your practice&apos;s ZIP code
          </p>
          {errors.zipCode && (
            <p className="text-sm text-destructive">{errors.zipCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://www.example.com"
            className={errors.website ? 'border-destructive' : ''}
          />
          {errors.website && (
            <p className="text-sm text-destructive">{errors.website}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emrUsed">EMR System Used (Optional)</Label>
          <Input
            id="emrUsed"
            value={formData.emrUsed}
            onChange={(e) => handleInputChange('emrUsed', e.target.value)}
            placeholder="e.g., Epic, Cerner, Athenahealth"
          />
          <p className="text-xs text-muted-foreground">
            This helps students prepare for the EMR system they&apos;ll be using
          </p>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
            <div>
              <p className="text-sm font-medium mb-1">Practice Verification</p>
              <p className="text-xs text-muted-foreground">
                We verify practice information to ensure students have accurate expectations about their clinical environment. 
                This includes confirming location, setting type, and any specific requirements or protocols.
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
          Next: Availability
        </Button>
      </div>
    </div>
  )
}