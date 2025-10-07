# Gateway API

API Gateway служит прокси между Nginx и внутренними сервисами: JWT-валидация, rate limiting, административные endpoints.

## Административные endpoints

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/api/admin/health` | Сводный health всех сервисов | ADMIN |
| GET | `/api/admin/info` | Версии сервисов и git hash | ADMIN |
| ANY | `/api/**` | Маршруты на backend-сервисы (после JWT валидации) | По JWT |

## Возможности

| Функция | Реализация |
|---------|------------|
| **JWT валидация** | HS512, проброс user context (`X-User-Id`, `X-User-Role`) |
| **CORS** | Нормализация заголовков, конфигурация `allowed-origins` |
| **Rate limiting** | Bucket4j per user/IP, дополняет лимиты Nginx |
| **Health aggregation** | Агрегация `/actuator/health` всех сервисов |

## Конфигурация

```yaml
gateway:
  cors:
    allowed-origins:
      - https://aquastream.com
    allowed-methods: [GET, POST, PUT, DELETE, PATCH]
  rate-limit:
    default: 60/min
    auth-endpoints: 10/min
  security:
    jwt-secret: ${JWT_SECRET}
    access-ttl: PT15M
```

## Публичные маршруты (без JWT)

```
/api/auth/**, /api/events (GET), /api/organizers (GET), /actuator/health
```

---

См. [Business Logic](business-logic.md), [Operations](operations.md), [README](README.md).