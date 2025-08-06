# Backend-Event Service

Микросервис планирования событий.

| Подпроект | Назначение |
|-----------|-----------|
| `backend-event-api`     | DTO, protobuf/grpc интерфейсы |
| `backend-event-db`      | миграции БД, репозитории |
| `backend-event-service` | бизнес-логика, контроллеры, Spring Boot конфигурация |

## Запуск сервиса

### Локально (gRPC + Spring Boot)
```bash
./gradlew :backend-event-service:bootRun
```
gRPC сервер слушает `localhost:9090`, Spring Actuator – `http://localhost:8082/actuator/health`.

### Docker
```bash
docker build -t aquastream-event -f infra/docker/images/Dockerfile.backend --build-arg SERVICE=backend-event/backend-event-service .
docker run -p 8082:8082 -p 9090:9090 aquastream-event
```

## ENV переменные
| Переменная | Значение | Описание |
|------------|----------|----------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/aquastream_db` | База PostgreSQL |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka bootstrap |

## Использование gRPC API
Пример вызова метода `CreatePlan` через **grpcurl**:
```bash
grpcurl -plaintext -d '{"name":"Autumn Trip","description":"Test"}' localhost:9090 org.aquastream.event.EventService/CreateEvent
```
Ответ:
```json
{
  "id": 1,
  "status": "DRAFT"
}
```
Для визуального теста запустите grpcui:
```bash
docker run -p 8080:8080 fullstorydev/grpcui -plaintext host.docker.internal:9090
```

## Тестирование
```bash
./gradlew :backend-event-service:test
```
Integration-тесты используют Testcontainers (PostgreSQL, Kafka).

## CI/CD
![Backend CI](https://github.com/egorov-ma/aquastream/actions/workflows/backend-ci.yml/badge.svg)
Артефакты: `backend-build` (JAR) и репорты тестов/покрытия.

## Дополнительная документация
- Системный анализ: [`event-analysis`](../infra/docs/system-analysis/event-analysis.md)
- Бизнес-архитектура: [`event-architecture`](../infra/docs/business-architecture/event-architecture.md)