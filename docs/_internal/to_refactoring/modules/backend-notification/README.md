# AquaStream Backend Notification Service

Микросервис уведомлений для платформы AquaStream с поддержкой Telegram бота, настроек пользователей, 
Redis Pub/Sub, надежной доставки сообщений и интеллектуальным лимитированием запросов.

## Описание

`backend-notification` предоставляет централизованную систему уведомлений для AquaStream:
- Отправка уведомлений через множество каналов (Telegram, Email, SMS, Push)
- Telegram бот для привязки аккаунтов и управления настройками
- Гибкие настройки уведомлений по категориям и каналам
- Redis Pub/Sub для event-driven архитектуры
- Outbox паттерн для надежной доставки с retry механизмом
- Rate limiting и throttling для предотвращения злоупотреблений
- Mock сервисы для разработки и тестирования
- Поддержка Spring Actuator для мониторинга и health checks

Сервис следует принципам чистой архитектуры и микросервисной модели.

## Архитектура

### Мультимодульная структура

```
backend-notification/
├── backend-notification-api/     # REST контроллеры и DTO
│   ├── controller/              # REST endpoints
│   │   ├── NotificationController       # Отправка уведомлений
│   │   ├── NotificationPrefsController  # Управление настройками
│   │   ├── TelegramWebhookController    # Telegram webhook
│   │   └── mock/                        # Mock контроллеры для dev
│   ├── health/                  # Custom health checks
│   └── resources/              # Профили конфигурации
├── backend-notification-service/ # Бизнес-логика
│   ├── notification/           # Основной сервис уведомлений
│   ├── telegram/               # Telegram бот интеграция
│   ├── prefs/                  # Настройки пользователей
│   ├── user/                   # Интеграция с user-service
│   ├── config/                 # Конфигурация Redis, Telegram
│   └── fixtures/               # Тестовые данные
└── backend-notification-db/     # Слой данных
    ├── entity/                 # JPA Entity классы
    ├── repository/             # Spring Data JPA репозитории
    └── migration/              # Liquibase миграции БД
```

### Основные компоненты

#### 🔔 Система уведомлений
- Многоканальная отправка (EMAIL, SMS, TELEGRAM, PUSH)
- Категории: обязательные и опциональные уведомления
- Outbox паттерн с автоматическими повторными попытками
- Redis Pub/Sub для real-time event propagation

#### 🤖 Telegram бот
- Привязка аккаунтов через deep-link коды
- Обработка команд: /start, /help, /status, /stop, /verify
- Webhook интеграция с проверкой подписей
- Форматирование сообщений с emoji и Markdown
- Throttling для соблюдения Telegram API лимитов

#### ⚙️ Настройки пользователей
- Персональные настройки по категориям и каналам
- Защита обязательных категорий от отключения
- Bulk операции обновления настроек
- Автоматическое создание настроек по умолчанию

#### 🚦 Rate Limiting & Throttling
- Bucket4j алгоритм с Redis backend
- Дифференцированные лимиты по типам endpoint'ов
- Soft throttling для Telegram API (1 msg/sec per chat, 30 msg/sec global)
- Graceful degradation при превышении лимитов

#### 🎭 Mock сервисы
- Эмуляция внешних зависимостей для разработки
- Configurable fixtures и тестовые данные
- Development-only endpoints для отладки

## Доменная модель

### Основные сущности

#### NotificationPrefsEntity - Настройки уведомлений
- **userId** - Идентификатор пользователя
- **category** - Категория уведомления
- **channel** - Канал доставки
- **enabled** - Включено/выключено
- **createdAt/updatedAt** - Временные метки

#### TelegramSubscriptionEntity - Telegram подписки
- **userId** - Идентификатор пользователя
- **telegramChatId** - Chat ID для отправки сообщений
- **telegramUserId** - Telegram User ID
- **telegramUsername** - Username в Telegram
- **linkCode** - Код для привязки аккаунта
- **linkExpiresAt** - Истечение кода привязки
- **verifiedAt** - Время подтверждения привязки
- **isActive** - Активность подписки

#### OutboxEntity - Outbox паттерн
- **id** - Уникальный идентификатор
- **userId** - Получатель уведомления
- **category** - Категория уведомления
- **payload** - JSON данные сообщения
- **status** - PENDING, SENT, FAILED, SKIPPED
- **attempts** - Количество попыток доставки
- **scheduledAt** - Время следующей попытки
- **sentAt** - Время успешной доставки

### Категории уведомлений

#### Обязательные (Required)
Всегда включены, не могут быть отключены пользователем:
- **BOOKING_CONFIRMED** - Подтверждение бронирования
- **PAYMENT_STATUS** - Статус платежа (успех/неудача)
- **EVENT_REMINDER** - Напоминание о мероприятии

#### Опциональные (Optional)
Пользователь может управлять этими настройками:
- **WAITLIST_AVAILABLE** - Освободилось место в событии
- **EVENT_NEWS** - Новости и обновления от организаторов

### Каналы доставки

- **EMAIL** - Email уведомления
- **SMS** - SMS сообщения  
- **TELEGRAM** - Telegram бот
- **PUSH** - Push уведомления в приложении

### Бизнес-правила

#### Настройки по умолчанию
```
Обязательные категории - все каналы включены:
BOOKING_CONFIRMED + (EMAIL, SMS, TELEGRAM, PUSH) = enabled
PAYMENT_STATUS + (EMAIL, SMS, TELEGRAM, PUSH) = enabled
EVENT_REMINDER + (EMAIL, SMS, TELEGRAM, PUSH) = enabled

Опциональные категории:
WAITLIST_AVAILABLE + (EMAIL, TELEGRAM) = enabled
EVENT_NEWS + (EMAIL) = enabled
```

#### Защита обязательных категорий
- API блокирует попытки отключить required категории
- При отключении всех каналов, обязательные уведомления все равно отправляются
- Уведомления о защите отправляются в логи

#### Telegram привязка
1. Пользователь получает ссылку с кодом: `https://t.me/aquastream_bot?start=ABC123`
2. При `/start ABC123` бот проверяет код через user-service
3. Система привязывает `chat_id` к пользователю
4. Устанавливается `verified_at` и `is_active = true`

## API Endpoints

### Отправка уведомлений

#### `POST /api/v1/notify/send`
Внутренний endpoint для отправки уведомлений другими сервисами

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "category": "BOOKING_CONFIRMED",
  "title": "Booking Confirmed",
  "message": "Your booking has been confirmed",
  "metadata": {
    "bookingId": "12345",
    "eventId": "67890"
  },
  "channels": ["TELEGRAM", "EMAIL"]
}
```

**Response:**
```json
{
  "success": true,
  "notificationId": "notif-uuid-123",
  "sentChannels": ["TELEGRAM"],
  "failedChannels": [],
  "skippedChannels": ["EMAIL"],
  "errors": []
}
```

### Управление настройками

#### `GET /api/v1/notify/prefs`
Получение настроек пользователя

**Headers:**
- `X-User-Id: 550e8400-e29b-41d4-a716-446655440000`

**Response:**
```json
[
  {
    "category": "BOOKING_CONFIRMED",
    "channel": "TELEGRAM", 
    "enabled": true,
    "required": true
  },
  {
    "category": "EVENT_NEWS",
    "channel": "EMAIL",
    "enabled": false,
    "required": false
  }
]
```

#### `PUT /api/v1/notify/prefs`
Обновление настроек пользователя

**Request:**
```json
{
  "preferences": [
    {
      "category": "EVENT_NEWS",
      "channel": "TELEGRAM", 
      "enabled": true
    },
    {
      "category": "WAITLIST_AVAILABLE",
      "channel": "SMS",
      "enabled": false
    }
  ]
}
```

#### `POST /api/v1/notify/prefs/reset`
Сброс настроек к значениям по умолчанию

### Telegram Webhook

#### `POST /api/v1/notify/telegram/webhook`
Webhook для получения обновлений от Telegram

**Headers:**
- `X-Telegram-Bot-Api-Secret-Token: webhook-secret`

**Обрабатываемые команды:**
- `/start` - приветствие и привязка аккаунта
- `/start ABC123` - привязка с кодом
- `/help` - справка по командам  
- `/status` - статус привязки аккаунта
- `/stop` - отключение уведомлений
- `/verify ABC123` - альтернативный способ привязки

### Development endpoints

#### `POST /api/v1/dev/telegram/test-webhook`
Тестирование webhook с mock данными (только dev/test)

#### `POST /api/v1/dev/telegram/test-message`
Отправка тестового сообщения в Telegram чат

**Параметры:**
- `chatId` - ID чата
- `message` - текст сообщения

## Использование

### Подключение

```gradle
dependencies {
    implementation project(':backend-notification:backend-notification-api')
    implementation project(':backend-notification:backend-notification-service')  
    implementation project(':backend-notification:backend-notification-db')
}
```

### Конфигурация

```yaml
server:
  port: 8105

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
    username: aquastream_user
    password: ${DB_PASSWORD}
  
  liquibase:
    change-log: classpath:migration/liquibase/master.xml
    default-schema: notification
    
  redis:
    host: localhost
    port: 6379
    password: ${REDIS_PASSWORD:}

app:
  telegram:
    bot:
      token: ${TELEGRAM_BOT_TOKEN:dev-token}
      webhook-url: https://api.aquastream.app/api/v1/notify/telegram/webhook
      webhook-secret: ${TELEGRAM_WEBHOOK_SECRET:dev-secret}
      enabled: true
      
  # Rate limiting
  rate-limit:
    login:
      capacity: 100
      refill-tokens: 10
      refill-period: PT10M
    recovery:
      capacity: 30
      refill-tokens: 1
      refill-period: PT30M
    default:
      capacity: 2000
      refill-tokens: 2000
      refill-period: PT1M
```

### Примеры использования

#### Отправка уведомления о бронировании

```java
@Autowired
private NotificationService notificationService;

NotificationRequest request = NotificationRequest.builder()
    .userId(userId)
    .category("BOOKING_CONFIRMED")
    .title("Бронирование подтверждено")
    .message("Ваше бронирование на событие '{eventTitle}' подтверждено")
    .metadata(Map.of(
        "bookingId", bookingId,
        "eventId", eventId,
        "eventTitle", "Турнир по теннису"
    ))
    .build();

NotificationResponse response = notificationService.sendNotification(request);
```

#### Обновление настроек пользователя

```java
@Autowired
private NotificationPrefsService prefsService;

UpdatePrefsRequest request = UpdatePrefsRequest.builder()
    .preferences(List.of(
        PreferenceUpdate.builder()
            .category("EVENT_NEWS")
            .channel("TELEGRAM")
            .enabled(true)
            .build()
    ))
    .build();

prefsService.updatePreferences(userId, request);
```

#### Привязка Telegram аккаунта

```java
@Autowired
private TelegramBotService telegramBotService;

// Генерация link code
String linkCode = userLinkService.generateLinkCode(userId);
String deepLink = "https://t.me/aquastream_bot?start=" + linkCode;

// При получении /start команды
telegramBotService.handleStartCommand(chatId, userId, linkCode);
```

## База данных

### Схема: notification

#### Основные таблицы
- **notification_prefs** - Настройки уведомлений пользователей
- **telegram_subscriptions** - Привязка Telegram аккаунтов
- **outbox** - Outbox паттерн для надежной доставки

#### Индексы для производительности
- **notification_prefs**: по пользователю и категории
- **telegram_subscriptions**: по user_id, chat_id (активные подписки)
- **outbox**: по статусу и времени планирования для background jobs

#### Ограничения целостности
- Cascade delete при удалении пользователя
- Уникальность привязки Telegram (один chat_id = один пользователь)
- Валидация enum значений для статусов и категорий
- Проверка логики дат (scheduled_at >= created_at)

## Redis интеграция

### Pub/Sub каналы

#### Notification Events
- `notify:all` - Все уведомления
- `notify:booking_confirmed` - Подтверждения бронирований
- `notify:payment_status` - Обновления статуса платежей
- `notify:event_reminder` - Напоминания о событиях  
- `notify:waitlist_available` - Уведомления waitlist
- `notify:event_news` - Новости событий
- `notify:user:{userId}` - Пользовательские уведомления

#### Status Events
- `notify:status` - Статусы доставки уведомлений
- `notify:prefs` - Изменения настроек пользователей

### Throttling
- Redis хранит состояние rate limiting для Telegram API
- TTL ключи для sliding window алгоритма
- Глобальные и per-chat лимиты

### Конфигурация Redis

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    database: 0
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
```

## Rate Limiting

### Лимиты по типам endpoints

#### Login endpoints (`/login`, `/auth`, `/signin`)
- **Development**: 20 requests per 5 minutes
- **Staging**: 50 requests per 5 minutes
- **Production**: 100 requests per 10 minutes

#### Recovery endpoints (`/recovery`, `/reset`, `/forgot`)
- **Development**: 10 requests per 15 minutes
- **Staging**: 20 requests per 15 minutes  
- **Production**: 30 requests per 30 minutes

#### Default endpoints (все остальные)
- **Development**: 100 requests per minute
- **Staging**: 500 requests per minute
- **Production**: 2000 requests per minute

### HTTP ответы при превышении лимитов

**429 Too Many Requests:**
```json
{
  "type": "https://api.aquastream.org/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit exceeded for login requests. Please retry after 60 seconds.",
  "limitType": "login",
  "retryAfter": 60,
  "instance": "/api/v1/auth/login",
  "timestamp": "2025-08-20T10:30:00Z"
}
```

**Headers:**
```
Retry-After: 60
X-RateLimit-Remaining: 0
Content-Type: application/problem+json
```

## Telegram Bot

### Поддерживаемые команды

#### `/start` и `/start ABC123`
- Приветственное сообщение
- Привязка аккаунта через deep-link код

#### `/help`
- Справка по всем доступным командам
- Инструкция по привязке аккаунта

#### `/status`
- Проверка статуса привязки Telegram аккаунта
- Информация о настройках уведомлений

#### `/stop`
- Отключение всех Telegram уведомлений
- Деактивация подписки

#### `/verify ABC123`
- Альтернативный способ привязки аккаунта

### Типы уведомлений

#### Подтверждение бронирования
```
✅ Бронирование подтверждено

Ваше бронирование на событие "Турнир по теннису" подтверждено.

Дата: 25 августа 2024
Время: 10:00
Место: Спортивный центр "Олимп"

Ссылка: https://aquastream.app/events/123
```

#### Статус платежа
```
💳 Платеж успешно обработан

Платеж на сумму 5000 ₽ успешно обработан.

Услуга: Участие в турнире по теннису
ID платежа: PAY-123456789

Чек будет отправлен на указанную почту.
```

#### Освобождение места
```
🎯 Место освободилось!

В событии "Турнир по теннису" освободилось место.

У вас есть 30 минут для подтверждения участия.

Подтвердить: https://aquastream.app/waitlist/confirm/ABC123
```

### Безопасность webhook
- Проверка `X-Telegram-Bot-Api-Secret-Token`
- Rate limiting на webhook endpoint
- Валидация структуры входящих данных
- Санитизация пользовательского ввода

## Мониторинг и Health Checks

### Spring Actuator endpoints

#### `/actuator/health`
Общий статус здоровья приложения

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "redis": {
      "status": "UP", 
      "details": {
        "version": "7.0.0"
      }
    },
    "telegramService": {
      "status": "UP",
      "details": {
        "mode": "webhook",
        "status": "Telegram webhook is active"
      }
    }
  }
}
```

#### `/actuator/health/liveness`
Kubernetes liveness probe

#### `/actuator/health/readiness`
Kubernetes readiness probe

#### `/actuator/info`
Информация о приложении с версией и git деталями

#### `/actuator/metrics`
Application метрики

### Ключевые метрики для мониторинга

- Количество pending сообщений в outbox
- Процент успешной доставки по каналам
- Количество активных Telegram подписок
- Среднее время обработки outbox
- Rate limiting violations по endpoint типам
- Telegram API throttling события
- Redis connection health

### Prometheus метрики

- `notification_sent_total` - общее количество отправленных уведомлений
- `notification_delivery_duration_seconds` - время доставки по каналам
- `telegram_throttling_active` - активные throttling события
- `outbox_pending_messages` - количество pending сообщений
- `rate_limit_exceeded_total` - превышения rate limits

## Обработка ошибок

### Стандартные HTTP коды

- **400 Bad Request** - Некорректные данные запроса
- **401 Unauthorized** - Требуется аутентификация  
- **403 Forbidden** - Недостаточно прав (для protected endpoints)
- **404 Not Found** - Ресурс не найден
- **429 Too Many Requests** - Превышение rate limits
- **500 Internal Server Error** - Внутренние ошибки сервиса

### Формат ошибок (RFC 7807)

```json
{
  "type": "https://api.aquastream.org/errors/notification-delivery-failed",
  "title": "Notification Delivery Failed",
  "status": 500,
  "detail": "Failed to deliver notification to Telegram: API rate limit exceeded",
  "instance": "/api/v1/notify/send",
  "timestamp": "2025-08-20T10:30:00Z",
  "correlationId": "req-abc123",
  "metadata": {
    "notificationId": "notif-123",
    "channel": "TELEGRAM",
    "retryCount": 3
  }
}
```

### Graceful degradation

- Redis publish failures не блокируют доставку уведомлений
- Throttling failures используют fail-open стратегию
- Ошибки отдельных каналов не блокируют другие каналы
- Mock services активируются при недоступности внешних зависимостей

## Тестирование

### Unit тесты

```bash
./gradlew backend-notification:backend-notification-service:test
```

### Integration тесты

```bash
./gradlew backend-notification:backend-notification-api:test
```

### Mock сервисы для разработки

#### Telegram Mock
- Эмуляция Telegram Bot API
- Configurable responses и задержки
- Logging всех mock interactions

#### User Service Mock  
- Имитация user-service endpoints
- Тестовые пользователи и коды привязки
- Валидация auth headers

### Тестовые данные

Модуль поддерживает загрузку fixtures через FixtureLoader:
- Тестовые пользователи с настройками
- Pre-configured Telegram подписки
- Sample notification templates

## Производительность

### Оптимизации
- Составные индексы для частых запросов
- Batch операции для массовых обновлений настроек
- Connection pooling для Redis и PostgreSQL
- Асинхронная обработка outbox через scheduled tasks

### Кэширование
- Redis кэширование для user preferences
- Throttling state в Redis с TTL
- Template caching для повторяющихся сообщений

### Масштабирование
- Stateless сервис поддерживает горизонтальное масштабирование
- Redis Pub/Sub для координации между instances
- Database sharding по user_id при необходимости
- Load balancing с health checks

## Безопасность

### Авторизация
- X-User-Id header для внутренних API calls
- Telegram webhook signature verification
- Rate limiting для предотвращения abuse

### Валидация
- Входные данные валидируются через Bean Validation
- Санитизация пользовательского ввода
- Проверка business rules для настроек

### Защита данных
- Sensitive данные (tokens, secrets) в environment variables
- Audit trail всех изменений настроек
- TTL для temporary данных (link codes, throttling state)

## Развертывание

### Docker

```dockerfile
FROM openjdk:21-jre-slim
COPY backend-notification-api/build/libs/*.jar app.jar
EXPOSE 8105
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment переменные

```bash
SPRING_PROFILES_ACTIVE=prod
DB_HOST=postgres
DB_PASSWORD=secure_password
REDIS_HOST=redis
REDIS_PASSWORD=redis_password
TELEGRAM_BOT_TOKEN=telegram_bot_token
TELEGRAM_WEBHOOK_SECRET=webhook_secret
RATE_LIMIT_ENABLED=true
```

### Docker Compose

```yaml
services:
  notification:
    image: aquastream/backend-notification:vX.Y.Z
    ports:
      - "8105:8105"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    depends_on:
      - postgres
      - redis
```

## Зависимости

### Основные
- Spring Boot 3.x
- Spring Data JPA
- Spring Data Redis
- PostgreSQL 15+
- Liquibase
- Bucket4j (Rate Limiting)

### Опциональные
- Micrometer (метрики)
- Spring Actuator (health checks)
- TestContainers (тестирование)
