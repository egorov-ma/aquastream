# AquaStream Documentation Structure

Полная структура документации проекта AquaStream.

## Корневая структура

```
docs/
├── index.md                    # Главная страница документации
├── quickstart.md               # Быстрый старт для разработчиков
├── architecture.md             # Обзор архитектуры системы
├── backend/                    # Backend документация
├── frontend/                   # Frontend документация
├── qa/                         # QA и тестирование
├── api/                        # API документация (автогенерация)
├── operations/                 # DevOps и эксплуатация
├── business/                   # Бизнес-документация
├── development/                # Гайды разработчика
├── decisions/                  # Architecture Decision Records (ADR)
└── _internal/                  # Внутренние файлы и шаблоны
    ├── docs-tools/             # Инструменты документации
    ├── to_refactoring/         # Старая документация (временно)
    ├── templates/              # Шаблоны документации
    ├── _media/                 # Медиа файлы
    └── docs-structure.md       # Этот файл
```

## Backend структура

```
backend/
├── README.md                   # Обзор backend архитектуры
├── common/                     # Общие компоненты
│   ├── authentication.md      # Аутентификация и авторизация
│   ├── error-handling.md      # Обработка ошибок
│   ├── database.md            # База данных
│   └── security.md            # Безопасность
├── gateway/                    # API Gateway Service (8100)
│   ├── README.md              # Обзор сервиса
│   ├── api.md                 # API документация
│   ├── business-logic.md      # Бизнес-логика
│   └── operations.md          # Эксплуатация
├── user/                      # User Service (8101)
│   ├── README.md
│   ├── api.md
│   ├── business-logic.md
│   └── operations.md
├── event/                     # Event Service (8102)
│   ├── README.md
│   ├── api.md
│   ├── business-logic.md
│   └── operations.md
├── payment/                   # Payment Service (8104)
│   ├── README.md
│   ├── api.md
│   ├── business-logic.md
│   └── operations.md
├── notification/              # Notification Service (8105)
│   ├── README.md
│   ├── api.md
│   ├── business-logic.md
│   └── operations.md
├── crew/                      # Crew Service (8103)
│   ├── README.md
│   ├── api.md
│   ├── business-logic.md
│   └── operations.md
└── media/                     # Media Service (8106)
    ├── README.md
    ├── api.md
    ├── business-logic.md
    └── operations.md
```

## Frontend структура

```
frontend/
├── README.md                  # Обзор frontend архитектуры
├── setup.md                   # Настройка окружения
├── components.md              # Архитектура компонентов
├── routing.md                 # Маршрутизация
├── state-management.md        # Управление состоянием
├── api-integration.md         # Интеграция с API
└── deployment.md              # Развертывание
```

## QA & Testing структура

```
qa/
├── README.md                  # Обзор QA стратегии
├── test-strategy.md           # Общая стратегия тестирования
├── test-plans/                # Планы тестирования
│   ├── backend-testing.md     # Тестирование backend
│   ├── frontend-testing.md    # Тестирование frontend
│   ├── integration-testing.md # Интеграционное тестирование
│   └── e2e-testing.md         # End-to-end тестирование
├── automation/                # Автоматизация тестов
│   ├── unit-tests.md          # Unit тесты
│   ├── api-tests.md           # API тесты
│   └── ui-tests.md            # UI тесты
├── manual-testing/            # Ручное тестирование
│   ├── test-cases.md          # Тест-кейсы
│   ├── regression-suite.md    # Регрессионное тестирование
│   └── exploratory-testing.md # Исследовательское тестирование
├── performance/               # Нагрузочное тестирование
│   ├── load-testing.md        # Load testing
│   └── performance-benchmarks.md # Performance benchmarks
├── security-testing.md        # Тестирование безопасности
└── bug-management.md          # Управление багами
```

## API Documentation структура

```
api/
├── index.md                   # Обзор API
└── specs/                     # OpenAPI спецификации (автогенерация)
    └── root/                  # Корневые спецификации
```

## Operations структура

```
operations/
├── README.md                  # Обзор операций
├── infrastructure.md          # Инфраструктура
├── deployment.md              # Развертывание
├── ci-cd.md                   # CI/CD
├── monitoring.md              # Мониторинг
├── backup-recovery.md         # Резервное копирование
├── runbooks/                  # Runbook'и
│   ├── incident-response.md   # Реагирование на инциденты
│   ├── service-restart.md     # Перезапуск сервисов
│   └── database-maintenance.md # Обслуживание БД
└── policies/                  # Политики
    ├── security.md            # Политика безопасности
    ├── code-of-conduct.md     # Кодекс поведения
    └── support.md             # Поддержка
```

## Business структура

```
business/
├── requirements.md            # Требования
├── user-journeys.md           # Пользовательские сценарии
├── processes.md               # Бизнес-процессы
└── roadmap.md                 # Дорожная карта
```

## Development структура

```
development/
├── setup.md                   # Настройка окружения
├── workflows.md               # Рабочие процессы
├── testing.md                 # Тестирование
├── style-guides.md            # Стайл-гайды
└── troubleshooting.md         # Устранение неполадок
```

## Decisions структура

```
decisions/
├── index.md                   # Обзор архитектурных решений
└── adr-NNNN-title.md          # ADR записи
```

## Внутренние файлы

```
_internal/
├── docs-tools/                # Инструменты документации
│   ├── mkdocs.yml            # Конфигурация MkDocs
│   ├── tools/                # Python скрипты автоматизации
│   ├── _inventory/           # Инвентаризация файлов
│   └── _reports/             # Отчеты по документации
├── to_refactoring/           # Старая документация (временно)
├── templates/                # Шаблоны документации
│   ├── backend-service-readme.md
│   ├── qa-test-plan.md
│   ├── operations-runbook.md
│   ├── architecture.md
│   ├── adr-template.md
│   └── frontend-component.md
├── _media/                   # Медиа файлы и диаграммы
└── docs-structure.md         # Этот файл
```

## Правила именования

### Файлы
- Используйте kebab-case: `user-service.md`
- README.md в каждой секции для обзора
- index.md для главных страниц разделов

### Директории
- Используйте kebab-case: `test-plans/`
- Краткие, понятные имена
- Отражают структуру проекта

## Технологический стек документации

- **MkDocs**: генератор статических сайтов
- **Material Theme**: тема для MkDocs
- **Python**: автоматизация и утилиты
- **OpenAPI**: автогенерация API документации
- **Mermaid**: диаграммы в markdown
- **PlantUML**: сложные диаграммы (опционально)

## Стандарты контента

- **Язык**: Русский с техническими терминами на английском
- **Заголовки**: На русском языке
- **Код**: Комментарии на английском, документация на русском
- **Примеры**: Реальные команды через Makefile
- **Технологии**: Java 21, Gradle, Spring Boot 3.x

## Автоматизация

- `make docs-build` - сборка документации
- `make docs-serve` - локальный сервер
- `make docs-check` - проверка ссылок и стилей
- Автогенерация API из OpenAPI спецификаций
- Синхронизация с модулями через Python скрипты