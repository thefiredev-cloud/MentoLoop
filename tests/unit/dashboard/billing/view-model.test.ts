import { describe, it, expect } from 'vitest'
import { StudentBillingViewModel, type BillingPlan } from '@/app/dashboard/billing/view-models/StudentBillingViewModel'

const plans: BillingPlan[] = [
  {
    id: 'starter',
    kind: 'block',
    title: 'Add 60 hours',
    description: 'Popular starter',
    hours: 60,
    displayPrice: 695,
    stripePriceId: 'price_starter',
  },
  {
    id: 'a_la_carte',
    kind: 'a_la_carte',
    title: 'A la carte',
    description: 'Flexible',
    hours: 0,
    displayPrice: 0,
    stripePriceId: 'price_alacarte',
  },
]

const buildViewModel = () =>
  new StudentBillingViewModel({
    credits: { totalRemaining: 96, totalAllocated: 120 },
    plans,
    unitPrice: 14.95,
    aLaCarteMinHours: 30,
  })

describe('StudentBillingViewModel', () => {
  it('derives KPIs from hour credits', () => {
    const vm = buildViewModel()
    const kpis = vm.deriveKpis()
    expect(kpis).toEqual({
      hoursInBank: 96,
      hoursUsed: 24,
      hoursRemaining: 72,
    })
  })

  it('creates block cart item with plan defaults', () => {
    const vm = buildViewModel()
    const item = vm.createCartItem('starter')
    expect(item).toEqual({ planId: 'starter', kind: 'block', hours: 60, amount: 695 })
  })

  it('creates a la carte cart item with minimum hours', () => {
    const vm = buildViewModel()
    const item = vm.createCartItem('a_la_carte')
    expect(item).toEqual({ planId: 'a_la_carte', kind: 'a_la_carte', hours: 30, amount: 30 * 14.95 })
  })

  it('respects override hours for a la carte', () => {
    const vm = buildViewModel()
    const item = vm.createCartItem('a_la_carte', 45)
    expect(item).toEqual({ planId: 'a_la_carte', kind: 'a_la_carte', hours: 45, amount: 45 * 14.95 })
  })

  it('applies NP12345 discount as free checkout note', () => {
    const vm = buildViewModel()
    const totals = vm.computeTotals([{ planId: 'starter', kind: 'block', hours: 60, amount: 695 }], 0.0825, 'NP12345')
    expect(totals.subtotal).toBe(695)
    expect(totals.discount).toBe(695)
    expect(totals.total).toBeCloseTo(0)
    expect(totals.note).toContain('NP12345')
  })

  it('applies penny checkout discount for MENTO12345', () => {
    const vm = buildViewModel()
    const totals = vm.computeTotals([{ planId: 'starter', kind: 'block', hours: 60, amount: 695 }], 0, 'MENTO12345')
    expect(totals.discount).toBeCloseTo(694.99, 2)
    expect(totals.total).toBeCloseTo(0.01, 2)
    expect(totals.note).toContain('MENTO12345')
  })

  it('returns subtotal when discount code unrecognized', () => {
    const vm = buildViewModel()
    const totals = vm.computeTotals([{ planId: 'starter', kind: 'block', hours: 60, amount: 695 }], 0.0825, 'INVALID')
    expect(totals.discount).toBe(0)
    expect(totals.note).toContain('not recognized')
  })
})

