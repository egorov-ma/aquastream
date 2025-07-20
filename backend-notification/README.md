# Backend-Notification Service

Микросервис отправки уведомлений (Kafka → email/Push).

| Подпроект | Назначение |
|-----------|-----------|
| `backend-notification-api`     | DTO / события Kafka |
| `backend-notification-db`      | база данных, репозитории |
| `backend-notification-service` | бизнес-логика, адаптеры Kafka, Spring Boot |