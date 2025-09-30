# Backend Common

## Обзор

`backend-common` - общая библиотека для всех backend сервисов. Предоставляет автоконфигурации Spring Boot, доменные константы, error handling, rate limiting, метрики и утилиты.

## Назначение

- **Централизация общего кода** - избежание дублирования
- **Автоконфигурация** - Spring Boot Auto-Configuration для common функциональности
- **Стандартизация** - единый подход к errors, metrics, rate limiting
- **Shared domain** - общие enum'ы (UserRole, BookingStatus, PaymentStatus)

## Структура модуля

```
backend-common/
├── config/               # Конфигурация сервисов
├── domain/              # Доменная модель (enum'ы, константы)
├── error/               # Обработка ошибок (RFC 7807)
├── health/              # Health checks
├── metrics/             # Система метрик
├── mock/                # Mock support для dev
├── ratelimit/           # Rate limiting (Bucket4j)
├── util/                # Утилиты (ID генерация)
└── web/                 # Web фильтры и interceptors
```

## Основные компоненты

### Domain (Доменная модель)

**Enum типы**:
- `UserRole`: GUEST, USER, ORGANIZER, ADMIN
- `BookingStatus`: PENDING, CONFIRMED, COMPLETED, EXPIRED, CANCELLED, NO_SHOW
- `PaymentStatus`: PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED

**Константы**:
- `DomainConstants`: заголовки HTTP, MDC ключи, лимиты

См. исходники в `org.aquastream.common.domain`

### Error Handling (RFC 7807)

- `GlobalExceptionHandler` - глобальный обработчик исключений
- `ProblemDetails` - стандартный формат ошибок
- `ApiException` - базовое исключение для API
- `ErrorCodes` - коды ошибок
- `CommonErrorHandlingAutoConfiguration` - автоконфигурация

См. [Error Handling](error-handling.md)

### Rate Limiting (Bucket4j)

- `RateLimitFilter` - фильтр для проверки лимитов
- `RateLimitService` - сервис управления bucket'ами
- `RateLimitProperties` - конфигурация лимитов
- `RateLimitAutoConfiguration` - автоконфигурация

См. [Rate Limiting](rate-limiting.md)

### Metrics

- `MetricsCollector` - сбор метрик
- `MetricsFilter` - HTTP метрики (latency, throughput)
- `RedisMetricsWriter` - запись метрик в Redis
- `MetricsScheduler` - периодическая агрегация
- `MetricsController` - REST endpoint для метрик
- `MetricsAutoConfiguration` - автоконфигурация

См. [Metrics](metrics.md)

### Web Utilities

- `CorrelationIdFilter` - correlation ID для трейсинга
- `CorrelationIdRestTemplateInterceptor` - propagation между сервисами
- `WebAutoConfiguration` - автоконфигурация web компонентов

См. [Web Utilities](web-utilities.md)

### Service Discovery

- `ServiceUrls` - конфигурация URL сервисов
- `ServiceHealthChecker` - проверка здоровья сервисов
- `ServiceDiscoveryController` - endpoint для service discovery
- `ServiceDiscoveryAutoConfiguration` - автоконфигурация

### Utilities

- `Ids` - генерация UUID, JTI, idempotency keys

### Mock Support

- `MockDetector` - определение dev окружения
- `MockResponseGenerator` - генерация mock responses
- `MockProperties` - конфигурация mock режима

## Зависимости

```gradle
dependencies {
    api 'org.springframework.boot:spring-boot-starter-web'
    api 'org.springframework.boot:spring-boot-starter-validation'

    implementation 'org.springframework.boot:spring-boot-starter-json'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'

    api "com.bucket4j:bucket4j-redis:${bucket4jVersion}"
}
```

## Использование в сервисах

### Подключение библиотеки

```gradle
// В build.gradle сервиса
dependencies {
    implementation project(':backend-common')
}
```

### Автоконфигурация

Все автоконфигурации включаются автоматически через Spring Boot Auto-Configuration:

- `CommonErrorHandlingAutoConfiguration`
- `RateLimitAutoConfiguration`
- `MetricsAutoConfiguration`
- `WebAutoConfiguration`
- `ServiceDiscoveryAutoConfiguration`

### Конфигурация через application.yml

```yaml
# Rate limiting
rate-limit:
  enabled: true
  default-capacity: 100
  default-refill-tokens: 100
  default-refill-duration: 60s

# Metrics
metrics:
  enabled: true
  redis:
    enabled: true
    key-prefix: "metrics:"
  scheduler:
    aggregation-interval: 60000

# Mock mode
mock:
  enabled: false
```

## См. также

- [Error Handling](error-handling.md) - обработка ошибок
- [Rate Limiting](rate-limiting.md) - rate limiting с Bucket4j
- [Metrics](metrics.md) - система метрик
- [Web Utilities](web-utilities.md) - CorrelationId и web фильтры
- [Security](security.md) - security utilities
- [Authentication](../authentication.md) - аутентификация и RBAC (общий для backend)
- [Database](../database.md) - база данных (общий для backend)
