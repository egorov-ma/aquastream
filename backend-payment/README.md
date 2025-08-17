# backend-payment

Сервис обработки платежей с поддержкой идемпотентности, вебхуков от провайдеров и фискализации чеков.

## Схема базы данных

### Схема: `payment`

#### Таблица: `payments`
Основная таблица платежей с поддержкой идемпотентности

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| event_id | UUID | ID события (необязательно) |
| user_id | UUID | ID пользователя (обязательно) |
| amount_kopecks | BIGINT | Сумма платежа в копейках |
| currency | VARCHAR(3) | Валюта платежа (RUB, USD, EUR) |
| status | VARCHAR(20) | Статус платежа |
| payment_method | VARCHAR(50) | Способ оплаты (card, sbp, wallet) |
| provider_name | VARCHAR(50) | Имя провайдера (tinkoff, sber, yookassa) |
| provider_payment_id | VARCHAR(255) | ID платежа в системе провайдера |
| idempotency_key | VARCHAR(255) | Уникальный ключ для предотвращения дублей |
| description | TEXT | Описание платежа |
| metadata | JSONB | Дополнительные данные |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |
| submitted_at | TIMESTAMPTZ | Дата отправки провайдеру |
| completed_at | TIMESTAMPTZ | Дата завершения |
| expires_at | TIMESTAMPTZ | Срок действия платежа |
| created_by | UUID | Пользователь, создавший платеж |
| client_ip | INET | IP-адрес клиента |
| user_agent | TEXT | User-Agent клиента |

#### Таблица: `payment_receipts`
Фискальные чеки и документы платежей

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| payment_id | UUID | Ссылка на платеж |
| receipt_type | VARCHAR(50) | Тип чека (payment, refund, correction) |
| receipt_data | JSONB | Структурированные данные чека |
| fiscal_receipt_number | VARCHAR(255) | Номер фискального чека |
| fiscal_document_number | VARCHAR(255) | Номер фискального документа |
| fiscal_sign | VARCHAR(255) | Фискальный признак |
| ofd_receipt_url | TEXT | Ссылка на чек в ОФД |
| status | VARCHAR(20) | Статус чека |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |
| sent_at | TIMESTAMPTZ | Дата отправки в ОФД |
| registered_at | TIMESTAMPTZ | Дата регистрации в ОФД |

#### Таблица: `webhook_events`
События вебхуков от платежных провайдеров с защитой от дублей

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| provider_name | VARCHAR(50) | Имя провайдера |
| provider_event_id | VARCHAR(255) | ID события в системе провайдера |
| event_type | VARCHAR(100) | Тип события |
| payment_id | UUID | Ссылка на платеж |
| provider_payment_id | VARCHAR(255) | ID платежа провайдера |
| raw_payload | JSONB | Полные данные вебхука |
| processed_payload | JSONB | Обработанные данные |
| status | VARCHAR(20) | Статус обработки |
| processing_attempts | INTEGER | Количество попыток обработки |
| last_error | TEXT | Последняя ошибка |
| idempotency_key | VARCHAR(255) | Уникальный ключ события |
| received_at | TIMESTAMPTZ | Дата получения |
| processed_at | TIMESTAMPTZ | Дата обработки |
| http_headers | JSONB | HTTP заголовки |
| source_ip | INET | IP источника |

#### Таблица: `payment_status_log`
Лог всех изменений статусов платежей для аудита

#### Таблица: `payment_retries`
История retry попыток для платежей

## Статусы платежей и переходы

### Статусы платежей

#### PENDING
- **Описание**: Платеж создан, ожидает отправки провайдеру
- **Разрешенные переходы**: 
  - `SUBMITTED` - отправлен провайдеру
  - `CANCELED` - отменен до отправки

#### SUBMITTED  
- **Описание**: Платеж отправлен провайдеру, ожидает обработки
- **Разрешенные переходы**:
  - `SUCCEEDED` - успешно обработан
  - `REJECTED` - отклонен провайдером  
  - `CANCELED` - отменен после отправки

#### SUCCEEDED
- **Описание**: Платеж успешно завершен
- **Разрешенные переходы**: ❌ Финальный статус

#### REJECTED
- **Описание**: Платеж отклонен провайдером
- **Разрешенные переходы**: ❌ Финальный статус

#### CANCELED
- **Описание**: Платеж отменен пользователем или системой
- **Разрешенные переходы**: ❌ Финальный статус

### Диаграмма переходов статусов

```
PENDING ──┬── SUBMITTED ──┬── SUCCEEDED
          │                ├── REJECTED
          │                └── CANCELED
          └── CANCELED
```

### Триггеры изменения статусов

1. **API вызовы** - ручные изменения через API
2. **Webhook события** - автоматические изменения от провайдеров  
3. **Timeout обработка** - автоматическая отмена просроченных платежей
4. **Manual операции** - изменения оператором

## Идемпотентность и защита от дублей

### Уникальные индексы

#### Платежи
```sql
-- Уникальность идемпотентности ключа
ix_payments_idempotency_key (provider_name, idempotency_key)

-- Уникальность ID платежа провайдера  
ix_payments_provider_payment_id (provider_name, provider_payment_id)
```

#### Вебхуки (АС: дубликаты вебхуков ловятся на уровне БД)
```sql
-- Уникальность события провайдера
ix_webhook_events_provider_event (provider_name, provider_event_id)

-- Дополнительная защита по idempotency_key
ix_webhook_events_idempotency_key (idempotency_key)
```

### Генерация idempotency_key

#### Для платежей
```
provider_name + user_id + event_id + amount + timestamp
```

#### Для вебхуков
```
provider_name + provider_event_id + hash(payload)
```

## Статусы чеков

### ReceiptStatus

#### PENDING
- Чек создан, ожидает отправки в ОФД

#### SENT  
- Чек отправлен в ОФД, ожидает регистрации

#### REGISTERED
- Чек успешно зарегистрирован в ОФД

#### FAILED
- Ошибка фискализации чека

## Статусы вебхуков

### WebhookStatus

#### PENDING
- Вебхук получен, ожидает обработки

#### PROCESSED
- Вебхук успешно обработан

#### FAILED
- Ошибка обработки вебхука

#### IGNORED
- Вебхук проигнорирован (дубликат или неизвестный тип)

## Примеры использования

### Создание платежа

```java
PaymentEntity payment = PaymentEntity.builder()
    .userId(userId)
    .eventId(eventId)
    .amountKopecks(500000L) // 5000 рублей
    .currency("RUB")
    .providerName("tinkoff")
    .idempotencyKey("tinkoff_" + userId + "_" + eventId + "_" + timestamp)
    .description("Оплата участия в событии")
    .build();

paymentRepository.save(payment);
```

### Обработка вебхука

```java
WebhookEventEntity webhook = WebhookEventEntity.builder()
    .providerName("tinkoff")
    .providerEventId("evt_123456789")
    .eventType("payment.succeeded")
    .providerPaymentId("pay_987654321")
    .rawPayload(payload)
    .idempotencyKey("tinkoff_evt_123456789_" + payloadHash)
    .sourceIp(clientIp)
    .build();

// Защита от дублей на уровне БД
try {
    webhookRepository.save(webhook);
} catch (DataIntegrityViolationException e) {
    // Вебхук уже обработан
    return;
}
```

### Поиск платежа по идемпотентности

```java
Optional<PaymentEntity> existing = paymentRepository
    .findByProviderNameAndIdempotencyKey("tinkoff", idempotencyKey);

if (existing.isPresent()) {
    // Платеж уже существует, возвращаем существующий
    return existing.get();
}
```

## Индексы для производительности

### Основные запросы
- Платежи по пользователю: `ix_payments_user_id`
- Платежи по событию: `ix_payments_event_id`  
- Платежи по статусу: `ix_payments_status`
- Вебхуки по платежу: `ix_webhook_events_payment_id`

### Обработка и мониторинг
- Просроченные платежи: `ix_payments_expires_at`
- Необработанные вебхуки: `ix_webhook_events_status`
- Чеки требующие отправки: `ix_payment_receipts_status`

### Аналитика
- Статистика по провайдерам: `ix_payments_analytics`
- Статистика вебхуков: `ix_webhook_events_analytics`

## Автоматизация

### Триггеры

#### Обновление updated_at
```sql
-- Автоматическое обновление временной метки
CREATE TRIGGER tr_payments_update_updated_at
    BEFORE UPDATE ON payment.payments
    FOR EACH ROW
    EXECUTE FUNCTION payment.update_updated_at();
```

#### Логирование изменений статуса
```sql
-- Автоматическое логирование всех изменений статусов
CREATE TRIGGER tr_payments_log_status_change
    AFTER UPDATE ON payment.payments
    FOR EACH ROW
    EXECUTE FUNCTION payment.log_status_change();
```

### Ограничения

#### Статусы
```sql
-- Контроль допустимых статусов на уровне БД
ALTER TABLE payment.payments 
ADD CONSTRAINT ck_payments_status 
CHECK (status IN ('pending', 'submitted', 'succeeded', 'rejected', 'canceled'));
```

#### Валюта
```sql
-- Поддерживаемые валюты
ALTER TABLE payment.payments 
ADD CONSTRAINT ck_payments_currency 
CHECK (currency IN ('RUB', 'USD', 'EUR'));
```

## Мониторинг и метрики

### Ключевые метрики
- Количество платежей по статусам
- Время обработки платежей
- Успешность платежей по провайдерам
- Количество необработанных вебхуков
- Ошибки фискализации чеков

### Алерты
- Большое количество failed платежей
- Зависшие платежи в статусе SUBMITTED
- Накопление необработанных вебхуков
- Ошибки соединения с провайдерами

## Интеграция с провайдерами

### Поддерживаемые провайдеры
- **Tinkoff Acquiring** - интеграция через API
- **Sberbank** - интеграция через API
- **ЮKassa** - интеграция через API
- **Робокасса** - интеграция через API

### Типы событий вебхуков
- `payment.succeeded` - платеж успешно завершен
- `payment.failed` - платеж отклонен
- `payment.canceled` - платеж отменен
- `payment.refunded` - выполнен возврат

## Безопасность

### Валидация вебхуков
- Проверка подписи от провайдера
- Валидация IP адресов источников
- Проверка временных меток

### Защита от атак
- Rate limiting на webhook endpoints
- Идемпотентность для предотвращения дублей
- Логирование всех операций для аудита

Этот модуль обеспечивает надежную и масштабируемую обработку платежей с полной защитой от дублей и комплексным аудитом всех операций.