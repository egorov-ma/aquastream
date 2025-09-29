---
title: "Backend Gateway"
summary: "Единая входная точка на Spring Cloud Gateway: JWT, rate limiting, безопасность и маршрутизация."
---# AquaStream Backend Gateway

Единая входная точка для всех микросервисов AquaStream на основе Spring Cloud Gateway с поддержкой JWT аутентификации, 
лимитирования запросов и централизованного администрирования.

## Описание

`backend-gateway` обеспечивает маршрутизацию, безопасность, лимитирование и административные endpoints.

## Архитектура (основные компоненты)

```
admin/, config/, filter/, security/
```

### Ключевые возможности
- JWT аутентификация (WebFlux)
- Rate Limiting (Bucket4j)
- CORS и заголовки безопасности
- RFC 7807 ошибки
- Admin endpoints (health, метрики)

## Примеры конфигурации

```yaml
gateway:
  rate-limit:
    default-per-minute: 60
  cors:
    allowed-origins:
      - http://localhost:3000
```

## Маршрутизация (схема)

| Путь | Сервис |
|------|--------|
| /api/v1/auth/** | backend-user |
| /api/v1/events/** | backend-event |
| ... | ... |

## Тестирование

```bash
./gradlew backend-gateway:test
```
