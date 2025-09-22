# AquaStream Backend - Техническая спецификация

## Оглавление
1. [Обзор системы](#1-обзор-системы)
2. [Архитектура](#2-архитектура)
3. [База данных](#3-база-данных)
4. [Спецификация сервисов](#4-спецификация-сервисов)
5. [Безопасность](#5-безопасность)
6. [Интеграции](#6-интеграции)
7. [Инфраструктура](#7-инфраструктура)
8. [API Reference](#8-api-reference)

---

## 1. Обзор системы {#1-обзор-системы}

**AquaStream** - платформа-агрегатор мероприятий.

### 1.1 Ключевые особенности
- Микросервисная архитектура (8 сервисов)
- JWT авторизация
- Все уведомления через Telegram бота

### 1.2 Роли (RBAC)

| Роль | Права |
|------|-------|
| **Guest** | Просмотр публичных страниц |
| **User** | Профиль, бронирование, оплата |
| **Organizer** | + управление событиями и бронями компании |
| **Admin** | Полный доступ ко всем данным |

### 1.3 Основные бизнес-процессы
1. **Регистрация** → заполнение профиля (телефон/Telegram обязательно)
2. **Бронирование** → pending → confirmed → completed
3. **Оплата** → виджет/QR → модерация → уведомление
4. **Группировка** → экипажи/палатки/прочее
5. **Waitlist** → FIFO с окном 30 минут

---

## 2. Архитектура {#2-архитектура}

### 2.1 Технологический стек
- Java 21, Spring Boot 3.2+, Gradle (Kotlin DSL)
- PostgreSQL 16, Redis 7, MinIO/S3
- Docker, Docker Compose
- Liquibase, Bucket4j, Micrometer

### 2.2 Микросервисы

| Сервис | Порт | Назначение |
|--------|------|------------|
| backend-gateway | 8080 | API Gateway, JWT проверка, rate limiting, health aggregation |
| backend-user | 8101 | Авторизация, профили, роли |
| backend-event | 8102 | События, организаторы, **БРОНИРОВАНИЯ** |
| backend-crew | 8103 | Управление группами |
| backend-payment | 8104 | Платежи, вебхуки |
| backend-notification | 8105 | Telegram бот, уведомления |
| backend-media | 8106 | Файлы, presigned URLs |

**Инфраструктурные компоненты:**
- **backend-common** - общая Java библиотека (DTO, константы, утилиты)
- **backend-infra** - инфраструктурный репозиторий (Docker, скрипты, конфиги)

### 2.3 Схема авторизации
```
1. Client → POST /auth/login → backend-user → JWT token
2. Client → Request with Bearer token → Gateway
3. Gateway validates JWT → adds headers: X-User-Id, X-User-Role
4. Gateway → forwards to service (services trust gateway)
```

### 2.4 Мультимодульная структура

Каждый сервис разделен на модули для четкого разделения ответственности:

#### backend-user
```
backend-user/
├── backend-user-api/          # REST controllers, DTO
│   └── src/main/java/app/aquastream/user/api/
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── ProfileController.java
│       │   └── AdminController.java
│       ├── dto/
│       │   ├── request/
│       │   └── response/
│       └── exception/
├── backend-user-service/       # Business logic
│   └── src/main/java/app/aquastream/user/service/
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── UserService.java
│       │   └── TelegramService.java
│       ├── mapper/
│       └── util/
├── backend-user-db/           # Database layer
│   └── src/main/java/app/aquastream/user/db/
│       ├── entity/
│       │   ├── User.java
│       │   ├── Profile.java
│       │   └── RefreshSession.java
│       ├── repository/
│       └── migration/
│           └── liquibase/
└── build.gradle.kts
```

#### backend-event
```
backend-event/
├── backend-event-api/
│   └── src/main/java/app/aquastream/event/api/
│       ├── controller/
│       │   ├── EventController.java
│       │   ├── OrganizerController.java
│       │   └── BookingController.java
│       ├── dto/
│       │   ├── EventDto.java
│       │   └── BookingDto.java
│       └── validation/
├── backend-event-service/
│   └── src/main/java/app/aquastream/event/service/
│       ├── service/
│       │   ├── EventService.java
│       │   ├── BookingService.java
│       │   └── WaitlistService.java
│       ├── scheduler/
│       │   └── BookingExpirationJob.java
│       └── event/
├── backend-event-db/
│   └── src/main/java/app/aquastream/event/db/
│       ├── entity/
│       │   ├── Event.java
│       │   ├── Booking.java
│       │   └── Waitlist.java
│       └── repository/
└── build.gradle.kts
```

#### backend-payment
```
backend-payment/
├── backend-payment-api/
│   └── src/main/java/app/aquastream/payment/api/
│       ├── controller/
│       │   ├── PaymentController.java
│       │   └── WebhookController.java
│       └── dto/
├── backend-payment-service/
│   └── src/main/java/app/aquastream/payment/service/
│       ├── service/
│       │   └── PaymentService.java
│       ├── provider/
│       │   ├── PaymentProvider.java
│       │   ├── YooKassaProvider.java
│       │   └── CloudPaymentsProvider.java
│       └── webhook/
├── backend-payment-db/
│   └── src/main/java/app/aquastream/payment/db/
│       ├── entity/
│       └── repository/
└── build.gradle.kts
```

#### backend-notification
```
backend-notification/
├── backend-notification-api/
│   └── src/main/java/app/aquastream/notification/api/
│       ├── controller/
│       │   ├── NotificationController.java
│       │   └── TelegramWebhookController.java
│       └── dto/
├── backend-notification-service/
│   └── src/main/java/app/aquastream/notification/service/
│       ├── service/
│       │   └── NotificationService.java
│       ├── telegram/
│       │   ├── TelegramBotService.java
│       │   └── TelegramMessageBuilder.java
│       └── template/
├── backend-notification-db/
│   └── src/main/java/app/aquastream/notification/db/
│       ├── entity/
│       └── repository/
└── build.gradle.kts
```

#### backend-gateway (простая структура - один модуль)
```
backend-gateway/
└── src/main/java/app/aquastream/gateway/
    ├── config/
    │   ├── SecurityConfig.java
    │   ├── RateLimitConfig.java
    │   └── CorsConfig.java
    ├── filter/
    │   ├── JwtAuthFilter.java
    │   └── RateLimitFilter.java
    ├── service/
    │   └── HealthAggregationService.java
    └── GatewayApplication.java
```

#### backend-crew (простая структура - один модуль)
```
backend-crew/
└── src/main/java/app/aquastream/crew/
    ├── controller/
    ├── service/
    ├── entity/
    └── repository/
```

#### backend-media (простая структура - один модуль)
```
backend-media/
└── src/main/java/app/aquastream/media/
    ├── controller/
    ├── service/
    │   └── S3Service.java
    ├── config/
    └── MediaApplication.java
```

### 2.5 backend-common (общая библиотека)
Общая библиотека для всех сервисов:
- DTO, константы (UserRole, BookingStatus, PaymentStatus)
- Problem Details (RFC 7807)
- Утилиты (JwtUtil, IdGenerator)
- REST клиенты для межсервисного взаимодействия

---

## 3. База данных {#3-база-данных}

PostgreSQL 16 с отдельными схемами:

### 3.1 Schema: user
```sql
users (id, username, password_hash, role, active)
profiles (user_id, phone, telegram, is_telegram_verified, extra)
refresh_sessions (jti, user_id, issued_at, expires_at, revoked_at)
recovery_codes (user_id, code_hash, used_at, expires_at)
audit_log (id, actor_user_id, action, target_type, target_id, payload)
```

### 3.2 Schema: event
```sql
organizers (id, slug, name, logo_url, description, contacts, brand_color)
events (id, organizer_id, type, title, date_start, date_end, location, price, capacity, available, status)
bookings (id, event_id, user_id, status, amount, payment_status, payment_id, expires_at, created_by)
booking_logs (id, booking_id, action, old_value, new_value, actor_user_id)
waitlist (id, event_id, user_id, priority, notified_at, notification_expires_at)
favorites (user_id, event_id)
team_members (id, organizer_id, name, role, photo_url, bio)
faq_items (id, organizer_id, question, answer)
```

### 3.3 Schema: crew
```sql
crews (id, event_id, name, type, capacity)
crew_assignments (id, crew_id, user_id, booking_id, seat_number, assigned_by)
team_preferences (user_id, event_id, prefers_with_user_ids[], avoids_user_ids[])
```

### 3.4 Schema: payment
```sql
payments (id, booking_id, method, amount, currency, status, provider, provider_payment_id)
payment_receipts (id, payment_id, proof_url, reviewed_by, reviewed_at)
webhook_events (idempotency_key, provider, raw_payload, status, processed_at)
```

### 3.5 Schema: notification
```sql
notification_prefs (user_id, category, channel, enabled)
telegram_subscriptions (user_id, telegram_username, telegram_chat_id, verified_at)
outbox (id, user_id, category, payload, status, attempts, sent_at)
```

### 3.6 Schema: media
```sql
files (id, owner_type, owner_id, file_key, content_type, size_bytes, storage_url, expires_at)
```

---

## 4. Спецификация сервисов {#4-спецификация-сервисов}

### 4.1 backend-gateway

**Структура:** Простая (один модуль)

**Функции:**
- Проверка JWT токенов
- Rate limiting (Bucket4j)
- CORS обработка
- Маршрутизация запросов
- Агрегация health статусов всех сервисов

**Health Aggregation:**
```java
@RestController
@RequestMapping("/api/v1/admin")
public class HealthController {
    
    @GetMapping("/health")
    public HealthStatus getSystemHealth() {
        // Опрос всех сервисов
        // Возврат агрегированного статуса
    }
}
```

**Конфигурация:**
```yaml
gateway:
  cors:
    allowed-origins: [https://aquastream.app]
  rate-limit:
    default: 60/min
    auth-endpoints: 10/min
```

### 4.2 backend-user

**Функции:**
- Регистрация/логин/logout
- JWT токены (access: 15 мин, refresh: 30 дней)
- Управление профилями
- Восстановление через Telegram
- RBAC

**Ключевая логика:**
```java
public AuthResponse register(RegisterRequest request) {
    // 1. Проверка уникальности username
    // 2. Хеширование пароля (Argon2)
    // 3. Создание пользователя с ролью USER
    // 4. Генерация JWT
    // 5. Audit log
}
```

### 4.3 backend-event (с бронированиями)

**Функции:**
- CRUD организаторов и событий
- Управление бронированиями
- Waitlist FIFO
- Избранное

**Бизнес-логика бронирования:**
```java
@Transactional
public BookingResponse createBooking(UUID userId, CreateBookingRequest request) {
    // 1. Проверка заполненности профиля
    UserProfile profile = userService.getProfile(userId);
    if (!profile.hasPhoneOrTelegram()) {
        throw new ValidationException("Profile incomplete");
    }
    
    // 2. Проверка доступности мест
    Event event = eventRepository.findById(request.getEventId());
    if (event.getAvailable() <= 0) {
        return suggestWaitlist(userId, event);
    }
    
    // 3. Проверка дублирования
    if (bookingRepository.existsActiveBooking(userId, event.getId())) {
        throw new ConflictException("Booking exists");
    }
    
    // 4. Создание брони
    Booking booking = new Booking();
    booking.setStatus(BookingStatus.PENDING);
    booking.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
    
    // 5. Уменьшение мест (через trigger или вручную)
    eventRepository.decrementAvailable(event.getId());
    
    // 6. Pub/Sub уведомление
    redisPublisher.publish("booking.created", booking);
    
    return BookingResponse.from(booking);
}

@Scheduled(fixedDelay = 60000)
public void expireBookings() {
    // Автоматическое истечение pending броней
    // Освобождение мест и обработка waitlist
}
```

**Статусы бронирования:**
- `pending` → `confirmed` → `completed`
- `pending` → `expired` (auto after 30 min)
- `confirmed` → `cancelled`/`no_show`

### 4.4 backend-crew

**Функции:**
- Управление группами (экипажи, палатки, столы, транспорт)
- Назначение участников
- Учет предпочтений

**Типы групп:**
```java
enum CrewType {
    CREW,     // Экипаж байдарки
    TENT,     // Палатка
    TABLE,    // Стол на банкете
    BUS       // Место в автобусе
}
```

### 4.5 backend-payment

**Функции:**
- Интеграция с провайдерами (YooKassa, CloudPayments, Stripe)
- Обработка вебхуков с идемпотентностью
- QR платежи с модерацией

**Процесс оплаты:**
```java
public PaymentInitResponse initPayment(Booking booking, PaymentMethod method) {
    switch (method) {
        case WIDGET:
            // Создание платежа через провайдера
            // Возврат конфига для виджета
        case QR_MANUAL:
            // Генерация QR кода
            // Ожидание загрузки proof
    }
}

@EventListener
public void handleWebhook(WebhookEvent event) {
    // 1. Проверка идемпотентности
    // 2. Валидация подписи
    // 3. Обновление статуса платежа
    // 4. Обновление статуса брони
    // 5. Уведомление через pub/sub
}
```

### 4.6 backend-notification

**Функции:**
- Telegram бот (webhook)
- Управление подписками
- Отправка уведомлений
- Верификация аккаунтов

**Telegram Bot:**
```java
public void handleUpdate(Update update) {
    if (update.message().text().startsWith("/start")) {
        // Deep link для верификации
        String linkCode = extractLinkCode(update.message().text());
        linkAccount(update.message().from(), linkCode);
    }
}

public void sendNotification(NotificationRequest request) {
    // 1. Получение chat_id из подписки
    // 2. Формирование сообщения по категории
    // 3. Отправка через Bot API
    // 4. Обработка ошибок и retry
}
```

**Категории уведомлений:**
- Обязательные: `BOOKING_CONFIRMED`, `PAYMENT_STATUS`, `EVENT_REMINDER`
- Опциональные: `WAITLIST_AVAILABLE`, `EVENT_NEWS`

### 4.7 backend-media

**Функции:**
- Генерация presigned URLs
- Управление файлами в S3/MinIO
- Автоудаление по retention (90 дней для payment proofs)

### 4.8 backend-infra (НЕ сервис)

**Назначение:** Инфраструктурный репозиторий с конфигурациями и скриптами

**Содержимое:**
- Docker Compose файлы для всех окружений
- Скрипты deployment и rollback
- Backup скрипты (выполняются cron на хост-машине)
- Health check скрипты
- Конфигурации nginx, SSL
- CI/CD pipelines
- Документация по развертыванию

**Scheduled Jobs (запускаются через cron на хост-машине):**
```bash
# /etc/crontab
0 2 * * * /opt/aquastream/backend-infra/scripts/backup/backup-postgres.sh
0 */6 * * * /opt/aquastream/backend-infra/scripts/backup/backup-redis.sh
*/5 * * * * /opt/aquastream/backend-infra/scripts/monitoring/health-check.sh
0 4 * * * /opt/aquastream/backend-infra/scripts/cleanup/cleanup-old-data.sh
```

**Health monitoring (health-check.sh):**
```bash
#!/bin/bash
SERVICES=("gateway:8080" "user:8101" "event:8102" "crew:8103" "payment:8104" "notification:8105" "media:8106")

for SERVICE in "${SERVICES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://backend-$SERVICE/actuator/health)
    if [ $STATUS -ne 200 ]; then
        # Alert via Telegram
        curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage \
            -d "chat_id=$ADMIN_CHAT_ID" \
            -d "text=⚠️ Service backend-$SERVICE is down!"
    fi
done
```

---

## 5. Безопасность {#5-безопасность}

### 5.1 Авторизация
- JWT токены (HS512)
- Access token: 15 минут
- Refresh token: 30 дней (rotation по jti)
- Пароли: Argon2id

### 5.2 JWT Structure
```json
{
  "sub": "user-uuid",
  "role": "ORGANIZER",
  "iat": 1704067200,
  "exp": 1704068100,
  "jti": "unique-token-id"
}
```

### 5.3 Rate Limiting
```yaml
/api/v1/auth/*: 10 req/min per IP
/api/v1/payments/*: 30 req/min per user
/api/v1/*: 60 req/min per user
```

### 5.4 Security Headers
```yaml
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
```

---

## 6. Интеграции {#6-интеграции}

### 6.1 Telegram Bot API
```yaml
bot-token: ${TELEGRAM_BOT_TOKEN}
webhook-url: https://api.aquastream.app/api/v1/notifications/telegram/webhook
```

**Команды бота:**
- `/start <code>` - линковка аккаунта
- `/help` - помощь
- `/status` - статус броней

### 6.2 Платежные провайдеры

**YooKassa:**
```java
@Component
public class YooKassaProvider implements PaymentProvider {
    public WidgetConfig createPayment(UUID paymentId, BigDecimal amount) {
        // API call to YooKassa
        // Return widget configuration
    }
    
    public boolean validateWebhook(String signature, String body) {
        // HMAC-SHA256 validation
    }
}
```

### 6.3 S3/MinIO
```yaml
endpoint: ${S3_ENDPOINT:http://minio:9000}
bucket: aquastream-media
presigned-url-ttl: 3600
```

---

## 7. Инфраструктура {#7-инфраструктура}

### 7.1 Docker Compose
```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: aquastream
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-schemas.sql:/docker-entrypoint-initdb.d/init.sql
    
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    
  backend-gateway:
    image: aquastream/backend-gateway:latest
    ports: ["8080:8080"]
    depends_on: [redis]
    
  backend-user:
    image: aquastream/backend-user:latest
    ports: ["8101:8101"]
    depends_on: [postgres, redis]
    
  # ... остальные сервисы

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 7.2 CI/CD (GitHub Actions)
```yaml
name: Backend CI/CD
on:
  push:
    branches: [main]
jobs:
  test:
    steps:
      - Run tests
      - Liquibase validation
  build:
    strategy:
      matrix:
        service: [gateway, user, event, crew, payment, notification, media, infra]
    steps:
      - Build Docker image
      - Push to registry
  deploy:
    steps:
      - SSH to server
      - docker-compose pull
      - docker-compose up -d
```

### 7.3 Deployment
```bash
# Порядок миграций (важно!)
1. backend-user
2. backend-event (включая bookings)
3. backend-crew
4. backend-payment
5. backend-notification
6. backend-media

# Запуск
docker-compose -f docker-compose.prod.yml up -d

# Health check
curl http://localhost:8080/actuator/health
```

### 7.4 Мониторинг
- Health: `/actuator/health`
- Метрики: Micrometer → Redis time-series
- Логи: JSON с correlationId
- Alerts: Telegram to admins

### 7.5 Backup Strategy
```bash
# PostgreSQL: daily at 02:00
pg_dump | gzip > backup_$(date +%Y%m%d).sql.gz

# Retention
- Daily: 7 days
- Weekly: 4 weeks  
- Monthly: 3 months

# Redis: every 6 hours (optional)
redis-cli BGSAVE
```

---

## 8. API Reference {#8-api-reference}

### 8.1 Authentication
```yaml
POST /api/v1/auth/register
  body: {username, password}
  response: {userId, token, refreshToken}

POST /api/v1/auth/login
  body: {username, password}
  response: {userId, token, refreshToken, role}

POST /api/v1/auth/refresh
  body: {refreshToken}
  response: {token, refreshToken}

POST /api/v1/auth/recovery/init
  body: {telegram}
  response: {success}
```

### 8.2 Profile
```yaml
GET /api/v1/profile/me
  headers: Authorization
  response: {userId, username, role, profile}

PUT /api/v1/profile
  headers: Authorization
  body: {phone?, telegram?}
  response: {profile}

POST /api/v1/profile/telegram/link
  headers: Authorization
  response: {verificationUrl}
```

### 8.3 Events (Public)
```yaml
GET /api/v1/organizers
  query: {search?, page?, size?}
  response: {organizers[], total}

GET /api/v1/organizers/{slug}
  response: {organizer, events[]}

GET /api/v1/events/{eventId}
  response: {event, organizer, available}
```

### 8.4 Bookings
```yaml
POST /api/v1/bookings
  headers: Authorization
  body: {eventId}
  response: {bookingId, status, amount, expiresAt}

GET /api/v1/bookings
  headers: Authorization
  query: {status?, page?, size?}
  response: {bookings[], total}

PUT /api/v1/bookings/{bookingId}/confirm
  headers: Authorization
  response: {booking}

PUT /api/v1/bookings/{bookingId}/cancel
  headers: Authorization
  body: {reason?}
  response: {success}
```

### 8.5 Organizer Panel
```yaml
GET /api/v1/organizers/{organizerId}/bookings
  headers: Authorization (ORGANIZER)
  query: {eventId?, status?}
  response: {bookings[], total}

PUT /api/v1/bookings/{bookingId}/status
  headers: Authorization (ORGANIZER)
  body: {status, reason?}
  response: {booking}

POST /api/v1/organizers/{organizerId}/events
  headers: Authorization (ORGANIZER)
  body: {type, title, dateStart, location, price, capacity}
  response: {eventId}
```

### 8.6 Payments
```yaml
POST /api/v1/payments/init
  headers: Authorization
  body: {bookingId, method}
  response: {paymentId, widgetConfig?, qrCode?}

POST /api/v1/payments/{paymentId}/proof
  headers: Authorization
  body: {proofUrl}
  response: {success}

PUT /api/v1/payments/{paymentId}/review
  headers: Authorization (ORGANIZER)
  body: {action: 'approve'|'reject', comment?}
  response: {payment}

POST /api/v1/webhooks/{provider}
  headers: X-Webhook-Signature
  body: {providerPayload}
```

### 8.7 Crews
```yaml
GET /api/v1/events/{eventId}/crews
  response: {crews[], types[]}

POST /api/v1/crews/{crewId}/assignments
  headers: Authorization (ORGANIZER)
  body: {userId, bookingId, seatNumber?}
  response: {assignmentId}

PUT /api/v1/events/{eventId}/preferences
  headers: Authorization
  body: {prefersWithUserIds?, avoidsUserIds?}
  response: {success}
```

### 8.8 Error Responses (RFC 7807)
```json
{
  "type": "https://aquastream.app/problems/validation-failed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Profile must be completed",
  "instance": "/api/v1/bookings",
  "correlationId": "req-123456",
  "errors": [
    {
      "field": "profile.phone",
      "message": "Phone or Telegram required",
      "code": "required"
    }
  ]
}
```

### 8.9 Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Business logic error |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Приложения

### A. Переменные окружения
```bash
# Database
DB_HOST=postgres
DB_USER=aquastream
DB_PASSWORD=***

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=***

# JWT
JWT_SECRET=***
JWT_PUBLIC_KEY=***

# Telegram
TELEGRAM_BOT_TOKEN=***

# Payments
YOOKASSA_SHOP_ID=***
YOOKASSA_SECRET_KEY=***

# S3
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=***
S3_SECRET_KEY=***

# Application
SPRING_PROFILES_ACTIVE=prod
```

### B. Критические настройки
```yaml
timeouts:
  booking.expiry: 30 minutes
  waitlist.window: 30 minutes
  jwt.access: 15 minutes
  jwt.refresh: 30 days
  presigned.url: 1 hour

retention:
  payment.proofs: 90 days
  logs: 30 days
  backups.daily: 7 days

limits:
  max.file.size: 5MB
  max.events.per.organizer: 100
  max.bookings.per.user: 10
```

### C. Команды разработки
```bash
# Local development
./gradlew bootRun --args='--spring.profiles.active=dev'

# Run tests
./gradlew test

# Check migrations
./gradlew liquibaseUpdateSQL

# Docker build
docker-compose -f docker-compose.dev.yml build

# Connect to DB
docker exec -it postgres psql -U aquastream -d aquastream

# View logs
docker-compose logs -f backend-event

# Generate JWT for testing
curl -X POST http://localhost:8101/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### D. Чек-лист запуска
- [ ] Docker и Docker Compose установлены
- [ ] `.env` файл настроен
- [ ] PostgreSQL схемы созданы
- [ ] Redis с паролем
- [ ] MinIO bucket создан
- [ ] Telegram бот зарегистрирован
- [ ] Webhook настроен
- [ ] Платежные ключи получены
- [ ] SSL сертификат установлен
- [ ] Backup задания настроены
- [ ] Health checks работают