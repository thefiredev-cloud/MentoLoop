'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Star, Zap, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MembershipSelectionStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const MEMBERSHIP_PLANS = [
  {
    id: 'starter',
    name: 'Starter Block',
    price: 495,
    hours: 60,
    priceId: 'price_starter', // Will be replaced with actual Stripe price ID
    description: 'Essential placement support for your clinical rotation',
    features: [
      'Single rotation placement',
      'Preceptor matching',
      'Basic school paperwork',
      'Email support',
      'Standard processing (5-7 days)'
    ],
    icon: Star,
    color: 'blue',
    recommended: false
  },
  {
    id: 'core',
    name: 'Core Block',
    price: 795,
    hours: 90,
    priceId: 'price_core', // Will be replaced with actual Stripe price ID
    description: 'Enhanced support with priority matching and faster processing',
    features: [
      'Single rotation placement',
      'Priority preceptor matching',
      'Complete paperwork coordination',
      'Phone & email support',
      'Express processing (2-3 days)',
      'Backup placement guarantee',
      'Progress tracking dashboard'
    ],
    icon: Zap,
    color: 'purple',
    recommended: true
  },
  {
    id: 'pro',
    name: 'Pro Block',
    price: 1495,
    hours: 180,
    priceId: 'price_pro', // Will be replaced with actual Stripe price ID
    description: 'Complete concierge service with extended hours',
    features: [
      'Multiple rotation options',
      'VIP preceptor matching',
      'Full paperwork management',
      '24/7 priority support',
      'Immediate processing (24 hours)',
      'Guaranteed placement or refund',
      'Dedicated success coordinator',
      'CEU tracking included',
      'Evaluation assistance'
    ],
    icon: Crown,
    color: 'gold',
    recommended: false
  },
  {
    id: 'elite',
    name: 'Elite Block',
    price: 1895,
    hours: 240,
    priceId: 'price_elite', // Will be replaced with actual Stripe price ID
    description: 'Premium concierge service with maximum hours',
    features: [
      'Maximum rotation hours',
      'VIP preceptor matching',
      'Full paperwork management',
      '24/7 priority support',
      'Immediate processing (24 hours)',
      'Guaranteed placement or refund',
      'Dedicated success coordinator',
      'CEU tracking included',
      'Evaluation assistance',
      'Bank unused hours within semester'
    ],
    icon: Crown,
    color: 'gold',
    recommended: false
  }
]

export default function MembershipSelectionStep({ 
  data, 
  updateFormData, 
  onNext,
  onPrev,
  isFirstStep 
}: MembershipSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(
    (data.membership as { plan?: string })?.plan || ''
  )
  const [error, setError] = useState<string>('')

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setError('')
    
    // Update parent form data immediately when plan is selected
    const plan = MEMBERSHIP_PLANS.find(p => p.id === planId)
    if (plan) {
      updateFormData('membership', {
        plan: planId,
        planName: plan.name,
        price: plan.price,
        priceId: plan.priceId
      })
    }
  }

  const handleNext = () => {
    if (!selectedPlan) {
      setError('Please select a membership plan to continue')
      return
    }
    onNext()
  }

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500 bg-blue-50'
      case 'purple':
        return 'border-purple-500 bg-purple-50'
      case 'gold':
        return 'border-amber-500 bg-amber-50'
      default:
        return ''
    }
  }

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-500'
      case 'purple':
        return 'text-purple-500'
      case 'gold':
        return 'text-amber-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Membership Block</h2>
        <p className="text-muted-foreground">
          Select the plan that best fits your clinical placement needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MEMBERSHIP_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative cursor-pointer transition-all hover:shadow-lg",
              "border-2",
              selectedPlan === plan.id 
                ? getPlanColor(plan.color)
                : "hover:border-primary/50"
            )}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge variant="default" className="px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className={cn("w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary/10")}>
                <plan.icon className={cn("w-8 h-8", getIconColor(plan.color))} />
              </div>
              <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.hours} hrs</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {plan.description}
              </p>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className={cn(
                      "w-5 h-5 mt-0.5 flex-shrink-0",
                      selectedPlan === plan.id ? getIconColor(plan.color) : "text-muted-foreground"
                    )} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full mt-6"
                variant={selectedPlan === plan.id ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectPlan(plan.id)
                }}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="font-semibold mb-3">A La Carte Add-On Available</h3>
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-blue-600">$10/hr</p>
          <p className="text-sm text-muted-foreground">Flexible extras (30hr blocks) - aligns with institutional intervals</p>
        </div>
        <h3 className="font-semibold mb-3">What happens next?</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>You&apos;ll be redirected to secure Stripe checkout</li>
          <li>Complete your payment with card, ACH, or digital wallet</li>
          <li>Receive instant confirmation and receipt</li>
          <li>Access your student dashboard immediately</li>
          <li>We&apos;ll begin matching you with preceptors right away</li>
        </ol>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Installment plans and student discounts available.
        </p>
      </div>

      <div className="flex justify-between pt-6">
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
          disabled={!selectedPlan}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  )
}