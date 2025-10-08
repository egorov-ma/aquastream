---
title: AquaStream — портал документации
summary: Стартовая страница портала документации AquaStream - микросервисная платформа для организации водных мероприятий
tags: [home, documentation]
---

# AquaStream — портал документации

**AquaStream** — микросервисная платформа для организации водных мероприятий (сплавы, походы, туры).

## О проекте

Платформа предоставляет полный цикл управления водными мероприятиями:
- 🎫 **Бронирование** - онлайн-бронирование мест на сплавах
- 👥 **Управление экипажами** - формирование команд и групп
- 💳 **Платежи** - интеграция с платежными провайдерами (YooKassa, Stripe)
- 📧 **Уведомления** - Telegram, Email, SMS
- 📊 **Аналитика** - метрики и отчеты для организаторов

### Технологический стек

- **Backend**: Java 21, Spring Boot 3.5.x, PostgreSQL 16, Redis 7
- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS + shadcn/ui
- **Infrastructure**: Docker, Nginx, MinIO, Prometheus, Grafana
- **Architecture**: Микросервисы, API Gateway, schema-per-service DB

## Быстрый старт для разработчиков

Запустите проект локально за 5 минут:

```bash
# 1. Клонировать репозиторий
git clone https://github.com/egorov-ma/aquastream.git
cd aquastream

# 2. Запустить инфраструктуру
make infra-up

# 3. Запустить backend
make backend-build && make backend-up

# 4. Запустить frontend
make frontend-dev

# 5. Проверить здоровье
make health-check
```

Подробнее: [Быстрый старт](quickstart.md)

## Документация

### Для разработчиков

- **[Быстрый старт](quickstart.md)** - запуск проекта за 5 минут
- **[Development Setup](development/setup.md)** - детальная настройка окружения
- **[Рабочие процессы](development/workflows.md)** - Git workflow, code review
- **[Build Guide](development/build-guide.md)** - сборка проектов (Gradle, pnpm)
- **[Style Guides](development/style-guides.md)** - code style, conventions
- **[Troubleshooting](development/troubleshooting.md)** - решение типичных проблем

### Архитектура и дизайн

- **[Архитектура](architecture.md)** - high-level обзор системы
- **[Backend Services](backend/README.md)** - микросервисы, API, бизнес-логика
- **[Frontend Architecture](frontend/README.md)** - компоненты, routing, state management
- **[API документация](api/index.md)** - OpenAPI спецификации, Swagger UI
- **[ADR записи](decisions/index.md)** - архитектурные решения

### Operations и DevOps

- **[Operations Guide](operations/README.md)** - infrastructure, deployment, monitoring
- **[Infrastructure](operations/infrastructure.md)** - Docker, PostgreSQL, Redis, MinIO
- **[CI/CD](operations/ci-cd.md)** - GitHub Actions, security scanning, release
- **[Monitoring](operations/monitoring.md)** - Prometheus, Grafana, Loki
- **[Deployment](operations/deployment.md)** - blue-green deployment, health checks
- **[Security Policy](operations/policies/security.md)** - политика безопасности

### QA и тестирование

- **[QA Strategy](qa/index.md)** - стратегия тестирования, test pyramid

## CI/CD статус

![Backend CI](https://github.com/egorov-ma/aquastream/actions/workflows/backend-ci.yml/badge.svg)
![Frontend CI](https://github.com/egorov-ma/aquastream/actions/workflows/frontend-ci.yml/badge.svg)
![Docs CI](https://github.com/egorov-ma/aquastream/actions/workflows/docs-ci.yml/badge.svg)

## Навигация

Все разделы документации доступны в меню слева. Используйте поиск (🔍) для быстрого поиска информации.

### По аудитории

- **Разработчики** → [Development](development/setup.md), [Backend](backend/README.md), [Frontend](frontend/README.md)
- **DevOps/SRE** → [Operations](operations/README.md), [CI/CD](operations/ci-cd.md), [Monitoring](operations/monitoring.md)
- **QA Engineers** → [QA Strategy](qa/index.md)
- **Архитекторы** → [Architecture](architecture.md), [ADR](decisions/index.md)

### По задачам

- **Первый запуск** → [Quickstart](quickstart.md)
- **Настройка окружения** → [Development Setup](development/setup.md)
- **Разработка feature** → [Workflows](development/workflows.md)
- **Deploy на production** → [Deployment Guide](operations/deployment.md)
- **Решение проблем** → [Troubleshooting](development/troubleshooting.md)

## Получить помощь

- **Документация**: все разделы доступны в меню слева
- **Issues**: [GitHub Issues](https://github.com/egorov-ma/aquastream/issues)
- **Вопросы**: задайте вопрос в команде

---

**Добро пожаловать в AquaStream! 🚀**