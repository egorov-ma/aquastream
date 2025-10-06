# Notification Service — Overview

## Назначение

Notification Service связывает события системы с каналами оповещения (в первую очередь Telegram) и управляет пользовательскими предпочтениями.

**Порт**: 8105  
**База данных**: PostgreSQL схема `notification`

## Архитектура модуля

```
backend-notification/
├── backend-notification-api/       # REST API и Telegram webhook
├── backend-notification-service/   # Обработка шаблонов, outbox, worker
└── backend-notification-db/        # Entities, миграции Liquibase
```

## Основные сценарии

1. **Telegram подписка** — привязка пользователя через `/start <code>`, сохранение `telegram_chat_id`.
2. **Отправка уведомлений** — генерация payload, запись в outbox, worker с retry/backoff.
3. **Настройки предпочтений** — включение/отключение категорий (обязательные, опциональные).

## Интеграции

- **Telegram Bot API** — получение апдейтов и отправка сообщений.
- **Event & Payment Services** — источники событий (booking, payment, waitlist).
- **Outbox pattern** — гарантированная доставка (таблица `outbox`).

## Дополнительно

- Детали реализации: [`business-logic.md`](business-logic.md)
- REST API и webhook: [`api.md`](api.md)
- Эксплуатация: [`operations.md`](operations.md)
