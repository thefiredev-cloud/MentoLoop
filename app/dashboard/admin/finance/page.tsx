'use client'

import { useState } from 'react'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  DollarSign, 
  TrendingUp,
  CreditCard,
  Users,
  Calendar,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAction, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'

type CSVCell = string | number | boolean | null | object | undefined

type PaymentAttempt = Doc<'paymentAttempts'>
type IntakePayment = Doc<'intakePaymentAttempts'>
type PreceptorEarning = Doc<'preceptorEarnings'>
type PreceptorEarningWithNames = PreceptorEarning & {
  preceptorName?: string
  studentName?: string
}

export default function FinancialManagement() {
  return (
    <RoleGuard requiredRole="admin">
      <FinancialManagementContent />
    </RoleGuard>
  )
}

function FinancialManagementContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Get real financial data
  const paymentAttempts = useQuery(api.paymentAttempts.getAllPaymentAttempts)
  const intakePayments = useQuery(api.intakePayments.getAllIntakePayments)
  const pendingEarnings = useQuery(api.preceptors.getAllPreceptorEarnings, { status: 'pending' })
  const payEarning = useAction(api.payments.payPreceptorEarning)

  const paymentAttemptList: PaymentAttempt[] = paymentAttempts ?? []
  const successfulPaymentAttempts = paymentAttemptList.filter((attempt) => attempt.status === 'succeeded')
  const intakePaymentList: IntakePayment[] = intakePayments ?? []
  const pendingEarningList: PreceptorEarningWithNames[] = pendingEarnings ?? []
  
  // Calculate financial metrics
  const totalRevenue = successfulPaymentAttempts.reduce((sum, payment) => sum + payment.amount, 0)
  
  const totalIntakeRevenue = intakePaymentList
    .filter((payment) => payment.status === 'succeeded')
    .reduce((sum, payment) => sum + payment.amount, 0)
  
  const failedTransactions = paymentAttemptList.filter((payment) => payment.status === 'failed').length
  const pendingTransactions = paymentAttemptList.filter((payment) => payment.status === 'pending').length
  
  const successfulCount = successfulPaymentAttempts.length
  const averageTransaction = successfulCount > 0 ? totalRevenue / successfulCount : 0

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

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
      case 'succeeded':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Succeeded</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'refunded':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const exportCsv = (rows: Array<Record<string, CSVCell>>, filename: string) => {
    if (!rows || rows.length === 0) return
    const header = Object.keys(rows[0])
    const csv = [header.join(','), ...rows.map(r => header.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredTransactions = paymentAttemptList.filter((payment) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      String(payment.stripeSessionId).toLowerCase().includes(term) ||
      String(payment.status).toLowerCase().includes(term) ||
      String(payment.amount).toLowerCase().includes(term)
    )
  }).filter((payment) => (statusFilter === 'all' ? true : payment.status === statusFilter))

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Management</h1>
        <p className="text-muted-foreground">
          Monitor revenue, transactions, and financial health
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue + totalIntakeRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Total platform revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageTransaction)}</div>
            <p className="text-xs text-muted-foreground">
              Per successful payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentAttemptList.length
                ? ((successfulCount / paymentAttemptList.length) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {failedTransactions} failed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="memberships">Memberships</TabsTrigger>
          <TabsTrigger value="matches">Match Payments</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Transactions</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search transactions..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="succeeded">Succeeded</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={() => setStatusFilter('all')}>
                      <Filter className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const rows = filteredTransactions.map(p => ({
                        amount: formatCurrency(p.amount),
                        status: p.status,
                        createdAt: new Date(p.createdAt).toISOString(),
                        stripeSessionId: p.stripeSessionId,
                        matchId: p.matchId || '',
                        failureReason: p.failureReason || '',
                      }))
                      exportCsv(rows, 'transactions.csv')
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.slice(0, 10).map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Session: {payment.stripeSessionId.slice(0, 20)}...
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(payment.status)}
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

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Preceptor Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingEarningList.length === 0 && (
                  <div className="text-sm text-muted-foreground">No pending payouts.</div>
                )}
                {pendingEarningList.map((earning) => (
                  <div key={earning._id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{earning.preceptorName ?? 'Preceptor'}</div>
                      <div className="text-xs text-muted-foreground">Student: {earning.studentName ?? 'Student'} · {new Date(earning.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold">{formatCurrency(earning.amount)}</div>
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await payEarning({ earningId: earning._id })
                          } catch (err) {
                            console.error(err)
                          }
                        }}
                      >
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memberships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membership Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Core Plan</div>
                  <div className="text-2xl font-bold">{formatCurrency(39900)}</div>
                  <div className="text-xs text-green-600">23 active</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Pro Plan</div>
                  <div className="text-2xl font-bold">{formatCurrency(79900)}</div>
                  <div className="text-xs text-green-600">45 active</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Premium Plan</div>
                  <div className="text-2xl font-bold">{formatCurrency(119900)}</div>
                  <div className="text-xs text-green-600">12 active</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {intakePaymentList.slice(0, 5).map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {payment.customerName} - {payment.membershipPlan} Plan
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.customerEmail}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const rows = intakePaymentList.map((payment) => ({
                      customerName: payment.customerName,
                      customerEmail: payment.customerEmail,
                      membershipPlan: payment.membershipPlan,
                      amount: formatCurrency(payment.amount),
                      status: payment.status,
                      createdAt: new Date(payment.createdAt).toISOString(),
                      discountCode: payment.discountCode || '',
                      discountPercent: payment.discountPercent ?? '',
                      stripeSessionId: payment.stripeSessionId,
                    }))
                    exportCsv(rows, 'membership_payments.csv')
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentAttemptList
                  .filter((payment) => Boolean(payment.matchId))
                  .slice(0, 10)
                  .map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        Match Payment - {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Match ID: {payment.matchId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </div>
                      {payment.failureReason && (
                        <div className="text-xs text-destructive">
                          Failed: {payment.failureReason}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(payment.status)}
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

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-auto flex-col items-start p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-semibold">Monthly Revenue Report</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Detailed breakdown of revenue by source
                  </span>
                </Button>
                
                <Button variant="outline" className="h-auto flex-col items-start p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">Customer Analytics</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Customer lifetime value and retention metrics
                  </span>
                </Button>
                
                <Button variant="outline" className="h-auto flex-col items-start p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-semibold">Growth Metrics</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    MRR, ARR, and growth projections
                  </span>
                </Button>
                
                <Button variant="outline" className="h-auto flex-col items-start p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-semibold">Payment Performance</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Success rates and failure analysis
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
