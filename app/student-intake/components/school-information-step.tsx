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
import { School, GraduationCap, Calendar, Mail } from 'lucide-react'

interface SchoolInformationStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

const NP_TRACKS = [
  { value: 'FNP', label: 'Family Nurse Practitioner (FNP)' },
  { value: 'PNP', label: 'Pediatric Nurse Practitioner (PNP)' },
  { value: 'PMHNP', label: 'Psychiatric Mental Health NP (PMHNP)' },
  { value: 'AGNP', label: 'Adult-Gerontology NP (AGNP)' },
  { value: 'ACNP', label: 'Acute Care NP (ACNP)' },
  { value: 'WHNP', label: 'Women\'s Health NP (WHNP)' },
  { value: 'NNP', label: 'Neonatal NP (NNP)' },
  { value: 'DNP', label: 'Doctor of Nursing Practice (DNP)' },
  { value: 'OTHER', label: 'Other (please specify)' }
]

const ACADEMIC_YEARS = [
  { value: '1st_year', label: 'First Year' },
  { value: '2nd_year', label: 'Second Year' },
  { value: '3rd_year', label: 'Third Year' },
  { value: '4th_year', label: 'Fourth Year' },
  { value: 'final_year', label: 'Final Year' },
  { value: 'dnp_year1', label: 'DNP Year 1' },
  { value: 'dnp_year2', label: 'DNP Year 2' },
  { value: 'dnp_year3', label: 'DNP Year 3' }
]

export default function SchoolInformationStep({ 
  data, 
  updateFormData, 
  onNext,
  onPrev,
  isFirstStep 
}: SchoolInformationStepProps) {
  const [formData, setFormData] = useState({
    university: '',
    npTrack: '',
    npTrackOther: '',
    specialty: '',
    academicYear: '',
    coordinatorName: '',
    coordinatorEmail: '',
    ...(data.schoolInfo || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value }

    // Clear the other track field if selecting a non-OTHER option
    if (field === 'npTrack' && value !== 'OTHER') {
      updatedData.npTrackOther = ''
    }

    setFormData(updatedData)
    updateFormData('schoolInfo', updatedData)
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.university.trim()) {
      newErrors.university = 'University name is required'
    }

    if (!formData.npTrack) {
      newErrors.npTrack = 'NP track is required'
    }

    // If OTHER is selected, require the custom text
    if (formData.npTrack === 'OTHER' && !formData.npTrackOther.trim()) {
      newErrors.npTrackOther = 'Please specify your NP track'
    }

    if (!formData.specialty.trim()) {
      newErrors.specialty = 'Specialty is required'
    }

    if (!formData.academicYear) {
      newErrors.academicYear = 'Academic year is required'
    }

    // Coordinator email is optional but if provided, should be valid
    if (formData.coordinatorEmail && !/\S+@\S+\.\S+/.test(formData.coordinatorEmail)) {
      newErrors.coordinatorEmail = 'Please enter a valid email'
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
            <School className="h-5 w-5" />
            School Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="university">University Name *</Label>
            <Input
              id="university"
              value={formData.university}
              onChange={(e) => handleInputChange('university', e.target.value)}
              placeholder="Enter your university name"
              className={errors.university ? 'border-destructive' : ''}
            />
            {errors.university && (
              <p className="text-sm text-destructive">{errors.university}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="npTrack">NP Track/Specialty *</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={formData.npTrack} onValueChange={(value) => handleInputChange('npTrack', value)}>
                  <SelectTrigger className={`pl-9 ${errors.npTrack ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select your NP track" />
                  </SelectTrigger>
                  <SelectContent>
                    {NP_TRACKS.map((track) => (
                      <SelectItem key={track.value} value={track.value}>
                        {track.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.npTrack && (
                <p className="text-sm text-destructive">{errors.npTrack}</p>
              )}

              {/* Show custom input when OTHER is selected */}
              {formData.npTrack === 'OTHER' && (
                <div className="mt-3">
                  <Input
                    id="npTrackOther"
                    value={formData.npTrackOther}
                    onChange={(e) => handleInputChange('npTrackOther', e.target.value)}
                    placeholder="Please specify your NP track"
                    className={errors.npTrackOther ? 'border-destructive' : ''}
                  />
                  {errors.npTrackOther && (
                    <p className="text-sm text-destructive mt-1">{errors.npTrackOther}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specific Specialty Area *</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                placeholder="e.g., Cardiology, Pediatrics"
                className={errors.specialty ? 'border-destructive' : ''}
              />
              {errors.specialty && (
                <p className="text-sm text-destructive">{errors.specialty}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
              <Select value={formData.academicYear} onValueChange={(value) => handleInputChange('academicYear', value)}>
                <SelectTrigger className={`pl-9 ${errors.academicYear ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select your academic year" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.academicYear && (
              <p className="text-sm text-destructive">{errors.academicYear}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Clinical Coordinator Information (Optional)</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coordinatorName">Coordinator Name</Label>
                  <Input
                    id="coordinatorName"
                    value={formData.coordinatorName}
                    onChange={(e) => handleInputChange('coordinatorName', e.target.value)}
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coordinatorEmail">Coordinator Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="coordinatorEmail"
                      type="email"
                      value={formData.coordinatorEmail}
                      onChange={(e) => handleInputChange('coordinatorEmail', e.target.value)}
                      placeholder="coordinator@university.edu"
                      className={`pl-9 ${errors.coordinatorEmail ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.coordinatorEmail && (
                    <p className="text-sm text-destructive">{errors.coordinatorEmail}</p>
                  )}
                </div>
              </div>
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
          Continue to Rotation Needs
        </Button>
      </div>
    </div>
  )
}