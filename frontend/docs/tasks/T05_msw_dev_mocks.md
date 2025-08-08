# T05 — MSW‑моки для dev

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §16–17, §19–20.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Включить MSW на dev‑порту (3100) под флагом `NEXT_PUBLIC_USE_MOCKS=true`.

## Область работ
**Входит в объём:**
- Обработчики для организаторов/событий.
- Переключение через ENV; в prod моки не подключаются.

**Не входит:**
- Сложные сценарии и полные модели.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. Установить и настроить MSW: `/src/mocks/browser.ts`, `/src/mocks/handlers.ts`.
2. Инициализировать только при `NEXT_PUBLIC_USE_MOCKS=true`.
3. Добавить тестовые данные и задержку сети.
4. Описать расширение моков в `/frontend/docs/mocks.md`.

## Артефакты
- При включённом флаге отображаются мок‑данные; при выключенном — реальные запросы/заглушки.

## Бизнес‑приёмка (пользовательская)
- Переключение флага включает/выключает моки без изменений кода.

## Definition of Done (техническая готовность)
- В prod‑сборке MSW отсутствует.
- В dev виден баннер MSW в консоли.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T05): краткое описание`).