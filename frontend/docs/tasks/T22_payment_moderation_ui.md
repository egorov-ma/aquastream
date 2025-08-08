# T22 — Модерация оплат (организатор)

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §8, §11.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Очередь на проверку пруфов QR: принять/отклонить с комментарием.

## Область работ
**Входит в объём:**
- Таблица ожиданий; превью; действия; тосты.

**Не входит:**
- Подробный аудит.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t22`.

## Шаги выполнения
1. `ProofsTable` + модалка превью.
2. Действия меняют статус на `accepted/rejected` (моки).
3. Триггер заглушки уведомления.

## Артефакты
- Статусы брони обновляются; отражаются в пользовательском кабинете.

## Бизнес‑приёмка (пользовательская)
- Очередь обрабатывается быстро без лишних кликов.

## Definition of Done (техническая готовность)
- Доступ только у ролей organizer/admin.

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/

## Инструкции для агента (ChatGPT Agent)
Ты — агент, выполняющий работу в монорепозитории AquaStream. Следуй шагам выше **точно**.  
- Держись принципа **MVP**, без оверинженеринга.  
- Используй **pnpm** для всех установок.  
- Коммиты — в стиле Conventional Commits (напр., `feat(T22): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T22.md`.
