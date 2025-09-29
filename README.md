# AquaStream

Микросервисная платформа для организации событий.

## Документация

📖 **Портал документации**: [docs/index.md](docs/index.md)

Локальный предпросмотр: `make docs-setup` → `make docs-serve`

## Status

![Backend CI](https://github.com/egorov-ma/aquastream/actions/workflows/backend-ci.yml/badge.svg)
![Frontend CI](https://github.com/egorov-ma/aquastream/actions/workflows/frontend-ci.yml/badge.svg)
![Docs CI](https://github.com/egorov-ma/aquastream/actions/workflows/docs-ci.yml/badge.svg)




docs/
├── README.md                     # Главная страница
├── quickstart.md                 # Быстрый старт
├── architecture.md               # Общая архитектура системы
├── glossary.md                   # Глоссарий терминов
│
├── backend/                      # Backend документация
│   ├── README.md                 # Обзор backend архитектуры
│   ├── common/                   # Общие компоненты backend
│   │   ├── authentication.md     # Система аутентификации
│   │   ├── error-handling.md     # Обработка ошибок
│   │   ├── database.md           # Общая схема БД
│   │   └── security.md           # Безопасность
│   │
│   ├── gateway/                  # API Gateway модуль
│   │   ├── README.md             # Обзор Gateway
│   │   ├── api.md                # API описание
│   │   ├── routing.md            # Маршрутизация
│   │   ├── operations.md         # Эксплуатация
│   │   └── changelog.md          # История изменений
│   │
│   ├── user/                     # User сервис
│   │   ├── README.md
│   │   ├── api.md
│   │   ├── business-logic.md
│   │   ├── operations.md
│   │   └── changelog.md
│   │
│   ├── event/                    # Event сервис
│   │   ├── README.md
│   │   ├── api.md
│   │   ├── business-logic.md
│   │   ├── operations.md
│   │   └── changelog.md
│   │
│   ├── payment/                  # Payment сервис
│   │   ├── README.md
│   │   ├── api.md
│   │   ├── business-logic.md
│   │   ├── operations.md
│   │   └── changelog.md
│   │
│   ├── notification/             # Notification сервис
│   │   ├── README.md
│   │   ├── api.md
│   │   ├── business-logic.md
│   │   ├── operations.md
│   │   └── changelog.md
│   │
│   ├── crew/                     # Crew сервис
│   │   ├── README.md
│   │   ├── api.md
│   │   ├── business-logic.md
│   │   ├── operations.md
│   │   └── changelog.md
│   │
│   └── media/                    # Media сервис
│       ├── README.md
│       ├── api.md
│       ├── business-logic.md
│       ├── operations.md
│       └── changelog.md
│
├── frontend/                     # Frontend документация
│   ├── README.md                 # Обзор frontend архитектуры
│   ├── setup.md                  # Настройка и запуск
│   ├── routing.md                # Маршрутизация Next.js
│   ├── components.md             # Компоненты и UI kit
│   ├── state-management.md       # Управление состоянием
│   ├── api-integration.md        # Интеграция с backend
│   ├── deployment.md             # Деплой и сборка
│   └── changelog.md              # История изменений
│
├── qa/                          # QA и тестирование
│   ├── README.md                # Обзор QA процессов
│   ├── test-strategy.md         # Стратегия тестирования
│   ├── test-plans/              # Тест-планы
│   │   ├── backend-testing.md
│   │   ├── frontend-testing.md
│   │   ├── integration-testing.md
│   │   └── e2e-testing.md
│   ├── automation/              # Автоматизация тестирования
│   │   ├── unit-tests.md
│   │   ├── api-tests.md
│   │   └── ui-tests.md
│   ├── manual-testing/          # Ручное тестирование
│   │   ├── test-cases.md
│   │   ├── regression-suite.md
│   │   └── exploratory-testing.md
│   ├── performance/             # Нагрузочное тестирование
│   │   ├── load-testing.md
│   │   └── performance-benchmarks.md
│   ├── security-testing.md      # Тестирование безопасности
│   └── bug-management.md        # Управление дефектами
│
├── ✅ api/                          # API документация (автогенерация)
│   ├── index.md                  # Сводка всех API
│   ├── specs/                    # OpenAPI спецификации
│   │   └── root/                 # Спецификации всех сервисов
│   └── redoc/                    # ReDoc HTML страницы
│       └── root/                 # HTML документация
│
├── operations/                   # DevOps и эксплуатация
│   ├── README.md                 # Обзор инфраструктуры
│   ├── deployment.md             # CI/CD процессы
│   ├── monitoring.md             # Мониторинг и алерты
│   ├── backup-recovery.md        # Резервное копирование
│   ├── runbooks/                 # Операционные процедуры
│   │   ├── incident-response.md
│   │   ├── service-restart.md
│   │   └── database-maintenance.md
│   └── infrastructure.md         # Описание инфраструктуры
│
├── business/                     # Бизнес документация
│   ├── requirements.md           # Требования
│   ├── user-journeys.md          # Пользовательские сценарии
│   ├── processes.md              # Бизнес-процессы
│   └── roadmap.md                # Дорожная карта
│
├── ✅ development/                  # Руководство разработчика
│   ├── setup.md                  # Настройка среды
│   ├── workflows.md              # Git flow, код-ревью
│   ├── testing.md                # Стратегия тестирования
│   ├── style-guides.md           # Стандарты кода
│   └── troubleshooting.md        # Частые проблемы
│
├── ✅ decisions/                    # Architecture Decision Records
│   ├── index.md                  # Список всех ADR
│   ├── adr-001-docs-stack.md
│   ├── adr-002-sync-modules.md
│   └── adr-003-api-design.md
│
└── _internal/                    # Внутренние файлы (скрыты от навигации)
├── templates/                # Шаблоны документов
├── reports/                  # Отчеты о качестве
├── inventory/                # Инвентаризация файлов
└── tools/                    # Скрипты автоматизации