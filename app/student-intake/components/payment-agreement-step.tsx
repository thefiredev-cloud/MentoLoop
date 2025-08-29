'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CheckCircle, Star, Zap, Crown, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentAgreementStepProps {
  data: Record<string, unknown>
  updateFormData: (section: string, data: Record<string, unknown>) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const MEMBERSHIP_BLOCKS = [
  {
    id: 'core',
    name: 'Core Block',
    subtitle: 'Best for short rotations',
    hours: 60,
    price: 695,
    pricePerHour: 11.58,
    priceId: 'price_core', // Stripe price ID
    features: [
      '✅ Guaranteed preceptor match',
      '✅ Standard support + hour tracking',
      '✅ Bank unused hours within semester'
    ],
    icon: Star,
    color: 'blue',
    recommended: false
  },
  {
    id: 'pro',
    name: 'Pro Block',
    subtitle: 'Best value',
    hours: 120,
    price: 1295,
    pricePerHour: 10.79,
    priceId: 'price_pro', // Stripe price ID
    features: [
      '✅ Priority matching (within 14 days)',
      '✅ Extended banking — hours roll across academic year',
      '✅ Access to LoopExchange™ community support',
      '✅ Payment plan available'
    ],
    icon: Zap,
    color: 'purple',
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium Block',
    subtitle: 'Full coverage option',
    hours: 180,
    price: 1895,
    pricePerHour: 10.53,
    priceId: 'price_premium', // Stripe price ID
    features: [
      '✅ Top priority matching (within 7 days)',
      '✅ Dedicated support line',
      '✅ Hours valid across full academic year',
      '✅ Bonus MentorFit™ session with preceptor',
      '✅ Payment plan available'
    ],
    icon: Crown,
    color: 'gold',
    recommended: false
  }
]

// Stripe will be loaded dynamically when needed

export default function PaymentAgreementStep({ 
  data, 
  updateFormData, 
  onNext,
  onPrev,
  isFirstStep 
}: PaymentAgreementStepProps) {
  const [selectedBlock, setSelectedBlock] = useState<string>(
    (data.paymentAgreement as { membershipBlock?: string })?.membershipBlock || ''
  )
  const [addOnHours, setAddOnHours] = useState<number>(
    (data.paymentAgreement as { addOnHours?: number })?.addOnHours || 0
  )
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(
    (data.paymentAgreement as { agreedToTerms?: boolean })?.agreedToTerms || false
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { isLoaded, isSignedIn } = useAuth()
  const createStudentCheckoutSession = useAction(api.payments.createStudentCheckoutSession)

  const handleSelectBlock = (blockId: string) => {
    setSelectedBlock(blockId)
    setErrors({})
    
    const block = MEMBERSHIP_BLOCKS.find(b => b.id === blockId)
    if (block) {
      const totalPrice = block.price + (addOnHours * 10)
      updateFormData('paymentAgreement', {
        membershipBlock: blockId,
        blockName: block.name,
        blockHours: block.hours,
        blockPrice: block.price,
        addOnHours,
        totalPrice,
        agreedToTerms
      })
    }
  }

  const handleAddOnHoursChange = (value: string) => {
    const hours = parseInt(value) || 0
    // Must be in increments of 20
    const adjustedHours = Math.floor(hours / 20) * 20
    setAddOnHours(adjustedHours)
    
    if (selectedBlock) {
      const block = MEMBERSHIP_BLOCKS.find(b => b.id === selectedBlock)
      if (block) {
        const totalPrice = block.price + (adjustedHours * 10)
        updateFormData('paymentAgreement', {
          membershipBlock: selectedBlock,
          blockName: block.name,
          blockHours: block.hours,
          blockPrice: block.price,
          addOnHours: adjustedHours,
          totalPrice,
          agreedToTerms
        })
      }
    }
  }

  const handleTermsChange = (checked: boolean) => {
    setAgreedToTerms(checked)
    updateFormData('paymentAgreement', {
      ...(data.paymentAgreement as Record<string, unknown> || {}),
      agreedToTerms: checked
    })
  }

  const calculateTotal = () => {
    const block = MEMBERSHIP_BLOCKS.find(b => b.id === selectedBlock)
    if (!block) return 0
    return block.price + (addOnHours * 10)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedBlock) {
      newErrors.selectedBlock = 'Please select a membership block'
    }

    if (!agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    // Check authentication
    if (!isLoaded || !isSignedIn) {
      setErrors({ payment: 'You must be signed in to complete payment. Please sign in and try again.' })
      return
    }

    setLoading(true)
    try {
      const block = MEMBERSHIP_BLOCKS.find(b => b.id === selectedBlock)
      if (!block) throw new Error('No block selected')

      // Get student information from previous steps
      const personalInfo = data.personalInfo as {
        fullName?: string
        email?: string
      }
      const schoolInfo = data.schoolInfo as {
        university?: string
        specialty?: string
      }
      
      if (!personalInfo?.fullName || !personalInfo?.email) {
        throw new Error('Missing student information. Please complete previous steps.')
      }

      // Create Stripe checkout session
      const session = await createStudentCheckoutSession({
        priceId: block.priceId,
        customerEmail: personalInfo.email,
        customerName: personalInfo.fullName,
        membershipPlan: block.id,
        metadata: {
          studentName: personalInfo.fullName,
          school: schoolInfo?.university || '',
          specialty: schoolInfo?.specialty || '',
          membershipPlan: block.id,
          addOnHours: addOnHours.toString(),
          totalPrice: calculateTotal().toString()
        },
        successUrl: `${window.location.origin}/student-intake/confirmation?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/student-intake`
      })

      if (session.sessionUrl) {
        // Store session info for tracking
        updateFormData('paymentAgreement', {
          ...(data.paymentAgreement as Record<string, unknown> || {}),
          sessionId: session.sessionId,
          status: 'redirecting'
        })
        
        // Store membership plan for confirmation page
        sessionStorage.setItem('selectedMembershipPlan', block.id)
        sessionStorage.setItem('membershipDetails', JSON.stringify({
          plan: block.id,
          planName: block.name,
          price: calculateTotal(),
          hours: block.hours + addOnHours
        }))
        
        // Redirect to Stripe checkout
        window.location.href = session.sessionUrl
      } else {
        throw new Error('No checkout session URL returned')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setErrors({ payment: error instanceof Error ? error.message : 'Payment processing failed. Please try again.' })
      toast.error('Payment initialization failed')
    } finally {
      setLoading(false)
    }
  }

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
      case 'purple':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
      case 'gold':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Step 4: Payment & Agreement
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select your membership block to unlock MentorFit™ matching and find your perfect preceptor
        </p>
      </div>

      {/* Membership Blocks */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {MEMBERSHIP_BLOCKS.map((block) => (
          <Card
            key={block.id}
            className={cn(
              "relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
              "border-2",
              selectedBlock === block.id 
                ? getPlanColor(block.color)
                : "hover:border-primary/50 bg-card"
            )}
            onClick={() => handleSelectBlock(block.id)}
          >
            {block.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge variant="default" className="px-4 py-1.5 text-sm font-semibold shadow-lg">
                  BEST VALUE
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-6 pt-8">
              <div className={cn(
                "w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br",
                block.color === 'blue' ? "from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800" :
                block.color === 'purple' ? "from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800" :
                "from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800"
              )}>
                <block.icon className={cn("w-10 h-10", getIconColor(block.color))} />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">{block.name}</CardTitle>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{block.subtitle}</p>
              <div className="mt-6 space-y-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">${block.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {block.hours} hours • ≈${block.pricePerHour.toFixed(2)}/hr
                </p>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {block.features.map((feature, index) => (
                  <li key={index} className="text-sm text-left">
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full mt-6"
                variant={selectedBlock === block.id ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectBlock(block.id)
                }}
              >
                {selectedBlock === block.id ? 'Selected' : 'Select'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {errors.selectedBlock && (
        <p className="text-sm text-destructive text-center">{errors.selectedBlock}</p>
      )}

      {/* A La Carte Add-On Hours */}
      {selectedBlock && (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              A La Carte Add-On Hours
              <Badge variant="outline" className="ml-2">Optional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background/80 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Available only with active block membership.</strong> Purchase additional hours in 
                20-hour increments at $10/hr. Hours must be used within the same academic year as your primary block.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Label htmlFor="addOnHours" className="whitespace-nowrap">
                    Additional Hours:
                  </Label>
                  <div className="relative">
                    <Input
                      id="addOnHours"
                      type="number"
                      min="0"
                      step="20"
                      value={addOnHours}
                      onChange={(e) => handleAddOnHoursChange(e.target.value)}
                      className="w-32 pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      hrs
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="font-semibold text-lg">
                    ${(addOnHours * 10).toLocaleString()} additional
                  </span>
                </div>
              </div>
              {addOnHours > 0 && (
                <p className="text-xs text-muted-foreground mt-3 italic">
                  Adding {addOnHours} hours at $10/hour
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total and Agreement */}
      {selectedBlock && (
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Investment</p>
                    <span className="text-lg font-semibold">Total Amount</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      {MEMBERSHIP_BLOCKS.find(b => b.id === selectedBlock)?.hours || 0}
                      {addOnHours > 0 && ` + ${addOnHours}`} hours
                    </p>
                    <span className="text-3xl font-bold text-primary">
                      ${calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={handleTermsChange}
                    className="mt-1"
                  />
                  <div className="space-y-2">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-relaxed cursor-pointer"
                    >
                      I agree to the MentoLoop terms and conditions, cancellation policy, and understand that hours must be used within the specified timeframe
                    </label>
                    <p className="text-xs text-muted-foreground">
                      By proceeding, you acknowledge that you have read and agree to our{' '}
                      <a href="/terms" className="underline hover:text-primary">Terms of Service</a> and{' '}
                      <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
                    </p>
                  </div>
                </div>
                {errors.agreedToTerms && (
                  <p className="text-sm text-destructive mt-3 flex items-center gap-2">
                    <span className="text-destructive">⚠</span> {errors.agreedToTerms}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* What happens next */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            What Happens After Payment?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Secure Payment Processing</p>
                  <p className="text-xs text-muted-foreground">Complete checkout through Stripe&apos;s secure platform</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Instant Confirmation</p>
                  <p className="text-xs text-muted-foreground">Receive email receipt and account activation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Unlock MentorFit™</p>
                  <p className="text-xs text-muted-foreground">Access our proprietary matching assessment</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Complete Your Profile</p>
                  <p className="text-xs text-muted-foreground">Fill out matching preferences for optimal results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">5</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Begin Matching</p>
                  <p className="text-xs text-muted-foreground">Our team starts finding your perfect preceptor</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Get Matched!</p>
                  <p className="text-xs text-muted-foreground">Connect with your preceptor within days</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {errors.payment && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive text-center">{errors.payment}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={isFirstStep || loading}
        >
          Previous
        </Button>
        <Button 
          onClick={handlePayment}
          size="lg"
          className="px-8"
          disabled={!selectedBlock || !agreedToTerms || loading}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </div>
    </div>
  )
}