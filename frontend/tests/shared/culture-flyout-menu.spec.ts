import { test, expect } from '@playwright/test';

/**
 * Culture Flyout Menu Integration Tests for Nos Ilha Tourism Platform
 * 
 * These tests verify the culture navigation flyout menu functionality,
 * ensuring visitors can easily access cultural heritage content about
 * Brava Island.
 * 
 * Key aspects tested:
 * - Flyout menu opens and displays all cultural content links
 * - Proper positioning ensures all menu items are visible
 * - Active state styling works correctly for culture pages
 * - Navigation functionality works as expected for tourism discovery
 */

test.describe('Culture Flyout Menu - Cultural Heritage Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage for consistent test starting point
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('displays all culture menu items when opened with proper positioning', async ({ page }) => {
    // Set desktop viewport to see the culture flyout button
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Open the culture flyout menu
    const cultureButton = page.getByRole('button', { name: /culture/i });
    await expect(cultureButton).toBeVisible();
    await cultureButton.click();
    
    // Wait for the flyout panel to appear
    const flyoutPanel = page.locator('[role="dialog"], .absolute.left-1\\/2');
    await expect(flyoutPanel).toBeVisible();
    
    // Verify all 3 culture menu items are visible within the flyout panel
    const flyoutHistoryLink = flyoutPanel.getByRole('link', { name: /history of brava/i });
    const flyoutFiguresLink = flyoutPanel.getByRole('link', { name: /historical figures/i });
    const flyoutGalleryLink = flyoutPanel.getByRole('link', { name: /photo galleries/i });
    
    await expect(flyoutHistoryLink).toBeVisible();
    await expect(flyoutFiguresLink).toBeVisible();
    await expect(flyoutGalleryLink).toBeVisible();
    
    // Check positioning - verify first item is properly positioned below header
    const firstItemBox = await flyoutHistoryLink.boundingBox();
    expect(firstItemBox).not.toBeNull();
    
    if (firstItemBox) {
      // Header height is 64px (h-16), first item should be well below it
      expect(firstItemBox.y).toBeGreaterThan(64);
      // First item should be visible (not cut off at top)
      expect(firstItemBox.y).toBeGreaterThan(80); // Extra margin for safety
    }
    
    // Verify each item has proper content and icons
    await expect(flyoutHistoryLink).toContainText('History of Brava');
    await expect(flyoutHistoryLink).toContainText('Discover the island\'s rich past');
    
    await expect(flyoutFiguresLink).toContainText('Historical Figures');
    await expect(flyoutFiguresLink).toContainText('Meet the people who shaped Brava');
    
    await expect(flyoutGalleryLink).toContainText('Photo Galleries');
    await expect(flyoutGalleryLink).toContainText('Visual stories of Brava\'s beauty');
  });

  test('culture button shows active state only on culture pages', async ({ page }) => {
    // Set desktop viewport to see the culture flyout button
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Test inactive state on homepage
    const cultureButton = page.getByRole('button', { name: /culture/i });
    await expect(cultureButton).toBeVisible();
    
    // Should not have active border styling on homepage
    await expect(cultureButton).not.toHaveClass(/border-ocean-blue/);
    
    // Navigate to a culture page (history)
    await page.goto('/history');
    
    // Now the culture button should show active state
    const cultureButtonOnHistory = page.getByRole('button', { name: /culture/i });
    await expect(cultureButtonOnHistory).toHaveClass(/border-ocean-blue/);
    
    // Test on another culture page (people)
    await page.goto('/people');
    const cultureButtonOnPeople = page.getByRole('button', { name: /culture/i });
    await expect(cultureButtonOnPeople).toHaveClass(/border-ocean-blue/);
    
    // Test on non-culture page should not show active
    await page.goto('/map');
    const cultureButtonOnMap = page.getByRole('button', { name: /culture/i });
    await expect(cultureButtonOnMap).not.toHaveClass(/border-ocean-blue/);
  });

  test('culture flyout navigation works correctly for tourism discovery', async ({ page }) => {
    // Set desktop viewport to see the culture flyout button
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Open culture flyout from homepage
    await page.getByRole('button', { name: /culture/i }).click();
    
    // Test navigation to History of Brava
    await page.getByRole('link', { name: /history of brava/i }).click();
    await expect(page).toHaveURL('/history');
    
    // Verify we're on the history page with cultural content
    await expect(page.getByRole('heading')).toContainText(/history/i);
    
    // Go back and test Historical Figures navigation
    await page.goto('/');
    await page.getByRole('button', { name: /culture/i }).click();
    await page.getByRole('link', { name: /historical figures/i }).click();
    await expect(page).toHaveURL('/people');
    
    // Go back and test Photo Galleries navigation
    await page.goto('/');
    await page.getByRole('button', { name: /culture/i }).click();
    await page.getByRole('link', { name: /photo galleries/i }).click();
    await expect(page).toHaveURL('/media/photos');
  });

  test('flyout menu closes when clicking outside', async ({ page }) => {
    // Set desktop viewport to see the culture flyout button
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Open the culture flyout
    await page.getByRole('button', { name: /culture/i }).click();
    
    // Verify it's open
    const historyLink = page.getByRole('link', { name: /history of brava/i });
    await expect(historyLink).toBeVisible();
    
    // Click outside the flyout (on the main content area)
    await page.click('main'); // Click on main content area
    
    // Verify the flyout is closed
    await expect(historyLink).not.toBeVisible();
  });

  test('flyout menu works correctly on mobile viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // On mobile, the culture menu should be in the mobile navigation
    // Open mobile menu first
    const mobileMenuButton = page.getByRole('button', { name: /open main menu/i });
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Look for culture section in mobile menu
      const cultureSection = page.getByText('Culture').first();
      await expect(cultureSection).toBeVisible();
      
      // Verify culture links are present in mobile menu
      await expect(page.getByRole('link', { name: /history of brava/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /historical figures/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /photo galleries/i })).toBeVisible();
    }
  });

  test('flyout menu has proper accessibility attributes', async ({ page }) => {
    // Set desktop viewport to see the culture flyout button
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const cultureButton = page.getByRole('button', { name: /culture/i });
    
    // Verify button has proper role and is accessible
    await expect(cultureButton).toBeVisible();
    await expect(cultureButton).toBeEnabled();
    
    // Open flyout
    await cultureButton.click();
    
    // Verify links are properly accessible
    const historyLink = page.getByRole('link', { name: /history of brava/i });
    const figuresLink = page.getByRole('link', { name: /historical figures/i });
    const galleryLink = page.getByRole('link', { name: /photo galleries/i });
    
    await expect(historyLink).toBeVisible();
    await expect(figuresLink).toBeVisible();
    await expect(galleryLink).toBeVisible();
    
    // Verify links have proper href attributes
    await expect(historyLink).toHaveAttribute('href', '/history');
    await expect(figuresLink).toHaveAttribute('href', '/people');
    await expect(galleryLink).toHaveAttribute('href', '/media/photos');
  });
});