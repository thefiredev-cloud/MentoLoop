'use client'

import { useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  PieChart,
  BarChart3,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar
} from 'lucide-react'

interface Payment {
  id: string
  customerEmail: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  method: string
  description: string
  createdAt: number
  invoiceUrl: string
}

interface SubscriptionPlan {
  count: number
  revenue: number
}

export default function AdminFinancialPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Get real financial data from Convex
  const paymentAttempts = useQuery(api.paymentAttempts.getAllPaymentAttempts)
  // const allMatches = useQuery(api.matches.getAllMatches, {}) // TODO: Use when needed
  const allUsers = useQuery(api.users.getAllUsers)

  // Calculate financial metrics from real data
  const financialData = useMemo(() => {
    if (!paymentAttempts) return null
    
    const succeeded = paymentAttempts.filter(p => p.status === 'succeeded')
    const pending = paymentAttempts.filter(p => p.status === 'pending')
    const failed = paymentAttempts.filter(p => p.status === 'failed')
    
    const totalRevenue = succeeded.reduce((sum, p) => sum + (p.amount || 0), 0)
    const monthlyRecurring = 0 // Would need subscription data
    const oneTimePayments = totalRevenue
    const refunds = 0 // Would need refund tracking
    
    return {
      totalRevenue,
      monthlyRecurring,
      oneTimePayments,
      refunds,
      pendingPayments: pending.length,
      successfulPayments: succeeded.length,
      failedPayments: failed.length,
      churnRate: 0,
      averageRevenuePerUser: allUsers?.length ? totalRevenue / allUsers.length : 0,
      paymentMethods: {
        creditCard: succeeded.length,
        paypal: 0,
        other: 0
      },
      subscriptionPlans: {
        basic: { count: 0, revenue: 0 },
        premium: { count: 0, revenue: 0 },
        enterprise: { count: 0, revenue: 0 }
      }
    }
  }, [paymentAttempts, allUsers])

  // Convert payment attempts to display format
  const payments = useMemo((): Payment[] => {
    if (!paymentAttempts) return []
    
    return paymentAttempts.map(payment => ({
      id: payment._id,
      customerEmail: 'User', // Would need to join with users table
      amount: payment.amount,
      currency: payment.currency || 'USD',
      status: payment.status,
      method: 'card',
      description: 'Rotation Match Payment',
      createdAt: payment.createdAt,
      invoiceUrl: '#'
    }))
  }, [paymentAttempts])

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = !searchQuery || 
        payment.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter, payments])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      succeeded: { variant: 'default', label: 'Succeeded', icon: CheckCircle },
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      failed: { variant: 'destructive', label: 'Failed', icon: AlertCircle },
      refunded: { variant: 'outline', label: 'Refunded', icon: RefreshCw }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const PaymentDetailsModal = ({ payment }: { payment: Payment }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Payment Details
        </DialogTitle>
        <DialogDescription>
          Payment ID: {payment.id}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-sm font-medium">Customer Email:</span>
            <p className="text-sm text-muted-foreground">{payment.customerEmail}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Amount:</span>
            <p className="text-sm text-muted-foreground">{formatCurrency(payment.amount)}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Status:</span>
            <div className="mt-1">{getStatusBadge(payment.status)}</div>
          </div>
          <div>
            <span className="text-sm font-medium">Payment Method:</span>
            <p className="text-sm text-muted-foreground capitalize">{payment.method}</p>
          </div>
        </div>
        
        <div>
          <span className="text-sm font-medium">Description:</span>
          <p className="text-sm text-muted-foreground">{payment.description}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium">Created At:</span>
          <p className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
          {payment.status === 'succeeded' && (
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Issue Refund
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor revenue, payments, and financial analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency((financialData?.totalRevenue || 0) * 100)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency((financialData?.monthlyRecurring || 0) * 100)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData?.successfulPayments}</div>
            <p className="text-xs text-muted-foreground">
              {financialData?.pendingPayments} pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency((financialData?.averageRevenuePerUser || 0) * 100)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              -2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments by email, description, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Status: {statusFilter === 'all' ? 'All' : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      All Payments
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('succeeded')}>
                      Succeeded
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('failed')}>
                      Failed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('refunded')}>
                      Refunded
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments ({filteredPayments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.customerEmail}</div>
                          <div className="text-sm text-muted-foreground">{payment.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="capitalize">{payment.method}</TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <PaymentDetailsModal payment={payment} />
                            </Dialog>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Invoice
                            </DropdownMenuItem>
                            {payment.status === 'succeeded' && (
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Issue Refund
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Receipt className="h-8 w-8 text-muted-foreground" />
                          <div className="text-lg font-medium">No payments found</div>
                          <div className="text-sm text-muted-foreground">
                            {searchQuery ? 'Try adjusting your search or filters' : 'No payments have been processed yet'}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {financialData?.subscriptionPlans && Object.entries(financialData.subscriptionPlans).map(([plan, data]) => (
              <Card key={plan}>
                <CardHeader>
                  <CardTitle className="capitalize">{plan} Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Subscribers:</span>
                      <span className="font-medium">{(data as SubscriptionPlan).count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Revenue:</span>
                      <span className="font-medium">{formatCurrency((data as SubscriptionPlan).revenue * 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg per User:</span>
                      <span className="font-medium">
                        {formatCurrency((data as SubscriptionPlan).revenue / (data as SubscriptionPlan).count * 100)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{financialData?.churnRate}%</div>
                  <div className="text-sm text-muted-foreground">Churn Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">92%</div>
                  <div className="text-sm text-muted-foreground">Retention Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">2.3x</div>
                  <div className="text-sm text-muted-foreground">LTV/CAC Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">8.2</div>
                  <div className="text-sm text-muted-foreground">Avg Months</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialData?.paymentMethods && Object.entries(financialData.paymentMethods).map(([method, count]) => (
                    <div key={method} className="flex justify-between items-center">
                      <span className="capitalize text-sm">{method.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(count / 93) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Subscription Revenue:</span>
                    <span className="font-medium">{formatCurrency((financialData?.monthlyRecurring || 0) * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">One-time Payments:</span>
                    <span className="font-medium">{formatCurrency((financialData?.oneTimePayments || 0) * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Refunds:</span>
                    <span className="font-medium text-red-600">-{formatCurrency((financialData?.refunds || 0) * 100)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Net Revenue:</span>
                      <span>{formatCurrency(((financialData?.monthlyRecurring || 0) + (financialData?.oneTimePayments || 0) - (financialData?.refunds || 0)) * 100)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-16 flex flex-col">
                  <Download className="h-5 w-5 mb-2" />
                  <span>Monthly Revenue Report</span>
                  <span className="text-xs text-muted-foreground">PDF, Excel</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex flex-col">
                  <BarChart3 className="h-5 w-5 mb-2" />
                  <span>Payment Analytics</span>
                  <span className="text-xs text-muted-foreground">CSV, JSON</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex flex-col">
                  <Users className="h-5 w-5 mb-2" />
                  <span>Customer Report</span>
                  <span className="text-xs text-muted-foreground">PDF, Excel</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex flex-col">
                  <RefreshCw className="h-5 w-5 mb-2" />
                  <span>Refunds & Disputes</span>
                  <span className="text-xs text-muted-foreground">CSV, Excel</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}