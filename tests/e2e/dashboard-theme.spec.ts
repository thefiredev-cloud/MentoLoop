import { test, expect } from '@playwright/test'

const pages = [
  { name: 'landing home', url: '/' },
  { name: 'student dashboard', url: '/dashboard/student' },
  { name: 'billing', url: '/dashboard/billing' },
  { name: 'preceptor dashboard', url: '/dashboard/preceptor' },
  { name: 'ceu', url: '/dashboard/ceu' },
]

pages.forEach(({ name, url }) => {
  test(`semantic theme colors present on ${name}`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'networkidle' })
    const primary = page.locator('[class*="bg-primary"]')
    const mutedText = page.locator('[class*="text-muted-foreground"]')
    await expect(primary, `page ${name} should use primary token`).toHaveCountGreaterThan(0)
    await expect(mutedText, `page ${name} should use muted text token`).toHaveCountGreaterThan(0)
  })
})

