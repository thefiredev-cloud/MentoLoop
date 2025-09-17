'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Target, Zap } from 'lucide-react'
import LockedSection from '@/components/form-protection/locked-section'
import { usePaymentProtection, canAccessFormSection } from '@/lib/payment-protection'

interface AdvancedMatchingStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'mandarin', label: 'Mandarin' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'russian', label: 'Russian' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'korean', label: 'Korean' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'other', label: 'Other' }
]

const PRECEPTOR_QUALITIES = [
  { value: 'patient-teacher', label: 'Patient & supportive teacher' },
  { value: 'hands-on-mentor', label: 'Hands-on clinical mentor' },
  { value: 'evidence-based', label: 'Evidence-based practitioner' },
  { value: 'research-focused', label: 'Research & academia focused' },
  { value: 'diverse-cases', label: 'Exposes to diverse cases' },
  { value: 'leadership-skills', label: 'Strong leadership skills' },
  { value: 'work-life-balance', label: 'Promotes work-life balance' },
  { value: 'technology-savvy', label: 'Technology-savvy' },
  { value: 'community-focused', label: 'Community health focused' },
  { value: 'entrepreneurial', label: 'Entrepreneurial mindset' }
]

const PRACTICE_SETTINGS = [
  { value: 'private-practice', label: 'Private practice' },
  { value: 'hospital-system', label: 'Hospital system' },
  { value: 'academic-medical', label: 'Academic medical center' },
  { value: 'community-health', label: 'Community health center' },
  { value: 'urgent-care', label: 'Urgent care facility' },
  { value: 'retail-clinic', label: 'Retail clinic' },
  { value: 'telehealth', label: 'Telehealth/Virtual care' },
  { value: 'rural-health', label: 'Rural health clinic' },
  { value: 'specialty-clinic', label: 'Specialty clinic' },
  { value: 'government', label: 'Government/VA facility' }
]

export default function AdvancedMatchingStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep 
}: AdvancedMatchingStepProps) {
  const paymentStatus = usePaymentProtection()
  const canAccessSection = canAccessFormSection(paymentStatus, 'matching-preferences')
  
  const [formData, setFormData] = useState({
    languagesSpoken: [],
    idealPreceptorQualities: [],
    preferredPracticeSettings: [],
    sharedPlacementComfort: '',
    culturalPreferences: '',
    personalityMatch: '',
    communicationStyle: '',
    feedbackPreference: '',
    challengeLevel: '',
    professionalGoals: '',
    dealBreakers: '',
    additionalCriteria: '',
    ...(data.advancedMatching || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    updateFormData('advancedMatching', { ...formData, [field]: value })
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
      updateFormData('advancedMatching', newData)
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

    if (!formData.languagesSpoken || (formData.languagesSpoken as string[]).length === 0) {
      newErrors.languagesSpoken = 'At least one language is required'
    }

    if (!formData.sharedPlacementComfort) {
      newErrors.sharedPlacementComfort = 'Please specify your comfort with shared placements'
    }

    if (!formData.communicationStyle) {
      newErrors.communicationStyle = 'Communication style preference is required'
    }

    if (!formData.feedbackPreference) {
      newErrors.feedbackPreference = 'Feedback preference is required'
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
        sectionTitle="Advanced Matching Preferences"
        preview="Shared placement comfort, languages spoken, ideal preceptor qualities, communication styles, feedback preferences, and detailed matching criteria for precise preceptor alignment."
        requiredTier={['premium']}
        userTier={paymentStatus.membershipPlan}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Advanced Matching Preferences
            <div className="ml-auto flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                PREMIUM REQUIRED
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Languages */}
          <div className="space-y-3">
            <Label>Languages You Speak *</Label>
            <div className="grid md:grid-cols-3 gap-2">
              {LANGUAGES.map((language) => (
                <div key={language.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`language-${language.value}`}
                    checked={(formData.languagesSpoken as string[])?.includes(language.value)}
                    onCheckedChange={(checked) => 
                      handleArrayChange('languagesSpoken', language.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`language-${language.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {language.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.languagesSpoken && (
              <p className="text-sm text-destructive">{errors.languagesSpoken}</p>
            )}
          </div>

          {/* Ideal Preceptor Qualities */}
          <div className="space-y-3">
            <Label>Ideal Preceptor Qualities (Select all that apply)</Label>
            <div className="grid md:grid-cols-2 gap-2">
              {PRECEPTOR_QUALITIES.map((quality) => (
                <div key={quality.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`quality-${quality.value}`}
                    checked={(formData.idealPreceptorQualities as string[])?.includes(quality.value)}
                    onCheckedChange={(checked) => 
                      handleArrayChange('idealPreceptorQualities', quality.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`quality-${quality.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {quality.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Settings */}
          <div className="space-y-3">
            <Label>Preferred Practice Settings</Label>
            <div className="grid md:grid-cols-2 gap-2">
              {PRACTICE_SETTINGS.map((setting) => (
                <div key={setting.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`setting-${setting.value}`}
                    checked={(formData.preferredPracticeSettings as string[])?.includes(setting.value)}
                    onCheckedChange={(checked) => 
                      handleArrayChange('preferredPracticeSettings', setting.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`setting-${setting.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {setting.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sharedPlacementComfort">Shared Placement Comfort *</Label>
              <Select value={formData.sharedPlacementComfort} onValueChange={(value) => handleInputChange('sharedPlacementComfort', value)}>
                <SelectTrigger className={errors.sharedPlacementComfort ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Your comfort with shared placements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-comfortable">Very comfortable - enjoy collaborative learning</SelectItem>
                  <SelectItem value="somewhat-comfortable">Somewhat comfortable - okay if necessary</SelectItem>
                  <SelectItem value="prefer-individual">Prefer individual placement when possible</SelectItem>
                  <SelectItem value="individual-only">Individual placement only</SelectItem>
                </SelectContent>
              </Select>
              {errors.sharedPlacementComfort && (
                <p className="text-sm text-destructive">{errors.sharedPlacementComfort}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="communicationStyle">Communication Style Preference *</Label>
              <Select value={formData.communicationStyle} onValueChange={(value) => handleInputChange('communicationStyle', value)}>
                <SelectTrigger className={errors.communicationStyle ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Preferred communication style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct-concise">Direct and concise</SelectItem>
                  <SelectItem value="detailed-thorough">Detailed and thorough</SelectItem>
                  <SelectItem value="collaborative">Collaborative and discussion-based</SelectItem>
                  <SelectItem value="structured-formal">Structured and formal</SelectItem>
                  <SelectItem value="flexible-adaptive">Flexible and adaptive</SelectItem>
                </SelectContent>
              </Select>
              {errors.communicationStyle && (
                <p className="text-sm text-destructive">{errors.communicationStyle}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feedbackPreference">Feedback Preference *</Label>
              <Select value={formData.feedbackPreference} onValueChange={(value) => handleInputChange('feedbackPreference', value)}>
                <SelectTrigger className={errors.feedbackPreference ? 'border-destructive' : ''}>
                  <SelectValue placeholder="How you prefer to receive feedback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate-verbal">Immediate verbal feedback</SelectItem>
                  <SelectItem value="end-of-day">End-of-day summary sessions</SelectItem>
                  <SelectItem value="weekly-structured">Weekly structured meetings</SelectItem>
                  <SelectItem value="written-detailed">Written detailed feedback</SelectItem>
                  <SelectItem value="mixed-approach">Mixed approach (verbal + written)</SelectItem>
                </SelectContent>
              </Select>
              {errors.feedbackPreference && (
                <p className="text-sm text-destructive">{errors.feedbackPreference}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="challengeLevel">Challenge Level Preference</Label>
              <Select value={formData.challengeLevel} onValueChange={(value) => handleInputChange('challengeLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Preferred challenge level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-intensity">High intensity - complex cases, fast pace</SelectItem>
                  <SelectItem value="moderate-challenging">Moderate challenge - balanced learning</SelectItem>
                  <SelectItem value="steady-supportive">Steady pace - highly supportive environment</SelectItem>
                  <SelectItem value="gradual-building">Gradual building - start simple, progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professionalGoals">Professional Goals & Aspirations</Label>
            <Textarea
              id="professionalGoals"
              value={formData.professionalGoals}
              onChange={(e) => handleInputChange('professionalGoals', e.target.value)}
              placeholder="What are your long-term career goals? How does this rotation fit into your professional development plan?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="culturalPreferences">Cultural Preferences or Considerations</Label>
            <Textarea
              id="culturalPreferences"
              value={formData.culturalPreferences}
              onChange={(e) => handleInputChange('culturalPreferences', e.target.value)}
              placeholder="Any cultural preferences, values, or considerations that would help in finding the right match..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dealBreakers">Deal Breakers or Must-Avoid</Label>
            <Textarea
              id="dealBreakers"
              value={formData.dealBreakers}
              onChange={(e) => handleInputChange('dealBreakers', e.target.value)}
              placeholder="Any situations, environments, or characteristics you absolutely want to avoid in a preceptor or placement..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalCriteria">Additional Matching Criteria</Label>
            <Textarea
              id="additionalCriteria"
              value={formData.additionalCriteria}
              onChange={(e) => handleInputChange('additionalCriteria', e.target.value)}
              placeholder="Any other specific requirements, preferences, or information that would help us find your perfect preceptor match..."
              rows={4}
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
          Continue to MentorFit Assessment
        </Button>
      </div>
    </div>
  )
}
