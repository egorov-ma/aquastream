# Gateway API

Статус: as-is

## Назначение
- JWT‑валидация входящих запросов
- Rate limiting (Bucket4j)
- CORS
- Маршрутизация на бэкенд‑сервисы
- Агрегация health статусов

## Админ‑эндпоинты
```yaml
GET /api/v1/admin/health   # агрегированный health всех сервисов
```

Пример конфигурации:
```yaml
gateway:
  cors:
    allowed-origins: [https://aquastream.app]
  rate-limit:
    default: 60/min
    auth-endpoints: 10/min
```

## Документация API
- Admin API (ReDoc): ../../api/redoc/root/backend-gateway-admin-api.html
- Metrics API (ReDoc): ../../api/redoc/root/backend-gateway-metrics-api.html
