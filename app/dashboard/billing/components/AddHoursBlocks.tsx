'use client'

import { BillingPlan } from '../view-models/StudentBillingViewModel'

interface AddHoursBlocksProps {
  plans: BillingPlan[]
  onSelect: (planId: string) => void
}

export function AddHoursBlocks({ plans, onSelect }: AddHoursBlocksProps) {
  const blocks = plans.filter((plan) => plan.kind === 'block')
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {blocks.map((plan) => (
        <div key={plan.id} className="rounded-xl border border-[#1d2a46] bg-[#0f2038] p-4 space-y-4">
          <div>
            <div className="text-lg font-semibold">{plan.title}</div>
            <div className="text-sm text-[#a6b3cc]">{plan.description}</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">${plan.displayPrice.toLocaleString()}</div>
            <div className="text-sm text-[#a6b3cc]">{plan.hours} hours</div>
          </div>
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1d2a46] bg-[#13203a] px-4 py-2 font-semibold hover:border-[#29406d]"
            onClick={() => onSelect(plan.id)}
          >
            <span>🛒</span>
            Add
          </button>
        </div>
      ))}
    </div>
  )
}

