# ADR-0001: Выбор стека Doc as Code для aquastream

---
title: ADR-0001 Docs Stack
summary: Принятое решение по стеку Doc as Code (формат, генератор, плагины, процессы).
tags: [adr]
---

Принятое решение по стеку Doc as Code (формат, генератор, плагины, процессы).

- Статус: Accepted
- Дата: 2025-09-22

## Контекст
Монорепозиторий с Java Spring (backend-*), Next.js (frontend), инфраструктура в `infra/`. Нужен единый портал доков и процесс Doc as Code (Git, PR, CI, автосборка).

## Решение
- Формат: Markdown.
- Генератор: MkDocs + Material.
- Плагины: search, monorepo/include, awesome-pages (опц.), mermaid2/PlantUML, pymdownx.*, (опц.) mike для версий.
- Структура: сквозные `docs/`, модульные `**/docs/`.
- Зависимости: pinned в `requirements-docs.txt`.
- Процессы: линтеры/линк‑чек, предпросмотр в PR, Pages‑деплой.

## Последствия
- Просто для разработчиков (Markdown), быстрый онбординг.
- Требует настройки CI и хуков качества.

## Альтернативы
- Docusaurus (React‑плагины, встроенное версионирование) — не выбран из‑за лишней сложности на старте.

## Ссылки
- `mkdocs.yml`
- `requirements-docs.txt`
