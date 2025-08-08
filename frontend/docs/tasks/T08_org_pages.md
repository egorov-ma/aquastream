# T08 — Страницы организатора (инфо, события, команда, FAQ)

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §6–7, §10–12, §21.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Сверстать layout организатора с сабнавигацией и разделами.

## Область работ
**Входит в объём:**
- Сабнавигация, инфо, список событий, команда, FAQ.

**Не входит:**
- Редакторы (будут в кабинете организатора).

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t08`.

## Шаги выполнения
1. Лэйаут `/org/[orgSlug]` с акцентным цветом бренда.
2. Компоненты `OrgHeader`, `OrgSubnav`.
3. Заготовка `EventList` (title/date/price/capacity/status).
4. FAQ через `Accordion`.
5. Команда — список карточек с `Avatar` и ролью.

## Артефакты
- Разделы отображаются и адаптивны.

## Бизнес‑приёмка (пользовательская)
- На мобиле меню через `Sheet`; брендирование консистентно.

## Definition of Done (техническая готовность)
- Без layout‑shift; оптимизированные изображения.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T08): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T08.md`.
