import { describe, it, expect, vi } from 'vitest'
import { CheckoutCoordinator } from '@/app/dashboard/billing/coordinators/CheckoutCoordinator'

const baseRequest = {
  planId: 'starter',
  stripePriceId: 'price_123',
  hours: 60,
  kind: 'block' as const,
  customerEmail: 'student@example.com',
  customerName: 'Alex Student',
}

describe('CheckoutCoordinator', () => {
  it('calls createStudentCheckoutSession with full payment defaults', async () => {
    const spy = vi.fn().mockResolvedValue({ url: 'https://stripe.test/session' })
    const coordinator = new CheckoutCoordinator({ createStudentCheckoutSession: spy })

    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    })

    await coordinator.launch(baseRequest)

    expect(window.location.href).toBe('https://stripe.test/session')
    Object.defineProperty(window, 'location', { writable: true, value: originalLocation })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        priceId: 'price_123',
        customerEmail: 'student@example.com',
        membershipPlan: 'starter',
        paymentOption: 'full',
      })
    )
  })

  it('passes a la carte hours and discount code', async () => {
    const spy = vi.fn().mockResolvedValue({ url: 'https://stripe.test/session' })
    const coordinator = new CheckoutCoordinator({ createStudentCheckoutSession: spy })

    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    })

    await coordinator.launch({
      ...baseRequest,
      planId: 'a_la_carte',
      kind: 'a_la_carte',
      stripePriceId: 'price_alacarte',
      hours: 45,
      discountCode: 'MENTO12345',
    })

    expect(window.location.href).toBe('https://stripe.test/session')
    Object.defineProperty(window, 'location', { writable: true, value: originalLocation })

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        priceId: 'price_alacarte',
        membershipPlan: 'a_la_carte',
        aLaCarteHours: 45,
        discountCode: 'MENTO12345',
      })
    )
  })

  it('switches to installment mode when provided', async () => {
    const spy = vi.fn().mockResolvedValue({ url: 'https://stripe.test/session' })
    const coordinator = new CheckoutCoordinator({ createStudentCheckoutSession: spy })

    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    })

    await coordinator.launch({ ...baseRequest, installmentPlan: 3 })

    expect(window.location.href).toBe('https://stripe.test/session')
    Object.defineProperty(window, 'location', { writable: true, value: originalLocation })

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentOption: 'installments',
        installmentPlan: 3,
      })
    )
  })
})

