'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Calendar } from 'lucide-react'

interface PersonalInformationStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  isFirstStep: boolean
}

export default function PersonalInformationStep({
  data,
  updateFormData,
  onNext,
  isFirstStep: _isFirstStep
}: PersonalInformationStepProps) {
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    ...(data.personalInfo || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    updateFormData('personalInfo', { ...formData, [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
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
      <Card className="dashboard-card">
        <CardHeader className="border-b bg-background/80">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-primary">
              Your account information (name, email, phone) has been automatically populated from your signup details.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={`pl-9 ${errors.dateOfBirth ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.dateOfBirth && (
              <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
            )}
            <p className="text-xs text-muted-foreground">
              We need your date of birth for verification and to ensure you meet program requirements.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          size="lg"
          className="px-8"
        >
          Continue to School Information
        </Button>
      </div>
    </div>
  )
}
