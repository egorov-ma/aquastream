import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('home loads and pagination changes URL', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AquaStream/i);
    // пагинация (если есть) — проверим, что клик меняет query
    const next = page.locator('[data-test-id="pagination-next"], nav[role="navigation"] button:has-text("Next")');
    if (await next.count()) {
      await next.first().click({ delay: 50 }).catch(() => {});
      await expect(page).toHaveURL(/\?/);
    }
  });

  test('/org/:slug loads', async ({ page }) => {
    await page.goto('/org/neo-splav');
    await expect(page.locator('[data-test-id="page-org"]')).toBeVisible({ timeout: 10_000 });
  });

  test('/events/:id loads and waitlist block visible', async ({ page }) => {
    await page.goto('/events/ev-101');
    await expect(page.locator('[data-test-id="page-event"]')).toBeVisible();
    await expect(page.getByText('Лист ожидания')).toBeVisible();
  });

  test('/auth/login loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Войти/i })).toBeVisible();
  });

  test('/dashboard guard redirects to login if unauthenticated', async ({ page }) => {
    const resp = await page.goto('/dashboard');
    expect(resp?.status()).toBe(200);
    await expect(page).toHaveURL(/\/login|\/auth\/login/);
  });
});


