'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Shield, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import { Id } from '@/convex/_generated/dataModel'

interface PaymentCheckoutProps {
  matchId: Id<"matches">
  studentName: string
  preceptorName: string
  rotationType: string
  startDate: string
  endDate: string
  weeklyHours: number
}

export default function PaymentCheckout({
  matchId,
  studentName,
  preceptorName,
  rotationType,
  startDate,
  endDate,
  weeklyHours
}: PaymentCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const createPaymentSession = useAction(api.payments.createPaymentSession)

  // Mock pricing data - in production, this would come from Stripe
  const mockPricing = {
    "core": { id: "price_core", name: "Core Block", amount: 49900, currency: "usd" }, // $499
    "pro": { id: "price_pro", name: "Pro Block", amount: 79900, currency: "usd" }, // $799
    "premium": { id: "price_premium", name: "Premium Block", amount: 99900, currency: "usd" } // $999
  }

  const selectedPlan = mockPricing.pro // Default to Pro plan

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      const result = await createPaymentSession({
        matchId,
        priceId: selectedPlan.id,
        successUrl: `${window.location.origin}/dashboard/payment-success?matchId=${matchId}`,
        cancelUrl: `${window.location.origin}/dashboard/matches`
      })

      if (result.url) {
        window.location.href = result.url
      } else {
        throw new Error("No session URL returned")
      }
    } catch (error) {
      console.error("Payment initialization failed:", error)
      toast.error("Failed to initialize payment. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const calculateTotalHours = () => {
    const weeks = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 
      (1000 * 60 * 60 * 24 * 7)
    )
    return weeks * weeklyHours
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Match Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Confirm Your Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Student</div>
              <div className="font-semibold">{studentName}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Preceptor</div>
              <div className="font-semibold">{preceptorName}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Rotation Type</div>
              <div className="font-semibold">{rotationType}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Duration</div>
              <div className="font-semibold">{startDate} - {endDate}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Weekly Hours</div>
              <div className="font-semibold">{weeklyHours} hours/week</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Total Hours</div>
              <div className="font-semibold">{calculateTotalHours()} hours</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Selection */}
          <div className="space-y-3">
            <div className="font-medium">Selected Plan</div>
            <div className="border rounded-lg p-4 bg-primary/5 border-primary">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{selectedPlan.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Full service rotation placement with support
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(selectedPlan.amount)}</div>
                  <Badge variant="secondary">One-time</Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* What's Included */}
          <div className="space-y-3">
            <div className="font-medium">What&apos;s Included</div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Verified preceptor match through MentorFit™
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Complete paperwork coordination
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                24/7 rotation support hotline
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Progress tracking and evaluation tools
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Backup placement if needed
              </div>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Due</span>
            <span>{formatCurrency(selectedPlan.amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="h-5 w-5" />
            <div>
              <div className="font-medium">Secure Payment</div>
              <div>Payment processed securely through Stripe. Your card information is never stored on our servers.</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.history.back()}
        >
          Back to Matches
        </Button>
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1 flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Proceed to Payment
            </>
          )}
        </Button>
      </div>

      {/* Terms */}
      <div className="text-xs text-center text-muted-foreground">
        By proceeding, you agree to our{' '}
        <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
        Refunds available per our{' '}
        <a href="/refund-policy" className="underline hover:text-foreground">Refund Policy</a>.
      </div>
    </div>
  )
}