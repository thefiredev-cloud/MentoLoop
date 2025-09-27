import { test as setup, expect, Page } from '@playwright/test';
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

const SIGN_IN_PATH = '/sign-in';

const PASSWORD_FALLBACK_LOCATORS = [
  'button:has-text("Sign in with password")',
  'button:has-text("Continue with password")',
  'button:has-text("Sign in with email")',
  'button:has-text("Continue with email")',
  'a:has-text("Sign in with password")',
  'a:has-text("Continue with password")',
];

const EMAIL_INPUT_SELECTOR = 'input[type="email"], input[name="email"], input[data-qa="email-address"]';
const PASSWORD_INPUT_SELECTOR = 'input[type="password"], input[name="password"], input[data-qa="password"]';
const SUBMIT_BUTTON_SELECTOR = 'button[type="submit"], button:has-text("Continue"), button:has-text("Sign in")';

async function attemptTestModeSignIn(page: Page, user: typeof TEST_USERS[keyof typeof TEST_USERS]) {
  const isTestMode = await page.evaluate(() => Boolean((window as any).__clerk_test_mode));
  if (!isTestMode) {
    return false;
  }

  await page.evaluate((testUser) => {
    const clerkTestMode = (window as any).__clerk_test_mode;
    if (!clerkTestMode) return;

    clerkTestMode.signIn({
      identifier: testUser.email,
      password: testUser.password,
    });
  }, user);

  return true;
}

async function navigateToSignIn(page: Page) {
  const url = `${SIGN_IN_PATH}${SIGN_IN_PATH.includes('?') ? '&' : '?'}__clerk_test_mode=true`;
  await page.goto(url, { waitUntil: 'networkidle' });
}

async function ensurePasswordForm(page: Page) {
  await page.waitForFunction(() => {
    const clerk = (window as any).Clerk;
    return Boolean(clerk && clerk.__unstable__loaded);
  }, { timeout: 10000 }).catch(() => undefined);

  for (const locator of PASSWORD_FALLBACK_LOCATORS) {
    const button = page.locator(locator).first();
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      break;
    }
  }

  for (const _ of Array.from({ length: 3 })) {
    const emailInput = page.locator(EMAIL_INPUT_SELECTOR).first();
    if (await emailInput.isVisible().catch(() => false)) {
      await page.waitForSelector(PASSWORD_INPUT_SELECTOR, { timeout: 5000 });
      return;
    }

    const fallback = page.locator('button:has-text("Use another method")').first();
    if (await fallback.isVisible().catch(() => false)) {
      await fallback.click();
    } else {
      await page.waitForTimeout(1000);
    }
  }

  await page.waitForSelector(EMAIL_INPUT_SELECTOR, { timeout: 10000 });
  await page.waitForSelector(PASSWORD_INPUT_SELECTOR, { timeout: 10000 });
}

async function completePasswordSignIn(page: Page, user: typeof TEST_USERS[keyof typeof TEST_USERS]) {
  await ensurePasswordForm(page);
  await page.fill(EMAIL_INPUT_SELECTOR, user.email);
  await page.fill(PASSWORD_INPUT_SELECTOR, user.password);
  await page.click(SUBMIT_BUTTON_SELECTOR);
}

async function performSignIn(page: Page, user: typeof TEST_USERS[keyof typeof TEST_USERS], storagePath: string) {
  await navigateToSignIn(page);

  const usedTestMode = await attemptTestModeSignIn(page, user);

  if (!usedTestMode) {
    await completePasswordSignIn(page, user);
  }

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard/**', { timeout: 60000 });
  expect(page.url()).toContain('/dashboard');

  await page.context().storageState({ path: storagePath });
}

// Setup authentication for tests
setup('authenticate as student', async ({ page }) => {
  await performSignIn(page, TEST_USERS.student, authFile);
});

setup('authenticate as preceptor', async ({ page }) => {
  const preceptorAuthFile = path.join(__dirname, '..', '..', 'playwright', '.auth', 'preceptor.json');
  
  await page.goto('/sign-in');
  
  if (process.env.CLERK_TEST_MODE === 'true') {
    await page.evaluate((testUser) => {
      // @ts-ignore
      if ((window as any).__clerk_test_mode) {
        (window as any).__clerk_test_mode.signIn({
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
      if ((window as any).__clerk_test_mode) {
        (window as any).__clerk_test_mode.signIn({
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
  await page.evaluate((userData: any) => {
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