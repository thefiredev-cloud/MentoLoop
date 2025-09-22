import { describe, it, expect } from 'vitest'
import {
  canAccessComprehensiveIntake,
  canAccessFormSection,
  getMembershipRequiredMessage,
  PaymentStatus,
} from '@/lib/payment-protection'

describe('payment-protection helpers', () => {
  const unpaidStatus: PaymentStatus = {
    hasPayment: false,
    membershipPlan: null,
    paidAt: null,
    loading: false,
  }

  const eliteStatus: PaymentStatus = {
    hasPayment: true,
    membershipPlan: 'elite',
    paidAt: Date.now(),
    loading: false,
    mentorfitUnlocked: false,
  }

  it('denies comprehensive intake access when payment missing', () => {
    expect(canAccessComprehensiveIntake(unpaidStatus)).toBe(false)
  })

  it('allows comprehensive intake access when payment satisfied', () => {
    expect(canAccessComprehensiveIntake(eliteStatus)).toBe(true)
  })

  it('gates mentorfit section by membership tier', () => {
    expect(canAccessFormSection(unpaidStatus, 'mentorfit')).toBe(false)
    expect(canAccessFormSection(eliteStatus, 'mentorfit')).toBe(true)
  })

  it('respects mentorfit unlocked override', () => {
    const unlockedStatus: PaymentStatus = {
      ...unpaidStatus,
      mentorfitUnlocked: true,
    }
    expect(canAccessFormSection(unlockedStatus, 'mentorfit')).toBe(true)
  })

  it('returns helpful membership messages', () => {
    expect(getMembershipRequiredMessage('matching-preferences')).toContain('Complete payment')
    expect(getMembershipRequiredMessage('mentorfit').toLowerCase()).toContain('elite')
  })
})
