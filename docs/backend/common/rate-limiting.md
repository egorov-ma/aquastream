# Rate Limiting

## Обзор

Встроенная система rate limiting на базе Bucket4j с поддержкой Redis для распределенного хранения. Защищает API от злоупотребления и DDoS атак.

## Архитектура

```
HTTP Request → RateLimitFilter → RateLimitService → Bucket4j → Redis
                     ↓
                 Allowed?
                ↙        ↘
             Yes         No
              ↓           ↓
        Continue     429 Error
```

## Компоненты

### RateLimitFilter

Servlet фильтр для проверки rate limits перед обработкой запроса.

**Процесс**:
1. Проверяет нужно ли skip (health checks, static resources, OPTIONS)
2. Определяет client key (IP address или user ID)
3. Определяет limit key (тип endpoint: default, login, recovery)
4. Вызывает `RateLimitService.checkLimit()`
5. Если разрешено → добавляет headers + продолжает
6. Если запрещено → возвращает 429 с RFC 7807 Problem Details

### RateLimitService

Сервис управления rate limit buckets через Bucket4j.

**Методы**:

```java
public class RateLimitService {

    /**
     * Check if request is allowed
     */
    public RateLimitResult checkLimit(String clientKey, String limitKey) {
        // ...
    }

    public static class RateLimitResult {
        private boolean allowed;
        private long remainingTokens;
        private long retryAfterSeconds;
    }
}
```

### RateLimitProperties

Конфигурация rate limits через `application.yml`.

```java
@ConfigurationProperties(prefix = "aquastream.rate-limit")
public class RateLimitProperties {
    private boolean enabled = true;
    private RateLimit defaultLimit;
    private Map<String, RateLimit> limits;

    public static class RateLimit {
        private long capacity = 100;
        private Duration window = Duration.ofMinutes(1);
        private long refillTokens = 10;
        private Duration refillPeriod = Duration.ofSeconds(1);
        private boolean enabled = true;
        private Long retryAfterSeconds;
    }
}
```

## Bucket4j Integration

### Token Bucket Algorithm

```
Bucket:
- capacity: максимум токенов
- refillTokens: сколько токенов добавлять
- refillPeriod: как часто добавлять

Пример:
- capacity: 100
- refillTokens: 10 per second
- window: 1 minute

Клиент может сделать:
- Burst: 100 запросов сразу
- Sustained: 10 req/sec (600 req/min)
```

### Redis Storage

Buckets хранятся в Redis:

```
Key format: rate-limit:{clientKey}:{limitKey}

Example:
rate-limit:ip:192.168.1.100:login
rate-limit:ip:192.168.1.100:default
rate-limit:user:550e8400-e29b-41d4-a716-446655440000:default
```

## Конфигурация

### application.yml

```yaml
aquastream:
  rate-limit:
    # Глобально включить/выключить
    enabled: true

    # Default лимит для всех endpoints
    default-limit:
      capacity: 100
      window: 1m
      refill-tokens: 10
      refill-period: 1s
      enabled: true
      retry-after-seconds: 60

    # Кастомные лимиты для разных типов endpoints
    limits:
      # Login endpoints (строгий лимит)
      login:
        capacity: 10
        window: 1m
        refill-tokens: 1
        refill-period: 6s
        retry-after-seconds: 60

      # Password recovery (очень строгий)
      recovery:
        capacity: 5
        window: 5m
        refill-tokens: 1
        refill-period: 60s
        retry-after-seconds: 300

      # Default для остальных API
      default:
        capacity: 100
        window: 1m
        refill-tokens: 10
        refill-period: 1s
```

### Типы лимитов

#### 1. Login endpoints

```yaml
login:
  capacity: 10          # Максимум 10 попыток
  window: 1m           # В минуту
  refill-tokens: 1     # +1 попытка
  refill-period: 6s    # Каждые 6 секунд
```

**Patterns**:
- `**/login**`
- `**/auth**`
- `**/signin**`

**Защита от**: брутфорс паролей

#### 2. Recovery endpoints

```yaml
recovery:
  capacity: 5           # Максимум 5 попыток
  window: 5m           # В 5 минут
  refill-tokens: 1     # +1 попытка
  refill-period: 60s   # Каждую минуту
```

**Patterns**:
- `**/recovery**`
- `**/reset**`
- `**/forgot**`

**Защита от**: спам восстановления паролей

#### 3. Default endpoints

```yaml
default:
  capacity: 100         # 100 запросов
  window: 1m           # В минуту
  refill-tokens: 10    # +10 запросов
  refill-period: 1s    # Каждую секунду
```

**Все остальные** API endpoints

**Защита от**: общее злоупотребление API

## Client Identification

### IP-based (по умолчанию)

```java
private String getClientKey(HttpServletRequest request) {
    String clientIp = getClientIpAddress(request);
    return "ip:" + clientIp;
}
```

**Headers проверяются**:
1. `X-Forwarded-For` (proxy/load balancer)
2. `X-Real-IP` (nginx)
3. `request.getRemoteAddr()` (fallback)

### User-based (опционально)

Для авторизованных запросов можно использовать user ID:

```java
private String getClientKey(HttpServletRequest request) {
    String userId = extractUserId(request);  // From JWT or header
    if (userId != null) {
        return "user:" + userId;
    }

    String clientIp = getClientIpAddress(request);
    return "ip:" + clientIp;
}
```

**Плюсы**:
- Более точный контроль (один пользователь = один bucket)
- Работает при смене IP (мобильные сети)

**Минусы**:
- Не защищает неавторизованные endpoints
- Требует интеграцию с auth

## Response Formats

### Разрешенный запрос (200 OK)

```http
HTTP/1.1 200 OK
X-RateLimit-Remaining: 95
Content-Type: application/json

{
  "data": "..."
}
```

### Превышен лимит (429 Too Many Requests)

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 60
X-RateLimit-Remaining: 0

{
  "type": "https://aquastream.org/problems/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit exceeded for login requests. Please retry after 60 seconds.",
  "limitType": "login",
  "retryAfter": 60,
  "timestamp": "2024-01-15T10:23:45.123Z"
}
```

**Headers**:
- `Retry-After`: сколько секунд ждать (обязательно)
- `X-RateLimit-Remaining`: оставшиеся токены (0 при превышении)

## Excluded Paths

Rate limiting **НЕ применяется** к:

```java
private boolean shouldSkipRateLimit(HttpServletRequest request) {
    String path = request.getRequestURI();

    // Health checks и monitoring
    if (path.startsWith("/actuator/") ||
        path.startsWith("/health") ||
        path.startsWith("/metrics")) {
        return true;
    }

    // Static resources
    if (path.startsWith("/static/") ||
        path.startsWith("/css/") ||
        path.startsWith("/js/") ||
        path.startsWith("/images/")) {
        return true;
    }

    // CORS preflight
    return "OPTIONS".equals(request.getMethod());
}
```

## Использование

### Автоматическое применение

Фильтр применяется ко всем HTTP запросам автоматически:

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public User getUser(@PathVariable UUID id) {
        // RateLimitFilter автоматически проверит лимит
        // перед вызовом этого метода
        return userService.findById(id);
    }
}
```

### Кастомные лимиты для endpoint

Настраивается через паттерны в фильтре:

```java
private String determineLimitKey(HttpServletRequest request) {
    String path = request.getRequestURI();

    if (LOGIN_PATTERN.matcher(path).matches()) {
        return "login";  // Использует limits.login из config
    }

    if (RECOVERY_PATTERN.matcher(path).matches()) {
        return "recovery";  // Использует limits.recovery
    }

    return "default";  // Использует default-limit
}
```

Для добавления нового типа:

```java
// 1. Добавить паттерн
private static final Pattern PAYMENT_PATTERN = Pattern.compile(".*/payments.*");

// 2. Добавить проверку
if (PAYMENT_PATTERN.matcher(path).matches()) {
    return "payment";
}
```

```yaml
# 3. Настроить в application.yml
aquastream:
  rate-limit:
    limits:
      payment:
        capacity: 30
        window: 1m
        refill-tokens: 5
        refill-period: 2s
```

## Мониторинг

### Логи

```yaml
logging:
  level:
    org.aquastream.common.ratelimit: WARN
```

При превышении лимита:

```
[WARN] RateLimitFilter - Rate limit exceeded - Client: ip:192.168.1.100,
       Endpoint: POST /api/auth/login, Limit: login, Retry after: 60s
```

### Метрики Redis

Проверка buckets в Redis:

```bash
# Список всех rate limit keys
redis-cli KEYS "rate-limit:*"

# Просмотр bucket для конкретного клиента
redis-cli GET "rate-limit:ip:192.168.1.100:login"
```

### Тестирование лимитов

```bash
# Тест login endpoint (лимит: 10/min)
for i in {1..15}; do
  curl -X POST http://localhost:8100/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"username":"test","password":"wrong"}'
  echo "Request $i"
  sleep 1
done

# Первые 10 → 401 Unauthorized (wrong password)
# Остальные → 429 Too Many Requests (rate limit)
```

## Production Рекомендации

### Настройки для production

```yaml
aquastream:
  rate-limit:
    enabled: true

    limits:
      # Login: очень строгий
      login:
        capacity: 5
        window: 1m
        refill-tokens: 1
        refill-period: 12s
        retry-after-seconds: 60

      # Recovery: экстра строгий
      recovery:
        capacity: 3
        window: 10m
        refill-tokens: 1
        refill-period: 180s
        retry-after-seconds: 600

      # Default: умеренный
      default:
        capacity: 60
        window: 1m
        refill-tokens: 10
        refill-period: 1s
        retry-after-seconds: 60
```

### Redis настройки

```yaml
spring:
  data:
    redis:
      host: redis
      port: 6379
      # Connection pool для Bucket4j
      lettuce:
        pool:
          max-active: 10
          max-idle: 5
          min-idle: 2
```

### Настройка за load balancer

Убедитесь что LB пробрасывает правильные headers:

```nginx
# Nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

Иначе все запросы будут с IP load balancer'а!

## Отключение rate limiting

### Глобально

```yaml
aquastream:
  rate-limit:
    enabled: false
```

### Для конкретного типа

```yaml
aquastream:
  rate-limit:
    limits:
      login:
        enabled: false  # Отключить только для login
```

### Для dev окружения

```yaml
# application-dev.yml
aquastream:
  rate-limit:
    enabled: false
```

## Troubleshooting

### Rate limit срабатывает слишком часто

1. Проверьте capacity и refill rate:
   ```yaml
   capacity: 100  # Увеличить burst capacity
   refill-tokens: 20  # Увеличить sustained rate
   ```

2. Проверьте что используется правильный client key (IP, не LB IP)

### Rate limit не срабатывает

1. Проверьте `enabled: true`
2. Проверьте что Redis подключен и работает
3. Проверьте логи фильтра

### 429 для legitimate users

Используйте user-based вместо IP-based:

```java
// Модифицировать RateLimitFilter.getClientKey()
String userId = request.getHeader("X-User-Id");
if (userId != null) {
    return "user:" + userId;
}
```

## См. также

- [Backend Common](README.md) - обзор модуля
- [Security](security.md) - другие security механизмы
- [Error Handling](error-handling.md) - RFC 7807 Problem Details
- [Operations: Security](../../operations/policies/security.md) - security политики