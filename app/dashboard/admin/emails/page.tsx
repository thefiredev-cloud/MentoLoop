'use client'

import { useMemo, useState, type ChangeEvent } from 'react'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Mail, 
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react'
import { useAction, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import type { Doc } from '@/convex/_generated/dataModel'

type EmailLog = Doc<'emailLogs'>
type TemplateStats = Record<string, { sent: number; failed: number; pending: number; total: number }>
type RetryEmailPayload = {
  to: string
  templateKey: string
  variables: Record<string, string>
  fromName?: string
  replyTo?: string
} | null

export default function EmailAnalytics() {
  return (
    <RoleGuard requiredRole="admin">
      <EmailAnalyticsContent />
    </RoleGuard>
  )
}

function EmailAnalyticsContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [templateFilter, setTemplateFilter] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Get email logs from database
  const emailLogs = useQuery(api.emails.getAllEmailLogs) as EmailLog[] | undefined
  const retryEmail = useAction(api.emails.retryEmailLog)
  const sendEmailAction = useAction(api.emails.sendEmail)
  
  // Calculate email metrics
  const totalEmails = emailLogs?.length || 0
  const successfulEmails = emailLogs?.filter(e => e.status === 'sent').length || 0
  const failedEmails = emailLogs?.filter(e => e.status === 'failed').length || 0
  const pendingEmails = emailLogs?.filter(e => e.status === 'pending').length || 0
  
  const successRate = totalEmails > 0 ? ((successfulEmails / totalEmails) * 100).toFixed(1) : 0
  
  // Group emails by template
  const templateStats: TemplateStats = emailLogs?.reduce((acc: TemplateStats, email) => {
    const template = email.templateKey || 'unknown'
    if (!acc[template]) {
      acc[template] = { sent: 0, failed: 0, pending: 0, total: 0 }
    }
    acc[template].total++
    if (email.status === 'sent') acc[template].sent++
    else if (email.status === 'failed') acc[template].failed++
    else if (email.status === 'pending') acc[template].pending++
    return acc
  }, {} as TemplateStats) || {}

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTemplateName = (templateKey: string) => {
    const templates: Record<string, string> = {
      'student_welcome': 'Student Welcome',
      'preceptor_welcome': 'Preceptor Welcome',
      'match_notification': 'Match Notification',
      'payment_confirmation': 'Payment Confirmation',
      'rotation_reminder': 'Rotation Reminder',
      'evaluation_request': 'Evaluation Request',
      'password_reset': 'Password Reset',
      'account_verification': 'Account Verification'
    }
    return templates[templateKey] || templateKey
  }

  const filteredEmailLogs = useMemo<EmailLog[]>(() => {
    if (!emailLogs) return []

    return emailLogs.filter((email: EmailLog) => {
      const matchesSearch = searchTerm
        ? (email.recipientEmail?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
          (getTemplateName(email.templateKey).toLowerCase()).includes(searchTerm.toLowerCase())
        : true

      const matchesStatus = statusFilter === 'all' ? true : email.status === statusFilter
      const matchesTemplate = templateFilter === 'all' ? true : email.templateKey === templateFilter

      return matchesSearch && matchesStatus && matchesTemplate
    })
  }, [emailLogs, searchTerm, statusFilter, templateFilter])

  const templateOptions = useMemo<string[]>(() => {
    if (!emailLogs) return []
    const uniqueTemplates = new Set<string>(emailLogs.map((email) => email.templateKey || 'unknown'))
    return Array.from(uniqueTemplates)
  }, [emailLogs])

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Analytics</h1>
        <p className="text-muted-foreground">
          Monitor email delivery, performance, and engagement metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmails.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulEmails} delivered successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedEmails}</div>
            <p className="text-xs text-destructive">
              Requires investigation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEmails}</div>
            <p className="text-xs text-muted-foreground">
              In queue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="failures">Failed Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Performance by Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(templateStats).map(([template, stats]) => (
                  <div key={template} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{getTemplateName(template)}</div>
                      <div className="text-sm text-muted-foreground">
                        Total: {stats.total} emails
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-green-600">{stats.sent} sent</span>
                        {stats.failed > 0 && (
                          <span className="text-destructive ml-2">{stats.failed} failed</span>
                        )}
                        {stats.pending > 0 && (
                          <span className="text-yellow-600 ml-2">{stats.pending} pending</span>
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
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Student Welcome</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sent to new students after registration
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Sent: 245</span>
                    <span className="text-green-600">99.2% success</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Match Notification</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Notifies students and preceptors of new matches
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Sent: 189</span>
                    <span className="text-green-600">98.4% success</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Payment Confirmation</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Confirms successful payment transactions
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Sent: 156</span>
                    <span className="text-green-600">100% success</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Rotation Reminder</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Reminds students of upcoming rotations
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Sent: 89</span>
                    <span className="text-green-600">97.8% success</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Email Logs</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search emails..." 
                      value={searchTerm}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={statusFilter}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={templateFilter}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setTemplateFilter(event.target.value)}
                  >
                    <option value="all">All templates</option>
                    {templateOptions.map((templateKey) => (
                      <option key={templateKey} value={templateKey}>
                        {getTemplateName(templateKey)}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setTemplateFilter('all')
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isRefreshing}
                    onClick={() => {
                      setIsRefreshing(true)
                      setTimeout(() => setIsRefreshing(false), 500)
                    }}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEmailLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground">No email logs match the current filters.</p>
                )}
                {filteredEmailLogs.slice(0, 20).map((email) => (
                  <div key={email._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {getTemplateName(email.templateKey)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        To: {email.recipientEmail}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(email.sentAt)}
                      </div>
                      {email.failureReason && (
                        <div className="text-xs text-destructive">
                          Error: {email.failureReason}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(email.status)}
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

        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Email Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEmailLogs.filter(e => e.status === 'failed').length === 0 && (
                  <p className="text-sm text-muted-foreground">No failed deliveries under current filters.</p>
                )}
                {filteredEmailLogs
                  .filter((email) => email.status === 'failed')
                  .slice(0, 20)
                  .map((email) => (
                  <div key={email._id} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {getTemplateName(email.templateKey)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        To: {email.recipientEmail}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Failed at: {formatDate(email.sentAt)}
                      </div>
                      <div className="text-xs text-destructive">
                        Reason: {email.failureReason || 'Unknown error'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const result = await retryEmail({ emailLogId: email._id }) as { success: boolean; payload: RetryEmailPayload }

                            if (result?.payload) {
                              await sendEmailAction({
                                to: result.payload.to,
                                templateKey: result.payload.templateKey as Parameters<typeof sendEmailAction>[0]['templateKey'],
                                variables: result.payload.variables,
                                fromName: result.payload.fromName,
                                replyTo: result.payload.replyTo,
                              })
                              toast.success('Retry sent successfully')
                            } else {
                              toast.success('Retry queued for delivery')
                            }
                          } catch (error) {
                            console.error('Retry email failed', error)
                            toast.error('Unable to retry email – see console for details')
                          }
                        }}
                      >
                        Retry
                      </Button>
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
      </Tabs>
    </div>
  )
}
