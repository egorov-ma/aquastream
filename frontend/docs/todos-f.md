# Frontend TODOs (расхождения спеки и реализации)

## OAuth2 / Аутентификация
- Внедрить OAuth2 (Authorization Code):
  - Добавить `app/api/auth/callback/route.ts` (разбор `code`, обмен на токен, установка HttpOnly cookie `sid`, `role`).
  - Кнопку «Войти через OAuth2» на `/login`; редирект на `OAUTH2_AUTH_URL`.
  - ENV: `OAUTH2_AUTH_URL`, `OAUTH2_TOKEN_URL`, `OAUTH2_CLIENT_ID`, `OAUTH2_CLIENT_SECRET`, `OAUTH2_REDIRECT_URI` — подключить в конфиг.
  - Обновить middleware, чтобы учитывать сессионную cookie от OAuth2.

## RBAC и UI‑скрытие
- Проверить скрытие недоступных действий по ролям на всех страницах (org/admin). Сейчас гарды есть в middleware, местами UI‑скрытие не доделано.

## SEO/метаданные
- Проставить `metadata` для: `/`, `/login`, `/register`, `/dashboard`, `/org/dashboard/*`.

## Sentry (modern setup)
- Перенести client‑инициализацию в `instrumentation-client.ts` (устранить депрекейшн), добавить глобальный error boundary (App Router) для прод‑окружения.

## CSP / images
- Уточнить CSP (минимизировать `unsafe-inline/unsafe-eval`), расширить `images.remotePatterns` под реальные домены лого/загрузок.

## Editor.js
- Подключить безопасный предпросмотр (есть `EditorPreview`) там, где он нужен (бренд/контент), исключить `dangerouslySetInnerHTML` вне санитизации.

## Waitlist UX
- Текущая кнопка‑переключатель делает запросы, но не отражает текущее состояние/счётчик без обновления. Добавить:
  - Отображение «в очереди/не в очереди».
  - Оптимистичное обновление счётчика.

## Playwright / CI
- Добавить smoke‑прогон в CI по флагу, кеш pnpm, фикстуры для MSW (`/__reset`).

## Документация
- README и спека синхронизированы; оставить единственным источником правды по мокам/платежам — бизнес‑спеку. Проверять при изменениях.

