# Backend-Notification Service

Микросервис отправки уведомлений (Kafka → email/Push).

Подпроекты:

| Подпроект | Назначение |
|-----------|-----------|
| `backend-notification-api`     | DTO / события Kafka |
| `backend-notification-db`      | база данных, репозитории (если необходимы) |
| `backend-notification-service` | бизнес-логика, адаптеры Kafka, Spring Boot |

Документация 👉 см. `infra/docs`.

Порт по умолчанию — `8084`.
