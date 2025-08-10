import { test, expect } from '@playwright/test';

test('waitlist toggle exists', async ({ page }) => {
  await page.goto('/events/ev-101');
  await expect(page.getByRole('button', { name: /Переключить/i })).toBeVisible();
});


