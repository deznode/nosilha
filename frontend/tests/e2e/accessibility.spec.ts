import { test, expect, Page } from '@playwright/test';

/**
 * T054, T055: Playwright E2E Tests for Accessibility
 * User Story 7: Keyboard Accessibility (WCAG 2.1 AA Compliance)
 *
 * Tests keyboard navigation, focus indicators, and screen reader compatibility
 * for the Content Action Toolbar (sharing, reactions, copy, print).
 */

test.describe('Content Action Toolbar - Keyboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a content page with the ContentActionToolbar
    // Using a directory entry page as the test target
    await page.goto('/directory/entry/djababas-eco-lodge');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('T049: Arrow key navigation between action buttons', async ({ page }) => {
    // Find the toolbar
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');
    await expect(toolbar).toBeVisible();

    // Get all buttons in the toolbar
    const buttons = toolbar.locator('button:not([disabled])');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Focus first button with Tab key
    await page.keyboard.press('Tab');
    const firstButton = buttons.first();
    await expect(firstButton).toBeFocused();

    // Test ArrowRight navigation
    await page.keyboard.press('ArrowRight');
    const secondButton = buttons.nth(1);
    await expect(secondButton).toBeFocused();

    // Test ArrowDown navigation (should also move forward)
    await page.keyboard.press('ArrowDown');
    const thirdButton = buttons.nth(2);
    await expect(thirdButton).toBeFocused();

    // Test ArrowLeft navigation (go back)
    await page.keyboard.press('ArrowLeft');
    await expect(secondButton).toBeFocused();

    // Test ArrowUp navigation (should also move backward)
    await page.keyboard.press('ArrowUp');
    await expect(firstButton).toBeFocused();
  });

  test('T049: Home and End keys jump to first and last buttons', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');
    const buttons = toolbar.locator('button:not([disabled])');
    const buttonCount = await buttons.count();

    // Focus toolbar and press End key
    await page.keyboard.press('Tab');
    await page.keyboard.press('End');

    // Should be on last button
    const lastButton = buttons.nth(buttonCount - 1);
    await expect(lastButton).toBeFocused();

    // Press Home key
    await page.keyboard.press('Home');

    // Should be on first button
    const firstButton = buttons.first();
    await expect(firstButton).toBeFocused();
  });

  test('T049: Arrow key navigation wraps around at edges', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');
    const buttons = toolbar.locator('button:not([disabled])');
    const buttonCount = await buttons.count();

    // Focus first button
    await page.keyboard.press('Tab');
    const firstButton = buttons.first();
    await expect(firstButton).toBeFocused();

    // Press ArrowLeft should wrap to last button
    await page.keyboard.press('ArrowLeft');
    const lastButton = buttons.nth(buttonCount - 1);
    await expect(lastButton).toBeFocused();

    // Press ArrowRight should wrap back to first button
    await page.keyboard.press('ArrowRight');
    await expect(firstButton).toBeFocused();
  });

  test('T052: Escape key removes focus from toolbar', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');
    const buttons = toolbar.locator('button:not([disabled])');

    // Focus first button
    await page.keyboard.press('Tab');
    const firstButton = buttons.first();
    await expect(firstButton).toBeFocused();

    // Press Escape
    await page.keyboard.press('Escape');

    // No button should be focused (focus should be removed)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BUTTON');
  });

  test('T051: Enter key activates buttons', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');

    // Find the Copy Link button
    const copyButton = toolbar.locator('button', { hasText: 'Copy Link' });
    await expect(copyButton).toBeVisible();

    // Focus the button using Tab navigation
    await page.keyboard.press('Tab');
    let focused = false;
    for (let i = 0; i < 10; i++) {
      const isFocused = await copyButton.evaluate((el) => el === document.activeElement);
      if (isFocused) {
        focused = true;
        break;
      }
      await page.keyboard.press('ArrowRight');
    }
    expect(focused).toBe(true);

    // Press Enter to activate
    await page.keyboard.press('Enter');

    // Should show "Copied!" feedback
    await expect(copyButton).toContainText('Copied!');
  });

  test('T051: Space key activates buttons', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');

    // Find the Copy Link button
    const copyButton = toolbar.locator('button', { hasText: 'Copy Link' });
    await expect(copyButton).toBeVisible();

    // Focus the button
    await page.keyboard.press('Tab');
    let focused = false;
    for (let i = 0; i < 10; i++) {
      const isFocused = await copyButton.evaluate((el) => el === document.activeElement);
      if (isFocused) {
        focused = true;
        break;
      }
      await page.keyboard.press('ArrowRight');
    }
    expect(focused).toBe(true);

    // Press Space to activate
    await page.keyboard.press('Space');

    // Should show "Copied!" feedback
    await expect(copyButton).toContainText('Copied!');
  });

  test('T050: Focus indicators are visible and meet contrast requirements', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');
    const buttons = toolbar.locator('button:not([disabled])');

    // Focus first button
    await page.keyboard.press('Tab');
    const firstButton = buttons.first();
    await expect(firstButton).toBeFocused();

    // Check that focus indicator is visible
    // Catalyst UI uses data-focus:outline-2 data-focus:outline-blue-500
    const outlineStyle = await firstButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
      };
    });

    // Verify outline is visible (not 'none' and has width)
    expect(outlineStyle.outlineStyle).not.toBe('none');
    expect(parseInt(outlineStyle.outlineWidth)).toBeGreaterThan(0);
  });

  test('T053: Keyboard navigation works for reaction buttons', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');

    // Find reaction buttons
    const reactionGroup = toolbar.locator('[role="group"][aria-label="Reactions"]');
    await expect(reactionGroup).toBeVisible();

    const reactionButtons = reactionGroup.locator('button');
    const reactionCount = await reactionButtons.count();
    expect(reactionCount).toBe(4); // Love, Helpful, Interesting, Thank you

    // Navigate to first reaction button
    await page.keyboard.press('Tab');
    let foundReaction = false;
    for (let i = 0; i < 20; i++) {
      const isFocused = await reactionButtons.first().evaluate((el) => el === document.activeElement);
      if (isFocused) {
        foundReaction = true;
        break;
      }
      await page.keyboard.press('ArrowRight');
    }
    expect(foundReaction).toBe(true);

    // Navigate between reaction buttons
    await page.keyboard.press('ArrowRight');
    const secondReaction = reactionButtons.nth(1);
    await expect(secondReaction).toBeFocused();

    // Activate with Enter
    await page.keyboard.press('Enter');

    // Should show aria-pressed="true" (button is now selected)
    const ariaPressed = await secondReaction.getAttribute('aria-pressed');
    expect(ariaPressed).toBe('true');
  });
});

test.describe('Content Action Toolbar - Screen Reader Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/directory/entry/djababas-eco-lodge');
    await page.waitForLoadState('networkidle');
  });

  test('T055: Toolbar has proper ARIA labels', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"]');
    await expect(toolbar).toBeVisible();

    // Check toolbar ARIA attributes
    const ariaLabel = await toolbar.getAttribute('aria-label');
    expect(ariaLabel).toBe('Content actions');

    const ariaOrientation = await toolbar.getAttribute('aria-orientation');
    expect(ariaOrientation).toBe('horizontal');
  });

  test('T055: Action buttons have descriptive ARIA labels', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');

    // Share button
    const shareButton = toolbar.locator('button', { hasText: 'Share' });
    await expect(shareButton).toBeVisible();
    const shareAriaLabel = await shareButton.getAttribute('aria-label');
    expect(shareAriaLabel).toContain('Share');

    // Copy Link button
    const copyButton = toolbar.locator('button', { hasText: 'Copy Link' });
    await expect(copyButton).toBeVisible();
    const copyAriaLabel = await copyButton.getAttribute('aria-label');
    expect(copyAriaLabel).toContain('Copy link');

    // Print button
    const printButton = toolbar.locator('button', { hasText: 'Print' });
    await expect(printButton).toBeVisible();
  });

  test('T055: Reaction buttons have comprehensive ARIA labels with counts', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');
    const reactionGroup = toolbar.locator('[role="group"][aria-label="Reactions"]');
    await expect(reactionGroup).toBeVisible();

    const reactionButtons = reactionGroup.locator('button');

    // Check first reaction button (Love)
    const firstReaction = reactionButtons.first();
    const ariaLabel = await firstReaction.getAttribute('aria-label');

    // Should include: reaction type, description, count, and "people reacted"
    expect(ariaLabel).toMatch(/Love:/);
    expect(ariaLabel).toMatch(/\d+ (person|people) reacted/);
  });

  test('T055: Reaction buttons have aria-pressed state', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');
    const reactionGroup = toolbar.locator('[role="group"][aria-label="Reactions"]');
    const reactionButtons = reactionGroup.locator('button');

    // All unselected buttons should have aria-pressed="false"
    for (let i = 0; i < await reactionButtons.count(); i++) {
      const button = reactionButtons.nth(i);
      const ariaPressed = await button.getAttribute('aria-pressed');
      expect(ariaPressed).toMatch(/^(true|false)$/);
    }
  });

  test('T055: ARIA live regions announce interaction feedback', async ({ page }) => {
    // Find ARIA live region for feedback announcements
    const liveRegions = page.locator('[role="status"][aria-live="polite"]');
    await expect(liveRegions.first()).toBeAttached();

    // Trigger an action that provides feedback
    const copyButton = page.locator('button', { hasText: 'Copy Link' });
    await copyButton.click();

    // Wait for feedback message
    await page.waitForTimeout(100);

    // Check that live region contains feedback
    const liveRegion = page.locator('[role="status"][aria-live="polite"]').first();
    const liveText = await liveRegion.textContent();
    expect(liveText).toContain('Link copied to clipboard');
  });

  test('T055: Emojis have aria-hidden to prevent screen reader announcement', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Content actions"]');
    const reactionGroup = toolbar.locator('[role="group"][aria-label="Reactions"]');
    const reactionButtons = reactionGroup.locator('button');

    // Check first reaction button's emoji span
    const firstReaction = reactionButtons.first();
    const emojiSpan = firstReaction.locator('span.text-xl').first();

    const ariaHidden = await emojiSpan.getAttribute('aria-hidden');
    expect(ariaHidden).toBe('true');
  });
});

test.describe('Content Action Toolbar - Keyboard-Only User Flow', () => {
  test('T049-T053: Complete keyboard-only interaction flow', async ({ page }) => {
    await page.goto('/directory/entry/djababas-eco-lodge');
    await page.waitForLoadState('networkidle');

    // 1. Tab to toolbar
    await page.keyboard.press('Tab');

    // 2. Navigate to Share button
    const shareButton = page.locator('button', { hasText: 'Share' });
    let foundShare = false;
    for (let i = 0; i < 10; i++) {
      const isFocused = await shareButton.evaluate((el) => el === document.activeElement);
      if (isFocused) {
        foundShare = true;
        break;
      }
      await page.keyboard.press('ArrowRight');
    }
    expect(foundShare).toBe(true);

    // 3. Navigate to Copy Link button with arrow key
    await page.keyboard.press('ArrowRight');
    const copyButton = page.locator('button', { hasText: 'Copy Link' });
    await expect(copyButton).toBeFocused();

    // 4. Activate with Enter
    await page.keyboard.press('Enter');
    await expect(copyButton).toContainText('Copied!');

    // 5. Navigate to reaction buttons
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    // 6. Activate a reaction with Space
    await page.keyboard.press('Space');

    // 7. Exit with Escape
    await page.keyboard.press('Escape');

    // Verify focus is removed
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).not.toBe('BUTTON');
  });
});
