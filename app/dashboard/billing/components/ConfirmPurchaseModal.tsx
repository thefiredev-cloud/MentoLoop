'use client'

import { CartItem } from '../view-models/StudentBillingViewModel'

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
      <div className="w-full max-w-lg rounded-2xl border border-[#1d2a46] bg-[#111a2b] p-4 shadow-2xl">
        <h3 className="text-lg font-semibold mb-2">Confirm Purchase</h3>
        <div className="text-sm text-[#a6b3cc] space-y-1">
          {items.map((item, index) => (
            <div key={`${item.planId}-${index}`}>
              {item.kind === 'block' ? 'Block' : 'À la carte'} – {item.hours} hrs (${item.amount.toFixed(2)})
            </div>
          ))}
        </div>
        <div className="h-px bg-[#1d2a46] my-3" />
        <div className="flex items-center gap-2 text-xs text-[#a6b3cc]">
          <span>Payment plan:</span>
          <span className="rounded-full border border-[#1d2a46] px-3 py-1 text-[#a6b3cc]">{paymentPlanLabel}</span>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#ff6b6b]/50 px-4 py-2 text-sm text-[#ff6b6b] hover:border-[#ff6b6b]"
            onClick={onRemove}
          >
            <span>🗑️</span>
            Remove
          </button>
          <button
            className="rounded-xl border border-[#1d2a46] px-4 py-2 text-sm text-[#a6b3cc]"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-[#2fd38f] bg-[#13203a] px-4 py-2 font-semibold text-[#2fd38f]"
            onClick={onConfirm}
          >
            <span>✅</span>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

