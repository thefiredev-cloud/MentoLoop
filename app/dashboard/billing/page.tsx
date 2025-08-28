'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ChevronRight,
  Clock
} from 'lucide-react'

export default function BillingPage() {
  const user = useQuery(api.users.current)
  const isStudent = user?.userType === 'student'
  
  // For students, require intake completion before accessing billing
  if (isStudent) {
    return (
      <RoleGuard requiredRole="student">
        <BillingContent userType={user?.userType} />
      </RoleGuard>
    )
  }
  
  // For other user types, show billing directly
  return <BillingContent userType={user?.userType} />
}

function BillingContent({ userType }: { userType?: string }) {
  const isStudent = userType === 'student'
  
  // Mock data - replace with actual queries
  const currentPlan = {
    name: isStudent ? 'Student Premium' : 'Preceptor Pro',
    price: isStudent ? 149 : 0,
    billing: isStudent ? 'monthly' : 'free',
    features: isStudent 
      ? ['Unlimited preceptor matches', 'Priority support', 'Document storage', 'Clinical tracking']
      : ['Unlimited student connections', 'Automated scheduling', 'Evaluation tools', 'CE credits tracking']
  }

  const paymentHistory = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 149,
      status: 'paid',
      invoice: 'INV-2024-001'
    },
    {
      id: 2,
      date: '2023-12-15',
      amount: 149,
      status: 'paid',
      invoice: 'INV-2023-012'
    },
    {
      id: 3,
      date: '2023-11-15',
      amount: 149,
      status: 'paid',
      invoice: 'INV-2023-011'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {isStudent ? 'Update Payment Method' : 'Upgrade Plan'}
        </Button>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                {isStudent ? 'Your subscription details' : 'Your current membership'}
              </CardDescription>
            </div>
            <Badge variant={isStudent ? "default" : "secondary"} className="text-lg px-3 py-1">
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ${currentPlan.price}
              </span>
              {isStudent && (
                <span className="text-muted-foreground">/ month</span>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Plan Features:</p>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {isStudent && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Next billing date</p>
                    <p className="text-sm text-muted-foreground">February 15, 2024</p>
                  </div>
                  <Button variant="outline">Change Plan</Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment methods and billing preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Default</Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                {isStudent ? 'Your transaction history' : 'Your earnings history'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isStudent ? (
              paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-2 bg-green-100">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">${payment.amount}.00</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Paid
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Invoice
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 font-medium">No earnings yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Earnings from student placements will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Invoice Emails</p>
              <p className="text-sm text-muted-foreground">
                Receive invoices and payment confirmations
              </p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tax Information</p>
              <p className="text-sm text-muted-foreground">
                Add or update your tax details
              </p>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Billing Address</p>
              <p className="text-sm text-muted-foreground">
                Update your billing address information
              </p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
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
                  Our support team is here to help with any billing questions
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