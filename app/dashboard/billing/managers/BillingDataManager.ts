export interface HourCreditSummary {
  totalRemaining: number
  totalAllocated: number
}

export interface HoursSummaryResponse {
  credits?: {
    totalRemaining: number
    totalAllocated?: number
  }
}

export interface PaymentHistoryRecord {
  id: string
  amount: number
  date: string
  status: string
  description: string
  invoice?: string
  receiptUrl?: string
}

export class BillingDataManager {
  readonly hoursSummary: HoursSummaryResponse | null | undefined
  readonly paymentHistory: PaymentHistoryRecord[]

  constructor(params: { hoursSummary: HoursSummaryResponse | null | undefined; paymentHistory: PaymentHistoryRecord[] | null | undefined }) {
    this.hoursSummary = params.hoursSummary
    this.paymentHistory = params.paymentHistory ?? []
  }

  deriveHourCredits(): HourCreditSummary {
    const remaining = this.hoursSummary?.credits?.totalRemaining ?? 0
    const allocated = this.hoursSummary?.credits?.totalAllocated ?? remaining
    return {
      totalRemaining: Math.max(remaining, 0),
      totalAllocated: Math.max(allocated, 0),
    }
  }

  getPaymentHistory(): PaymentHistoryRecord[] {
    return this.paymentHistory
  }
}

