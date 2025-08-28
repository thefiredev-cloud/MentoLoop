'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Plus,
  ChevronRight
} from 'lucide-react'

export default function EnterpriseBillingPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseBillingContent />
    </RoleGuard>
  )
}

function EnterpriseBillingContent() {
  // Mock data
  const billing = {
    currentPlan: 'Enterprise Pro',
    studentSeats: 200,
    usedSeats: 145,
    monthlyRate: 50,
    totalMonthly: 10000,
    billingCycle: 'Annual',
    nextBilling: '2024-12-01',
    totalSpent: 120000
  }

  const invoices = [
    {
      id: 1,
      number: 'INV-2024-001',
      date: '2024-01-01',
      amount: 120000,
      status: 'paid',
      period: '2024 Annual'
    },
    {
      id: 2,
      number: 'INV-2023-001',
      date: '2023-01-01',
      amount: 100000,
      status: 'paid',
      period: '2023 Annual'
    },
    {
      id: 3,
      number: 'INV-2022-001',
      date: '2022-01-01',
      amount: 80000,
      status: 'paid',
      period: '2022 Annual'
    }
  ]

  const seatUsagePercentage = (billing.usedSeats / billing.studentSeats) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Enterprise Billing</h1>
        <Button>
          <CreditCard className="mr-2 h-4 w-4" />
          Update Payment Method
        </Button>
      </div>

      {/* Billing Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billing.currentPlan}</div>
            <p className="text-xs text-muted-foreground">
              {billing.billingCycle} billing cycle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billing.totalMonthly.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${billing.monthlyRate} per student seat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billing.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seat Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Seat Usage</CardTitle>
              <CardDescription>
                Track your organization&apos;s seat utilization
              </CardDescription>
            </div>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Seats
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{billing.usedSeats} of {billing.studentSeats} seats used</p>
                  <p className="text-sm text-muted-foreground">
                    {billing.studentSeats - billing.usedSeats} seats available
                  </p>
                </div>
              </div>
              <Badge variant={seatUsagePercentage > 90 ? "destructive" : "secondary"}>
                {Math.round(seatUsagePercentage)}% utilized
              </Badge>
            </div>
            <Progress value={seatUsagePercentage} className="h-2" />
            
            {seatUsagePercentage > 80 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-orange-900">
                  You&apos;re approaching your seat limit. Consider adding more seats to accommodate new students.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Details */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan Type</p>
                <p className="text-lg font-medium">{billing.currentPlan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Billing Cycle</p>
                <p className="text-lg font-medium">{billing.billingCycle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Billing Date</p>
                <p className="text-lg font-medium">
                  {new Date(billing.nextBilling).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p className="text-lg font-medium">Wire Transfer</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="font-medium mb-2">Included Features:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Unlimited preceptor matching
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Advanced analytics and reporting
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Priority support with 1-hour SLA
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Custom integrations and API access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Compliance and regulatory support
                </li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="outline">Update Billing Info</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>
                Download your billing statements and invoices
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-green-100">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.period} • {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">${invoice.amount.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Paid
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage & Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Cost Analysis</CardTitle>
          <CardDescription>
            Understand your organization&apos;s platform utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Cost Per Student</p>
              <p className="text-2xl font-bold">${(billing.totalMonthly / billing.usedSeats).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Based on active students</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Avg. Rotation Cost</p>
              <p className="text-2xl font-bold">$245</p>
              <p className="text-xs text-muted-foreground">Per clinical rotation</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Savings vs Traditional</p>
              <p className="text-2xl font-bold text-green-600">68%</p>
              <p className="text-xs text-muted-foreground">Compared to manual placement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Need help with billing?</p>
                <p className="text-sm text-muted-foreground">
                  Your dedicated account manager is here to help
                </p>
              </div>
            </div>
            <Button variant="outline">
              Contact Support
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}