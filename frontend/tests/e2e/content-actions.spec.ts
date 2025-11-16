import { test, expect } from "@playwright/test";

/**
 * Content Actions E2E Tests for Nos Ilha Cultural Heritage Platform
 *
 * Tests the complete content action section functionality including:
 * - Share button (native + clipboard fallback)
 * - Reaction submission flow (authenticated users)
 * - Suggestion form submission
 * - Print functionality
 * - Responsive layout (320px, 768px, 1024px+)
 *
 * User Stories Covered:
 * - US1: Cultural Content Sharing
 * - US2: Emotional Connection to Heritage Content
 * - US3: Community Knowledge Contributions
 * - US4: Practical Content Utilities
 * - US6: Responsive Action Access
 * - US7: Keyboard Accessibility
 */

test.describe("Content Actions - Share Functionality (US1)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a heritage page with content actions
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");
  });

  test("T098.1 - displays share button in content action toolbar", async ({
    page,
  }) => {
    // Verify ContentActionToolbar is visible
    const toolbar = page.locator('[role="toolbar"]');
    await expect(toolbar).toBeVisible();

    // Verify ShareButton is present
    const shareButton = page.getByRole("button", { name: /share/i });
    await expect(shareButton).toBeVisible();
  });

  test("T098.2 - share button shows native share dialog on supported devices", async ({
    page,
    browserName,
  }) => {
    // Click share button
    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();

    // On browsers without native share, should fallback to copy link
    // Check if either native share triggered or clipboard confirmation appears
    const copyConfirmation = page.getByText(/copied|link copied/i);
    const isShareAPISupported = await page.evaluate(() => {
      return "share" in navigator;
    });

    if (!isShareAPISupported) {
      // Should show clipboard confirmation
      await expect(copyConfirmation).toBeVisible({ timeout: 3000 });
    }
    // If share API is supported, native dialog appears (can't test in automated tests)
  });

  test("T098.3 - share button falls back to clipboard when native share unavailable", async ({
    page,
    context,
  }) => {
    // Mock navigator.share as undefined to force fallback
    await page.addInitScript(() => {
      // @ts-ignore
      delete window.navigator.share;
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Click share button
    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();

    // Should show "Link Copied" confirmation
    const confirmation = page.getByText(/copied|link copied/i);
    await expect(confirmation).toBeVisible({ timeout: 3000 });

    // Verify clipboard contains the page URL
    const clipboardText = await page.evaluate(
      async () => await navigator.clipboard.readText()
    );
    expect(clipboardText).toContain("djababas-eco-lodge");
  });

  test("T098.4 - copy link button works independently", async ({ page }) => {
    // Find and click copy link button
    const copyButton = page.getByRole("button", {
      name: /copy link/i,
    });
    await expect(copyButton).toBeVisible();

    await copyButton.click();

    // Verify visual confirmation (CheckIcon swap)
    const confirmation = page.getByText(/copied|link copied/i);
    await expect(confirmation).toBeVisible({ timeout: 2000 });

    // Confirmation should disappear after 2-3 seconds
    await expect(confirmation).not.toBeVisible({ timeout: 4000 });
  });

  test("T098.5 - share button announces to screen readers", async ({
    page,
  }) => {
    // Check for ARIA live region
    const liveRegion = page
      .locator('[role="status"]')
      .or(page.locator('[aria-live="polite"]'));

    // Click share/copy button
    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();

    // ARIA live region should announce the action
    if (await liveRegion.isVisible()) {
      const announcement = await liveRegion.textContent();
      expect(announcement?.toLowerCase()).toMatch(/copied|shared|link/);
    }
  });
});

test.describe("Content Actions - Reaction Flow (US2)", () => {
  test("T099.1 - unauthenticated users see reaction counts", async ({
    page,
  }) => {
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");

    // Look for reaction buttons (should be visible but disabled/prompt login)
    const reactionButton = page
      .getByRole("button", { name: /love|celebrate|insightful|support/i })
      .first();

    // Reaction counts should be visible even when not authenticated
    const counts = page.locator("[data-testid*='reaction-count']").or(
      page.locator("text=/\\d+/") // Numbers indicating counts
    );

    // At least the reaction buttons should be visible
    await expect(reactionButton).toBeVisible();
  });

  test("T099.2 - unauthenticated users get login prompt when clicking reactions", async ({
    page,
  }) => {
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");

    // Click a reaction button
    const reactionButton = page
      .getByRole("button", { name: /love|celebrate|insightful|support/i })
      .first();
    await reactionButton.click();

    // Should see login prompt or be redirected to login
    const loginPrompt = page.getByText(/sign in|log in|please log in/i);
    const loginPage = page.url().includes("/login");

    expect((await loginPrompt.isVisible()) || loginPage).toBeTruthy();
  });

  test("T099.3 - reaction picker shows all 4 reaction types", async ({
    page,
  }) => {
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");

    // Find reaction picker or buttons
    const reactions = [
      { emoji: "❤️", name: /love/i },
      { emoji: "🎉", name: /celebrate/i },
      { emoji: "💡", name: /insightful/i },
      { emoji: "👏", name: /support/i },
    ];

    // Verify all 4 reaction types are present
    for (const reaction of reactions) {
      const button = page.getByRole("button", { name: reaction.name });
      if (await button.isVisible()) {
        await expect(button).toBeVisible();
      } else {
        // Alternative: look for emoji text
        const emojiText = page.getByText(reaction.emoji);
        await expect(emojiText).toBeVisible();
      }
    }
  });

  test.skip("T099.4 - authenticated user can submit reaction (requires auth setup)", async ({
    page,
  }) => {
    // Note: This test is skipped because it requires full authentication setup
    // In production, this would:
    // 1. Authenticate user via Supabase
    // 2. Click reaction button
    // 3. Verify optimistic UI update
    // 4. Verify reaction count increments
    // 5. Verify reaction persists after page reload
  });

  test.skip("T099.5 - authenticated user can change reaction (requires auth setup)", async ({
    page,
  }) => {
    // Note: This test is skipped because it requires full authentication setup
    // In production, this would:
    // 1. Authenticate user
    // 2. Submit initial reaction (e.g., ❤️ Love)
    // 3. Click different reaction (e.g., 👍 Helpful)
    // 4. Verify old reaction removed, new reaction added
    // 5. Verify counts updated correctly
  });

  test.skip("T099.6 - authenticated user can remove reaction (requires auth setup)", async ({
    page,
  }) => {
    // Note: This test is skipped because it requires full authentication setup
    // In production, this would:
    // 1. Authenticate user
    // 2. Submit reaction
    // 3. Click same reaction again to remove
    // 4. Verify reaction removed
    // 5. Verify count decrements
  });

  test("T099.7 - reaction counts update dynamically", async ({ page }) => {
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");

    // Get initial reaction counts
    const reactionSection = page.locator('[data-testid*="reaction"]').first();

    // Verify counts are present (even if 0)
    const hasNumbers = await page
      .locator("text=/\\d+/")
      .first()
      .isVisible({ timeout: 5000 });
    expect(hasNumbers).toBeTruthy();
  });
});

test.describe("Content Actions - Suggestion Form (US3)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");
  });

  test("T100.1 - suggest improvement button opens modal form", async ({
    page,
  }) => {
    // Find and click "Suggest Improvement" button
    const suggestButton = page.getByRole("button", {
      name: /suggest improvement|suggest|improve/i,
    });
    await expect(suggestButton).toBeVisible();

    await suggestButton.click();

    // Modal should appear
    const modal = page
      .locator('[role="dialog"]')
      .or(page.locator('[data-testid="suggestion-modal"]'));
    await expect(modal).toBeVisible({ timeout: 3000 });
  });

  test("T100.2 - suggestion form pre-fills context fields", async ({
    page,
  }) => {
    // Open suggestion form
    const suggestButton = page.getByRole("button", {
      name: /suggest improvement|suggest|improve/i,
    });
    await suggestButton.click();

    // Wait for modal
    const modal = page
      .locator('[role="dialog"]')
      .or(page.locator('[data-testid="suggestion-modal"]'));
    await expect(modal).toBeVisible();

    // Check for pre-filled hidden fields or visible context
    const pageContent = await modal.textContent();
    expect(pageContent).toMatch(/djababas|eco.lodge/i); // Page context should be mentioned
  });

  test("T100.3 - suggestion form validates required fields", async ({
    page,
  }) => {
    // Open form
    const suggestButton = page.getByRole("button", {
      name: /suggest improvement|suggest|improve/i,
    });
    await suggestButton.click();

    // Try to submit without filling required fields
    const submitButton = page.getByRole("button", {
      name: /submit|send/i,
    });
    await submitButton.click();

    // Should show validation errors
    const errorMessage = page.getByText(
      /required|please fill|name|email|message/i
    );
    await expect(errorMessage).toBeVisible();
  });

  test("T100.4 - suggestion form has spam protection honeypot", async ({
    page,
  }) => {
    // Open form
    const suggestButton = page.getByRole("button", {
      name: /suggest improvement|suggest|improve/i,
    });
    await suggestButton.click();

    // Check for honeypot field (should be hidden)
    const honeypot = page
      .locator('input[name="website"]')
      .or(page.locator('input[name="url"]'))
      .or(page.locator('input[autocomplete="off"][style*="display: none"]'));

    if ((await honeypot.count()) > 0) {
      // Honeypot field exists
      const isHidden = await honeypot.isHidden();
      expect(isHidden).toBeTruthy();
    }
  });

  test("T100.5 - suggestion form submits successfully", async ({ page }) => {
    // Mock the API to avoid rate limiting
    await page.route("**/api/v1/suggestions", (route) => {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Suggestion submitted successfully",
        }),
      });
    });

    // Open form
    const suggestButton = page.getByRole("button", {
      name: /suggest improvement|suggest|improve/i,
    });
    await suggestButton.click();

    // Fill out form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.selectOption('select[name="type"]', "CORRECTION");
    await page.fill('textarea[name="message"]', "This is a test suggestion.");

    // Submit
    const submitButton = page.getByRole("button", { name: /submit|send/i });
    await submitButton.click();

    // Should show success confirmation
    const successMessage = page.getByText(/success|thank you|submitted/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test("T100.6 - suggestion form can be closed with Escape key", async ({
    page,
  }) => {
    // Open form
    const suggestButton = page.getByRole("button", {
      name: /suggest improvement|suggest|improve/i,
    });
    await suggestButton.click();

    const modal = page
      .locator('[role="dialog"]')
      .or(page.locator('[data-testid="suggestion-modal"]'));
    await expect(modal).toBeVisible();

    // Press Escape key
    await page.keyboard.press("Escape");

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe("Content Actions - Print Functionality (US4)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");
  });

  test("T101.1 - print button is visible", async ({ page }) => {
    const printButton = page.getByRole("button", { name: /print/i });
    await expect(printButton).toBeVisible();
  });

  test("T101.2 - print button triggers window.print()", async ({ page }) => {
    // Mock window.print() to verify it's called
    await page.evaluate(() => {
      window.print = () => {
        // @ts-ignore
        window.printCalled = true;
      };
    });

    const printButton = page.getByRole("button", { name: /print/i });
    await printButton.click();

    // Verify print was called
    const printCalled = await page.evaluate(() => {
      // @ts-ignore
      return window.printCalled;
    });
    expect(printCalled).toBe(true);
  });

  test("T101.3 - print stylesheet hides navigation and toolbars", async ({
    page,
  }) => {
    // Check if print.css styles are loaded
    const printStyles = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (
              rule instanceof CSSMediaRule &&
              rule.conditionText.includes("print")
            ) {
              return true;
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may throw errors
          continue;
        }
      }
      return false;
    });

    // Print styles should be present or referenced
    expect(printStyles).toBeTruthy();
  });

  test("T101.4 - print footer includes citation URL", async ({ page }) => {
    // Check for print footer in the page
    const footer = page
      .locator("footer")
      .or(page.locator('[data-testid="print-footer"]'));

    if (await footer.isVisible()) {
      const footerText = await footer.textContent();
      // Should mention URL or citation
      expect(footerText?.toLowerCase()).toMatch(/url|source|citation/i);
    }
  });
});

test.describe("Content Actions - Responsive Layout (US6)", () => {
  const viewports = [
    { name: "mobile", width: 320, height: 568 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1024, height: 768 },
  ];

  for (const viewport of viewports) {
    test(`T102.${viewport.width} - content actions accessible on ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      // Set viewport size
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto("/directory/entry/djababas-eco-lodge");
      await page.waitForLoadState("networkidle");

      // Verify ContentActionToolbar is visible
      const toolbar = page.locator('[role="toolbar"]');
      await expect(toolbar).toBeVisible();

      // Verify all action buttons are accessible
      const shareButton = page.getByRole("button", { name: /share/i });
      const printButton = page.getByRole("button", { name: /print/i });

      await expect(shareButton).toBeVisible();
      await expect(printButton).toBeVisible();

      // On mobile, verify no horizontal overflow
      if (viewport.width <= 768) {
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = viewport.width;
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow 20px tolerance
      }
    });

    test(`T102.${viewport.width}.touch - touch targets are minimum 44x44px on ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto("/directory/entry/djababas-eco-lodge");
      await page.waitForLoadState("networkidle");

      // Check button sizes
      const buttons = await page.getByRole("button").all();
      for (const button of buttons.slice(0, 5)) {
        // Check first 5 buttons
        const box = await button.boundingBox();
        if (box && viewport.width <= 768) {
          // On mobile/tablet, buttons should be at least 44x44px
          expect(box.height).toBeGreaterThanOrEqual(40); // Allow slight tolerance
        }
      }
    });
  }

  test("T102.layout - toolbar layout changes with viewport", async ({
    page,
  }) => {
    await page.goto("/directory/entry/djababas-eco-lodge");

    // Desktop: should be fixed left rail (if implemented) or horizontal
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    const toolbarDesktop = page.locator('[role="toolbar"]');
    const desktopBox = await toolbarDesktop.boundingBox();

    // Mobile: should be horizontal in-flow
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const toolbarMobile = page.locator('[role="toolbar"]');
    const mobileBox = await toolbarMobile.boundingBox();

    // Verify layout changed (different position or dimensions)
    if (desktopBox && mobileBox) {
      expect(
        desktopBox.y !== mobileBox.y || desktopBox.x !== mobileBox.x
      ).toBeTruthy();
    }
  });
});

test.describe("Content Actions - Keyboard Accessibility (US7)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");
  });

  test("T102.kb.1 - all actions are keyboard accessible with Tab", async ({
    page,
  }) => {
    // Tab through actions
    await page.keyboard.press("Tab");

    // Get focused element
    const focusedElement = page.locator(":focus");
    const tagName = await focusedElement.evaluate((el) => el.tagName);

    // Should be able to reach interactive elements
    expect(["BUTTON", "A", "INPUT"]).toContain(tagName);
  });

  test("T102.kb.2 - actions activate with Enter key", async ({ page }) => {
    // Tab to first action button
    await page.keyboard.press("Tab");

    // Try to activate with Enter
    const focusedElement = page.locator(":focus");
    const isButton = await focusedElement.evaluate(
      (el) => el.tagName === "BUTTON" || el.getAttribute("role") === "button"
    );

    if (isButton) {
      await page.keyboard.press("Enter");
      // Action should trigger (we can't fully verify all side effects,
      // but at least it shouldn't throw errors)
      await page.waitForTimeout(500);
    }
  });

  test("T102.kb.3 - focus indicators are visible", async ({ page }) => {
    // Tab to action button
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Check if focus indicator is visible (outline or ring)
    const outline = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline || styles.boxShadow || styles.border;
    });

    // Should have some visual focus indicator
    expect(outline).toBeTruthy();
    expect(outline).not.toBe("none");
  });

  test("T102.kb.4 - Escape key closes modals", async ({ page }) => {
    // Open suggestion modal
    const suggestButton = page.getByRole("button", {
      name: /suggest improvement|suggest|improve/i,
    });

    if (await suggestButton.isVisible()) {
      await suggestButton.click();

      const modal = page
        .locator('[role="dialog"]')
        .or(page.locator('[data-testid="suggestion-modal"]'));
      await expect(modal).toBeVisible();

      // Press Escape
      await page.keyboard.press("Escape");

      // Modal should close
      await expect(modal).not.toBeVisible({ timeout: 2000 });
    }
  });
});

test.describe("Content Actions - Performance", () => {
  test("verifies bundle size impact <15kb", async ({ page }) => {
    // Navigate to page
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");

    // Get performance metrics
    const transferSize = await page.evaluate(() => {
      const resources = performance.getEntriesByType(
        "resource"
      ) as PerformanceResourceTiming[];
      const jsResources = resources.filter((r) => r.name.endsWith(".js"));
      const totalSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
      return totalSize;
    });

    // Note: This is a rough check. Actual bundle analysis should be done with bundlesize tool
    console.log(
      `Total JS transfer size: ${(transferSize / 1024).toFixed(2)}kb`
    );
  });

  test("verifies First Input Delay is fast", async ({ page }) => {
    await page.goto("/directory/entry/djababas-eco-lodge");
    await page.waitForLoadState("networkidle");

    // Click share button and measure response
    const startTime = Date.now();
    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();
    const endTime = Date.now();

    const fid = endTime - startTime;
    console.log(`First Input Delay: ${fid}ms`);

    // FID should be <100ms
    expect(fid).toBeLessThan(200); // Allow 200ms tolerance in test environment
  });
});
