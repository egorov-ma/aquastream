---
title: Development Style Guides
summary: Единые правила кодирования, коммитов и документации для AquaStream.
tags: [development, style-guides]
---

# Style Guides

## Обзор

Основные практики проекта. Для подробностей — переходите по ссылкам.

## Код (Java Backend)

- Spring Boot конвенции: пакеты `com.aquastream.<domain>`, классы `PascalCase`
- Ломбок только в `*-api` DTO ([backend/common](../backend/common/README.md)), бизнес-логика - явные конструкторы/билдеры
- Не используем `field injection`, только конструктор
- DTO: `api/dto`, сервисные модели: `service/dto`, сущности: `db/entity`
- ArchUnit: `LayerRulesTest` не должны нарушаться
- См. [backend/common/README.md](../backend/common/README.md), [backend/database.md](../backend/database.md)

## Код (Frontend)

- React/Next.js 15 + TypeScript: функциональные компоненты, React Hooks
- Стили: Tailwind + shadcn/ui, паттерны `class-variance-authority`
- Структура: `components/ui`, `components/forms`, `app/(routes)` — см. [frontend/README.md](../frontend/README.md)
- Линтеры (`pnpm lint`, `pnpm typecheck`) обязательны перед PR

## Коммиты и PR

- Conventional Commits: `type(scope): subject`. См. [workflows.md](workflows.md#commit-messages-conventional-commits)
- Один PR — один поток изменений
- Описание PR: что изменено, как протестировано, ссылки на issue/ADR

## Документация

- Документы в `docs/`, обновляются с кодом (Doc-as-Code). Принципы: [documentation-guidelines.md](../_internal/documentation-guidelines.md)
- Шаблоны: `docs/_internal/templates/`
- Перед PR: `make docs-serve` (preview) и `make docs-build` (strict)
- Ссылка на первоисточник вместо дублирования

## БД и миграции

- Liquibase: `*/backend-*-db/src/main/resources/migration/liquibase/`
- Конвенции: [backend/database.md](../backend/database.md)
- Каждое изменение таблицы — миграция + тесты

## Линтеры

| Область | Команда | Автоматизация |
|---------|---------|----------------|
| Java/Kotlin | `./gradlew spotlessApply` | Spotless |
| JavaScript/TypeScript | `pnpm lint --fix` | ESLint + Prettier |
| Markdown/Docs | `make docs-lint` | markdownlint, Vale, cSpell |
| Docker/YAML | `make infra-lint` | hadolint, yq |

## Правила работы

1. При добавлении модуля свериться с этим документом
2. Отступление — обсуждаем в PR и фиксируем в документации
3. Обновление правил — создаём ADR или issue

---

См. [workflows.md](workflows.md) и [testing.md](testing.md).
