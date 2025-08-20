import { test, expect } from '@playwright/test';

test.describe('Student Journey E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start at the landing page
    await page.goto('/');
  });

  test('Complete student registration and intake flow', async ({ page }) => {
    // Test landing page and navigation to student intake
    await expect(page).toHaveTitle(/MentoLoop/);
    
    // Click "Find My Preceptor" button
    await page.click('text=Find My Preceptor');
    await expect(page).toHaveURL(/\/student-intake/);
    
    // Step 1: Personal Information
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Student');
    await page.fill('input[name="email"]', 'test.student@example.com');
    await page.fill('input[name="phone"]', '(555) 123-4567');
    await page.selectOption('select[name="state"]', 'TX');
    await page.fill('input[name="city"]', 'Dallas');
    await page.fill('input[name="zipCode"]', '75201');
    
    await page.click('button:text("Next")');
    
    // Step 2: School Information
    await page.fill('input[name="schoolName"]', 'University of Texas Health Science Center');
    await page.selectOption('select[name="programType"]', 'MSN');
    await page.selectOption('select[name="expectedGraduation"]', '2025');
    await page.fill('input[name="gpa"]', '3.8');
    
    await page.click('button:text("Next")');
    
    // Step 3: Rotation Needs
    await page.selectOption('select[name="specialty"]', 'family-medicine');
    await page.selectOption('select[name="rotationLength"]', '8');
    await page.fill('input[name="startDate"]', '2025-09-01');
    await page.selectOption('select[name="hoursPerWeek"]', '40');
    
    await page.click('button:text("Next")');
    
    // Step 4: Matching Preferences
    await page.selectOption('select[name="maxCommute"]', '30');
    await page.selectOption('select[name="settingPreference"]', 'any');
    await page.selectOption('select[name="preceptorGender"]', 'no-preference');
    
    await page.click('button:text("Next")');
    
    // Step 5: Learning Style Assessment
    // Answer MentorFit questions
    const mentorFitQuestions = [
      'very-much', 'somewhat', 'very-much', 'somewhat', 'very-much',
      'somewhat', 'very-much', 'somewhat', 'very-much', 'somewhat'
    ];
    
    for (let i = 0; i < mentorFitQuestions.length; i++) {
      await page.click(`input[name="q${i + 1}"][value="${mentorFitQuestions[i]}"]`);
    }
    
    // Accept agreements
    await page.check('input[name="hipaaAgreement"]');
    await page.check('input[name="termsAgreement"]');
    await page.check('input[name="backgroundCheck"]');
    
    await page.click('button:text("Complete Registration")');
    
    // Should redirect to sign-in/sign-up flow
    await expect(page).toHaveURL(/sign-in|sign-up/);
  });

  test('Student dashboard navigation and functionality', async ({ page }) => {
    // This test assumes the user is already authenticated
    // In a real implementation, you'd handle authentication setup
    
    await page.goto('/dashboard/student');
    
    // Check dashboard elements
    await expect(page.locator('h1')).toContainText('Student Dashboard');
    
    // Test navigation to different sections
    await page.click('text=My Matches');
    await expect(page).toHaveURL(/\/dashboard\/student\/matches/);
    
    await page.click('text=Clinical Hours');
    await expect(page).toHaveURL(/\/dashboard\/student\/hours/);
    
    await page.click('text=Rotations');
    await expect(page).toHaveURL(/\/dashboard\/student\/rotations/);
  });

  test('Student match acceptance flow', async ({ page }) => {
    // Navigate to student matches
    await page.goto('/dashboard/student/matches');
    
    // Check if matches are displayed
    await expect(page.locator('[data-testid="match-card"]')).toBeVisible();
    
    // Click on first match to view details
    await page.click('[data-testid="match-card"]:first-child');
    
    // Check match details are visible
    await expect(page.locator('[data-testid="preceptor-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="mentorfit-score"]')).toBeVisible();
    
    // Test accepting a match
    await page.click('button:text("Accept Match")');
    
    // Should show payment modal or redirect to payment
    await expect(page.locator('[data-testid="payment-modal"]')).toBeVisible();
  });

  test('Clinical hours tracking', async ({ page }) => {
    await page.goto('/dashboard/student/hours');
    
    // Test adding clinical hours
    await page.click('button:text("Log Hours")');
    
    await page.fill('input[name="date"]', '2025-08-19');
    await page.fill('input[name="hours"]', '8');
    await page.fill('textarea[name="activities"]', 'Patient consultations and medication reviews');
    await page.fill('textarea[name="learningObjectives"]', 'Improved diagnostic skills');
    
    await page.click('button:text("Save Hours")');
    
    // Verify hours are saved
    await expect(page.locator('[data-testid="hours-entry"]')).toContainText('8 hours');
  });

  test('Post-rotation survey completion', async ({ page }) => {
    await page.goto('/dashboard/student/rotations');
    
    // Click on completed rotation
    await page.click('[data-testid="completed-rotation"]:first-child');
    
    // Start survey
    await page.click('button:text("Complete Survey")');
    
    // Fill out survey
    await page.selectOption('select[name="overallSatisfaction"]', '5');
    await page.selectOption('select[name="learningObjectivesMet"]', '5');
    await page.selectOption('select[name="preceptorCommunication"]', '5');
    await page.selectOption('select[name="clinicalExposure"]', '4');
    await page.selectOption('select[name="wouldRecommend"]', '5');
    
    await page.fill('textarea[name="feedback"]', 'Excellent learning experience with great mentorship.');
    await page.fill('textarea[name="improvements"]', 'More hands-on procedures would be beneficial.');
    
    await page.click('button:text("Submit Survey")');
    
    // Verify survey submission
    await expect(page.locator('text=Survey submitted successfully')).toBeVisible();
  });

  test('Student profile management', async ({ page }) => {
    await page.goto('/dashboard/student');
    
    // Navigate to profile settings
    await page.click('[data-testid="profile-menu"]');
    await page.click('text=Profile Settings');
    
    // Update profile information
    await page.fill('input[name="phone"]', '(555) 987-6543');
    await page.fill('input[name="city"]', 'Austin');
    await page.fill('input[name="zipCode"]', '78701');
    
    await page.click('button:text("Save Changes")');
    
    // Verify changes saved
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });

  test('Help center access and search', async ({ page }) => {
    await page.goto('/dashboard/student');
    
    // Access help center
    await page.click('text=Help Center');
    
    // Search for help topics
    await page.fill('input[placeholder="Search help topics..."]', 'clinical hours');
    await page.press('input[placeholder="Search help topics..."]', 'Enter');
    
    // Verify search results
    await expect(page.locator('[data-testid="help-article"]')).toBeVisible();
  });
});