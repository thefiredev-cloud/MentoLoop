import type { HourCreditSummary, PaymentHistoryRecord } from '../managers/BillingDataManager'

export type PlanKind = 'block' | 'a_la_carte'

export interface BillingPlan {
  id: string
  kind: PlanKind
  title: string
  description: string
  hours: number
  displayPrice: number
  stripePriceId: string
}

export interface CartItem {
  planId: string
  kind: PlanKind
  hours: number
  amount: number
}

export interface BillingKpis {
  hoursInBank: number
  hoursUsed: number
  hoursRemaining: number
}

export interface DiscountResult {
  code: string | null
  note?: string
}

export class StudentBillingViewModel {
  private readonly credits: HourCreditSummary
  private readonly plans: BillingPlan[]
  private readonly unitPrice: number
  private readonly aLaCarteMinHours: number

  constructor(params: {
    credits: HourCreditSummary
    plans: BillingPlan[]
    unitPrice: number
    aLaCarteMinHours: number
  }) {
    this.credits = params.credits
    this.plans = params.plans
    this.unitPrice = params.unitPrice
    this.aLaCarteMinHours = params.aLaCarteMinHours
  }

  getPlans(): BillingPlan[] {
    return this.plans
  }

  getPlanById(planId: string): BillingPlan | undefined {
    return this.plans.find((plan) => plan.id === planId)
  }

  deriveKpis(): BillingKpis {
    const hoursInBank = this.credits.totalRemaining
    const hoursAllocated = this.credits.totalAllocated
    const hoursUsed = Math.max(hoursAllocated - hoursInBank, 0)
    const hoursRemaining = Math.max(hoursInBank - hoursUsed, 0)
    return { hoursInBank, hoursUsed, hoursRemaining }
  }

  createCartItem(planId: string, hoursOverride?: number): CartItem | null {
    const plan = this.getPlanById(planId)
    if (!plan) {
      return null
    }
    if (plan.kind === 'a_la_carte') {
      const hours = Math.max(this.aLaCarteMinHours, hoursOverride ?? this.aLaCarteMinHours)
      const amount = this.unitPrice * hours
      return { planId: plan.id, kind: plan.kind, hours, amount }
    }
    return { planId: plan.id, kind: plan.kind, hours: plan.hours, amount: plan.displayPrice }
  }

  computeTotals(cart: CartItem[], taxRate: number, discountCode: string | null): {
    subtotal: number
    discount: number
    tax: number
    total: number
    note?: string
  } {
    const subtotal = cart.reduce((acc, item) => acc + item.amount, 0)
    const discountResult = this.applyDiscount(subtotal, discountCode)
    const discountedSubtotal = Math.max(subtotal - discountResult.discount, 0)
    const tax = discountedSubtotal * taxRate
    const total = discountedSubtotal + tax
    return {
      subtotal,
      discount: discountResult.discount,
      tax,
      total,
      note: discountResult.note,
    }
  }

  private applyDiscount(subtotal: number, code: string | null): { discount: number; note?: string } {
    if (!code) {
      return { discount: 0 }
    }
    const normalized = code.trim().toUpperCase()
    if (normalized === 'NP12345') {
      return { discount: subtotal, note: 'NP12345: 100% clinical hour scholarship applied.' }
    }
    if (normalized === 'MENTO12345') {
      const discount = Math.max(0, subtotal - 0.01)
      return { discount, note: 'MENTO12345: Penny checkout path applied.' }
    }
    return { discount: 0, note: 'Code not recognized.' }
  }

  formatPaymentHistory(records: PaymentHistoryRecord[]): PaymentHistoryRecord[] {
    return records
  }
}

