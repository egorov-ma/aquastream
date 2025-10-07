# Payment API

API для инициализации платежей, обработки вебхуков от провайдеров и модерации QR-чеков.

## Обзор

**Base URL**: `http://localhost:8104/api`
**Аутентификация**: JWT (кроме webhooks)
**Формат**: JSON
**Ошибки**: RFC 7807 Problem Details

## Endpoints

### Payments

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/payments/{bookingId}/init` | Инициализация платежа (выбор провайдера, генерация виджета/QR) | USER |
| GET | `/payments/{paymentId}` | Состояние платежа и метаданные | USER (owner), ORGANIZER |
| POST | `/payments/{paymentId}/cancel` | Отмена платежа | USER (owner) |
| POST | `/payments/{paymentId}/refund` | Возврат средств | ORGANIZER, ADMIN |

### QR Payments

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/payments/{paymentId}/proof` | Загрузить скриншот QR-оплаты | USER (owner) |
| PUT | `/payments/{paymentId}/review` | Модерация чека (approve/reject) | ORGANIZER, ADMIN |
| GET | `/payments/{paymentId}/proof` | Получить presigned URL чека | ORGANIZER, ADMIN |

### Webhooks (Internal)

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/webhooks/yookassa` | Webhook от YooKassa | Подпись провайдера |
| POST | `/webhooks/cloudpayments` | Webhook от CloudPayments | Подпись провайдера |
| POST | `/webhooks/stripe` | Webhook от Stripe | Подпись провайдера |

## Провайдеры

| Провайдер | Методы | Статус |
|-----------|--------|--------|
| **YooKassa** | Виджет, Apple Pay, Google Pay | Активен (основной) |
| **CloudPayments** | Виджет, карта | Резерв |
| **Stripe** | Checkout Session | Международные платежи |
| **QR Code** | СБП, ручная модерация | Активен |

## Статусы платежа

| Статус | Описание | Переходы |
|--------|----------|----------|
| `PENDING` | Ожидает оплаты | → PROCESSING, CANCELLED |
| `PROCESSING` | Обрабатывается провайдером | → SUCCEEDED, FAILED |
| `SUCCEEDED` | Успешно оплачено | → REFUNDED |
| `FAILED` | Ошибка оплаты | Финальный |
| `REFUNDED` | Возврат произведен | Финальный |
| `CANCELLED` | Отменено пользователем | Финальный |

## Безопасность

- ✅ JWT для пользовательских операций
- ✅ Webhook signature validation (HMAC-SHA256, Stripe signature)
- ✅ Idempotency keys для webhook events (`webhook_events` таблица)
- ✅ Модерация QR: только ORGANIZER/ADMIN
- ✅ Маскирование чувствительных данных в логах (payment_method_details)
- ✅ Rate limiting: 30 req/min для payment endpoints

## Интеграции

**Event Service**: Подтверждение/отмена броней после оплаты через callback

```
Payment SUCCEEDED → POST /api/bookings/{bookingId}/payment-callback → Booking CONFIRMED
```

**Media Service**: Хранение скриншотов QR-оплаты (retention 90 дней)

---

См. [Business Logic](business-logic.md), [Operations](operations.md), [README](README.md).