import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'tests/integration/third-party-integrations.test.ts'],
    exclude: ['tests/e2e/**/*', 'tests/integration/third-party-services.test.ts', 'node_modules/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/**/*.{js,ts,jsx,tsx}',
        'components/**/*.{js,ts,jsx,tsx}',
        'convex/**/*.{js,ts}',
        'lib/**/*.{js,ts}',
        'hooks/**/*.{js,ts}'
      ],
      exclude: [
        'tests/**/*',
        '**/*.d.ts',
        '**/.next/**/*',
        '**/node_modules/**/*',
        '**/coverage/**/*',
        'app/globals.css',
        '**/*.config.{js,ts}',
        'convex/_generated/**/*'
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})