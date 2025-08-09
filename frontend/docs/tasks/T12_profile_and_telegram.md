# T12 — Профиль + статус верификации Telegram

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §5, §9, §12, §23.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Форма профиля (телефон, telegram, доп. поля) и отображение статуса верификации.

## Область работ
**Входит в объём:**
- Вкладка Profile в `/dashboard` (участник).
- Пилюля статуса: Unverified/Verified.

**Не входит:**
- Интеграция с ботом (на бэке).

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. Форма shadcn Form + валидация zod.
2. Мок‑эндпойнты GET/PUT; изменение статуса отражается в UI.
3. Инструкция по подключению бота (ссылка на `@botname`).

## Артефакты
- Поля сохраняются; статус переживает перезагрузку.

## Бизнес‑приёмка (пользовательская)
- UI минималистичен и понятен.

## Definition of Done (техническая готовность)
- Ошибки схем валидно отображаются; консоль чистая.

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/