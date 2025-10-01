# UI Tests

---
title: UI Tests
summary: UI-тесты для проверки пользовательского интерфейса через браузер
tags: [qa, testing, ui-tests, playwright, e2e]
---

## Обзор

UI-тесты проверяют пользовательский интерфейс через браузер.

## Технологии

- **Playwright**: основной фреймворк для E2E тестирования
- **Chromium**: браузер для тестов

## Установка

```bash
# Установка Playwright и браузеров
cd frontend
pnpm exec playwright install --with-deps chromium
```

## Структура тестов

```
frontend/tests/e2e/
  ├── auth-login.smoke.spec.ts     # Smoke-тест логина
  └── ... (будущие тесты)
```

## Запуск

```bash
# Все E2E тесты
pnpm test:e2e

# Конкретный тест
pnpm exec playwright test tests/e2e/auth-login.smoke.spec.ts

# В debug режиме
pnpm exec playwright test --debug
```

## Пример теста

```typescript
import { test, expect } from '@playwright/test';

test('login page should render correctly', async ({ page }) => {
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  
  await expect(page.getByRole('heading', { name: /login/i }))
    .toBeVisible();
  await expect(page.getByRole('textbox', { name: /email/i }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i }))
    .toBeVisible();
});
```

## Best Practices

- Используйте селекторы по ролям (getByRole)
- Ждите загрузки страницы (waitForLoadState)
- Один сценарий на файл
- Понятные названия тестов
- Избегайте хрупких селекторов (классы, id)

## CI Integration

Тесты автоматически запускаются в CI при каждом PR.
