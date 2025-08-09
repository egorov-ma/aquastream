# T10 — ISR для публичных страниц

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §15–16.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Применить ISR и подготовить теги для инвалидации.

## Область работ
**Входит в объём:**
- `revalidate=60` для главной и страниц организатора.
- Константы тегов.

**Не входит:**
- Реальные триггеры инвалидации.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t10`.

## Шаги выполнения
1. `/shared/config/cache-tags.ts` с тегами.
2. Обернуть фетчеры в `unstable_cache` с тегами.
3. Проверить build‑вывод.

## Артефакты
- Заголовки отражают кеш; контент обновляется после окна ревалидации.

## Бизнес‑приёмка (пользовательская)
- Нет ошибок кеша; страницы пересчитываются ожидемо.

## Definition of Done (техническая готовность)
- Соотношение static/SSR соответствует плану.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T10): краткое описание`). 
