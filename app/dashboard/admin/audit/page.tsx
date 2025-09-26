'use client'
import React from 'react'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Activity, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'
import type { PaymentObservabilityPayload } from './types'
import {
  computePaymentSummaryMetrics,
  filterIntakePaymentAttempts,
  filterMatchPaymentAttempts,
  filterPaymentsAudit,
  filterWebhookEvents,
  getStripeUrl,
} from './utils'

export default function AuditLogs() {
  return (
    <RoleGuard requiredRole="admin">
      <AuditLogsContent />
    </RoleGuard>
  )
}

function AuditLogsContent() {
  const [limit, setLimit] = React.useState(100)
  const data = useQuery(api.admin.getRecentPaymentEvents, { limit }) as
    | PaymentObservabilityPayload
    | undefined
  const [search, setSearch] = React.useState('')
  const [onlyUnprocessed, setOnlyUnprocessed] = React.useState(false)

  if (data === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="text-muted-foreground">Loading payment observability…</div>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>No payment activity yet</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Webhooks, payment attempts, and audit entries will appear here as soon as Stripe activity begins.
          </CardContent>
        </Card>
      </div>
    )
  }

  const webhookEvents = filterWebhookEvents(data.webhookEvents, {
    search,
    onlyUnprocessed,
  })
  const paymentsAudit = filterPaymentsAudit(data.paymentsAudit, search)
  const paymentAttempts = filterMatchPaymentAttempts(data.paymentAttempts, search)
  const intakePaymentAttempts = filterIntakePaymentAttempts(
    data.intakePaymentAttempts,
    search,
  )

  const metrics = computePaymentSummaryMetrics({
    webhookEvents,
    paymentsAudit,
    paymentAttempts,
    intakePaymentAttempts,
  })

  const downloadCsv = (rows: Array<Record<string, string | number | boolean | null>>, filename: string) => {
    if (!rows || rows.length === 0) return
    const headers = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row).forEach((k) => set.add(k))
        return set
      }, new Set<string>())
    )
    const escape = (v: unknown) => {
      if (v === null || v === undefined) return ''
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replaceAll('"', '""') + '"' : s
    }
    const csv = [headers.join(',')]
    for (const row of rows) {
      csv.push(headers.map((h) => escape(row[h as keyof typeof row])).join(','))
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payments Observability</h1>
        <p className="text-muted-foreground">
          Real-time insight into Stripe webhook traffic, payment attempts, and audit history
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.webhookTotal}</div>
            <p className="text-xs text-muted-foreground">{metrics.webhookProcessed} processed · {metrics.webhookPending} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.paymentsSucceeded}</div>
            <p className="text-xs text-muted-foreground">Across matches and intake</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.paymentsFailed}</div>
            <p className="text-xs text-muted-foreground">Requires follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intake Revenue (test mode)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.intakeRevenueInCents)}</div>
            <p className="text-xs text-muted-foreground">Succeeded checkout sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Input
            placeholder="Search id, provider, action…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-72"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="unprocessed" checked={onlyUnprocessed} onCheckedChange={(val: boolean) => setOnlyUnprocessed(val)} />
          <Label htmlFor="unprocessed" className="text-sm">Only unprocessed webhooks</Label>
        </div>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="webhooks">Webhook Events ({webhookEvents.length})</TabsTrigger>
          <TabsTrigger value="audit">Payments Audit ({paymentsAudit.length})</TabsTrigger>
          <TabsTrigger value="match-payments">Match Payments ({paymentAttempts.length})</TabsTrigger>
          <TabsTrigger value="intake">Intake Payments ({intakePaymentAttempts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stripe Webhook Deliveries</CardTitle>
              <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => downloadCsv(webhookEvents as unknown as Array<Record<string, string | number | boolean | null>>, 'webhook_events.csv')}>
                  Export CSV
                </Button>
              <Button className="ml-2" variant="secondary" size="sm" onClick={() => setLimit((n) => n + 100)}>
                Load more
              </Button>
              </div>
            </CardHeader>
            <CardContent>
              {webhookEvents.length === 0 ? (
                <EmptyState message="No webhooks received yet." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event ID</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Processed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookEvents.map((event) => (
                        <TableRow key={String(event.id)}>
                          <TableCell className="font-mono text-xs">
                            {getStripeUrl('event', event.eventId) ? (
                              <a
                                href={getStripeUrl('event', event.eventId)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-primary"
                              >
                                {String(event.eventId)}
                              </a>
                            ) : (
                              String(event.eventId)
                            )}
                          </TableCell>
                          <TableCell>{event.provider}</TableCell>
                          <TableCell>{renderWebhookStatus(event.processedAt ?? undefined)}</TableCell>
                          <TableCell>{formatDate(event.createdAt)}</TableCell>
                          <TableCell>{event.processedAt ? formatDate(event.processedAt) : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments Audit Trail</CardTitle>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => downloadCsv(paymentsAudit as unknown as Array<Record<string, string | number | boolean | null>>, 'payments_audit.csv')}>
                  Export CSV
                </Button>
                <Button className="ml-2" variant="secondary" size="sm" onClick={() => setLimit((n) => n + 100)}>
                  Load more
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentsAudit.length === 0 ? (
                <EmptyState message="No audit entries recorded yet." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Stripe Object</TableHead>
                        <TableHead>Identifier</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Recorded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsAudit.map((entry) => (
                        <TableRow key={String(entry.id)}>
                          <TableCell>{entry.action}</TableCell>
                          <TableCell>{entry.stripeObject}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {(() => {
                              const stripeObject = entry.stripeObject ?? undefined
                              const stripeId = entry.stripeId ?? undefined
                              const stripeUrl = getStripeUrl(stripeObject, stripeId)
                              if (!stripeUrl) return stripeId ?? '—'
                              return (
                                <a
                                  href={stripeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline text-primary"
                                >
                                  {stripeId}
                                </a>
                              )
                            })()}
                          </TableCell>
                          <TableCell className="max-w-[320px] truncate text-xs">
                            {Object.keys(entry.details || {}).length === 0
                              ? '—'
                              : JSON.stringify(entry.details)}
                          </TableCell>
                          <TableCell>{formatDate(entry.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="match-payments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Match Payment Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentAttempts.length === 0 ? (
                <EmptyState message="No match payment attempts captured yet." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Failure Reason</TableHead>
                        <TableHead>Recorded</TableHead>
                        <TableHead>Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentAttempts.map((attempt) => (
                        <TableRow key={String(attempt.id)}>
                          <TableCell className="font-mono text-xs">
                            {getStripeUrl('checkout_session', attempt.stripeSessionId) ? (
                              <a
                                href={getStripeUrl('checkout_session', attempt.stripeSessionId)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-primary"
                              >
                                {attempt.stripeSessionId}
                              </a>
                            ) : (
                              attempt.stripeSessionId
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {getStripeUrl('checkout_session', attempt.stripeSessionId) ? (
                              <a
                                href={getStripeUrl('checkout_session', attempt.stripeSessionId)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-primary"
                              >
                                {attempt.stripeSessionId}
                              </a>
                            ) : (
                              attempt.stripeSessionId
                            )}
                          </TableCell>
                          <TableCell>{renderPaymentStatus(attempt.status)}</TableCell>
                          <TableCell>{formatCurrency(attempt.amount ?? 0)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {attempt.failureReason ?? '—'}
                          </TableCell>
                          <TableCell>{formatDate(attempt.createdAt)}</TableCell>
                          <TableCell>{attempt.paidAt ? formatDate(attempt.paidAt) : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intake">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Intake Checkout Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {intakePaymentAttempts.length === 0 ? (
                <EmptyState message="Students have not completed checkout yet." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Recorded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {intakePaymentAttempts.map((attempt) => (
                        <TableRow key={String(attempt.id)}>
                          <TableCell className="font-mono text-xs">{attempt.customerEmail}</TableCell>
                          <TableCell>{attempt.membershipPlan}</TableCell>
                          <TableCell>{renderPaymentStatus(attempt.status)}</TableCell>
                          <TableCell>{formatCurrency(attempt.amount)}</TableCell>
                          <TableCell>
                            {attempt.receiptUrl ? (
                              <a
                                href={attempt.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(attempt.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatDate(timestamp?: number) {
  if (!timestamp) return '—'
  try {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function formatCurrency(amount?: number) {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
}

function renderWebhookStatus(processedAt?: number) {
  if (processedAt && processedAt > 0) {
    return <Badge className="bg-success hover:bg-success/90 text-success-foreground">Processed</Badge>
  }
  return <Badge variant="secondary">Pending</Badge>
}

function renderPaymentStatus(status: string) {
  switch (status) {
    case 'succeeded':
      return <Badge className="bg-success hover:bg-success/90 text-success-foreground">Succeeded</Badge>
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'refunded':
      return <Badge variant="outline">Refunded</Badge>
    case 'partially_refunded':
      return <Badge variant="outline">Partially Refunded</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground text-center py-6">{message}</p>
}
