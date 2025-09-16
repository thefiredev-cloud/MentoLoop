import { test, expect } from '@playwright/test'

test.describe('API smoke: health and GPT-5 routes', () => {
  test('health endpoint responds 200 JSON', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json).toBeTruthy()
  })

  test('gpt5 chat requires auth', async ({ request }) => {
    const res = await request.post('/api/gpt5', {
      data: { messages: [{ role: 'user', content: 'ping' }] }
    })
    expect([401, 403]).toContain(res.status())
  })

  test('gpt5 documentation requires auth', async ({ request }) => {
    const res = await request.post('/api/gpt5/documentation', {
      data: { sessionNotes: 'test', objectives: ['a'], performance: { strengths: [], improvements: [] } }
    })
    expect([401, 403]).toContain(res.status())
  })

  test('gpt5 function-calling requires auth', async ({ request }) => {
    const res = await request.post('/api/gpt5/function', {
      data: { tool: 'match', input: { query: 'test' } }
    })
    expect([401, 403]).toContain(res.status())
  })
})


