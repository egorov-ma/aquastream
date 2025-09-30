# Архитектура AquaStream

---
title: Architecture Overview
summary: High-level обзор архитектуры системы AquaStream - микросервисы, модули и взаимодействия
tags: [architecture, overview]
---

## Обзор

AquaStream - система управления водными мероприятиями, построенная на модульной архитектуре с четким разделением ответственности между компонентами.

## Архитектурная схема

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Web App<br/>Next.js]
    end

    subgraph "API Gateway Layer"
        GW[API Gateway<br/>8100]
    end

    subgraph "Backend Services"
        USER[User Service<br/>8101]
        EVENT[Event Service<br/>8102]
        CREW[Crew Service<br/>8103]
        PAYMENT[Payment Service<br/>8104]
        NOTIFY[Notification Service<br/>8105]
        MEDIA[Media Service<br/>8106]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Primary DB)]
        REDIS[(Redis<br/>Cache & Sessions)]
    end

    subgraph "External Services"
        TELEGRAM[Telegram Bot]
        PAY_PROVIDERS[Payment Providers]
        EMAIL[Email Service]
    end

    WEB --> GW
    GW --> USER
    GW --> EVENT
    GW --> CREW
    GW --> PAYMENT
    GW --> NOTIFY
    GW --> MEDIA

    USER --> PG
    EVENT --> PG
    CREW --> PG
    PAYMENT --> PG
    NOTIFY --> PG
    MEDIA --> PG

    USER --> REDIS
    EVENT --> REDIS
    GW --> REDIS

    NOTIFY --> TELEGRAM
    NOTIFY --> EMAIL
    PAYMENT --> PAY_PROVIDERS
```

## Модули системы

### 🎯 Core Business Services

**User Service (8101)**
- Аутентификация и авторизация
- Управление профилями пользователей
- Роли и разрешения

**Event Service (8102)**
- Создание и управление событиями
- Система бронирований
- Управление расписанием

**Crew Service (8103)**
- Управление экипажами
- Назначение команд на события
- Квалификации и сертификации

**Payment Service (8104)**
- Обработка платежей
- Интеграция с платежными провайдерами
- Управление транзакциями

### 🔧 Supporting Services

**API Gateway (8100)**
- Единая точка входа
- Аутентификация и авторизация
- Rate limiting и мониторинг

**Notification Service (8105)**
- Email уведомления
- Telegram интеграция
- Push notifications

**Media Service (8106)**
- Загрузка и обработка файлов
- Управление изображениями
- CDN интеграция

## Детальная спецификация сервисов

### Таблица сервисов

| Сервис | Порт | Назначение | База (схема) | Внешние интеграции |
|--------|------|------------|--------------|-------------------|
| **Gateway** | 8080 | Маршрутизация, CORS, Rate Limiting, Health aggregation | - | - |
| **User** | 8101 | Аутентификация, профили, роли, RBAC | `user` | Telegram Bot |
| **Event** | 8102 | События, организаторы, бронирования, waitlist | `event` | - |
| **Crew** | 8103 | Управление группами (экипажи/палатки) | `crew` | - |
| **Payment** | 8104 | Платежи, транзакции, вебхуки | `payment` | YooKassa, CloudPayments, Stripe |
| **Notification** | 8105 | Telegram бот, уведомления | `notification` | Telegram Bot API |
| **Media** | 8106 | Файлы, presigned URLs, загрузка | `media` | MinIO/S3 |

### Модульная структура сервисов

Каждый микросервис (кроме Gateway) разбит на три модуля:

```
backend-[service]/
├── backend-[service]-api/        # REST API endpoints, Transport DTO, Controllers
│   └── src/main/java/
│       └── com/aquastream/[service]/api/
│           ├── controller/       # REST контроллеры
│           ├── dto/              # Transport DTO с validation
│           └── [Service]ApiApplication.java
├── backend-[service]-service/    # Бизнес-логика, Service DTO
│   └── src/main/java/
│       └── com/aquastream/[service]/service/
│           ├── service/          # Сервисный слой
│           ├── dto/              # Service DTO (доменные модели)
│           └── mapper/           # Маппинг между DTO
└── backend-[service]-db/         # Data Access, JPA Entities
    └── src/main/java/
        └── com/aquastream/[service]/db/
            ├── entity/           # JPA сущности
            └── repository/       # Spring Data репозитории
```

**Правила взаимодействия:**
- `api` → `service` (запрещено: `api` → `db`)
- `service` → `db` (запрещено: `service` → `api`)
- Контроллеры маппят Transport DTO ↔ Service DTO
- Сервисы маппят Service DTO ↔ Entity
- ArchUnit тесты проверяют соблюдение правил

### Backend-Common

Общая библиотека для всех сервисов с автоконфигурацией Spring Boot:

```
backend-common/
├── config/              # Auto-конфигурации
│   ├── ServiceDiscoveryAutoConfiguration.java
│   └── ServiceUrls.java
├── domain/              # Доменные константы и enum'ы
│   ├── UserRole.java           # GUEST, USER, ORGANIZER, ADMIN
│   ├── BookingStatus.java      # PENDING, CONFIRMED, COMPLETED, EXPIRED, CANCELLED, NO_SHOW
│   ├── PaymentStatus.java      # PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED
│   └── DomainConstants.java    # Константы (заголовки, лимиты)
├── error/               # RFC 7807 Problem Details
│   ├── GlobalExceptionHandler.java
│   ├── ApiException.java
│   ├── ProblemDetails.java
│   ├── ErrorCodes.java
│   └── CommonErrorHandlingAutoConfiguration.java
├── health/              # Health checks
│   └── ServiceHealthChecker.java
├── metrics/             # Система метрик
│   ├── collector/       # MetricsCollector
│   ├── config/          # MetricsAutoConfiguration, MetricsProperties
│   ├── controller/      # MetricsController (REST endpoint)
│   ├── filter/          # MetricsFilter (HTTP метрики)
│   ├── model/           # MetricData, MetricType
│   ├── scheduler/       # MetricsScheduler (периодическая запись)
│   └── writer/          # RedisMetricsWriter
├── mock/                # Моки для dev окружения
│   ├── config/          # MockProperties
│   └── service/         # MockDetector, MockResponseGenerator
├── ratelimit/           # Rate limiting (Bucket4j + Redis)
│   ├── config/          # RateLimitAutoConfiguration, RateLimitProperties
│   ├── filter/          # RateLimitFilter
│   └── service/         # RateLimitService
├── util/                # Утилиты
│   └── Ids.java         # Генерация UUID, JTI, idempotency keys
└── web/                 # Web конфигурация
    ├── config/          # WebAutoConfiguration
    ├── CorrelationIdFilter.java
    ├── CorrelationIdRestTemplateInterceptor.java
    └── ServiceDiscoveryController.java
```

**Экспортируемые зависимости (api)**:
- `spring-boot-starter-web` - REST, Jackson, Tomcat
- `spring-boot-starter-validation` - Bean Validation
- `bucket4j-redis` - Rate limiting

**Internal зависимости (implementation)**:
- `spring-boot-starter-security` - Security utilities
- `spring-boot-starter-data-redis` - Redis client
- `logstash-logback-encoder` - Structured logging

**Автоконфигурации** (через `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`):
- `CommonErrorHandlingAutoConfiguration` - глобальная обработка ошибок
- `RateLimitAutoConfiguration` - Bucket4j rate limiting
- `WebAutoConfiguration` - CORS, CorrelationId
- `MetricsAutoConfiguration` - система метрик
- `ServiceDiscoveryAutoConfiguration` - service discovery

## Технологический стек

### Backend
```yaml
Language: Java 21
Framework: Spring Boot 3.x
Gateway: Spring WebFlux
Build: Gradle 8.5+
Database: PostgreSQL 16 (схемы на сервис)
Cache: Redis 7
Storage: MinIO (S3-compatible)
Migrations: Liquibase
Security: Spring Security + JWT
API: RESTful + OpenAPI 3.0
Error Handling: RFC 7807 Problem Details
Rate Limiting: Bucket4j (soft limits)
Monitoring: Spring Boot Actuator
Testing: JUnit 5, TestContainers, ArchUnit
```

### Frontend
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript 5.x
Runtime: React 18
Styling: Tailwind CSS 3.4 + shadcn/ui
UI Components: Radix UI
State: React Hooks + Context
HTTP: Fetch API
Forms: React Hook Form + Zod
Testing: Node test runner, Playwright
```

### Infrastructure
```yaml
Containerization: Docker + Docker Compose
Observability: Prometheus + Grafana + Loki + Promtail
Security Scanning: Trivy, OWASP Dependency Check
SBOM: Syft
Documentation: MkDocs + Material
CI/CD: GitHub Actions
Deployment: Docker Compose (local/staging/prod)
Storage: MinIO (S3-compatible object storage)
```

## Принципы архитектуры

### 1. Domain Driven Design
Каждый сервис представляет отдельный бизнес-домен с четкими границами

### 2. API First
Контракты определяются до реализации через OpenAPI спецификации

### 3. Microservices
Слабо связанные сервисы с собственными базами данных

### 4. Event Sourcing (частично)
Асинхронная обработка доменных событий

### 5. Security First
Безопасность встроена на всех уровнях

## Паттерны взаимодействия

### Synchronous Communication
- REST API между frontend и gateway
- HTTP calls между сервисами для критичных операций
- JWT для аутентификации

### Asynchronous Communication
- Event publishing для доменных событий
- Message queues для фоновых задач
- Email/SMS уведомления

### Data Consistency
- Каждый сервис владеет своими данными
- Eventual consistency через события
- Компенсирующие транзакции при необходимости

## Безопасность

### Authentication & Authorization
- JWT токены с refresh mechanism
- Role-based access control (RBAC)
- Method-level security

### Data Protection
- HTTPS обязателен
- Input validation и sanitization
- SQL injection protection
- Secrets management

### Monitoring & Auditing
- Structured logging
- Security event tracking
- Access audit trails

## Масштабирование

### Горизонтальное
- Stateless сервисы
- Load balancing через nginx/HAProxy
- Database read replicas

### Вертикальное
- JVM tuning
- Connection pooling
- Cache strategies

### Performance
- Database indexing
- CDN для статики
- API response caching

## Мониторинг и наблюдаемость

### Метрики
- Business KPIs
- Technical performance
- System health

### Логирование
- Structured JSON logs
- Correlation IDs
- Centralized aggregation

### Алерты
- Service health monitoring
- Performance thresholds
- Business metric anomalies

## Развертывание

### Environments
| Environment | Purpose | URL |
|-------------|---------|-----|
| Local | Development | localhost |
| Staging | Testing | staging.aquastream.org |
| Production | Live | aquastream.org |

### Deployment Strategy
- Blue-green deployments
- Health checks
- Automated rollback

## Архитектурные решения

Ключевые решения документированы в [ADR записях](decisions/):

- [ADR-001: Doc as Code Stack](decisions/adr-0001-docs-stack.md)
- [ADR-002: API Documentation Strategy](decisions/adr-0003-api-redoc.md)
- [ADR-003: Module Documentation Sync](decisions/adr-0002-sync-module-docs.md)

## Ограничения и trade-offs

### Текущие ограничения
- Single PostgreSQL instance (нет HA)
- Synchronous inter-service communication
- Manual deployment процессы

### Планируемые улучшения
- Database clustering
- Async messaging
- CI/CD automation
- Monitoring improvements

## См. также

- [Backend Documentation](backend/) - детали по каждому сервису
- [Frontend Documentation](frontend/) - архитектура клиентской части
- [API Documentation](api/) - полная документация API
- [Operations Guide](operations/) - руководство по эксплуатации
- [QA Strategy](qa/) - стратегия тестирования