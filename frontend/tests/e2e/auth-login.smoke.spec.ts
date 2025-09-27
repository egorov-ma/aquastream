import { test, expect } from '@playwright/test';

test.describe('Auth login smoke', () => {
  test('renders form with expected controls', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/вход в аккаунт/i).first()).toBeVisible();
    await expect(page.locator('input[name="username" i]')).toBeVisible();
    await expect(page.locator('input[name="password" i]')).toBeVisible();
    await expect(page.getByRole('button', { name: /войти/i })).toBeEnabled();
    await expect(page.getByRole('link', { name: /забыли пароль/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /зарегистрируйтесь/i })).toBeVisible();
  });
});
