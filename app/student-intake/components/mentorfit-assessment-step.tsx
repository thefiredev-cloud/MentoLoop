'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Brain, Zap, CheckCircle } from 'lucide-react'
import LockedSection from '@/components/form-protection/locked-section'
import { usePaymentProtection, canAccessFormSection } from '@/lib/payment-protection'

interface MentorFitAssessmentStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

const ASSESSMENT_QUESTIONS = [
  {
    id: 'learning_style',
    question: 'How do you learn new clinical skills best?',
    options: [
      { value: 'hands-on', label: 'Hands-on practice with immediate feedback' },
      { value: 'observation', label: 'Observing others first, then practicing' },
      { value: 'explanation', label: 'Detailed explanation before attempting' },
      { value: 'trial-error', label: 'Trial and error with guidance' }
    ]
  },
  {
    id: 'feedback_timing',
    question: 'When do you prefer to receive feedback on your performance?',
    options: [
      { value: 'immediate', label: 'Immediately after each patient interaction' },
      { value: 'end-shift', label: 'At the end of each shift or day' },
      { value: 'weekly', label: 'In structured weekly meetings' },
      { value: 'as-needed', label: 'Only when I ask for it' }
    ]
  },
  {
    id: 'challenge_response',
    question: 'How do you typically respond to challenging situations?',
    options: [
      { value: 'dive-in', label: 'Dive in immediately and figure it out' },
      { value: 'ask-guidance', label: 'Ask for guidance before proceeding' },
      { value: 'observe-first', label: 'Observe similar situations first' },
      { value: 'research-then-act', label: 'Research thoroughly, then act' }
    ]
  },
  {
    id: 'mentoring_preference',
    question: 'What type of mentoring approach motivates you most?',
    options: [
      { value: 'supportive', label: 'Supportive and encouraging' },
      { value: 'challenging', label: 'Challenging and pushing boundaries' },
      { value: 'structured', label: 'Structured with clear expectations' },
      { value: 'flexible', label: 'Flexible and adaptive to my needs' }
    ]
  },
  {
    id: 'stress_management',
    question: 'In high-stress clinical situations, you perform best when:',
    options: [
      { value: 'calm-guidance', label: 'Given calm, step-by-step guidance' },
      { value: 'trusted-autonomy', label: 'Trusted to handle it with backup available' },
      { value: 'clear-instructions', label: 'Given clear, specific instructions' },
      { value: 'collaborative', label: 'Working collaboratively with the team' }
    ]
  },
  {
    id: 'communication_style',
    question: 'Your preferred communication style with preceptors is:',
    options: [
      { value: 'direct-concise', label: 'Direct and concise' },
      { value: 'detailed-thorough', label: 'Detailed and thorough discussions' },
      { value: 'informal-friendly', label: 'Informal and friendly' },
      { value: 'formal-professional', label: 'Formal and strictly professional' }
    ]
  },
  {
    id: 'learning_pace',
    question: 'What learning pace works best for you?',
    options: [
      { value: 'fast-intensive', label: 'Fast-paced and intensive' },
      { value: 'moderate-steady', label: 'Moderate and steady' },
      { value: 'slow-thorough', label: 'Slower but thorough' },
      { value: 'variable-adaptive', label: 'Variable based on complexity' }
    ]
  },
  {
    id: 'independence_level',
    question: 'How much independence do you prefer in clinical practice?',
    options: [
      { value: 'high-autonomy', label: 'High autonomy with minimal oversight' },
      { value: 'guided-independence', label: 'Independence with available guidance' },
      { value: 'collaborative-support', label: 'Collaborative with consistent support' },
      { value: 'close-supervision', label: 'Close supervision and frequent check-ins' }
    ]
  },
  {
    id: 'mistake_handling',
    question: 'When you make a mistake, you prefer your preceptor to:',
    options: [
      { value: 'immediate-correction', label: 'Correct immediately and explain why' },
      { value: 'private-discussion', label: 'Discuss privately later' },
      { value: 'learning-opportunity', label: 'Turn it into a learning opportunity' },
      { value: 'gentle-guidance', label: 'Provide gentle guidance to self-correct' }
    ]
  },
  {
    id: 'motivation_source',
    question: 'What motivates you most in clinical learning?',
    options: [
      { value: 'patient-outcomes', label: 'Seeing positive patient outcomes' },
      { value: 'skill-mastery', label: 'Mastering new clinical skills' },
      { value: 'recognition', label: 'Recognition from preceptors/peers' },
      { value: 'knowledge-growth', label: 'Expanding clinical knowledge' }
    ]
  },
  {
    id: 'problem_solving',
    question: 'Your approach to clinical problem-solving is:',
    options: [
      { value: 'systematic', label: 'Systematic and methodical' },
      { value: 'intuitive', label: 'Intuitive and pattern-based' },
      { value: 'collaborative', label: 'Collaborative and team-based' },
      { value: 'evidence-based', label: 'Strictly evidence-based' }
    ]
  },
  {
    id: 'workplace_environment',
    question: 'You thrive in workplace environments that are:',
    options: [
      { value: 'fast-paced', label: 'Fast-paced and dynamic' },
      { value: 'calm-structured', label: 'Calm and well-structured' },
      { value: 'collaborative-social', label: 'Collaborative and social' },
      { value: 'focused-quiet', label: 'Focused and relatively quiet' }
    ]
  },
  {
    id: 'case_complexity',
    question: 'You prefer to start with clinical cases that are:',
    options: [
      { value: 'simple-building', label: 'Simple, building to complex' },
      { value: 'varied-mixed', label: 'Varied mix from the beginning' },
      { value: 'complex-challenging', label: 'Complex and challenging immediately' },
      { value: 'routine-common', label: 'Routine and commonly seen' }
    ]
  },
  {
    id: 'growth_mindset',
    question: 'You view clinical challenges as:',
    options: [
      { value: 'growth-opportunities', label: 'Opportunities for growth' },
      { value: 'tests-ability', label: 'Tests of your ability' },
      { value: 'learning-experiences', label: 'Valuable learning experiences' },
      { value: 'necessary-hurdles', label: 'Necessary hurdles to overcome' }
    ]
  },
  {
    id: 'preceptor_relationship',
    question: 'The ideal preceptor-student relationship should be:',
    options: [
      { value: 'mentor-mentee', label: 'Traditional mentor-mentee' },
      { value: 'collaborative-partnership', label: 'Collaborative partnership' },
      { value: 'teacher-student', label: 'Formal teacher-student' },
      { value: 'coach-athlete', label: 'Coach-athlete dynamic' }
    ]
  }
]

export default function MentorFitAssessmentStep({ 
  data, 
  updateFormData, 
  onNext, 
  onPrev, 
  isFirstStep 
}: MentorFitAssessmentStepProps) {
  const paymentStatus = usePaymentProtection()
  const canAccessSection = canAccessFormSection(paymentStatus, 'mentorfit')
  
  const [formData, setFormData] = useState({
    assessmentAnswers: {},
    ...(data.mentorFitAssessment || {})
  })

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = {
      ...formData.assessmentAnswers as Record<string, string>,
      [questionId]: value
    }
    
    setFormData(prev => ({ ...prev, assessmentAnswers: newAnswers }))
    updateFormData('mentorFitAssessment', { assessmentAnswers: newAnswers })
    
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }))
    }
  }

  const validateForm = () => {
    if (!canAccessSection) {
      return false
    }

    const newErrors: Record<string, string> = {}
    const answers = formData.assessmentAnswers as Record<string, string>

    ASSESSMENT_QUESTIONS.forEach((question) => {
      if (!answers[question.id]) {
        newErrors[question.id] = 'This question is required'
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

  const nextQuestion = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const getAnsweredCount = () => {
    const answers = formData.assessmentAnswers as Record<string, string>
    return Object.keys(answers).length
  }

  const isQuestionAnswered = (questionId: string) => {
    const answers = formData.assessmentAnswers as Record<string, string>
    return !!answers[questionId]
  }

  if (!canAccessSection) {
    return (
      <LockedSection 
        sectionTitle="MentorFit Learning Style Assessment"
        preview="Comprehensive 15-question assessment analyzing learning style, feedback preferences, mentoring approach, stress management, and personality traits for precise preceptor matching using advanced AI algorithms."
        requiredTier={['elite', 'premium']}
        userTier={paymentStatus.membershipPlan}
      />
    )
  }

  const progress = (getAnsweredCount() / ASSESSMENT_QUESTIONS.length) * 100
  const currentQ = ASSESSMENT_QUESTIONS[currentQuestion]
  const answers = formData.assessmentAnswers as Record<string, string>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            MentorFit Learning Style Assessment
            <div className="ml-auto flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                ELITE REQUIRED
              </span>
            </div>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{getAnsweredCount()} of {ASSESSMENT_QUESTIONS.length} questions answered</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900">About MentorFit Assessment</h3>
                <p className="text-sm text-blue-800">
                  This scientifically-designed assessment analyzes your learning preferences, 
                  communication style, and personality traits to match you with preceptors 
                  who complement your learning approach for maximum success.
                </p>
              </div>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
            </h3>
            <div className="flex gap-1">
              {ASSESSMENT_QUESTIONS.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    index === currentQuestion
                      ? 'bg-primary'
                      : isQuestionAnswered(ASSESSMENT_QUESTIONS[index].id)
                      ? 'bg-accent'
                      : 'bg-muted/30'
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                />
              ))}
            </div>
          </div>

          {/* Current Question */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium leading-relaxed">
                  {currentQ.question}
                </h4>
                
                <RadioGroup 
                  value={answers[currentQ.id] || ''} 
                  onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                  className="space-y-3"
                >
                  {currentQ.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={`${currentQ.id}-${option.value}`} />
                      <Label 
                        htmlFor={`${currentQ.id}-${option.value}`}
                        className="font-normal cursor-pointer leading-relaxed flex-1"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                {errors[currentQ.id] && (
                  <p className="text-sm text-destructive">{errors[currentQ.id]}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              onClick={prevQuestion} 
              disabled={currentQuestion === 0}
              variant="outline"
            >
              Previous Question
            </Button>
            
            <Button 
              onClick={nextQuestion} 
              disabled={currentQuestion === ASSESSMENT_QUESTIONS.length - 1}
            >
              Next Question
            </Button>
          </div>

          {/* Completion Status */}
          {getAnsweredCount() === ASSESSMENT_QUESTIONS.length && (
            <Card className="bg-success/10 border border-success/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <h4 className="font-semibold text-success">Assessment Complete!</h4>
                    <p className="text-sm text-success">
                      You&apos;ve answered all questions. Your MentorFit profile will help us find the perfect preceptor match for your learning style.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
          disabled={getAnsweredCount() < ASSESSMENT_QUESTIONS.length}
        >
          Continue to Membership Selection
        </Button>
      </div>
    </div>
  )
}
