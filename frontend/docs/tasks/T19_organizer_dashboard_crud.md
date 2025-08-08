# T19 — Кабинет организатора: CRUD событий

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §6, §10–12, §20.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Раздел организатора для создания/редактирования/публикации событий.

## Область работ
**Входит в объём:**
- Таблица событий; форма; предпросмотр; публикация.

**Не входит:**
- Сложное планирование, rich‑редакторы.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t19`.

## Шаги выполнения
1. Раздел `/dashboard/organizer`.
2. `EventEditorForm` с обязательными полями.
3. Переходы черновик→предпросмотр→публикация + тосты.

## Артефакты
- Создание/редактирование/публикация на моках.

## Бизнес‑приёмка (пользовательская)
- Публикация недоступна, пока не заполнено всё необходимое.

## Definition of Done (техническая готовность)
- Без ошибок в консоли; работает пагинация таблицы.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T19): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T19.md`.
