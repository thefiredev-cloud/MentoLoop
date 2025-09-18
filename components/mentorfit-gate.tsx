'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Star, Sparkles, ArrowRight, Lock, Users } from 'lucide-react'
import CustomClerkPricing from '@/components/custom-clerk-pricing'
import { usePaymentProtection } from '@/lib/payment-protection'

interface MentorFitGateProps {
  children: ReactNode
  userType?: 'student' | 'preceptor'
  onSkip?: () => void
}

function MentorFitPreview({ userType, onSkip }: { userType?: 'student' | 'preceptor', onSkip?: () => void }) {
  const features = userType === 'student' 
    ? [
        'Personalized learning style assessment',
        'AI-powered preceptor compatibility matching',
        'Optimized clinical experience outcomes',
        'Better mentor-student relationship quality'
      ]
    : [
        'Teaching style preference profiling',
        'Student compatibility scoring',
        'Enhanced mentorship satisfaction',
        'Improved student success rates'
      ]

  const sampleQuestions = userType === 'student' 
    ? [
        'How do you learn best?',
        'How much feedback do you prefer during a shift?',
        'What level of structure do you prefer in a clinical day?',
        'How do you retain information best?'
      ]
    : [
        'What best describes your mentoring style?',
        'How do you usually start a rotation with a new student?',
        'What\'s your approach to giving feedback?',
        'How much autonomy do you typically give students?'
      ]

  return (
    <div className="space-y-6">
      {/* Basic Matching Available */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Basic Matching Available
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            You can proceed with our standard matching process using your basic preferences, or upgrade to MentorFit™ for enhanced compatibility matching.
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            variant="default" 
            className="w-full" 
            onClick={onSkip}
            disabled={!onSkip}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Continue with Basic Matching
          </Button>
        </CardContent>
      </Card>

      {/* Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Brain className="h-12 w-12 text-primary" />
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                <Sparkles className="h-4 w-4 text-yellow-800" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">
            MentorFit™ Premium Assessment
            <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
              Premium
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Unlock our advanced AI-powered compatibility matching for optimal {userType === 'student' ? 'learning' : 'teaching'} experiences.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Premium Features
              </h4>
              <ul className="space-y-2 text-sm">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Sample Questions
              </h4>
              <ul className="space-y-2 text-sm">
                {sampleQuestions.slice(0, 3).map((question, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary font-medium">{index + 1}.</span>
                    {question}
                  </li>
                ))}
                <li className="text-muted-foreground italic">+ 15 more detailed questions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Upgrade to Access MentorFit™
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a plan that includes our premium matching features
          </p>
        </CardHeader>
        <CardContent>
          <CustomClerkPricing />
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h4 className="font-medium">Why Upgrade to MentorFit™?</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium">Smarter Matching</div>
                <div className="text-muted-foreground">
                  AI analyzes compatibility across 18+ dimensions
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium">Better Outcomes</div>
                <div className="text-muted-foreground">
                  95% satisfaction rate with MentorFit™ matches
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium">Faster Placement</div>
                <div className="text-muted-foreground">
                  Priority matching within 7-14 days
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

export default function MentorFitGate({ children, userType, onSkip }: MentorFitGateProps) {
  const paymentStatus = usePaymentProtection()
  const unlocked =
    paymentStatus.mentorfitUnlocked ||
    ['elite', 'premium'].includes((paymentStatus.membershipPlan ?? '').toLowerCase())

  if (unlocked) {
    return <>{children}</>
  }

  return <MentorFitPreview userType={userType} onSkip={onSkip} />
}
