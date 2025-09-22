import { test, expect } from '@playwright/test'

const TEST_CHECKOUT_URL = 'https://example.com/checkout-test'

test.describe('Student intake payment (test mode)', () => {
  test('redirects to test checkout when override is set', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('studentIntakeCurrentStep', '4')
      sessionStorage.setItem('studentIntakeCompletedSteps', JSON.stringify([1, 2, 3]))
      sessionStorage.setItem('studentIntakeFormData', JSON.stringify({
        personalInfo: {},
        schoolInfo: {},
        rotationNeeds: {},
        paymentAgreement: {},
        matchingPreferences: {},
        mentorFitAssessment: {},
      }))
      ;(window as any).__MENTOLOOP_TEST_CHECKOUT__ = {
        sessionUrl: TEST_CHECKOUT_URL,
        sessionId: 'test_checkout_session',
      }
    })

    await page.goto('/student-intake')

    await page.getByTestId('select-plan-core').click()
    await page.getByTestId('terms-checkbox').click()
    await page.getByTestId('proceed-to-payment').click()

    await page.waitForURL(TEST_CHECKOUT_URL)
    expect(page.url()).toBe(TEST_CHECKOUT_URL)
  })
})
