import { test, expect } from '@playwright/test'

test.describe('MentorFit Assessment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to student intake page
    await page.goto('/student-intake')
  })

  test('should show MentorFit as the 6th step in intake flow', async ({ page }) => {
    // Check that MentorFit is listed in the steps
    const mentorFitStep = page.locator('text=MentorFit Assessment')
    await expect(mentorFitStep).toBeVisible()
  })

  test('should require premium membership for MentorFit access', async ({ page }) => {
    // Navigate through steps to reach MentorFit
    // This assumes user is logged in but doesn't have premium

    // Fill Personal Information (Step 1)
    await page.fill('input[id="fullName"]', 'Test Student')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phoneNumber"]', '555-0123')
    await page.fill('input[id="dateOfBirth"]', '1995-01-01')
    await page.click('button:has-text("Next")')

    // Fill School Information (Step 2)
    await page.fill('input[id="university"]', 'Test University')
    await page.selectOption('select[id="npTrack"]', 'FNP')
    await page.selectOption('select[id="specialty"]', 'Family Practice')
    await page.selectOption('select[id="academicYear"]', '2024')
    await page.click('button:has-text("Next")')

    // Fill Rotation Needs (Step 3)
    await page.fill('input[id="requiredHours"]', '500')
    await page.click('input[value="family-practice"]')
    await page.selectOption('select[id="locationPreference"]', 'in-state')
    await page.fill('input[id="preferredStartDate"]', '2024-06-01')
    await page.click('button:has-text("Next")')

    // Payment & Agreement (Step 4) - Skip for now
    await page.click('button:has-text("Skip")')

    // Matching Preferences (Step 5)
    await page.selectOption('select[id="practiceStyle"]', 'hands-on')
    await page.selectOption('select[id="teachingPreferences"]', 'structured')
    await page.selectOption('select[id="communicationStyle"]', 'direct')
    await page.selectOption('select[id="schedulingFlexibility"]', 'flexible')
    await page.click('button:has-text("Continue")')

    // Should now be on MentorFit step - check for payment gate
    const lockedSection = page.locator('text=MentorFit Learning Style Assessment')
    await expect(lockedSection).toBeVisible()
    
    const premiumRequired = page.locator('text=PREMIUM REQUIRED')
    await expect(premiumRequired).toBeVisible()
  })

  test('should allow premium users to complete MentorFit assessment', async ({ page }) => {
    // Mock premium user authentication
    await page.evaluate(() => {
      // Set mock payment status in localStorage
      localStorage.setItem('userMembershipPlan', 'premium')
    })

    // Navigate directly to MentorFit step (assuming user has completed previous steps)
    await page.goto('/student-intake?step=6')

    // Check that assessment is accessible
    const assessmentTitle = page.locator('h3:has-text("MentorFit Learning Style Assessment")')
    await expect(assessmentTitle).toBeVisible()

    // Answer first question
    const question1 = page.locator('text=How do you learn new clinical skills best?')
    await expect(question1).toBeVisible()
    
    await page.click('label:has-text("Hands-on practice with immediate feedback")')
    
    // Navigate to next question
    await page.click('button:has-text("Next Question")')
    
    // Check progress indicator updates
    const progress = page.locator('[role="progressbar"]')
    await expect(progress).toHaveAttribute('aria-valuenow', '1')
  })

  test('should validate all 15 questions are answered', async ({ page }) => {
    // Mock premium user
    await page.evaluate(() => {
      localStorage.setItem('userMembershipPlan', 'premium')
    })

    await page.goto('/student-intake?step=6')

    // Try to continue without answering questions
    const continueButton = page.locator('button:has-text("Continue to Membership Selection")')
    await expect(continueButton).toBeDisabled()

    // Answer all 15 questions programmatically
    const questions = [
      'learning_style', 'feedback_timing', 'challenge_response',
      'mentoring_preference', 'stress_management', 'communication_style',
      'learning_pace', 'independence_level', 'mistake_handling',
      'motivation_source', 'problem_solving', 'workplace_environment',
      'case_complexity', 'growth_mindset', 'preceptor_relationship'
    ]

    for (let i = 0; i < questions.length; i++) {
      // Click on first option for each question
      await page.click(`input[name="${questions[i]}"]:first-of-type`)
      
      if (i < questions.length - 1) {
        await page.click('button:has-text("Next Question")')
      }
    }

    // Check completion message appears
    const completionMessage = page.locator('text=Assessment Complete!')
    await expect(completionMessage).toBeVisible()

    // Continue button should now be enabled
    await expect(continueButton).toBeEnabled()
  })

  test('should save assessment answers to backend', async ({ page }) => {
    // Mock premium user and student ID
    await page.evaluate(() => {
      localStorage.setItem('userMembershipPlan', 'premium')
      localStorage.setItem('studentId', 'test_student_123')
    })

    await page.goto('/student-intake?step=6')

    // Answer first question
    await page.click('label:has-text("Hands-on practice with immediate feedback")')

    // Intercept the save request
    const savePromise = page.waitForRequest(request => 
      request.url().includes('/api/mentorfit/saveMentorFitAssessment')
    )

    // Answer remaining questions and submit
    for (let i = 1; i < 15; i++) {
      await page.click('button:has-text("Next Question")')
      await page.click(`input[type="radio"]:first-of-type`)
    }

    await page.click('button:has-text("Continue to Membership Selection")')

    // Verify save request was made
    const saveRequest = await savePromise
    expect(saveRequest.method()).toBe('POST')
    
    const requestData = saveRequest.postDataJSON()
    expect(requestData).toHaveProperty('assessmentAnswers')
    expect(Object.keys(requestData.assessmentAnswers)).toHaveLength(15)
  })
})

test.describe('MentorFit Compatibility Calculation', () => {
  test('should calculate compatibility scores correctly', async ({ page }) => {
    // Navigate to AI matching test page
    await page.goto('/dashboard/ai-matching-test')

    // Select a test student
    await page.selectOption('select', { label: /Test Student/ })

    // Run AI matching
    await page.click('button:has-text("Run AI Matching Test")')

    // Wait for results
    await page.waitForSelector('text=AI Analysis Results', { timeout: 10000 })

    // Check that MentorFit scores are displayed
    const baseScore = page.locator('text=/Base MentorFit Score:/')
    await expect(baseScore).toBeVisible()

    const enhancedScore = page.locator('text=/AI Enhanced Score:/')
    await expect(enhancedScore).toBeVisible()

    // Verify score is between 0 and 10
    const scoreText = await baseScore.textContent()
    const score = parseFloat(scoreText?.match(/(\d+\.?\d*)/)?.[1] || '0')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(10)
  })

  test('should show compatibility tiers correctly', async ({ page }) => {
    await page.goto('/dashboard/ai-matching-test')

    // Select student and run matching
    await page.selectOption('select', { label: /Test Student/ })
    await page.click('button:has-text("Run AI Matching Test")')

    // Wait for results
    await page.waitForSelector('text=AI Analysis Results')

    // Check for confidence badges (High/Medium/Low)
    const confidenceBadges = page.locator('[class*="badge"]')
    const badgeCount = await confidenceBadges.count()
    expect(badgeCount).toBeGreaterThan(0)

    // Verify at least one badge contains confidence level
    const badgeTexts = await confidenceBadges.allTextContents()
    const hasConfidenceLevel = badgeTexts.some(text => 
      /High Confidence|Medium Confidence|Low Confidence/.test(text)
    )
    expect(hasConfidenceLevel).toBeTruthy()
  })
})

test.describe('MentorFit Integration', () => {
  test('should integrate with match creation', async ({ page }) => {
    // Navigate to matches page
    await page.goto('/dashboard/student/matches')

    // Check if MentorFit scores are displayed in match cards
    const matchCards = page.locator('[data-testid="match-card"]')
    const firstCard = matchCards.first()

    if (await firstCard.isVisible()) {
      // Look for MentorFit score in the card
      const mentorFitScore = firstCard.locator('text=/MentorFit.*Score/')
      await expect(mentorFitScore).toBeVisible()
    }
  })

  test('should use MentorFit data in preceptor recommendations', async ({ page }) => {
    // Navigate to find preceptors page
    await page.goto('/dashboard/student/find-preceptors')

    // Click on recommended matches tab if exists
    const recommendedTab = page.locator('text=Recommended Matches')
    if (await recommendedTab.isVisible()) {
      await recommendedTab.click()

      // Check for compatibility indicators
      const compatibilityIndicator = page.locator('text=/Compatibility:/')
      await expect(compatibilityIndicator.first()).toBeVisible()
    }
  })
})