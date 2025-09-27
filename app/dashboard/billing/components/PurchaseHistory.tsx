'use client'

import { PaymentHistoryRecord } from '../managers/BillingDataManager'
import { AsyncButton } from '@/components/ui/button'

interface PurchaseHistoryProps {
  records: PaymentHistoryRecord[]
  onDownload: (record: PaymentHistoryRecord) => void
}

export function PurchaseHistory({ records, onDownload }: PurchaseHistoryProps) {
  if (records.length === 0) {
    return <div className="text-sm text-muted-foreground/70">No purchases yet.</div>
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div key={record.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
          <div>
            <div className="text-base font-semibold">${record.amount.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground/70">{new Date(record.date).toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground/80">
              {record.status === 'paid' ? 'Paid in full' : record.status}
            </span>
            <AsyncButton
              variant="outline"
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-1 text-xs text-muted-foreground/70 hover:border-primary/40"
              onClick={() => onDownload(record)}
              loadingText="Opening…"
            >
              <span>📄</span>
              Receipt
            </AsyncButton>
          </div>
        </div>
      ))}
    </div>
  )
}

