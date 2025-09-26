'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { RoleGuard } from '@/components/role-guard'
import { BillingHeader } from './components/BillingHeader'
import { HoursKpiCard } from './components/HoursKpiCard'
import { AddHoursBlocks } from './components/AddHoursBlocks'
import { AlaCartePurchase } from './components/AlaCartePurchase'
import { BillingCart } from './components/BillingCart'
import { PurchaseHistory } from './components/PurchaseHistory'
import { ConfirmPurchaseModal } from './components/ConfirmPurchaseModal'
import { BillingDataManager, type PaymentHistoryRecord } from './managers/BillingDataManager'
import { StudentBillingViewModel, type BillingPlan, type CartItem } from './view-models/StudentBillingViewModel'
import { CheckoutCoordinator } from './coordinators/CheckoutCoordinator'
import { toast } from 'sonner'

const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? 0.0825)

const PLAN_DEFINITIONS: BillingPlan[] = [
  {
    id: 'starter',
    kind: 'block',
    title: 'Add 60 hours',
    description: 'Popular starter',
    hours: 60,
    displayPrice: 695,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || 'price_1SBPegB1lwwjVYGvx3Xvooqf',
  },
  {
    id: 'core',
    kind: 'block',
    title: 'Add 90 hours',
    description: 'Great value',
    hours: 90,
    displayPrice: 995,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_CORE || 'price_1SBPeoB1lwwjVYGvt648Bmd2',
  },
  {
    id: 'advanced',
    kind: 'block',
    title: 'Add 120 hours',
    description: 'Best for full rotation',
    hours: 120,
    displayPrice: 1295,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ADVANCED || 'price_1SBPetB1lwwjVYGv9BsnexJl',
  },
  {
    id: 'a_la_carte',
    kind: 'a_la_carte',
    title: 'À la carte',
    description: 'Flexible purchase',
    hours: 0,
    displayPrice: 0,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ALACARTE || 'price_1SBPfEB1lwwjVYGvknol6bdM',
  },
]

const A_LA_CARTE_MIN_HOURS = 30
const A_LA_CARTE_UNIT_PRICE = 14.95

interface HoursSummaryResponse {
  credits?: {
    totalRemaining: number
    totalAllocated?: number
  }
}

export default function BillingPage() {
  const user = useQuery(api.users.current)
  const router = useRouter()
  const isStudent = user?.userType === 'student'
  const isPreceptor = user?.userType === 'preceptor'
  
  useEffect(() => {
    if (isPreceptor) {
      router.push('/dashboard/preceptor')
    }
  }, [isPreceptor, router])
  
  if (isStudent) {
    return (
      <RoleGuard requiredRole="student">
        <BillingContent />
      </RoleGuard>
    )
  }
  
  return <BillingContent />
}

function BillingContent() {
  const { user } = useUser()
  const hoursSummary = useQuery(api.clinicalHours.getStudentHoursSummary) as HoursSummaryResponse | null
  const paymentHistory = useQuery(api.billing.getPaymentHistory, { limit: 10 }) as PaymentHistoryRecord[] | undefined
  const downloadInvoice = useMutation(api.billing.downloadInvoice)
  const createPortal = useAction(api.payments.createBillingPortalSession)
  const createStudentCheckoutSession = useAction(api.payments.createStudentCheckoutSession)

  const manager = useMemo(() => new BillingDataManager({ hoursSummary, paymentHistory }), [hoursSummary, paymentHistory])
  const viewModel = useMemo(
    () =>
      new StudentBillingViewModel({
        credits: manager.deriveHourCredits(),
        plans: PLAN_DEFINITIONS,
        unitPrice: A_LA_CARTE_UNIT_PRICE,
        aLaCarteMinHours: A_LA_CARTE_MIN_HOURS,
      }),
    [manager]
  )

  const checkoutCoordinator = useMemo(
    () => new CheckoutCoordinator({ createStudentCheckoutSession }),
    [createStudentCheckoutSession]
  )

  const [cart, setCart] = useState<CartItem[]>([])
  const [discountCode, setDiscountCode] = useState('')
  const [paymentPlan, setPaymentPlan] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lastReceiptUrl, setLastReceiptUrl] = useState<string | null>(null)

  useEffect(() => {
    if (paymentHistory && paymentHistory.length > 0) {
      const receipt = paymentHistory.find((record) => !!record.receiptUrl)?.receiptUrl ?? null
      setLastReceiptUrl(receipt)
    }
  }, [paymentHistory])

  const kpis = useMemo(() => viewModel.deriveKpis(), [viewModel])
  const cartTotals = useMemo(() => viewModel.computeTotals(cart, TAX_RATE, discountCode || null), [cart, discountCode, viewModel])

  const hasInstallment = paymentPlan > 1
  const handleAddPlan = (planId: string, hoursOverride?: number) => {
    const item = viewModel.createCartItem(planId, hoursOverride)
    if (!item) {
      toast.error('Plan unavailable. Please refresh and try again.')
      return
    }
    setCart([item])
  }

  const handleRemoveItem = (index: number) => {
    const next = [...cart]
    next.splice(index, 1)
    setCart(next)
  }

  const handleCheckout = async () => {
    if (!user) {
      toast.error('You must be signed in to checkout.')
      return
    }
    if (cart.length === 0) {
      toast.error('Add hours to your cart first.')
      return
    }
    const profileName = user.fullName || user.firstName || ''
    const email = user.primaryEmailAddress?.emailAddress
    if (!profileName || !email) {
      toast.error('Missing profile information.')
      return
    }

    const entry = cart[0]
    const plan = viewModel.getPlanById(entry.planId)
    if (!plan) {
      toast.error('Unable to resolve plan. Please try again.')
      return
    }

    await checkoutCoordinator.launch({
      planId: entry.planId,
      stripePriceId: plan.stripePriceId,
      hours: entry.hours,
      kind: entry.kind,
      customerEmail: email,
      customerName: profileName,
      discountCode: discountCode || undefined,
      installmentPlan: hasInstallment ? paymentPlan : undefined,
    })
  }

  const handleDownloadReceipt = () => {
    if (lastReceiptUrl) {
      window.open(lastReceiptUrl, '_blank')
      } else {
      toast.info('No receipt available yet.')
    }
  }

  const handleDownloadHistoryReceipt = async (record: PaymentHistoryRecord) => {
    if (record.receiptUrl) {
      window.open(record.receiptUrl, '_blank')
      return
    }
    const convexId = record.id.startsWith('payments|') ? record.id : null
    if (!convexId) {
      toast.info('Receipt not available for this payment.')
      return
    }
    try {
      const result = await downloadInvoice({ paymentId: convexId as unknown as never })
      if (result?.url) {
        window.open(result.url, '_blank')
      } else {
        toast.error('Invoice download unavailable.')
      }
    } catch (error) {
      console.error('downloadInvoice failed', error)
      toast.error('Failed to download invoice.')
    }
  }

  const handleManageBilling = async () => {
    try {
      const { url } = await createPortal({ returnUrl: `${window.location.origin}/dashboard/billing` })
      if (url) {
        window.location.href = url
      } else {
        toast.error('Failed to open billing portal.')
      }
    } catch (error) {
      console.error('createBillingPortalSession failed', error)
      toast.error('Failed to open billing portal.')
    }
  }

  const handleOpenConfirm = () => {
    if (cart.length === 0) {
      toast.error('Add hours to your cart first.')
      return
    }
    setConfirmOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1320] to-[#0a0f1a] text-[#e9f0ff]">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <header className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-[#2fd3c5] via-[#1fa2ff] to-[#0ee] text-xl font-extrabold text-[#05121f]">
            M
          </div>
                  <div>
            <h1 className="text-2xl font-semibold">Billing</h1>
            <p className="text-sm text-[#a6b3cc]">
              Manage hours, add more, and view your receipts — all without leaving your dashboard.
            </p>
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#1d2a46] bg-[#111a2b] p-4 shadow-xl">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">🕒 Current Hours</h2>
              <div className="flex flex-wrap gap-3">
                <HoursKpiCard label="Hours in Bank" value={kpis.hoursInBank.toLocaleString()} tone="good" />
                <HoursKpiCard label="Hours Used" value={kpis.hoursUsed.toLocaleString()} />
                <HoursKpiCard label="Hours Remaining" value={kpis.hoursRemaining.toLocaleString()} tone="warn" />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-xl border border-[#1d2a46] bg-[#0f2038] px-3 py-2 text-xs text-[#a6b3cc]">
                  ℹ️ These update after you complete a purchase.
                </span>
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#1d2a46] px-3 py-2 text-sm text-[#a6b3cc]"
                  onClick={() => window.location.reload()}
                >
                  <span className="text-lg">↻</span>
                  Recalc
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1d2a46] bg-[#111a2b] p-4 shadow-xl space-y-4">
              <h2 className="text-lg font-semibold">➕ Add Hours (Blocks)</h2>
              <AddHoursBlocks plans={viewModel.getPlans()} onSelect={(planId) => handleAddPlan(planId)} />
              <div className="flex flex-wrap gap-2 text-xs text-[#a6b3cc]">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#1d2a46] bg-[#0f2038] px-3 py-1">
                  🎁 Apply discount at checkout
                </span>
                <span className="rounded-full border border-[#1d2a46] px-3 py-1">Taxes calculated at checkout</span>
                <span className="rounded-full border border-[#1d2a46] px-3 py-1">Preceptor fees billed separately</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1d2a46] bg-[#111a2b] p-4 shadow-xl space-y-4">
              <h2 className="text-lg font-semibold">🧮 Add Hours (À la carte)</h2>
              <AlaCartePurchase
                unitPrice={A_LA_CARTE_UNIT_PRICE}
                minimumHours={A_LA_CARTE_MIN_HOURS}
                defaultHours={A_LA_CARTE_MIN_HOURS}
                onAdd={(hours) => handleAddPlan('a_la_carte', hours)}
              />
            </div>
              </div>

          <div className="space-y-5">
            <BillingCart
              items={cart}
              totals={cartTotals}
              discountCode={discountCode}
              onDiscountChange={setDiscountCode}
              onRemove={handleRemoveItem}
              onCheckout={handleOpenConfirm}
              onDownloadReceipt={handleDownloadReceipt}
              paymentPlan={paymentPlan}
              onPaymentPlanChange={setPaymentPlan}
            />

            <div className="rounded-2xl border border-[#1d2a46] bg-[#111a2b] p-4 shadow-xl">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">🧠 Purchase History</h2>
              <div className="max-h-64 space-y-3 overflow-y-auto pr-3">
                <PurchaseHistory records={viewModel.formatPaymentHistory(manager.getPaymentHistory())} onDownload={handleDownloadHistoryReceipt} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#1d2a46] bg-[#111a2b] p-4 shadow-xl">
              <BillingHeader
                title="Manage Billing"
                subtitle="Update payment methods or billing details via Stripe portal."
                actions={
                  <button
                    className="inline-flex items-center gap-2 rounded-xl border border-[#1d2a46] bg-[#13203a] px-4 py-2 text-sm"
                    onClick={handleManageBilling}
                  >
                    <span>💼</span>
                    Open Portal
                  </button>
                }
              />
            </div>
          </div>
        </div>
              </div>

      <ConfirmPurchaseModal
        open={confirmOpen}
        items={cart}
        paymentPlanLabel={hasInstallment ? `${paymentPlan} installments` : 'Pay in full'}
        onConfirm={() => {
          setConfirmOpen(false)
          void handleCheckout()
        }}
        onCancel={() => setConfirmOpen(false)}
        onRemove={() => {
          setCart([])
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}

