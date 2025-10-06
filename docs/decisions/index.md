---
title: ADR Index
summary: Индекс всех архитектурных решений проекта AquaStream
tags: [adr, architecture, decisions]
---

# Architecture Decision Records

Индекс всех архитектурных решений с хронологией и статусами.

**Формат нумерации:** `ADR-NNN` (3 цифры, zero-padded)

## Активные решения

| ADR | Название | Статус | Дата |
|-----|----------|--------|------|
| [ADR-003](./adr-003-nginx-edge-gateway.md) | Nginx как edge proxy перед Spring Gateway | ✅ Accepted | 2025-10-06 |
| [ADR-002](./adr-002-api-documentation.md) | Автогенерация API документации (ReDoc + Swagger UI) | ✅ Accepted | 2025-09-22 |
| [ADR-001](./adr-001-docs-stack.md) | Doc as Code Stack для AquaStream | ✅ Accepted | 2025-09-22 |

## Устаревшие решения

_Пока нет устаревших ADR_

## Замененные решения

_Пока нет замененных ADR_

---

**Как создать новый ADR:**
1. Скопируй шаблон: `cp docs/_internal/templates/adr-template.md docs/decisions/adr-NNN-short-title.md`
2. Замени placeholders
3. Обнови этот index.md
4. Создай PR с пометкой `[ADR]`

См. [Documentation Guidelines](../_internal/documentation-guidelines.md#architecture-decision-records-adr) для деталей.
