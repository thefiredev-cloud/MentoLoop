import { test, expect, Page } from '@playwright/test';

test.describe('Clinical Hours Tracking E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate as a student
    await page.goto('/sign-in');
    
    // Fill in test credentials
    await page.fill('input[name="identifier"]', 'test.student@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('student can access clinical hours page', async ({ page }) => {
    // Navigate to clinical hours
    await page.click('text=Clinical Hours');
    await expect(page).toHaveURL('/dashboard/student/hours');
    
    // Check for hours tracking interface
    await expect(page.locator('h1')).toContainText(/clinical hours|hours tracking/i);
    
    // Should see hours summary
    await expect(page.locator('[data-testid="hours-summary"]')).toBeVisible();
    
    // Should see log hours button
    await expect(page.locator('[data-testid="log-hours-button"]')).toBeVisible();
  });

  test('student can log new clinical hours', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Click log hours button
    await page.click('[data-testid="log-hours-button"]');
    
    // Should open hours logging form
    await expect(page.locator('[data-testid="hours-form"]')).toBeVisible();
    
    // Fill in hours details
    await page.selectOption('[data-testid="rotation-select"]', 'family-medicine');
    await page.fill('[data-testid="date-input"]', '2025-01-15');
    await page.fill('[data-testid="start-time"]', '08:00');
    await page.fill('[data-testid="end-time"]', '17:00');
    
    // Add activities
    await page.check('[data-testid="activity-patient-care"]');
    await page.check('[data-testid="activity-procedures"]');
    
    // Add description
    await page.fill('[data-testid="description"]', 'Completed patient consultations and assisted with minor procedures');
    
    // Add learning objectives met
    await page.fill('[data-testid="learning-objectives"]', 'Practiced patient communication and clinical assessment skills');
    
    // Submit hours
    await page.click('[data-testid="submit-hours"]');
    
    // Should see success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/hours logged successfully/i);
    
    // Should return to hours overview
    await expect(page).toHaveURL('/dashboard/student/hours');
    
    // Should see the new entry in hours log
    await expect(page.locator('[data-testid="hours-entry"]').first()).toContainText('family-medicine');
    await expect(page.locator('[data-testid="hours-entry"]').first()).toContainText('9.0'); // 8am-5pm = 9 hours
  });

  test('student can view detailed hours breakdown by rotation', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Should see hours breakdown by rotation type
    await expect(page.locator('[data-testid="rotation-breakdown"]')).toBeVisible();
    
    // Check for different rotation types
    const rotationTypes = ['family-medicine', 'pediatrics', 'internal-medicine', 'emergency-medicine'];
    
    for (const rotation of rotationTypes) {
      const rotationCard = page.locator(`[data-testid="rotation-${rotation}"]`);
      if (await rotationCard.isVisible()) {
        // Should show hours completed for this rotation
        await expect(rotationCard.locator('[data-testid="hours-completed"]')).toBeVisible();
        await expect(rotationCard.locator('[data-testid="hours-required"]')).toBeVisible();
        await expect(rotationCard.locator('[data-testid="progress-bar"]')).toBeVisible();
      }
    }
  });

  test('student can edit existing hours entry', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Find first hours entry
    const firstEntry = page.locator('[data-testid="hours-entry"]').first();
    await expect(firstEntry).toBeVisible();
    
    // Click edit button
    await firstEntry.locator('[data-testid="edit-hours"]').click();
    
    // Should open edit form with existing data
    await expect(page.locator('[data-testid="hours-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-title"]')).toContainText(/edit/i);
    
    // Modify description
    await page.fill('[data-testid="description"]', 'Updated: Completed additional patient consultations');
    
    // Update learning objectives
    await page.fill('[data-testid="learning-objectives"]', 'Enhanced diagnostic skills and patient rapport');
    
    // Save changes
    await page.click('[data-testid="save-hours"]');
    
    // Should see update confirmation
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/updated successfully/i);
    
    // Should see updated information
    await expect(page.locator('[data-testid="hours-entry"]').first()).toContainText('Updated: Completed additional');
  });

  test('student can delete hours entry with confirmation', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Get initial count of entries
    const initialCount = await page.locator('[data-testid="hours-entry"]').count();
    
    if (initialCount > 0) {
      // Click delete on first entry
      await page.locator('[data-testid="hours-entry"]').first().locator('[data-testid="delete-hours"]').click();
      
      // Should show confirmation dialog
      await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-confirmation"]')).toContainText(/are you sure/i);
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete"]');
      
      // Should see success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText(/deleted successfully/i);
      
      // Should have one fewer entry
      const newCount = await page.locator('[data-testid="hours-entry"]').count();
      expect(newCount).toBe(initialCount - 1);
    }
  });

  test('student can filter hours by date range', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Open date filter
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="date-filter"]')).toBeVisible();
    
    // Set date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    await page.fill('[data-testid="start-date"]', thirtyDaysAgo.toISOString().split('T')[0]);
    await page.fill('[data-testid="end-date"]', today.toISOString().split('T')[0]);
    
    // Apply filter
    await page.click('[data-testid="apply-filter"]');
    
    // Should show filtered results
    await expect(page.locator('[data-testid="filter-applied"]')).toBeVisible();
    
    // Clear filter
    await page.click('[data-testid="clear-filter"]');
    await expect(page.locator('[data-testid="filter-applied"]')).not.toBeVisible();
  });

  test('student can filter hours by rotation type', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Open rotation filter
    await page.click('[data-testid="rotation-filter"]');
    
    // Select specific rotation
    await page.selectOption('[data-testid="rotation-select-filter"]', 'family-medicine');
    
    // Apply filter
    await page.click('[data-testid="apply-rotation-filter"]');
    
    // Should show only family medicine entries
    const visibleEntries = page.locator('[data-testid="hours-entry"]');
    const count = await visibleEntries.count();
    
    if (count > 0) {
      // All visible entries should be family medicine
      for (let i = 0; i < count; i++) {
        await expect(visibleEntries.nth(i)).toContainText('family-medicine');
      }
    }
  });

  test('hours validation and error handling', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    await page.click('[data-testid="log-hours-button"]');
    
    // Try to submit empty form
    await page.click('[data-testid="submit-hours"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="error-rotation"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-times"]')).toBeVisible();
    
    // Test invalid time range (end before start)
    await page.selectOption('[data-testid="rotation-select"]', 'family-medicine');
    await page.fill('[data-testid="date-input"]', '2025-01-15');
    await page.fill('[data-testid="start-time"]', '17:00');
    await page.fill('[data-testid="end-time"]', '08:00');
    
    await page.click('[data-testid="submit-hours"]');
    
    // Should show time validation error
    await expect(page.locator('[data-testid="error-time-range"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-time-range"]')).toContainText(/end time must be after start time/i);
    
    // Test excessive hours (more than 24 hours)
    await page.fill('[data-testid="start-time"]', '08:00');
    await page.fill('[data-testid="end-time"]', '07:00'); // Next day, would be 23 hours
    
    // Should handle this gracefully or show appropriate warning
    await page.click('[data-testid="submit-hours"]');
  });

  test('student can export hours to different formats', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Click export button
    await page.click('[data-testid="export-hours"]');
    
    // Should show export options
    await expect(page.locator('[data-testid="export-options"]')).toBeVisible();
    
    // Test PDF export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-pdf"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/clinical-hours.*\.pdf/);
    
    // Test CSV export
    const csvDownloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv"]');
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toMatch(/clinical-hours.*\.csv/);
  });

  test('student can view hours statistics and progress', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Should show overall statistics
    await expect(page.locator('[data-testid="total-hours"]')).toBeVisible();
    await expect(page.locator('[data-testid="hours-this-week"]')).toBeVisible();
    await expect(page.locator('[data-testid="hours-this-month"]')).toBeVisible();
    
    // Should show progress towards graduation requirements
    await expect(page.locator('[data-testid="graduation-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-percentage"]')).toBeVisible();
    
    // Should show breakdown by activity type
    await expect(page.locator('[data-testid="activity-breakdown"]')).toBeVisible();
    
    // Check for common activities
    const activities = ['patient-care', 'procedures', 'documentation', 'education'];
    for (const activity of activities) {
      const activityStat = page.locator(`[data-testid="activity-${activity}"]`);
      if (await activityStat.isVisible()) {
        await expect(activityStat.locator('[data-testid="activity-hours"]')).toBeVisible();
      }
    }
  });

  test('student can set and track learning goals', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Navigate to goals section
    await page.click('[data-testid="learning-goals-tab"]');
    
    // Should show learning goals interface
    await expect(page.locator('[data-testid="learning-goals"]')).toBeVisible();
    
    // Add new learning goal
    await page.click('[data-testid="add-goal"]');
    await page.fill('[data-testid="goal-title"]', 'Improve diagnostic reasoning skills');
    await page.fill('[data-testid="goal-description"]', 'Practice systematic approach to differential diagnosis');
    await page.selectOption('[data-testid="goal-category"]', 'clinical-skills');
    await page.fill('[data-testid="target-date"]', '2025-03-15');
    
    await page.click('[data-testid="save-goal"]');
    
    // Should see new goal in list
    await expect(page.locator('[data-testid="goal-item"]').first()).toContainText('Improve diagnostic reasoning');
    
    // Mark progress on goal
    await page.locator('[data-testid="goal-item"]').first().locator('[data-testid="update-progress"]').click();
    await page.fill('[data-testid="progress-notes"]', 'Completed 3 case studies this week');
    await page.selectOption('[data-testid="progress-level"]', '50');
    
    await page.click('[data-testid="save-progress"]');
    
    // Should see updated progress
    await expect(page.locator('[data-testid="goal-item"]').first()).toContainText('50%');
  });

  test('preceptor can review and approve student hours', async ({ page }) => {
    // Logout and login as preceptor
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="sign-out"]');
    
    await page.goto('/sign-in');
    await page.fill('input[name="identifier"]', 'test.preceptor@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Navigate to student supervision
    await page.goto('/dashboard/preceptor');
    await page.click('[data-testid="student-supervision"]');
    
    // Should see students requiring hours approval
    await expect(page.locator('[data-testid="pending-hours"]')).toBeVisible();
    
    // Review first pending entry
    await page.locator('[data-testid="review-hours"]').first().click();
    
    // Should see hours details for review
    await expect(page.locator('[data-testid="hours-review-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-activities"]')).toBeVisible();
    
    // Add preceptor feedback
    await page.fill('[data-testid="preceptor-feedback"]', 'Student demonstrated excellent clinical reasoning and professionalism');
    
    // Rate student performance
    await page.selectOption('[data-testid="performance-rating"]', '4'); // Scale of 1-5
    
    // Approve hours
    await page.click('[data-testid="approve-hours"]');
    
    // Should see approval confirmation
    await expect(page.locator('[data-testid="approval-success"]')).toBeVisible();
  });

  test('hours data syncs correctly across devices', async ({ page, context }) => {
    // This test would need multiple browser contexts to simulate different devices
    await page.goto('/dashboard/student/hours');
    
    // Log hours on first device
    await page.click('[data-testid="log-hours-button"]');
    await page.selectOption('[data-testid="rotation-select"]', 'family-medicine');
    await page.fill('[data-testid="date-input"]', '2025-01-16');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-time"]', '17:00');
    await page.fill('[data-testid="description"]', 'Device sync test entry');
    await page.click('[data-testid="submit-hours"]');
    
    // Open new browser context (simulating second device)
    const secondPage = await context.newPage();
    await secondPage.goto('/sign-in');
    await secondPage.fill('input[name="identifier"]', 'test.student@example.com');
    await secondPage.fill('input[name="password"]', 'TestPassword123!');
    await secondPage.click('button[type="submit"]');
    
    await secondPage.goto('/dashboard/student/hours');
    
    // Should see the entry logged on first device
    await expect(secondPage.locator('[data-testid="hours-entry"]')).toContainText('Device sync test entry');
    
    await secondPage.close();
  });

  test('mobile responsive hours tracking interface', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/student/hours');
    
    // Should adapt to mobile layout
    await expect(page.locator('[data-testid="mobile-hours-view"]')).toBeVisible();
    
    // Mobile-friendly quick log button
    await page.click('[data-testid="mobile-quick-log"]');
    
    // Should show mobile-optimized form
    await expect(page.locator('[data-testid="mobile-hours-form"]')).toBeVisible();
    
    // Test mobile time picker
    await page.click('[data-testid="mobile-time-picker"]');
    await expect(page.locator('[data-testid="time-picker-modal"]')).toBeVisible();
    
    // Test mobile date picker
    await page.click('[data-testid="mobile-date-picker"]');
    await expect(page.locator('[data-testid="date-picker-modal"]')).toBeVisible();
  });

});