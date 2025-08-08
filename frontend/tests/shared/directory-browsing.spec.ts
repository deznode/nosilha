import { test, expect } from '@playwright/test';

/**
 * Directory Browsing Integration Tests for Nos Ilha Tourism Platform
 * 
 * Tests the core directory browsing experience that allows tourists
 * to discover restaurants, hotels, beaches, and landmarks on Brava Island.
 * 
 * Key tourism scenarios:
 * - Browse all directory entries with category filtering
 * - View detailed business/location information
 * - Navigate between different categories seamlessly
 * - Mobile-optimized browsing for on-the-go tourists
 * - Graceful handling of connectivity issues (common in Cape Verde)
 */

test.describe('Directory Browsing - Core Tourism Discovery', () => {
  
  test('displays comprehensive directory of island businesses and landmarks', async ({ page }) => {
    await page.goto('/directory/all');
    
    // Verify directory page loads with proper heading
    await expect(page.getByRole('heading', { name: /directory/i })).toBeVisible();
    
    // Check for directory entries grid
    const directoryGrid = page.locator('[data-testid="directory-grid"]').or(
      page.locator('.grid').filter({ hasText: /restaurant|hotel|beach|landmark/i })
    );
    await expect(directoryGrid).toBeVisible();
    
    // Verify directory cards are present
    const directoryCards = page.locator('[data-testid="directory-card"]').or(
      page.locator('.card, .entry-card').filter({ hasText: /restaurant|hotel|beach|landmark/i })
    );
    
    const cardCount = await directoryCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check first card has essential tourism information
    const firstCard = directoryCards.first();
    await expect(firstCard.locator('h3, h2').first()).toBeVisible(); // Business name
    await expect(firstCard.locator('p').first()).toBeVisible(); // Description
    
    // Verify category badge is visible
    const categoryBadge = firstCard.locator('[data-testid="category-badge"]').or(
      firstCard.locator('span').filter({ hasText: /restaurant|hotel|beach|landmark/i })
    );
    await expect(categoryBadge).toBeVisible();
  });

  test('enables category-specific browsing for targeted tourism discovery', async ({ page }) => {
    // Test restaurant category
    await page.goto('/directory/Restaurant');
    await expect(page.getByRole('heading', { name: /restaurants?/i })).toBeVisible();
    
    // Verify only restaurants are shown
    const categoryCards = page.locator('[data-testid="directory-card"]').or(
      page.locator('.card, .entry-card')
    );
    
    if (await categoryCards.count() > 0) {
      const firstCard = categoryCards.first();
      const categoryText = await firstCard.textContent();
      expect(categoryText?.toLowerCase()).toContain('restaurant');
    }
    
    // Test navigation between categories
    const categories = ['Hotel', 'Beach', 'Landmark'];
    
    for (const category of categories) {
      await page.goto(`/directory/${category}`);
      await expect(page.getByRole('heading', { name: new RegExp(category, 'i') })).toBeVisible();
      
      // Verify URL is correct
      expect(page.url()).toContain(`/directory/${category}`);
    }
  });

  test('provides detailed information for tourism decision making', async ({ page }) => {
    await page.goto('/directory/all');
    
    // Find and click on a directory card
    const directoryCards = page.locator('[data-testid="directory-card"]').or(
      page.locator('a').filter({ hasText: /restaurant|hotel|beach|landmark/i }).first()
    );
    
    await expect(directoryCards.first()).toBeVisible();
    await directoryCards.first().click();
    
    // Should navigate to detailed entry page
    await page.waitForURL('**/directory/entry/**');
    
    // Verify detailed information is displayed
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(); // Entry name
    
    // Check for key tourism details
    const pageContent = await page.textContent('body');
    
    // Should have location information (town)
    expect(pageContent).toMatch(/(Nova Sintra|Furna|Fajã de Água)/i);
    
    // Should have description
    expect(page.locator('p').first()).toBeVisible();
    
    // For restaurants: check for contact/hours information
    if (pageContent?.toLowerCase().includes('restaurant')) {
      const phoneRegex = /\+?[\d\s-()]{10,}/;
      const hasPhone = phoneRegex.test(pageContent);
      const hasHours = /\d{1,2}:\d{2}/.test(pageContent) || /hours?/i.test(pageContent);
      
      // At least one contact method should be available
      expect(hasPhone || hasHours).toBeTruthy();
    }
  });

  test('handles pagination and large directory efficiently', async ({ page }) => {
    await page.goto('/directory/all');
    
    // Check if pagination is present (might not be needed with current data size)
    const paginationExists = await page.locator('[data-testid="pagination"], .pagination').isVisible();
    
    if (paginationExists) {
      const nextButton = page.getByRole('button', { name: /next|>/i });
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        
        // Verify page navigation works
        await page.waitForLoadState('networkidle');
        const directoryCards = page.locator('[data-testid="directory-card"]');
        await expect(directoryCards.first()).toBeVisible();
      }
    }
    
    // Test scroll behavior for mobile-style browsing
    const initialCards = await page.locator('[data-testid="directory-card"]').count();
    
    if (initialCards > 6) {
      // Scroll to bottom to check if more content loads or if pagination is used
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000); // Allow time for any infinite scroll
      
      // Verify directory remains functional after scrolling
      const directoryCards = page.locator('[data-testid="directory-card"]');
      await expect(directoryCards.first()).toBeVisible();
    }
  });

  test('optimized for mobile tourism browsing', async ({ page, browserName }) => {
    // Focus on mobile devices where tourists will primarily browse
    if (browserName !== 'chromium') {
      test.skip('Mobile optimization test runs on mobile Chrome');
    }
    
    await page.goto('/directory/all');
    
    // Verify mobile-friendly layout
    const viewportSize = page.viewportSize();
    if (viewportSize && viewportSize.width <= 768) {
      // Check for mobile-optimized grid (should be single or double column)
      const gridColumns = await page.evaluate(() => {
        const grid = document.querySelector('[data-testid="directory-grid"]') || 
                    document.querySelector('.grid');
        if (grid) {
          return window.getComputedStyle(grid).gridTemplateColumns;
        }
        return null;
      });
      
      // Should not have more than 2 columns on mobile
      if (gridColumns) {
        const columnCount = gridColumns.split(' ').length;
        expect(columnCount).toBeLessThanOrEqual(2);
      }
    }
    
    // Test touch-friendly interactions
    const firstCard = page.locator('[data-testid="directory-card"]').first();
    await expect(firstCard).toBeVisible();
    
    // Verify card is large enough for touch interaction (minimum 44px touch target)
    const cardSize = await firstCard.boundingBox();
    expect(cardSize?.height).toBeGreaterThan(44);
    
    // Test category switching on mobile
    const categoryFilter = page.getByRole('link', { name: /restaurant/i }).or(
      page.getByRole('button', { name: /restaurant/i })
    );
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.tap(); // Use tap instead of click for mobile
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name: /restaurant/i })).toBeVisible();
    }
  });

  test('maintains functionality with intermittent connectivity', async ({ page }) => {
    await page.goto('/directory/all');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    const initialCards = await page.locator('[data-testid="directory-card"]').count();
    
    // Simulate network going offline (common scenario in Cape Verde)
    await page.setOffline(true);
    
    // Try to navigate to a category
    const restaurantLink = page.getByRole('link', { name: /restaurant/i }).first();
    
    if (await restaurantLink.isVisible()) {
      await restaurantLink.click();
      
      // Page should either:
      // 1. Show cached/offline content
      // 2. Show appropriate offline message
      // 3. Gracefully handle the failure
      
      const hasContent = await page.locator('[data-testid="directory-card"]').count() > 0;
      const hasOfflineMessage = await page.locator('text=/offline|unavailable|connection/i').isVisible();
      
      expect(hasContent || hasOfflineMessage).toBeTruthy();
    }
    
    // Restore connectivity
    await page.setOffline(false);
    
    // Verify functionality returns
    await page.reload({ waitUntil: 'networkidle' });
    const restoredCards = await page.locator('[data-testid="directory-card"]').count();
    expect(restoredCards).toBeGreaterThanOrEqual(initialCards);
  });

  test('provides search and filtering for efficient discovery', async ({ page }) => {
    await page.goto('/directory/all');
    
    // Look for search functionality
    const searchInput = page.getByRole('searchbox').or(
      page.getByPlaceholder(/search/i)
    ).or(
      page.locator('input[type="search"]')
    );
    
    if (await searchInput.isVisible()) {
      // Test search functionality
      await searchInput.fill('Nova Sintra');
      await page.keyboard.press('Enter');
      
      // Verify search results
      await page.waitForLoadState('networkidle');
      const searchResults = await page.textContent('body');
      expect(searchResults?.toLowerCase()).toContain('nova sintra');
    }
    
    // Test category filtering
    const categories = ['Restaurant', 'Hotel', 'Beach', 'Landmark'];
    
    for (const category of categories.slice(0, 2)) { // Test first 2 categories
      const categoryLink = page.getByRole('link', { name: new RegExp(category, 'i') }).first();
      
      if (await categoryLink.isVisible()) {
        await categoryLink.click();
        await page.waitForLoadState('networkidle');
        
        // Verify category filter is applied
        expect(page.url()).toContain(category);
        
        const pageHeading = await page.textContent('h1');
        expect(pageHeading?.toLowerCase()).toContain(category.toLowerCase());
      }
    }
  });

  test('integrates with map view for spatial discovery', async ({ page }) => {
    await page.goto('/directory/all');
    
    // Look for map integration button/link
    const mapButton = page.getByRole('link', { name: /map/i }).or(
      page.getByRole('button', { name: /map/i })
    ).or(
      page.getByText(/view on map/i)
    );
    
    if (await mapButton.isVisible()) {
      await mapButton.click();
      
      // Should navigate to map or open map view
      const currentUrl = page.url();
      const hasMap = currentUrl.includes('/map') || 
                   await page.locator('[data-testid="interactive-map"]').isVisible();
      
      expect(hasMap).toBeTruthy();
    }
    
    // Test individual entry map integration
    const directoryCard = page.locator('[data-testid="directory-card"]').first();
    await directoryCard.click();
    await page.waitForURL('**/directory/entry/**');
    
    // Check if entry page has location/map information
    const hasLocation = await page.textContent('body');
    expect(hasLocation).toMatch(/(latitude|longitude|location|coordinates)/i);
  });

  test('displays accurate ratings and reviews for tourism trust', async ({ page }) => {
    await page.goto('/directory/all');
    
    const directoryCards = page.locator('[data-testid="directory-card"]');
    const firstCard = directoryCards.first();
    
    if (await firstCard.isVisible()) {
      // Look for rating displays
      const ratingElement = firstCard.locator('[data-testid="rating"]').or(
        firstCard.locator('.rating, .stars').or(
          firstCard.locator('text=/[0-9]\.[0-9].*star/i')
        )
      );
      
      if (await ratingElement.isVisible()) {
        const ratingText = await ratingElement.textContent();
        
        // Should have valid rating format
        expect(ratingText).toMatch(/[0-5]\.?[0-9]?/);
        
        // Check for review count
        const reviewCountElement = firstCard.locator('text=/[0-9]+.*review/i');
        if (await reviewCountElement.isVisible()) {
          const reviewText = await reviewCountElement.textContent();
          expect(reviewText).toMatch(/\d+/);
        }
      }
    }
  });
});

// Mobile-specific directory tests
test.describe('Directory - Mobile Tourism Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size
  
  test('enables easy category switching on mobile', async ({ page }) => {
    await page.goto('/directory/all');
    
    // Mobile should have easy category navigation
    const categoryNav = page.locator('[data-testid="category-nav"]').or(
      page.locator('nav').filter({ hasText: /restaurant|hotel|beach|landmark/i })
    );
    
    if (await categoryNav.isVisible()) {
      const restaurantTab = categoryNav.getByRole('link', { name: /restaurant/i });
      
      if (await restaurantTab.isVisible()) {
        await restaurantTab.tap();
        await page.waitForLoadState('networkidle');
        
        expect(page.url()).toContain('Restaurant');
        await expect(page.getByRole('heading', { name: /restaurant/i })).toBeVisible();
      }
    }
  });

  test('provides touch-optimized card interactions', async ({ page }) => {
    await page.goto('/directory/all');
    
    const directoryCard = page.locator('[data-testid="directory-card"]').first();
    await expect(directoryCard).toBeVisible();
    
    // Verify touch target size is appropriate
    const cardBox = await directoryCard.boundingBox();
    expect(cardBox?.height).toBeGreaterThan(60); // Minimum touch-friendly size
    
    // Test tap interaction
    await directoryCard.tap();
    
    // Should navigate or show more information
    const urlChanged = !page.url().includes('/directory/all');
    const moreInfoVisible = await page.locator('[data-testid="entry-details"]').isVisible();
    
    expect(urlChanged || moreInfoVisible).toBeTruthy();
  });
});