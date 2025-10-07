# Notification Service — Бизнес-логика

## Обзор

Notification Service управляет Telegram ботом и отправкой уведомлений пользователям.

## Каналы и категории

| Канал | Приоритет | Категории |
|-------|-----------|-----------|
| **Telegram** | 1 (основной) | Все категории |
| **Email** | 2 (fallback) | Критичные уведомления |
| **SMS** | 3 (резерв) | При необходимости |

**Категории**:
- **Обязательные**: BOOKING_CONFIRMED, PAYMENT_STATUS, EVENT_REMINDER
- **Опциональные**: WAITLIST_AVAILABLE, EVENT_NEWS

## Telegram Bot

| Endpoint | Описание |
|----------|----------|
| `/api/telegram/webhook` | Webhook от Telegram |
| `/start <code>` | Привязка аккаунта (deep link) |
| `/help` | Помощь |
| `/settings` | Настройки уведомлений |

**Безопасность**: Проверка signature, защита от повторов.

## Preferences

`notification_prefs` управляет включением каналов по категориям. Пользователи могут отписаться от опциональных категорий.

## Outbox Pattern

**Процесс**:
1. Шаблонизация сообщения → запись в `outbox`
2. Воркер: retry с backoff, дедупликация по `correlationId`
3. Метрики ошибок и таймаутов

## База данных (схема `notification`)

| Таблица | Ключевые поля | Описание |
|---------|---------------|----------|
| `notification_prefs` | `user_id`, `category`, `channel`, `enabled` | Настройки уведомлений |
| `telegram_subscriptions` | `user_id`, `telegram_chat_id`, `verified_at` | Привязка Telegram |
| `outbox` | `id`, `user_id`, `category`, `payload`, `status` (pending/sent/failed), `attempts` | Очередь отправки |

---

См. [API](api.md), [Operations](operations.md), [Event Service](../event/business-logic.md).