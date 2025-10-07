# Payment Service — Бизнес-логика

## Обзор

Payment Service интегрируется с платежными провайдерами (YooKassa, CloudPayments, Stripe), обрабатывает вебхуки и поддерживает QR-оплату с модерацией.

## Потоки оплаты

| Этап | Действия |
|------|----------|
| 1. **Инициализация** | Создание `payment` (status=NEW, amount, currency, provider)<br>Режимы: `WIDGET` (redirect/виджет) или `QR_MANUAL` (QR + чек) |
| 2. **Обработка вебхуков** | Проверка подписи провайдера<br>Idempotency (`webhook_events`)<br>Обновление статуса + доменное событие |
| 3. **Сопоставление с бронью** | `SUCCESS` → Event подтверждает бронь<br>`FAILED/CANCELED` → recovery (оставить PENDING или авто-отмена по TTL) |
| 4. **Модерация (QR)** | Проверка `payment_receipts`, принятие/отклонение организатором |

## Статусы

**Payment Status Flow**:
```
NEW → PENDING → SUCCESS | FAILED | CANCELED
```

**Маппинг к Booking**: `SUCCESS` → Event Booking `CONFIRMED`

## Провайдеры

| Провайдер | Приоритет | Режим |
|-----------|-----------|-------|
| **YooKassa** | Основной | redirect/widget |
| **CloudPayments** | Альтернатива | redirect/widget |
| **Stripe** | Альтернатива | redirect/widget |

**Adapter pattern**: единый интерфейс `PaymentProvider`.

## База данных (схема `payment`)

| Таблица | Ключевые поля | Описание |
|---------|---------------|----------|
| `payments` | `id`, `booking_id`, `method` (WIDGET/QR_MANUAL), `amount`, `currency`, `status`, `provider`, `provider_payment_id` | Платежи |
| `payment_receipts` | `id`, `payment_id`, `proof_url`, `reviewed_by`, `reviewed_at` | Скриншоты для QR |
| `webhook_events` | `idempotency_key` (PK), `provider`, `raw_payload`, `status` (processed/failed), `processed_at` | Вебхуки |

## Безопасность

| Механизм | Реализация |
|----------|------------|
| **Подписи вебхуков** | Проверка секретов/подписей провайдеров |
| **Idempotency** | По `idempotency_key` в `webhook_events` |
| **Маскирование данных** | Чувствительные поля скрыты в логах |
| **Retention** | Proof хранятся 90 дней |

---

См. [Payment API](api.md), [Operations](operations.md), [Event Service](../event/business-logic.md).