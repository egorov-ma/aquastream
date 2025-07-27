# Backend-Notification Service

Микросервис отправки уведомлений (Kafka → Telegram/Push).

| Подпроект | Назначение |
|-----------|-----------|
| `backend-notification-api`     | DTO / события Kafka |
| `backend-notification-db`      | база данных, репозитории |
| `backend-notification-service` | бизнес-логика, адаптеры Kafka, Spring Boot |


> Канал доставки: Telegram Bot API.

## Запуск сервиса

### Локально
```bash
./gradlew :backend-notification-service:bootRun
```
Сервис стартует на `http://localhost:8084`.

### Docker
```bash
docker build -t aquastream-notification -f infra/docker/images/Dockerfile.backend-notification .
docker run -p 8084:8084 aquastream-notification
```

## ENV переменные
| Переменная | Значение | Описание |
|------------|----------|----------|
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka адрес |
| `TELEGRAM_BOT_TOKEN` | — | Токен BotFather |
| `TELEGRAM_CHAT_ID` | — | Чат/канал для уведомлений |

## Использование API
Swagger UI через Gateway: `/notification/swagger-ui.html`.

Пример on-demand отправки сообщения в Telegram:
```bash
curl -X POST http://localhost:8084/api/v1/notifications/telegram \
 -H 'Content-Type: application/json' \
 -d '{"chatId":"123456","message":"Привет!"}'
```

## Тестирование
```bash
./gradlew :backend-notification-service:test
```

## CI/CD
![Backend CI](https://github.com/egorov-ma/aquastream/actions/workflows/backend-ci.yml/badge.svg)

## Дополнительная документация
- Системный анализ: [`notification-analysis`](../infra/docs/system-analysis/notification-analysis.md)
- Бизнес-архитектура: [`notification-architecture`](../infra/docs/business-architecture/notification-architecture.md)