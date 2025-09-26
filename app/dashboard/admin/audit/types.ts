import type { Id } from '@/convex/_generated/dataModel'

export type StripeCurrency = 'usd' | string

export interface WebhookEventRecord {
  readonly id: Id<'webhookEvents'>
  readonly provider: string
  readonly eventId: string
  readonly processedAt?: number | null
  readonly createdAt: number
}

export interface PaymentsAuditRecord {
  readonly id: Id<'paymentsAudit'>
  readonly action: string
  readonly stripeObject?: string | null
  readonly stripeId?: string | null
  readonly details: Record<string, unknown>
  readonly createdAt: number
}

export interface MatchPaymentAttemptRecord {
  readonly id: Id<'paymentAttempts'>
  readonly stripeSessionId: string
  readonly amount?: number
  readonly currency: StripeCurrency
  readonly status: string
  readonly failureReason?: string | null
  readonly paidAt?: number | null
  readonly createdAt: number
}

export interface IntakePaymentAttemptRecord {
  readonly id: Id<'intakePaymentAttempts'>
  readonly customerEmail: string
  readonly membershipPlan: string
  readonly stripeSessionId: string
  readonly amount?: number
  readonly currency: StripeCurrency
  readonly status: string
  readonly discountCode?: string | null
  readonly receiptUrl?: string | null
  readonly paidAt?: number | null
  readonly createdAt: number
}

export interface PaymentObservabilityPayload {
  readonly webhookEvents: ReadonlyArray<WebhookEventRecord>
  readonly paymentsAudit: ReadonlyArray<PaymentsAuditRecord>
  readonly paymentAttempts: ReadonlyArray<MatchPaymentAttemptRecord>
  readonly intakePaymentAttempts: ReadonlyArray<IntakePaymentAttemptRecord>
}

export interface PaymentSummaryMetrics {
  readonly webhookTotal: number
  readonly webhookProcessed: number
  readonly webhookPending: number
  readonly paymentsSucceeded: number
  readonly paymentsFailed: number
  readonly intakeRevenueInCents: number
}

