'use client'

import { useState } from 'react'
import { AsyncButton } from '@/components/ui/button'

interface AlaCartePurchaseProps {
  unitPrice: number
  minimumHours: number
  defaultHours: number
  onAdd: (hours: number) => void
}

export function AlaCartePurchase({ unitPrice, minimumHours, defaultHours, onAdd }: AlaCartePurchaseProps) {
  const [hours, setHours] = useState(defaultHours)

  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-card/80 p-5 shadow-lg shadow-primary/10 backdrop-blur-lg">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/90">
          À la carte
        </div>
        <div className="mt-2 text-sm text-muted-foreground/80">
          Flexible purchase at ${unitPrice.toFixed(2)}/hr, minimum {minimumHours} hours.
        </div>
      </div>
      <div>
        <div className="text-3xl font-semibold text-foreground">${(hours * unitPrice).toFixed(2)}</div>
        <div className="text-sm text-muted-foreground/80">{hours} hours</div>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex rounded-xl border border-border/70 bg-muted/40" aria-label="Adjust a la carte hours">
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
        <span className="rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs text-muted-foreground/80">
          Min {minimumHours} hrs
        </span>
      </div>
      <AsyncButton
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/15 px-4 py-2 font-semibold text-primary hover:border-primary/40 hover:bg-primary/20"
        onClick={() => onAdd(hours)}
      >
        <span>🛒</span>
        Add
      </AsyncButton>
    </div>
  )
}

