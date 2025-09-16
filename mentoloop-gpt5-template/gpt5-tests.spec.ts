// Playwright E2E Testing for GPT-5 Features
// tests/gpt5-features.spec.ts

import { test, expect, Page } from '@playwright/test';
import { ClerkSetup } from './helpers/clerk-setup';

// Test configuration
test.describe.configure({ mode: 'parallel' });

// Helper to authenticate with Clerk
async function authenticateUser(page: Page, role: 'student' | 'preceptor' | 'admin') {
  const clerkSetup = new ClerkSetup();
  await clerkSetup.signIn(page, {
    email: `test-${role}@mentoloop.com`,
    password: process.env.TEST_PASSWORD!,
  });
  await page.waitForURL('**/dashboard');
}

// Helper to wait for AI response
async function waitForAIResponse(page: Page, timeout = 30000) {
  await page.waitForSelector('[data-testid="ai-response"]', { 
    state: 'visible',
    timeout 
  });
}

test.describe('GPT-5 Mentorship Matching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await authenticateUser(page, 'student');
  });

  test('should generate AI-powered mentor matches', async ({ page }) => {
    await page.goto('/dashboard/matching');
    
    // Fill preferences
    await page.fill('[data-testid="specialty-input"]', 'Critical Care');
    await page.selectOption('[data-testid="learning-style"]', 'visual');
    await page.click('[data-testid="availability-morning"]');
    await page.fill('[data-testid="clinical-goals"]', 'Improve assessment skills');
    
    // Set matching criteria
    await page.fill('[data-testid="location-radius"]', '25');
    await page.selectOption('[data-testid="experience-level"]', 'intermediate');
    
    // Trigger AI matching
    await page.click('[data-testid="find-matches-btn"]');
    
    // Wait for AI processing
    await waitForAIResponse(page);
    
    // Verify results
    const matches = await page.locator('[data-testid="match-card"]').count();
    expect(matches).toBeGreaterThan(0);
    expect(matches).toBeLessThanOrEqual(3); // Should return top 3
    
    // Check match details
    const firstMatch = page.locator('[data-testid="match-card"]').first();
    await expect(firstMatch).toContainText('Compatibility Score');
    await expect(firstMatch).toContainText('Learning Opportunities');
    
    // Test match selection
    await firstMatch.click();
    await page.click('[data-testid="select-match-btn"]');
    await expect(page.locator('[data-testid="match-confirmation"]')).toBeVisible();
  });

  test('should handle matching errors gracefully', async ({ page }) => {
    // Intercept API to simulate error
    await page.route('**/api/gpt5/match', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });
    
    await page.goto('/dashboard/matching');
    await page.click('[data-testid="find-matches-btn"]');
    
    // Should show error message and fallback option
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="try-basic-matching"]')).toBeVisible();
  });
});

test.describe('Real-time Chat Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await authenticateUser(page, 'student');
  });

  test('should provide streaming AI responses', async ({ page }) => {
    await page.goto('/dashboard/chat');
    
    // Send message
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('How do I prepare for my first clinical rotation?');
    await page.keyboard.press('Enter');
    
    // Verify streaming indicator
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
    
    // Wait for complete response
    await waitForAIResponse(page);
    
    // Verify response quality
    const response = page.locator('[data-testid="ai-response"]').last();
    await expect(response).toContainText('clinical');
    
    // Test conversation continuity
    await chatInput.fill('What specific skills should I focus on?');
    await page.keyboard.press('Enter');
    await waitForAIResponse(page);
    
    // Verify context maintained
    const messages = await page.locator('[data-testid="chat-message"]').count();
    expect(messages).toBeGreaterThanOrEqual(4); // User, AI, User, AI
  });

  test('should stop streaming on demand', async ({ page }) => {
    await page.goto('/dashboard/chat');
    
    // Send long-form request
    await page.fill('[data-testid="chat-input"]', 
      'Explain all nursing procedures in detail');
    await page.keyboard.press('Enter');
    
    // Wait for streaming to start
    await page.waitForSelector('[data-testid="typing-indicator"]');
    
    // Stop streaming
    await page.click('[data-testid="stop-streaming-btn"]');
    
    // Verify streaming stopped
    await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible();
  });
});

test.describe('Clinical Documentation Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await authenticateUser(page, 'preceptor');
  });

  test('should generate clinical documentation', async ({ page }) => {
    await page.goto('/dashboard/documentation');
    
    // Fill session details
    await page.fill('[data-testid="session-notes"]', 
      'Student demonstrated proper IV insertion technique');
    await page.click('[data-testid="objective-assessment"]');
    await page.click('[data-testid="objective-communication"]');
    
    // Add performance metrics
    await page.fill('[data-testid="strength-1"]', 'Strong clinical reasoning');
    await page.fill('[data-testid="improvement-1"]', 'Time management');
    
    // Generate documentation
    await page.click('[data-testid="generate-doc-btn"]');
    await waitForAIResponse(page);
    
    // Verify documentation generated
    const documentation = page.locator('[data-testid="generated-documentation"]');
    await expect(documentation).toBeVisible();
    await expect(documentation).toContainText('Objective Summary');
    await expect(documentation).toContainText('SMART Goals');
    
    // Test export functionality
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-pdf-btn"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('clinical-documentation');
  });
});

test.describe('AI Evaluation System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await authenticateUser(page, 'preceptor');
  });

  test('should generate comprehensive evaluations', async ({ page }) => {
    await page.goto('/dashboard/evaluations/new');
    
    // Select student and rotation
    await page.selectOption('[data-testid="student-select"]', 'student-123');
    await page.selectOption('[data-testid="rotation-select"]', 'rotation-456');
    await page.selectOption('[data-testid="eval-type"]', 'midterm');
    
    // Fill performance data
    const skills = ['Assessment', 'Documentation', 'Medication Admin'];
    for (const skill of skills) {
      await page.fill(`[data-testid="skill-${skill.toLowerCase().replace(' ', '-')}"]`, '85');
    }
    
    // Add notes
    await page.fill('[data-testid="preceptor-notes"]', 
      'Student shows consistent improvement in clinical skills');
    
    // Generate evaluation
    await page.click('[data-testid="generate-eval-btn"]');
    await waitForAIResponse(page, 45000); // Longer timeout for complex generation
    
    // Verify evaluation content
    const evaluation = page.locator('[data-testid="evaluation-content"]');
    await expect(evaluation).toContainText('Performance Summary');
    await expect(evaluation).toContainText('Competency Assessment');
    await expect(evaluation).toContainText('Recommendations');
    
    // Test revision capability
    await page.click('[data-testid="revise-eval-btn"]');
    await page.fill('[data-testid="revision-notes"]', 'Add more detail on communication skills');
    await page.click('[data-testid="regenerate-btn"]');
    await waitForAIResponse(page);
    
    // Verify revision applied
    await expect(evaluation).toContainText('communication');
  });
});

test.describe('Learning Path Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await authenticateUser(page, 'student');
  });

  test('should create personalized learning paths', async ({ page }) => {
    await page.goto('/dashboard/learning-path');
    
    // Complete assessment
    await page.click('[data-testid="start-assessment-btn"]');
    
    // Fill assessment questions
    const questions = await page.locator('[data-testid^="assessment-q"]').all();
    for (const question of questions) {
      await question.locator('input[type="radio"]').first().click();
    }
    
    // Set goals
    await page.fill('[data-testid="career-goals"]', 'Become ICU nurse specialist');
    await page.fill('[data-testid="hours-per-week"]', '20');
    
    // Generate path
    await page.click('[data-testid="generate-path-btn"]');
    await waitForAIResponse(page, 60000); // Longer timeout
    
    // Verify learning path
    const pathContainer = page.locator('[data-testid="learning-path"]');
    await expect(pathContainer).toBeVisible();
    
    // Check weekly milestones
    const weeks = await page.locator('[data-testid^="week-"]').count();
    expect(weeks).toBeGreaterThanOrEqual(12);
    
    // Verify interactive features
    const firstWeek = page.locator('[data-testid="week-1"]');
    await firstWeek.click();
    await expect(page.locator('[data-testid="week-1-details"]')).toBeVisible();
    
    // Test progress tracking
    await page.click('[data-testid="mark-complete-week-1"]');
    await expect(firstWeek).toHaveClass(/completed/);
  });
});

test.describe('AI Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await authenticateUser(page, 'student');
  });

  test('should provide AI-enhanced search results', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open search
    await page.click('[data-testid="search-btn"]');
    
    // Perform search
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('best practices for patient communication');
    await page.keyboard.press('Enter');
    
    // Wait for AI-enhanced results
    await waitForAIResponse(page);
    
    // Verify results
    const results = await page.locator('[data-testid="search-result"]').count();
    expect(results).toBeGreaterThan(0);
    
    // Check result quality
    const firstResult = page.locator('[data-testid="search-result"]').first();
    await expect(firstResult).toContainText('communication');
    await expect(firstResult.locator('[data-testid="relevance-score"]')).toBeVisible();
    
    // Test filtering
    await page.click('[data-testid="filter-resources"]');
    const filteredResults = await page.locator('[data-testid="search-result"]').count();
    expect(filteredResults).toBeLessThanOrEqual(results);
  });
});

test.describe('Performance and Security', () => {
  test('should handle rate limiting gracefully', async ({ page }) => {
    await page.goto('/');
    await authenticateUser(page, 'student');
    await page.goto('/dashboard/chat');
    
    // Send multiple rapid requests
    const chatInput = page.locator('[data-testid="chat-input"]');
    for (let i = 0; i < 10; i++) {
      await chatInput.fill(`Test message ${i}`);
      await page.keyboard.press('Enter');
    }
    
    // Should show rate limit message
    await expect(page.locator('[data-testid="rate-limit-warning"]')).toBeVisible();
  });

  test('should validate and sanitize inputs', async ({ page }) => {
    await page.goto('/');
    await authenticateUser(page, 'student');
    await page.goto('/dashboard/chat');
    
    // Try XSS injection
    const maliciousInput = '<script>alert("XSS")</script>';
    await page.fill('[data-testid="chat-input"]', maliciousInput);
    await page.keyboard.press('Enter');
    
    // Verify sanitization
    await waitForAIResponse(page);
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages.last()).not.toContainText('<script>');
  });

  test('should maintain HIPAA compliance', async ({ page }) => {
    await page.goto('/');
    await authenticateUser(page, 'preceptor');
    await page.goto('/dashboard/documentation');
    
    // Try to include PHI
    await page.fill('[data-testid="session-notes"]', 
      'Patient John Doe, SSN 123-45-6789');
    await page.click('[data-testid="generate-doc-btn"]');
    
    // Should show warning
    await expect(page.locator('[data-testid="phi-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="phi-warning"]'))
      .toContainText('Remove identifying information');
  });
});
