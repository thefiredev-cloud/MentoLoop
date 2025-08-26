'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Brain, Heart, Users } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import MentorFitGate from '@/components/mentorfit-gate'

interface MatchingPreferencesStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function MatchingPreferencesStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep 
}: MatchingPreferencesStepProps) {
  // Ensure all RadioGroup values have proper defaults and filter out undefined values
  const safeMatchingPreferences = (data.matchingPreferences || {}) as Record<string, unknown>
  const safeLearningStyle = (data.learningStyle || {}) as Record<string, unknown>
  
  const [formData, setFormData] = useState({
    // Basic matching preferences - use empty string for RadioGroup compatibility
    comfortableWithSharedPlacements: (safeMatchingPreferences.comfortableWithSharedPlacements as string) || '',
    languagesSpoken: (safeMatchingPreferences.languagesSpoken as string[]) || [] as string[],
    idealPreceptorQualities: (safeMatchingPreferences.idealPreceptorQualities as string) || '',
    // MentorFit Learning Style Assessment - Basic (1-10)
    learningMethod: (safeLearningStyle.learningMethod as string) || '',
    clinicalComfort: (safeLearningStyle.clinicalComfort as string) || '',
    feedbackPreference: (safeLearningStyle.feedbackPreference as string) || '',
    structurePreference: (safeLearningStyle.structurePreference as string) || '',
    mentorRelationship: (safeLearningStyle.mentorRelationship as string) || '',
    observationPreference: (safeLearningStyle.observationPreference as string) || '',
    correctionStyle: (safeLearningStyle.correctionStyle as string) || '',
    retentionStyle: (safeLearningStyle.retentionStyle as string) || '',
    additionalResources: (safeLearningStyle.additionalResources as string) || '',
    proactiveQuestions: (safeLearningStyle.proactiveQuestions as number[]) || [3],
    // Phase 2.0 Extended Questions (11-18) - Use empty strings for RadioGroups
    feedbackType: (safeLearningStyle.feedbackType as string) || '',
    mistakeApproach: (safeLearningStyle.mistakeApproach as string) || '',
    motivationType: (safeLearningStyle.motivationType as string) || '',
    preparationStyle: (safeLearningStyle.preparationStyle as string) || '',
    learningCurve: (safeLearningStyle.learningCurve as string) || '',
    frustrations: (safeLearningStyle.frustrations as string) || '',
    environment: (safeLearningStyle.environment as string) || '',
    observationNeeds: (safeLearningStyle.observationNeeds as string) || '',
    // Personality & Values
    professionalValues: (safeLearningStyle.professionalValues as string[]) || [] as string[],
    clinicalEnvironment: (safeLearningStyle.clinicalEnvironment as string) || '',
    // Experience Level
    programStage: (safeLearningStyle.programStage as string) || '',
    // Flexibility
    scheduleFlexibility: (safeLearningStyle.scheduleFlexibility as string) || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateParentFormData = (updatedData: typeof formData) => {
    // Split data between matching preferences and learning style
    const { 
      comfortableWithSharedPlacements, 
      languagesSpoken, 
      idealPreceptorQualities,
      ...learningStyleData 
    } = updatedData

    // Convert string boolean back to actual boolean for comfortableWithSharedPlacements
    const matchingPrefsData = {
      comfortableWithSharedPlacements: comfortableWithSharedPlacements === '' ? undefined : comfortableWithSharedPlacements === 'true',
      languagesSpoken,
      idealPreceptorQualities,
    }

    // Clean learning style data - convert empty strings to undefined for optional fields
    const cleanedLearningStyleData = Object.entries(learningStyleData).reduce((acc, [key, value]) => {
      // List of optional fields that should be undefined if empty string
      const optionalFields = [
        'feedbackType', 'mistakeApproach', 'motivationType', 'preparationStyle',
        'learningCurve', 'frustrations', 'environment', 'observationNeeds',
        'clinicalEnvironment', 'programStage', 'scheduleFlexibility'
      ]
      
      if (optionalFields.includes(key) && value === '') {
        acc[key] = undefined
      } else {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, unknown>)

    updateFormData('matchingPreferences', matchingPrefsData)

    updateFormData('learningStyle', {
      ...cleanedLearningStyleData,
      proactiveQuestions: Array.isArray(learningStyleData.proactiveQuestions) 
        ? learningStyleData.proactiveQuestions[0] || 3
        : learningStyleData.proactiveQuestions || 3,
    })
  }

  const handleInputChange = (field: string, value: string | boolean | number[] | string[]) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Update parent form data immediately
    updateParentFormData(updatedData)
  }

  const handleLanguageAdd = (language: string) => {
    if (language.trim() && !formData.languagesSpoken.includes(language.trim())) {
      const updatedData = {
        ...formData,
        languagesSpoken: [...formData.languagesSpoken, language.trim()]
      }
      setFormData(updatedData)
      updateParentFormData(updatedData)
    }
  }

  const handleLanguageRemove = (language: string) => {
    const updatedData = {
      ...formData,
      languagesSpoken: formData.languagesSpoken.filter(lang => lang !== language)
    }
    setFormData(updatedData)
    updateParentFormData(updatedData)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Basic matching preferences are always required
    // MentorFit questions are now optional (premium feature)
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      {/* Basic Matching Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            General Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Comfortable with shared student placements?</Label>
            <p className="text-sm text-muted-foreground">Some preceptors take multiple students during the same rotation period.</p>
            <RadioGroup
              value={formData.comfortableWithSharedPlacements}
              onValueChange={(value) => handleInputChange('comfortableWithSharedPlacements', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="shared-yes" />
                <Label htmlFor="shared-yes">Yes, I&apos;m comfortable with this</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="shared-no" />
                <Label htmlFor="shared-no">No, I prefer one-on-one precepting</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Languages Spoken (Optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.languagesSpoken.map((lang) => (
                <Badge key={lang} variant="secondary" className="gap-1">
                  {lang}
                  <button 
                    onClick={() => handleLanguageRemove(lang)}
                    className="text-xs hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Type a language and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleLanguageAdd(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idealQualities">Ideal preceptor qualities (Optional)</Label>
            <Textarea
              id="idealQualities"
              value={formData.idealPreceptorQualities}
              onChange={(e) => handleInputChange('idealPreceptorQualities', e.target.value)}
              placeholder="Describe what you're looking for in a preceptor (e.g., patient teaching style, specific experience, communication preferences)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* MentorFit Assessment - Behind Payment Gate */}
      <MentorFitGate userType="student" onSkip={handleNext}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              MentorFit™ Learning Style Assessment
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These questions help us match you with preceptors whose teaching style aligns with your learning preferences.
            </p>
          </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label>1. How do you learn best? *</Label>
            <RadioGroup
              value={formData.learningMethod}
              onValueChange={(value) => handleInputChange('learningMethod', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hands-on" id="learn-hands-on" />
                <Label htmlFor="learn-hands-on">Hands-on practice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="step-by-step" id="learn-step-by-step" />
                <Label htmlFor="learn-step-by-step">Step-by-step guidance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="independent" id="learn-independent" />
                <Label htmlFor="learn-independent">Independent reading & observation</Label>
              </div>
            </RadioGroup>
            {errors.learningMethod && (
              <p className="text-sm text-destructive">{errors.learningMethod}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>2. How comfortable are you with clinical independence at the start of your rotation? *</Label>
            <RadioGroup
              value={formData.clinicalComfort}
              onValueChange={(value) => handleInputChange('clinicalComfort', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-comfortable" id="comfort-not" />
                <Label htmlFor="comfort-not">Not at all comfortable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="somewhat-comfortable" id="comfort-somewhat" />
                <Label htmlFor="comfort-somewhat">Somewhat comfortable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-comfortable" id="comfort-very" />
                <Label htmlFor="comfort-very">Very comfortable</Label>
              </div>
            </RadioGroup>
            {errors.clinicalComfort && (
              <p className="text-sm text-destructive">{errors.clinicalComfort}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>3. How much feedback do you prefer during a shift? *</Label>
            <RadioGroup
              value={formData.feedbackPreference}
              onValueChange={(value) => handleInputChange('feedbackPreference', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="real-time" id="feedback-real-time" />
                <Label htmlFor="feedback-real-time">Frequent, real-time feedback</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end-of-day" id="feedback-end-day" />
                <Label htmlFor="feedback-end-day">End-of-day debriefs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimal" id="feedback-minimal" />
                <Label htmlFor="feedback-minimal">Minimal unless critical</Label>
              </div>
            </RadioGroup>
            {errors.feedbackPreference && (
              <p className="text-sm text-destructive">{errors.feedbackPreference}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>4. What level of structure do you prefer in a clinical day? *</Label>
            <RadioGroup
              value={formData.structurePreference}
              onValueChange={(value) => handleInputChange('structurePreference', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="clear-schedules" id="structure-clear" />
                <Label htmlFor="structure-clear">Clear schedules and goals</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general-guidance" id="structure-general" />
                <Label htmlFor="structure-general">General guidance with flexibility</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="open-ended" id="structure-open" />
                <Label htmlFor="structure-open">Very open-ended/independent</Label>
              </div>
            </RadioGroup>
            {errors.structurePreference && (
              <p className="text-sm text-destructive">{errors.structurePreference}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>5. What&apos;s your ideal mentor relationship? *</Label>
            <RadioGroup
              value={formData.mentorRelationship}
              onValueChange={(value) => handleInputChange('mentorRelationship', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher-coach" id="relationship-teacher" />
                <Label htmlFor="relationship-teacher">Teacher/coach</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="collaborator" id="relationship-collaborator" />
                <Label htmlFor="relationship-collaborator">Collaborator</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="supervisor" id="relationship-supervisor" />
                <Label htmlFor="relationship-supervisor">Supervisor/check-in only</Label>
              </div>
            </RadioGroup>
            {errors.mentorRelationship && (
              <p className="text-sm text-destructive">{errors.mentorRelationship}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>6. Do you prefer to observe first or jump in quickly? *</Label>
            <RadioGroup
              value={formData.observationPreference}
              onValueChange={(value) => handleInputChange('observationPreference', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="observe-first" id="observe-first" />
                <Label htmlFor="observe-first">Observe for a while</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mix-both" id="observe-mix" />
                <Label htmlFor="observe-mix">Mix of both</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jump-in" id="observe-jump" />
                <Label htmlFor="observe-jump">Jump in and learn as I go</Label>
              </div>
            </RadioGroup>
            {errors.observationPreference && (
              <p className="text-sm text-destructive">{errors.observationPreference}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>7. How do you prefer to receive correction? *</Label>
            <RadioGroup
              value={formData.correctionStyle}
              onValueChange={(value) => handleInputChange('correctionStyle', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct-immediate" id="correction-direct" />
                <Label htmlFor="correction-direct">Direct and immediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="supportive-private" id="correction-supportive" />
                <Label htmlFor="correction-supportive">Supportive and private</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="written-summaries" id="correction-written" />
                <Label htmlFor="correction-written">Written summaries or evaluations</Label>
              </div>
            </RadioGroup>
            {errors.correctionStyle && (
              <p className="text-sm text-destructive">{errors.correctionStyle}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>8. How do you retain information best? *</Label>
            <RadioGroup
              value={formData.retentionStyle}
              onValueChange={(value) => handleInputChange('retentionStyle', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="watching-doing" id="retention-watching" />
                <Label htmlFor="retention-watching">Watching + doing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="note-taking" id="retention-notes" />
                <Label htmlFor="retention-notes">Taking notes during explanations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="questions-discussion" id="retention-questions" />
                <Label htmlFor="retention-questions">Asking questions and discussing</Label>
              </div>
            </RadioGroup>
            {errors.retentionStyle && (
              <p className="text-sm text-destructive">{errors.retentionStyle}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>9. Would you like additional resources between shifts? *</Label>
            <RadioGroup
              value={formData.additionalResources}
              onValueChange={(value) => handleInputChange('additionalResources', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-love" id="resources-yes" />
                <Label htmlFor="resources-yes">Yes, I&apos;d love that</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="occasionally" id="resources-occasionally" />
                <Label htmlFor="resources-occasionally">Occasionally</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-necessary" id="resources-no" />
                <Label htmlFor="resources-no">Not necessary</Label>
              </div>
            </RadioGroup>
            {errors.additionalResources && (
              <p className="text-sm text-destructive">{errors.additionalResources}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>10. How proactive are you about asking questions during clinicals?</Label>
            <p className="text-sm text-muted-foreground">
              1 = I wait for the preceptor to guide me; 5 = I ask questions constantly
            </p>
            <div className="px-3 py-6">
              <Slider
                value={formData.proactiveQuestions}
                onValueChange={(value) => handleInputChange('proactiveQuestions', value)}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1 - Wait for guidance</span>
                <span>3 - Balanced</span>
                <span>5 - Ask constantly</span>
              </div>
              <div className="text-center mt-2 font-medium">
                Current: {formData.proactiveQuestions[0] || 3}
              </div>
            </div>
          </div>

          {/* Phase 2.0 Extended Questions */}
          <div className="border-t pt-8 space-y-8">
            <div className="space-y-2">
              <h4 className="text-lg font-medium">Additional Learning Preferences (Optional)</h4>
              <p className="text-sm text-muted-foreground">
                These additional questions help us create even better matches by understanding your specific preferences and needs.
              </p>
            </div>

            <div className="space-y-4">
              <Label>11. What type of feedback is most helpful to you?</Label>
              <RadioGroup
                value={formData.feedbackType}
                onValueChange={(value) => handleInputChange('feedbackType', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="verbal-examples" id="feedback-verbal" />
                  <Label htmlFor="feedback-verbal">Verbal examples and stories</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific-critiques" id="feedback-specific" />
                  <Label htmlFor="feedback-specific">Specific performance critiques</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="encouragement-affirmation" id="feedback-encouragement" />
                  <Label htmlFor="feedback-encouragement">Encouragement and affirmation</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>12. How do you approach clinical mistakes?</Label>
              <RadioGroup
                value={formData.mistakeApproach}
                onValueChange={(value) => handleInputChange('mistakeApproach', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="corrected-immediately" id="mistake-immediate" />
                  <Label htmlFor="mistake-immediate">I want to be corrected immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="talk-through-after" id="mistake-after" />
                  <Label htmlFor="mistake-after">I prefer to talk through it after</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reflect-silently" id="mistake-silent" />
                  <Label htmlFor="mistake-silent">I reflect and correct silently unless told otherwise</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>13. What motivates you most during a rotation?</Label>
              <RadioGroup
                value={formData.motivationType}
                onValueChange={(value) => handleInputChange('motivationType', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="trusted-responsibility" id="motivation-trust" />
                  <Label htmlFor="motivation-trust">Feeling trusted with responsibility</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seeing-progress" id="motivation-progress" />
                  <Label htmlFor="motivation-progress">Seeing my progress daily</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="positive-feedback" id="motivation-feedback" />
                  <Label htmlFor="motivation-feedback">Positive feedback and encouragement</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>14. How do you prefer to prepare before patient visits?</Label>
              <RadioGroup
                value={formData.preparationStyle}
                onValueChange={(value) => handleInputChange('preparationStyle', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="coached-through" id="prep-coached" />
                  <Label htmlFor="prep-coached">I like to be coached through the plan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="present-get-feedback" id="prep-present" />
                  <Label htmlFor="prep-present">I prefer to present and get feedback after</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="try-fully-alone" id="prep-alone" />
                  <Label htmlFor="prep-alone">I want to try fully on my own first</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>15. How do you like your preceptor to manage your learning curve?</Label>
              <RadioGroup
                value={formData.learningCurve}
                onValueChange={(value) => handleInputChange('learningCurve', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="challenge-early-often" id="curve-challenge" />
                  <Label htmlFor="curve-challenge">Challenge me early and often</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="build-gradually" id="curve-gradual" />
                  <Label htmlFor="curve-gradual">Let me build gradually</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="repetition-reinforcement" id="curve-repetition" />
                  <Label htmlFor="curve-repetition">Focus on repetition and reinforcement</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>16. What frustrates you most in clinical teaching?</Label>
              <RadioGroup
                value={formData.frustrations}
                onValueChange={(value) => handleInputChange('frustrations', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lack-expectations" id="frustration-expectations" />
                  <Label htmlFor="frustration-expectations">Lack of clear expectations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal-vague-feedback" id="frustration-feedback" />
                  <Label htmlFor="frustration-feedback">Getting minimal or vague feedback</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="being-micromanaged" id="frustration-micromanage" />
                  <Label htmlFor="frustration-micromanage">Being micromanaged</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>17. Do you prefer a calm, quiet setting or a high-paced environment?</Label>
              <RadioGroup
                value={formData.environment}
                onValueChange={(value) => handleInputChange('environment', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="calm-controlled" id="env-calm" />
                  <Label htmlFor="env-calm">Calm and controlled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="some-pressure" id="env-pressure" />
                  <Label htmlFor="env-pressure">Some pressure helps</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high-energy" id="env-energy" />
                  <Label htmlFor="env-energy">High energy keeps me engaged</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>18. Would you prefer to observe a patient visit first before jumping in?</Label>
              <RadioGroup
                value={formData.observationNeeds}
                onValueChange={(value) => handleInputChange('observationNeeds', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="watch-1-2-first" id="obs-watch" />
                  <Label htmlFor="obs-watch">Yes, I need to watch 1-2 first</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="just-one-enough" id="obs-one" />
                  <Label htmlFor="obs-one">Just one is enough</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ready-start-immediately" id="obs-ready" />
                  <Label htmlFor="obs-ready">I&apos;m ready to start right away</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Personality & Values Section */}
            <div className="border-t pt-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-base font-medium">Professional Values</h4>
                <p className="text-sm text-muted-foreground">
                  Choose 3 words that best describe your professional values:
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "compassion", label: "Compassion" },
                  { value: "efficiency", label: "Efficiency" },
                  { value: "collaboration", label: "Collaboration" },
                  { value: "lifelong-learning", label: "Lifelong learning" },
                  { value: "integrity", label: "Integrity" },
                  { value: "equity-inclusion", label: "Equity & inclusion" },
                  { value: "advocacy", label: "Advocacy" }
                ].map((value) => (
                  <div key={value.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`value-${value.value}`}
                      checked={formData.professionalValues.includes(value.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (formData.professionalValues.length < 3) {
                            handleInputChange('professionalValues', [...formData.professionalValues, value.value])
                          }
                        } else {
                          handleInputChange('professionalValues', formData.professionalValues.filter((v: string) => v !== value.value))
                        }
                      }}
                      disabled={!formData.professionalValues.includes(value.value) && formData.professionalValues.length >= 3}
                    />
                    <Label htmlFor={`value-${value.value}`}>{value.label}</Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {formData.professionalValues.length}/3
              </p>
            </div>

            {/* Clinical Environment */}
            <div className="space-y-4">
              <Label>What kind of clinical environment do you thrive in?</Label>
              <RadioGroup
                value={formData.clinicalEnvironment}
                onValueChange={(value) => handleInputChange('clinicalEnvironment', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="calm-methodical" id="env-calm-methodical" />
                  <Label htmlFor="env-calm-methodical">Calm and methodical</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="busy-fast-paced" id="env-busy" />
                  <Label htmlFor="env-busy">Busy and fast-paced</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible-informal" id="env-flexible" />
                  <Label htmlFor="env-flexible">Flexible and informal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="structured-clear-goals" id="env-structured" />
                  <Label htmlFor="env-structured">Structured with clear goals</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Program Stage */}
            <div className="space-y-4">
              <Label>Where are you in your NP program?</Label>
              <RadioGroup
                value={formData.programStage}
                onValueChange={(value) => handleInputChange('programStage', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="just-starting" id="stage-starting" />
                  <Label htmlFor="stage-starting">Just starting clinicals</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mid-program" id="stage-mid" />
                  <Label htmlFor="stage-mid">Mid-program</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="near-graduation" id="stage-near" />
                  <Label htmlFor="stage-near">Near graduation</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Schedule Flexibility */}
            <div className="space-y-4">
              <Label>How flexible are you with changes in schedule?</Label>
              <RadioGroup
                value={formData.scheduleFlexibility}
                onValueChange={(value) => handleInputChange('scheduleFlexibility', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-flexible" id="flex-very" />
                  <Label htmlFor="flex-very">Very flexible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="somewhat-flexible" id="flex-somewhat" />
                  <Label htmlFor="flex-somewhat">Somewhat flexible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prefer-fixed" id="flex-fixed" />
                  <Label htmlFor="flex-fixed">Prefer fixed schedule</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
      </MentorFitGate>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">MentorFit™ Matching</p>
              <p className="text-xs text-muted-foreground">
                Your responses help our AI algorithm calculate compatibility scores with potential preceptors. 
                This ensures you&apos;re matched with someone whose teaching style aligns with your learning preferences, 
                leading to more successful and fulfilling clinical experiences.
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
          Next: Payment & Agreement
        </Button>
      </div>
    </div>
  )
}