'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from 'convex/react'
import { RoleGuard } from '@/components/role-guard'
import { DashboardContainer } from '@/components/dashboard/dashboard-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  CreditCard,
  Download,
  FileText,
  Calendar,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/convex/_generated/api'

export default function EnterpriseBillingPage() {
  return (
    <RoleGuard requiredRole="enterprise">
      <EnterpriseBillingContent />
    </RoleGuard>
  )
}

function EnterpriseBillingContent() {
  const router = useRouter()
  const openPortal = useAction(api.payments.createBillingPortalSession)
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const invoices = [
    { id: '1', date: '2024-12-01', amount: 5840, status: 'paid', description: 'Monthly subscription - December 2024' },
    { id: '2', date: '2024-11-01', amount: 5840, status: 'paid', description: 'Monthly subscription - November 2024' },
    { id: '3', date: '2024-10-01', amount: 5840, status: 'paid', description: 'Monthly subscription - October 2024' }
  ]

  const handleChangePlan = () => {
    setPlanDialogOpen(true)
  }

  const handlePortalLaunch = async () => {
    try {
      setPortalLoading(true)
      const origin = window.location.origin
      const { url } = await openPortal({ returnUrl: `${origin}/dashboard/enterprise/billing` })
      if (url) {
        window.location.href = url
        return
      }
      throw new Error('Missing billing portal url')
    } catch (error) {
      console.error('enterprise portal launch failed', error)
      toast.error('We could not open the Stripe billing portal. Try again or contact support.')
      setPaymentDialogOpen(true)
    } finally {
      setPortalLoading(false)
    }
  }

  const handleContactSupport = () => {
    router.push('/contact?topic=enterprise-billing')
    setPlanDialogOpen(false)
    setPaymentDialogOpen(false)
  }

  return (
    <>
    <DashboardContainer
      title="Billing & Payments"
      subtitle="Manage your organization's billing and payment information"
    >
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">Enterprise Plan</p>
                <p className="text-muted-foreground">Unlimited students and preceptors</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="text-xl font-semibold">$5,840</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Payment</p>
                <p className="text-xl font-semibold">Jan 1, 2025</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students Enrolled</p>
                <p className="text-xl font-semibold">45</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleChangePlan}>Change Plan</Button>
              <Button variant="outline" onClick={handlePortalLaunch} disabled={portalLoading}>
                {portalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening portal
                  </>
                ) : (
                  'Update Payment Method'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Invoices
            </span>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={invoice.status === 'paid' ? 'secondary' : 'outline'}>
                    {invoice.status}
                  </Badge>
                  <span className="font-semibold">${invoice.amount}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardContainer>

    <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request a plan change</DialogTitle>
          <DialogDescription>
            Enterprise contracts include a dedicated billing manager. Let us know the change you need and we&apos;ll coordinate an updated agreement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Most plan adjustments go live within 1-2 business days and require a signed addendum.</p>
          <p>Include your desired go-live date and any student/preceptor volume targets in the request.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setPlanDialogOpen(false)}>Close</Button>
          <Button onClick={handleContactSupport}>Contact billing team</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update payment method</DialogTitle>
          <DialogDescription>
            We&apos;ll help you refresh ACH or card details and lock future invoices to the new method.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Our team can email a secure Stripe link or schedule a live call to verify banking information.</p>
          <p>If you need to swap purchase orders, include the new PO number in your note.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setPaymentDialogOpen(false)}>Close</Button>
          <Button onClick={handleContactSupport}>Reach out to billing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
