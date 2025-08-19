'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Users, Target } from 'lucide-react'

interface MentoringStyleStepProps {
  data: any
  updateFormData: (section: string, data: any) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function MentoringStyleStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep 
}: MentoringStyleStepProps) {
  const [formData, setFormData] = useState({
    // Basic questions (1-10)
    mentoringApproach: '',
    rotationStart: '',
    feedbackApproach: '',
    learningMaterials: '',
    patientInteractions: '',
    questionPreference: '',
    autonomyLevel: '',
    evaluationFrequency: '',
    newStudentPreference: '',
    idealDynamic: '',
    // Phase 2.0 Extended Questions (11-18)
    mistakeHandling: '',
    growthPlanning: '',
    supervisionBalance: '',
    growthPace: '',
    feedbackType: '',
    goalSetting: '',
    learningEnvironment: '',
    teachingFrustrations: '',
    // Personality & Values
    professionalValues: [] as string[],
    // Experience Level
    studentsPrecepted: '',
    // Expectations & Dealbreakers
    studentBehaviorPreferences: [] as string[],
    otherExpectation: '',
    ...data.mentoringStyle
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    updateFormData('mentoringStyle', formData)
  }, [formData, updateFormData])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const requiredFields = [
      'mentoringApproach', 'rotationStart', 'feedbackApproach', 'learningMaterials',
      'patientInteractions', 'questionPreference', 'autonomyLevel', 'evaluationFrequency',
      'newStudentPreference', 'idealDynamic'
    ]

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'This field is required for optimal student matching'
      }
    })

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            MentorFit™ Teaching Style Assessment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These questions help us match you with students whose learning style complements your teaching approach, 
            creating more successful and rewarding mentorship experiences.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label>1. What best describes your mentoring style? *</Label>
            <RadioGroup
              value={formData.mentoringApproach}
              onValueChange={(value) => handleInputChange('mentoringApproach', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coach-guide" id="approach-coach" />
                <Label htmlFor="approach-coach">Coach and guide throughout</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="support-needed" id="approach-support" />
                <Label htmlFor="approach-support">Support as needed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expect-initiative" id="approach-initiative" />
                <Label htmlFor="approach-initiative">Expect student to take initiative</Label>
              </div>
            </RadioGroup>
            {errors.mentoringApproach && (
              <p className="text-sm text-destructive">{errors.mentoringApproach}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>2. How do you usually start a rotation with a new student? *</Label>
            <RadioGroup
              value={formData.rotationStart}
              onValueChange={(value) => handleInputChange('rotationStart', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="orient-goals" id="start-orient" />
                <Label htmlFor="start-orient">Orient them with goals + overview</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="observe-adjust" id="start-observe" />
                <Label htmlFor="start-observe">Observe and adjust organically</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dive-in-learn" id="start-dive" />
                <Label htmlFor="start-dive">Let them dive in and learn by doing</Label>
              </div>
            </RadioGroup>
            {errors.rotationStart && (
              <p className="text-sm text-destructive">{errors.rotationStart}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>3. What's your approach to giving feedback? *</Label>
            <RadioGroup
              value={formData.feedbackApproach}
              onValueChange={(value) => handleInputChange('feedbackApproach', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="real-time" id="feedback-real-time" />
                <Label htmlFor="feedback-real-time">Real-time corrections during shift</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily-checkins" id="feedback-daily" />
                <Label htmlFor="feedback-daily">Daily check-ins and debriefs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly-written" id="feedback-weekly" />
                <Label htmlFor="feedback-weekly">End-of-week or written evals</Label>
              </div>
            </RadioGroup>
            {errors.feedbackApproach && (
              <p className="text-sm text-destructive">{errors.feedbackApproach}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>4. Do you provide additional learning materials? *</Label>
            <p className="text-sm text-muted-foreground">Articles, templates, protocols, etc.</p>
            <RadioGroup
              value={formData.learningMaterials}
              onValueChange={(value) => handleInputChange('learningMaterials', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always" id="materials-always" />
                <Label htmlFor="materials-always">Always</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="materials-sometimes" />
                <Label htmlFor="materials-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rarely" id="materials-rarely" />
                <Label htmlFor="materials-rarely">Rarely</Label>
              </div>
            </RadioGroup>
            {errors.learningMaterials && (
              <p className="text-sm text-destructive">{errors.learningMaterials}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>5. How involved are you in guiding patient interactions initially? *</Label>
            <RadioGroup
              value={formData.patientInteractions}
              onValueChange={(value) => handleInputChange('patientInteractions', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lead-then-shadow" id="patient-lead-shadow" />
                <Label htmlFor="patient-lead-shadow">I lead first, then student shadows</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shadow-then-lead" id="patient-shadow-lead" />
                <Label htmlFor="patient-shadow-lead">Student shadows first, then leads</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lead-from-day-one" id="patient-lead-day-one" />
                <Label htmlFor="patient-lead-day-one">Student leads from day one (with oversight)</Label>
              </div>
            </RadioGroup>
            {errors.patientInteractions && (
              <p className="text-sm text-destructive">{errors.patientInteractions}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>6. How do you prefer students ask questions? *</Label>
            <RadioGroup
              value={formData.questionPreference}
              onValueChange={(value) => handleInputChange('questionPreference', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anytime-during" id="questions-anytime" />
                <Label htmlFor="questions-anytime">Anytime, during the visit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="breaks-downtime" id="questions-breaks" />
                <Label htmlFor="questions-breaks">During breaks or downtime</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end-of-day" id="questions-end-day" />
                <Label htmlFor="questions-end-day">End-of-day review</Label>
              </div>
            </RadioGroup>
            {errors.questionPreference && (
              <p className="text-sm text-destructive">{errors.questionPreference}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>7. How much autonomy do you typically give students by mid-rotation? *</Label>
            <RadioGroup
              value={formData.autonomyLevel}
              onValueChange={(value) => handleInputChange('autonomyLevel', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="close-supervision" id="autonomy-close" />
                <Label htmlFor="autonomy-close">Close supervision</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shared-decisions" id="autonomy-shared" />
                <Label htmlFor="autonomy-shared">Shared decision-making</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high-independence" id="autonomy-high" />
                <Label htmlFor="autonomy-high">High independence</Label>
              </div>
            </RadioGroup>
            {errors.autonomyLevel && (
              <p className="text-sm text-destructive">{errors.autonomyLevel}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>8. How often do you evaluate student progress? *</Label>
            <RadioGroup
              value={formData.evaluationFrequency}
              onValueChange={(value) => handleInputChange('evaluationFrequency', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="every-shift" id="eval-every-shift" />
                <Label htmlFor="eval-every-shift">Every shift</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="eval-weekly" />
                <Label htmlFor="eval-weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end-of-rotation" id="eval-end" />
                <Label htmlFor="eval-end">End-of-rotation only</Label>
              </div>
            </RadioGroup>
            {errors.evaluationFrequency && (
              <p className="text-sm text-destructive">{errors.evaluationFrequency}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>9. Do you enjoy mentoring students who are newer and need more support? *</Label>
            <RadioGroup
              value={formData.newStudentPreference}
              onValueChange={(value) => handleInputChange('newStudentPreference', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prefer-coaching" id="new-prefer-coaching" />
                <Label htmlFor="new-prefer-coaching">Yes, I prefer coaching from the ground up</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flexible" id="new-flexible" />
                <Label htmlFor="new-flexible">I'm flexible</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prefer-independent" id="new-prefer-independent" />
                <Label htmlFor="new-prefer-independent">I prefer more independent learners</Label>
              </div>
            </RadioGroup>
            {errors.newStudentPreference && (
              <p className="text-sm text-destructive">{errors.newStudentPreference}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>10. What's your ideal student dynamic? *</Label>
            <RadioGroup
              value={formData.idealDynamic}
              onValueChange={(value) => handleInputChange('idealDynamic', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="learner-teacher" id="dynamic-learner-teacher" />
                <Label htmlFor="dynamic-learner-teacher">Learner and teacher</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teammates" id="dynamic-teammates" />
                <Label htmlFor="dynamic-teammates">Teammates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="supervisee-clinician" id="dynamic-supervisee" />
                <Label htmlFor="dynamic-supervisee">Supervisee and clinician</Label>
              </div>
            </RadioGroup>
            {errors.idealDynamic && (
              <p className="text-sm text-destructive">{errors.idealDynamic}</p>
            )}
          </div>

          {/* Phase 2.0 Extended Questions */}
          <div className="border-t pt-8 space-y-8">
            <div className="space-y-2">
              <h4 className="text-lg font-medium">Additional Teaching Preferences (Optional)</h4>
              <p className="text-sm text-muted-foreground">
                These additional questions help us create even better matches by understanding your specific teaching preferences and expectations.
              </p>
            </div>

            <div className="space-y-4">
              <Label>11. What's your approach to student mistakes or errors?</Label>
              <RadioGroup
                value={formData.mistakeHandling}
                onValueChange={(value) => handleInputChange('mistakeHandling', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="correct-immediately" id="mistake-immediate" />
                  <Label htmlFor="mistake-immediate">Correct immediately and teach</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wait-debrief-after" id="mistake-wait" />
                  <Label htmlFor="mistake-wait">Wait and debrief after the patient</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="let-self-identify" id="mistake-self" />
                  <Label htmlFor="mistake-self">Let them self-identify and reflect first</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>12. How do you typically plan a student's clinical growth?</Label>
              <RadioGroup
                value={formData.growthPlanning}
                onValueChange={(value) => handleInputChange('growthPlanning', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="clear-progression" id="growth-clear" />
                  <Label htmlFor="growth-clear">Follow a clear progression</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evolve-organically" id="growth-organic" />
                  <Label htmlFor="growth-organic">Let it evolve organically</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student-driven" id="growth-student" />
                  <Label htmlFor="growth-student">Provide exposure and let student drive it</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>13. How do you balance supervision and autonomy?</Label>
              <RadioGroup
                value={formData.supervisionBalance}
                onValueChange={(value) => handleInputChange('supervisionBalance', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hands-on-whole-way" id="supervision-hands-on" />
                  <Label htmlFor="supervision-hands-on">I'm hands-on the whole way</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="space-with-backup" id="supervision-space" />
                  <Label htmlFor="supervision-space">I give space with backup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student-led-learning" id="supervision-student-led" />
                  <Label htmlFor="supervision-student-led">I prefer student-led learning</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>14. What pace of student growth do you prefer?</Label>
              <RadioGroup
                value={formData.growthPace}
                onValueChange={(value) => handleInputChange('growthPace', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fast-push-quickly" id="pace-fast" />
                  <Label htmlFor="pace-fast">Fast - I push them to move quickly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="steady-based-milestones" id="pace-steady" />
                  <Label htmlFor="pace-steady">Steady - I pace them based on milestones</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible-find-rhythm" id="pace-flexible" />
                  <Label htmlFor="pace-flexible">Flexible - I let them find their rhythm</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>15. What kind of feedback do you typically give?</Label>
              <RadioGroup
                value={formData.feedbackType}
                onValueChange={(value) => handleInputChange('feedbackType', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tactical-skills" id="feedback-tactical" />
                  <Label htmlFor="feedback-tactical">Tactical (skills, knowledge, assessments)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reflective-attitude" id="feedback-reflective" />
                  <Label htmlFor="feedback-reflective">Reflective (attitude, growth mindset)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanced-mix" id="feedback-balanced" />
                  <Label htmlFor="feedback-balanced">Balanced (a mix of both)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>16. Do you provide formal goals or a syllabus to students?</Label>
              <RadioGroup
                value={formData.goalSetting}
                onValueChange={(value) => handleInputChange('goalSetting', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes-beginning" id="goals-beginning" />
                  <Label htmlFor="goals-beginning">Yes, at the beginning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="midway-through" id="goals-midway" />
                  <Label htmlFor="goals-midway">Midway through rotation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-go-with-flow" id="goals-no" />
                  <Label htmlFor="goals-no">No - we go with the flow</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>17. What learning environments do you offer most often?</Label>
              <RadioGroup
                value={formData.learningEnvironment}
                onValueChange={(value) => handleInputChange('learningEnvironment', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-on-one-shadowing" id="env-one-on-one" />
                  <Label htmlFor="env-one-on-one">One-on-one shadowing and discussion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="independent-checkins" id="env-independent" />
                  <Label htmlFor="env-independent">Independent with check-ins</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="team-based-shared" id="env-team" />
                  <Label htmlFor="env-team">Team-based with shared teaching</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>18. What frustrates you most when working with students?</Label>
              <RadioGroup
                value={formData.teachingFrustrations}
                onValueChange={(value) => handleInputChange('teachingFrustrations', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lack-preparation" id="frustration-preparation" />
                  <Label htmlFor="frustration-preparation">Lack of preparation or follow-through</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="needing-constant-guidance" id="frustration-guidance" />
                  <Label htmlFor="frustration-guidance">Needing constant guidance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disengagement-poor-communication" id="frustration-disengagement" />
                  <Label htmlFor="frustration-disengagement">Disengagement or poor communication</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">Enhanced Matching Quality</p>
              <p className="text-xs text-muted-foreground">
                Your responses help our MentorFit™ algorithm pair you with students whose learning style 
                matches your teaching approach. This leads to more productive mentorships, better student 
                outcomes, and a more rewarding experience for both of you.
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
          Next: Agreements
        </Button>
      </div>
    </div>
  )
}