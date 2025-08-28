# Testing Documentation

## Overview
MentoLoop uses a comprehensive testing strategy including unit tests, integration tests, and end-to-end tests to ensure code quality and reliability.

## Testing Stack

- **Unit Tests**: Vitest
- **Integration Tests**: Vitest
- **E2E Tests**: Playwright
- **Test Utilities**: Testing Library, MSW (Mock Service Worker)

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── student-journey.spec.ts
│   ├── preceptor-journey.spec.ts
│   ├── ai-matching.spec.ts
│   └── payment-flow.spec.ts
├── unit/                   # Unit tests
│   ├── components/
│   │   ├── MessagesPage.test.tsx
│   │   └── StudentDashboard.test.tsx
│   ├── mentorfit.test.ts
│   └── messages.test.ts
└── integration/            # Integration tests
    └── third-party-integrations.test.ts
```

## Running Tests

### All Tests
```bash
npm run test          # Run Playwright E2E tests
npm run test:unit     # Run Vitest unit tests
npm run test:unit:run # Run Vitest once (CI mode)
```

### Specific Test Files
```bash
# E2E test
npx playwright test tests/e2e/student-journey.spec.ts

# Unit test
npm run test:unit -- tests/unit/mentorfit.test.ts

# With watch mode
npm run test:unit -- --watch
```

### Test Coverage
```bash
npm run test:unit -- --coverage
```

## Writing Tests

### Unit Tests

#### Component Testing
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StudentDashboard from '@/app/dashboard/student/page'

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard components', () => {
    render(<StudentDashboard />)
    expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    render(<StudentDashboard />)
    const button = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(button)
    
    expect(await screen.findByText('Success')).toBeInTheDocument()
  })
})
```

#### Function Testing
```typescript
import { describe, it, expect } from 'vitest'
import { calculateMatchScore } from '@/lib/matching'

describe('calculateMatchScore', () => {
  it('should return high score for compatible matches', () => {
    const student = { specialty: 'cardiology', location: 'TX' }
    const preceptor = { specialty: 'cardiology', location: 'TX' }
    
    const score = calculateMatchScore(student, preceptor)
    expect(score).toBeGreaterThan(0.8)
  })
})
```

### Integration Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { sendEmail } from '@/lib/email'
import { createPaymentSession } from '@/lib/stripe'

describe('Third-party Integrations', () => {
  it('should send welcome email', async () => {
    const mockSend = vi.fn().mockResolvedValue({ success: true })
    vi.mock('@sendgrid/mail', () => ({
      send: mockSend
    }))

    await sendEmail({
      to: 'user@example.com',
      subject: 'Welcome',
      content: 'Welcome to MentoLoop'
    })

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com'
      })
    )
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('Student Journey', () => {
  test('complete intake form', async ({ page }) => {
    await page.goto('/student-intake')
    
    // Fill personal information
    await page.fill('[name="fullName"]', 'John Doe')
    await page.fill('[name="email"]', 'john@example.com')
    await page.click('button:has-text("Next")')
    
    // Fill school information
    await page.fill('[name="schoolName"]', 'Test University')
    await page.selectOption('[name="degreeTrack"]', 'MSN')
    await page.click('button:has-text("Next")')
    
    // Submit form
    await page.click('button:has-text("Submit")')
    
    // Verify success
    await expect(page).toHaveURL('/dashboard/student')
    await expect(page.locator('h1')).toContainText('Welcome')
  })

  test('payment flow', async ({ page }) => {
    await page.goto('/dashboard/student/matches')
    await page.click('button:has-text("Accept Match")')
    
    // Stripe checkout
    await expect(page).toHaveURL(/checkout.stripe.com/)
    
    // Fill test card
    await page.fill('[placeholder="Card number"]', '4242424242424242')
    await page.fill('[placeholder="MM / YY"]', '12/25')
    await page.fill('[placeholder="CVC"]', '123')
    
    await page.click('button:has-text("Pay")')
    
    // Verify success
    await expect(page).toHaveURL('/dashboard/payment-success')
  })
})
```

## Test Data

### Mock Data
Create reusable test data in `tests/fixtures/`:

```typescript
// tests/fixtures/users.ts
export const mockStudent = {
  id: 'user_test123',
  email: 'student@test.com',
  fullName: 'Test Student',
  role: 'student'
}

export const mockPreceptor = {
  id: 'user_test456',
  email: 'preceptor@test.com',
  fullName: 'Test Preceptor',
  role: 'preceptor'
}
```

### Database Seeding
For E2E tests, seed test data:

```typescript
// tests/helpers/seed.ts
import { api } from '@/convex/_generated/api'

export async function seedTestData() {
  await convex.mutation(api.users.create, {
    email: 'test@example.com',
    role: 'student'
  })
}
```

## Mocking

### API Mocking
```typescript
import { vi } from 'vitest'

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isSignedIn: true, userId: 'test' }),
  useUser: () => ({ user: mockUser }),
}))
```

### Network Mocking (MSW)
```typescript
import { setupServer } from 'msw/node'
import { rest } from 'msw'

const server = setupServer(
  rest.post('/api/stripe-webhook', (req, res, ctx) => {
    return res(ctx.json({ received: true }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Test Environment

### Configuration Files

#### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
```

#### playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**', '**/integration/**'],
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
})
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit:run
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe`
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests independent and isolated

### 2. Assertions
- Use specific matchers
- Test both positive and negative cases
- Verify error handling
- Check accessibility

### 3. Performance
- Use `beforeAll` for expensive setup
- Clean up in `afterEach`
- Mock external dependencies
- Parallelize independent tests

### 4. Debugging

```bash
# Run tests with debugging
npm run test:unit -- --inspect

# Run specific test with verbose output
npm run test:unit -- --reporter=verbose

# Run Playwright with UI
npx playwright test --ui

# Debug specific Playwright test
npx playwright test --debug
```

### 5. Common Patterns

#### Wait for async operations
```typescript
// Vitest
import { waitFor } from '@testing-library/react'
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Playwright
await page.waitForSelector('text=Loaded')
```

#### Test error boundaries
```typescript
it('should handle errors gracefully', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation()
  
  render(<ComponentWithError />)
  expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  
  spy.mockRestore()
})
```

#### Test hooks
```typescript
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '@/hooks/useCounter'

it('should increment counter', () => {
  const { result } = renderHook(() => useCounter())
  
  act(() => {
    result.current.increment()
  })
  
  expect(result.current.count).toBe(1)
})
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout: `test.setTimeout(30000)`
   - Check for missing await statements
   - Verify mock implementations

2. **Flaky tests**
   - Use explicit waits instead of arbitrary delays
   - Ensure proper test isolation
   - Mock time-dependent operations

3. **Module resolution errors**
   - Check path aliases in config
   - Verify mock paths
   - Clear module cache

4. **State pollution**
   - Reset mocks between tests
   - Clear localStorage/sessionStorage
   - Reset global variables

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Jest Matchers](https://jestjs.io/docs/expect)