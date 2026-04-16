import { test, expect } from '@playwright/test';

// End-to-end tests for the root app page (src/app/page.tsx)
// Coverage goals:
// - Render root route and verify content
// - Navigate to internal pages when links exist
// - Validate responsive/layout behavior across viewports

test.describe('Root app page (src/app/page.tsx)', () => {
  // Ensure no leftover authentication state affects tests
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies to avoid redirect to authenticated routes
    await context.clearCookies();
    // Also reload to apply cleared state if needed
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('renders root route with content and non-empty title', async ({ page }) => {
    // Navigate to root and wait for content
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    // Ensure request completed successfully
    expect(response?.ok()).toBeTruthy();

    // Root page should present the main welcome heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toContain('Welcome to Qizzle');

    // Document title should be non-empty
    const title = await page.title();
    expect(title && title.length).toBeGreaterThan(0);
  });

  test('basic navigation to internal pages if available', async ({ page }) => {
    // Start from root
    await page.goto('/', { waitUntil: 'networkidle' });

    // Find internal links (href starts with "/") on the page
    const internalLinks = page.locator('a[href^="/"]');
    const count = await internalLinks.count();

    if (count > 0) {
      const firstLink = internalLinks.nth(0);
      // Capture href if needed for debugging
      const href = await firstLink.getAttribute('href');

      // Click and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        firstLink.click(),
      ]);

      const url = page.url();
      const urlObj = new URL(url);
      // Ensure we navigated away from root
      expect(urlObj.pathname).not.toBe('/');

      // Ensure some content is loaded on landed page (prefer <main> if present, else a heading)
      const mainCount = await page.locator('main').count();
      if (mainCount > 0) {
        await expect(page.locator('main')).toBeVisible();
      } else {
        const landedHeading = page.locator('h1').first();
        await expect(landedHeading).toBeVisible();
      }
    } else {
      // Fallback: no internal links present; ensure root content is still visible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      // Optional: ensure content includes Welcome text
      const text = await heading.textContent();
      expect(text).toContain('Welcome to Qizzle');
    }
  });

  test('responsive layout behavior: desktop and mobile viewports', async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // If a mobile menu toggle exists in desktop view, it should be hidden
    const desktopToggle = page.locator('[aria-label="Open menu"]');
    const desktopToggleCount = await desktopToggle.count();
    if (desktopToggleCount > 0) {
      await expect(desktopToggle).toBeHidden();
    }

    // Basic content check on desktop
    const desktopHeading = page.locator('h1');
    await expect(desktopHeading).toBeVisible();

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // In mobile view, a menu toggle may be present
    const mobileToggle = page.locator('[aria-label="Open menu"]');
    const mobileToggleCount = await mobileToggle.count();
    if (mobileToggleCount > 0) {
      await expect(mobileToggle).toBeVisible();
      // Try to open the menu to ensure interactive element works
      await mobileToggle.first().click();
      // After opening, main content should still be accessible
      await expect(page.locator('h1')).toBeVisible();
    } else {
      // If there is no toggle, ensure content remains accessible
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});
