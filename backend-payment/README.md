# AquaStream Backend Payment Service

Микросервис обработки платежей для платформы AquaStream с поддержкой идемпотентности, интеграции с множественными провайдерами, верификации вебхуков и модерации чеков.

## Описание

`backend-payment` предоставляет централизованную систему обработки платежей для AquaStream:
- Инициализация платежей с поддержкой множественных провайдеров
- Обработка вебхуков с верификацией подписей и защитой от дублей
- Модерация чеков для подтверждения оплаты
- Идемпотентность всех операций
- Фискализация и интеграция с ОФД
- Автоматические уведомления о статусах платежей
- Комплексный аудит всех финансовых операций

Сервис следует принципам чистой архитектуры и микросервисной модели.

## Архитектура

### Мультимодульная структура

```
backend-payment/
├── backend-payment-api/        # REST контроллеры и DTO
│   ├── controller/            # REST endpoints
│   │   ├── PaymentController  # Инициализация платежей, вебхуки
│   │   └── ReceiptController  # Управление чеками
│   ├── config/               # Глобальная обработка ошибок
│   └── resources/            # Конфигурация API слоя
├── backend-payment-service/    # Бизнес-логика
│   ├── service/              # Основные сервисы
│   │   ├── PaymentService    # Управление платежами
│   │   └── EventServiceClient # Интеграция с event-service
│   ├── provider/             # Интеграция с провайдерами
│   │   ├── PaymentProvider   # Абстрактный провайдер
│   │   └── TinkoffPaymentProvider # Tinkoff Acquiring
│   ├── webhook/              # Обработка вебхуков
│   ├── receipt/              # Модерация чеков
│   ├── config/               # Конфигурация и свойства
│   └── dto/                  # Data Transfer Objects
└── backend-payment-db/         # Слой данных
    ├── entity/               # JPA Entity классы
    ├── repository/           # Spring Data JPA репозитории
    └── migration/            # Liquibase миграции БД
```

### Основные компоненты

#### 💳 Система платежей
- Мульти-провайдерная архитектура (Tinkoff, Sberbank, YooKassa)
- Widget-based интеграция с различными способами оплаты
- Идемпотентность через уникальные ключи
- Автоматические переходы статусов и timeout обработка

#### 🔐 Обработка вебхуков
- Верификация подписей для каждого провайдера
- Защита от дублей через уникальные индексы
- Retry механизм для неудачных обработок
- Логирование всех webhook событий с полными данными

#### 📋 Модерация чеков
- Ручная модерация пользовательских чеков
- Автоматические уведомления о результатах
- Интеграция с фискальными службами (ОФД)
- Хранение фискальных данных чеков

#### 🔄 Идемпотентность и аудит
- Уникальные ключи для платежей и вебхуков
- Полное логирование изменений статусов
- История retry попыток
- IP-адреса и User-Agent для безопасности

## Доменная модель

### Основные сущности

#### PaymentEntity - Основная сущность платежа
- **id** - UUID первичный ключ
- **userId** - Пользователь-плательщик
- **eventId** - Связанное событие (опционально)
- **amountKopecks** - Сумма в копейках
- **currency** - Валюта платежа (RUB, USD, EUR)
- **status** - Текущий статус платежа
- **providerName** - Имя провайдера
- **idempotencyKey** - Ключ идемпотентности
- **metadata** - JSONB дополнительные данные
- **createdAt/updatedAt** - Временные метки

#### PaymentReceiptEntity - Фискальные чеки
- **paymentId** - Ссылка на платеж
- **receiptType** - Тип чека (payment, refund, correction)
- **receiptData** - JSONB структурированные данные
- **fiscalReceiptNumber** - Номер фискального чека
- **ofdReceiptUrl** - Ссылка на чек в ОФД
- **status** - Статус обработки чека

#### WebhookEventEntity - События вебхуков
- **providerName** - Провайдер-источник
- **providerEventId** - ID события у провайдера
- **eventType** - Тип события
- **rawPayload** - JSONB полные данные вебхука
- **idempotencyKey** - Уникальный ключ события
- **status** - Статус обработки
- **processingAttempts** - Количество попыток

### Статусы платежей

#### PENDING
- Платеж создан, ожидает отправки провайдеру
- Возможные переходы: SUBMITTED, CANCELED

#### SUBMITTED  
- Отправлен провайдеру, ожидает обработки
- Возможные переходы: SUCCEEDED, REJECTED, CANCELED

#### SUCCEEDED
- Успешно завершен (финальный статус)

#### REJECTED
- Отклонен провайдером (финальный статус)

#### CANCELED
- Отменен пользователем или системой (финальный статус)

### Диаграмма переходов статусов

```
PENDING ──┬── SUBMITTED ──┬── SUCCEEDED
          │                ├── REJECTED
          │                └── CANCELED
          └── CANCELED
```

### Статусы чеков

- **PENDING** - Ожидает модерации
- **SENT** - Отправлен в ОФД
- **REGISTERED** - Зарегистрирован в ОФД  
- **FAILED** - Ошибка фискализации

### Бизнес-правила

#### Идемпотентность платежей
```
Ключ = provider_name + user_id + event_id + amount + timestamp_minute
```

#### Идемпотентность вебхуков
```
Ключ = provider_name + provider_event_id + SHA256(payload)
```

#### Ограничения сумм
- Минимальная сумма: 1 рубль (100 копеек)
- Максимальная сумма: 1,000,000 рублей
- Поддерживаемые валюты: RUB, USD, EUR

## API Endpoints

### Инициализация платежей

#### `POST /api/v1/payments/{bookingId}/init`
Создание платежа и получение конфигурации виджета

**Request:**
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
  "metadata": {
    "booking_type": "event",
    "participants": 2
  }
}
```

**Response (201 Created):**
```json
{
  "paymentId": "987fcdeb-51d2-4c3a-8b45-123456789abc",
  "providerName": "tinkoff",
  "status": "PENDING",
  "widget": {
    "type": "redirect",
    "paymentUrl": "https://securepay.tinkoff.ru/v2/Init",
    "config": {
      "terminal_key": "TinkoffBankTest",
      "order_id": "order_1234567890",
      "amount": 500000,
      "currency": "RUB"
    },
    "style": {
      "theme": "light",
      "language": "ru"
    }
  },
  "expiresAt": "2024-08-17T15:30:00Z"
}
```

### Обработка вебхуков

#### `POST /api/v1/payments/webhook/{provider}`
Обработка вебхуков от платежных провайдеров

**Поддерживаемые провайдеры:** `tinkoff`, `sber`, `yookassa`

**Headers:**
- `X-Api-Signature-Sha256` - Подпись вебхука (для Tinkoff)
- `Content-Type: application/json`

**Tinkoff Webhook Request:**
```json
{
  "TerminalKey": "TinkoffBankTest",
  "OrderId": "order_1234567890",
  "PaymentId": "12345678",
  "Status": "CONFIRMED",
  "Amount": 500000,
  "Token": "a1b2c3d4e5f6..."
}
```

### Управление чеками

#### `POST /api/v1/payments/{paymentId}/receipt`
Отправка чека на модерацию

**Request:**
```json
{
  "receiptImageUrl": "https://example.com/receipts/receipt_123.jpg",
  "receiptText": "Чек об оплате на сумму 5000 рублей",
  "notes": "Оплата произведена картой через терминал",
  "submittedBy": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "receipt_type": "terminal",
    "location": "Москва"
  }
}
```

#### `POST /api/v1/payments/receipts/{receiptId}/moderate`
Модерация чека (админский endpoint)

**Request:**
```json
{
  "approved": true,
  "notes": "Чек соответствует всем требованиям",
  "moderatorId": "11223344-5566-7788-9900-aabbccddeeff"
}
```

## Использование

### Подключение

```gradle
dependencies {
    implementation project(':backend-payment:backend-payment-api')
    implementation project(':backend-payment:backend-payment-service')  
    implementation project(':backend-payment:backend-payment-db')
}
```

### Конфигурация

```yaml
server:
  port: 8084

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
    username: aquastream_user
    password: ${DB_PASSWORD}
  
  liquibase:
    change-log: classpath:migration/liquibase/master.xml
    default-schema: payment

app:
  payment:
    providers:
      tinkoff:
        enabled: true
        terminal-key: ${TINKOFF_TERMINAL_KEY}
        secret-key: ${TINKOFF_SECRET_KEY}
        api-url: https://securepay.tinkoff.ru/v2/
        
    limits:
      min-amount-kopecks: 100    # 1 рубль
      max-amount-kopecks: 100000000  # 1 млн рублей
      
    timeouts:
      payment-expiry: PT30M      # 30 минут
      webhook-retry: PT5M        # 5 минут между retry
```

### Примеры использования

#### Инициализация платежа

```java
@Autowired
private PaymentService paymentService;

PaymentInitRequest request = PaymentInitRequest.builder()
    .userId(userId)
    .eventId(eventId)
    .amount(BigDecimal.valueOf(5000))
    .currency("RUB")
    .description("Оплата участия в турнире")
    .customerEmail("user@example.com")
    .returnUrl("https://example.com/success")
    .metadata(Map.of("type", "event_payment"))
    .build();

PaymentInitResponse response = paymentService.initializePayment(bookingId, request);
```

#### Обработка вебхука

```java
@PostMapping("/webhook/tinkoff")
public ResponseEntity<Map<String, String>> processTinkoffWebhook(
        @RequestBody Map<String, Object> payload,
        HttpServletRequest request) {
    
    WebhookRequest webhook = WebhookRequest.builder()
        .providerName("tinkoff")
        .payload(payload)
        .signature(request.getHeader("X-Api-Signature-Sha256"))
        .build();
    
    paymentService.processWebhook("tinkoff", webhook);
    return ResponseEntity.ok(Map.of("status", "success"));
}
```

## База данных

### Схема: payment

#### Основные таблицы
- **payments** - Основная таблица платежей
- **payment_receipts** - Фискальные чеки и документы
- **webhook_events** - События вебхуков от провайдеров
- **payment_status_log** - Аудит изменений статусов
- **payment_retries** - История retry попыток

#### Индексы для производительности
- **payments**: по пользователю, событию, статусу, провайдеру
- **webhook_events**: по провайдеру и идентификатору события
- **payment_receipts**: по платежу и статусу

#### Уникальные ограничения
- Идемпотентность платежей: `(provider_name, idempotency_key)`
- Уникальность вебхуков: `(provider_name, provider_event_id)`
- ID платежей провайдера: `(provider_name, provider_payment_id)`

### Миграции

#### 0001_create_schema.sql
```sql
-- Создание схемы payment
CREATE SCHEMA IF NOT EXISTS payment;
```

#### 0002_create_tables.sql
```sql
-- Создание основных таблиц с поддержкой JSONB
CREATE TABLE payment.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount_kopecks BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### 0003_indexes_constraints.sql
```sql
-- Создание индексов и ограничений
CREATE UNIQUE INDEX ix_payments_idempotency_key 
ON payment.payments (provider_name, idempotency_key);
```

## Интеграция с провайдерами

### Поддерживаемые провайдеры

#### Tinkoff Acquiring
- **API URL**: https://securepay.tinkoff.ru/v2/
- **Методы**: Init, Confirm, Cancel, GetState
- **Webhook верификация**: HMAC-SHA256

#### Sberbank
- **API URL**: https://securepayments.sberbank.ru/
- **Методы**: register.do, getOrderStatus.do
- **Webhook верификация**: SHA-256 checksum

#### YooKassa (Яндекс.Касса)
- **API URL**: https://api.yookassa.ru/v3/
- **Методы**: payments, refunds
- **Webhook верификация**: HMAC-SHA256

### Типы событий вебхуков

- **payment.succeeded** - Платеж успешно завершен
- **payment.failed** - Платеж отклонен
- **payment.canceled** - Платеж отменен
- **payment.refunded** - Выполнен возврат

## Безопасность

### Верификация вебхуков

#### Tinkoff
```java
String expectedSignature = HMAC_SHA256(webhookBody, secretKey);
boolean valid = expectedSignature.equals(receivedSignature);
```

#### Sberbank  
```java
String expectedChecksum = SHA256(params + secretKey);
boolean valid = expectedChecksum.equals(receivedChecksum);
```

### Защита от атак

- **Rate limiting** на webhook endpoints
- **IP whitelist** для провайдеров
- **Идемпотентность** для предотвращения дублей
- **Аудит логи** всех операций
- **Валидация подписей** всех вебхуков

### Конфиденциальность

- Токены и ключи в environment variables
- Маскирование номеров карт в логах
- TTL для временных данных
- Шифрование sensitive полей

## Мониторинг и метрики

### Ключевые метрики
- Количество платежей по статусам и провайдерам
- Время обработки платежей
- Процент успешных платежей
- Количество необработанных вебхуков
- Ошибки интеграции с провайдерами

### Алерты
- Превышение времени обработки
- Высокий процент отклоненных платежей
- Накопление необработанных вебхуков
- Ошибки верификации подписей

### Prometheus метрики
- `payment_total` - общее количество платежей
- `payment_duration_seconds` - время обработки
- `webhook_processing_duration_seconds` - время обработки вебхуков
- `payment_provider_errors_total` - ошибки провайдеров

## Обработка ошибок

### Стандартные HTTP коды

- **400 Bad Request** - Некорректные данные запроса
- **401 Unauthorized** - Неверная подпись вебхука
- **404 Not Found** - Платеж не найден
- **409 Conflict** - Дубликат платежа/вебхука
- **503 Service Unavailable** - Провайдер недоступен

### Формат ошибок (RFC 7807)

```json
{
  "type": "https://api.aquastream.org/errors/payment-provider-unavailable",
  "title": "Payment Provider Unavailable",
  "status": 503,
  "detail": "Tinkoff payment provider is currently unavailable",
  "instance": "/api/v1/payments/123/init",
  "timestamp": "2025-08-20T10:30:00Z",
  "metadata": {
    "provider": "tinkoff",
    "paymentId": "pay-123",
    "retryAfter": 300
  }
}
```

### Retry стратегии

- **Платежи**: Exponential backoff с максимум 3 попытки
- **Вебхуки**: Fixed interval retry каждые 5 минут
- **Провайдеры**: Circuit breaker с health checks

## Тестирование

### Unit тесты

```bash
./gradlew backend-payment:backend-payment-service:test
```

### Integration тесты

```bash
./gradlew backend-payment:backend-payment-api:test
```

### Тестовые данные

#### Mock провайдеры
- Эмуляция всех поддерживаемых провайдеров
- Configurable responses и задержки
- Различные сценарии успеха и ошибок

#### Тестовые платежи
- Различные суммы и валюты
- Успешные и неуспешные сценарии
- Edge cases для идемпотентности

## Производительность

### Оптимизации
- Составные индексы для частых запросов
- Batch обработка вебхуков
- Connection pooling для внешних API
- Асинхронная обработка уведомлений

### Кэширование
- Конфигурации провайдеров в памяти
- Результаты верификации подписей (короткий TTL)
- Метаданные часто используемых платежей

### Масштабирование
- Stateless сервис поддерживает горизонтальное масштабирование
- Database connection pooling
- Load balancing с health checks
- Horizontal pod autoscaling в Kubernetes

## Развертывание

### Docker

```dockerfile
FROM openjdk:21-jre-slim
COPY backend-payment-api/build/libs/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment переменные

```bash
SPRING_PROFILES_ACTIVE=prod
DB_HOST=postgres
DB_PASSWORD=secure_password
TINKOFF_TERMINAL_KEY=terminal_key
TINKOFF_SECRET_KEY=secret_key
SBER_USERNAME=sber_username
SBER_PASSWORD=sber_password
YOOKASSA_SHOP_ID=shop_id
YOOKASSA_SECRET_KEY=secret_key
```

### Docker Compose

```yaml
services:
  payment:
    image: aquastream/backend-payment:latest
    ports:
      - "8084:8084"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=postgres
      - TINKOFF_TERMINAL_KEY=${TINKOFF_TERMINAL_KEY}
    depends_on:
      - postgres
```

## Зависимости

### Основные
- Spring Boot 3.x
- Spring Data JPA  
- PostgreSQL 15+
- Liquibase
- Jackson (JSON processing)

### Опциональные
- Micrometer (метрики)
- Spring Actuator (health checks)
- TestContainers (тестирование)
- WireMock (mock провайдеры)

## Roadmap

### Планируемые улучшения
- Поддержка дополнительных провайдеров (Robokassa, CloudPayments)
- Автоматическая фискализация через 54-ФЗ
- Subscription billing и рекуррентные платежи
- Fraud detection и risk scoring
- Real-time analytics dashboard