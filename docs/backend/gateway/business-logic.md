# API Gateway — Бизнес-логика

## Обзор

API Gateway - единая точка входа в backend. JWT валидация, rate limiting, CORS, маршрутизация.

**Порт**: 8080
**Технология**: Spring WebFlux (reactive)

## Ответственности

| Функция | Описание |
|---------|----------|
| **JWT валидация** | Проверка токенов, проброс `X-User-Id`, `X-User-Role` |
| **CORS** | Политика для внешних клиентов |
| **Rate limiting** | Bucket4j по типам endpoints |
| **Маршрутизация** | Проброс к доменным сервисам |
| **Health aggregation** | Сводка `/actuator/health` всех сервисов |

**Upstream**: Работает за Nginx (TLS, IP rate limit на edge).

## JWT Валидация

**Процесс**:
1. Извлечение `Authorization: Bearer <token>`
2. Проверка подписи (HS512 + JWT_SECRET)
3. Проверка expiration
4. Извлечение user_id, role
5. Добавление headers: `X-User-Id`, `X-User-Role`
6. Проброс к сервису

**Публичные маршруты** (без JWT):
```
/api/auth/**, /api/events (GET), /api/organizers (GET), /actuator/health
```

## Rate Limiting

| Группа endpoints | Лимит | Ключ |
|------------------|-------|------|
| `/api/auth/*` | 10 req/min | per IP |
| `/api/payments/*` | 30 req/min | per user |
| `/api/*` | 60 req/min | per user |

**Технология**: Bucket4j + Redis.

## CORS

```yaml
allowed-origins: [http://localhost:3000, https://aquastream.com]
allowed-methods: [GET, POST, PUT, DELETE, PATCH]
allowed-headers: [Authorization, Content-Type]
max-age: 3600
```

## Health Aggregation

`GET /api/admin/health` - сбор и сводка `/actuator/health` всех сервисов.

---

См. [API](api.md), [Authentication](../authentication.md), [Security](../common/security.md).