# Gateway — бизнес-логика

Статус: as-is

## Ответственности
- Проверка JWT токенов и проброс идентификации (X-User-Id, X-User-Role)
- CORS политика для внешних клиентов
- Rate limiting (Bucket4j) по типам эндпоинтов
- Маршрутизация запросов к сервисам доменов
- Агрегация health статусов сервисов

## Health aggregation
- Эндпоинт: `GET /api/v1/admin/health` — сбор и сводный отчёт по `/actuator/health` всех сервисов

## Rate limiting (пример)
```yaml
/api/v1/auth/*: 10 req/min per IP
/api/v1/payments/*: 30 req/min per user
/api/v1/*: 60 req/min per user
```

## CORS (пример)
```yaml
gateway:
  cors:
    allowed-origins: [https://aquastream.app]
```
