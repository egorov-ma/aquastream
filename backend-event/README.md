# Backend-Event Service

Микросервис планирования сплавов (gRPC + REST).

Подпроекты:

| Подпроект | Назначение |
|-----------|-----------|
| `backend-event-api`     | DTO, protobuf/grpc интерфейсы (папка `src/main/proto`) |
| `backend-event-db`      | миграции БД, репозитории |
| `backend-event-service` | бизнес-логика, контроллеры, Spring Boot конфигурация |

Документация 👉 см. `infra/docs/backend-event`.

По умолчанию сервис слушает порт `8082`.