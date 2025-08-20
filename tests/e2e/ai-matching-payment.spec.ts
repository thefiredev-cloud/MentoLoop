import { test, expect } from '@playwright/test';

test.describe('AI Matching & Payment Processing E2E Tests', () => {

  test('AI matching algorithm execution and results', async ({ page }) => {
    // Navigate to AI matching test interface
    await page.goto('/dashboard/ai-matching-test');
    
    // Verify AI matching test lab is loaded
    await expect(page.locator('h1')).toContainText('AI Matching Test Lab');
    
    // Test with sample student profile
    await page.click('button:text("Load Sample Student")');
    await expect(page.locator('[data-testid="student-profile"]')).toBeVisible();
    
    // Load sample preceptors
    await page.click('button:text("Load Sample Preceptors")');
    await expect(page.locator('[data-testid="preceptor-list"]')).toBeVisible();
    
    // Run AI matching
    await page.click('button:text("Run AI Matching")');
    
    // Wait for AI processing
    await expect(page.locator('[data-testid="ai-processing"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-processing"]')).not.toBeVisible({ timeout: 30000 });
    
    // Verify results
    await expect(page.locator('[data-testid="match-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="mentorfit-score"]')).toBeVisible();
    
    // Check that scores are within valid range (0-10)
    const scores = await page.locator('[data-testid="mentorfit-score"]').allTextContents();
    scores.forEach(score => {
      const numericScore = parseFloat(score);
      expect(numericScore).toBeGreaterThanOrEqual(0);
      expect(numericScore).toBeLessThanOrEqual(10);
    });
  });

  test('MentorFit compatibility analysis', async ({ page }) => {
    await page.goto('/dashboard/ai-matching-test');
    
    // Load specific profiles for compatibility testing
    await page.click('button:text("Custom Profiles")');
    
    // Create student profile with specific learning style
    await page.selectOption('select[name="studentLearningStyle"]', 'hands-on');
    await page.selectOption('select[name="studentSpecialty"]', 'family-medicine');
    await page.selectOption('select[name="studentExperience"]', 'beginner');
    
    // Create preceptor profile with matching teaching style
    await page.selectOption('select[name="preceptorTeachingStyle"]', 'hands-on');
    await page.selectOption('select[name="preceptorSpecialty"]', 'family-medicine');
    await page.selectOption('select[name="preceptorExperience"]', 'expert');
    
    await page.click('button:text("Analyze Compatibility")');
    
    // Wait for analysis
    await page.waitForSelector('[data-testid="compatibility-analysis"]');
    
    // Verify high compatibility score for matching profiles
    const compatibilityScore = await page.locator('[data-testid="compatibility-score"]').textContent();
    const score = parseFloat(compatibilityScore || '0');
    expect(score).toBeGreaterThan(7.5); // Expecting high compatibility
    
    // Check detailed analysis
    await expect(page.locator('[data-testid="learning-style-match"]')).toContainText('High');
    await expect(page.locator('[data-testid="specialty-match"]')).toContainText('Perfect');
  });

  test('Payment processing with Stripe integration', async ({ page }) => {
    // Start from student matches page
    await page.goto('/dashboard/student/matches');
    
    // Select a match
    await page.click('[data-testid="match-card"]:first-child');
    
    // Accept the match to trigger payment
    await page.click('button:text("Accept Match")');
    
    // Verify payment modal opens
    await expect(page.locator('[data-testid="payment-modal"]')).toBeVisible();
    
    // Check pricing tiers are displayed
    await expect(page.locator('[data-testid="basic-tier"]')).toBeVisible();
    await expect(page.locator('[data-testid="premium-tier"]')).toBeVisible();
    await expect(page.locator('[data-testid="enterprise-tier"]')).toBeVisible();
    
    // Select premium tier
    await page.click('[data-testid="premium-tier"] button');
    
    // Verify Stripe payment form loads
    await expect(page.locator('iframe[name^="__privateStripeFrame"]')).toBeVisible();
    
    // Note: In a real test environment, you'd use Stripe's test card numbers
    // For now, we'll just verify the form structure
    await expect(page.locator('button:text("Pay")')).toBeVisible();
  });

  test('Payment success and failure scenarios', async ({ page }) => {
    await page.goto('/dashboard/student/matches');
    
    // Mock successful payment scenario
    await page.route('**/api/payments/create-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'cs_test_successful_payment',
          url: 'https://checkout.stripe.com/pay/cs_test_successful_payment'
        })
      });
    });
    
    await page.click('[data-testid="match-card"]:first-child');
    await page.click('button:text("Accept Match")');
    await page.click('[data-testid="premium-tier"] button');
    
    // Verify redirect to Stripe
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
    
    // Test payment failure scenario
    await page.goto('/dashboard/student/matches');
    
    await page.route('**/api/payments/create-session', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Payment processing failed'
        })
      });
    });
    
    await page.click('[data-testid="match-card"]:first-child');
    await page.click('button:text("Accept Match")');
    await page.click('[data-testid="premium-tier"] button');
    
    // Verify error handling
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-error"]')).toContainText('Payment processing failed');
  });

  test('Email automation triggers', async ({ page }) => {
    await page.goto('/dashboard/test-communications');
    
    // Test welcome email for new student
    await page.click('button:text("Test Student Welcome Email")');
    
    await page.fill('input[name="recipientEmail"]', 'test.student@example.com');
    await page.fill('input[name="studentName"]', 'Test Student');
    
    await page.click('button:text("Send Test Email")');
    
    // Verify email sent
    await expect(page.locator('[data-testid="email-status"]')).toContainText('Email sent successfully');
    
    // Test match notification email
    await page.click('button:text("Test Match Notification")');
    
    await page.fill('input[name="recipientEmail"]', 'dr.preceptor@example.com');
    await page.fill('input[name="studentName"]', 'Test Student');
    await page.fill('input[name="preceptorName"]', 'Dr. Preceptor');
    
    await page.click('button:text("Send Test Email")');
    
    await expect(page.locator('[data-testid="email-status"]')).toContainText('Email sent successfully');
  });

  test('SMS automation triggers', async ({ page }) => {
    await page.goto('/dashboard/test-communications');
    
    // Test SMS notification
    await page.click('button:text("Test SMS Notification")');
    
    await page.fill('input[name="recipientPhone"]', '+15551234567');
    await page.fill('input[name="message"]', 'Test SMS: New match found for your rotation!');
    
    await page.click('button:text("Send Test SMS")');
    
    // Verify SMS sent
    await expect(page.locator('[data-testid="sms-status"]')).toContainText('SMS sent successfully');
    
    // Check delivery status
    await page.waitForTimeout(2000); // Wait for delivery status update
    await expect(page.locator('[data-testid="delivery-status"]')).toContainText('delivered');
  });

  test('AI service redundancy and failover', async ({ page }) => {
    await page.goto('/dashboard/ai-matching-test');
    
    // Mock OpenAI service failure
    await page.route('**/api/ai/openai', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service unavailable' })
      });
    });
    
    // Mock Gemini as backup service
    await page.route('**/api/ai/gemini', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          analysis: 'Backup AI analysis completed',
          score: 8.5,
          reasoning: 'Strong compatibility based on learning styles and experience'
        })
      });
    });
    
    await page.click('button:text("Load Sample Student")');
    await page.click('button:text("Load Sample Preceptors")');
    await page.click('button:text("Run AI Matching")');
    
    // Wait for processing
    await page.waitForSelector('[data-testid="match-results"]');
    
    // Verify backup service was used
    await expect(page.locator('[data-testid="ai-service-used"]')).toContainText('Gemini');
    await expect(page.locator('[data-testid="match-results"]')).toBeVisible();
  });

  test('Real-time match updates via Convex', async ({ page }) => {
    await page.goto('/dashboard/student/matches');
    
    // Monitor for real-time updates
    const initialMatchCount = await page.locator('[data-testid="match-card"]').count();
    
    // Simulate new match creation via API
    await page.route('**/api/matches/create', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new_match_123',
          preceptorName: 'Dr. New Match',
          mentorFitScore: 9.2,
          specialty: 'family-medicine'
        })
      });
    });
    
    // Trigger match creation
    await page.evaluate(() => {
      // This would typically be done through admin interface or automated matching
      fetch('/api/matches/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'current_student_id' })
      });
    });
    
    // Wait for real-time update
    await page.waitForFunction(
      (initialCount) => document.querySelectorAll('[data-testid="match-card"]').length > initialCount,
      initialMatchCount,
      { timeout: 10000 }
    );
    
    // Verify new match appeared
    const newMatchCount = await page.locator('[data-testid="match-card"]').count();
    expect(newMatchCount).toBeGreaterThan(initialMatchCount);
  });

  test('Performance testing for AI matching speed', async ({ page }) => {
    await page.goto('/dashboard/ai-matching-test');
    
    // Load larger dataset
    await page.click('button:text("Load 50 Preceptors")');
    
    const startTime = Date.now();
    
    await page.click('button:text("Load Sample Student")');
    await page.click('button:text("Run AI Matching")');
    
    // Wait for results
    await page.waitForSelector('[data-testid="match-results"]');
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Verify reasonable processing time (should be under 30 seconds)
    expect(processingTime).toBeLessThan(30000);
    
    // Verify all matches processed
    const matchCount = await page.locator('[data-testid="match-result-item"]').count();
    expect(matchCount).toBe(50);
    
    // Check performance metrics
    await expect(page.locator('[data-testid="processing-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="matches-per-second"]')).toBeVisible();
  });
});