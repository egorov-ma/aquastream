# Backend Common

## Обзор

`backend-common` - общая библиотека для всех backend сервисов. Предоставляет автоконфигурации Spring Boot, доменные константы, error handling, rate limiting, метрики и утилиты.

**Назначение**: Централизация общего кода, стандартизация подходов, автоконфигурация.

## Структура

```
backend-common/
├── config/      # Конфигурация сервисов
├── domain/      # Доменная модель (enum'ы, константы)
├── error/       # Обработка ошибок (RFC 7807)
├── health/      # Health checks
├── metrics/     # Система метрик
├── mock/        # Mock support для dev
├── ratelimit/   # Rate limiting (Bucket4j)
├── util/        # Утилиты (ID генерация)
└── web/         # Web фильтры и interceptors
```

## Основные компоненты

| Компонент | Ключевые классы | Документация |
|-----------|----------------|--------------|
| **Domain** | `UserRole`, `BookingStatus`, `PaymentStatus`, `DomainConstants` | [Security](security.md) |
| **Error Handling** | `GlobalExceptionHandler`, `ProblemDetails`, `ApiException` | [Error Handling](error-handling.md) |
| **Rate Limiting** | `RateLimitFilter`, `RateLimitService`, `RateLimitProperties` | [Rate Limiting](rate-limiting.md) |
| **Metrics** | `MetricsCollector`, `MetricsFilter`, `RedisMetricsWriter`, `MetricsScheduler` | [Metrics](metrics.md) |
| **Web Utilities** | `CorrelationIdFilter`, `CorrelationIdRestTemplateInterceptor` | [Web Utilities](web-utilities.md) |
| **Service Discovery** | `ServiceUrls`, `ServiceHealthChecker`, `ServiceDiscoveryController` | - |
| **Utilities** | `Ids` (UUID, JTI, idempotency keys) | [Web Utilities](web-utilities.md) |
| **Mock Support** | `MockDetector`, `MockResponseGenerator` | - |

### Domain Enums

| Enum | Значения |
|------|----------|
| `UserRole` | GUEST, USER, ORGANIZER, ADMIN |
| `BookingStatus` | PENDING, CONFIRMED, COMPLETED, EXPIRED, CANCELLED, NO_SHOW |
| `PaymentStatus` | PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED |

## Использование

### Подключение

```gradle
// В build.gradle сервиса
dependencies {
    implementation project(':backend-common')
}
```

### Автоконфигурация

Все включается автоматически через Spring Boot Auto-Configuration:
- `CommonErrorHandlingAutoConfiguration`
- `RateLimitAutoConfiguration`
- `MetricsAutoConfiguration`
- `WebAutoConfiguration`
- `ServiceDiscoveryAutoConfiguration`

### Конфигурация (application.yml)

```yaml
rate-limit:
  enabled: true
  default-capacity: 100
  default-refill-tokens: 100
  default-refill-duration: 60s

metrics:
  enabled: true
  redis:
    enabled: true
    key-prefix: "metrics:"
  scheduler:
    aggregation-interval: 60000

mock:
  enabled: false  # Dev only
```

## Зависимости

```gradle
dependencies {
    api 'org.springframework.boot:spring-boot-starter-web'
    api 'org.springframework.boot:spring-boot-starter-validation'
    api 'org.springframework.boot:spring-boot-starter-data-redis'
    api "com.bucket4j:bucket4j-redis:${bucket4jVersion}"
}
```

---

См. [Error Handling](error-handling.md), [Rate Limiting](rate-limiting.md), [Metrics](metrics.md), [Web Utilities](web-utilities.md), [Security](security.md).