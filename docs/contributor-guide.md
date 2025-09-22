# Contributor Guide — Docs

---
title: Contributor Guide — Docs
summary: Как запускать docs локально, проходить проверки и вносить изменения по Doc as Code.
---

## Быстрый старт
- Установка: `make docs-setup`
- Предпросмотр: `make docs-serve`
- Сборка: `make docs-build`
- Линтеры: `make docs-lint`

## Что обновлять
- Код меняется → обновляйте релевантные `**/docs/**` или добавляйте лейбл `no-docs-needed` (см. drift‑guard).
- Контракты API → `make docs-api` (или просто `docs-build`, он включает генерацию).
- Диаграммы PlantUML → `make docs-diagrams` (или `docs-build`).

## Стиль и структура
- Следуйте `docs/styleguides/markdown_style.md`.
- Термины — `docs/glossary.md` (Vale проверяет предпочтительные варианты).
- Шаблоны: в `docs/_templates/` (README, runbook, API, architecture, ADR).

## ADR
- Ключевые решения фиксируем ADR (`docs/adr/` и `MODULE/docs/adr/`). Используйте шаблон `docs/_templates/adr-template.md`.

## Частые проверки
- Орфография и стиль: `make docs-lint` (markdownlint, cspell RU/EN, Vale).
- Ссылки: `make docs-check-links`.

## FAQ
- См. `docs/faq.md`. Если вопрос повторяется — добавьте в FAQ.
