# T09 — Фильтры списка событий + синхронизация с URL

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §7, §10, §12, §15.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Добавить фильтры (диапазон дат, текст, цена, вместимость) с синхронизацией URL и сбросом.

## Область работ
**Входит в объём:**
- Select, Input, Calendar+Popover, при необходимости Slider.
- URL отражает состояние.

**Не входит:**
- Серверная фильтрация.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t09`.

## Шаги выполнения
1. `EventFilters` с контролируемыми компонентами.
2. Синхронизация через `useSearchParams`.
3. Кнопка сброса.
4. Smoke‑тест Playwright на изменение URL.

## Артефакты
- Список обновляется, URL меняется согласно фильтрам.

## Бизнес‑приёмка (пользовательская)
- Сброс возвращает значения по умолчанию; back/forward сохраняет состояние.

## Definition of Done (техническая готовность)
- Нет hydration‑ворнингов; smoke‑тест проходит.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T09): краткое описание`).  
- Открой PR и собеери все правки.
