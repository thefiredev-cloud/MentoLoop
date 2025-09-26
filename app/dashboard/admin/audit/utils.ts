import type {
  IntakePaymentAttemptRecord,
  MatchPaymentAttemptRecord,
  PaymentObservabilityPayload,
  PaymentSummaryMetrics,
  PaymentsAuditRecord,
  WebhookEventRecord,
} from './types'

export function getStripeUrl(kind: string | undefined, id: string | undefined): string | undefined {
  if (!id) return undefined
  const stripeDashBase = 'https://dashboard.stripe.com/test'
  if (id.startsWith('evt_')) return `${stripeDashBase}/events/${id}`
  if (id.startsWith('pi_')) return `${stripeDashBase}/payments/${id}`
  if (id.startsWith('in_')) return `${stripeDashBase}/invoices/${id}`
  if (id.startsWith('cs_')) return `${stripeDashBase}/checkouts/sessions/${id}`
  if (kind === 'invoice') return `${stripeDashBase}/invoices/${id}`
  if (kind === 'payment_intent') return `${stripeDashBase}/payments/${id}`
  return undefined
}

export function filterWebhookEvents(
  events: ReadonlyArray<WebhookEventRecord>,
  options: { search?: string; onlyUnprocessed?: boolean },
): WebhookEventRecord[] {
  const query = options.search?.toLowerCase().trim() ?? ''
  return events.filter((event) => {
    if (options.onlyUnprocessed && event.processedAt) return false
    if (!query) return true
    return (
      event.eventId.toLowerCase().includes(query) ||
      event.provider.toLowerCase().includes(query)
    )
  })
}

export function filterPaymentsAudit(
  audits: ReadonlyArray<PaymentsAuditRecord>,
  search?: string,
): PaymentsAuditRecord[] {
  if (!search) return [...audits]
  const query = search.toLowerCase().trim()
  return audits.filter((entry) => {
    return (
      entry.action.toLowerCase().includes(query) ||
      (entry.stripeObject?.toLowerCase().includes(query) ?? false) ||
      (entry.stripeId?.toLowerCase().includes(query) ?? false)
    )
  })
}

export function filterMatchPaymentAttempts(
  attempts: ReadonlyArray<MatchPaymentAttemptRecord>,
  search?: string,
): MatchPaymentAttemptRecord[] {
  if (!search) return [...attempts]
  const query = search.toLowerCase().trim()
  return attempts.filter((attempt) => {
    return (
      attempt.stripeSessionId.toLowerCase().includes(query) ||
      attempt.status.toLowerCase().includes(query)
    )
  })
}

export function filterIntakePaymentAttempts(
  attempts: ReadonlyArray<IntakePaymentAttemptRecord>,
  search?: string,
): IntakePaymentAttemptRecord[] {
  if (!search) return [...attempts]
  const query = search.toLowerCase().trim()
  return attempts.filter((attempt) => {
    return (
      attempt.customerEmail.toLowerCase().includes(query) ||
      attempt.membershipPlan.toLowerCase().includes(query) ||
      attempt.stripeSessionId.toLowerCase().includes(query)
    )
  })
}

export function computePaymentSummaryMetrics(
  payload: PaymentObservabilityPayload,
): PaymentSummaryMetrics {
  const webhookTotal = payload.webhookEvents.length
  const webhookProcessed = payload.webhookEvents.filter(
    (event) => !!event.processedAt && event.processedAt > 0,
  ).length
  const webhookPending = webhookTotal - webhookProcessed

  const matchSucceeded = payload.paymentAttempts.filter(
    (attempt) => attempt.status === 'succeeded',
  ).length
  const intakeSucceeded = payload.intakePaymentAttempts.filter(
    (attempt) => attempt.status === 'succeeded',
  ).length
  const paymentsSucceeded = matchSucceeded + intakeSucceeded

  const matchFailed = payload.paymentAttempts.filter(
    (attempt) => attempt.status === 'failed',
  ).length
  const intakeFailed = payload.intakePaymentAttempts.filter(
    (attempt) => attempt.status === 'failed',
  ).length
  const paymentsFailed = matchFailed + intakeFailed

  const intakeRevenueInCents = payload.intakePaymentAttempts
    .filter((attempt) => attempt.status === 'succeeded')
    .reduce((sum, attempt) => sum + (attempt.amount ?? 0), 0)

  return {
    webhookTotal,
    webhookProcessed,
    webhookPending,
    paymentsSucceeded,
    paymentsFailed,
    intakeRevenueInCents,
  }
}

