# Notification API

API уведомлений включает Telegram webhook и REST методы управления предпочтениями.

## Основные эндпоинты

- `POST /api/v1/notifications/telegram/webhook` — приём апдейтов от Telegram (валидируется бот-токеном).
- `POST /api/v1/notifications/subscriptions` — обновление предпочтений пользователя (категория/канал/статус).
- `GET /api/v1/notifications/subscriptions` — получение текущих настроек пользователя.
- `POST /api/v1/notifications/test` — отправка тестового сообщения (только ADMIN).

## Категории и каналы

- **Обязательные**: `BOOKING_CONFIRMED`, `PAYMENT_STATUS`, `EVENT_REMINDER` — отключить нельзя.
- **Опциональные**: `WAITLIST_AVAILABLE`, `EVENT_NEWS` — пользователь может отписаться.
- Каналы: `telegram` (основной), `email/sms` (заготовки для будущих интеграций).

## Документация API
- Полная спецификация: [`../../api/redoc/root/backend-notification-api.html`](../../api/redoc/root/backend-notification-api.html)
