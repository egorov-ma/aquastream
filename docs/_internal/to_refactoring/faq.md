# FAQ — Docs

---
title: FAQ — Docs
summary: Ответы на типовые вопросы при работе с документацией.
---

## Предпросмотр не поднимается
- Проверьте `make docs-setup`, затем `make docs-serve`.

## Линк‑чек падает
- Запустите `make docs-check-links`, исправьте битые ссылки или добавьте исключение в `lychee.toml`.

## Орфография/стиль
- `make docs-lint` покажет отчёты markdownlint/cspell/Vale.

## Где шаблоны?
- `docs/_templates/` (README, runbook, API, architecture, ADR).
