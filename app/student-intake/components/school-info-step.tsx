'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

interface SchoolInfoStepProps {
  data: any
  updateFormData: (section: string, data: any) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

// Degree tracks remain the same but NP schools now come from database

const degreeTracksOptions = [
  { value: 'FNP', label: 'Family Nurse Practitioner (FNP)' },
  { value: 'PNP', label: 'Pediatric Nurse Practitioner (PNP)' },
  { value: 'PMHNP', label: 'Psychiatric Mental Health NP (PMHNP)' },
  { value: 'AGNP', label: 'Adult-Gerontology NP (AGNP)' },
  { value: 'ACNP', label: 'Acute Care NP (ACNP)' },
  { value: 'WHNP', label: 'Women\'s Health NP (WHNP)' },
  { value: 'NNP', label: 'Neonatal NP (NNP)' },
  { value: 'DNP', label: 'Doctor of Nursing Practice (DNP)' },
]

export default function SchoolInfoStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep 
}: SchoolInfoStepProps) {
  const [formData, setFormData] = useState({
    programName: '',
    degreeTrack: '',
    schoolCity: '',
    schoolState: '',
    programFormat: '',
    expectedGraduation: '',
    clinicalCoordinatorName: '',
    clinicalCoordinatorEmail: '',
    ...data.schoolInfo
  })

  // Get schools from database
  const schoolOptions = useQuery(api.schools.getSchoolOptions)
  const [selectedSchool, setSelectedSchool] = useState<any>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    updateFormData('schoolInfo', {
      ...formData,
      schoolLocation: {
        city: formData.schoolCity,
        state: formData.schoolState,
      }
    })
  }, [formData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.programName) {
      newErrors.programName = 'NP program name is required'
    }

    if (!formData.degreeTrack) {
      newErrors.degreeTrack = 'Degree track is required'
    }

    if (!formData.schoolCity.trim()) {
      newErrors.schoolCity = 'School city is required'
    }

    if (!formData.schoolState.trim()) {
      newErrors.schoolState = 'School state is required'
    }

    if (!formData.programFormat) {
      newErrors.programFormat = 'Program format is required'
    }

    if (!formData.expectedGraduation) {
      newErrors.expectedGraduation = 'Expected graduation date is required'
    }

    if (formData.clinicalCoordinatorEmail && !/\S+@\S+\.\S+/.test(formData.clinicalCoordinatorEmail)) {
      newErrors.clinicalCoordinatorEmail = 'Please enter a valid email address'
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
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="programName">NP Program Name *</Label>
          <Select 
            value={formData.programName} 
            onValueChange={(value) => {
              handleInputChange('programName', value)
              // Auto-populate school location when a school is selected
              const school = schoolOptions?.find(s => s.label === value)
              if (school) {
                setSelectedSchool(school)
                handleInputChange('schoolCity', school.location.city)
                handleInputChange('schoolState', school.location.state)
              }
            }}
          >
            <SelectTrigger className={errors.programName ? 'border-destructive' : ''}>
              <SelectValue placeholder={schoolOptions ? "Select your NP program" : "Loading schools..."} />
            </SelectTrigger>
            <SelectContent>
              {schoolOptions?.map((school) => (
                <SelectItem key={school.value} value={school.label}>
                  {school.label}
                </SelectItem>
              ))}
              <SelectItem value="Other">Other (Please specify in Clinical Coordinator Name field)</SelectItem>
            </SelectContent>
          </Select>
          {errors.programName && (
            <p className="text-sm text-destructive">{errors.programName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="degreeTrack">Degree Track *</Label>
          <Select 
            value={formData.degreeTrack} 
            onValueChange={(value) => handleInputChange('degreeTrack', value)}
          >
            <SelectTrigger className={errors.degreeTrack ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select degree track" />
            </SelectTrigger>
            <SelectContent>
              {degreeTracksOptions.map((track) => (
                <SelectItem key={track.value} value={track.value}>
                  {track.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.degreeTrack && (
            <p className="text-sm text-destructive">{errors.degreeTrack}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="programFormat">Program Format *</Label>
          <Select 
            value={formData.programFormat} 
            onValueChange={(value) => handleInputChange('programFormat', value)}
          >
            <SelectTrigger className={errors.programFormat ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in-person">In-person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          {errors.programFormat && (
            <p className="text-sm text-destructive">{errors.programFormat}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="schoolCity">School Location - City *</Label>
          <Input
            id="schoolCity"
            value={formData.schoolCity}
            onChange={(e) => handleInputChange('schoolCity', e.target.value)}
            placeholder="City"
            className={errors.schoolCity ? 'border-destructive' : ''}
          />
          {errors.schoolCity && (
            <p className="text-sm text-destructive">{errors.schoolCity}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="schoolState">School Location - State *</Label>
          <Input
            id="schoolState"
            value={formData.schoolState}
            onChange={(e) => handleInputChange('schoolState', e.target.value)}
            placeholder="State"
            className={errors.schoolState ? 'border-destructive' : ''}
          />
          {errors.schoolState && (
            <p className="text-sm text-destructive">{errors.schoolState}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedGraduation">Expected Graduation Date *</Label>
          <Input
            id="expectedGraduation"
            type="date"
            value={formData.expectedGraduation}
            onChange={(e) => handleInputChange('expectedGraduation', e.target.value)}
            className={errors.expectedGraduation ? 'border-destructive' : ''}
          />
          {errors.expectedGraduation && (
            <p className="text-sm text-destructive">{errors.expectedGraduation}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinicalCoordinatorName">Clinical Coordinator Name (Optional)</Label>
          <Input
            id="clinicalCoordinatorName"
            value={formData.clinicalCoordinatorName}
            onChange={(e) => handleInputChange('clinicalCoordinatorName', e.target.value)}
            placeholder="Name of your clinical coordinator"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinicalCoordinatorEmail">Clinical Coordinator Email (Optional)</Label>
          <Input
            id="clinicalCoordinatorEmail"
            type="email"
            value={formData.clinicalCoordinatorEmail}
            onChange={(e) => handleInputChange('clinicalCoordinatorEmail', e.target.value)}
            placeholder="coordinator@school.edu"
            className={errors.clinicalCoordinatorEmail ? 'border-destructive' : ''}
          />
          {errors.clinicalCoordinatorEmail && (
            <p className="text-sm text-destructive">{errors.clinicalCoordinatorEmail}</p>
          )}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
            <div>
              <p className="text-sm font-medium mb-1">School Verification</p>
              <p className="text-xs text-muted-foreground">
                We verify all student enrollments and work directly with clinical coordinators to ensure 
                compliance with your program requirements. This helps streamline paperwork and ensures 
                your rotation credits are properly documented.
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
          Next: Rotation Needs
        </Button>
      </div>
    </div>
  )
}