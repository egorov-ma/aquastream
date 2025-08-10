# T02 — CI и стандарты качества кода

**Контекст:** таска опирается на документ бизнес‑архитектуры `/frontend/docs/AquaStream_Business_Spec_v1.1.md`.  
Прочитать разделы: §13–18, §20.  
Работа ведётся в монорепозитории; фронтенд‑модуль: `/frontend`. Инфраструктура — `/infra`. CI — `/.github/workflows`.

## Цель / Результат
Настроить GitHub Actions (lint/typecheck/build) и стандарты кода (ESLint 9 flat + Prettier 3, Conventional Commits).

## Область работ
**Входит в объём:**
- Workflow `frontend-ci.yml`.
- Конфиги ESLint flat + Prettier.
- Документация Conventional Commits в README.

**Не входит:**
- Публикация Docker, e2e — в последующих задачах.

## Предусловия
- Установлены Node.js 22 LTS и pnpm.
- Доступ к репозиторию с модулями `/frontend`, `/infra`, `/.github`.
- Возможность запускать Docker локально.

## Шаги выполнения
1. Создать `/.github/workflows/frontend-ci.yml` (Node 22, кэш pnpm).
2. Добавить `eslint.config.js`, `.prettierrc` и npm‑скрипты `lint`, `typecheck`, `build`.
3. Описать Conventional Commits в `/frontend/README.md`.
4. Открыть PR и убедиться, что workflow отрабатывает.

## Артефакты
- CI на PR с шагами install → lint → typecheck → build.
- У CI есть возможность ручного запуска.
- Раздел со стандартами кода в README.

## Бизнес‑приёмка (пользовательская)
- PR блокируется при провале lint/typecheck/build.
- На рабочем PR все шаги зелёные.

## Definition of Done (техническая готовность)
- CI зелёный на тестовом PR.
- Локально lint/typecheck без ошибок.