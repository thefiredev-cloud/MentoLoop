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
  TrendingDown,
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
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function FinancialManagement() {
  return (
    <RoleGuard requiredRole="admin">
      <FinancialManagementContent />
    </RoleGuard>
  )
}

function FinancialManagementContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Get real financial data
  const paymentAttempts = useQuery(api.paymentAttempts.getAllPaymentAttempts)
  const intakePayments = useQuery(api.intakePayments.getAllIntakePayments)
  
  // Calculate financial metrics
  const totalRevenue = paymentAttempts?.filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0) || 0
  
  const totalIntakeRevenue = intakePayments?.filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0) || 0
  
  const failedTransactions = paymentAttempts?.filter(p => p.status === 'failed').length || 0
  const pendingTransactions = paymentAttempts?.filter(p => p.status === 'pending').length || 0
  
  const averageTransaction = totalRevenue > 0 && paymentAttempts?.filter(p => p.status === 'succeeded').length 
    ? totalRevenue / paymentAttempts.filter(p => p.status === 'succeeded').length 
    : 0

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
              {paymentAttempts?.length ? 
                ((paymentAttempts.filter(p => p.status === 'succeeded').length / paymentAttempts.length) * 100).toFixed(1) : 0}%
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
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentAttempts?.slice(0, 10).map((payment) => (
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
                {intakePayments?.slice(0, 5).map((payment) => (
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
                {paymentAttempts?.filter(p => p.matchId).slice(0, 10).map((payment) => (
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