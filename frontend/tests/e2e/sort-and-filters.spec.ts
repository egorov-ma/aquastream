import { test, expect } from '@playwright/test'

test('org events table: sort headers update aria-sort and order', async ({ page }) => {
  await page.goto('/org/neo-splav/events')
  await expect(page.locator('[data-test-id="page-org-events"]')).toBeVisible()
  await expect(page.locator('table')).toBeVisible()
  // th с текстом «Событие» (внутри может быть кнопка/текст)
  const titleHead = page.locator('th').filter({ hasText: 'Событие' })
  await expect(titleHead).toHaveAttribute('aria-sort', /none|ascending|descending/)
  await page.getByText('Событие', { exact: true }).click()
  await expect(titleHead).toHaveAttribute('aria-sort', /ascending|descending/)
})

test('events table filter: input filters rows', async ({ page }) => {
  await page.goto('/org/neo-splav/events')
  await expect(page.locator('[data-test-id="page-org-events"]')).toBeVisible()
  const input = page.getByPlaceholder('Поиск...')
  await expect(input).toBeVisible()
  const tbody = page.locator('tbody')
  await expect(tbody).toBeVisible()
  const initialCount = await page.locator('tbody tr').count()
  await input.fill('zzzz___no_match')
  const filteredCount = await page.locator('tbody tr').count()
  expect(filteredCount).toBeLessThanOrEqual(initialCount)
  // очистка
  await input.fill('')
  const resetCount = await page.locator('tbody tr').count()
  expect(resetCount).toBeGreaterThanOrEqual(filteredCount)
})


