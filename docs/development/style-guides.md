# Style Guides

---
title: Development Style Guides
summary: Единые правила кодирования, коммитов и документации для AquaStream.
tags: [development, style-guides]
---

## Обзор

Этот документ собирает основные практики, которые применяются в проекте. Для подробностей — переходите по ссылкам на тематические страницы.

## Код (Java Backend)

- Используем стандартные рекомендации Spring Boot: конвенции именования пакетов `com.aquastream.<domain>` и классов `PascalCase`.
- Ломбок допускается только в `*-api` DTO (см. `backend/common`), бизнес-логика предпочитает явные конструкторы/билдеры.
- Не используем `field injection`. Сервисы и контроллеры получают зависимости через конструктор.
- DTO располагаются в `api/dto`, сервисные модели — в `service/dto`, сущности — в `db/entity`.
- Проверяйте архитектурные правила через ArchUnit (`LayerRulesTest`). Они не должны нарушаться при добавлении модулей.
- Дополнительные детали: [`docs/backend/common/README.md`](../backend/common/README.md) и [`docs/backend/database.md`](../backend/database.md).

## Код (Frontend)

- React/Next.js 14 с TypeScript: используем функциональные компоненты и React Hooks.
- Стили: Tailwind + shadcn/ui, придерживаемся `class-variance-authority` паттернов.
- Структура папок: `components/ui`, `components/forms`, `app/(routes)` — подробнее см. [`docs/frontend/README.md`](../frontend/README.md).
- Линтеры (`pnpm lint`, `pnpm typecheck`) обязательны перед PR.

## Коммиты и PR

- Следуем Conventional Commits: `type(scope): subject`. Детали и примеры см. в [`development/workflows.md`](../development/workflows.md#commit-messages-conventional-commits).
- Один Pull Request — один изолированный поток изменений; если нужно, дробим на несколько PR.
- В описании PR добавляем:
  - Что изменено
  - Как протестировано
  - Ссылки на связанные issue/ADR (если есть)

## Документация

- Документы живут в `docs/` и обновляются вместе с кодом (Doc-as-Code). Основные принципы — в [`documentation-guidelines.md`](../_internal/documentation-guidelines.md).
- Для новой страницы смотрим шаблоны в `docs/_internal/templates/`.
- Перед PR проверяем документацию: `make docs-serve` (preview) и `make docs-build` (strict build).
- Ссылка на первоисточник вместо дублирования текста.

## Базы данных и миграции

- Миграции описываем через Liquibase, лежат в `*/backend-*-db/src/main/resources/migration/liquibase/`.
- Конвенции по именованию таблиц и колонок — в [`backend/database.md`](../backend/database.md).
- Каждое изменение таблицы сопровождаем миграцией и тестами (интеграционными или E2E).

## Линтеры и форматирование

| Область | Команда | Автоматизация |
|---------|---------|----------------|
| Java/Kotlin | `./gradlew spotlessApply` | Spotless (Gradle) |
| JavaScript/TypeScript | `pnpm lint --fix` | ESLint + Prettier |
| Markdown/Docs | `make docs-lint` | markdownlint, Vale, cSpell |
| Docker/YAML | `make infra-lint` | hadolint, yq |

## Как работать с гайдлайнами

1. При добавлении нового модуля свериться с этим документом и ссылками.
2. Если понадобится отступление — обсуждаем в PR и фиксируем в документации.
3. Если возникает желание обновить правила — создаём ADR или issue, чтобы остальные участники тоже были в курсе.

---

Для быстрых ссылок на рабочие процессы см. [`development/workflows.md`](workflows.md) и [`development/testing.md`](testing.md).
