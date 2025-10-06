# Gateway API

Gateway API служит тонким прокси между Nginx и внутренними сервисами: выполняет JWT-валидацию, прикладной rate limiting и предоставляет административные эндпоинты.

## Основные возможности

- Валидация Access JWT (HS512) и проброс user context (`X-User-Id`, `X-User-Role`).
- CORS-конфигурация и нормализация заголовков.
- Дополнительные лимиты с Bucket4j (пер пользователь/IP) — дополняют лимиты Nginx.
- Агрегированные health и info эндпоинты для наблюдаемости.

## Ключевые эндпоинты

```text
GET /api/v1/admin/health   # сводный health всех сервисов
GET /api/v1/admin/info     # версии сервисов и git hash
ANY /api/v1/**             # маршруты на backend-сервисы (после проверки JWT)
```

## Конфигурация

```yaml
gateway:
  cors:
    allowed-origins:
      - https://aquastream.app
  rate-limit:
    default: 60/min
    auth-endpoints: 10/min
  security:
    jwt-secret: ${JWT_SECRET}
    access-ttl: PT15M
```

## Документация

- Admin API (ReDoc): [`../../api/redoc/root/backend-gateway-admin-api.html`](../../api/redoc/root/backend-gateway-admin-api.html)
- Metrics API (ReDoc): [`../../api/redoc/root/backend-gateway-metrics-api.html`](../../api/redoc/root/backend-gateway-metrics-api.html)
