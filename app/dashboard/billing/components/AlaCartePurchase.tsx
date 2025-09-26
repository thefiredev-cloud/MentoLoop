'use client'

import { useState } from 'react'

interface AlaCartePurchaseProps {
  unitPrice: number
  minimumHours: number
  defaultHours: number
  onAdd: (hours: number) => void
}

export function AlaCartePurchase({ unitPrice, minimumHours, defaultHours, onAdd }: AlaCartePurchaseProps) {
  const [hours, setHours] = useState(defaultHours)

  return (
    <div className="rounded-xl border border-dashed border-[#2fd3c5]/40 bg-[#111a2b] p-4 space-y-4">
      <div>
        <div className="text-lg font-semibold">À la carte</div>
        <div className="text-sm text-[#a6b3cc]">
          Flexible purchase at ${unitPrice.toFixed(2)}/hr, minimum {minimumHours} hours.
        </div>
      </div>
      <div>
        <div className="text-2xl font-semibold">${(hours * unitPrice).toFixed(2)}</div>
        <div className="text-sm text-[#a6b3cc]">{hours} hours</div>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex rounded-xl border border-[#1d2a46] bg-[#0f2038]" aria-label="Adjust a la carte hours">
          <button
            type="button"
            className="px-3 py-2 text-lg"
            onClick={() => setHours((prev) => Math.max(minimumHours, prev - 1))}
            aria-label="Decrease hours"
          >
            −
          </button>
          <input
            type="number"
            min={minimumHours}
            value={hours}
            onChange={(event) => setHours(Math.max(minimumHours, Number(event.target.value) || minimumHours))}
            className="w-20 bg-transparent text-center outline-none"
          />
          <button
            type="button"
            className="px-3 py-2 text-lg"
            onClick={() => setHours((prev) => prev + 1)}
            aria-label="Increase hours"
          >
            +
          </button>
        </label>
        <span className="rounded-full border border-[#1d2a46] px-3 py-1 text-xs text-[#a6b3cc]">Min {minimumHours} hrs</span>
      </div>
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1d2a46] bg-[#13203a] px-4 py-2 font-semibold hover:border-[#29406d]"
        onClick={() => onAdd(hours)}
      >
        <span>🛒</span>
        Add
      </button>
    </div>
  )
}

