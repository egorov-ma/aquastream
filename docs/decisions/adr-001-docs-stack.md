# ADR-001: Doc as Code Stack для AquaStream

---
title: ADR-001 - Doc as Code Stack
summary: Выбор технологического стека для документации проекта - MkDocs + Material с автоматизацией через CI/CD
tags: [adr, documentation, docs-as-code]
---

**Статус:** Accepted
**Дата:** 2025-09-22
**Авторы:** AquaStream Team
**Reviewers:** Team Lead

## Контекст

AquaStream - монорепозиторий с множеством компонентов:
- **Backend**: 7 микросервисов (Java 21, Spring Boot, Gradle)
- **Frontend**: Next.js приложение (TypeScript, React)
- **Infrastructure**: Docker Compose, Makefile, CI/CD
- **Команда**: Backend, Frontend, QA, DevOps специалисты

**Проблемы которые нужно решить:**
- Документация разбросана по разным файлам и форматам
- Нет единого портала для поиска информации
- Сложно поддерживать актуальность (документация отстаёт от кода)
- Нет автоматической проверки качества документации
- Новым разработчикам сложно найти нужную информацию

**Требования:**
- Документация версионируется вместе с кодом (Git)
- Простой формат для написания (не требует специальных навыков)
- Автоматическая сборка и публикация
- Поддержка диаграмм и технической документации
- Full-text search
- Responsive design для мобильных устройств
- Быстрый onboarding для новых разработчиков

## Решение

### Технологический стек

**Генератор**: [MkDocs](https://www.mkdocs.org/) + [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)

**Формат**: Markdown с расширениями:
- GitHub Flavored Markdown (GFM)
- YAML frontmatter для метаданных
- Mermaid для диаграмм
- Admonitions для заметок и предупреждений

**MkDocs плагины**:
```yaml
plugins:
  - search              # Full-text search
  - awesome-pages       # Автоматическая навигация
  - mermaid2            # Mermaid диаграммы
  - include-markdown    # Переиспользование контента
```

**Markdown расширения (pymdownx)**:
- `pymdownx.superfences` - fenced code blocks с подсветкой
- `pymdownx.tabbed` - вкладки для разных вариантов
- `pymdownx.tasklist` - чеклисты
- `pymdownx.emoji` - эмодзи для визуальных маркеров

### Структура документации

```
docs/
├── index.md                    # Главная страница
├── quickstart.md               # Быстрый старт
├── architecture.md             # High-level архитектура
├── backend/                    # Backend по сервисам
│   ├── user/README.md
│   ├── event/README.md
│   └── common/                 # backend-common библиотека
├── frontend/                   # Frontend документация
├── qa/                         # QA стратегия и тест-планы
├── api/                        # API документация (OpenAPI)
├── operations/                 # DevOps: infrastructure, deployment
├── business/                   # Бизнес-требования
├── development/                # Developer guides
├── decisions/                  # Architecture Decision Records
└── _internal/                  # Внутренние файлы
    ├── templates/              # Шаблоны документации
    └── documentation-guidelines.md
```

**Принципы организации**:
- По аудитории: development/, operations/, qa/, business/
- По lifecycle: quickstart.md → development/setup.md → operations/deployment.md
- Single Source of Truth: нет дублирования, cross-references

### Процессы

**Development**:
```bash
make docs-serve    # Локальный dev сервер на :8000
make docs-build    # Сборка статического сайта в site/
```

**CI/CD**:
- Автоматическая сборка при каждом PR
- Линтинг Markdown (markdownlint)
- Проверка битых ссылок
- Автодеплой в GitHub Pages при merge в main

**Управление зависимостями**:
- Pinned versions в `requirements-docs.txt`
- Python virtual environment для изоляции

### Команды

```bash
# Setup (первый раз)
make docs-setup         # Установить зависимости (Python venv)

# Development
make docs-serve         # Запустить dev сервер
make docs-build         # Собрать статический сайт

# Quality checks (TODO)
make docs-lint          # Markdown lint
make docs-check         # Проверка broken links
```

## Последствия

### Положительные

- ✅ **Простота для разработчиков** - Markdown знают все, низкий порог входа
- ✅ **Быстрый онбординг** - новый разработчик может найти всё через search
- ✅ **Версионирование** - документация в Git, те же процессы что и код (PR, review)
- ✅ **Автоматизация** - CI/CD проверки, автоматический deploy
- ✅ **Красивый UI** - Material theme, responsive, modern
- ✅ **Диаграммы** - Mermaid для architecture, sequence, flowcharts
- ✅ **Переиспользование** - include-markdown для DRY
- ✅ **Extensibility** - богатая экосистема плагинов MkDocs

### Отрицательные

- ❌ **Требует настройку CI** - нужно настроить workflows для линтинга и deploy
- ❌ **Python зависимость** - требуется Python для сборки (но это не проблема для большинства)
- ❌ **Ручное обновление** - документация не обновляется автоматически при изменении кода
- ❌ **Нет версионирования из коробки** - mike plugin нужен для версий (опционально)

### Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Документация устаревает | High | Medium | Checklist в PR template, обязательное обновление docs при изменении API |
| Битые ссылки после рефакторинга | Medium | Low | Автоматическая проверка broken links в CI |
| Конфликты при одновременном редактировании | Low | Low | Git merge conflicts, code review процесс |
| MkDocs перестанет поддерживаться | Low | High | MkDocs - популярный проект, большое community, можно мигрировать на Docusaurus если нужно |

## Альтернативы

### Вариант 1: Docusaurus (Meta)

**Плюсы:**
- ✅ React-based, гибкая кастомизация через компоненты
- ✅ Встроенное версионирование документации
- ✅ MDX support (React components в Markdown)
- ✅ Большое community (используется в Facebook)

**Минусы:**
- ❌ Требует знания React для кастомизации
- ❌ Более сложная настройка (webpack, babel)
- ❌ Node.js зависимость (дополнительный runtime)
- ❌ Slower build time для больших сайтов

**Почему не выбран:** Избыточная сложность для наших потребностей, нам не нужна гибкость React компонентов

### Вариант 2: GitBook

**Плюсы:**
- ✅ Очень красивый UI
- ✅ Встроенная интеграция с GitHub
- ✅ Collaborative editing

**Минусы:**
- ❌ Платная для private repositories
- ❌ Vendor lock-in (hosted solution)
- ❌ Меньше контроля над deployment

**Почему не выбран:** Не хотим зависеть от внешнего сервиса, нужен self-hosted

### Вариант 3: Sphinx (Python docs standard)

**Плюсы:**
- ✅ De facto standard для Python проектов
- ✅ Мощная система cross-references
- ✅ reStructuredText богаче Markdown

**Минусы:**
- ❌ reStructuredText сложнее Markdown
- ❌ Менее современный UI по сравнению с Material
- ❌ Более steep learning curve

**Почему не выбран:** reStructuredText менее популярен, сложнее для non-Python разработчиков

### Вариант 4: Read the Docs

**Плюсы:**
- ✅ Hosted solution для open source проектов
- ✅ Автоматическая сборка из Git
- ✅ Версионирование из коробки

**Минусы:**
- ❌ Ограничения на кастомизацию
- ❌ Vendor lock-in
- ❌ Платный для private projects

**Почему не выбран:** Хотим полный контроль, self-hosted решение

## План реализации

### Этапы

1. **Этап 1: Setup базовой инфраструктуры** - 1 день
   - Создать `mkdocs.yml`
   - Настроить Material theme
   - Создать базовую структуру `docs/`
   - Написать `requirements-docs.txt`

2. **Этап 2: Создание templates и guidelines** - 2 дня
   - Создать шаблоны для разных типов документации
   - Написать documentation-guidelines.md
   - Примеры использования templates

3. **Этап 3: Миграция существующей документации** - 5 дней
   - Перенести README.md файлов в новую структуру
   - Создать cross-references между документами
   - Удалить дублирование

4. **Этап 4: CI/CD setup** - 2 дня
   - GitHub Actions workflow для сборки
   - Линтинг и проверка ссылок
   - Автодеплой в GitHub Pages

### Критерии успеха

- [x] MkDocs сайт успешно собирается и отображается
- [x] Все разделы (backend, frontend, qa, operations) имеют документацию
- [x] Templates созданы и используются
- [x] Documentation Guidelines написаны
- [x] CI/CD pipeline работает

### Rollback plan

Если MkDocs не подойдёт:
1. Остановить автодеплой
2. Markdown файлы остаются валидными для любого генератора
3. Можно мигрировать на Docusaurus или другой генератор без потери контента

## Мониторинг

**Метрики для отслеживания:**
- Freshness: % документов обновлённых за последние 3 месяца
- Coverage: % API endpoints с документацией
- Broken links: количество битых ссылок (цель: 0)
- Build time: время сборки документации (цель: < 1 минута)
- Usage: page views через GitHub Pages analytics

**Ожидаемые значения:**
- Freshness: > 80% за 3 месяца
- Coverage: > 90% API endpoints
- Broken links: 0
- Build time: < 1 минута

## Связанные решения

**Зависит от:**
- Нет зависимостей

**Влияет на:**
- ADR-002: API Documentation Strategy (автогенерация OpenAPI в MkDocs)

**Заменяет:**
- Нет предыдущих ADR

## Ссылки

**Документация:**
- [Documentation Guidelines](../_internal/documentation-guidelines.md) - правила ведения документации
- [Templates README](../_internal/templates/README.md) - доступные шаблоны

**Конфигурация:**
- `mkdocs.yml` - конфигурация MkDocs
- `requirements-docs.txt` - Python зависимости
- `.github/workflows/docs.yml` - CI/CD pipeline

**Внешние ресурсы:**
- [MkDocs Documentation](https://www.mkdocs.org/)
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
- [Mermaid JS](https://mermaid.js.org/)
- [Doc as Code Philosophy](https://www.writethedocs.org/guide/docs-as-code/)

---
**История изменений:**
- 2025-09-22: Создание документа - выбор MkDocs + Material
