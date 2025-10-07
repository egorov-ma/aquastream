# API Gateway

## Обзор

API Gateway - единая точка входа в backend AquaStream. Работает за Nginx, выполняет JWT валидацию, CORS, rate limiting и маршрутизацию.

**Порт**: 8080
**Технология**: Spring WebFlux (reactive)
**Upstream**: Nginx (TLS, IP rate limit)

## Основные функции

| Функция | Описание |
|---------|----------|
| **JWT валидация** | Проверка Access tokens, проброс `X-User-Id`, `X-User-Role` |
| **CORS** | Политика для внешних клиентов |
| **Rate limiting** | Bucket4j (прикладной уровень) по типам endpoints |
| **Маршрутизация** | Проброс к доменным сервисам (User, Event, Crew, Payment, Notification, Media) |
| **Health aggregation** | Сводка `/actuator/health` всех сервисов |

## Архитектура

```
Nginx (80/443) → Gateway (8080) → Backend Services (8101-8106)
   ↓
TLS, IP limits → JWT validation, CORS, Rate limiting → Domain routing
```

## Ключевые endpoints

| Endpoint | Описание | Доступ |
|----------|----------|--------|
| `GET /api/admin/health` | Агрегированный health всех сервисов | ADMIN |
| `GET /api/admin/info` | Версии сервисов, git hash | ADMIN |
| `ANY /api/**` | Маршрутизация к backend сервисам | По JWT |

---

См. [Business Logic](business-logic.md), [API](api.md), [Operations](operations.md).