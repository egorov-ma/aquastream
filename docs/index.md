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

#### Backend (Java/Spring Boot)

**Core Technologies:**
- **Java 21** - Virtual threads (Project Loom) для высокой throughput, богатая экосистема
- **Spring Boot 3.5.x** - автоконфигурация, стартеры, Actuator для production-ready приложений
- **Spring WebFlux** - реактивный API Gateway с non-blocking I/O
- **Spring Security** - JWT authentication (HS512), RBAC (GUEST/USER/ORGANIZER/ADMIN)

**Data & Persistence:**
- **PostgreSQL 16** - ACID транзакции, multi-schema (schema-per-service), JSON support
- **Liquibase** - версионирование схем БД, rollback support
- **Spring Data JPA** - репозитории, custom queries, Specifications
- **HikariCP** - connection pooling (max 20, min idle 5)

**Caching & Messaging:**
- **Redis 7** - session storage (TTL: 1ч), rate limiting (Bucket4j), metrics
- **MinIO** - S3-compatible object storage для файлов и медиа

**Monitoring & Observability:**
- **Spring Boot Actuator** - health checks, metrics, management endpoints
- **Prometheus** - метрики (HTTP requests, JVM, бизнес-метрики)
- **Grafana** - дашборды и визуализация
- **Loki + Promtail** - centralized logging

**Testing:**
- **JUnit 5** - unit tests (target coverage ≥70%)
- **Mockito + AssertJ** - mocking и fluent assertions
- **Testcontainers** - integration tests с real PostgreSQL/Redis
- **ArchUnit** - architecture tests (layered structure validation)
- **RestAssured** - API testing

**Build & Infrastructure:**
- **Gradle 8.12+** - Kotlin DSL, convention plugins, dependency locking
- **Docker + Compose** - контейнеризация, multi-stage builds
- **Nginx** - edge proxy, TLS termination, CORS, rate limiting

#### Frontend (Next.js/React)

**Core Framework:**
- **Next.js 15** - App Router, SSR/SSG, Server Components
- **React 18** - concurrent rendering, Suspense, Server Components support
- **TypeScript 5.x** - type safety, IntelliSense, compile-time checks

**Styling & UI:**
- **Tailwind CSS 3.4.18** - utility-first CSS, responsive design, dark mode support
- **shadcn/ui** - accessible UI components на базе Radix UI
- **Radix UI** - headless components (Dialog, Dropdown, Popover, etc.)
- **CSS Variables** - theming и кастомизация

**State Management:**
- **React Hooks** - useState, useEffect, useReducer для локального состояния
- **React Context** - глобальное состояние (auth, theme)
- **Server State** - Next.js Server Components для данных с бэкенда

**Forms & Validation:**
- **React Hook Form** - performance-friendly форма менеджмент
- **Zod** - runtime schema validation, TypeScript integration

**HTTP & API:**
- **Fetch API** - нативный HTTP клиент
- **JWT tokens** - access (1ч) + refresh (30 дней) для аутентификации

**Testing:**
- **Node test runner** - built-in unit testing
- **Playwright** - E2E тестирование (Chromium, Firefox, Safari)
- **ESLint** - code quality и consistent style
- **Prettier** - code formatting

**Build & Dev Tools:**
- **pnpm** - быстрый package manager (disk space efficient)
- **Turbopack** - Next.js 15 bundler (faster than Webpack)
- **TypeScript Compiler** - type checking

#### DevOps & Infrastructure

**Containerization:**
- **Docker 20.10+** - образы для всех сервисов
- **Docker Compose 2.0+** - оркестрация (dev/stage/prod profiles)
- **Multi-stage builds** - минимальные production образы

**CI/CD:**
- **GitHub Actions** - automated workflows (build, test, deploy)
- **Trivy** - security scanning образов
- **Syft** - SBOM generation
- **OWASP Dependency Check** - vulnerability scanning

**Monitoring Stack (Dev):**
- **Prometheus** - metrics collection и alerting
- **Grafana** - dashboards (infrastructure, business metrics)
- **Loki** - log aggregation
- **Promtail** - log shipper

**Documentation:**
- **MkDocs + Material** - статический сайт из Markdown
- **OpenAPI 3.0** - REST API спецификации
- **ReDoc + Swagger UI** - интерактивная API документация

Подробнее: [Architecture Overview](architecture.md)

## Быстрый старт для разработчиков

Запустите проект локально за 5 минут:

```bash
# 1. Клонировать репозиторий
git clone https://github.com/egorov-ma/aquastream.git
cd aquastream

# 2. Запустить dev stack (автосборка + все сервисы)
make up-dev

# 3. Запустить frontend
cd frontend && pnpm install && pnpm dev

# 4. Проверить здоровье
make smoke
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