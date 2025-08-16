import { test, expect } from '@playwright/test'

test('checkout: payment widget success and cancel alerts', async ({ page }) => {
  await page.goto('/checkout/bk-101')
  // Видимость кнопок
  await expect(page.getByRole('button', { name: 'Оплатить' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Отменить' })).toBeVisible()
  // Success
  await page.getByRole('button', { name: 'Оплатить' }).click()
  await expect(page.locator('[data-test-id="page-checkout"]').getByRole('alert').filter({ hasText: 'Оплата успешна' })).toBeVisible()
  // Cancel
  await page.getByRole('button', { name: 'Отменить' }).click()
  await expect(page.locator('[data-test-id="page-checkout"]').getByRole('alert').filter({ hasText: 'Оплата отменена' })).toBeVisible()
})


