# T13 — RBAC‑гарды для приватных роутов

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §3, §21–22.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Ограничить доступ в разделы `/dashboard` по ролям.

## Область работ
**Входит в объём:**
- Middleware читает роль из сессии.
- Неавторизованных — на `/auth/login?next=…`.

**Не входит:**
- Тонкая серверная авторизация объектов.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. `middleware.ts` — чтение cookie/сессии.
2. Карта роль→разрешённые роуты; редирект с `next`.
3. Базовые тесты на редиректы.

## Артефакты
- Нельзя попасть в чужие разделы без роли.

## Бизнес‑приёмка (пользовательская)
- Нет циклов редиректов; корректные переходы.

## Definition of Done (техническая готовность)
- Тесты проходят; без hydration‑ворнингов.

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/