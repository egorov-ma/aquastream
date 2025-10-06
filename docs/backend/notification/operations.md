# Notification — операции

## Обзор

Notification Service работает совместно с Telegram Bot API и хранит пользовательские предпочтения в PostgreSQL схеме `notification`.

**Порт**: 8105  
**Ключевые переменные**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `NOTIFICATION_OUTBOX_BATCH_SIZE`

## Webhook Telegram

- Настройка: `https://api.telegram.org/bot$TOKEN/setWebhook?url=https://<domain>/api/v1/notifications/telegram/webhook`
- Проверка: `docker compose exec backend-notification curl -s http://localhost:8105/actuator/health`
- Логи ошибок: `make logs SERVICE=backend-notification | grep webhook`
- Повторные доставки выполняются автоматически с backoff; статус хранится в таблице `outbox`

## Outbox и воркеры

- Outbox-записи со статусом `FAILED` пересылаются воркером каждые 30 секунд.
- Проверка очереди:
  ```bash
  psql notification -c "select id, category, status, attempts from outbox order by created_at desc limit 20"
  ```
- Метрики: `notification.outbox.pending`, `notification.telegram.errors`

## Управление подписками

- Таблица `notification_prefs` хранит настройки пользователями (обязательные категории всегда `enabled=true`).
- Проверить подписки пользователя:
  ```bash
  psql notification -c "select category, channel, enabled from notification_prefs where user_id='<uuid>'"
  ```
- Привязка Telegram (`telegram_subscriptions`) создаётся после `/start <code>` и содержит `telegram_chat_id`

## Типичные задачи

| Задача | Команда |
|--------|---------|
| Проверить состояние привязки | `psql notification -c "select * from telegram_subscriptions where user_id='<uuid>'"` |
| Отправить тестовое уведомление | `POST /api/v1/notifications/test` (требует роль ADMIN) |
| Перерегистрировать webhook | `curl -X POST https://api.telegram.org/bot$TOKEN/setWebhook -d url=https://<domain>/api/v1/notifications/telegram/webhook` |

## Troubleshooting

- **Сообщения не доходят**: проверить `outbox`, убедиться что `notification.outbox.pending` не растёт, см. логи Telegram API.
- **Webhook отвечает 401**: перепроверить `TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_SECRET`.
- **Пользователь не может привязать Telegram**: убедиться что deep-link передаёт правильный `code` и пользователь существует в User Service.

## См. также

- [Notification Overview](README.md)
- [Notification API](api.md)
- [Incident Response runbook](../../operations/runbooks/incident-response.md)
