import { test, expect } from '@playwright/test';

test('organizer dashboard loads', async ({ page }) => {
  await page.goto('/org/dashboard');
  await expect(page.locator('[data-test-id="page-organizer-dashboard"]')).toBeVisible({ timeout: 10_000 });
});

