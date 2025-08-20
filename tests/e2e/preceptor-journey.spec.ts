import { test, expect } from '@playwright/test';

test.describe('Preceptor Journey E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start at the landing page
    await page.goto('/');
  });

  test('Complete preceptor registration and intake flow', async ({ page }) => {
    // Test landing page and navigation to preceptor intake
    await expect(page).toHaveTitle(/MentoLoop/);
    
    // Click "Become a Preceptor" button
    await page.click('text=Become a Preceptor');
    await expect(page).toHaveURL(/\/preceptor-intake/);
    
    // Step 1: Personal & Contact Information
    await page.fill('input[name="firstName"]', 'Dr. Jane');
    await page.fill('input[name="lastName"]', 'Preceptor');
    await page.fill('input[name="email"]', 'dr.preceptor@example.com');
    await page.fill('input[name="phone"]', '(555) 987-6543');
    await page.selectOption('select[name="preferredContact"]', 'email');
    
    await page.click('button:text("Next")');
    
    // Step 2: Practice Information
    await page.fill('input[name="npiNumber"]', '1234567890');
    await page.fill('input[name="licenseNumber"]', 'TX12345');
    await page.selectOption('select[name="licenseState"]', 'TX');
    await page.fill('input[name="yearsExperience"]', '8');
    await page.selectOption('select[name="primarySpecialty"]', 'family-medicine');
    
    // Practice details
    await page.fill('input[name="practiceName"]', 'Family Health Clinic');
    await page.selectOption('select[name="practiceType"]', 'private-practice');
    await page.fill('input[name="practiceAddress"]', '123 Medical Drive');
    await page.fill('input[name="practiceCity"]', 'Dallas');
    await page.selectOption('select[name="practiceState"]', 'TX');
    await page.fill('input[name="practiceZip"]', '75201');
    
    await page.click('button:text("Next")');
    
    // Step 3: Availability & Capacity
    await page.selectOption('select[name="maxStudents"]', '2');
    await page.selectOption('select[name="rotationLength"]', '8');
    
    // Set availability for weekdays
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    for (const day of weekdays) {
      await page.check(`input[name="${day}Available"]`);
      await page.selectOption(`select[name="${day}StartTime"]`, '08:00');
      await page.selectOption(`select[name="${day}EndTime"]`, '17:00');
    }
    
    await page.click('button:text("Next")');
    
    // Step 4: Mentoring Style Assessment
    // Answer MentorFit questions
    const mentorFitAnswers = [
      'very-much', 'somewhat', 'very-much', 'somewhat', 'very-much',
      'somewhat', 'very-much', 'somewhat', 'very-much', 'somewhat'
    ];
    
    for (let i = 0; i < mentorFitAnswers.length; i++) {
      await page.click(`input[name="q${i + 1}"][value="${mentorFitAnswers[i]}"]`);
    }
    
    await page.click('button:text("Next")');
    
    // Step 5: Agreements & Verification
    await page.check('input[name="backgroundCheckConsent"]');
    await page.check('input[name="termsAgreement"]');
    await page.check('input[name="hipaaCompliance"]');
    await page.check('input[name="qualityStandards"]');
    
    await page.click('button:text("Complete Registration")');
    
    // Should redirect to sign-in/sign-up flow
    await expect(page).toHaveURL(/sign-in|sign-up/);
  });

  test('Preceptor dashboard navigation and functionality', async ({ page }) => {
    // This test assumes the user is already authenticated
    await page.goto('/dashboard/preceptor');
    
    // Check dashboard elements
    await expect(page.locator('h1')).toContainText('Preceptor Dashboard');
    
    // Test navigation to different sections
    await page.click('text=Student Matches');
    await expect(page).toHaveURL(/\/dashboard\/preceptor\/matches/);
    
    await page.click('text=My Students');
    await expect(page).toHaveURL(/\/dashboard\/preceptor\/students/);
    
    await page.click('text=Schedule');
    await expect(page).toHaveURL(/\/dashboard\/preceptor\/schedule/);
    
    await page.click('text=Profile');
    await expect(page).toHaveURL(/\/dashboard\/preceptor\/profile/);
  });

  test('Student match review and acceptance', async ({ page }) => {
    await page.goto('/dashboard/preceptor/matches');
    
    // Check if potential matches are displayed
    await expect(page.locator('[data-testid="student-match-card"]')).toBeVisible();
    
    // Click on first match to view details
    await page.click('[data-testid="student-match-card"]:first-child');
    
    // Check student details are visible
    await expect(page.locator('[data-testid="student-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="mentorfit-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-gpa"]')).toBeVisible();
    
    // Test accepting a match
    await page.click('button:text("Accept Student")');
    
    // Confirm acceptance
    await page.click('button:text("Confirm")');
    
    // Verify match accepted
    await expect(page.locator('text=Match accepted successfully')).toBeVisible();
  });

  test('Student evaluation and progress tracking', async ({ page }) => {
    await page.goto('/dashboard/preceptor/students');
    
    // Click on active student
    await page.click('[data-testid="active-student"]:first-child');
    
    // Test adding evaluation
    await page.click('button:text("Add Evaluation")');
    
    await page.selectOption('select[name="clinicalSkills"]', '4');
    await page.selectOption('select[name="professionalism"]', '5');
    await page.selectOption('select[name="communication"]', '4');
    await page.selectOption('select[name="criticalThinking"]', '4');
    
    await page.fill('textarea[name="strengths"]', 'Excellent patient communication and eager to learn');
    await page.fill('textarea[name="improvements"]', 'Continue developing diagnostic confidence');
    await page.fill('textarea[name="goals"]', 'Focus on complex case management');
    
    await page.click('button:text("Save Evaluation")');
    
    // Verify evaluation saved
    await expect(page.locator('text=Evaluation saved successfully')).toBeVisible();
  });

  test('Schedule and availability management', async ({ page }) => {
    await page.goto('/dashboard/preceptor/schedule');
    
    // Test updating availability
    await page.click('button:text("Update Availability")');
    
    // Update Tuesday availability
    await page.uncheck('input[name="tuesdayAvailable"]');
    
    // Update Wednesday hours
    await page.selectOption('select[name="wednesdayStartTime"]', '09:00');
    await page.selectOption('select[name="wednesdayEndTime"]', '16:00');
    
    await page.click('button:text("Save Changes")');
    
    // Verify changes saved
    await expect(page.locator('text=Schedule updated successfully')).toBeVisible();
  });

  test('Student hours approval workflow', async ({ page }) => {
    await page.goto('/dashboard/preceptor/students');
    
    // Click on student with pending hours
    await page.click('[data-testid="student-with-pending-hours"]:first-child');
    
    // Navigate to hours review
    await page.click('text=Review Hours');
    
    // Check pending hours entry
    await expect(page.locator('[data-testid="pending-hours"]')).toBeVisible();
    
    // Approve hours
    await page.click('[data-testid="approve-hours-btn"]:first-child');
    
    // Add approval note
    await page.fill('textarea[name="approvalNote"]', 'Good work this week, keep it up!');
    
    await page.click('button:text("Approve")');
    
    // Verify approval
    await expect(page.locator('text=Hours approved successfully')).toBeVisible();
  });

  test('Profile and credentials management', async ({ page }) => {
    await page.goto('/dashboard/preceptor/profile');
    
    // Test updating profile information
    await page.click('button:text("Edit Profile")');
    
    await page.fill('input[name="yearsExperience"]', '10');
    await page.fill('textarea[name="specialInterests"]', 'Diabetes management, preventive care');
    await page.fill('textarea[name="mentorshipPhilosophy"]', 'Hands-on learning with gradual independence');
    
    await page.click('button:text("Save Changes")');
    
    // Verify changes saved
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    
    // Test credential upload
    await page.click('button:text("Upload License")');
    
    // This would typically involve file upload testing
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('Communication with students', async ({ page }) => {
    await page.goto('/dashboard/preceptor/students');
    
    // Click on active student
    await page.click('[data-testid="active-student"]:first-child');
    
    // Send message to student
    await page.click('button:text("Send Message")');
    
    await page.fill('input[name="subject"]', 'Upcoming rotation schedule');
    await page.fill('textarea[name="message"]', 'Hi! Looking forward to working with you. Please review the attached schedule.');
    
    await page.click('button:text("Send")');
    
    // Verify message sent
    await expect(page.locator('text=Message sent successfully')).toBeVisible();
  });

  test('Rotation completion and final evaluation', async ({ page }) => {
    await page.goto('/dashboard/preceptor/students');
    
    // Click on student nearing completion
    await page.click('[data-testid="completing-student"]:first-child');
    
    // Complete final evaluation
    await page.click('button:text("Final Evaluation")');
    
    // Fill comprehensive evaluation
    await page.selectOption('select[name="overallPerformance"]', '4');
    await page.selectOption('select[name="meetExpectations"]', 'exceeded');
    await page.selectOption('select[name="recommendForHire"]', 'yes');
    
    await page.fill('textarea[name="finalComments"]', 'Excellent student with strong clinical skills and professionalism.');
    await page.fill('textarea[name="recommendationsForFuture"]', 'Continue developing expertise in complex case management.');
    
    await page.click('button:text("Complete Evaluation")');
    
    // Mark rotation as complete
    await page.click('button:text("Mark Rotation Complete")');
    
    // Verify completion
    await expect(page.locator('text=Rotation completed successfully')).toBeVisible();
  });
});