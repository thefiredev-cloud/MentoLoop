'use client'

import { BillingPlan } from '../view-models/StudentBillingViewModel'
import { AsyncButton } from '@/components/ui/button'

interface AddHoursBlocksProps {
  plans: BillingPlan[]
  onSelect: (planId: string) => void
}

export function AddHoursBlocks({ plans, onSelect }: AddHoursBlocksProps) {
  const blocks = plans.filter((plan) => plan.kind === 'block')
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {blocks.map((plan) => (
        <AsyncButton
          type="button"
          key={plan.id}
          onClick={() => onSelect(plan.id)}
          className="group flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-card/80 p-4 text-left shadow-lg shadow-primary/10 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/90">
                  {plan.title}
                </div>
                <p className="mt-2 text-sm text-muted-foreground/80">{plan.description}</p>
              </div>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary/80">
                {plan.hours} hrs
              </span>
            </div>
            <div className="text-3xl font-semibold text-foreground">
              ${plan.displayPrice.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 text-sm text-muted-foreground/80">
            <span className="inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs uppercase tracking-[0.2em]">
              <span aria-hidden>🛒</span>
              Add to cart
            </span>
            <span className="text-xs text-muted-foreground group-hover:text-primary">
              View details →
            </span>
          </div>
        </AsyncButton>
      ))}
    </div>
  )
}

