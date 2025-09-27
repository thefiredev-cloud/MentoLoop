import { test, expect } from '@playwright/test'
test('trigger Sentry events via API endpoints', async ({ request }) => {
  const testRes = await request.get('/api/sentry-test')
  if (testRes.status() === 200) {
    const testJson = await testRes.json()
    console.log('Sentry test response:', testJson)
    expect(testJson.ok).toBe(true)
    expect(typeof testJson.messageId === 'string' || testJson.messageId === null).toBe(true)
    expect(typeof testJson.errorId === 'string' || testJson.errorId === null).toBe(true)
  } else {
    // Hardened prod may not expose this endpoint
    expect([404, 401, 403]).toContain(testRes.status())
  }

  const heartbeatRes = await request.get('/api/sentry-heartbeat')
  if (heartbeatRes.status() === 200) {
    const heartbeatJson = await heartbeatRes.json()
    console.log('Sentry heartbeat response:', heartbeatJson)
    expect(heartbeatJson.ok).toBe(true)
    expect(heartbeatJson.slug).toBe('mentoloop-heartbeat')
    expect(typeof heartbeatJson.checkInId === 'string' || heartbeatJson.checkInId === null).toBe(true)
  } else {
    expect([404, 401, 403]).toContain(heartbeatRes.status())
  }
})


