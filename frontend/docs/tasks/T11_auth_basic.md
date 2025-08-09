# T11 — Аутентификация: регистрация/логин + cookie‑сессии

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §3, §5, §12–16, §23.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Формы username+password и cookie‑сессии через заглушки API.

## Область работ
**Входит в объём:**
- Формы `/auth/register`, `/auth/login` (RHF+Zod).
- Dev‑route handlers выставляют HttpOnly cookie.
- Редирект в `/dashboard` после успеха.

**Не входит:**
- OAuth/социальные провайдеры.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. Формы RHF+Zod с сообщениями об ошибках (`FormMessage`).
2. `/app/api/auth/login/route.ts` и `/register/route.ts` (dev‑заглушки).
3. Cookie: HttpOnly, SameSite=Lax; минимальная сессия.
4. Guard `/dashboard` через middleware.

## Артефакты
- Успешный логин редиректит; логаут чистит cookie.

## Бизнес‑приёмка (пользовательская)
- Валидация и ошибки отображаются инлайном.

## Definition of Done (техническая готовность)
- В prod cookie помечены Secure; нет чувствительных данных в JS.

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/
