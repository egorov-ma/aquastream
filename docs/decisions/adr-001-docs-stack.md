---
title: ADR-001 - Doc as Code Stack
summary: Выбор MkDocs + Material для документации проекта с автоматизацией через CI/CD
tags: [adr, documentation, docs-as-code]
---

# ADR-001: Doc as Code Stack для AquaStream

**Статус:** Accepted
**Дата:** 2025-09-22
**Авторы:** AquaStream Team

## Контекст

AquaStream - монорепозиторий с Backend (7 микросервисов), Frontend (Next.js), Infrastructure (Docker Compose). Документация разбросана по разным файлам, нет единого портала, сложно поддерживать актуальность.

**Требования:**
- Документация версионируется с кодом (Git)
- Простой формат (Markdown)
- Автоматическая сборка и публикация
- Поддержка диаграмм
- Full-text search
- Responsive design

## Решение

### Технологический стек

**Генератор:** [MkDocs](https://www.mkdocs.org/) + [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)

**Формат:** Markdown с расширениями (GFM, YAML frontmatter, Mermaid диаграммы)

**Плагины:**
- search - full-text search
- mermaid2 - диаграммы
- redirects - управление перемещениями

**Структура:**
```
docs/
├── index.md, quickstart.md, architecture.md
├── backend/            # По сервисам
├── frontend/           # Frontend docs
├── qa/                 # QA стратегия
├── api/                # OpenAPI specs
├── operations/         # DevOps
├── development/        # Developer guides
├── decisions/          # ADR
└── _internal/          # Templates, guidelines
```

**Принципы:**
- По аудитории: development/, operations/, qa/, business/
- По lifecycle: quickstart → setup → deployment
- Single Source of Truth: cross-references вместо дублирования

### Команды

```bash
make docs-setup    # Установить зависимости
make docs-serve    # Dev сервер :8000
make docs-build    # Сборка в site/
make docs-lint     # Markdown lint
```

**CI/CD:**
- Автосборка при PR
- Линтинг Markdown
- Проверка битых ссылок
- Автодеплой в GitHub Pages

## Последствия

**Положительные:**
- ✅ Простота - Markdown знают все
- ✅ Быстрый онбординг - search + navigation
- ✅ Версионирование - те же процессы что и код (PR, review)
- ✅ Автоматизация - CI/CD проверки
- ✅ Красивый UI - Material theme
- ✅ Диаграммы - Mermaid support
- ✅ Extensibility - богатая экосистема плагинов

**Отрицательные:**
- ❌ Требует настройку CI
- ❌ Python зависимость
- ❌ Ручное обновление (не автогенерация)

**Риски:**
| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Документация устаревает | High | PR checklist, обязательное обновление docs при API changes |
| Битые ссылки | Medium | Автопроверка в CI |
| MkDocs перестанет поддерживаться | Low | Популярный проект, можно мигрировать на Docusaurus |

## Альтернативы

### Вариант 1: Docusaurus (Meta)
**Плюсы:** React-based, встроенное версионирование, MDX support
**Минусы:** Требует React знания, сложнее настройка, slower build
**Почему не выбран:** Избыточная сложность

### Вариант 2: GitBook
**Плюсы:** Красивый UI, GitHub интеграция
**Минусы:** Платный для private repos, vendor lock-in
**Почему не выбран:** Не хотим зависеть от external service

### Вариант 3: Sphinx
**Плюсы:** Python standard, мощные cross-references
**Минусы:** reStructuredText сложнее, менее современный UI
**Почему не выбран:** Меньше популярен, steep learning curve

### Вариант 4: Read the Docs
**Плюсы:** Hosted solution, автосборка
**Минусы:** Vendor lock-in, платный для private
**Почему не выбран:** Хотим self-hosted

## Связанные решения

**Зависит от:** Нет
**Влияет на:** ADR-002 (API Documentation Strategy)
**Заменяет:** Нет

## Ссылки

- [Documentation Guidelines](../_internal/documentation-guidelines.md)
- [Templates](../_internal/templates/README.md)
- [MkDocs Docs](https://www.mkdocs.org/)
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
- [Mermaid JS](https://mermaid.js.org/)
