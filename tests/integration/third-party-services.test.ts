/**
 * Integration Tests for Third-Party Services
 * Tests all external service integrations to ensure they're properly configured
 */

import { test, expect } from '@playwright/test';

test.describe('Third-Party Service Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up any necessary authentication or configuration
  });

  test('Convex Database Integration', async ({ page }) => {
    // Test Convex real-time database connection
    await page.goto('/dashboard/test-communications');
    
    // Check if Convex is connected by verifying real-time data loading
    await expect(page.locator('[data-testid="convex-status"]')).toContainText('Connected');
    
    // Test basic CRUD operations
    await page.click('button:text("Test Database Connection")');
    await expect(page.locator('[data-testid="db-test-result"]')).toContainText('Success');
    
    // Verify real-time updates work
    await page.click('button:text("Test Real-time Updates")');
    await expect(page.locator('[data-testid="realtime-status"]')).toContainText('Working');
  });

  test('Clerk Authentication Integration', async ({ page }) => {
    // Test Clerk authentication flow
    await page.goto('/');
    
    // Check if Clerk is properly loaded
    await expect(page.locator('[data-clerk-loaded]')).toBeVisible();
    
    // Test sign-in redirect
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/sign-in/);
    
    // Verify Clerk authentication UI loads
    await expect(page.locator('.cl-rootBox')).toBeVisible();
    
    // Test JWT token configuration
    await page.goto('/dashboard/test-communications');
    await page.click('button:text("Test JWT Token")');
    await expect(page.locator('[data-testid="jwt-status"]')).toContainText('Valid');
  });

  test('Stripe Payment Integration', async ({ page }) => {
    await page.goto('/dashboard/test-communications');
    
    // Test Stripe API connection
    await page.click('button:text("Test Stripe Connection")');
    await expect(page.locator('[data-testid="stripe-status"]')).toContainText('Connected');
    
    // Test payment session creation
    await page.click('button:text("Test Payment Session")');
    await expect(page.locator('[data-testid="payment-session-status"]')).toContainText('Created');
    
    // Verify webhook endpoint configuration
    await page.click('button:text("Test Stripe Webhook")');
    await expect(page.locator('[data-testid="webhook-status"]')).toContainText('Configured');
  });

  test('SendGrid Email Integration', async ({ page }) => {
    await page.goto('/dashboard/test-communications');
    
    // Test SendGrid API connection
    await page.click('button:text("Test Email Service")');
    await expect(page.locator('[data-testid="email-service-status"]')).toContainText('Connected');
    
    // Test email template functionality
    await page.selectOption('select[name="emailTemplate"]', 'welcome-student');
    await page.fill('input[name="testEmail"]', 'test@example.com');
    await page.click('button:text("Send Test Email")');
    
    await expect(page.locator('[data-testid="email-send-status"]')).toContainText('Sent');
    
    // Verify email delivery status
    await page.waitForTimeout(2000); // Wait for delivery status
    await expect(page.locator('[data-testid="delivery-status"]')).toContainText('delivered');
  });

  test('Twilio SMS Integration', async ({ page }) => {
    await page.goto('/dashboard/test-communications');
    
    // Test Twilio API connection
    await page.click('button:text("Test SMS Service")');
    await expect(page.locator('[data-testid="sms-service-status"]')).toContainText('Connected');
    
    // Test SMS sending
    await page.fill('input[name="testPhone"]', '+15551234567');
    await page.fill('textarea[name="testMessage"]', 'Test SMS from MentoLoop integration test');
    await page.click('button:text("Send Test SMS")');
    
    await expect(page.locator('[data-testid="sms-send-status"]')).toContainText('Sent');
    
    // Verify SMS delivery status
    await page.waitForTimeout(3000); // Wait for delivery status
    await expect(page.locator('[data-testid="sms-delivery-status"]')).toContainText('delivered');
  });

  test('OpenAI API Integration', async ({ page }) => {
    await page.goto('/dashboard/ai-matching-test');
    
    // Test OpenAI API connection
    await page.click('button:text("Test OpenAI Connection")');
    await expect(page.locator('[data-testid="openai-status"]')).toContainText('Connected');
    
    // Test AI matching functionality
    await page.click('button:text("Load Sample Student")');
    await page.click('button:text("Load Sample Preceptors")');
    await page.click('button:text("Run AI Analysis")');
    
    // Wait for AI processing
    await page.waitForSelector('[data-testid="ai-results"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="ai-results"]')).toBeVisible();
    
    // Verify AI response quality
    const score = await page.locator('[data-testid="ai-score"]').textContent();
    expect(parseFloat(score || '0')).toBeGreaterThan(0);
    expect(parseFloat(score || '0')).toBeLessThanOrEqual(10);
  });

  test('Google Gemini API Integration', async ({ page }) => {
    await page.goto('/dashboard/ai-matching-test');
    
    // Test Gemini API as backup AI service
    await page.click('button:text("Test Gemini Connection")');
    await expect(page.locator('[data-testid="gemini-status"]')).toContainText('Connected');
    
    // Test Gemini AI analysis
    await page.click('button:text("Force Gemini Analysis")');
    await page.click('button:text("Load Sample Student")');
    await page.click('button:text("Run AI Analysis")');
    
    await page.waitForSelector('[data-testid="gemini-results"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="gemini-results"]')).toBeVisible();
    
    // Verify Gemini response
    const geminiScore = await page.locator('[data-testid="gemini-score"]').textContent();
    expect(parseFloat(geminiScore || '0')).toBeGreaterThan(0);
  });

  test('Service Failover and Redundancy', async ({ page }) => {
    await page.goto('/dashboard/ai-matching-test');
    
    // Test AI service failover
    await page.check('input[name="simulateOpenAIFailure"]');
    await page.click('button:text("Load Sample Student")');
    await page.click('button:text("Run AI Analysis")');
    
    // Should automatically failover to Gemini
    await page.waitForSelector('[data-testid="failover-status"]');
    await expect(page.locator('[data-testid="failover-status"]')).toContainText('Gemini');
    await expect(page.locator('[data-testid="ai-results"]')).toBeVisible();
  });

  test('Webhook Security and Validation', async ({ page }) => {
    await page.goto('/dashboard/test-communications');
    
    // Test Clerk webhook security
    await page.click('button:text("Test Clerk Webhook Security")');
    await expect(page.locator('[data-testid="clerk-webhook-status"]')).toContainText('Secure');
    
    // Test Stripe webhook security
    await page.click('button:text("Test Stripe Webhook Security")');
    await expect(page.locator('[data-testid="stripe-webhook-status"]')).toContainText('Secure');
    
    // Verify webhook signature validation
    await page.click('button:text("Test Invalid Webhook")');
    await expect(page.locator('[data-testid="invalid-webhook-status"]')).toContainText('Rejected');
  });

  test('Rate Limiting and API Quotas', async ({ page }) => {
    await page.goto('/dashboard/test-communications');
    
    // Test API rate limiting
    await page.click('button:text("Test Rate Limiting")');
    
    // Make multiple rapid requests
    for (let i = 0; i < 5; i++) {
      await page.click('button:text("Rapid API Call")');
      await page.waitForTimeout(100);
    }
    
    // Should show rate limiting in effect
    await expect(page.locator('[data-testid="rate-limit-status"]')).toContainText('Active');
    
    // Test quota monitoring
    await page.click('button:text("Check API Quotas")');
    await expect(page.locator('[data-testid="quota-status"]')).toBeVisible();
  });

  test('Error Handling and Recovery', async ({ page }) => {
    await page.goto('/dashboard/test-communications');
    
    // Test network timeout handling
    await page.click('button:text("Simulate Network Timeout")');
    await expect(page.locator('[data-testid="timeout-error"]')).toContainText('Timeout handled');
    
    // Test service unavailable handling
    await page.click('button:text("Simulate Service Unavailable")');
    await expect(page.locator('[data-testid="service-error"]')).toContainText('Service error handled');
    
    // Test automatic retry logic
    await page.click('button:text("Test Retry Logic")');
    await expect(page.locator('[data-testid="retry-status"]')).toContainText('Retry successful');
  });

  test('Performance and Response Times', async ({ page }) => {
    await page.goto('/dashboard/test-communications');
    
    // Test API response times
    const startTime = Date.now();
    await page.click('button:text("Test API Performance")');
    await page.waitForSelector('[data-testid="performance-results"]');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    
    // Check individual service performance
    const emailTime = await page.locator('[data-testid="email-response-time"]').textContent();
    const smsTime = await page.locator('[data-testid="sms-response-time"]').textContent();
    const aiTime = await page.locator('[data-testid="ai-response-time"]').textContent();
    
    expect(parseFloat(emailTime || '0')).toBeLessThan(2000); // Email under 2s
    expect(parseFloat(smsTime || '0')).toBeLessThan(3000); // SMS under 3s
    expect(parseFloat(aiTime || '0')).toBeLessThan(15000); // AI under 15s
  });

  test('Data Consistency and Synchronization', async ({ page }) => {
    await page.goto('/dashboard/student/matches');
    
    // Test real-time data sync
    const initialMatchCount = await page.locator('[data-testid="match-card"]').count();
    
    // Trigger a data update from another source
    await page.evaluate(() => {
      // Simulate external data update
      window.dispatchEvent(new CustomEvent('external-data-update'));
    });
    
    // Wait for real-time update
    await page.waitForFunction(
      (initialCount) => {
        const currentCount = document.querySelectorAll('[data-testid="match-card"]').length;
        return currentCount !== initialCount;
      },
      initialMatchCount,
      { timeout: 10000 }
    );
    
    // Verify data consistency
    await expect(page.locator('[data-testid="data-sync-status"]')).toContainText('Synchronized');
  });

  test('Security and Compliance Validation', async ({ page }) => {
    await page.goto('/dashboard/admin');
    
    // Test HTTPS enforcement
    expect(page.url()).toMatch(/^https:/);
    
    // Test data encryption in transit
    await page.click('button:text("Test Encryption")');
    await expect(page.locator('[data-testid="encryption-status"]')).toContainText('TLS 1.2+');
    
    // Test audit logging
    await page.click('button:text("Test Audit Logging")');
    await expect(page.locator('[data-testid="audit-status"]')).toContainText('Active');
    
    // Verify HIPAA compliance features
    await page.click('button:text("Test HIPAA Compliance")');
    await expect(page.locator('[data-testid="hipaa-status"]')).toContainText('Compliant');
  });

  test('Monitoring and Alerting Systems', async ({ page }) => {
    await page.goto('/dashboard/admin');
    
    // Test system health monitoring
    await page.click('button:text("Check System Health")');
    await expect(page.locator('[data-testid="system-health"]')).toContainText('Healthy');
    
    // Test alert generation
    await page.click('button:text("Generate Test Alert")');
    await expect(page.locator('[data-testid="alert-generated"]')).toBeVisible();
    
    // Verify monitoring dashboards
    await page.goto('/dashboard/analytics');
    await expect(page.locator('[data-testid="monitoring-dashboard"]')).toBeVisible();
  });
});