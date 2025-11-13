/**
 * E2E Test T015: Authentication Login Flow
 *
 * This test verifies that users can successfully log in to the Nos Ilha platform
 * with valid credentials and access authenticated features.
 *
 * Test Coverage:
 * - Navigation to login page
 * - Form validation and submission
 * - Successful authentication with Supabase
 * - Redirect to homepage after login
 * - User menu visibility for authenticated users
 *
 * Requirements:
 * - FR-001: Test execution time < 5 minutes
 * - User authentication via Supabase Auth
 * - Mobile-first responsive design
 */

import { test, expect } from "@playwright/test";

/**
 * Test data configuration
 * Note: These credentials should exist in the test Supabase project
 * or be created during test setup
 */
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "test@nosilha.com",
  password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
  displayName: "Test User",
};

test.describe("Authentication Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto("/");

    // Ensure user is logged out before each test
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display login form with all required fields", async ({
    page,
  }) => {
    // Navigate to login page
    await page.goto("/login");

    // Wait for login form to be visible
    await expect(page.locator("form")).toBeVisible();

    // Verify email input field exists
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("required", "");

    // Verify password input field exists
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]'
    );
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("required", "");

    // Verify submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText(/log in/i);
  });

  test("should show validation error for invalid email format", async ({
    page,
  }) => {
    await page.goto("/login");

    // Fill in invalid email
    await page.fill(
      'input[type="email"], input[name="email"]',
      "invalid-email"
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      "password123"
    );

    // Try to submit
    await page.click('button[type="submit"]');

    // Browser should show validation error for invalid email
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });

  test("should show error message for invalid credentials", async ({
    page,
  }) => {
    await page.goto("/login");

    // Fill in invalid credentials
    await page.fill(
      'input[type="email"], input[name="email"]',
      "invalid@example.com"
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      "WrongPassword123"
    );

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for error message to appear
    // The error message might be in an Alert component or error div
    await expect(
      page.locator('div[role="alert"], .alert, [class*="error"]').first()
    ).toBeVisible({ timeout: 10000 });

    // Verify we're still on the login page (not redirected)
    expect(page.url()).toContain("/login");
  });

  test("should successfully log in with valid credentials and redirect to homepage", async ({
    page,
  }) => {
    await page.goto("/login");

    // Fill in valid credentials
    await page.fill(
      'input[type="email"], input[name="email"]',
      TEST_USER.email
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      TEST_USER.password
    );

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for redirect to homepage
    await page.waitForURL("/", { timeout: 15000 });

    // Verify we're on the homepage
    expect(page.url()).toBe(new URL("/", page.url()).href);

    // Verify authentication state - check for user menu or logout button
    // This might be a profile icon, avatar, or "Log Out" button
    const authenticatedIndicators = [
      page.locator('button:has-text("Log Out"), button:has-text("Logout")'),
      page.locator('[data-testid="user-menu"]'),
      page.locator('nav a[href*="profile"], nav button:has-text("Profile")'),
    ];

    // At least one authenticated indicator should be visible
    let isAuthenticated = false;
    for (const indicator of authenticatedIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        isAuthenticated = true;
        break;
      }
    }

    expect(isAuthenticated).toBeTruthy();
  });

  test("should show loading state during login submission", async ({
    page,
  }) => {
    await page.goto("/login");

    // Fill in credentials
    await page.fill(
      'input[type="email"], input[name="email"]',
      TEST_USER.email
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      TEST_USER.password
    );

    // Submit the form and immediately check for loading state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Verify loading state is shown
    // This could be a spinner, disabled button, or "Logging In..." text
    const loadingIndicators = [
      submitButton.locator("text=/logging in/i"),
      submitButton.locator('[class*="spinner"], [class*="loading"]'),
      submitButton.locator("svg"), // LoadingSpinner component renders SVG
    ];

    let hasLoadingState = false;
    for (const indicator of loadingIndicators) {
      if (await indicator.isVisible({ timeout: 1000 }).catch(() => false)) {
        hasLoadingState = true;
        break;
      }
    }

    // Button should be disabled during submission
    const isDisabled = await submitButton.isDisabled().catch(() => false);

    expect(hasLoadingState || isDisabled).toBeTruthy();
  });

  test("should persist authentication after page reload", async ({ page }) => {
    // Log in first
    await page.goto("/login");
    await page.fill(
      'input[type="email"], input[name="email"]',
      TEST_USER.email
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      TEST_USER.password
    );
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 15000 });

    // Reload the page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Verify user is still authenticated
    const authenticatedIndicators = [
      page.locator('button:has-text("Log Out"), button:has-text("Logout")'),
      page.locator('[data-testid="user-menu"]'),
      page.locator('nav a[href*="profile"], nav button:has-text("Profile")'),
    ];

    let isAuthenticated = false;
    for (const indicator of authenticatedIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        isAuthenticated = true;
        break;
      }
    }

    expect(isAuthenticated).toBeTruthy();
  });

  test("should work on mobile viewport", async ({ page }) => {
    // Set mobile viewport (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/login");

    // Verify form is responsive and visible
    await expect(page.locator("form")).toBeVisible();

    // Fill in credentials on mobile
    await page.fill(
      'input[type="email"], input[name="email"]',
      TEST_USER.email
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      TEST_USER.password
    );

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL("/", { timeout: 15000 });

    // Verify successful authentication
    expect(page.url()).toBe(new URL("/", page.url()).href);
  });
});

test.describe("Login Page Accessibility", () => {
  test("should have proper form labels and aria attributes", async ({
    page,
  }) => {
    await page.goto("/login");

    // Check for proper labeling
    const emailLabel = page.locator('label:has-text("Email")');
    const passwordLabel = page.locator('label:has-text("Password")');

    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();

    // Check that submit button is keyboard accessible
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.focus();
    expect(
      await submitButton.evaluate((el) => el === document.activeElement)
    ).toBeTruthy();
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/login");

    // Tab through form fields
    await page.keyboard.press("Tab");

    // Email field should be focused first (or login link in nav)
    // Continue tabbing to reach the form
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");

      // Check if we've reached the email input
      const activeElement = await page.evaluate(() => {
        const active = document.activeElement;
        return {
          tagName: active?.tagName,
          type: active?.getAttribute("type"),
          name: active?.getAttribute("name"),
        };
      });

      if (activeElement.type === "email" || activeElement.name === "email") {
        break;
      }
    }

    // Type email
    await page.keyboard.type(TEST_USER.email);

    // Tab to password
    await page.keyboard.press("Tab");
    await page.keyboard.type(TEST_USER.password);

    // Tab to submit button
    await page.keyboard.press("Tab");

    // Submit with Enter
    await page.keyboard.press("Enter");

    // Should redirect to homepage
    await page.waitForURL("/", { timeout: 15000 });
    expect(page.url()).toBe(new URL("/", page.url()).href);
  });
});
