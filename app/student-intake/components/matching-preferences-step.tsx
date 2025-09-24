'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Lock, Sparkles, Target, Users, MessageSquare, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { usePaymentProtection, canAccessFormSection } from '@/lib/payment-protection'

interface MatchingPreferencesStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const MENTORFIT_QUESTIONS = [
  {
    id: 'practice_style',
    label: 'Practice Style Preference',
    icon: Target,
    question: 'What type of practice environment do you learn best in?',
    options: [
      { value: 'fast_paced', label: 'Fast-paced, high-volume practice' },
      { value: 'moderate_pace', label: 'Moderate pace with time for discussion' },
      { value: 'slower_educational', label: 'Slower, educational-focused environment' },
      { value: 'mixed', label: 'Mix of different paces throughout rotation' }
    ]
  },
  {
    id: 'teaching_preference',
    label: 'Teaching Style Preference',
    icon: Users,
    question: 'How do you prefer to receive instruction?',
    options: [
      { value: 'hands_on', label: 'Hands-on learning with immediate practice' },
      { value: 'observation_first', label: 'Observe first, then practice' },
      { value: 'guided_practice', label: 'Step-by-step guided practice' },
      { value: 'independent', label: 'Independent learning with check-ins' }
    ]
  },
  {
    id: 'communication_style',
    label: 'Communication Style',
    icon: MessageSquare,
    question: 'What communication style works best for you?',
    options: [
      { value: 'direct_feedback', label: 'Direct, immediate feedback' },
      { value: 'gentle_guidance', label: 'Gentle, encouraging guidance' },
      { value: 'detailed_explanations', label: 'Detailed explanations and rationales' },
      { value: 'brief_efficient', label: 'Brief, efficient communication' }
    ]
  },
  {
    id: 'scheduling_flexibility',
    label: 'Scheduling Flexibility',
    icon: Clock,
    question: 'What level of scheduling flexibility do you need?',
    options: [
      { value: 'very_flexible', label: 'Very flexible - can adjust to any schedule' },
      { value: 'somewhat_flexible', label: 'Somewhat flexible with advance notice' },
      { value: 'fixed_schedule', label: 'Need a consistent, fixed schedule' },
      { value: 'specific_requirements', label: 'Have specific scheduling requirements' }
    ]
  },
  {
    id: 'mentorship_goals',
    label: 'Mentorship Goals',
    icon: Sparkles,
    question: 'What is your primary goal for this mentorship?',
    options: [
      { value: 'clinical_skills', label: 'Develop strong clinical skills' },
      { value: 'career_guidance', label: 'Career guidance and networking' },
      { value: 'specialty_expertise', label: 'Gain specialty-specific expertise' },
      { value: 'confidence_building', label: 'Build confidence in practice' }
    ]
  }
]

export default function MatchingPreferencesStep({ 
  data, 
  updateFormData, 
  onNext: _onNext,
  onPrev,
  isFirstStep,
  isLastStep: _isLastStep 
}: MatchingPreferencesStepProps) {
  const router = useRouter()
  const paymentStatus = usePaymentProtection()
  const canAccessSection = canAccessFormSection(paymentStatus, 'matching-preferences')
  
  const [formData, setFormData] = useState({
    practiceStyle: '',
    teachingPreference: '',
    communicationStyle: '',
    schedulingFlexibility: '',
    mentorshipGoals: '',
    additionalPreferences: '',
    ...(data.matchingPreferences || {})
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    updateFormData('matchingPreferences', { ...formData, [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    if (!canAccessSection) {
      return false
    }

    const newErrors: Record<string, string> = {}

    if (!formData.practiceStyle) {
      newErrors.practiceStyle = 'Please select a practice style preference'
    }

    if (!formData.teachingPreference) {
      newErrors.teachingPreference = 'Please select a teaching style preference'
    }

    if (!formData.communicationStyle) {
      newErrors.communicationStyle = 'Please select a communication style'
    }

    if (!formData.schedulingFlexibility) {
      newErrors.schedulingFlexibility = 'Please select your scheduling flexibility'
    }

    if (!formData.mentorshipGoals) {
      newErrors.mentorshipGoals = 'Please select your mentorship goals'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      // Navigate to confirmation page
      router.push('/student-intake/confirmation')
    }
  }

  // Show locked section if no payment
  if (!canAccessSection) {
    return (
      <div className="space-y-6">
        <Card className="dashboard-card">
          <CardHeader className="pb-4 border-b bg-background/80">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                MentorFit™ Matching Preferences
              </CardTitle>
              <Badge variant="outline" className="px-3 py-1 text-primary border-primary/50">
                Payment Required
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-background/80 border border-border/60">
              <p className="text-base leading-relaxed">
                Our proprietary <strong className="text-primary">MentorFit™</strong> assessment analyzes your learning style, 
                communication preferences, and mentorship goals to match you with the perfect preceptor. 
                This comprehensive questionnaire ensures optimal compatibility for your clinical success.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="dashboard-card border-dashed border-border/40 bg-background/60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Practice Style Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        Match with preceptors whose practice environment aligns with your learning preferences
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card border-dashed border-border/40 bg-background/60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Teaching Preference Matching</h4>
                      <p className="text-sm text-muted-foreground">
                        Connect with mentors who teach the way you learn best
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card border-dashed border-border/40 bg-background/60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Communication Alignment</h4>
                      <p className="text-sm text-muted-foreground">
                        Ensure smooth interactions with compatible communication styles
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card border-dashed border-border/40 bg-background/60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Schedule Compatibility</h4>
                      <p className="text-sm text-muted-foreground">
                        Find preceptors who match your availability and flexibility needs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="dashboard-card bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Why This Step is Protected</h4>
                    <p className="text-sm text-muted-foreground">
                      The MentorFit™ assessment is a premium feature that requires significant resources to match 
                      you with the perfect preceptor. Your membership ensures we can provide dedicated support 
                      throughout your clinical journey.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onPrev} 
            disabled={isFirstStep}
            size="lg"
            className="px-6"
          >
            ← Previous Step
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Complete Step 4 to unlock this section
            </p>
            <Button 
              disabled
              size="lg"
              className="px-8 opacity-50"
            >
              <Lock className="h-4 w-4 mr-2" />
              Payment Required to Continue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show form if payment completed
  return (
    <div className="space-y-6">
      <Card className="dashboard-card">
        <CardHeader className="border-b bg-background/80">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            MentorFit™ Matching Preferences
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Complete this assessment to help us find your perfect preceptor match
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {MENTORFIT_QUESTIONS.map((question) => {
            const fieldName = question.id.replace('_', '')
            const IconComponent = question.icon
            
            return (
              <div key={question.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-base font-medium">{question.label}</Label>
                </div>
                <p className="text-sm text-muted-foreground">{question.question}</p>
                <RadioGroup
                  value={formData[fieldName as keyof typeof formData]}
                  onValueChange={(value) => handleInputChange(fieldName, value)}
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 border border-border/60 rounded-md px-3 py-2 hover:border-primary/40 transition-colors">
                      <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                      <Label 
                        htmlFor={`${question.id}-${option.value}`}
                        className="font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors[fieldName] && (
                  <p className="text-sm text-destructive">{errors[fieldName]}</p>
                )}
              </div>
            )
          })}

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="additionalPreferences">
              Additional Preferences or Special Considerations (Optional)
            </Label>
            <Textarea
              id="additionalPreferences"
              value={formData.additionalPreferences}
              onChange={(e) => handleInputChange('additionalPreferences', e.target.value)}
              placeholder="Tell us anything else that would help us find your perfect preceptor match..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-card bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">How MentorFit™ Works</h4>
              <p className="text-sm text-muted-foreground">
                Your responses are analyzed using our proprietary matching algorithm to identify 
                preceptors whose teaching style, communication approach, and practice environment 
                align with your learning preferences. This ensures a more successful and enjoyable 
                clinical experience.
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
        <Button 
          onClick={handleSubmit}
          size="lg"
          className="px-8"
        >
          Complete Registration
        </Button>
      </div>
    </div>
  )
}
