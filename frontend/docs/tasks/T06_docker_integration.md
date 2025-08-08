# T06 — Интеграция с Docker и `/infra`

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §17–18.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Добавить профили compose: `dev` (3100, моки) и `prod` (3000, без моков).

## Область работ
**Входит в объём:**
- Сервисы `frontend-dev` и `frontend`.
- Volume‑маунт для dev; многостадийная сборка для prod (`output: 'standalone'`).

**Не входит:**
- Ingress/K8s.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. Добавить сервисы/профили, проброс портов и ENV.
2. Положить `.env.development` и `.env.production` в `/frontend`.
3. Проверить `docker compose --profile dev up` и сборку prod‑образа.

## Артефакты
- Оба профиля запускаются с корректными портами/флагами.

## Бизнес‑приёмка (пользовательская)
- Dev доступен на 3100; prod‑образ обслуживает 3000.

## Definition of Done (техническая готовность)
- Образ компактный; compose‑линт без варнингов.

## Ссылки
- Бизнес‑документ: `/frontend/docs/AquaStream_Business_Spec_v1.1.md`
- Next.js ISR: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- revalidateTag: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- Acceptance Criteria: https://www.atlassian.com/ru/agile/project-management/user-stories
- Definition of Done: https://www.scrum.org/resources/what-definition-done
- MSW quick start: https://mswjs.io/docs/quick-start/