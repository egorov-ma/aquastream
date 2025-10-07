# Notification Service — Operations

## Обзор

**Порт**: 8105
**Схема БД**: `notification`
**Env**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `NOTIFICATION_OUTBOX_BATCH_SIZE`

## Telegram Webhook

**Настройка**:
```bash
curl -X POST "https://api.telegram.org/bot$TOKEN/setWebhook?url=https://<domain>/api/notifications/telegram/webhook"
```

**Проверка**:
```bash
curl http://localhost:8105/actuator/health
docker logs backend-notification | grep webhook
```

## Outbox и Workers

| Параметр | Значение | Описание |
|----------|----------|----------|
| Retry interval | 30 секунд | Повторная отправка FAILED |
| Batch size | `NOTIFICATION_OUTBOX_BATCH_SIZE` | Размер пакета worker'а |
| Status | `pending`, `sent`, `failed` | Статусы в outbox |

**Проверка очереди**:
```sql
SELECT id, category, status, attempts
FROM outbox
ORDER BY created_at DESC
LIMIT 20;
```

**Метрики**: `notification.outbox.pending`, `notification.telegram.errors`

## Управление подписками

**Проверка подписок пользователя**:
```sql
SELECT category, channel, enabled
FROM notification_prefs
WHERE user_id = '<uuid>';
```

**Проверка Telegram привязки**:
```sql
SELECT *
FROM telegram_subscriptions
WHERE user_id = '<uuid>';
```

## Типичные задачи

| Задача | Команда |
|--------|---------|
| **Проверить привязку** | `SELECT * FROM telegram_subscriptions WHERE user_id='<uuid>'` |
| **Тестовое уведомление** | `POST /api/notifications/test` (ADMIN) |
| **Перерегистрировать webhook** | `curl -X POST https://api.telegram.org/bot$TOKEN/setWebhook -d url=https://<domain>/api/notifications/telegram/webhook` |

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| **Сообщения не доходят** | 1. Проверить `outbox` (pending растет?)<br>2. Логи Telegram API<br>3. Метрика `notification.outbox.pending` |
| **Webhook 401** | Проверить `TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_SECRET` |
| **Не работает привязка** | 1. Deep-link передает правильный `code`<br>2. Пользователь существует в User Service<br>3. Проверить логи `/start` команды |
| **Worker застрял** | 1. Проверить Redis<br>2. Перезапустить сервис<br>3. Проверить `attempts` в outbox |

---

См. [Business Logic](business-logic.md), [API](api.md), [README](README.md).