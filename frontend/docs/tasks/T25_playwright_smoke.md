# T25 — Playwright: smoke‑тесты

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §18, §25.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Минимальные e2e проверки: загрузка ключевых страниц, фильтры, редирект гардов.

## Область работ
**Входит в объём:**
- `/`, `/org/:slug`, `/events/:id`, `/auth/login`, `/dashboard` guard.
- Проверка изменения URL при фильтрации.

**Не входит:**
- Полная регрессия.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t25`.

## Шаги выполнения
1. Установить Playwright и написать smoke‑сценарии.
2. (Опц.) Джоб в CI.
3. Документация по запуску локально.

## Артефакты
- Smoke зелёный локально и (опц.) в CI.

## Бизнес‑приёмка (пользовательская)
- При провале — понятные логи/скриншоты.

## Definition of Done (техническая готовность)
- Тесты стабильны (3 прогона).

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T25): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T25.md`.
