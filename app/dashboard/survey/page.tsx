'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Star, Send, ArrowLeft } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { toast } from 'sonner'

export default function SurveyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('matchId') as Id<"matches"> | null
  const respondentType = searchParams.get('type') as 'student' | 'preceptor' | null
  const partnerName = searchParams.get('partner') || 'your partner'

  const [formData, setFormData] = useState({
    teachStyleMatch: 0,
    commEffectiveness: 0,
    caseMixAlignment: 0,
    supportHoursComp: 0,
    wouldRecommend: 0,
    studentPreparedness: 0,
    studentComm: 0,
    teachability: 0,
    competenceGrowth: 0,
    comments: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const createSurveyResponse = useMutation(api.surveys.createSurveyResponse)

  if (!matchId || !respondentType) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Survey Link</h1>
          <p className="text-muted-foreground mb-6">
            This survey link appears to be invalid or incomplete.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const handleRatingChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!matchId || !respondentType) return

    setIsSubmitting(true)
    try {
      // Filter responses based on respondent type
      const responses = respondentType === 'student' 
        ? {
            teachStyleMatch: formData.teachStyleMatch,
            commEffectiveness: formData.commEffectiveness,
            caseMixAlignment: formData.caseMixAlignment,
            supportHoursComp: formData.supportHoursComp,
            wouldRecommend: formData.wouldRecommend,
            comments: formData.comments,
          }
        : {
            studentPreparedness: formData.studentPreparedness,
            studentComm: formData.studentComm,
            teachability: formData.teachability,
            competenceGrowth: formData.competenceGrowth,
            wouldRecommend: formData.wouldRecommend,
            comments: formData.comments,
          }

      await createSurveyResponse({
        matchId,
        respondentType,
        responses,
      })

      toast.success('Survey submitted successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting survey:', error)
      toast.error('Failed to submit survey. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    if (respondentType === 'student') {
      return formData.teachStyleMatch > 0 && 
             formData.commEffectiveness > 0 && 
             formData.caseMixAlignment > 0 && 
             formData.supportHoursComp > 0 && 
             formData.wouldRecommend > 0
    } else {
      return formData.studentPreparedness > 0 && 
             formData.studentComm > 0 && 
             formData.teachability > 0 && 
             formData.competenceGrowth > 0 && 
             formData.wouldRecommend > 0
    }
  }

  const RatingQuestion = ({ 
    question, 
    field, 
    value 
  }: { 
    question: string
    field: string
    value: number 
  }) => (
    <div className="space-y-3">
      <Label className="text-base font-medium">{question}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleRatingChange(field, rating)}
            className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-colors ${
              value >= rating
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted hover:border-primary/50'
            }`}
          >
            <Star className={`h-5 w-5 ${value >= rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1 - Strongly Disagree</span>
        <span>5 - Strongly Agree</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Rotation Feedback</h1>
            <p className="text-muted-foreground text-lg">
              {respondentType === 'student' 
                ? `Please rate your experience with ${partnerName}`
                : `Please rate your experience with ${partnerName}`
              }
            </p>
            <Badge variant="secondary" className="mt-2">
              {respondentType === 'student' ? 'Student Survey' : 'Preceptor Survey'}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              {respondentType === 'student' 
                ? 'Rate Your Preceptor Experience' 
                : 'Rate Your Student Experience'
              }
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your honest feedback helps us improve our MentorFit™ matching algorithm.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {respondentType === 'student' ? (
              <>
                <RatingQuestion
                  question="How well did your preceptor's teaching style match your preferred learning style?"
                  field="teachStyleMatch"
                  value={formData.teachStyleMatch}
                />
                <RatingQuestion
                  question="The communication frequency & clarity from your preceptor met your needs."
                  field="commEffectiveness"
                  value={formData.commEffectiveness}
                />
                <RatingQuestion
                  question="The clinical case mix aligned with your learning goals."
                  field="caseMixAlignment"
                  value={formData.caseMixAlignment}
                />
                <RatingQuestion
                  question="I felt supported in achieving required clinical hours & competencies."
                  field="supportHoursComp"
                  value={formData.supportHoursComp}
                />
                <RatingQuestion
                  question="I would recommend this preceptor to another NP student."
                  field="wouldRecommend"
                  value={formData.wouldRecommend}
                />
              </>
            ) : (
              <>
                <RatingQuestion
                  question="The student was adequately prepared for daily clinical responsibilities."
                  field="studentPreparedness"
                  value={formData.studentPreparedness}
                />
                <RatingQuestion
                  question="The student communicated effectively and sought feedback appropriately."
                  field="studentComm"
                  value={formData.studentComm}
                />
                <RatingQuestion
                  question="The student was receptive to mentorship & constructive criticism."
                  field="teachability"
                  value={formData.teachability}
                />
                <RatingQuestion
                  question="The student's clinical competence grew measurably during the rotation."
                  field="competenceGrowth"
                  value={formData.competenceGrowth}
                />
                <RatingQuestion
                  question="I would gladly host this student (or a similar profile) again."
                  field="wouldRecommend"
                  value={formData.wouldRecommend}
                />
              </>
            )}

            <div className="space-y-3">
              <Label htmlFor="comments" className="text-base font-medium">
                Additional Comments (Optional)
              </Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Any additional feedback to help us improve our matching..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Survey'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Your feedback is anonymous and helps improve future MentorFit™ matches.
            Thank you for taking the time to help us serve the NP community better.
          </p>
        </div>
      </div>
    </div>
  )
}