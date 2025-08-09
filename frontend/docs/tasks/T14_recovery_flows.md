# T14 — Восстановление доступа (Telegram / резервные коды)

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §5, §9, §12.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
UI `​/auth/recovery` для восстановления через Telegram (если верифицирован) или по резервным кодам.

## Область работ
**Входит в объём:**
- Экраны init/verify/reset.

**Не входит:**
- Реальные сообщения бота.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. Собрать поток `/auth/recovery`.
2. Заглушки `POST /auth/recovery/init|verify|reset`.
3. После успеха — редирект на логин.

## Артефакты
- Happy‑path восстановления с моками.

## Бизнес‑приёмка (пользовательская)
- Понятные тексты и обработка ошибок.

## Definition of Done (техническая готовность)
- Политика сильного пароля; без утечки секретов в логи.

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/