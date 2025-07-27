# Backend-Gateway

API Gateway на базе Spring Cloud Gateway.

| Подпроект | Назначение |
|-----------|-----------|
| `backend-gateway-api`     | контракты, DTO, схемы |
| `backend-gateway-db`      | конфигурация хранения маршрутов |
| `backend-gateway-service` | конфигурация Gateway, фильтры, маршруты |

## Запуск сервиса

### Локально
```bash
./gradlew :backend-gateway-service:bootRun
```
Сервис доступен на `http://localhost:8080`.

### Docker
```bash
docker build -t aquastream-gateway -f infra/docker/images/Dockerfile.backend-gateway .
docker run -p 8080:8080 aquastream-gateway
```

## ENV переменные
| Переменная | Значение | Описание |
|------------|----------|----------|
| `SPRING_PROFILES_ACTIVE` | `dev` | Профиль Spring |
| `JWT_PUBLIC_KEY_URL` | `https://idp.example.com/jwks` | JWKS endpoint |
| `REDIS_URL` | `redis://localhost:6379` | Rate limiter store |

## Пример маршрута
```yaml
description: Crew API
id: crew
uri: http://localhost:8083
predicates:
  - Path=/api/v1/crews/**
filters:
  - StripPrefix=1
  - JwtAuthentication
```

Проверьте активные маршруты:
```bash
curl http://localhost:8080/actuator/gateway/routes | jq
```

## Тестирование
```bash
./gradlew :backend-gateway-service:test
```
WebTestClient проверяет, что маршрут `/api/v1/users/**` проксируется.

## CI/CD
![Backend CI](https://github.com/egorov-ma/aquastream/actions/workflows/backend-ci.yml/badge.svg)

## Дополнительная документация
- Системный анализ: [`gateway-analysis`](../infra/docs/system-analysis/gateway-analysis.md)
- Бизнес-архитектура: [`gateway-architecture`](../infra/docs/business-architecture/gateway-architecture.md)