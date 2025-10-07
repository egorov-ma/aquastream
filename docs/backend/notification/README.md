# Notification Service

## Обзор

Notification Service управляет уведомлениями пользователей через Telegram (основной канал), Email и SMS.

**Порт**: 8105
**Схема БД**: `notification`

## Архитектура

```
backend-notification/
├── backend-notification-api/       # REST API, Telegram webhook
├── backend-notification-service/   # Шаблоны, outbox, worker
└── backend-notification-db/        # Entities, миграции
```

## Основные процессы

| Процесс | Описание |
|---------|----------|
| **Telegram подписка** | Привязка через `/start <code>`, сохранение `telegram_chat_id` |
| **Отправка уведомлений** | Генерация payload → запись в `outbox` → worker с retry/backoff |
| **Настройки** | Управление предпочтениями (категория/канал/enabled) |

## Каналы и категории

| Канал | Приоритет | Статус |
|-------|-----------|--------|
| **Telegram** | 1 (основной) | Активен |
| **Email** | 2 (fallback) | Заготовка |
| **SMS** | 3 (резерв) | Заготовка |

**Категории**:
- **Обязательные** (нельзя отключить): BOOKING_CONFIRMED, PAYMENT_STATUS, EVENT_REMINDER
- **Опциональные**: WAITLIST_AVAILABLE, EVENT_NEWS

## Интеграции

- **Telegram Bot API** - получение апдейтов, отправка сообщений
- **Event & Payment Services** - источники событий
- **Outbox pattern** - гарантированная доставка

---

См. [Business Logic](business-logic.md), [API](api.md), [Operations](operations.md).