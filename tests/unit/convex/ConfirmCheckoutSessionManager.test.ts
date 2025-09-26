import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { ConfirmCheckoutSessionManager } from '@/convex/services/payments/ConfirmCheckoutSessionManager'

const createCtx = () => ({
  runMutation: vi.fn(),
}) as any

describe('ConfirmCheckoutSessionManager', () => {
  const updateMutation = Symbol('updateMutation')

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws when Stripe is not configured', async () => {
    const manager = new ConfirmCheckoutSessionManager({
      stripeSecretKey: undefined,
      updateMutation,
    })

    await expect(manager.confirmSession(createCtx(), 'sess_123')).rejects.toThrow('Stripe not configured')
  })

  it('marks attempts succeeded when Stripe confirms payment', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ payment_status: 'paid' }),
    })
    const ctx = createCtx()

    const manager = new ConfirmCheckoutSessionManager({
      stripeSecretKey: 'sk_test',
      updateMutation,
      fetchImpl: fetchMock,
    })

    const result = await manager.confirmSession(ctx, 'sess_paid')

    expect(result).toEqual({ confirmed: true, source: 'stripe' })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.stripe.com/v1/checkout/sessions/sess_paid',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer sk_test' },
      }),
    )
    expect(ctx.runMutation).toHaveBeenCalledWith(updateMutation, {
      stripeSessionId: 'sess_paid',
      status: 'succeeded',
      paidAt: 1700000000000,
    })
  })

  it('returns false when session is not yet paid', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ payment_status: 'unpaid', status: 'open' }),
    })
    const ctx = createCtx()

    const manager = new ConfirmCheckoutSessionManager({
      stripeSecretKey: 'sk_test',
      updateMutation,
      fetchImpl: fetchMock,
    })

    const result = await manager.confirmSession(ctx, 'sess_pending')

    expect(result).toEqual({ confirmed: false })
    expect(ctx.runMutation).not.toHaveBeenCalled()
  })

  it('optimistically marks succeeded when Stripe fetch fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })
    const ctx = createCtx()

    const manager = new ConfirmCheckoutSessionManager({
      stripeSecretKey: 'sk_test',
      updateMutation,
      fetchImpl: fetchMock,
    })

    const result = await manager.confirmSession(ctx, 'sess_optimistic')

    expect(result).toEqual({ confirmed: true, source: 'optimistic' })
    expect(ctx.runMutation).toHaveBeenCalledWith(updateMutation, {
      stripeSessionId: 'sess_optimistic',
      status: 'succeeded',
      paidAt: 1700000000000,
    })
  })

  it('falls back to succeeded when fetch throws', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network'))
    const ctx = createCtx()

    const manager = new ConfirmCheckoutSessionManager({
      stripeSecretKey: 'sk_test',
      updateMutation,
      fetchImpl: fetchMock,
    })

    const result = await manager.confirmSession(ctx, 'sess_fallback')

    expect(result).toEqual({ confirmed: true, source: 'fallback' })
    expect(ctx.runMutation).toHaveBeenCalledWith(updateMutation, {
      stripeSessionId: 'sess_fallback',
      status: 'succeeded',
      paidAt: 1700000000000,
    })
  })
})


