---
title: Architecture Overview
summary: High-level обзор архитектуры системы AquaStream - микросервисы, модули и взаимодействия
tags: [architecture, overview]
---

# Архитектура AquaStream

## Обзор

AquaStream - система управления водными мероприятиями, построенная на модульной архитектуре с четким разделением ответственности.

| Аспект | Описание |
|--------|----------|
| **Назначение** | Управление водными мероприятиями (сплавы, походы, туры), бронирование, экипажи, платежи, уведомления |
| **Архитектура** | Микросервисы с API Gateway, schema-per-service PostgreSQL, Redis кэш |
| **Границы ответственности** | ✅ Бизнес-логика водных мероприятий<br>✅ API для frontend/mobile<br>✅ Интеграции с платежными провайдерами<br>✅ Уведомления (Telegram, Email) |

## Архитектурная схема

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Web App<br/>Next.js]
    end

    subgraph "Edge Layer"
        NGINX[Nginx Reverse Proxy]
    end

    subgraph "API Gateway Layer"
        GW[API Gateway<br/>8080]
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

    WEB --> NGINX
    NGINX --> GW
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

| Сервис | Порт | Тип | Назначение | База (схема) | Внешние интеграции |
|--------|------|-----|------------|--------------|-------------------|
| **Nginx** | 80/443 | Edge | TLS termination, CORS, базовый rate limiting, статика, health-check | - | - |
| **Gateway** | 8080 | Gateway | Валидация JWT, X-User-Id/X-User-Role, прикладной rate limiting, health aggregation | - | - |
| **User** | 8101 | Core | Аутентификация, профили, роли, RBAC | `user` | - |
| **Event** | 8102 | Core | События, организаторы, бронирования, waitlist | `event` | - |
| **Crew** | 8103 | Core | Управление группами (экипажи/палатки) | `crew` | - |
| **Payment** | 8104 | Core | Платежи, транзакции, вебхуки | `payment` | YooKassa, CloudPayments, Stripe |
| **Notification** | 8105 | Supporting | Email, Telegram бот, push notifications | `notification` | Telegram Bot API |
| **Media** | 8106 | Supporting | Файлы, presigned URLs, загрузка | `media` | MinIO/S3 |

## Модульная структура сервисов

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

### Правила взаимодействия между модулями

| Правило | Разрешено | Запрещено | Проверка |
|---------|-----------|-----------|----------|
| **API → Service** | ✅ Контроллеры вызывают сервисы | ❌ API → DB напрямую | ArchUnit |
| **Service → DB** | ✅ Сервисы используют репозитории | ❌ Service → API | ArchUnit |
| **DTO Mapping** | ✅ Контроллеры: Transport ↔ Service DTO<br>✅ Сервисы: Service DTO ↔ Entity | ❌ Entity в API responses | ArchUnit |

## Слоистая архитектура

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  ← REST Controllers, Validation
├─────────────────────────────────────┤
│          Service Layer              │  ← Business Logic, Transactions
├─────────────────────────────────────┤
│         Repository Layer            │  ← Data Access, JPA Repositories
├─────────────────────────────────────┤
│          Domain Layer               │  ← Entities, Value Objects
└─────────────────────────────────────┘
```

| Слой | Модуль | Ответственность | Технологии |
|------|--------|----------------|------------|
| **Presentation** | `api` | REST контроллеры, input validation, Transport DTO, OpenAPI аннотации | `@RestController`, `@Valid`, Jakarta Bean Validation |
| **Service** | `service` | Бизнес-логика, транзакционная обработка, Service DTO, маппинг между слоями | `@Service`, `@Transactional` |
| **Repository** | `db` | Spring Data JPA репозитории, custom queries, Specifications для сложных запросов | Spring Data JPA, `@Query` |
| **Domain** | `db/entity` | JPA entities, Value Objects, domain logic (методы сущностей) | `@Entity`, JPA |

## Backend-Common Library

Общая библиотека для всех сервисов с автоконфигурацией Spring Boot.

### Основные компоненты

| Модуль | Компоненты | Назначение |
|--------|------------|------------|
| **config/** | `ServiceDiscoveryAutoConfiguration`, `ServiceUrls` | Auto-конфигурации, service discovery |
| **domain/** | `UserRole`, `BookingStatus`, `PaymentStatus`, `DomainConstants` | Доменные enum'ы и константы (GUEST/USER/ORGANIZER/ADMIN, заголовки, лимиты) |
| **error/** | `GlobalExceptionHandler`, `ApiException`, `ProblemDetails`, `ErrorCodes` | RFC 7807 Problem Details, глобальная обработка ошибок |
| **health/** | `ServiceHealthChecker` | Health checks |
| **metrics/** | `MetricsCollector`, `MetricsFilter`, `MetricsScheduler`, `RedisMetricsWriter` | Система метрик (HTTP, бизнес-метрики, Redis storage) |
| **mock/** | `MockDetector`, `MockResponseGenerator` | Моки для dev окружения |
| **ratelimit/** | `RateLimitFilter`, `RateLimitService` | Bucket4j + Redis rate limiting |
| **util/** | `Ids` | Генерация UUID, JTI, idempotency keys |
| **web/** | `CorrelationIdFilter`, `CorrelationIdRestTemplateInterceptor`, `ServiceDiscoveryController` | Web конфигурация, CORS, Correlation IDs |

### Зависимости и автоконфигурации

| Тип | Библиотеки |
|-----|-----------|
| **Exported (api)** | `spring-boot-starter-web`, `spring-boot-starter-validation`, `bucket4j-redis` |
| **Internal (implementation)** | `spring-boot-starter-security`, `spring-boot-starter-data-redis`, `logstash-logback-encoder` |
| **Автоконфигурации** | `CommonErrorHandlingAutoConfiguration` (RFC 7807), `RateLimitAutoConfiguration` (Bucket4j), `WebAutoConfiguration` (CORS, CorrelationId), `MetricsAutoConfiguration`, `ServiceDiscoveryAutoConfiguration` |

## Технологический стек

### Backend

| Технология | Версия/Детали | Назначение |
|------------|---------------|------------|
| **Language** | Java 21 | Virtual threads (Project Loom), производительность |
| **Framework** | Spring Boot 3.5.x | Автоконфигурация, стартеры, Actuator |
| **Gateway** | Spring WebFlux + Spring Security | Реактивный Gateway с JWT validation |
| **Edge Proxy** | Nginx | TLS, CORS, IP rate limit |
| **Build** | Gradle 8.12+ | Kotlin DSL, convention plugins, dependency locking |
| **Database** | PostgreSQL 16 | ACID транзакции, multi-schema (schema-per-service) |
| **Cache** | Redis 7 | Sessions, rate limiting, metrics |
| **Storage** | MinIO | S3-compatible object storage |
| **Migrations** | Liquibase | Schema versioning |
| **Security** | Spring Security + JWT | HS512, access + refresh tokens |
| **API** | RESTful + OpenAPI 3.0 | REST endpoints, Swagger UI |
| **Error Handling** | RFC 7807 Problem Details | Стандартизированные ошибки |
| **Rate Limiting** | Bucket4j | Soft limits с Redis backend |
| **Monitoring** | Spring Boot Actuator | Health checks, Prometheus metrics |
| **Testing** | JUnit 5, Testcontainers, ArchUnit | Unit, integration, architecture tests |

### Frontend

| Технология | Версия/Детали | Назначение |
|------------|---------------|------------|
| **Framework** | Next.js 15 | App Router, SSR/SSG |
| **Language** | TypeScript 5.x | Type safety |
| **Runtime** | React 18 | UI library |
| **Styling** | Tailwind CSS 3.4.18 + shadcn/ui | Utility-first CSS, Radix UI components |
| **State** | React Hooks + Context | State management |
| **HTTP** | Fetch API | Backend communication |
| **Forms** | React Hook Form + Zod | Validation, form handling |
| **Testing** | Node test runner, Playwright | Unit tests, E2E tests |

### Infrastructure

| Технология | Назначение |
|------------|------------|
| **Docker + Docker Compose** | Контейнеризация, оркестрация (dev/staging) |
| **Prometheus + Grafana** | Метрики, дашборды |
| **Loki + Promtail** | Centralized logging |
| **Trivy** | Docker image security scanning |
| **OWASP Dependency Check** | Dependency vulnerabilities |
| **Syft** | SBOM generation |
| **MkDocs + Material** | Documentation as Code |
| **GitHub Actions** | CI/CD pipelines |
| **Nginx** | Reverse proxy, TLS termination |
| **MinIO** | S3-compatible object storage |

## Ключевые архитектурные паттерны

| Паттерн | Назначение | Реализация | Статус |
|---------|-----------|------------|--------|
| **Repository Pattern** | Абстракция доступа к данным | Spring Data JPA, переиспользуемые query методы | ✅ Активен |
| **Service Layer Pattern** | Инкапсуляция бизнес-логики | `@Service` классы, `@Transactional` границы, координация между репозиториями | ✅ Активен |
| **DTO/Mapper Pattern** | Изоляция слоев | Transport DTO (API) ↔ Service DTO ↔ Entity (DB), предотвращение утечки Entity в API | ✅ Активен |
| **API Gateway Pattern** | Единая точка входа | Централизованная аутентификация, rate limiting, routing, health aggregation | ✅ Активен |
| **Saga Pattern** | Distributed transactions | Компенсирующие транзакции для межсервисных операций, eventual consistency через события | 🔶 Частично |
| **Circuit Breaker** | Устойчивость к сбоям внешних сервисов | Fallback логика для критичных операций, Resilience4j интеграция | 📋 Планируется |

## Обоснование технологического стека

| Технология | Обоснование | Альтернативы |
|------------|-------------|--------------|
| **Java 21** | Virtual threads (Project Loom) для высокой throughput, богатая экосистема, зрелые фреймворки, опыт команды | Kotlin (совместим с Spring), Go (проще, но меньше библиотек) |
| **Spring Boot 3.5.x** | Быстрая разработка (автоконфигурация, стартеры), готовые интеграции (PostgreSQL, Redis, MinIO), production-ready (Actuator, metrics, health checks) | Micronaut (lighter), Quarkus (native compilation) |
| **PostgreSQL 16** | ACID транзакции для финансовых операций, эффективные индексы и query planner, JSON поддержка (notifications, metadata), multi-schema для изоляции данных сервисов | MySQL (меньше возможностей), MongoDB (no ACID) |
| **Gradle** | Kotlin DSL, convention plugins, incremental builds, build cache, dependency locking для воспроизводимых сборок | Maven (XML verbosity), Bazel (сложнее setup) |

## Принципы архитектуры

| Принцип | Описание |
|---------|----------|
| **Domain Driven Design** | Каждый сервис представляет отдельный бизнес-домен с четкими границами |
| **API First** | Контракты определяются до реализации через OpenAPI спецификации |
| **Microservices** | Слабо связанные сервисы с собственными базами данных (schema-per-service) |
| **Event Sourcing** | Асинхронная обработка доменных событий (планируется) |
| **Security First** | Безопасность встроена на всех уровнях (JWT, validation, HTTPS) |

## Паттерны взаимодействия

| Тип | Технологии | Применение |
|-----|-----------|-----------|
| **Synchronous** | REST API, HTTP calls, JWT | Frontend ↔ Gateway, сервисы для критичных операций |
| **Asynchronous** | Event publishing, message queues (планируется) | Доменные события, фоновые задачи, email/SMS уведомления |
| **Data Consistency** | Schema-per-service, eventual consistency, compensating transactions | Каждый сервис владеет своими данными, eventual consistency через события |

## Безопасность

| Аспект | Реализация |
|--------|------------|
| **Authentication & Authorization** | JWT токены (HS512) с refresh mechanism (30 дней), RBAC (GUEST/USER/ORGANIZER/ADMIN), method-level security (`@PreAuthorize`) |
| **Data Protection** | HTTPS обязателен, input validation (`@Valid`, Jakarta Bean Validation), SQL injection protection (Spring Data JPA), secrets management (environment variables) |
| **Monitoring & Auditing** | Structured logging (JSON, Logback), security event tracking (`EXTERNAL_API_CALL`, `ERROR_OCCURRED`), Correlation IDs для трейсинга |

## Производительность и масштабирование

### Performance SLA

| Метрика | Цель (Target) | Текущее значение | Статус |
|---------|---------------|------------------|--------|
| **Response time (READ)** | <500ms (p95) | User Service: ~100ms (p95) | ✅ |
| **Response time (WRITE)** | <1s (p95) | Event Service: ~300ms, Payment: ~800ms (с провайдерами) | ✅ |
| **Throughput** | 100 req/sec на сервис | TBD | 🔶 |
| **Availability** | 99.5% (dev/staging), 99.9% (prod) | TBD | 🔶 |
| **Concurrent users** | 500-1000 одновременных | TBD | 🔶 |

### Стратегии оптимизации

| Оптимизация | Реализация | Impact |
|-------------|------------|--------|
| **Database indexing** | Composite индексы на частых JOIN, partial индексы для filtered queries, GIN индексы для JSON (notifications, metadata) | Faster queries |
| **Connection pooling** | HikariCP: max 20, min idle 5, timeout 30s, idle timeout 10min | Эффективное использование DB connections |
| **N+1 query prevention** | Entity graphs для eager loading критичных связей, `@BatchSize` для коллекций, DTO projections для read-only | Меньше DB roundtrips |
| **Caching** | Redis для sessions (TTL: 1 час), Caffeine для справочных данных, HTTP cache headers для статики | Снижение latency |

### Горизонтальное масштабирование

| Аспект | Реализация |
|--------|------------|
| **Stateless сервисы** | Session в Redis (не в JVM), MinIO для файлов (no local storage), idempotency keys для retry |
| **Load balancing** | `docker-compose up -d --scale backend-event=3`, Nginx upstream с `least_conn` algorithm |
| **Database scaling** | PostgreSQL read replicas (планируется), connection pooling, schema-per-service для независимости |

### Вертикальное масштабирование

| Аспект | Значение |
|--------|----------|
| **JVM Heap** | `-Xms512m -Xmx768m` (50-75% от container memory) |
| **GC** | `-XX:+UseG1GC -XX:MaxGCPauseMillis=200` (G1GC для latency-sensitive apps) |
| **Metaspace** | `-XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m` |
| **Resource limits** | Memory: 512-768MB, CPU: 0.75-1.0 vCPU per service |

## Мониторинг и наблюдаемость

### Метрики (Prometheus)

| Категория | Метрики | Формат |
|-----------|---------|--------|
| **Business** | `bookings_created_total`, `payments_succeeded_total`, `booking_duration_seconds`, `waitlist_additions_total` | Counter, Histogram |
| **Technical** | `http_requests_total{method,status,service}`, `http_request_duration_seconds`, `jvm_memory_used_bytes{area}`, `database_connections_active`, `redis_commands_total{command}` | Counter, Histogram, Gauge |
| **Endpoints** | `/actuator/metrics`, `/actuator/prometheus`, `/actuator/health`, `/actuator/info` | Spring Boot Actuator |

### Логирование

**Формат**: Structured JSON (Logback + Logstash encoder)

| Поле | Пример | Назначение |
|------|--------|------------|
| `timestamp` | `2025-10-01T12:00:00.123Z` | Время события |
| `level` | `INFO` / `WARN` / `ERROR` | Log level |
| `service` | `backend-event` | Сервис |
| `correlationId` | `abc-123-def-456` | Трейсинг запросов |
| `userId` | `user-789` | Пользователь |
| `event` | `BOOKING_CREATED` | Бизнес-событие |
| `duration` | `287` | Длительность (ms) |

### Key Events для мониторинга

| Event | Описание | Level |
|-------|----------|-------|
| `SERVICE_STARTED` | Сервис запущен | INFO |
| `BOOKING_CREATED` | Создано бронирование | INFO |
| `PAYMENT_SUCCEEDED` / `PAYMENT_FAILED` | Результат платежа | INFO / ERROR |
| `EXTERNAL_API_CALL` | Вызовы внешних API (YooKassa, Telegram) | INFO |
| `ERROR_OCCURRED` | Ошибки требующие внимания | ERROR |
| `CAPACITY_EXCEEDED` | Превышение capacity экипажа | WARN |

### Centralized Logging

| Компонент | Назначение |
|-----------|------------|
| **Loki** | Хранение логов |
| **Promtail** | Сбор логов из Docker контейнеров |
| **Grafana** | Визуализация и поиск |
| **Correlation IDs** | Трейсинг запросов между сервисами |

### Дашборды (Grafana)

| Dashboard | Метрики |
|-----------|---------|
| **Service Health** | Health checks, uptime, service status |
| **Business Metrics** | Bookings created, payments succeeded, users registered |
| **Performance** | Latency (p50/p95/p99), throughput (req/sec), error rate (%) |

### Алерты

| Тип | Условие | Severity | SLA |
|-----|---------|----------|-----|
| **Critical** | Service down (health check failed >2 min), Error rate >5% (5xx), Response time p95 >2s, DB connections >90% pool | Critical | Немедленно |
| **Warning** | Memory usage >85%, Disk space <15%, Event capacity >80% | Warning | <1 час |

## Тестирование

### Test Pyramid

```
    /\     E2E Tests (5%)
   /  \    ← Critical user journeys
  /____\   Integration Tests (15%)
 /      \  ← API contracts, DB interactions
/________\ Unit Tests (80%)
           ← Business logic, edge cases
```

### Стратегия тестирования

| Уровень | Coverage Target | Инструменты | Запуск | Что тестируем |
|---------|----------------|-------------|--------|---------------|
| **Unit Tests** | >80% line coverage | JUnit 5, Mockito, AssertJ | `./gradlew test` | Бизнес-логика в `@Service`, маппинг DTO, валидация, edge cases |
| **Integration Tests** | Все API endpoints | Spring Boot Test, Testcontainers, REST Assured | `./gradlew integrationTest` | API endpoints, DB взаимодействие, Redis caching, Liquibase migrations |
| **Architecture Tests** | 100% архитектурных правил | ArchUnit | `./gradlew test` | `api` не зависит от `db`, `service` не зависит от `api`, no cyclic dependencies |
| **E2E Tests** | Critical paths | Playwright, Node test runner | `pnpm test:e2e` | Booking flow, payment flow, user registration |

### Команды тестирования

| Команда | Описание |
|---------|----------|
| `./gradlew test` | Все unit tests (JUnit 5) |
| `./gradlew integrationTest` | Integration tests с Testcontainers (PostgreSQL, Redis) |
| `./gradlew check` | All tests + ArchUnit + code quality |
| `./gradlew :backend-event:test` | Unit tests для конкретного сервиса |
| `pnpm test:unit` | Frontend unit tests |
| `pnpm test:e2e` | Frontend E2E tests (Playwright) |

## Развертывание

### Environments

| Environment | Purpose | URL | Deployment |
|-------------|---------|-----|------------|
| **Local** | Development | localhost | Docker Compose |
| **Staging** | Testing | staging.aquastream.org | Docker Compose |
| **Production** | Live | aquastream.org | Docker Compose (планируется: Kubernetes) |

### Deployment Strategy

| Стратегия | Описание |
|-----------|----------|
| **Blue-green deployments** | Переключение трафика между старой (blue) и новой (green) версией |
| **Health checks** | Проверка `/actuator/health` перед переключением трафика |
| **Automated rollback** | Автоматический откат при failure health checks |

См. [Deployment Guide](operations/deployment.md) для деталей.

## Архитектурные решения (ADR)

Ключевые решения документированы в [ADR записях](decisions/index.md):

| ADR | Тема | Статус |
|-----|------|--------|
| [ADR-001](decisions/adr-001-docs-stack.md) | Doc as Code Stack | ✅ Принято |
| [ADR-002](decisions/adr-002-api-documentation.md) | API Documentation Strategy | ✅ Принято |

## Риски и ограничения

### Технические риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| **Database bottleneck** | Medium | High | Connection pooling, read replicas (планируется), composite индексы |
| **Single point of failure (PostgreSQL)** | Low | Critical | Backup каждые 24ч, retention policy, restore testing |
| **External API unavailable (YooKassa)** | High | Medium | Circuit breaker (планируется), fallback провайдеры, retry logic |
| **Memory leaks в JVM** | Low | High | Мониторинг heap usage, G1GC tuning, heap dumps при OOM |
| **Redis unavailability** | Medium | Medium | Session regeneration, graceful degradation без кэша |
| **Capacity exhaustion (events)** | Medium | Medium | Waitlist mechanism, capacity alerts (>80%) |

### Текущие ограничения

| Ограничение | Impact | Планируется |
|-------------|--------|-------------|
| **Single PostgreSQL instance (нет HA)** | Downtime при сбое БД | PostgreSQL read replicas, failover |
| **Synchronous inter-service communication** | Latency накапливается | Async messaging (RabbitMQ/Kafka) |
| **Manual deployment процессы** | Human error risks | CI/CD automation |
| **No distributed tracing** | Сложно отлаживать межсервисные проблемы | Jaeger/Zipkin integration |
| **Только одна платежная система (YooKassa)** | Vendor lock-in | Поддержка CloudPayments, Stripe |
| **Нет multi-tenancy** | Одна организация | Multi-tenant архитектура |
| **Ограниченная локализация** | Только русский язык | i18n (английский, другие языки) |

### Trade-offs архитектурных решений

| Решение | ✅ Плюсы | ❌ Минусы |
|---------|----------|-----------|
| **Microservices vs Monolith** | Независимый deploy, масштабирование по сервисам, изоляция сбоев | Network latency, сложность разработки, distributed transactions |
| **Multi-schema PostgreSQL vs отдельные БД** | Простота backup/restore, одна Postgres instance, схемы как namespace | Shared connection pool, no physical isolation, single point of failure |
| **JWT vs Session-based auth** | Stateless, horizontal scaling, no session storage | Сложность revoke, размер токена, хранение в browser storage |
| **Docker Compose vs Kubernetes** | Простота setup, low overhead, достаточно для текущей цели | Нет авто-масштабирования, ручное управление отказами, нет self-healing |

## См. также

- [Backend Documentation](backend/README.md) - детали по каждому сервису
- [Frontend Documentation](frontend/README.md) - архитектура клиентской части
- [API Documentation](api/index.md) - полная документация API
- [Operations Guide](operations/README.md) - руководство по эксплуатации
- [QA Strategy](qa/index.md) - стратегия тестирования