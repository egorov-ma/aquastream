# Frontend Testing Guide

## Команды
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript без генерации артефактов
- `pnpm test:unit` — юнит-тесты (Node test runner)
- `pnpm test:e2e` — Playwright (Chromium) с автозапуском dev-сервера

## Smoke-тест Playwright
Минимальная проверка выполняется в `tests/e2e/auth-login.smoke.spec.ts`. Сценарий убеждается, что страница логина отрисована корректно и содержит все ключевые элементы формы.

**Запуск локально**
```bash
pnpm exec playwright install --with-deps chromium   # один раз
pnpm exec playwright test tests/e2e/auth-login.smoke.spec.ts
```

**Рекомендации**
1. Проверяйте наличие всех обязательных контролов (`heading`, `input`, `button`, вспомогательные ссылки).
2. Для новых smoke-сценариев придерживайтесь правил: `waitForLoadState('networkidle')`, только селекторы по ролям/aria.
3. На CI тесты запускаются в workflow `frontend-ci` после типизации. Падение теста блокирует PR до фикса.

## TODO
- Дополнить набор сценариями для дашборда и публичных страниц.
- При необходимости добавить визуальные проверки (snapshots или сторонние сервисы) поверх smoke-тестов.
