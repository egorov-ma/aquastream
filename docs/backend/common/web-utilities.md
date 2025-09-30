# Web Utilities

## Обзор

Набор утилит для работы с HTTP запросами, включая трейсинг через Correlation ID и propagation между сервисами.

## CorrelationIdFilter

### Назначение

Servlet фильтр который обеспечивает наличие correlation ID для каждого запроса и добавляет его в MDC (Mapped Diagnostic Context) для автоматического включения в логи.

### Как работает

```
1. HTTP Request приходит
   ↓
2. Фильтр проверяет заголовок X-Request-Id
   ↓
3a. Если есть → использует его
3b. Если нет → генерирует новый (Ids.newIdempotencyKey())
   ↓
4. Добавляет в MDC.put("correlationId", ...)
   ↓
5. Обрабатывает запрос
   ↓
6. MDC.remove("correlationId") в finally
```

### Код

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                        FilterChain chain) throws IOException, ServletException {
        String correlationId = null;
        try {
            if (request instanceof HttpServletRequest http) {
                correlationId = http.getHeader(DomainConstants.HEADER_REQUEST_ID);
            }
            if (correlationId == null || correlationId.isBlank()) {
                correlationId = Ids.newIdempotencyKey();
            }
            MDC.put(DomainConstants.LOG_CORRELATION_ID, correlationId);
            chain.doFilter(request, response);
        } finally {
            MDC.remove(DomainConstants.LOG_CORRELATION_ID);
        }
    }
}
```

### Константы (DomainConstants)

```java
public class DomainConstants {
    // HTTP заголовок для correlation ID
    public static final String HEADER_REQUEST_ID = "X-Request-Id";

    // MDC ключ для логов
    public static final String LOG_CORRELATION_ID = "correlationId";
}
```

### Использование в логах

Logback автоматически включает MDC в логи:

```xml
<!-- logback-spring.xml -->
<pattern>
    %d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level [correlationId=%X{correlationId}] %logger{36} - %msg%n
</pattern>
```

Пример лога:
```
2024-01-15 10:23:45 [http-nio-8101-exec-1] INFO [correlationId=xR3k9mP2nQ4s5vT6] UserController - Getting user by id: 550e8400...
2024-01-15 10:23:45 [http-nio-8101-exec-1] DEBUG [correlationId=xR3k9mP2nQ4s5vT6] UserRepository - Fetching user from DB
2024-01-15 10:23:45 [http-nio-8101-exec-1] INFO [correlationId=xR3k9mP2nQ4s5vT6] UserController - User found: john@example.com
```

### Трейсинг между сервисами

Клиент может передать correlation ID:

```bash
# Client → Gateway
curl -H "X-Request-Id: my-custom-correlation-id" \
     http://localhost:8100/api/users/123
```

Gateway и все сервисы будут использовать `my-custom-correlation-id` в логах.

## CorrelationIdRestTemplateInterceptor

### Назначение

RestTemplate interceptor для автоматического propagation correlation ID при вызовах между сервисами.

### Как работает

```
Service A → RestTemplate → Service B

1. Service A обрабатывает запрос (correlation ID в MDC)
2. Service A вызывает Service B через RestTemplate
3. Interceptor читает correlation ID из MDC
4. Добавляет заголовок X-Request-Id к запросу
5. Service B получает запрос с correlation ID
6. CorrelationIdFilter в Service B добавляет его в MDC
```

### Конфигурация

```java
@Configuration
public class WebAutoConfiguration {

    @Bean
    public CorrelationIdRestTemplateInterceptor correlationIdInterceptor() {
        return new CorrelationIdRestTemplateInterceptor();
    }

    @Bean
    public RestTemplate restTemplate(
            CorrelationIdRestTemplateInterceptor interceptor) {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setInterceptors(List.of(interceptor));
        return restTemplate;
    }
}
```

### Код interceptor

```java
public class CorrelationIdRestTemplateInterceptor
        implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(HttpRequest request,
                                       byte[] body,
                                       ClientHttpRequestExecution execution)
            throws IOException {

        String correlationId = MDC.get(DomainConstants.LOG_CORRELATION_ID);

        if (correlationId != null && !correlationId.isBlank()) {
            request.getHeaders().add(
                DomainConstants.HEADER_REQUEST_ID,
                correlationId
            );
        }

        return execution.execute(request, body);
    }
}
```

### Пример использования

```java
@Service
public class UserService {

    @Autowired
    private RestTemplate restTemplate;  // С interceptor

    public Event getEvent(UUID eventId) {
        // Correlation ID автоматически добавляется в запрос
        String url = "http://event-service:8102/api/events/" + eventId;
        return restTemplate.getForObject(url, Event.class);
    }
}
```

Логи в обоих сервисах будут с одинаковым correlation ID:

```
# User Service
[correlationId=xR3k9mP2nQ4s5vT6] UserService - Fetching event 550e8400...

# Event Service
[correlationId=xR3k9mP2nQ4s5vT6] EventService - Getting event by id: 550e8400...
```

## Ids Utility

### Назначение

Генерация различных типов идентификаторов для использования в системе.

### Методы

#### newUuid()

Генерация стандартного UUID:

```java
String uuid = Ids.newUuid();
// Результат: "550e8400-e29b-41d4-a716-446655440000"
```

Используется для:
- User ID
- Event ID
- Booking ID
- и других entity IDs

#### newJti()

Генерация компактного JWT ID (JTI):

```java
String jti = Ids.newJti();
// Результат: "dGhpcyBpcyBhIHRlc3Q" (16 bytes → Base64 URL-safe)
```

Используется для:
- Access token JTI
- Refresh token JTI
- Идентификация JWT для revocation

Формат: 16 случайных байтов → Base64 URL-safe (без padding)

#### newIdempotencyKey()

Генерация ключа идемпотентности:

```java
String key = Ids.newIdempotencyKey();
// Результат: "xR3k9mP2nQ4s5vT6wX8yZ" (24 bytes → Base64 URL-safe)
```

Используется для:
- Correlation ID (если не передан клиентом)
- Idempotency keys для платежей
- Webhook deduplication

Формат: 24 случайных байтов → Base64 URL-safe (без padding)

### Безопасность

Все методы используют `SecureRandom`:

```java
private static final SecureRandom SECURE_RANDOM = new SecureRandom();
```

## WebAutoConfiguration

### Компоненты

Автоматически регистрирует:

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

### Автоконфигурация

Включается автоматически для всех сервисов, зависящих от `backend-common`.

Никакой дополнительной настройки не требуется.

## Сценарии использования

### 1. Трейсинг одного запроса

```
Client → Gateway → User Service → Event Service

1. Client: curl -H "X-Request-Id: abc123" /api/users/me
2. Gateway: [correlationId=abc123] Routing to user-service
3. User Service: [correlationId=abc123] Getting user
4. User Service → Event Service: GET /events (+ X-Request-Id: abc123)
5. Event Service: [correlationId=abc123] Getting events for user
```

Все логи с одним `correlationId=abc123` → легко найти в логах.

### 2. Отладка ошибки

Клиент получил ошибку:

```json
{
  "type": "https://aquastream.app/problems/500",
  "title": "Internal Server Error",
  "status": 500,
  "correlationId": "xR3k9mP2nQ4s5vT6"
}
```

Разработчик ищет в логах:

```bash
grep "xR3k9mP2nQ4s5vT6" logs/*.log

# Найдет все логи этого запроса во всех сервисах
```

### 3. Идемпотентные операции

```java
@PostMapping("/api/payments")
public PaymentResponse createPayment(
        @RequestHeader("X-Idempotency-Key") String idempotencyKey,
        @RequestBody PaymentRequest request) {

    // Используем idempotency key для дедупликации
    Payment existing = paymentService.findByIdempotencyKey(idempotencyKey);
    if (existing != null) {
        return PaymentResponse.from(existing);
    }

    // Создаем новый платеж
    Payment payment = paymentService.create(request, idempotencyKey);
    return PaymentResponse.from(payment);
}
```

Клиент может безопасно retry:

```bash
curl -X POST http://localhost:8104/api/payments \
     -H "X-Idempotency-Key: $(uuidgen)" \
     -H "Content-Type: application/json" \
     -d '{"amount": 1000, "bookingId": "..."}'
```

## Best Practices

### 1. Всегда используйте RestTemplate с interceptor

```java
// ✅ Хорошо - correlation ID propagates
@Autowired
private RestTemplate restTemplate;

Event event = restTemplate.getForObject(url, Event.class);
```

```java
// ❌ Плохо - новый RestTemplate без interceptor
RestTemplate restTemplate = new RestTemplate();  // Нет correlation ID!
Event event = restTemplate.getForObject(url, Event.class);
```

### 2. Включайте correlation ID в ProblemDetails

Уже реализовано в `GlobalExceptionHandler`:

```java
problemDetails.setCorrelationId(MDC.get(DomainConstants.LOG_CORRELATION_ID));
```

### 3. Используйте structured logging

```java
// ✅ Хорошо - structured
log.info("User login successful: userId={}, correlationId={}",
         userId, MDC.get(DomainConstants.LOG_CORRELATION_ID));

// ❌ Плохо - correlation ID уже в MDC, не нужно дублировать
log.info("User login successful: " + userId);
```

## Troubleshooting

### Correlation ID не появляется в логах

1. Проверьте logback pattern:
   ```xml
   <pattern>%X{correlationId}</pattern>
   ```

2. Проверьте что `CorrelationIdFilter` зарегистрирован:
   ```java
   @SpringBootApplication
   @ComponentScan(basePackages = {"org.aquastream.common", "..."})
   ```

### Correlation ID теряется при вызове другого сервиса

1. Проверьте что используете `RestTemplate` с interceptor
2. Проверьте логи: должен быть `CorrelationIdRestTemplateInterceptor` bean

### Correlation ID разный в разных сервисах

Убедитесь что:
- Gateway пробрасывает `X-Request-Id`
- Все сервисы используют `CorrelationIdFilter`
- RestTemplate настроен с interceptor

## См. также

- [Backend Common](README.md) - обзор модуля
- [Error Handling](error-handling.md) - correlation ID в ProblemDetails
- [Metrics](metrics.md) - метрики с correlation ID
- [Operations: Monitoring](../../operations/monitoring.md) - трейсинг в production