# Payment API

API платежного сервиса покрывает инициализацию платежей, обработку вебхуков и модерацию чеков.

## Основные эндпоинты

### Платежи
- `POST /api/v1/payments/{bookingId}/init` — создать платеж для брони (виджет/QR).
- `GET /api/v1/payments/{paymentId}` — получить текущее состояние платежа.
- `POST /api/v1/payments/{paymentId}/proof` — загрузить подтверждение оплаты (QR).
- `PUT /api/v1/payments/{paymentId}/review` — модерация подтверждения организатором (`approve/reject`).

### Вебхуки
- `POST /api/v1/webhooks/{provider}` — точка входа для YooKassa/CloudPayments/Stripe. Требует подпись/секрет провайдера и обрабатывает идемпотентно.

## Безопасность

- Все публичные операции требуют JWT; модерация доступна ролям `ORGANIZER` и `ADMIN`.
- Вебхуки защищены секретами/подписями, логи маскируют чувствительные данные.
- Идемпотентность обеспечивается таблицей `webhook_events`.

## Документация API
- Полная спецификация: [`../../api/redoc/root/backend-payment-api.html`](../../api/redoc/root/backend-payment-api.html)
