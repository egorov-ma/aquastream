# ADR-0003: Автогенерация API‑документации (ReDoc + Spectral)

---
title: ADR-0003 API Autogen Strategy
summary: Генерация ReDoc HTML из OpenAPI, линтинг Spectral и drift‑check в CI.
---

- Статус: Accepted
- Дата: 2025-09-22

## Контекст
Контракты могут храниться в `**/api/**` и `api-contracts/`. Нужна автогенерация страниц и проверка в CI.

## Решение
- Генератор: `tools/generate_api_docs.py` → `docs/api/specs/**` и `docs/api/redoc/**`, индекс `docs/api/index.md`.
- CI: workflow `docs-api.yml` — генерация, `npx @stoplight/spectral-cli lint`, drift‑check артефактов.
- Навигация: раздел `API` в портале.

## Последствия
- + Живой источник правды по контрактам.
- + Автопроверка качества и дрейфа.
- − Требуются Node.js (Spectral) и шаг генерации в сборке.

## Альтернативы
- Swagger UI вместо ReDoc — не выбран (ReDoc компактнее для чтения).

## Ссылки
- `docs/api/`, `.github/workflows/docs-api.yml`, `mkdocs.yml`
