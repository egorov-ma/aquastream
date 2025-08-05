# Backend-User Service

Микросервис управления пользователями и аутентификацией.

| Подпроект | Назначение |
|-----------|-----------|
| `backend-user-api`     | DTO, контракт API |
| `backend-user-db`      | миграции Liquibase, JPA-сущности |
| `backend-user-service` | бизнес-логика, контроллеры, Spring Security |

## Запуск сервиса

### Локально
```bash
./gradlew :backend-user-service:bootRun
```
Сервис доступен по `http://localhost:8081`.

### Docker
```bash
docker build -t aquastream-user -f infra/docker/images/Dockerfile.backend-user .
docker run -p 8081:8081 aquastream-user
```

## ENV переменные
| Переменная | Значение | Описание |
|------------|----------|----------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/aquastream_db` | База PostgreSQL |
| `JWT_SECRET` | `dev-secret` | Ключ подписи HMAC |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka bootstrap |

## Использование API
Swagger UI: `http://localhost:8081/swagger-ui.html` (через Gateway — `/user/swagger-ui.html`).

Пример регистрации:
```bash
curl -X POST http://localhost:8081/api/v1/auth/register \
 -H 'Content-Type: application/json' \
 -d '{"email":"user@example.com","password":"password"}'
```

## Тестирование
```bash
./gradlew :backend-user-service:test
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login, returns `token` & `refreshToken` |
| POST | `/api/auth/register` | Registration (also returns tokens) |
| POST | `/api/auth/refresh` | Refresh access token using `refreshToken` |
| GET  | `/api/users/me` | Current user profile |

Ответ *Login/Register*:

```json
{
  "data": {
    "token": "<JWT>",
    "refreshToken": "<refreshToken>",
    "id": "...",
    "username": "...",
    "name": "...",
    "role": "ROLE_USER"
  },
  "success": true
}
```

## CI/CD
![Backend CI](https://github.com/egorov-ma/aquastream/actions/workflows/backend-ci.yml/badge.svg)

## Дополнительная документация
- Системный анализ: [`user-analysis`](../infra/docs/system-analysis/user-analysis.md)
- Бизнес-архитектура: [`user-architecture`](../infra/docs/business-architecture/user-architecture.md)