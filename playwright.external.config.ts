import { defineConfig, devices } from '@playwright/test'
import { getE2EBaseUrl } from './tests/utils/base-url'

const externalBaseUrl = getE2EBaseUrl()

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**', '**/integration/**'],
  reporter: 'list',
  use: {
    baseURL: externalBaseUrl,
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

