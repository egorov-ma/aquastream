# Rate Limiting

## Обзор

Встроенная система rate limiting на базе **Bucket4j** с **Redis** для распределенного хранения. Защищает API от злоупотребления и DDoS атак.

**Архитектура**:
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

| Компонент | Описание | Функции |
|-----------|----------|---------|
| **RateLimitFilter** | Servlet фильтр | Проверяет лимиты перед обработкой запроса, skip для health checks/static resources |
| **RateLimitService** | Управление buckets | `checkLimit(clientKey, limitKey)` → `RateLimitResult(allowed, remainingTokens, retryAfter)` |
| **RateLimitProperties** | Конфигурация | `@ConfigurationProperties("aquastream.rate-limit")`, поддержка кастомных лимитов |

## Bucket4j Token Bucket Algorithm

```
Bucket:
- capacity: максимум токенов (burst)
- refillTokens: сколько токенов добавлять
- refillPeriod: как часто добавлять

Пример (capacity: 100, refillTokens: 10/sec):
- Burst: 100 запросов сразу
- Sustained: 10 req/sec (600 req/min)
```

**Redis Storage**:
```
Key format: rate-limit:{clientKey}:{limitKey}

Examples:
rate-limit:ip:192.168.1.100:login
rate-limit:ip:192.168.1.100:default
rate-limit:user:550e8400-e29b-41d4-a716-446655440000:default
```

## Конфигурация

### Типы лимитов

| Тип | Capacity | Window | Refill | Use Case | Patterns |
|-----|----------|--------|--------|----------|----------|
| **login** | 10 | 1m | 1 token / 6s | Защита от брутфорса паролей | `**/login**`, `**/auth**`, `**/signin**` |
| **recovery** | 5 | 5m | 1 token / 60s | Спам восстановления паролей | `**/recovery**`, `**/reset**`, `**/forgot**` |
| **default** | 100 | 1m | 10 tokens / 1s | Общее злоупотребление API | Все остальные endpoints |

### application.yml

```yaml
aquastream:
  rate-limit:
    enabled: true

    # Default для всех endpoints
    default-limit:
      capacity: 100
      window: 1m
      refill-tokens: 10
      refill-period: 1s
      retry-after-seconds: 60

    # Кастомные лимиты
    limits:
      login:
        capacity: 10
        window: 1m
        refill-tokens: 1
        refill-period: 6s
        retry-after-seconds: 60

      recovery:
        capacity: 5
        window: 5m
        refill-tokens: 1
        refill-period: 60s
        retry-after-seconds: 300
```

### Добавление кастомного лимита

```java
// 1. Паттерн в RateLimitFilter
private static final Pattern PAYMENT_PATTERN = Pattern.compile(".*/payments.*");

if (PAYMENT_PATTERN.matcher(path).matches()) {
    return "payment";
}
```

```yaml
# 2. Конфигурация
aquastream:
  rate-limit:
    limits:
      payment:
        capacity: 30
        window: 1m
        refill-tokens: 5
        refill-period: 2s
```

## Client Identification

### IP-based (по умолчанию)

```java
String clientKey = "ip:" + getClientIpAddress(request);

// Headers проверяются: X-Forwarded-For → X-Real-IP → RemoteAddr
```

### User-based (опционально)

```java
String userId = extractUserId(request);  // From JWT or X-User-Id
if (userId != null) {
    return "user:" + userId;
}
return "ip:" + clientIp;
```

**Плюсы**: точный контроль, работает при смене IP (мобильные)
**Минусы**: не защищает неавторизованные endpoints

## Response Formats

### Разрешенный запрос (200 OK)

```http
HTTP/1.1 200 OK
X-RateLimit-Remaining: 95
Content-Type: application/json
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

**Headers**: `Retry-After` (обязательно), `X-RateLimit-Remaining`

## Excluded Paths

Rate limiting **НЕ применяется** к:
- `/actuator/*`, `/health`, `/metrics` (monitoring)
- `/static/*`, `/css/*`, `/js/*`, `/images/*` (static resources)
- `OPTIONS` requests (CORS preflight)

## Мониторинг

### Логи

```yaml
logging:
  level:
    org.aquastream.common.ratelimit: WARN
```

При превышении:
```
[WARN] RateLimitFilter - Rate limit exceeded - Client: ip:192.168.1.100,
       Endpoint: POST /api/auth/login, Limit: login, Retry after: 60s
```

### Redis метрики

```bash
# Список всех rate limit keys
redis-cli KEYS "rate-limit:*"

# Bucket конкретного клиента
redis-cli GET "rate-limit:ip:192.168.1.100:login"
```

### Тестирование

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
# Остальные → 429 Too Many Requests
```

## Production рекомендации

### Настройки для production

| Лимит | Capacity | Window | Refill | Retry After |
|-------|----------|--------|--------|-------------|
| **login** | 5 | 1m | 1 token / 12s | 60s |
| **recovery** | 3 | 10m | 1 token / 180s | 600s |
| **default** | 60 | 1m | 10 tokens / 1s | 60s |

### Redis connection pool

```yaml
spring:
  data:
    redis:
      host: redis
      port: 6379
      lettuce:
        pool:
          max-active: 10
          max-idle: 5
          min-idle: 2
```

### Настройка за load balancer

**Критично**: LB должен пробрасывать правильные headers, иначе все запросы будут с IP load balancer'а!

```nginx
# Nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

## Отключение rate limiting

| Scope | Config |
|-------|--------|
| **Глобально** | `aquastream.rate-limit.enabled: false` |
| **Конкретный тип** | `aquastream.rate-limit.limits.login.enabled: false` |
| **Dev окружение** | `application-dev.yml`: `enabled: false` |

## Troubleshooting

### Rate limit срабатывает слишком часто

```yaml
# Увеличить capacity и refill rate
capacity: 100      # Burst capacity
refill-tokens: 20  # Sustained rate
```

Проверить что используется правильный client key (IP, не LB IP).

### Rate limit не срабатывает

1. Проверить `enabled: true`
2. Проверить Redis подключен: `redis-cli ping`
3. Проверить логи фильтра

### 429 для legitimate users

Использовать user-based вместо IP-based:

```java
// Модифицировать RateLimitFilter.getClientKey()
String userId = request.getHeader("X-User-Id");
if (userId != null) {
    return "user:" + userId;
}
```

---

См. [Backend Common](README.md), [Security](security.md), [Error Handling](error-handling.md), [Operations: Security](../../operations/policies/security.md).