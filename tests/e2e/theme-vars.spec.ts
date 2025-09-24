import { test, expect } from '@playwright/test'

test.describe('Theme CSS variables', () => {
  test('primary and accent variables are set', async ({ page }) => {
    await page.goto('/')
    const primary = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())
    const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())
    const background = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--background').trim())
    expect(primary).toBeTruthy()
    expect(accent).toBeTruthy()
    expect(background).toBeTruthy()
    // Expect the blue/green palette numbers we define in globals.css
    expect(primary.startsWith('214')).toBeTruthy()
    expect(accent.startsWith('158')).toBeTruthy()
  })
})


