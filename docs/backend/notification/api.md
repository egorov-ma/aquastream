# Notification API

API уведомлений: Telegram webhook, управление предпочтениями.

## Endpoints

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/api/notifications/telegram/webhook` | Прием апдейтов от Telegram | Signature Telegram |
| POST | `/api/notifications/subscriptions` | Обновление предпочтений (категория/канал/статус) | USER |
| GET | `/api/notifications/subscriptions` | Получение настроек пользователя | USER |
| POST | `/api/notifications/test` | Тестовое сообщение | ADMIN |

## Категории

| Тип | Категории | Управление |
|-----|-----------|------------|
| **Обязательные** | BOOKING_CONFIRMED, PAYMENT_STATUS, EVENT_REMINDER | Нельзя отключить |
| **Опциональные** | WAITLIST_AVAILABLE, EVENT_NEWS | Пользователь может отписаться |

## Каналы

| Канал | Статус | Приоритет |
|-------|--------|-----------|
| `telegram` | Активен | 1 (основной) |
| `email` | Заготовка | 2 (fallback) |
| `sms` | Заготовка | 3 (резерв) |

## Безопасность

- ✅ Webhook: валидация по bot-токену
- ✅ REST: JWT для пользовательских операций
- ✅ ADMIN только для тестовых сообщений

---

См. [Business Logic](business-logic.md), [Operations](operations.md), [README](README.md).