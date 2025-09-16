# AquaStream Backend Gateway

Единая входная точка для всех микросервисов AquaStream на основе Spring Cloud Gateway с поддержкой JWT аутентификации, 
лимитирования запросов и централизованного администрирования.

## Описание

`backend-gateway` является точкой входа для всех запросов к backend-сервисам AquaStream. Обеспечивает:
- Маршрутизацию запросов к соответствующим микросервисам
- JWT аутентификацию и авторизацию
- Лимитирование скорости запросов (Rate Limiting)
- Безопасность через CORS и заголовки защиты
- Административные endpoints для мониторинга
- Стандартизированную обработку ошибок по RFC 7807

## Архитектура

### Компоненты Gateway

```
backend-gateway/
├── admin/                    # Административные endpoints
│   ├── AdminController       # Health check агрегация
│   └── AdminMetricsController # Метрики из Redis
├── config/                   # Конфигурация
│   ├── CorsConfig           # CORS политики
│   ├── SecurityConfig       # Spring Security WebFlux
│   └── SecurityHeadersConfig # Безопасные заголовки
├── filter/                   # WebFlux фильтры
│   ├── CorrelationWebFilter # Correlation ID трассировка
│   └── RateLimitFilter      # Bucket4j лимитирование
└── security/                 # JWT аутентификация
    ├── JwtAuthWebFilter     # JWT валидация фильтр
    └── JwtUtil              # JWT утилиты
```

### Принципы работы

#### 🔒 JWT аутентификация
- Валидация JWT токенов от user-service
- Поддержка Authorization header и HTTP cookies
- Передача пользовательского контекста downstream сервисам
- Автоматическое добавление заголовков X-User-Id и X-User-Role

#### 🚦 Rate Limiting
- Bucket4j алгоритм для контроля скорости запросов
- Дифференцированные лимиты по типам endpoint'ов
- Graceful degradation с RFC 7807 ошибками
- Retry-After заголовки для клиентов

#### 🛡️ Безопасность
- CORS белый список доменов
- Заголовки защиты (X-Frame-Options, CSP, HSTS)
- Correlation ID для трассировки запросов
- Стандартизированная обработка ошибок

## Маршрутизация

### Схема маршрутизации микросервисов

| Путь | Микросервис | Порт | Назначение |
|------|-------------|------|------------|
| `/api/v1/auth/**` | backend-user | 8101 | Аутентификация и авторизация |
| `/api/v1/profile/**` | backend-user | 8101 | Профили пользователей |
| `/api/v1/events/**` | backend-event | 8102 | События и организаторы |
| `/api/v1/bookings/**` | backend-event | 8102 | Бронирования |
| `/api/v1/organizers/**` | backend-event | 8102 | Организаторы |
| `/api/v1/crews/**` | backend-crew | 8103 | Экипажи и группы |
| `/api/v1/payments/**` | backend-payment | 8104 | Платежи |
| `/api/v1/webhooks/**` | backend-payment | 8104 | Webhook'и платежных систем |
| `/api/v1/notifications/**` | backend-notification | 8105 | Уведомления |
| `/api/v1/media/**` | backend-media | 8106 | Медиа контент |

### Особые маршруты

- `/actuator/**` - прямой доступ к actuator endpoints
- `/api/v1/admin/**` - административные функции gateway

## JWT аутентификация

### Компоненты аутентификации

#### JwtUtil
Утилита для работы с JWT токенами:
- Валидация подписи и срока действия
- Извлечение userId и role из payload
- Поддержка HS512 алгоритма подписи

#### JwtAuthWebFilter
WebFlux фильтр для обработки аутентификации:
- Извлечение JWT из Authorization header или cookies
- Валидация токенов и установка SecurityContext
- Добавление заголовков для downstream сервисов
- Возврат 401 для невалидных токенов

### Правила аутентификации

#### Исключения (не требуют JWT):
- `/api/v1/auth/**` - endpoints аутентификации
- `/actuator/**` - health checks и метрики
- `/api/v1/admin/**` - административные endpoints

#### Защищенные endpoints:
- Все остальные `/api/v1/**` требуют валидный JWT

### Способы передачи токенов

1. **Authorization Header:**
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...
   ```

2. **HTTP Cookie:**
   ```
   Cookie: access=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...
   ```

### Интеграция с downstream сервисами

После успешной валидации JWT Gateway добавляет заголовки:

```
X-User-Id: 123e4567-e89b-12d3-a456-426614174000
X-User-Role: USER
X-Correlation-Id: req-abc123
```

## Rate Limiting

### Конфигурация лимитов

```yaml
gateway:
  rate-limit:
    default-per-minute: 60      # Общий лимит
    login-per-minute: 10        # Лимит для /auth/login
    recovery-per-minute: 5      # Лимит для восстановления пароля
```

### Bucket4j алгоритм
- Фиксированное окно с пополнением токенов
- Дифференцированные лимиты по endpoint'ам
- Graceful handling при превышении

### Ответы при превышении лимита

**HTTP 429 Too Many Requests:**
```json
{
  "type": "https://aquastream.app/problems/429",
  "title": "Rate limit exceeded",
  "status": 429,
  "detail": "Too many requests for endpoint /api/v1/auth/login",
  "instance": "/api/v1/auth/login",
  "retryAfter": 60
}
```

**Заголовки:**
```
Retry-After: 60
Content-Type: application/problem+json
```

## CORS и безопасность

### CORS конфигурация

```yaml
gateway:
  cors:
    allowed-origins:
      - http://localhost:3000      # Development frontend
      - https://aquastream.app     # Production frontend
    allowed-methods: GET,POST,PUT,DELETE,OPTIONS
    allowed-headers: "*"
    allow-credentials: true
```

### Безопасные заголовки

Автоматически добавляются ко всем ответам:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

## Административные endpoints

### Health Check агрегация

#### `GET /api/v1/admin/health`
Агрегирует health статус всех микросервисов

**Конфигурация сервисов:**
```yaml
gateway:
  admin:
    services:
      user: http://localhost:8101
      event: http://localhost:8102
      crew: http://localhost:8103
      payment: http://localhost:8104
      notification: http://localhost:8105
```

**Пример ответа:**
```json
{
  "status": "UP",
  "services": {
    "user": {
      "status": "UP",
      "responseTime": 45
    },
    "event": {
      "status": "DOWN",
      "error": "Connection timeout"
    }
  },
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Метрики из Redis

#### `GET /api/v1/admin/metrics/series`
Получение таймсерий метрик из Redis

**Параметры:**
- `service` - название сервиса (user, event, crew, etc.)
- `metric` - тип метрики (requests_total, latency_p95_ms, etc.)
- `range` - временной диапазон (h1, h6, h24, d7)

**Пример запроса:**
```bash
GET /api/v1/admin/metrics/series?service=event&metric=requests_total&range=h24
```

**Формат ответа:**
```json
{
  "service": "event",
  "metric": "requests_total",
  "range": "h24",
  "data": [
    {
      "timestamp": "2025-08-20T09:00:00Z",
      "value": 1250
    },
    {
      "timestamp": "2025-08-20T10:00:00Z", 
      "value": 1180
    }
  ]
}
```

## Обработка ошибок

### RFC 7807 Problem Details

Все ошибки возвращаются в стандартизированном формате:

```json
{
  "type": "https://aquastream.app/problems/validation-failed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Request validation failed for field 'email'",
  "instance": "/api/v1/auth/register",
  "timestamp": "2025-08-20T10:30:00Z",
  "correlationId": "req-abc123"
}
```

### Стандартные типы ошибок

| HTTP Code | Problem Type | URI |
|-----------|--------------|-----|
| 400 | validation.failed | https://aquastream.app/problems/validation-failed |
| 401 | unauthorized | https://aquastream.app/problems/401 |
| 403 | access.denied | https://aquastream.app/problems/403 |
| 404 | not.found | https://aquastream.app/problems/404 |
| 409 | conflict | https://aquastream.app/problems/409 |
| 422 | unprocessable | https://aquastream.app/problems/422 |
| 429 | rate.limit-exceeded | https://aquastream.app/problems/429 |
| 500 | internal.error | https://aquastream.app/problems/500 |

## Конфигурация

### application.yml

```yaml
server:
  port: 8080

spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: http://localhost:8101
          predicates:
            - Path=/api/v1/auth/**,/api/v1/profile/**
        - id: event-service
          uri: http://localhost:8102
          predicates:
            - Path=/api/v1/events/**,/api/v1/bookings/**,/api/v1/organizers/**

app:
  jwt:
    secret: ${JWT_SECRET:dev-secret-change-me}

gateway:
  cors:
    allowed-origins:
      - http://localhost:3000
      - https://aquastream.app
  rate-limit:
    default-per-minute: 60
    login-per-minute: 10
    recovery-per-minute: 5
  admin:
    services:
      user: http://localhost:8101
      event: http://localhost:8102
```

### Environment переменные

```bash
# JWT
JWT_SECRET=your-super-secure-secret-key-min-64-chars

# Redis (для метрик)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional

# CORS
GATEWAY_CORS_ALLOWED_ORIGINS=https://aquastream.app,https://www.aquastream.app

# Rate Limiting
GATEWAY_RATE_LIMIT_DEFAULT_PER_MINUTE=60
GATEWAY_RATE_LIMIT_LOGIN_PER_MINUTE=10
```

## Мониторинг

### Health Check

```bash
GET /actuator/health
```

### Метрики Gateway

```bash
GET /actuator/metrics
GET /actuator/metrics/gateway.requests
GET /actuator/metrics/http.server.requests
```

### Prometheus метрики

Gateway экспортирует метрики для Prometheus:
- `gateway_requests_total` - общее количество запросов
- `gateway_request_duration_seconds` - время обработки запросов
- `jwt_validation_total` - количество валидаций JWT
- `rate_limit_exceeded_total` - количество превышений лимитов

## Тестирование

### Unit тесты

```bash
./gradlew backend-gateway:test
```

### Integration тесты

```bash
# Тестирование JWT
./gradlew backend-gateway:test --tests "JwtUtilTest"

# Тестирование Rate Limiting
./gradlew backend-gateway:test --tests "RateLimitFilterTest"
```

### Функциональное тестирование

#### Тестирование аутентификации

1. **Получение JWT токена:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "user", "password": "password"}'
   ```

2. **Использование токена:**
   ```bash
   curl -H "Authorization: Bearer <jwt-token>" \
     http://localhost:8080/api/v1/events
   ```

#### Тестирование Rate Limiting

```bash
# Превышение лимита для login endpoint
for i in {1..15}; do
  curl -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "test", "password": "test"}'
  echo "Request $i"
done
```

## Производительность

### Оптимизации
- Асинхронная обработка через WebFlux
- Кэширование результатов JWT валидации
- Connection pooling для downstream сервисов
- Оптимизированные фильтры с минимальными накладными расходами

### Масштабирование
- Stateless архитектура
- Горизонтальное масштабирование
- Load balancing через external load balancer
- Health checks для автоматического управления трафиком

## Безопасность

### Рекомендации по безопасности

1. **JWT Secret:**
   - Используйте сильный секретный ключ (минимум 64 символа)
   - Синхронизируйте JWT_SECRET между user-service и gateway
   - Регулярно ротируйте секретные ключи

2. **CORS:**
   - Ограничьте allowed-origins только доверенными доменами
   - Не используйте wildcard (*) в production

3. **Rate Limiting:**
   - Настройте лимиты в соответствии с ожидаемой нагрузкой
   - Мониторьте превышения лимитов для обнаружения атак

4. **Заголовки безопасности:**
   - Включены по умолчанию, настройте CSP под ваши нужды
   - Мониторьте заголовки в production

## Развертывание

### Docker

```dockerfile
FROM openjdk:21-jre-slim
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Docker Compose

```yaml
services:
  gateway:
    image: aquastream/backend-gateway:latest
    ports:
      - "8080:8080"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_HOST=redis
    depends_on:
      - redis
      - user-service
      - event-service
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend-gateway
  template:
    spec:
      containers:
      - name: gateway
        image: aquastream/backend-gateway:latest
        ports:
        - containerPort: 8080
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
```

## Зависимости

### Основные
- Spring Boot 3.x
- Spring Cloud Gateway
- Spring Security WebFlux
- Bucket4j (Rate Limiting)
- JJWT 0.12.6 (JWT)

### Опциональные
- Redis (метрики)
- Micrometer (мониторинг)
- Actuator (health checks)