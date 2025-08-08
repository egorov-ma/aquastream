# T20 — Редакторы: бренд/команда/FAQ

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §6, §10–12.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Редакторы главной страницы организатора: бренд, команда, FAQ.

## Область работ
**Входит в объём:**
- Загрузка лого; CRUD команды; FAQ записи.

**Не входит:**
- Версионирование, кроп изображений.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t20`.

## Шаги выполнения
1. Вкладки настроек: Brand / Team / FAQ.
2. Загрузка через presigned URL (моки).
3. Отражение на публичных страницах (через будущие ISR‑теги).

## Артефакты
- Публичная страница обновляется после сохранения (или окна ISR).

## Бизнес‑приёмка (пользовательская)
- UI адаптивен и доступен.

## Definition of Done (техническая готовность)
- Загрузка работает стабильно; заглушки ISR компилируются.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T20): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T20.md`.
