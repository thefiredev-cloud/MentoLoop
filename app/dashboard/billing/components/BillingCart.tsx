'use client'

import { CartItem } from '../view-models/StudentBillingViewModel'
import { AsyncButton } from '@/components/ui/button'

interface Totals {
  subtotal: number
  discount: number
  tax: number
  total: number
  note?: string
}

interface BillingCartProps {
  items: CartItem[]
  totals: Totals
  discountCode: string
  onDiscountChange: (code: string) => void
  onRemove: (index: number) => void
  onCheckout: () => void
  onDownloadReceipt: () => void
  paymentPlan: number
  onPaymentPlanChange: (plan: number) => void
}

export function BillingCart({
  items,
  totals,
  discountCode,
  onDiscountChange,
  onRemove,
  onCheckout,
  onDownloadReceipt,
  paymentPlan,
  onPaymentPlanChange,
}: BillingCartProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-xl shadow-primary/10 backdrop-blur-xl space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">🧾 Billing Summary</h2>
      <div className="space-y-3 min-h-[120px]">
        {items.length === 0 ? (
          <div className="text-sm text-[#a6b3cc]">Your cart is empty. Add a block or à la carte hours.</div>
        ) : (
          items.map((item, index) => (
            <div key={`${item.planId}-${index}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm">
              <div>
                <div className="font-semibold">
                  {item.kind === 'block' ? `Block: ${item.hours} hrs` : `À la carte: ${item.hours} hrs`}
                </div>
              <div className="text-xs text-muted-foreground/80">${item.amount.toFixed(2)} total</div>
              </div>
              <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-1 text-xs text-muted-foreground/70 uppercase">{item.kind}</span>
              <AsyncButton
                className="rounded-xl border border-destructive/40 px-3 py-1 text-xs text-destructive hover:border-destructive/70"
                onClick={() => onRemove(index)}
                loadingText="Removing…"
                variant="outline"
              >
                Remove
              </AsyncButton>
            </div>
          ))
        )}
      </div>

      <div className="h-px bg-border/60" />

      <div className="flex flex-col gap-2">
        <input
          className="w-full rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          placeholder="Enter discount or gift code…"
          value={discountCode}
          onChange={(event) => onDiscountChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground/80" htmlFor="payment-plan">
          Payment plan
        </label>
        <select
          id="payment-plan"
          className="w-full rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none"
          value={paymentPlan}
          onChange={(event) => onPaymentPlanChange(Number(event.target.value) || 1)}
        >
          <option value={1}>Pay in full (1 payment)</option>
          <option value={3}>Split in 3 payments</option>
          <option value={4}>Split in 4 payments</option>
        </select>
      </div>

      <div className="space-y-2 rounded-xl border border-border/60 bg-muted/40 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <strong>${totals.subtotal.toFixed(2)}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Discount</span>
          <strong>−${totals.discount.toFixed(2)}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Estimated tax</span>
          <strong>${totals.tax.toFixed(2)}</strong>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <strong>${totals.total.toFixed(2)}</strong>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground/70">
          <span>Payment plan</span>
          <strong>{paymentPlan} × ${(totals.total / paymentPlan || 0).toFixed(2)}</strong>
        </div>
        {totals.note ? <div className="text-xs text-muted-foreground/70">{totals.note}</div> : null}
      </div>

      <div className="flex items-center gap-2">
        <AsyncButton
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-gradient-to-r from-primary via-primary/80 to-accent px-4 py-2 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/30 disabled:opacity-50"
          onClick={onCheckout}
          disabled={items.length === 0}
          loadingText="Redirecting…"
        >
          <span>💳</span>
          Purchase
        </AsyncButton>
        <AsyncButton
          variant="outline"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-2 text-sm text-muted-foreground/70"
          onClick={onDownloadReceipt}
          loadingText="Opening…"
        >
          <span>📄</span>
          Last receipt
        </AsyncButton>
      </div>
    </div>
  )
}

