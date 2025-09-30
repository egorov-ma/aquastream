# API Gateway — Бизнес-логика

## Обзор

API Gateway - единая точка входа в backend, обеспечивает JWT валидацию, rate limiting, CORS и маршрутизацию.

**Порт**: 8080
**Технология**: Spring WebFlux (reactive)

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

## JWT Валидация

**Процесс**:
1. Извлечение token из `Authorization: Bearer <token>`
2. Проверка подписи (HS512 + JWT_SECRET)
3. Проверка expiration
4. Извлечение user_id и role
5. Добавление заголовков `X-User-Id`, `X-User-Role`
6. Проброс к сервису

**Публичные маршруты** (без JWT):
- `/api/auth/**`
- `/api/events` (GET)
- `/api/organizers` (GET)
- `/actuator/health`

## CORS

```yaml
gateway:
  cors:
    allowed-origins:
      - http://localhost:3000    # Dev
      - https://aquastream.com   # Prod
    allowed-methods: [GET, POST, PUT, DELETE, PATCH]
    allowed-headers: [Authorization, Content-Type]
    max-age: 3600
```

## Технологические детали

- **Spring WebFlux**: reactive, non-blocking
- **Redis**: хранение bucket states
- **Bucket4j**: soft rate limiting

## См. также

- [Gateway API](api.md)
- [Authentication](../authentication.md) - JWT детали
- [Security](../common/security.md) - rate limiting
