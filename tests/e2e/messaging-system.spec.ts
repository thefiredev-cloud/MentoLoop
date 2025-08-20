import { test, expect, Page } from '@playwright/test';

test.describe('Messaging System E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate as a student
    await page.goto('/sign-in');
    
    // Fill in test credentials (adjust based on your test user setup)
    await page.fill('input[name="identifier"]', 'test.student@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('student can access messages page and see conversations', async ({ page }) => {
    // Navigate to messages
    await page.click('text=Messages');
    await expect(page).toHaveURL('/dashboard/messages');
    
    // Check for messages interface
    await expect(page.locator('h1')).toContainText('Messages');
    
    // Should see conversations list
    await expect(page.locator('[data-testid="conversations-list"]')).toBeVisible();
    
    // Should see unread message count if any exist
    const unreadBadge = page.locator('[data-testid="unread-count"]');
    if (await unreadBadge.isVisible()) {
      await expect(unreadBadge).toContainText(/\d+/);
    }
  });

  test('student can select and view conversation with preceptor', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Wait for conversations to load
    await page.waitForSelector('[data-testid="conversation-item"]');
    
    // Click on first conversation
    const firstConversation = page.locator('[data-testid="conversation-item"]').first();
    await firstConversation.click();
    
    // Should show conversation details
    await expect(page.locator('[data-testid="conversation-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="messages-container"]')).toBeVisible();
    
    // Should show message input
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  });

  test('student can send text message to preceptor', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Select first conversation
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // Type a message
    const testMessage = `Test message sent at ${new Date().toISOString()}`;
    await page.fill('[data-testid="message-input"]', testMessage);
    
    // Send message
    await page.click('[data-testid="send-button"]');
    
    // Verify message appears in conversation
    await expect(page.locator('[data-testid="message-content"]').last()).toContainText(testMessage);
    
    // Verify message input is cleared
    await expect(page.locator('[data-testid="message-input"]')).toHaveValue('');
    
    // Verify message shows as "sent" status
    await expect(page.locator('[data-testid="message-status"]').last()).toContainText(/sent|delivered/i);
  });

  test('student can send file attachment', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Select conversation
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // Click file attachment button
    await page.click('[data-testid="attach-file-button"]');
    
    // Upload test file (you'll need to create a test file)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/test-document.pdf');
    
    // Add optional message with file
    await page.fill('[data-testid="message-input"]', 'Here is the requested document');
    
    // Send file message
    await page.click('[data-testid="send-button"]');
    
    // Verify file message appears
    await expect(page.locator('[data-testid="file-message"]').last()).toBeVisible();
    await expect(page.locator('[data-testid="file-name"]').last()).toContainText('test-document.pdf');
  });

  test('student can view message history and scroll through conversation', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Select conversation with message history
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // Wait for messages to load
    await page.waitForSelector('[data-testid="message-content"]');
    
    // Should see multiple messages if they exist
    const messageCount = await page.locator('[data-testid="message-content"]').count();
    expect(messageCount).toBeGreaterThan(0);
    
    // Test scrolling behavior - should auto-scroll to bottom
    const messagesContainer = page.locator('[data-testid="messages-container"]');
    await expect(messagesContainer).toBeVisible();
    
    // Verify most recent message is visible
    await expect(page.locator('[data-testid="message-content"]').last()).toBeInViewport();
  });

  test('student can mark conversation as read', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Find conversation with unread messages
    const unreadConversation = page.locator('[data-testid="conversation-item"]')
      .filter({ has: page.locator('[data-testid="unread-indicator"]') })
      .first();
    
    if (await unreadConversation.isVisible()) {
      await unreadConversation.click();
      
      // Wait a moment for read status to update
      await page.waitForTimeout(1000);
      
      // Go back to conversations list
      await page.click('[data-testid="back-to-conversations"]');
      
      // Verify unread indicator is removed
      await expect(unreadConversation.locator('[data-testid="unread-indicator"]')).not.toBeVisible();
    }
  });

  test('student can archive and unarchive conversations', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Select a conversation
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // Click archive button
    await page.click('[data-testid="archive-conversation-button"]');
    
    // Confirm archive action
    await page.click('[data-testid="confirm-archive"]');
    
    // Should return to conversations list
    await expect(page).toHaveURL('/dashboard/messages');
    
    // Toggle to show archived conversations
    await page.click('[data-testid="show-archived-toggle"]');
    
    // Should see archived conversation
    await expect(page.locator('[data-testid="archived-conversation"]')).toBeVisible();
    
    // Unarchive the conversation
    await page.click('[data-testid="archived-conversation"]');
    await page.click('[data-testid="unarchive-conversation-button"]');
    
    // Should move back to active conversations
    await page.click('[data-testid="show-active-toggle"]');
    await expect(page.locator('[data-testid="conversation-item"]').first()).toBeVisible();
  });

  test('real-time message updates work correctly', async ({ page, context }) => {
    // This test simulates receiving messages from another user
    // You might need to use Convex's real-time features or mock WebSocket updates
    
    await page.goto('/dashboard/messages');
    
    // Select conversation
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // Get initial message count
    const initialCount = await page.locator('[data-testid="message-content"]').count();
    
    // Simulate receiving a new message (this would normally come from another user)
    // You'll need to trigger this through your backend or use Convex's test utilities
    await page.evaluate(() => {
      // Trigger a mock message update event
      window.dispatchEvent(new CustomEvent('mockNewMessage', {
        detail: {
          conversationId: 'test-conversation',
          content: 'This is a test message from preceptor',
          senderType: 'preceptor'
        }
      }));
    });
    
    // Wait for new message to appear
    await page.waitForFunction(
      (expectedCount) => document.querySelectorAll('[data-testid="message-content"]').length > expectedCount,
      initialCount
    );
    
    // Verify new message appears
    const newCount = await page.locator('[data-testid="message-content"]').count();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('message validation and error handling', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Select conversation
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // Try to send empty message
    await page.click('[data-testid="send-button"]');
    
    // Should not send empty message
    await expect(page.locator('[data-testid="message-input"]')).toBeFocused();
    
    // Try to send very long message
    const longMessage = 'a'.repeat(5001); // Exceeds typical limit
    await page.fill('[data-testid="message-input"]', longMessage);
    await page.click('[data-testid="send-button"]');
    
    // Should show error or prevent sending
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Test special characters and formatting
    const specialMessage = 'Message with <script>alert("test")</script> and emojis 😊🎉';
    await page.fill('[data-testid="message-input"]', specialMessage);
    await page.click('[data-testid="send-button"]');
    
    // Should sanitize and send safely
    await expect(page.locator('[data-testid="message-content"]').last()).toContainText('Message with');
    await expect(page.locator('[data-testid="message-content"]').last()).not.toContainText('<script>');
  });

  test('message search and filtering functionality', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Use search functionality if available
    const searchInput = page.locator('[data-testid="message-search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('rotation');
      await page.press('[data-testid="message-search"]', 'Enter');
      
      // Should filter conversations or messages
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    }
    
    // Test conversation filtering
    const filterButton = page.locator('[data-testid="filter-conversations"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Filter by unread
      await page.click('[data-testid="filter-unread"]');
      
      // Should show only unread conversations
      const conversations = page.locator('[data-testid="conversation-item"]');
      const count = await conversations.count();
      
      if (count > 0) {
        // All visible conversations should have unread indicators
        for (let i = 0; i < count; i++) {
          await expect(conversations.nth(i).locator('[data-testid="unread-indicator"]')).toBeVisible();
        }
      }
    }
  });

  test('conversation metadata and match details display', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Select conversation
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // Should show conversation partner info
    await expect(page.locator('[data-testid="partner-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="partner-specialty"]')).toBeVisible();
    
    // Should show match details
    await expect(page.locator('[data-testid="match-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="rotation-dates"]')).toBeVisible();
    
    // Should show rotation type
    await expect(page.locator('[data-testid="rotation-type"]')).toBeVisible();
  });

  test('system notification messages display correctly', async ({ page }) => {
    await page.goto('/dashboard/messages');
    
    // Select conversation that may have system notifications
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // Look for system messages (these might be automatically generated)
    const systemMessages = page.locator('[data-testid="system-message"]');
    
    if (await systemMessages.count() > 0) {
      // System messages should have different styling
      await expect(systemMessages.first()).toHaveClass(/system-message/);
      
      // Should contain system event information
      await expect(systemMessages.first()).toContainText(/rotation|match|started|completed/i);
    }
  });

  test('mobile responsive message interface', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/messages');
    
    // Should adapt to mobile layout
    await expect(page.locator('[data-testid="mobile-conversations-list"]')).toBeVisible();
    
    // Select conversation
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();
    
    // Should show mobile message view
    await expect(page.locator('[data-testid="mobile-message-view"]')).toBeVisible();
    
    // Should have mobile-friendly input
    await expect(page.locator('[data-testid="mobile-message-input"]')).toBeVisible();
    
    // Back button should work
    await page.click('[data-testid="back-to-conversations"]');
    await expect(page.locator('[data-testid="mobile-conversations-list"]')).toBeVisible();
  });

});