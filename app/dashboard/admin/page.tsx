'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Brain,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'
// import { useQuery } from 'convex/react'
// import { api } from '@/convex/_generated/api'

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')

  // Get admin analytics data (temporarily unused)
  // const matchAnalytics = useQuery(api.matches.getMatchAnalytics, {})
  // const paymentAnalytics = useQuery(api.payments.getPaymentAnalytics, {})
  // const emailAnalytics = useQuery(api.emails.getEmailAnalytics, {})
  // const smsAnalytics = useQuery(api.sms.getSMSAnalytics, {})

  // Mock data for demonstration
  const mockOverviewStats = {
    totalUsers: 1247,
    activeMatches: 89,
    pendingMatches: 34,
    totalRevenue: 45670,
    aiSuccessRate: 94.5,
    avgResponseTime: '2.3h'
  }

  const mockRecentMatches = [
    {
      id: '1',
      studentName: 'Sarah Johnson',
      preceptorName: 'Dr. Amanda Wilson',
      specialty: 'FNP',
      status: 'confirmed',
      aiScore: 8.7,
      baseScore: 7.2,
      createdAt: '2025-08-18T10:30:00Z',
      paymentStatus: 'paid'
    },
    {
      id: '2',
      studentName: 'Michael Chen',
      preceptorName: 'Dr. James Thompson',
      specialty: 'PMHNP',
      status: 'pending',
      aiScore: 7.9,
      baseScore: 6.8,
      createdAt: '2025-08-18T09:15:00Z',
      paymentStatus: 'unpaid'
    },
    {
      id: '3',
      studentName: 'Emily Rodriguez',
      preceptorName: 'Dr. Lisa Park',
      specialty: 'PNP',
      status: 'suggested',
      aiScore: 6.5,
      baseScore: 6.1,
      createdAt: '2025-08-18T08:45:00Z',
      paymentStatus: 'unpaid'
    }
  ]

  const mockCommunications = [
    {
      id: '1',
      type: 'email',
      template: 'MATCH_CONFIRMED_STUDENT',
      recipient: 'sarah.johnson@email.com',
      status: 'sent',
      sentAt: '2025-08-18T10:35:00Z'
    },
    {
      id: '2',
      type: 'sms',
      template: 'MATCH_CONFIRMATION',
      recipient: '+1234567890',
      status: 'sent',
      sentAt: '2025-08-18T10:35:00Z'
    },
    {
      id: '3',
      type: 'email',
      template: 'WELCOME_STUDENT',
      recipient: 'michael.chen@email.com',
      status: 'failed',
      sentAt: '2025-08-18T09:20:00Z',
      failureReason: 'Invalid email address'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'suggested':
        return <Badge variant="outline">Suggested</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>
      case 'unpaid':
        return <Badge variant="destructive">Unpaid</Badge>
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCommunicationBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500">Sent</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform performance, matches, and communications
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockOverviewStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockOverviewStats.activeMatches}</div>
                  <p className="text-xs text-muted-foreground">
                    {mockOverviewStats.pendingMatches} pending review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockOverviewStats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Success Rate</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockOverviewStats.aiSuccessRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Avg response: {mockOverviewStats.avgResponseTime}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentMatches.slice(0, 3).map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {match.studentName} → {match.preceptorName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {match.specialty} • AI: {match.aiScore}/10 • {formatDate(match.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(match.status)}
                          {getPaymentBadge(match.paymentStatus)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Communication Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCommunications.slice(0, 3).map((comm) => (
                      <div key={comm.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {comm.type === 'email' ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                            {comm.template}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {comm.recipient} • {formatDate(comm.sentAt)}
                          </div>
                          {comm.failureReason && (
                            <div className="text-xs text-destructive">{comm.failureReason}</div>
                          )}
                        </div>
                        <div>
                          {getCommunicationBadge(comm.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            {/* Matches Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Match Management</span>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search matches..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentMatches.map((match) => (
                    <div key={match.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold">
                            {match.studentName} ↔ {match.preceptorName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {match.specialty} rotation • Created {formatDate(match.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(match.status)}
                          {getPaymentBadge(match.paymentStatus)}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Base Score</div>
                          <div className="font-medium">{match.baseScore}/10</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">AI Enhanced</div>
                          <div className="font-medium text-primary">
                            {match.aiScore}/10 
                            <span className="text-green-600 ml-1">
                              (+{(match.aiScore - match.baseScore).toFixed(1)})
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Actions</div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications" className="space-y-6">
            {/* Communication Analytics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Emails Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    98.5% success rate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">SMS Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">567</div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    99.2% success rate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Failed Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                    <AlertCircle className="h-3 w-3" />
                    Requires attention
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.2s</div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Clock className="h-3 w-3" />
                    Within SLA
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Communication Log */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCommunications.map((comm) => (
                    <div key={comm.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {comm.type === 'email' ? 
                          <Mail className="h-4 w-4 text-blue-500" /> : 
                          <MessageSquare className="h-4 w-4 text-green-500" />
                        }
                        <div>
                          <div className="font-medium text-sm">{comm.template}</div>
                          <div className="text-xs text-muted-foreground">
                            {comm.recipient} • {formatDate(comm.sentAt)}
                          </div>
                          {comm.failureReason && (
                            <div className="text-xs text-destructive">{comm.failureReason}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCommunicationBadge(comm.status)}
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

          <TabsContent value="payments" className="space-y-6">
            {/* Payment Analytics */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(45670)}</div>
                  <div className="text-xs text-green-600">+15% from last month</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">96.8%</div>
                  <div className="text-xs text-muted-foreground">89 successful / 92 total</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(799)}</div>
                  <div className="text-xs text-muted-foreground">Pro plan most popular</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Payment transaction data will be loaded from the database here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            {/* AI Performance */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AI Analysis Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.5%</div>
                  <div className="text-xs text-green-600">156/165 successful</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Score Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+1.2</div>
                  <div className="text-xs text-muted-foreground">points over base score</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">High Confidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <div className="text-xs text-muted-foreground">of AI analyses</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  AI analytics and insights will be displayed here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}