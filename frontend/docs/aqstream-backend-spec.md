# AquaStream Backend - Полная техническая спецификация v2.0

## Оглавление
1. [Обзор системы](#1-обзор-системы)
2. [Бизнес-требования](#2-бизнес-требования)
3. [Технологический стек](#3-технологический-стек)
4. [Архитектура микросервисов](#4-архитектура-микросервисов)
5. [База данных](#5-база-данных)
6. [Детальная спецификация сервисов](#6-детальная-спецификация-сервисов)
7. [Общая библиотека (backend-common)](#7-общая-библиотека-backend-common)
8. [Безопасность и авторизация](#8-безопасность-и-авторизация)
9. [Интеграции](#9-интеграции)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Инфраструктура](#11-инфраструктура)
12. [Мониторинг и логирование](#12-мониторинг-и-логирование)
13. [Тестирование](#13-тестирование)
14. [API Контракты](#14-api-контракты)
15. [Deployment и DevOps](#15-deployment-и-devops)

---

## 1. Обзор системы

### 1.1 Назначение
AquaStream - платформа-агрегатор для организации и участия в мероприятиях.

### 1.2 Ключевые функции
- **Для участников**: поиск мероприятий, бронирование, оплата, управление участием
- **Для организаторов**: создание компании, публикация событий, управление бронированиями, формирование групп
- **Для администраторов**: управление ролями, модерация контента и платежей

### 1.3 Основные принципы
- Микросервисная архитектура с REST API
- Единая точка входа через API Gateway
- JWT-based авторизация
- PostgreSQL с отдельными схемами для каждого сервиса
- Redis для кэширования и pub/sub
- Уведомления через Telegram

---

## 2. Бизнес-требования

### 2.1 Роли пользователей (RBAC)

| Роль | Права доступа |
|------|--------------|
| **Guest** | Просмотр публичных страниц, регистрация |
| **User** | Профиль, бронирование, оплата, избранное |
| **Organizer** | Все права User + управление компанией, событиями, бронированиями своей компании |
| **Admin** | Полный доступ ко всем данным, управление ролями |

### 2.2 Основные бизнес-процессы

#### 2.2.1 Регистрация и профиль
1. Регистрация через username/password
2. Обязательное заполнение профиля (телефон ИЛИ Telegram) для бронирования
3. Верификация Telegram через бота
4. Восстановление доступа через Telegram

#### 2.2.2 Бронирование мероприятия
```mermaid
stateDiagram-v2
    [*] --> Pending: Создание брони
    Pending --> Confirmed: Подтверждение
    Pending --> Expired: Истечение времени
    Confirmed --> Completed: Событие прошло
    Confirmed --> Cancelled: Отмена
    Confirmed --> NoShow: Неявка
```

#### 2.2.3 Оплата
- **Виджет эквайринга**: YooKassa/CloudPayments/Stripe
- **QR-код**: ручная модерация с загрузкой proof
- Статусы: `unpaid`, `processing`, `partial`, `paid`, `refunded`

#### 2.2.4 Управление группами
- Экипажи (например, для байдарок)
- Размещение (палатки, комнаты)
- Столы (для банкетов)
- Места в транспорте

---

## 3. Технологический стек

### 3.1 Backend
- **Язык**: Java 21 LTS
- **Framework**: Spring Boot 3.2+ (Spring 6.1)
- **Build**: Gradle (Kotlin DSL)
- **Web**: Spring Web MVC, Jackson
- **Security**: Spring Security, JWT (без OAuth2 для простоты)
- **Database**: PostgreSQL 16
- **Migrations**: Liquibase
- **Cache/Queue**: Redis 7
- **Rate Limiting**: Bucket4j
- **Metrics**: Micrometer + Spring Actuator
- **Containerization**: Docker, Docker Compose

### 3.2 Профили окружения
- `dev` - локальная разработка с моками
- `stage` - тестовый стенд
- `prod` - production

---

## 4. Архитектура микросервисов

### 4.1 Список сервисов

| Сервис | Порт | Назначение |
|--------|------|------------|
| backend-gateway | 8080 | API Gateway, маршрутизация, rate limiting |
| backend-user | 8101 | Пользователи, авторизация, профили |
| backend-event | 8102 | События, организаторы, **бронирования** |
| backend-crew | 8103 | Управление группами участников |
| backend-payment | 8104 | Платежи, интеграция с провайдерами |
| backend-notification | 8105 | Telegram-бот, уведомления |
| backend-media | 8106 | Хранение файлов, presigned URLs |

### 4.2 Взаимодействие сервисов

```mermaid
graph TB
    Client[Frontend/Mobile]
    Gateway[API Gateway :8080]
    
    User[User Service :8101]
    Event[Event Service :8102]
    Crew[Crew Service :8103]
    Payment[Payment Service :8104]
    Notification[Notification Service :8105]
    Media[Media Service :8106]
    
    PG[(PostgreSQL)]
    Redis[(Redis)]
    S3[(S3/MinIO)]
    TG[Telegram API]
    Pay[Payment Providers]
    
    Client --> Gateway
    Gateway --> User
    Gateway --> Event
    Gateway --> Crew
    Gateway --> Payment
    Gateway --> Notification
    Gateway --> Media
    
    User --> PG
    Event --> PG
    Crew --> PG
    Payment --> PG
    Notification --> PG
    Media --> PG
    
    User --> Redis
    Event --> Redis
    Payment --> Redis
    Notification --> Redis
    
    Media --> S3
    Notification --> TG
    Payment --> Pay
    
    Event -.->|REST| Payment
    Event -.->|Pub/Sub| Notification
    Payment -.->|Pub/Sub| Notification
    Crew -.->|REST| Event
```

---

## 5. База данных

### 5.1 Структура
- Один инстанс PostgreSQL 16
- Отдельная схема для каждого сервиса
- Liquibase для миграций

### 5.2 Схемы данных

#### 5.2.1 Schema: `user`

```sql
-- users table
CREATE TABLE user.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- profiles table
CREATE TABLE user.profiles (
    user_id UUID PRIMARY KEY REFERENCES user.users(id),
    phone VARCHAR(20),
    telegram VARCHAR(100),
    is_telegram_verified BOOLEAN DEFAULT FALSE,
    extra JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- refresh_sessions table
CREATE TABLE user.refresh_sessions (
    jti VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user.users(id),
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    revoked_at TIMESTAMP
);

-- recovery_codes table
CREATE TABLE user.recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user.users(id),
    code_hash VARCHAR(255) NOT NULL,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- audit_log table
CREATE TABLE user.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(100),
    payload JSONB,
    ip VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.2 Schema: `event`

```sql
-- organizers table
CREATE TABLE event.organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT,
    contacts JSONB DEFAULT '{}',
    brand_color VARCHAR(7),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- events table
CREATE TABLE event.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES event.organizers(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    date_start TIMESTAMP NOT NULL,
    date_end TIMESTAMP,
    location TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    capacity INTEGER NOT NULL,
    available INTEGER NOT NULL,
    cover_url TEXT,
    short_description TEXT,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- bookings table (NEW - объединено с event сервисом)
CREATE TABLE event.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event.events(id),
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    payment_id UUID,
    expires_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    updated_by UUID,
    cancelled_at TIMESTAMP,
    cancelled_by UUID,
    cancellation_reason TEXT
);

-- booking_logs table
CREATE TABLE event.booking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES event.bookings(id),
    action VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    actor_user_id UUID NOT NULL,
    actor_role VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- waitlist table
CREATE TABLE event.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event.events(id),
    user_id UUID NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP,
    notification_expires_at TIMESTAMP
);

-- favorites table
CREATE TABLE event.favorites (
    user_id UUID NOT NULL,
    event_id UUID NOT NULL REFERENCES event.events(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id)
);

-- team_members table
CREATE TABLE event.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES event.organizers(id),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    photo_url TEXT,
    bio TEXT
);

-- faq_items table
CREATE TABLE event.faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES event.organizers(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);
```

#### 5.2.3 Schema: `crew`

```sql
-- crews table
CREATE TABLE crew.crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'crew', 'boat', 'tent', 'table', 'bus'
    capacity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- crew_assignments table
CREATE TABLE crew.crew_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL REFERENCES crew.crews(id),
    user_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    seat_number INTEGER,
    notes TEXT,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID NOT NULL
);

-- team_preferences table
CREATE TABLE crew.team_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    prefers_with_user_ids TEXT[],
    avoids_user_ids TEXT[],
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.4 Schema: `payment`

```sql
-- payments table
CREATE TABLE payment.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    method VARCHAR(20) NOT NULL, -- 'widget', 'qr_manual'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    provider VARCHAR(50),
    provider_payment_id VARCHAR(255),
    provider_payload JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- payment_receipts table
CREATE TABLE payment.payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payment.payments(id),
    proof_url TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    review_comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- webhook_events table
CREATE TABLE payment.webhook_events (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    raw_payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP,
    attempt_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.5 Schema: `notification`

```sql
-- notification_prefs table
CREATE TABLE notification.notification_prefs (
    user_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'telegram',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category, channel)
);

-- telegram_subscriptions table
CREATE TABLE notification.telegram_subscriptions (
    user_id UUID PRIMARY KEY,
    telegram_username VARCHAR(100) NOT NULL,
    telegram_chat_id BIGINT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- notification_outbox table
CREATE TABLE notification.outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'telegram',
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.6 Schema: `media`

```sql
-- files table
CREATE TABLE media.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type VARCHAR(50) NOT NULL,
    owner_id UUID NOT NULL,
    file_key VARCHAR(255) UNIQUE NOT NULL,
    original_name VARCHAR(255),
    content_type VARCHAR(100),
    size_bytes BIGINT,
    checksum VARCHAR(64),
    storage_url TEXT NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Детальная спецификация сервисов

### 6.1 backend-gateway

#### Назначение
- Единая точка входа для всех API запросов
- Маршрутизация запросов к микросервисам
- Rate limiting
- CORS обработка
- Проверка JWT токенов и добавление заголовков авторизации

#### REST API Endpoints

```yaml
# Прокси маршруты
/api/v1/auth/**        → backend-user:8101
/api/v1/users/**       → backend-user:8101
/api/v1/profile/**     → backend-user:8101
/api/v1/organizers/**  → backend-event:8102
/api/v1/events/**      → backend-event:8102
/api/v1/bookings/**    → backend-event:8102
/api/v1/crews/**       → backend-crew:8103
/api/v1/payments/**    → backend-payment:8104
/api/v1/notifications/** → backend-notification:8105
/api/v1/media/**       → backend-media:8106

# Административные endpoints
GET /api/v1/admin/health    # Сводный статус всех сервисов
GET /api/v1/admin/metrics   # Метрики системы
```

#### Конфигурация

```yaml
gateway:
  cors:
    allowed-origins: 
      - https://aquastream.app
      - http://localhost:3000
    allowed-methods: GET, POST, PUT, DELETE, PATCH
    allowed-headers: "*"
  
  rate-limit:
    enabled: true
    default-limit: 60  # запросов в минуту
    auth-endpoints-limit: 10  # для /auth/**
    
  routes:
    - id: user-service
      uri: http://backend-user:8101
      predicates:
        - Path=/api/v1/auth/**, /api/v1/users/**, /api/v1/profile/**
    
    - id: event-service
      uri: http://backend-event:8102
      predicates:
        - Path=/api/v1/organizers/**, /api/v1/events/**, /api/v1/bookings/**
        
security:
  jwt:
    public-key: ${JWT_PUBLIC_KEY}
    issuer: aquastream.app
```

### 6.2 backend-user

#### Назначение
- Регистрация и аутентификация пользователей
- Управление профилями
- Выдача и валидация JWT токенов
- Восстановление доступа через Telegram
- Управление ролями (для админов)

#### REST API Endpoints

```yaml
# Публичные endpoints
POST /api/v1/auth/register
  body: { username, password }
  response: { userId, token, refreshToken }

POST /api/v1/auth/login
  body: { username, password }
  response: { userId, token, refreshToken, role }

POST /api/v1/auth/refresh
  body: { refreshToken }
  response: { token, refreshToken }

POST /api/v1/auth/logout
  headers: Authorization
  response: { success }

# Recovery через Telegram
POST /api/v1/auth/recovery/init
  body: { telegram }
  response: { success, message }

POST /api/v1/auth/recovery/verify
  body: { telegram, code }
  response: { valid, token }

POST /api/v1/auth/recovery/reset
  body: { token, newPassword }
  response: { success }

# Профиль (требует авторизации)
GET /api/v1/profile/me
  headers: Authorization
  response: { userId, username, role, profile }

PUT /api/v1/profile
  headers: Authorization
  body: { phone?, telegram?, extra? }
  response: { profile }

# Telegram verification
POST /api/v1/profile/telegram/link
  headers: Authorization
  body: { telegram }
  response: { verificationUrl }

POST /api/v1/profile/telegram/verify
  body: { userId, telegram, code }
  response: { verified }

# Административные endpoints
GET /api/v1/admin/users
  headers: Authorization (ADMIN)
  query: { page?, size?, role? }
  response: { users[], total }

PUT /api/v1/admin/users/{userId}/role
  headers: Authorization (ADMIN)
  body: { role }
  response: { success }

PUT /api/v1/admin/users/{userId}/status
  headers: Authorization (ADMIN)
  body: { active }
  response: { success }
```

#### Бизнес-логика

```java
@Service
public class AuthService {
    
    public AuthResponse register(RegisterRequest request) {
        // 1. Проверка уникальности username
        // 2. Хеширование пароля (Argon2)
        // 3. Создание пользователя с ролью USER
        // 4. Генерация JWT токенов
        // 5. Создание refresh session
        // 6. Логирование в audit_log
        return new AuthResponse(userId, token, refreshToken);
    }
    
    public AuthResponse login(LoginRequest request) {
        // 1. Поиск пользователя по username
        // 2. Проверка пароля
        // 3. Проверка времени истечения
        if (booking.getExpiresAt() != null && booking.getExpiresAt().isBefore(Instant.now())) {
            throw new ConflictException("Booking has expired");
        }
        
        // 4. Обновление статуса
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedBy(userId);
        bookingRepository.save(booking);
        
        // 5. Логирование
        logBookingChange(booking, BookingStatus.PENDING, BookingStatus.CONFIRMED, userId);
        
        // 6. Уведомление
        redisPublisher.publish("booking.confirmed", booking);
    }
    
    public void processWaitlist(UUID eventId) {
        // 1. Проверка доступных мест
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new NotFoundException("Event not found"));
        
        if (event.getAvailable() <= 0) {
            return;
        }
        
        // 2. Получение первого в очереди
        Optional<Waitlist> next = waitlistRepository.findFirstByEventIdOrderByPriority(eventId);
        
        if (next.isEmpty()) {
            return;
        }
        
        Waitlist waitlistEntry = next.get();
        
        // 3. Отправка уведомления с окном 30 минут
        NotificationRequest notification = NotificationRequest.builder()
            .userId(waitlistEntry.getUserId())
            .category("WAITLIST_AVAILABLE")
            .data(Map.of(
                "eventId", eventId,
                "expiresAt", Instant.now().plus(30, ChronoUnit.MINUTES)
            ))
            .build();
        
        notificationService.send(notification);
        
        // 4. Обновление записи в waitlist
        waitlistEntry.setNotifiedAt(Instant.now());
        waitlistEntry.setNotificationExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
        waitlistRepository.save(waitlistEntry);
    }
}
```

### 6.4 backend-crew

#### Назначение
- Управление группами участников (экипажи, палатки, столы, транспорт)
- Назначение участников в группы
- Учет предпочтений участников

#### REST API Endpoints

```yaml
# Получение информации о группах
GET /api/v1/events/{eventId}/crews
  response: { crews[], types[] }

GET /api/v1/crews/{crewId}
  response: { crew, assignments[] }

# Управление группами (ORGANIZER)
POST /api/v1/events/{eventId}/crews
  headers: Authorization (ORGANIZER)
  body: { name, type, capacity }
  response: { crewId }

PUT /api/v1/crews/{crewId}
  headers: Authorization (ORGANIZER)
  body: { name?, capacity? }
  response: { crew }

DELETE /api/v1/crews/{crewId}
  headers: Authorization (ORGANIZER)
  response: { success }

# Назначение участников (ORGANIZER)
POST /api/v1/crews/{crewId}/assignments
  headers: Authorization (ORGANIZER)
  body: { userId, bookingId, seatNumber? }
  response: { assignmentId }

DELETE /api/v1/crews/assignments/{assignmentId}
  headers: Authorization (ORGANIZER)
  response: { success }

POST /api/v1/crews/assignments/bulk
  headers: Authorization (ORGANIZER)
  body: { assignments[] }
  response: { created[], failed[] }

# Предпочтения участников
PUT /api/v1/events/{eventId}/preferences
  headers: Authorization
  body: { prefersWithUserIds?, avoidsUserIds?, preferences? }
  response: { success }

GET /api/v1/events/{eventId}/preferences
  headers: Authorization
  response: { preferences }

# Аналитика для организатора
GET /api/v1/events/{eventId}/crews/summary
  headers: Authorization (ORGANIZER)
  response: { totalCapacity, assigned, available, byType[] }
```

### 6.5 backend-payment

#### Назначение
- Интеграция с платежными провайдерами
- Обработка вебхуков
- Управление QR-платежами с ручной модерацией

#### REST API Endpoints

```yaml
# Инициализация платежа
POST /api/v1/payments/init
  headers: Authorization
  body: { bookingId, method }
  response: { paymentId, widgetConfig?, qrCode? }

# Статус платежа
GET /api/v1/payments/{paymentId}
  headers: Authorization
  response: { payment, status }

# QR платежи
POST /api/v1/payments/{paymentId}/proof
  headers: Authorization
  body: { proofUrl }
  response: { success }

# Вебхуки провайдеров
POST /api/v1/webhooks/yookassa
  headers: X-Webhook-Signature
  body: { ...yookassaPayload }

POST /api/v1/webhooks/cloudpayments
  headers: Content-HMAC
  body: { ...cloudpaymentsPayload }

POST /api/v1/webhooks/stripe
  headers: Stripe-Signature
  body: { ...stripePayload }

# Модерация QR платежей (ORGANIZER)
GET /api/v1/payments/moderation/queue
  headers: Authorization (ORGANIZER)
  query: { organizerId, status?, page?, size? }
  response: { payments[], total }

PUT /api/v1/payments/{paymentId}/review
  headers: Authorization (ORGANIZER)
  body: { action: 'approve' | 'reject', comment? }
  response: { payment }

# Административные
GET /api/v1/admin/payments
  headers: Authorization (ADMIN)
  query: { from?, to?, status?, method?, page?, size? }
  response: { payments[], total, summary }
```

#### Интеграция с провайдерами

```java
@Service
public class PaymentProviderService {
    
    private final Map<String, PaymentProvider> providers;
    
    public PaymentInitResponse initPayment(Booking booking, PaymentMethod method) {
        switch (method) {
            case WIDGET:
                return initWidgetPayment(booking);
            case QR_MANUAL:
                return initQrPayment(booking);
            default:
                throw new UnsupportedOperationException("Method not supported");
        }
    }
    
    private PaymentInitResponse initWidgetPayment(Booking booking) {
        // 1. Выбор провайдера из конфигурации
        String providerName = environment.getProperty("payment.provider");
        PaymentProvider provider = providers.get(providerName);
        
        // 2. Создание платежа в БД
        Payment payment = new Payment();
        payment.setBookingId(booking.getId());
        payment.setMethod(PaymentMethod.WIDGET);
        payment.setAmount(booking.getAmount());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProvider(providerName);
        
        // 3. Получение конфигурации виджета от провайдера
        WidgetConfig config = provider.createPayment(
            payment.getId(),
            payment.getAmount(),
            "Booking #" + booking.getId()
        );
        
        payment.setProviderPaymentId(config.getPaymentId());
        paymentRepository.save(payment);
        
        return new PaymentInitResponse(payment.getId(), config);
    }
    
    @EventListener
    public void handleWebhook(WebhookEvent event) {
        // 1. Проверка идемпотентности
        if (webhookRepository.existsByIdempotencyKey(event.getIdempotencyKey())) {
            log.info("Duplicate webhook: {}", event.getIdempotencyKey());
            return;
        }
        
        // 2. Сохранение события
        webhookRepository.save(event);
        
        // 3. Обработка в зависимости от провайдера
        PaymentProvider provider = providers.get(event.getProvider());
        PaymentStatus status = provider.processWebhook(event.getPayload());
        
        // 4. Обновление статуса платежа
        Payment payment = paymentRepository.findByProviderPaymentId(event.getPaymentId())
            .orElseThrow(() -> new NotFoundException("Payment not found"));
        
        payment.setStatus(status);
        paymentRepository.save(payment);
        
        // 5. Обновление статуса бронирования
        if (status == PaymentStatus.SUCCEEDED) {
            bookingService.updatePaymentStatus(payment.getBookingId(), "paid");
        }
        
        // 6. Отправка уведомления
        redisPublisher.publish("payment.status.changed", payment);
    }
}
```

### 6.6 backend-notification

#### Назначение
- Telegram бот для уведомлений и верификации
- Управление подписками
- Отправка уведомлений по событиям

#### REST API Endpoints

```yaml
# Telegram webhook
POST /api/v1/notifications/telegram/webhook
  body: { ...telegramUpdate }

# Управление подписками
GET /api/v1/notifications/preferences
  headers: Authorization
  response: { preferences[] }

PUT /api/v1/notifications/preferences
  headers: Authorization
  body: { category, enabled }
  response: { success }

# Внутренние endpoints (для других сервисов)
POST /api/v1/notifications/send
  headers: X-Service-Token
  body: { userId, category, data }
  response: { messageId }

POST /api/v1/notifications/send/bulk
  headers: X-Service-Token
  body: { userIds[], category, data }
  response: { sent[], failed[] }

# Административные
GET /api/v1/admin/notifications/stats
  headers: Authorization (ADMIN)
  response: { sent, pending, failed, byCategory[] }
```

#### Telegram Bot реализация

```java
@Component
public class TelegramBotService {
    
    private final TelegramBot bot;
    
    @PostConstruct
    public void init() {
        // Установка webhook
        SetWebhook webhook = SetWebhook.builder()
            .url(webhookUrl)
            .allowedUpdates(List.of("message", "callback_query"))
            .build();
        bot.execute(webhook);
    }
    
    public void handleUpdate(Update update) {
        if (update.message() != null) {
            handleMessage(update.message());
        } else if (update.callbackQuery() != null) {
            handleCallback(update.callbackQuery());
        }
    }
    
    private void handleMessage(Message message) {
        String text = message.text();
        
        if (text.startsWith("/start")) {
            handleStart(message);
        } else if (text.startsWith("/link")) {
            handleLinkAccount(message);
        } else if (isVerificationCode(text)) {
            handleVerificationCode(message, text);
        }
    }
    
    private void handleStart(Message message) {
        // Проверка параметра deep link
        String[] parts = message.text().split(" ");
        if (parts.length > 1) {
            String linkCode = parts[1];
            linkAccount(message.from(), linkCode);
        } else {
            sendWelcomeMessage(message.chat().id());
        }
    }
    
    private void linkAccount(User telegramUser, String linkCode) {
        // Вызов backend-user для подтверждения линковки
        RestClient.create()
            .post()
            .uri("http://backend-user:8101/api/v1/profile/telegram/verify")
            .body(Map.of(
                "telegram", telegramUser.username(),
                "code", linkCode
            ))
            .retrieve()
            .toBodilessEntity();
        
        // Отправка подтверждения
        SendMessage message = new SendMessage(
            telegramUser.id(),
            "✅ Аккаунт успешно привязан!"
        );
        bot.execute(message);
    }
    
    public void sendNotification(NotificationRequest request) {
        // 1. Получение chat_id из подписки
        TelegramSubscription subscription = subscriptionRepository
            .findByUserId(request.getUserId())
            .orElseThrow(() -> new NotFoundException("Telegram not linked"));
        
        // 2. Формирование сообщения на основе категории
        String message = formatMessage(request.getCategory(), request.getData());
        
        // 3. Отправка
        SendMessage sendMessage = new SendMessage(
            subscription.getChatId(),
            message
        );
        sendMessage.parseMode(ParseMode.HTML);
        
        try {
            bot.execute(sendMessage);
            markAsSent(request);
        } catch (Exception e) {
            markAsFailed(request, e.getMessage());
        }
    }
}
```

### 6.7 backend-media

#### Назначение
- Генерация presigned URLs для загрузки файлов
- Управление файлами (логотипы, фото, proof платежей)
- Автоматическое удаление по истечении срока

#### REST API Endpoints

```yaml
# Получение URL для загрузки
POST /api/v1/media/presign
  headers: Authorization
  body: { purpose, contentType, fileName }
  response: { uploadUrl, fileKey, expiresAt }

# Подтверждение загрузки
POST /api/v1/media/confirm
  headers: Authorization
  body: { fileKey, size, checksum }
  response: { fileUrl }

# Получение файла
GET /api/v1/media/files/{fileKey}
  headers: Authorization
  response: { downloadUrl, expiresAt }

# Удаление файла
DELETE /api/v1/media/files/{fileKey}
  headers: Authorization
  response: { success }

# Административные
GET /api/v1/admin/media/stats
  headers: Authorization (ADMIN)
  response: { totalFiles, totalSize, byType[] }
```

---

## 7. Общая библиотека (backend-common)

### 7.1 Структура пакетов

```
backend-common/
├── src/main/java/app/aquastream/common/
│   ├── dto/                    # Общие DTO
│   │   ├── ErrorResponse.java
│   │   ├── PageResponse.java
│   │   └── ProblemDetails.java
│   ├── exception/               # Исключения
│   │   ├── NotFoundException.java
│   │   ├── ValidationException.java
│   │   ├── ConflictException.java
│   │   └── ForbiddenException.java
│   ├── constant/                # Константы
│   │   ├── UserRole.java
│   │   ├── BookingStatus.java
│   │   ├── PaymentStatus.java
│   │   └── NotificationCategory.java
│   ├── util/                    # Утилиты
│   │   ├── JwtUtil.java
│   │   ├── IdGenerator.java
│   │   └── ValidationUtil.java
│   └── client/                  # REST клиенты
│       ├── UserServiceClient.java
│       ├── EventServiceClient.java
│       └── NotificationServiceClient.java
```

### 7.2 Примеры кода

```java
// ProblemDetails.java (RFC 7807)
@Data
@Builder
public class ProblemDetails {
    private String type;
    private String title;
    private int status;
    private String detail;
    private String instance;
    private String correlationId;
    private Map<String, Object> extensions;
    private List<FieldError> errors;
    
    @Data
    public static class FieldError {
        private String field;
        private String message;
        private String code;
    }
}

// UserRole.java
public enum UserRole {
    GUEST,
    USER,
    ORGANIZER,
    ADMIN;
    
    public boolean hasAccess(UserRole required) {
        return this.ordinal() >= required.ordinal();
    }
}

// BookingStatus.java
public enum BookingStatus {
    PENDING("pending"),
    CONFIRMED("confirmed"),
    CANCELLED("cancelled"),
    COMPLETED("completed"),
    NO_SHOW("no_show"),
    EXPIRED("expired");
    
    private final String value;
    
    BookingStatus(String value) {
        this.value = value;
    }
}

// JwtUtil.java
@Component
public class JwtUtil {
    
    @Value("${security.jwt.secret}")
    private String secret;
    
    public String generateToken(UUID userId, UserRole role) {
        return Jwts.builder()
            .setSubject(userId.toString())
            .claim("role", role.name())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 900000)) // 15 min
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
    
    public Claims validateToken(String token) {
        return Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody();
    }
}
```

---

## 8. Безопасность и авторизация

### 8.1 Схема авторизации

```mermaid
sequenceDiagram
    participant C as Client
    participant G as Gateway
    participant U as User Service
    participant S as Other Service
    
    C->>U: POST /auth/login
    U->>U: Validate credentials
    U->>C: JWT token + refresh
    
    C->>G: GET /api/v1/events
    Note over C,G: Authorization: Bearer {token}
    G->>G: Validate JWT
    G->>S: Forward request
    Note over G,S: Headers: X-User-Id, X-User-Role
    S->>S: Process with user context
    S->>G: Response
    G->>C: Response
```

### 8.2 JWT Structure

```json
{
  "sub": "user-uuid",
  "role": "ORGANIZER",
  "iat": 1704067200,
  "exp": 1704068100,
  "jti": "unique-token-id"
}
```

### 8.3 Security Headers (Gateway)

```yaml
security:
  headers:
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    X-XSS-Protection: "1; mode=block"
    Strict-Transport-Security: "max-age=31536000; includeSubDomains"
    Content-Security-Policy: "default-src 'self'"
```

### 8.4 Rate Limiting

```yaml
rate-limits:
  - endpoint: /api/v1/auth/**
    limit: 10 per minute per IP
  - endpoint: /api/v1/payments/**
    limit: 30 per minute per user
  - endpoint: /**
    limit: 60 per minute per user
```

---

## 9. Интеграции

### 9.1 Платежные провайдеры

#### YooKassa
```java
@Component
public class YooKassaProvider implements PaymentProvider {
    
    @Value("${payment.yookassa.shop-id}")
    private String shopId;
    
    @Value("${payment.yookassa.secret-key}")
    private String secretKey;
    
    public WidgetConfig createPayment(UUID paymentId, BigDecimal amount, String description) {
        // Создание платежа через YooKassa API
        var request = new CreatePaymentRequest()
            .amount(new Amount().value(amount).currency("RUB"))
            .confirmation(new Confirmation().type("embedded"))
            .description(description)
            .metadata(Map.of("paymentId", paymentId.toString()));
        
        var response = yooKassaClient.createPayment(request);
        
        return WidgetConfig.builder()
            .paymentId(response.getId())
            .confirmationToken(response.getConfirmation().getConfirmationToken())
            .build();
    }
}
```

### 9.2 Telegram Bot API

```yaml
telegram:
  bot-token: ${TELEGRAM_BOT_TOKEN}
  webhook-url: https://api.aquastream.app/api/v1/notifications/telegram/webhook
  api-url: https://api.telegram.org
```

### 9.3 S3/MinIO

```yaml
s3:
  endpoint: ${S3_ENDPOINT:http://minio:9000}
  access-key: ${S3_ACCESS_KEY}
  secret-key: ${S3_SECRET_KEY}
  bucket: aquastream-media
  region: us-east-1
```

---

## 10. CI/CD Pipeline

### 10.1 GitHub Actions Workflow

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Cache Gradle packages
        uses: actions/cache@v3
        with:
          path: ~/.gradle/caches
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*') }}
      
      - name: Run tests
        run: ./gradlew test
      
      - name: Run Liquibase validation
        run: ./gradlew liquibaseUpdateSQL
  
  build:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        service: [gateway, user, event, crew, payment, notification, media]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build \
            -t aquastream/backend-${{ matrix.service }}:${{ github.sha }} \
            -f backend-${{ matrix.service }}/Dockerfile \
            .
      
      - name: Push to Registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push aquastream/backend-${{ matrix.service }}:${{ github.sha }}
          docker tag aquastream/backend-${{ matrix.service }}:${{ github.sha }} aquastream/backend-${{ matrix.service }}:latest
          docker push aquastream/backend-${{ matrix.service }}:latest
  
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/aquastream
            docker-compose pull
            docker-compose up -d --no-deps
            docker system prune -f
```

### 10.2 Dockerfile образец

```dockerfile
# backend-event/Dockerfile
FROM gradle:8.5-jdk21 AS builder
WORKDIR /app
COPY backend-common/build.gradle.kts backend-common/
COPY backend-event/build.gradle.kts backend-event/
COPY settings.gradle.kts .
COPY gradle.properties .
RUN gradle dependencies --no-daemon

COPY backend-common/src backend-common/src
COPY backend-event/src backend-event/src
RUN gradle :backend-event:bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app

COPY --from=builder /app/backend-event/build/libs/*.jar app.jar

EXPOSE 8102
ENTRYPOINT ["dumb-init", "java", "-jar", "app.jar"]
```

---

## 11. Инфраструктура

### 11.1 Docker Compose

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: aquastream
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-schemas.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - aquastream-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - aquastream-network

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - aquastream-network

  backend-gateway:
    image: aquastream/backend-gateway:latest
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: ${PROFILE}
      JWT_PUBLIC_KEY: ${JWT_PUBLIC_KEY}
    depends_on:
      - redis
    networks:
      - aquastream-network

  backend-user:
    image: aquastream/backend-user:latest
    ports:
      - "8101:8101"
    environment:
      SPRING_PROFILES_ACTIVE: ${PROFILE}
      DB_HOST: postgres
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
    depends_on:
      - postgres
      - redis
    networks:
      - aquastream-network

  backend-event:
    image: aquastream/backend-event:latest
    ports:
      - "8102:8102"
    environment:
      SPRING_PROFILES_ACTIVE: ${PROFILE}
      DB_HOST: postgres
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    depends_on:
      - postgres
      - redis
    networks:
      - aquastream-network

  # ... остальные сервисы

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  aquastream-network:
    driver: bridge
```

### 11.2 Kubernetes манифесты (для будущего масштабирования)

```yaml
# k8s/backend-event-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-event
  namespace: aquastream
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend-event
  template:
    metadata:
      labels:
        app: backend-event
    spec:
      containers:
      - name: backend-event
        image: aquastream/backend-event:latest
        ports:
        - containerPort: 8102
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8102
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8102
          initialDelaySeconds: 20
          periodSeconds: 5
```

---

## 12. Мониторинг и логирование

### 12.1 Метрики (Micrometer + Redis)

```java
@Component
public class MetricsCollector {
    
    private final MeterRegistry registry;
    private final RedisTemplate<String, String> redis;
    
    @EventListener
    public void onBookingCreated(BookingCreatedEvent event) {
        // Increment counter
        registry.counter("bookings.created", 
            "event_id", event.getEventId().toString(),
            "organizer_id", event.getOrganizerId().toString()
        ).increment();
        
        // Save to Redis time-series
        String key = String.format("metrics:bookings:%s", 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm")));
        redis.opsForValue().increment(key);
        redis.expire(key, Duration.ofDays(2));
    }
}
```

### 12.2 Структурированное логирование

```yaml
# application.yml
logging:
  pattern:
    console: "%d{ISO8601} %highlight(%-5level) [%blue(%t)] %yellow(%C{1}): %msg%n%throwable"
    file: '{"timestamp":"%d{ISO8601}","level":"%level","thread":"%thread","logger":"%logger","message":"%message","correlation_id":"%X{correlationId}","user_id":"%X{userId}"}'
  level:
    app.aquastream: DEBUG
    org.springframework.web: INFO
    org.springframework.security: DEBUG
  file:
    name: /var/log/aquastream/${spring.application.name}.log
    max-size: 100MB
    max-history: 30
```

```java
@Component
public class LoggingInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String correlationId = request.getHeader("X-Correlation-Id");
        if (correlationId == null) {
            correlationId = UUID.randomUUID().toString();
        }
        
        MDC.put("correlationId", correlationId);
        MDC.put("userId", request.getHeader("X-User-Id"));
        MDC.put("method", request.getMethod());
        MDC.put("path", request.getRequestURI());
        
        log.info("Request started");
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                              Object handler, Exception ex) {
        log.info("Request completed with status {}", response.getStatus());
        MDC.clear();
    }
}
```

### 12.3 Health Checks

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(1)) {
                return Health.up()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("schema", conn.getSchema())
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
        return Health.down().build();
    }
}
```

---

## 13. Тестирование

### 13.1 Unit Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class BookingServiceTest {
    
    @MockBean
    private BookingRepository bookingRepository;
    
    @MockBean
    private EventRepository eventRepository;
    
    @Autowired
    private BookingService bookingService;
    
    @Test
    void createBooking_WithAvailableSeats_ShouldSucceed() {
        // Given
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        
        Event event = Event.builder()
            .id(eventId)
            .available(10)
            .price(new BigDecimal("1000"))
            .build();
        
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(bookingRepository.existsActiveBooking(userId, eventId)).thenReturn(false);
        
        // When
        BookingResponse response = bookingService.createBooking(userId, 
            new CreateBookingRequest(eventId));
        
        // Then
        assertNotNull(response);
        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(new BigDecimal("1000"), response.getAmount());
        
        verify(bookingRepository).save(any(Booking.class));
        verify(eventRepository).decrementAvailable(eventId);
    }
    
    @Test
    void createBooking_WithNoSeats_ShouldSuggestWaitlist() {
        // Given
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        
        Event event = Event.builder()
            .id(eventId)
            .available(0)
            .build();
        
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        
        // When/Then
        assertThrows(NoAvailableSeatsException.class, 
            () -> bookingService.createBooking(userId, new CreateBookingRequest(eventId)));
    }
}
```

### 13.2 Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class BookingIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    @WithMockUser(roles = "USER")
    void createBooking_Integration_ShouldWork() throws Exception {
        // Create event first
        mockMvc.perform(post("/api/v1/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "title": "Test Event",
                        "dateStart": "2024-12-01T10:00:00Z",
                        "location": "Test Location",
                        "price": 1000,
                        "capacity": 10
                    }
                    """))
                .andExpect(status().isCreated())
                .andDo(result -> {
                    String eventId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");
                    
                    // Create booking
                    mockMvc.perform(post("/api/v1/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(String.format("""
                                {
                                    "eventId": "%s"
                                }
                                """, eventId)))
                            .andExpect(status().isCreated())
                            .andExpect(jsonPath("$.status").value("PENDING"))
                            .andExpect(jsonPath("$.amount").value(1000));
                });
    }
}
```

### 13.3 Contract Tests

```java
@TestConfiguration
public class ContractTestConfig {
    
    @Bean
    @Primary
    public WireMockServer wireMockServer() {
        WireMockServer server = new WireMockServer(options()
            .port(8089)
            .stubFor(get(urlEqualTo("/api/v1/users/profile"))
                .willReturn(aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("""
                        {
                            "userId": "123e4567-e89b-12d3-a456-426614174000",
                            "phone": "+79001234567",
                            "telegram": "@testuser",
                            "isTelegramVerified": true
                        }
                        """)))
        );
        server.start();
        return server;
    }
}
```

---

## 14. API Контракты

### 14.1 OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: AquaStream Backend API
  version: 2.0.0
  description: API для платформы организации мероприятий

servers:
  - url: https://api.aquastream.app
    description: Production
  - url: https://staging-api.aquastream.app
    description: Staging
  - url: http://localhost:8080
    description: Development

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  schemas:
    Error:
      type: object
      required:
        - type
        - title
        - status
      properties:
        type:
          type: string
          example: "https://aquastream.app/problems/not-found"
        title:
          type: string
          example: "Resource not found"
        status:
          type: integer
          example: 404
        detail:
          type: string
        instance:
          type: string
        correlationId:
          type: string
    
    Booking:
      type: object
      properties:
        id:
          type: string
          format: uuid
        eventId:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        status:
          type: string
          enum: [pending, confirmed, cancelled, completed, no_show, expired]
        amount:
          type: number
          format: decimal
        paymentStatus:
          type: string
          enum: [unpaid, processing, partial, paid, refunded]
        createdAt:
          type: string
          format: date-time
        expiresAt:
          type: string
          format: date-time

paths:
  /api/v1/bookings:
    post:
      summary: Создать бронирование
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - eventId
              properties:
                eventId:
                  type: string
                  format: uuid
                notes:
                  type: string
      responses:
        '201':
          description: Бронирование создано
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Booking'
        '400':
          description: Некорректный запрос
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '409':
          description: Бронирование уже существует
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

### 14.2 Примеры запросов/ответов

#### Создание бронирования
```bash
POST /api/v1/bookings
Authorization: Bearer eyJhbGciOiJIUzUxMi...

{
  "eventId": "550e8400-e29b-41d4-a716-446655440000"
}

Response 201:
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "770e8400-e29b-41d4-a716-446655440002",
  "status": "pending",
  "amount": 5000.00,
  "paymentStatus": "unpaid",
  "createdAt": "2024-01-15T10:00:00Z",
  "expiresAt": "2024-01-15T10:30:00Z"
}
```

#### Ошибка валидации
```bash
Response 400:
{
  "type": "https://aquastream.app/problems/validation-failed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Profile must be completed before booking",
  "instance": "/api/v1/bookings",
  "correlationId": "req-123456",
  "errors": [
    {
      "field": "profile.phone",
      "message": "Phone or Telegram is required",
      "code": "required"
    }
  ]
}
```

---

## 15. Deployment и DevOps

### 15.1 Переменные окружения

```bash
# .env.production
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=aquastream
DB_USER=aquastream_user
DB_PASSWORD=secure_password_here

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_here

# JWT
JWT_SECRET=very_long_secret_key_here
JWT_PUBLIC_KEY=public_key_here

# Telegram
TELEGRAM_BOT_TOKEN=bot_token_here
TELEGRAM_WEBHOOK_URL=https://api.aquastream.app/api/v1/notifications/telegram/webhook

# Payment Providers
YOOKASSA_SHOP_ID=shop_id_here
YOOKASSA_SECRET_KEY=secret_key_here

# S3/MinIO
S3_ENDPOINT=https://s3.aquastream.app
S3_ACCESS_KEY=access_key_here
S3_SECRET_KEY=secret_key_here
S3_BUCKET=aquastream-media

# Application
SPRING_PROFILES_ACTIVE=prod
TZ=Europe/Moscow
```

### 15.2 Backup стратегия

```bash
#!/bin/bash
# backup.sh

# Variables
BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="aquastream"

# Create backup
pg_dump -h postgres -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://aquastream-backups/postgres/

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

# Verify backup
if [ $? -eq 0 ]; then
    echo "Backup successful: backup_$DATE.sql.gz"
else
    echo "Backup failed" | mail -s "Backup Failed" admin@aquastream.app
fi
```

### 15.3 Monitoring скрипты

```bash
#!/bin/bash
# health-check.sh

SERVICES=("gateway:8080" "user:8101" "event:8102" "crew:8103" "payment:8104" "notification:8105" "media:8106")

for SERVICE in "${SERVICES[@]}"; do
    IFS=':' read -r NAME PORT <<< "$SERVICE"
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://backend-$NAME:$PORT/actuator/health)
    
    if [ $STATUS -eq 200 ]; then
        echo "✓ backend-$NAME is healthy"
    else
        echo "✗ backend-$NAME is unhealthy (HTTP $STATUS)"
        # Send alert
        curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage \
            -d "chat_id=$ADMIN_CHAT_ID" \
            -d "text=⚠️ Service backend-$NAME is down!"
    fi
done
```

### 15.4 Процедура развертывания

1. **Подготовка инфраструктуры**
```bash
# Создание директорий
mkdir -p /opt/aquastream/{configs,logs,backups}

# Клонирование репозитория
git clone https://github.com/aquastream/backend.git /opt/aquastream/backend

# Копирование конфигов
cp /opt/aquastream/backend/docker-compose.prod.yml /opt/aquastream/
cp /opt/aquastream/backend/.env.example /opt/aquastream/.env
```

2. **Инициализация БД**
```sql
-- init-schemas.sql
CREATE SCHEMA IF NOT EXISTS "user";
CREATE SCHEMA IF NOT EXISTS event;
CREATE SCHEMA IF NOT EXISTS crew;
CREATE SCHEMA IF NOT EXISTS payment;
CREATE SCHEMA IF NOT EXISTS notification;
CREATE SCHEMA IF NOT EXISTS media;

GRANT ALL PRIVILEGES ON SCHEMA "user" TO aquastream_user;
GRANT ALL PRIVILEGES ON SCHEMA event TO aquastream_user;
GRANT ALL PRIVILEGES ON SCHEMA crew TO aquastream_user;
GRANT ALL PRIVILEGES ON SCHEMA payment TO aquastream_user;
GRANT ALL PRIVILEGES ON SCHEMA notification TO aquastream_user;
GRANT ALL PRIVILEGES ON SCHEMA media TO aquastream_user;
```

3. **Запуск сервисов**
```bash
cd /opt/aquastream
docker-compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f backend-gateway
```

4. **Настройка nginx (reverse proxy)**
```nginx
server {
    listen 443 ssl http2;
    server_name api.aquastream.app;
    
    ssl_certificate /etc/letsencrypt/live/api.aquastream.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.aquastream.app/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for notifications
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
```

---

## 16. Критические сценарии и их обработка

### 16.1 Истечение времени бронирования

```java
@Component
@Slf4j
public class BookingExpirationJob {
    
    @Scheduled(fixedDelay = 60000) // каждую минуту
    public void expireBookings() {
        List<Booking> expired = bookingRepository.findExpiredPendingBookings();
        
        for (Booking booking : expired) {
            try {
                // 1. Изменение статуса
                booking.setStatus(BookingStatus.EXPIRED);
                bookingRepository.save(booking);
                
                // 2. Освобождение места
                eventRepository.incrementAvailable(booking.getEventId());
                
                // 3. Обработка waitlist
                waitlistService.processNextInLine(booking.getEventId());
                
                // 4. Уведомление пользователя
                notificationService.send(NotificationRequest.builder()
                    .userId(booking.getUserId())
                    .category("BOOKING_EXPIRED")
                    .data(Map.of("bookingId", booking.getId()))
                    .build());
                    
                log.info("Expired booking: {}", booking.getId());
            } catch (Exception e) {
                log.error("Failed to expire booking: {}", booking.getId(), e);
            }
        }
    }
}
```

### 16.2 Обработка двойных платежей

```java
@Service
public class PaymentDuplicationHandler {
    
    public void handleDuplicatePayment(Payment duplicate) {
        // 1. Проверка оригинального платежа
        Payment original = paymentRepository.findFirstByBookingIdAndStatus(
            duplicate.getBookingId(), 
            PaymentStatus.SUCCEEDED
        );
        
        if (original != null) {
            // 2. Инициация возврата
            RefundRequest refund = RefundRequest.builder()
                .paymentId(duplicate.getId())
                .amount(duplicate.getAmount())
                .reason("Duplicate payment")
                .build();
            
            paymentProviderService.initiateRefund(refund);
            
            // 3. Уведомление
            notificationService.send(NotificationRequest.builder()
                .userId(duplicate.getUserId())
                .category("PAYMENT_DUPLICATE_REFUND")
                .priority(Priority.HIGH)
                .data(Map.of(
                    "paymentId", duplicate.getId(),
                    "amount", duplicate.getAmount()
                ))
                .build());
            
            // 4. Логирование для аудита
            auditLog.record("DUPLICATE_PAYMENT_DETECTED", duplicate);
        }
    }
}
```

---

## Приложение A: Чек-лист запуска

- [ ] Установлен Docker и Docker Compose
- [ ] Настроены переменные окружения в `.env`
- [ ] Инициализирована база данных
- [ ] Настроен Redis с паролем
- [ ] Создан S3 bucket для файлов
- [ ] Зарегистрирован Telegram бот
- [ ] Настроен webhook для Telegram
- [ ] Получены ключи платежных провайдеров
- [ ] Настроен reverse proxy (nginx)
- [ ] Настроен SSL сертификат
- [ ] Настроены backup задания
- [ ] Запущены health checks
- [ ] Проверены все endpoints
- [ ] Настроен мониторинг

## Приложение B: Команды для разработки

```bash
# Запуск в dev режиме
./gradlew bootRun --args='--spring.profiles.active=dev'

# Запуск тестов
./gradlew test

# Проверка миграций
./gradlew liquibaseUpdateSQL

# Сборка всех сервисов
./gradlew build

# Docker build локально
docker-compose -f docker-compose.dev.yml build

# Просмотр логов конкретного сервиса
docker-compose logs -f backend-event

# Подключение к БД
docker exec -it postgres psql -U aquastream_user -d aquastream

# Очистка Redis
docker exec -it redis redis-cli FLUSHALL

# Генерация JWT для тестов
curl -X POST http://localhost:8101/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

---

**Версия документа:** 2.0.0  
**Дата обновления:** 2024-01-15  
**Автор:** AquaStream Development
        // 4. Генерация JWT токенов
        // 5. Создание refresh session
        // 6. Логирование в audit_log
        return new AuthResponse(userId, token, refreshToken, role);
    }
    
    public void initiateRecovery(String telegram) {
        // 1. Поиск пользователя по telegram
        // 2. Генерация 6-значного кода
        // 3. Сохранение хеша кода с TTL 15 минут
        // 4. Отправка кода через Telegram бота (REST вызов к notification service)
    }
}


### 6.3 backend-event (с функционалом booking)

#### Назначение
- Управление организаторами и их брендами
- CRUD операций для событий
- **Управление бронированиями**
- Лист ожидания
- Избранное

#### REST API Endpoints

```yaml
# Публичные endpoints (без авторизации)
GET /api/v1/organizers
  query: { search?, page?, size? }
  response: { organizers[], total }

GET /api/v1/organizers/{slug}
  response: { organizer, events[] }

GET /api/v1/organizers/{slug}/events
  query: { status?, from?, to?, page?, size? }
  response: { events[], total }

GET /api/v1/organizers/{slug}/team
  response: { teamMembers[] }

GET /api/v1/organizers/{slug}/faq
  response: { faqItems[] }

GET /api/v1/events/{eventId}
  response: { event, organizer, available }

# Endpoints требующие авторизации (USER)
POST /api/v1/events/{eventId}/favorite
  headers: Authorization
  response: { success }

DELETE /api/v1/events/{eventId}/favorite
  headers: Authorization
  response: { success }

GET /api/v1/events/favorites
  headers: Authorization
  response: { events[] }

# Booking endpoints (USER с заполненным профилем)
POST /api/v1/bookings
  headers: Authorization
  body: { eventId, notes? }
  response: { bookingId, status, amount, expiresAt }

GET /api/v1/bookings
  headers: Authorization
  query: { status?, page?, size? }
  response: { bookings[], total }

GET /api/v1/bookings/{bookingId}
  headers: Authorization
  response: { booking, event, payment }

PUT /api/v1/bookings/{bookingId}/confirm
  headers: Authorization
  response: { booking }

PUT /api/v1/bookings/{bookingId}/cancel
  headers: Authorization
  body: { reason? }
  response: { success }

# Waitlist endpoints
POST /api/v1/events/{eventId}/waitlist
  headers: Authorization
  response: { position, estimatedWait }

DELETE /api/v1/events/{eventId}/waitlist
  headers: Authorization
  response: { success }

GET /api/v1/events/{eventId}/waitlist/position
  headers: Authorization
  response: { position, total }

# Organizer endpoints (ORGANIZER role)
POST /api/v1/organizers
  headers: Authorization (ORGANIZER)
  body: { slug, name, description, contacts, logoUrl?, brandColor? }
  response: { organizerId }

PUT /api/v1/organizers/{organizerId}
  headers: Authorization (ORGANIZER)
  body: { name?, description?, contacts?, logoUrl?, brandColor? }
  response: { organizer }

POST /api/v1/organizers/{organizerId}/events
  headers: Authorization (ORGANIZER)
  body: { type, title, dateStart, dateEnd?, location, price, capacity, description }
  response: { eventId }

PUT /api/v1/events/{eventId}
  headers: Authorization (ORGANIZER)
  body: { ...eventData }
  response: { event }

PUT /api/v1/events/{eventId}/publish
  headers: Authorization (ORGANIZER)
  response: { event }

PUT /api/v1/events/{eventId}/archive
  headers: Authorization (ORGANIZER)
  response: { event }

# Управление бронированиями (ORGANIZER)
GET /api/v1/organizers/{organizerId}/bookings
  headers: Authorization (ORGANIZER)
  query: { eventId?, status?, from?, to?, page?, size? }
  response: { bookings[], total }

PUT /api/v1/bookings/{bookingId}/status
  headers: Authorization (ORGANIZER)
  body: { status, reason? }
  response: { booking }

# Admin endpoints
GET /api/v1/admin/events
  headers: Authorization (ADMIN)
  query: { status?, organizerId?, page?, size? }
  response: { events[], total }

GET /api/v1/admin/bookings
  headers: Authorization (ADMIN)
  query: { userId?, eventId?, status?, page?, size? }
  response: { bookings[], total }
```

#### Конфигурация

```yaml
event:
  booking:
    default-expiry-minutes: 30
    waitlist-notification-window-minutes: 30
    auto-expire-enabled: true
  
  organizer:
    max-events-per-organizer: 100
    
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/aquastream
    schema: event
```

#### Бизнес-логика бронирования

```java
@Service
@Transactional
public class BookingService {
    
    public BookingResponse createBooking(UUID userId, CreateBookingRequest request) {
        // 1. Проверка заполненности профиля (phone или telegram)
        UserProfile profile = userService.getProfile(userId);
        if (!profile.isComplete()) {
            throw new ValidationException("Profile must be completed");
        }
        
        // 2. Проверка доступности мест
        Event event = eventRepository.findById(request.getEventId())
            .orElseThrow(() -> new NotFoundException("Event not found"));
        
        if (event.getAvailable() <= 0) {
            // 3. Предложить запись в waitlist
            return suggestWaitlist(userId, event);
        }
        
        // 4. Проверка на дублирование брони
        if (bookingRepository.existsActiveBooking(userId, event.getId())) {
            throw new ConflictException("Booking already exists");
        }
        
        // 5. Создание брони со статусом PENDING
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setEventId(event.getId());
        booking.setStatus(BookingStatus.PENDING);
        booking.setAmount(event.getPrice());
        booking.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
        booking.setCreatedBy(userId);
        
        booking = bookingRepository.save(booking);
        
        // 6. Уменьшение available мест (через trigger или вручную)
        eventRepository.decrementAvailable(event.getId());
        
        // 7. Логирование
        auditLog(userId, "BOOKING_CREATED", booking.getId());
        
        // 8. Отправка уведомления через Redis pub/sub
        redisPublisher.publish("booking.created", booking);
        
        return BookingResponse.from(booking);
    }
    
    public void confirmBooking(UUID bookingId, UUID userId) {
        // 1. Проверка владельца или прав организатора
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking not found"));
        
        if (!booking.getUserId().equals(userId) && !hasOrganizerAccess(userId, booking)) {
            throw new ForbiddenException("Access denied");
        }
        
        // 2. Проверка статуса
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Booking cannot be confirmed");
        }
        
        // 3. Про