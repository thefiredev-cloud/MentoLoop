'use client'

import { useState } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useAuth, useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CheckCircle, Star, Zap, Plus, Sparkles, Calendar, CreditCard as CreditCardIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TermsPrivacyModal } from '@/components/ui/terms-privacy-modal'
import { AsyncButton } from '@/components/ui/button'

declare global {
  interface Window {
    __MENTOLOOP_TEST_CHECKOUT__?: {
      sessionUrl?: string
      sessionId?: string
    }
  }
}

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
    subtitle: 'Perfect for single rotation',
    hours: 60,
    price: 499,
    pricePerHour: 8.32,
    priceId: 'price_1S77IeKVzfTBpytSbMSAb8PK', // LIVE Stripe price ID
    features: [
      '✅ Guaranteed preceptor match',
      '✅ Basic support + hour tracking',
      '✅ Valid for current semester'
    ],
    icon: Star,
    color: 'green',
    recommended: false
  },
  {
    id: 'pro',
    name: 'Pro Block',
    subtitle: 'Best for multiple rotations',
    hours: 90,
    price: 799,
    pricePerHour: 8.88,
    priceId: 'price_1S77JeKVzfTBpytS1UfSG4Pl', // LIVE Stripe price ID
    features: [
      '✅ Guaranteed preceptor match',
      '✅ Standard support + hour tracking',
      '✅ Bank unused hours within semester',
      '✅ Priority response time'
    ],
    icon: Star,
    color: 'blue',
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium Block',
    subtitle: 'Most comprehensive',
    hours: 120,
    price: 999,
    pricePerHour: 8.33,
    priceId: 'price_1S77KDKVzfTBpytSnfhEuDMi', // LIVE Stripe price ID
    features: [
      '✅ Priority matching (within 14 days)',
      '✅ Extended banking — hours roll across academic year',
      '✅ Access to LoopExchange™ community support',
      '✅ Dedicated support line'
    ],
    icon: Zap,
    color: 'purple',
    recommended: false
  }
]

// Stripe will be loaded dynamically when needed

export default function PaymentAgreementStep({ 
  data, 
  updateFormData, 
  onNext: _onNext,
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
  const [discountCode, setDiscountCode] = useState<string>('')
  const [validatingDiscount, setValidatingDiscount] = useState(false)
  const [paymentOption, setPaymentOption] = useState<'full' | 'installments'>('full')
  const [installmentPlan, setInstallmentPlan] = useState<3 | 4>(3)
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const createStudentCheckoutSession = useAction(api.payments.createStudentCheckoutSession)
  const ensureUserExists = useMutation(api.users.ensureUserExists)
  const validateDiscountCode = useQuery(api.payments.validateDiscountCode, 
    discountCode.length > 0 ? { code: discountCode } : 'skip'
  )

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
        blockPriceId: block.priceId, // Add the priceId here
        addOnHours,
        totalPrice,
        agreedToTerms
      })
    }
  }

  const handleAddOnHoursChange = (value: string) => {
    const hours = parseInt(value) || 0
    // Must be in increments of 10 (allowing 10, 20, 30, etc.)
    const adjustedHours = Math.floor(hours / 10) * 10
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
          blockPriceId: block.priceId, // Add the priceId here too
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

  const calculateInstallmentAmount = () => {
    const total = calculateTotal()
    // Apply discount if valid
    const discountedTotal = validateDiscountCode?.valid && validateDiscountCode.percentOff
      ? total * (1 - validateDiscountCode.percentOff / 100)
      : total
    
    // Calculate installment amount (no additional fees for simplicity)
    return discountedTotal / installmentPlan
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedBlock) {
      newErrors.selectedBlock = 'Please select a membership block'
    }

    if (!agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms and conditions'
    }

    // Check if installments are available for the selected plan
    if (paymentOption === 'installments' && selectedBlock === 'core') {
      newErrors.paymentOption = 'Installment payments are only available for Pro and Premium blocks'
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
      // First ensure user exists in Convex database with retry logic
      try {
        await ensureUserExists()
      } catch (authError) {
        // If authentication fails, wait and retry once
        console.warn('Initial ensureUserExists failed, retrying after delay...', authError)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check auth status again
        if (!isSignedIn) {
          throw new Error('Lost authentication. Please sign in and try again.')
        }
        
        // Retry the mutation
        await ensureUserExists()
      }
      
      const block = MEMBERSHIP_BLOCKS.find(b => b.id === selectedBlock)
      if (!block) throw new Error('No block selected')

      // Get student information from Clerk user
      const fullName = user?.fullName || user?.firstName || ''
      const email = user?.primaryEmailAddress?.emailAddress || ''

      // Get school information from form data
      const schoolInfo = data.schoolInfo as {
        university?: string
        specialty?: string
      }

      if (!fullName || !email) {
        throw new Error('Missing user information. Please ensure you are signed in properly.')
      }

      const redirectToCheckout = (sessionId: string, sessionUrl: string) => {
        updateFormData('paymentAgreement', {
          ...(data.paymentAgreement as Record<string, unknown> || {}),
          sessionId,
          status: 'redirecting'
        })

        sessionStorage.setItem('selectedMembershipPlan', block.id)
        sessionStorage.setItem('membershipDetails', JSON.stringify({
          plan: block.id,
          planName: block.name,
          price: calculateTotal(),
          hours: block.hours + addOnHours
        }))
        sessionStorage.setItem('returningFromStripe', 'true')

        window.location.href = sessionUrl
      }

      const testCheckoutOverride = typeof window !== 'undefined'
        ? window.__MENTOLOOP_TEST_CHECKOUT__
        : undefined

      if (testCheckoutOverride?.sessionUrl) {
        const overrideSessionId = testCheckoutOverride.sessionId || 'test_session'
        redirectToCheckout(overrideSessionId, testCheckoutOverride.sessionUrl)
        return
      }

      // Create Stripe checkout session with discount code if valid and installment options
      const session = await createStudentCheckoutSession({
        priceId: block.priceId,
        customerEmail: email,
        customerName: fullName,
        membershipPlan: block.id,
        metadata: {
          studentName: fullName,
          school: schoolInfo?.university || '',
          specialty: schoolInfo?.specialty || '',
          membershipPlan: block.id,
          addOnHours: addOnHours.toString(),
          totalPrice: calculateTotal().toString(),
          paymentOption: paymentOption,
          ...(paymentOption === 'installments' ? { installmentPlan: installmentPlan.toString() } : {})
        },
        successUrl: `${window.location.origin}/student-intake/confirmation?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/student-intake`,
        ...(validateDiscountCode?.valid && discountCode ? { discountCode } : {}),
        ...(paymentOption === 'installments' && selectedBlock !== 'core' ? {
          paymentOption: 'installments',
          installmentPlan: installmentPlan
        } : {
          paymentOption: 'full'
        })
      })

      if (session.url) {
        redirectToCheckout(session.sessionId, session.url)
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
      case 'green':
        return 'border-success/40 bg-success/10'
      case 'blue':
        return 'border-info/40 bg-info/10'
      case 'purple':
        return 'border-accent/40 bg-accent/10'
      case 'gold':
        return 'border-warning/40 bg-warning/10'
      default:
        return ''
    }
  }

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-success'
      case 'blue':
        return 'text-info'
      case 'purple':
        return 'text-accent'
      case 'gold':
        return 'text-warning'
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
            data-testid={`membership-card-${block.id}`}
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
                block.color === 'green' ? "from-success/10 to-success/20" :
                block.color === 'blue' ? "from-info/10 to-info/20" :
                block.color === 'purple' ? "from-accent/10 to-accent/20" :
                "from-warning/10 to-warning/20"
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
              
              <AsyncButton
                className="w-full mt-6"
                variant={selectedBlock === block.id ? "default" : "outline"}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation()
                  handleSelectBlock(block.id)
                }}
                data-testid={`select-plan-${block.id}`}
                loading={loading && selectedBlock === block.id}
                loadingText="Selecting…"
              >
                {selectedBlock === block.id ? 'Selected' : 'Select'}
              </AsyncButton>
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
                10-hour increments at $10/hr (minimum 30 hours). Hours must be used within the same academic year as your primary block.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Label htmlFor="addOnHours" className="whitespace-nowrap">
                    Additional Hours:
                  </Label>
                  <div className="relative">
                    <select
                      id="addOnHours"
                      value={addOnHours}
                      onChange={(e) => handleAddOnHoursChange(e.target.value)}
                      className="w-32 pr-8 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="0">None</option>
                      <option value="30">30 hrs</option>
                      <option value="40">40 hrs</option>
                      <option value="50">50 hrs</option>
                      <option value="60">60 hrs</option>
                      <option value="70">70 hrs</option>
                      <option value="80">80 hrs</option>
                      <option value="90">90 hrs</option>
                      <option value="100">100 hrs</option>
                    </select>
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

      {/* Payment Options - Full vs Installments */}
      {selectedBlock && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCardIcon className="h-5 w-5" />
              Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Full Payment Option */}
              <div 
                className={cn(
                  "border-2 rounded-lg p-4 cursor-pointer transition-all",
                  paymentOption === 'full' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setPaymentOption('full')}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 mt-1",
                    paymentOption === 'full' 
                      ? "border-primary bg-primary" 
                      : "border-border"
                  )}>
                    {paymentOption === 'full' && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Pay in Full</div>
                    <p className="text-sm text-muted-foreground mb-2">
                      One-time payment - Best value
                    </p>
                    <div className="text-2xl font-bold text-primary">
                      {validateDiscountCode?.valid && validateDiscountCode.percentOff ? (
                        <>
                          <span className="line-through text-lg text-muted-foreground mr-2">
                            ${calculateTotal().toLocaleString()}
                          </span>
                          ${(calculateTotal() * (1 - validateDiscountCode.percentOff / 100)).toLocaleString()}
                        </>
                      ) : (
                        <>${calculateTotal().toLocaleString()}</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Installment Payment Option */}
              <div 
                className={cn(
                  "border-2 rounded-lg p-4 cursor-pointer transition-all",
                  paymentOption === 'installments' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setPaymentOption('installments')}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 mt-1",
                    paymentOption === 'installments' 
                      ? "border-primary bg-primary" 
                      : "border-border"
                  )}>
                    {paymentOption === 'installments' && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      Split Payments
                      <Badge variant="secondary" className="text-xs">Available for Pro & Elite</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Pay over {installmentPlan} months
                    </p>
                    
                    {/* Installment plan selector */}
                    {paymentOption === 'installments' && (
                      <div className="mt-3 space-y-3">
                        <div className="flex gap-2">
                          <AsyncButton
                            type="button"
                            size="sm"
                            variant={installmentPlan === 3 ? "default" : "outline"}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                              event.stopPropagation()
                              setInstallmentPlan(3)
                            }}
                            className="flex-1"
                          >
                            3 months
                          </AsyncButton>
                          <AsyncButton
                            type="button"
                            size="sm"
                            variant={installmentPlan === 4 ? "default" : "outline"}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                              event.stopPropagation()
                              setInstallmentPlan(4)
                            }}
                            className="flex-1"
                          >
                            4 months
                          </AsyncButton>
                        </div>
                        <div className="bg-background/80 rounded-lg p-3">
                          <div className="text-sm font-medium mb-1">
                            ${calculateInstallmentAmount().toFixed(2)}/month
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {installmentPlan} payments of ${calculateInstallmentAmount().toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Show total for installments */}
                    {paymentOption !== 'installments' && (
                      <div className="text-lg font-semibold text-primary">
                        ${calculateInstallmentAmount().toFixed(2)}/mo
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Note about installment availability */}
            {(selectedBlock === 'starter' || selectedBlock === 'core') && paymentOption === 'installments' && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                <p className="text-sm text-warning flex items-start gap-2">
                  <span className="text-warning">⚠</span>
                  <span>
                    Installment payments are only available for Pro and Elite blocks.
                    Please select a different plan or choose full payment.
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Total and Agreement */}
      {selectedBlock && (
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Discount Code Section */}
              <div className="bg-background/80 rounded-lg p-4">
                <Label htmlFor="discountCode" className="text-sm font-medium mb-2 block">
                  Have a discount code?
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="discountCode"
                    type="text"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase())
                    }}
                    className="flex-1"
                  />
                  <AsyncButton
                    type="button"
                    variant="outline"
                    loading={validatingDiscount}
                    loadingText="Validating…"
                    onClick={async () => {
                      if (!discountCode) return
                      setValidatingDiscount(true)
                      try {
                        await new Promise((resolve) => setTimeout(resolve, 250))
                      } finally {
                        setValidatingDiscount(false)
                      }
                    }}
                    disabled={!discountCode || validatingDiscount}
                  >
                    Apply
                  </AsyncButton>
                </div>
                {validateDiscountCode && (
                  <div className="mt-2">
                    {validateDiscountCode.valid ? (
                      <p className="text-sm text-success flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {validateDiscountCode.description || `${validateDiscountCode.percentOff}% discount applied`}
                      </p>
                    ) : validateDiscountCode.error ? (
                      <p className="text-sm text-destructive">{validateDiscountCode.error}</p>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Investment</p>
                    <span className="text-lg font-semibold">
                      {paymentOption === 'full' ? 'Total Amount' : `${installmentPlan}-Month Plan`}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      {MEMBERSHIP_BLOCKS.find(b => b.id === selectedBlock)?.hours || 0}
                      {addOnHours > 0 && ` + ${addOnHours}`} hours
                    </p>
                    {paymentOption === 'full' ? (
                      // Full payment display
                      validateDiscountCode?.valid && validateDiscountCode.percentOff ? (
                        <div>
                          <span className="text-lg line-through text-muted-foreground">
                            ${calculateTotal().toLocaleString()}
                          </span>
                          <span className="text-3xl font-bold text-primary block">
                            ${(calculateTotal() * (1 - validateDiscountCode.percentOff / 100)).toLocaleString()}
                          </span>
                          <Badge variant="secondary" className="mt-1">
                            {validateDiscountCode.percentOff}% OFF
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-primary">
                          ${calculateTotal().toLocaleString()}
                        </span>
                      )
                    ) : (
                      // Installment payment display
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          ${calculateInstallmentAmount().toFixed(2)}/mo
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          for {installmentPlan} months
                        </p>
                        {validateDiscountCode?.valid && validateDiscountCode.percentOff && (
                          <Badge variant="secondary" className="mt-1">
                            {validateDiscountCode.percentOff}% OFF applied
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Payment schedule for installments */}
                {paymentOption === 'installments' && (
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Payment Schedule</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Today</span>
                        <span className="font-medium">${calculateInstallmentAmount().toFixed(2)}</span>
                      </div>
                      {Array.from({ length: installmentPlan - 1 }, (_, i) => (
                        <div key={i} className="flex justify-between text-muted-foreground">
                          <span>Month {i + 2}</span>
                          <span>${calculateInstallmentAmount().toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={handleTermsChange}
                    className="mt-1"
                    data-testid="terms-checkbox"
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
                      <TermsPrivacyModal type="terms" /> and{' '}
                      <TermsPrivacyModal type="privacy" />
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
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-success" />
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
        <AsyncButton 
          variant="outline" 
          onClick={onPrev} 
          disabled={isFirstStep || loading}
        >
          Previous
        </AsyncButton>
        <AsyncButton 
          onClick={handlePayment}
          size="lg"
          className="px-8"
          disabled={!selectedBlock || !agreedToTerms}
          loading={loading}
          loadingText="Processing..."
          data-testid="proceed-to-payment"
        >
          Proceed to Payment
        </AsyncButton>
      </div>
    </div>
  )
}
