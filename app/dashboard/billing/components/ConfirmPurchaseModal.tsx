'use client'

import { CartItem } from '../view-models/StudentBillingViewModel'
import { AsyncButton } from '@/components/ui/button'

interface ConfirmPurchaseModalProps {
  open: boolean
  items: CartItem[]
  paymentPlanLabel: string
  onConfirm: () => void
  onCancel: () => void
  onRemove: () => void
}

export function ConfirmPurchaseModal({ open, items, paymentPlanLabel, onConfirm, onCancel, onRemove }: ConfirmPurchaseModalProps) {
  if (!open) {
    return null
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border/70 bg-card/90 p-5 shadow-2xl shadow-primary/20 backdrop-blur-xl">
        <h3 className="mb-2 text-lg font-semibold">Confirm Purchase</h3>
        <div className="space-y-1 text-sm text-muted-foreground/80">
          {items.map((item, index) => (
            <div key={`${item.planId}-${index}`}>
              {item.kind === 'block' ? 'Block' : 'À la carte'} – {item.hours} hrs (${item.amount.toFixed(2)})
            </div>
          ))}
        </div>
        <div className="my-3 h-px bg-border/60" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
          <span>Payment plan:</span>
          <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-muted-foreground/80">{paymentPlanLabel}</span>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <AsyncButton
            variant="outline"
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-destructive/50 px-4 py-2 text-sm text-destructive hover:border-destructive"
            onClick={onRemove}
            loadingText="Removing…"
          >
            <span>🗑️</span>
            Remove
          </AsyncButton>
          <AsyncButton
            variant="outline"
            className="rounded-xl border border-border/60 px-4 py-2 text-sm text-muted-foreground/70 hover:border-primary/40"
            onClick={onCancel}
          >
            Cancel
          </AsyncButton>
          <AsyncButton
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/15 px-4 py-2 font-semibold text-accent"
            onClick={onConfirm}
            loadingText="Processing…"
          >
            <span>✅</span>
            Confirm
          </AsyncButton>
        </div>
      </div>
    </div>
  )
}

