import { describe, expect, it } from 'vitest'
import { IdempotencyKeyManager } from '@/convex/services/payments/IdempotencyKeyManager'

describe('IdempotencyKeyManager', () => {
  const manager = new IdempotencyKeyManager()

  it('produces stable digest regardless of param order', () => {
    const paramsA = { b: 'two', a: 'one' }
    const paramsB = { a: 'one', b: 'two' }

    expect(manager.compute('prefix', 'seed', paramsA)).toEqual(
      manager.compute('prefix', 'seed', paramsB),
    )
  })

  it('sanitizes seed values for safety', () => {
    const key = manager.compute('prefix', 'user@example.com', {})
    expect(key).toMatch(/^prefix_user_example_com_/)
  })

  it('exposes fixed helper for static ids', () => {
    expect(IdempotencyKeyManager.fixed('coupon', 'NP12345')).toBe('coupon_NP12345')
  })
})


