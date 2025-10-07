# Web Utilities

## Обзор

Утилиты для HTTP запросов: distributed tracing, correlation ID propagation, ID generation.

**Автоконфигурация**: `WebAutoConfiguration` регистрирует все компоненты автоматически.

## Компоненты

| Компонент | Назначение | Ключевые функции |
|-----------|------------|------------------|
| **CorrelationIdFilter** | Servlet фильтр для correlation ID | Извлекает/генерирует ID, добавляет в MDC, response header |
| **CorrelationIdRestTemplateInterceptor** | Propagation между сервисами | Добавляет `X-Request-Id` в исходящие запросы |
| **Ids** | ID generation utility | `correlationId()`, `generate()`, `generateSecure()` |

### CorrelationIdFilter

**Процесс**:
1. Проверяет наличие `X-Request-Id` header
2. Если есть → использует, иначе генерирует новый
3. Добавляет в MDC (`correlationId` key)
4. Добавляет `X-Correlation-Id` в response
5. Cleanup в `finally`

**Logback pattern**:
```xml
<pattern>%d{ISO8601} [%X{correlationId}] %-5level %logger - %msg%n</pattern>
```

**Пример лога**:
```
2024-01-15T10:23:45 [xR3k9mP2nQ4s5vT6] INFO UserController - User login: userId=abc
2024-01-15T10:23:46 [xR3k9mP2nQ4s5vT6] INFO EventService - Getting events for user
```

### CorrelationIdRestTemplateInterceptor

**Назначение**: Propagates correlation ID в inter-service calls

**Конфигурация**:
```java
@Bean
public RestTemplate restTemplate(CorrelationIdRestTemplateInterceptor interceptor) {
    RestTemplate template = new RestTemplate();
    template.setInterceptors(List.of(interceptor));
    return template;
}
```

**Процесс**: Читает `correlationId` из MDC → добавляет `X-Request-Id` в request

### Ids Utility

| Метод | Тип | Назначение |
|-------|-----|------------|
| `correlationId()` | String | Читает из MDC или генерирует (base62, 16 chars) |
| `generate()` | UUID | Генерирует UUID v4 |
| `generateSecure()` | String | Cryptographically secure ID (SecureRandom, 32 chars) |

**Примеры**:
```java
// Correlation ID (текущий или новый)
String corrId = Ids.correlationId(); // "xR3k9mP2nQ4s5vT6"

// UUID v4
UUID id = Ids.generate(); // UUID

// Secure ID (токены, API keys)
String token = Ids.generateSecure(); // "aB3dE5gH7jK9mN2pQ4rS6tU8vW0xY1zA"
```

## Сценарии использования

### Трейсинг запроса

```
Client → Gateway → User Service → Event Service

1. Client: curl -H "X-Request-Id: abc123" /api/users/me
2. Gateway: [correlationId=abc123] Routing to user-service
3. User Service: [correlationId=abc123] Getting user
4. User Service → Event Service: GET /events (+ X-Request-Id: abc123)
5. Event Service: [correlationId=abc123] Getting events
```

**Все логи с `correlationId=abc123`** → легко найти полный trace.

### Отладка ошибки

Клиент получил:
```json
{
  "type": "https://aquastream.app/problems/500",
  "title": "Internal Server Error",
  "status": 500,
  "correlationId": "xR3k9mP2nQ4s5vT6"
}
```

Поиск:
```bash
grep "xR3k9mP2nQ4s5vT6" logs/*.log
# Найдет все логи этого запроса во всех сервисах
```

### Идемпотентные операции

```java
@PostMapping("/api/payments")
public PaymentResponse createPayment(
        @RequestHeader("X-Idempotency-Key") String idempotencyKey,
        @RequestBody PaymentRequest request) {

    // Дедупликация по idempotency key
    Payment existing = paymentService.findByIdempotencyKey(idempotencyKey);
    if (existing != null) {
        return PaymentResponse.from(existing);
    }

    return PaymentResponse.from(paymentService.create(request, idempotencyKey));
}
```

## Best Practices

| Правило | ✅ Хорошо | ❌ Плохо |
|---------|----------|---------|
| **RestTemplate** | Используйте bean с interceptor | `new RestTemplate()` - теряет correlation ID |
| **ProblemDetails** | Correlation ID автоматически добавляется в `GlobalExceptionHandler` | - |
| **Logging** | Structured logging с параметрами | Конкатенация строк |
| **Idempotency keys** | Используйте для критичных POST/PUT операций (payments, bookings) | - |

**Пример structured logging**:
```java
// ✅ Хорошо
log.info("User login successful: userId={}", userId);

// ❌ Плохо - correlation ID уже в MDC
log.info("User login successful: " + userId + ", correlationId=" + corrId);
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| **Correlation ID не появляется в логах** | 1. Проверить logback pattern: `%X{correlationId}`<br>2. Проверить `@ComponentScan` для `org.aquastream.common` |
| **Correlation ID теряется при вызове другого сервиса** | 1. Используйте `RestTemplate` bean с interceptor<br>2. Проверить логи: `CorrelationIdRestTemplateInterceptor` bean должен быть зарегистрирован |
| **Correlation ID разный в разных сервисах** | 1. Gateway должен пробрасывать `X-Request-Id`<br>2. Все сервисы используют `CorrelationIdFilter`<br>3. RestTemplate с interceptor |

## Конфигурация

**WebAutoConfiguration**:
```java
@AutoConfiguration
public class WebAutoConfiguration {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorrelationIdFilter correlationIdFilter() {
        return new CorrelationIdFilter();
    }

    @Bean
    public CorrelationIdRestTemplateInterceptor correlationIdInterceptor() {
        return new CorrelationIdRestTemplateInterceptor();
    }
}
```

**Включается автоматически** для всех сервисов, зависящих от `backend-common`.

---

См. [Backend Common](README.md), [Error Handling](error-handling.md), [Metrics](metrics.md), [Operations: Monitoring](../../operations/monitoring.md).