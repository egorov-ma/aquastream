# T03 — Маршруты + стратегия SSG/SSR/ISR

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §6, §14–16, §21.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Задать политику рендеринга и кеш‑тегов.

## Область работ
**Входит в объём:**
- SSG+ISR для `/` и `/org/*`.
- SSR для `/events/[eventId]` и `/dashboard*`.
- Константы тегов для инвалидации кеша.

**Не входит:**
- Реальные запросы данных.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. На публичных страницах экспортировать `revalidate = 60`.
2. Создать `/shared/config/cache-tags.ts` с именами тегов.
3. На SSR‑страницах использовать `cache: 'no-store'`.
4. Проверить классификацию страниц после `next build`.

## Артефакты
- Публичные страницы рендерятся статикой; приватные — SSR.
- Теги кеша определены.

## Бизнес‑приёмка (пользовательская)
- Навигация по публичным страницам быстрая; карточка события после обновления рендерится свежими данными (моки).

## Definition of Done (техническая готовность)
- `next build` показывает ожидаемое соотношение static/SSR.
- Нет hydration‑варнингов.

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/