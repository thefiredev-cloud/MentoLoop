import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '..', '..', 'playwright', '.auth', 'user.json');

// Configure test users for different roles
export const TEST_USERS = {
  student: {
    email: process.env.TEST_STUDENT_EMAIL || 'test.student@mentoloop.test',
    password: process.env.TEST_STUDENT_PASSWORD || 'TestStudent123!',
    name: 'Test Student',
    role: 'student'
  },
  preceptor: {
    email: process.env.TEST_PRECEPTOR_EMAIL || 'test.preceptor@mentoloop.test',
    password: process.env.TEST_PRECEPTOR_PASSWORD || 'TestPreceptor123!',
    name: 'Dr. Test Preceptor',
    role: 'preceptor'
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'test.admin@mentoloop.test',
    password: process.env.TEST_ADMIN_PASSWORD || 'TestAdmin123!',
    name: 'Test Admin',
    role: 'admin'
  }
};

// Setup authentication for tests
setup('authenticate as student', async ({ page }) => {
  // Go to sign-in page
  await page.goto('/sign-in');
  
  // If using Clerk test mode, handle the sign-in flow
  if (process.env.CLERK_TEST_MODE === 'true') {
    // Use Clerk's test mode authentication
    await page.evaluate((testUser) => {
      // @ts-ignore - Clerk test mode global
      if (window.__clerk_test_mode) {
        window.__clerk_test_mode.signIn({
          identifier: testUser.email,
          password: testUser.password
        });
      }
    }, TEST_USERS.student);
  } else {
    // Regular sign-in flow
    await page.fill('input[name="email"]', TEST_USERS.student.email);
    await page.fill('input[name="password"]', TEST_USERS.student.password);
    await page.click('button[type="submit"]');
  }
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard/**');
  expect(page.url()).toContain('/dashboard');
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});

setup('authenticate as preceptor', async ({ page }) => {
  const preceptorAuthFile = path.join(__dirname, '..', '..', 'playwright', '.auth', 'preceptor.json');
  
  await page.goto('/sign-in');
  
  if (process.env.CLERK_TEST_MODE === 'true') {
    await page.evaluate((testUser) => {
      // @ts-ignore
      if (window.__clerk_test_mode) {
        window.__clerk_test_mode.signIn({
          identifier: testUser.email,
          password: testUser.password
        });
      }
    }, TEST_USERS.preceptor);
  } else {
    await page.fill('input[name="email"]', TEST_USERS.preceptor.email);
    await page.fill('input[name="password"]', TEST_USERS.preceptor.password);
    await page.click('button[type="submit"]');
  }
  
  await page.waitForURL('/dashboard/**');
  expect(page.url()).toContain('/dashboard');
  
  await page.context().storageState({ path: preceptorAuthFile });
});

setup('authenticate as admin', async ({ page }) => {
  const adminAuthFile = path.join(__dirname, '..', '..', 'playwright', '.auth', 'admin.json');
  
  await page.goto('/sign-in');
  
  if (process.env.CLERK_TEST_MODE === 'true') {
    await page.evaluate((testUser) => {
      // @ts-ignore
      if (window.__clerk_test_mode) {
        window.__clerk_test_mode.signIn({
          identifier: testUser.email,
          password: testUser.password
        });
      }
    }, TEST_USERS.admin);
  } else {
    await page.fill('input[name="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');
  }
  
  await page.waitForURL('/dashboard/**');
  expect(page.url()).toContain('/dashboard');
  
  await page.context().storageState({ path: adminAuthFile });
});

// Mock authentication helper for development/CI environments
export async function mockAuthentication(page: any, role: 'student' | 'preceptor' | 'admin') {
  const user = TEST_USERS[role];
  
  // Set mock authentication cookies/tokens
  await page.context().addCookies([
    {
      name: '__clerk_test_user',
      value: JSON.stringify({
        id: `test_${role}_id`,
        email: user.email,
        name: user.name,
        role: user.role
      }),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }
  ]);
  
  // Set any required localStorage items
  await page.evaluate((userData) => {
    localStorage.setItem('test_user', JSON.stringify(userData));
  }, user);
}

// Helper to clear authentication
export async function clearAuthentication(page: any) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}