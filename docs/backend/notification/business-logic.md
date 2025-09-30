# Notification Service — Бизнес-логика

## Обзор

Notification Service управляет Telegram ботом и отправкой уведомлений пользователям.

## Каналы и категории
- Telegram (первый канал), далее e-mail/SMS при необходимости
- Обязательные: BOOKING_CONFIRMED, PAYMENT_STATUS, EVENT_REMINDER
- Опциональные: WAITLIST_AVAILABLE, EVENT_NEWS

## Telegram бот
- Webhook (`/telegram/webhook`), deep link `/start <code>` для привязки аккаунта
- Проверка подлинности апдейтов, защита от повторов

## Preferences
- `notification_prefs` управляет включением каналов по категориям
- Опция отписки от опциональных категорий

## Outbox и доставляемость
- Шаблонизация сообщения → запись в `outbox`
- Воркер отправки: retry с backoff, дедупликация по `correlationId`
- Метрики ошибок и таймаутов

## Telegram Bot

**Webhook**: `/api/telegram/webhook`

**Команды**:
- `/start <code>` - привязка аккаунта (deep link)
- `/help` - помощь
- `/settings` - настройки уведомлений

## База данных (схема `notification`)

```sql
notification_prefs (
    user_id,
    category,          -- BOOKING_CONFIRMED | EVENT_NEWS | etc
    channel,           -- telegram | email | sms
    enabled            -- true/false
)

telegram_subscriptions (
    user_id,
    telegram_username,
    telegram_chat_id,
    verified_at        -- После /start <code>
)

outbox (
    id,
    user_id,
    category,
    payload,           -- JSON содержимое
    status,            -- pending | sent | failed
    attempts,
    sent_at
)
```

## Безопасность

- ✅ Webhook signature проверка
- ✅ Outbox pattern с retry + backoff
- ✅ Rate limiting от флуда
- ✅ Проверка verification перед отправкой

## См. также

- [Notification API](api.md)
- [Event Service](../event/business-logic.md) - источник уведомлений
