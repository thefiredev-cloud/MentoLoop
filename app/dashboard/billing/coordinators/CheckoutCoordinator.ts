import { toast } from 'sonner'

export interface CheckoutRequest {
  planId: string
  stripePriceId: string
  hours: number
  kind: 'block' | 'a_la_carte'
  customerEmail: string
  customerName: string
  discountCode?: string | null
  installmentPlan?: number
}

export interface CheckoutResult {
  url?: string
  sessionId?: string
}

export interface CheckoutDependencies {
  createStudentCheckoutSession: (input: {
    priceId: string
    customerEmail: string
    customerName: string
    membershipPlan: string
    metadata: Record<string, string>
    successUrl: string
    cancelUrl: string
    discountCode?: string
    paymentOption?: 'full' | 'installments'
    installmentPlan?: 3 | 4
    aLaCarteHours?: number
  }) => Promise<CheckoutResult>
}

export class CheckoutCoordinator {
  private readonly createSession: CheckoutDependencies['createStudentCheckoutSession']

  constructor(deps: CheckoutDependencies) {
    this.createSession = deps.createStudentCheckoutSession
  }

  async launch(request: CheckoutRequest): Promise<void> {
    try {
      const successUrl = `${window.location.origin}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${window.location.origin}/dashboard/billing`
      const payload: Parameters<CheckoutDependencies['createStudentCheckoutSession']>[0] = {
        priceId: request.stripePriceId,
        customerEmail: request.customerEmail,
        customerName: request.customerName,
        membershipPlan: request.planId,
        metadata: {
          membershipPlan: request.planId,
          hoursPurchased: request.hours.toString(),
        },
        successUrl,
        cancelUrl,
        paymentOption: request.installmentPlan ? 'installments' : 'full',
      }

      if (request.kind === 'a_la_carte') {
        payload.aLaCarteHours = request.hours
      }

      if (request.discountCode) {
        payload.discountCode = request.discountCode
      }

      if (request.installmentPlan && (request.installmentPlan === 3 || request.installmentPlan === 4)) {
        payload.installmentPlan = request.installmentPlan
      }

      const result = await this.createSession(payload)
      if (result?.url) {
        window.location.href = result.url
      } else {
        toast.error('Unable to initialize checkout session.')
      }
    } catch (error) {
      console.error('CheckoutCoordinator.launch failed', error)
      toast.error('Checkout failed. Please try again or contact support.')
    }
  }
}

