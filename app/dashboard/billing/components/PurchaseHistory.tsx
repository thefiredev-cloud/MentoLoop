'use client'

import { PaymentHistoryRecord } from '../managers/BillingDataManager'

interface PurchaseHistoryProps {
  records: PaymentHistoryRecord[]
  onDownload: (record: PaymentHistoryRecord) => void
}

export function PurchaseHistory({ records, onDownload }: PurchaseHistoryProps) {
  if (records.length === 0) {
    return <div className="text-sm text-[#a6b3cc]">No purchases yet.</div>
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div key={record.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-[#1d2a46] bg-[#0f2038] p-3">
          <div>
            <div className="text-base font-semibold">${record.amount.toFixed(2)}</div>
            <div className="text-xs text-[#a6b3cc]">{new Date(record.date).toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#1d2a46] px-3 py-1 text-xs text-[#a6b3cc]">
              {record.status === 'paid' ? 'Paid in full' : record.status}
            </span>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#1d2a46] px-3 py-1 text-xs text-[#a6b3cc]"
              onClick={() => onDownload(record)}
            >
              <span>📄</span>
              Receipt
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

