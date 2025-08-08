# T21 — Экипажи, лодки и палатки (базово)

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §10–11.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Создавать группы и вручную распределять участников (без drag‑and‑drop).

## Область работ
**Входит в объём:**
- CRUD списков; диалог назначения; счетчики вместимости.

**Не входит:**
- Автоподбор алгоритмами.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t21`.

## Шаги выполнения
1. Простые списки с `Card` и счетчиками.
2. Диалог назначения с поиском по участникам.
3. Сохранение в моках; отображение на карточке события.

## Артефакты
- Организатор назначает/убирает участников; соблюдается вместимость.

## Бизнес‑приёмка (пользовательская)
- Предупреждение при переполнении.

## Definition of Done (техническая готовность)
- Нет переполнений; действия обратимы.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T21): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T21.md`.
