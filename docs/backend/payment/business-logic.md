# Payment Service — Бизнес-логика

## Обзор

Payment Service интегрируется с платежными провайдерами, обрабатывает вебхуки и поддерживает QR-оплату с модерацией.

## Потоки
1. Инициализация
   - Создание записи `payment` со статусом `NEW` и параметрами (amount, currency, provider)
   - Режимы: `WIDGET` (редирект/виджет), `QR_MANUAL` (показ QR и загрузка чека)
2. Обработка вебхуков
   - Проверка подписи/секрета провайдера
   - Идемпотентность по ключу события → запись в `webhook_events`
   - Обновление статуса платежа и публикация доменного события
3. Сопоставление с бронью
   - `SUCCESS` → подтверждение брони в Event
   - `FAILED/CANCELED` → правила рекавери (оставить `PENDING`, авто‑отмена по TTL)
4. Ручная модерация proof
   - Для `QR_MANUAL`: проверка `payment_receipts`, принятие/отклонение

## Статусы
- `NEW` → `PENDING` → `SUCCESS` | `FAILED` | `CANCELED`
- Маппинг к Event.Booking: `SUCCESS` → `CONFIRMED`

## Провайдеры
- YooKassa, CloudPayments, Stripe (через адаптеры)

## Безопасность и соответствие
- Сверка суммы/валюты и idempotency ключей
- Верификация источника вебхука (IP/подпись)
- Маскирование чувствительных полей в логах

## Retention
- `payment_receipts` (proof) — хранение 90 дней

## Провайдеры

Поддерживаемые платежные системы:
- **YooKassa** (приоритетный)
- **CloudPayments**
- **Stripe**

**Adapter pattern**: единый интерфейс PaymentProvider

## База данных (схема `payment`)

```sql
payments (
    id, 
    booking_id,           -- Ссылка на бронь
    method,               -- WIDGET | QR_MANUAL
    amount, currency,
    status,               -- PENDING | SUCCEEDED | FAILED | REFUNDED
    provider,             -- yookassa | cloudpayments | stripe
    provider_payment_id   -- ID в системе провайдера
)

payment_receipts (
    id,
    payment_id,
    proof_url,            -- Ссылка на скриншот оплаты
    reviewed_by,          -- Organizer кто проверил
    reviewed_at
)

webhook_events (
    idempotency_key,      -- Уникальный ключ
    provider,
    raw_payload,          -- Полный JSON
    status,               -- processed | failed
    processed_at
)
```

## Безопасность

- ✅ Проверка подписей вебхуков
- ✅ Idempotency по webhook idempotency_key
- ✅ Маскирование чувствительных данных в логах
- ✅ Retention policy: proof хранятся 90 дней

## См. также

- [Payment API](api.md) - REST endpoints
- [Event Service](../event/business-logic.md) - интеграция бронирований
