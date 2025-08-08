# T27 — Sentry + перф‑бюджет (базово)

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §14, §18, §25.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Интегрировать Sentry (только prod) и зафиксировать метрики Lighthouse (≥90).

## Область работ
**Входит в объём:**
- Инициализация Sentry; DSN из ENV.
- Локальный отчёт Lighthouse.

**Не входит:**
- Продвинутые RUM‑дашборды.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.
- Создана ветка `feature/t27`.

## Шаги выполнения
1. Подключить Sentry SDK по гайду Next.js.
2. Настроить окружение релиза.
3. Прогнать Lighthouse и зафиксировать показатели.

## Артефакты
- Ошибки на prod уходят в Sentry; отчёт Lighthouse хранится в PR/локально.

## Бизнес‑приёмка (пользовательская)
- DSN не светится в dev; исходники маппятся при необходимости.

## Definition of Done (техническая готовность)
- Подключение не деградирует перфоманс.

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
- Коммиты — в стиле Conventional Commits (напр., `feat(T27): краткое описание`).  
- Открой PR и сослаться на: `/frontend/docs/AquaStream_Business_Spec_v1.1.md` и `/frontend/docs/tasks/T27.md`.
