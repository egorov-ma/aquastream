# Payment API Documentation

API для инициализации платежей, обработки вебхуков и модерации чеков.

## Base URL
```
http://localhost:8084/api/v1/payments
```

## Endpoints

### 1. POST /payments/{bookingId}/init

Инициализация платежа и получение конфигурации виджета.

**URL:** `POST /payments/{bookingId}/init`

**Пример запроса:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "123e4567-e89b-12d3-a456-426614174000",
  "amount": 5000.00,
  "currency": "RUB",
  "description": "Оплата участия в турнире по теннису",
  "returnUrl": "https://example.com/payment/success",
  "failUrl": "https://example.com/payment/fail",
  "customerEmail": "user@example.com",
  "customerPhone": "+7900123456",
  "metadata": {
    "booking_type": "event",
    "participants": 2
  }
}
```

**Пример ответа (201 Created):**
```json
{
  "paymentId": "987fcdeb-51d2-4c3a-8b45-123456789abc",
  "providerName": "tinkoff",
  "status": "PENDING",
  "widget": {
    "type": "redirect",
    "paymentUrl": "https://securepay.tinkoff.ru/v2/Init",
    "confirmUrl": "https://example.com/payment/success",
    "cancelUrl": "https://example.com/payment/fail",
    "config": {
      "terminal_key": "TinkoffBankTest",
      "order_id": "order_1234567890",
      "amount": 500000,
      "currency": "RUB",
      "description": "Оплата участия в турнире по теннису"
    },
    "style": {
      "theme": "light",
      "primaryColor": "#2196F3",
      "language": "ru",
      "size": "medium"
    }
  },
  "expiresAt": "2024-08-17T15:30:00Z"
}
```

**Ошибки:**
- `400 Bad Request` - Невалидные данные запроса
- `409 Conflict` - Платеж уже существует
- `503 Service Unavailable` - Провайдер недоступен

### 2. POST /payments/webhook/{provider}

Обработка вебхука от платежного провайдера с проверкой подписи.

**URL:** `POST /payments/webhook/{provider}`

**Поддерживаемые провайдеры:** `tinkoff`, `sber`, `yookassa`

**Headers:**
- `X-Api-Signature-Sha256` - Подпись вебхука (для Tinkoff)
- `Content-Type: application/json`

#### Tinkoff Webhook

**Пример запроса:**
```json
{
  "TerminalKey": "TinkoffBankTest",
  "OrderId": "order_1234567890",
  "PaymentId": "12345678",
  "Status": "CONFIRMED",
  "Amount": 500000,
  "CardId": 123456789,
  "Pan": "430000****0777",
  "ExpDate": "1122",
  "Token": "a1b2c3d4e5f6..."
}
```

**Headers:**
```
X-Api-Signature-Sha256: 8a1b2c3d4e5f67890abcdef123456789...
Content-Type: application/json
```

#### Sberbank Webhook

**Пример запроса:**
```json
{
  "orderId": "order_1234567890",
  "paymentId": "sber_payment_123",
  "status": "DEPOSITED",
  "amount": 500000,
  "currency": "RUB",
  "orderDescription": "Оплата участия в турнире",
  "checksum": "abcdef123456..."
}
```

#### YooKassa Webhook

**Пример запроса:**
```json
{
  "type": "notification",
  "event": "payment.succeeded",
  "object": {
    "id": "24b94598-000f-5000-9000-1b68e7b15f3f",
    "status": "succeeded",
    "paid": true,
    "amount": {
      "value": "5000.00",
      "currency": "RUB"
    },
    "created_at": "2024-08-17T14:30:00.000Z",
    "description": "Оплата участия в турнире"
  }
}
```

**Пример ответа (200 OK):**
```json
{
  "status": "success"
}
```

**Ошибки:**
- `400 Bad Request` - Неизвестный провайдер
- `401 Unauthorized` - Неверная подпись (АС: Неверная подпись отклоняется 401/403)
- `409 Conflict` - Вебхук уже обработан (АС: Повтор вебхука не меняет состояние 409 при дубле)

### 3. POST /payments/{paymentId}/receipt

Отправка чека/пруфа оплаты на модерацию.

**URL:** `POST /payments/{paymentId}/receipt`

**Пример запроса:**
```json
{
  "receiptImageUrl": "https://example.com/receipts/receipt_123.jpg",
  "receiptText": "Чек об оплате на сумму 5000 рублей от 17.08.2024",
  "notes": "Оплата произведена картой через терминал",
  "submittedBy": "550e8400-e29b-41d4-a716-446655440000",
  "submitterEmail": "user@example.com",
  "submitterPhone": "+7900123456",
  "metadata": {
    "receipt_type": "terminal",
    "location": "Москва, ул. Ленина 1"
  }
}
```

**Пример ответа (201 Created):**
```json
{
  "receiptId": "aabbccdd-1122-3344-5566-778899aabbcc",
  "status": "pending_moderation",
  "message": "Receipt submitted for moderation"
}
```

**Ошибки:**
- `400 Bad Request` - Невалидные данные или платеж не подходит для отправки чека
- `404 Not Found` - Платеж не найден
- `409 Conflict` - Чек уже существует

### 4. GET /payments/{paymentId}/receipt

Получение информации о чеке по платежу.

**URL:** `GET /payments/{paymentId}/receipt`

**Пример ответа (200 OK):**
```json
{
  "id": "aabbccdd-1122-3344-5566-778899aabbcc",
  "paymentId": "987fcdeb-51d2-4c3a-8b45-123456789abc",
  "receiptType": "PAYMENT",
  "receiptData": {
    "receipt_image_url": "https://example.com/receipts/receipt_123.jpg",
    "receipt_text": "Чек об оплате на сумму 5000 рублей",
    "submitter_email": "user@example.com",
    "moderation_result": "approved",
    "moderator_notes": "Чек соответствует всем требованиям",
    "moderated_at": "2024-08-17T15:00:00Z"
  },
  "status": "REGISTERED",
  "createdAt": "2024-08-17T14:30:00Z",
  "updatedAt": "2024-08-17T15:00:00Z",
  "registeredAt": "2024-08-17T15:00:00Z"
}
```

### 5. POST /payments/receipts/{receiptId}/moderate

Модерация чека (админский endpoint).

**URL:** `POST /payments/receipts/{receiptId}/moderate`

**Пример запроса (одобрение):**
```json
{
  "approved": true,
  "notes": "Чек соответствует всем требованиям. Сумма и дата совпадают.",
  "moderatorId": "11223344-5566-7788-9900-aabbccddeeff"
}
```

**Пример запроса (отклонение):**
```json
{
  "approved": false,
  "notes": "Нечеткое изображение чека. Не видна сумма платежа. Требуется повторная отправка.",
  "moderatorId": "11223344-5566-7788-9900-aabbccddeeff"
}
```

**Пример ответа (200 OK):**
```json
{
  "status": "success",
  "result": "approved"
}
```

### 6. GET /payments/receipts/{receiptId}

Получение информации о чеке по ID.

**URL:** `GET /payments/receipts/{receiptId}`

**Пример ответа аналогичен GET /payments/{paymentId}/receipt**

## Статусы

### Статусы платежей
- `PENDING` - Создан, ожидает отправки провайдеру
- `SUBMITTED` - Отправлен провайдеру, ожидает обработки
- `SUCCEEDED` - Успешно завершен
- `REJECTED` - Отклонен провайдером
- `CANCELED` - Отменен пользователем или системой

### Статусы чеков
- `PENDING` - Ожидает модерации
- `SENT` - Отправлен в ОФД (не используется в API)
- `REGISTERED` - Одобрен модератором
- `FAILED` - Отклонен модератором

## Уведомления

После модерации чека автоматически отправляются уведомления:

### Email уведомление (одобрение)
```
Subject: Чек одобрен - платеж подтвержден

Ваш чек об оплате успешно одобрен модератором. Платеж подтвержден.

Детали платежа:
- ID: 987fcdeb-51d2-4c3a-8b45-123456789abc
- Сумма: 5000.00 RUB
- Дата: 17.08.2024
```

### Email уведомление (отклонение)
```
Subject: Чек отклонен - требуется повторная отправка

Ваш чек об оплате отклонен. 
Причина: Нечеткое изображение чека. Не видна сумма платежа.

Пожалуйста, отправьте корректный чек.
```

### SMS уведомления
- Одобрение: "Чек одобрен. Платеж подтвержден."
- Отклонение: "Чек отклонен. Отправьте корректный чек."

## Безопасность

### Проверка подписи вебхуков

#### Tinkoff
```
HMAC-SHA256(webhook_body, secret_key) = X-Api-Signature-Sha256
```

#### Sberbank
```
SHA-256(webhook_params + secret_key) = checksum
```

#### YooKassa
```
HMAC-SHA256(webhook_body, secret_key) = Authorization header
```

### Идемпотентность

**Платежи:** Уникальность по `(provider_name, idempotency_key)`
**Вебхуки:** Уникальность по `(provider_name, provider_event_id)`

### Rate Limiting

- Payment init: 10 запросов в минуту на пользователя
- Webhook: 1000 запросов в минуту на провайдера
- Receipt submission: 5 запросов в минуту на пользователя

## Примеры интеграции

### JavaScript (Frontend)

```javascript
// Инициализация платежа
async function initPayment(bookingId, paymentData) {
  const response = await fetch(`/api/v1/payments/${bookingId}/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData)
  });
  
  const result = await response.json();
  
  if (result.widget.type === 'redirect') {
    window.location.href = result.widget.paymentUrl;
  }
  
  return result;
}

// Отправка чека
async function submitReceipt(paymentId, receiptData) {
  const response = await fetch(`/api/v1/payments/${paymentId}/receipt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(receiptData)
  });
  
  return await response.json();
}
```

### curl примеры

```bash
# Инициализация платежа
curl -X POST http://localhost:8084/api/v1/payments/123e4567-e89b-12d3-a456-426614174000/init \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "eventId": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 5000.00,
    "currency": "RUB",
    "description": "Оплата участия в турнире",
    "customerEmail": "user@example.com"
  }'

# Отправка чека
curl -X POST http://localhost:8084/api/v1/payments/987fcdeb-51d2-4c3a-8b45-123456789abc/receipt \
  -H "Content-Type: application/json" \
  -d '{
    "receiptImageUrl": "https://example.com/receipts/receipt_123.jpg",
    "receiptText": "Чек об оплате на сумму 5000 рублей",
    "submitterEmail": "user@example.com"
  }'

# Модерация чека (админ)
curl -X POST http://localhost:8084/api/v1/payments/receipts/aabbccdd-1122-3344-5566-778899aabbcc/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "notes": "Чек соответствует требованиям",
    "moderatorId": "11223344-5566-7788-9900-aabbccddeeff"
  }'
```

Этот API обеспечивает полный цикл обработки платежей от инициализации до подтверждения чеками с поддержкой идемпотентности и модерации.