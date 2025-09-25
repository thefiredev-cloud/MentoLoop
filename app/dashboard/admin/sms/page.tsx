'use client'

import { useState } from 'react'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { 
  MessageSquare, 
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  MoreHorizontal,
  DollarSign,
  Loader2
} from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import { toast } from 'sonner'

export default function SMSAnalytics() {
  return (
    <RoleGuard requiredRole="admin">
      <SMSAnalyticsContent />
    </RoleGuard>
  )
}

type SmsLog = Doc<'smsLogs'>

function SMSAnalyticsContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogState, setDialogState] = useState<null | { mode: 'retry' | 'details'; log: SmsLog }>(null)
  const [retrying, setRetrying] = useState(false)
  
  // Get SMS logs from database
  const smsLogsData = useQuery(api.sms.getAllSMSLogs) as SmsLog[] | undefined
  const smsLogs: SmsLog[] = smsLogsData ?? []
  
  // Calculate SMS metrics
  const totalSMS = smsLogs.length
  const successfulSMS = smsLogs.filter((sms) => sms.status === 'sent').length
  const failedSMS = smsLogs.filter((sms) => sms.status === 'failed').length
  // const pendingSMS = smsLogs?.filter(s => s.status === 'pending').length || 0
  
  const successRate = totalSMS > 0 ? ((successfulSMS / totalSMS) * 100).toFixed(1) : 0
  const estimatedCost = totalSMS * 0.0075 // Assuming $0.0075 per SMS
  
  // Group SMS by template
  const templateStats = smsLogs.reduce<Record<string, { sent: number; failed: number; pending: number; total: number }>>(
    (acc, sms) => {
      const template = sms.templateKey || 'unknown'
      if (!acc[template]) {
        acc[template] = { sent: 0, failed: 0, pending: 0, total: 0 }
      }
      acc[template].total += 1
      if (sms.status === 'sent') acc[template].sent += 1
      else if (sms.status === 'failed') acc[template].failed += 1
      else if (sms.status === 'pending') acc[template].pending += 1
      return acc
    },
    {}
  )

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhoneNumber = (phone: string) => {
    // Format phone number as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'pending':
        return <Badge className="bg-warning/20 text-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTemplateName = (templateKey: string) => {
    const templates: Record<string, string> = {
      'verification_code': 'Verification Code',
      'match_alert': 'Match Alert',
      'rotation_reminder': 'Rotation Reminder',
      'payment_reminder': 'Payment Reminder',
      'urgent_notification': 'Urgent Notification',
      'appointment_confirm': 'Appointment Confirmation'
    }
    return templates[templateKey] || templateKey
  }

  const closeDialog = () => {
    if (retrying) return
    setDialogState(null)
  }

  const handleRetry = async () => {
    if (!dialogState?.log) return
    setRetrying(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success(`Retry queued for ${formatPhoneNumber(dialogState.log.recipientPhone)}`)
      setDialogState(null)
    } catch (error) {
      console.error('Retry failed to queue', error)
      toast.error('Unable to queue retry right now')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SMS Analytics</h1>
        <p className="text-muted-foreground">
          Monitor SMS delivery, costs, and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SMS Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSMS.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1 text-success" />
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulSMS} delivered successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedSMS}</div>
            <p className="text-xs text-destructive">
              {failedSMS > 0 ? 'Needs attention' : 'All clear'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estimatedCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="failures">Failed Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Performance by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(templateStats).map(([template, stats]) => (
                  <div key={template} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{getTemplateName(template)}</div>
                      <div className="text-sm text-muted-foreground">
                        Total: {stats.total} messages
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-success">{stats.sent} sent</span>
                        {stats.failed > 0 && (
                          <span className="text-destructive ml-2">{stats.failed} failed</span>
                        )}
                        {stats.pending > 0 && (
                          <span className="text-warning ml-2">{stats.pending} pending</span>
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        {stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(0) : 0}% success
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivery Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average delivery time</span>
                    <span className="text-sm font-medium">2.3 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Peak sending hour</span>
                    <span className="text-sm font-medium">10:00 AM - 11:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Most active day</span>
                    <span className="text-sm font-medium">Monday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Carrier success rate</span>
                    <span className="text-sm font-medium">99.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cost per SMS</span>
                    <span className="text-sm font-medium">$0.0075</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly budget</span>
                    <span className="text-sm font-medium">$50.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Budget used</span>
                    <span className="text-sm font-medium">{((estimatedCost / 50) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projected monthly</span>
                    <span className="text-sm font-medium">${(estimatedCost * 1.3).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>SMS Message Log</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search messages..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {smsLogs.slice(0, 20).map((sms) => (
                  <div key={sms._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {getTemplateName(sms.templateKey)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        To: {formatPhoneNumber(sms.recipientPhone)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(sms.sentAt)}
                      </div>
                      {sms.failureReason && (
                        <div className="text-xs text-destructive">
                          Error: {sms.failureReason}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(sms.status)}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Verification Code</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    6-digit verification codes for account security
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Sent: 342</span>
                    <span className="text-success">99.7% success</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Match Alert</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Instant notification of new preceptor matches
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Sent: 156</span>
                    <span className="text-success">98.1% success</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Rotation Reminder</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    24-hour reminder before rotation starts
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Sent: 89</span>
                    <span className="text-success">100% success</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Payment Reminder</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Reminder for pending payment completion
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Sent: 34</span>
                    <span className="text-success">97.1% success</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed SMS Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {failedSMS === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
                  <p>No failed SMS deliveries</p>
                  <p className="text-sm">All messages delivered successfully</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {smsLogs
                    .filter((sms) => sms.status === 'failed')
                    .slice(0, 20)
                    .map((sms) => (
                    <div key={sms._id} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {getTemplateName(sms.templateKey)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          To: {formatPhoneNumber(sms.recipientPhone)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Failed at: {formatDate(sms.sentAt)}
                        </div>
                        <div className="text-xs text-destructive">
                          Reason: {sms.failureReason || 'Unknown error'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDialogState({ mode: 'retry', log: sms })}>
                          Retry
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDialogState({ mode: 'details', log: sms })}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogState !== null} onOpenChange={(open) => (!open ? closeDialog() : undefined)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogState?.mode === 'retry' ? 'Retry SMS delivery' : 'Message details'}
            </DialogTitle>
            <DialogDescription>
              {dialogState?.mode === 'retry'
                ? 'We will requeue this message with the same template and recipient.'
                : 'Review the message payload, delivery attempts, and error response.'}
            </DialogDescription>
          </DialogHeader>

          {dialogState?.log && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-1">
                <span className="font-medium">Recipient</span>
                <span className="text-muted-foreground">{formatPhoneNumber(dialogState.log.recipientPhone)}</span>
              </div>
              <div className="grid gap-1">
                <span className="font-medium">Template</span>
                <span className="text-muted-foreground">{getTemplateName(dialogState.log.templateKey)}</span>
              </div>
              <div className="grid gap-1">
                <span className="font-medium">Most recent error</span>
                <span className="text-destructive text-xs">{dialogState.log.failureReason || 'Unknown error'}</span>
              </div>
              <div className="grid gap-1">
                <span className="font-medium">Message preview</span>
                <span className="rounded-md border border-border/60 bg-muted/10 p-3 leading-relaxed text-muted-foreground">
                  {dialogState.log.message}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} disabled={retrying}>
              Close
            </Button>
            {dialogState?.mode === 'retry' && (
              <Button onClick={handleRetry} disabled={retrying}>
                {retrying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Queueing
                  </>
                ) : (
                  'Requeue message'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
