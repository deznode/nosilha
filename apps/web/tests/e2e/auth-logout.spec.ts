/**
 * E2E Test T016: Authentication Logout Flow
 *
 * This test verifies that authenticated users can successfully log out of the
 * Nos Ilha platform, clearing their session and returning to public access.
 *
 * Test Coverage:
 * - Logout button visibility for authenticated users
 * - Session clearing on logout
 * - Redirect to homepage after logout
 * - Authentication state properly cleared
 * - Protected routes become inaccessible after logout
 *
 * Requirements:
 * - FR-001: Test execution time < 5 minutes
 * - Supabase Auth session management
 * - Secure logout with complete session cleanup
 */

import { test, expect } from "@playwright/test";

/**
 * Test data configuration
 */
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "test@nosilha.com",
  password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
};

/**
 * Helper function to log in a user
 */
async function loginUser(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
  await page.fill(
    'input[type="password"], input[name="password"]',
    TEST_USER.password
  );
  await page.click('button[type="submit"]');
  await page.waitForURL("/", { timeout: 15000 });
}

test.describe("Authentication Logout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state before each test
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display logout button when user is authenticated", async ({
    page,
  }) => {
    // Log in first
    await loginUser(page);

    // Verify logout button or user menu is visible
    const logoutButton = page.locator(
      'button:has-text("Log Out"), button:has-text("Logout")'
    );
    const userMenu = page.locator('[data-testid="user-menu"]');

    // Either direct logout button or user menu should be visible
    const hasLogoutAccess =
      (await logoutButton.isVisible().catch(() => false)) ||
      (await userMenu.isVisible().catch(() => false));

    expect(hasLogoutAccess).toBeTruthy();
  });

  test("should successfully log out and redirect to homepage", async ({
    page,
  }) => {
    // Log in first
    await loginUser(page);

    // Find and click logout button
    // The logout button might be directly visible or in a dropdown menu
    const directLogoutButton = page
      .locator('button:has-text("Log Out"), button:has-text("Logout")')
      .first();

    // Check if we need to open a menu first
    const userMenuButton = page.locator(
      '[data-testid="user-menu"], button:has([data-testid="user-avatar"])'
    );

    if (await userMenuButton.isVisible().catch(() => false)) {
      // Click to open menu
      await userMenuButton.click();
      // Wait for menu to open
      await page.waitForTimeout(500);
    }

    // Click logout button
    if (await directLogoutButton.isVisible().catch(() => false)) {
      await directLogoutButton.click();
    } else {
      // Look for logout in menu items
      const menuLogout = page.locator(
        '[role="menuitem"]:has-text("Log Out"), [role="menuitem"]:has-text("Logout")'
      );
      await menuLogout.click();
    }

    // Wait for redirect (should go to homepage or stay on current page)
    await page.waitForLoadState("networkidle");

    // Verify authentication indicators are no longer visible
    const authenticatedIndicators = [
      page.locator('button:has-text("Log Out"), button:has-text("Logout")'),
      page.locator('[data-testid="user-menu"]'),
      page.locator('nav a[href*="profile"]'),
    ];

    // All authenticated indicators should be hidden
    for (const indicator of authenticatedIndicators) {
      const isVisible = await indicator.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    }

    // Login link should now be visible
    const loginLink = page.locator('a[href="/login"], a:has-text("Log In")');
    await expect(loginLink).toBeVisible({ timeout: 5000 });
  });

  test("should clear session data on logout", async ({ page }) => {
    // Log in
    await loginUser(page);

    // Check that we have session data
    const hasSessionBefore = await page.evaluate(() => {
      return (
        Object.keys(localStorage).length > 0 ||
        Object.keys(sessionStorage).length > 0 ||
        document.cookie.length > 0
      );
    });

    expect(hasSessionBefore).toBeTruthy();

    // Log out
    const logoutButton = page
      .locator('button:has-text("Log Out"), button:has-text("Logout")')
      .first();

    // Open menu if needed
    const userMenuButton = page.locator('[data-testid="user-menu"]');
    if (await userMenuButton.isVisible().catch(() => false)) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
    }

    // Click logout
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
    } else {
      const menuLogout = page.locator('[role="menuitem"]:has-text("Log Out")');
      await menuLogout.click();
    }

    await page.waitForLoadState("networkidle");

    // Verify Supabase auth session is cleared
    const supabaseSessionCleared = await page.evaluate(() => {
      // Check for Supabase auth keys in localStorage
      const authKeys = Object.keys(localStorage).filter(
        (key) => key.includes("supabase") || key.includes("auth")
      );
      return authKeys.length === 0;
    });

    expect(supabaseSessionCleared).toBeTruthy();
  });

  test("should prevent access to protected routes after logout", async ({
    page,
  }) => {
    // Log in
    await loginUser(page);

    // Navigate to a protected route (admin area)
    await page.goto("/admin");

    // If admin page exists and user has access, we should see it
    // Store whether we could access it
    const adminAccessibleWhileLoggedIn = !page.url().includes("/login");

    // Log out
    await page.goto("/");
    const logoutButton = page
      .locator('button:has-text("Log Out"), button:has-text("Logout")')
      .first();

    const userMenuButton = page.locator('[data-testid="user-menu"]');
    if (await userMenuButton.isVisible().catch(() => false)) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
    }

    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
    } else {
      const menuLogout = page.locator('[role="menuitem"]:has-text("Log Out")');
      await menuLogout.click();
    }

    await page.waitForLoadState("networkidle");

    // Try to access admin route again
    await page.goto("/admin");

    // Should be redirected to login page
    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    // If admin was accessible before, it should redirect to login now
    if (adminAccessibleWhileLoggedIn) {
      expect(page.url()).toContain("/login");
    }
  });

  test("should persist logout after page reload", async ({ page }) => {
    // Log in
    await loginUser(page);

    // Log out
    const logoutButton = page
      .locator('button:has-text("Log Out"), button:has-text("Logout")')
      .first();

    const userMenuButton = page.locator('[data-testid="user-menu"]');
    if (await userMenuButton.isVisible().catch(() => false)) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
    }

    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
    } else {
      const menuLogout = page.locator('[role="menuitem"]:has-text("Log Out")');
      await menuLogout.click();
    }

    await page.waitForLoadState("networkidle");

    // Reload the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // User should still be logged out
    const loginLink = page.locator('a[href="/login"], a:has-text("Log In")');
    await expect(loginLink).toBeVisible();

    // Authenticated indicators should not be visible
    const logoutAfterReload = page.locator(
      'button:has-text("Log Out"), button:has-text("Logout")'
    );
    const isStillLoggedOut = !(await logoutAfterReload
      .isVisible()
      .catch(() => false));

    expect(isStillLoggedOut).toBeTruthy();
  });

  test("should work on mobile viewport", async ({ page }) => {
    // Set mobile viewport (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });

    // Log in on mobile
    await loginUser(page);

    // On mobile, logout might be in a hamburger menu
    const mobileMenuButton = page.locator(
      'button[aria-label*="menu"], button:has-text("Menu")'
    );

    if (await mobileMenuButton.isVisible().catch(() => false)) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
    }

    // Find logout button
    const logoutButton = page
      .locator('button:has-text("Log Out"), button:has-text("Logout")')
      .first();

    // Open user menu if it exists
    const userMenuButton = page.locator('[data-testid="user-menu"]');
    if (await userMenuButton.isVisible().catch(() => false)) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
    }

    // Click logout
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
    } else {
      const menuLogout = page.locator('[role="menuitem"]:has-text("Log Out")');
      await menuLogout.click();
    }

    await page.waitForLoadState("networkidle");

    // Verify logout successful
    const loginLink = page.locator('a[href="/login"], a:has-text("Log In")');
    await expect(loginLink).toBeVisible();
  });

  test("should handle logout during slow network conditions", async ({
    page,
  }) => {
    // Throttle network to simulate slow connection
    await page.route("**/*", (route) => {
      setTimeout(() => route.continue(), 500); // Add 500ms delay
    });

    // Log in
    await loginUser(page);

    // Log out
    const logoutButton = page
      .locator('button:has-text("Log Out"), button:has-text("Logout")')
      .first();

    const userMenuButton = page.locator('[data-testid="user-menu"]');
    if (await userMenuButton.isVisible().catch(() => false)) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
    }

    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
    } else {
      const menuLogout = page.locator('[role="menuitem"]:has-text("Log Out")');
      await menuLogout.click();
    }

    // Wait for logout to complete even with slow network
    await page.waitForLoadState("networkidle", { timeout: 30000 });

    // Verify logout successful
    const loginLink = page.locator('a[href="/login"], a:has-text("Log In")');
    await expect(loginLink).toBeVisible();
  });
});

test.describe("Logout Edge Cases", () => {
  test("should handle logout when session already expired", async ({
    page,
  }) => {
    // Log in
    await loginUser(page);

    // Manually clear the session to simulate expiration
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to log out
    await page.goto("/");

    // User should already appear logged out
    const loginLink = page.locator('a[href="/login"], a:has-text("Log In")');

    // Either login link is visible, or attempting logout doesn't cause errors
    const isLoggedOut = await loginLink.isVisible().catch(() => false);

    expect(isLoggedOut).toBeTruthy();
  });

  test("should handle logout button click multiple times", async ({ page }) => {
    // Log in
    await loginUser(page);

    // Find logout button
    const logoutButton = page
      .locator('button:has-text("Log Out"), button:has-text("Logout")')
      .first();

    const userMenuButton = page.locator('[data-testid="user-menu"]');
    if (await userMenuButton.isVisible().catch(() => false)) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
    }

    // Click logout multiple times rapidly
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      await logoutButton.click().catch(() => {}); // Second click might fail if button disappears
    } else {
      const menuLogout = page.locator('[role="menuitem"]:has-text("Log Out")');
      await menuLogout.click();
    }

    await page.waitForLoadState("networkidle");

    // Should still successfully log out without errors
    const loginLink = page.locator('a[href="/login"], a:has-text("Log In")');
    await expect(loginLink).toBeVisible();
  });
});
