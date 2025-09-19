import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**', '**/integration/**'],
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://sandboxmentoloop.online',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})


