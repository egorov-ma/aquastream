# Event Service

## Обзор

**Порт**: 8102
**База данных**: PostgreSQL схема `event`
**Назначение**: Управление событиями, организаторами, бронированиями и waitlist

Event Service - центральный сервис платформы, отвечающий за создание и управление мероприятиями, обработку бронирований с автоматическим истечением, управление очередью ожидания и интеграцию с payment сервисом.

## Структура модуля

```
backend-event/
├── backend-event-api/       # REST API endpoints (порт 8102)
├── backend-event-service/   # Бизнес-логика сервиса
└── backend-event-db/        # Entities и repositories (схема event)
```

## Основные сущности

### 1. Organizer (Организатор)

Бренд-страница организатора мероприятий.

**Поля**:
```java
UUID id
String slug                    // Уникальный slug (URL-friendly идентификатор)
String name                    // Название организации
String logoUrl                 // Ссылка на логотип
String description             // Описание организатора
Map<String, Object> contacts   // Контакты (JSONB: email, phone, telegram, website)
String brandColor              // Фирменный цвет (#HEX)
Instant createdAt
Instant updatedAt
```

**Отношения**:
- `OneToMany` → EventEntity (события организатора)
- `OneToMany` → TeamMemberEntity (команда организатора)
- `OneToMany` → FaqItemEntity (FAQ организатора)

### 2. Event (Событие)

Мероприятие с управлением вместимостью и доступными местами.

**Поля**:
```java
UUID id
String organizerSlug           // Ссылка на организатора
String type                    // Тип события (сплав, регата, кемпинг)
String title                   // Название события
Instant dateStart              // Дата начала
Instant dateEnd                // Дата окончания
Map<String, Object> location   // Локация (JSONB: address, city, coordinates)
BigDecimal price               // Цена участия (null для бесплатных)
Integer capacity               // Максимальная вместимость
Integer available              // Доступные места
String status                  // DRAFT | PUBLISHED | COMPLETED | CANCELLED
String[] tags                  // Теги для поиска
String description             // Полное описание
Instant createdAt
Instant updatedAt
```

**Статусы**:
- `DRAFT` - Черновик (не виден публично)
- `PUBLISHED` - Опубликовано (доступно для бронирования)
- `COMPLETED` - Завершено
- `CANCELLED` - Отменено

**Отношения**:
- `ManyToOne` → OrganizerEntity
- `OneToMany` → BookingEntity (бронирования)
- `OneToMany` → WaitlistEntity (очередь ожидания)

### 3. Booking (Бронирование)

Бронирование участника на событие с автоматическим истечением.

**Поля**:
```java
UUID id
UUID eventId                   // ID события
UUID userId                    // ID участника
BookingStatus status           // Статус бронирования
BigDecimal amount              // Сумма (зафиксирована при создании)
PaymentStatus paymentStatus    // Статус оплаты
UUID paymentId                 // ID платежа (если есть)
Instant expiresAt              // Время истечения (для PENDING)
UUID createdBy                 // Кто создал бронь
Instant createdAt
Instant updatedAt
```

**BookingStatus enum**:
```java
public enum BookingStatus {
    PENDING,      // Ожидает оплаты (30 минут)
    CONFIRMED,    // Оплачено и подтверждено
    COMPLETED,    // Событие прошло
    EXPIRED,      // Истекло время оплаты
    CANCELLED,    // Отменено пользователем
    NO_SHOW       // Не явился на событие
}
```

**PaymentStatus enum** (из backend-common):
```java
public enum PaymentStatus {
    NOT_REQUIRED,  // Бесплатное событие
    PENDING,       // Ожидает оплаты
    PROCESSING,    // Обрабатывается провайдером
    SUCCEEDED,     // Успешно оплачено
    FAILED,        // Ошибка оплаты
    REFUNDED       // Возврат средств
}
```

**Методы entity**:
```java
boolean isExpired()          // Проверка истечения PENDING брони
boolean requiresPayment()    // Требуется ли оплата (amount > 0)
boolean canBeConfirmed()     // Может ли быть подтверждена
```

### 4. BookingLog (Лог изменений)

Аудит всех изменений статусов бронирований.

**Поля**:
```java
UUID id
UUID bookingId
String oldStatus
String newStatus
String reason                  // Причина изменения
UUID changedBy                 // Кто изменил
Instant changedAt
```

### 5. Waitlist (Очередь ожидания)

FIFO очередь для заполненных событий.

**Поля**:
```java
UUID id
UUID eventId
UUID userId
Integer priority               // Позиция в очереди (уникальная)
Instant notifiedAt             // Когда уведомлен о доступности
Instant notificationExpiresAt  // До какого времени действует уведомление (30 мин)
Instant createdAt
```

**Unique constraints**:
- `(event_id, user_id)` - один пользователь один раз в очереди
- `(event_id, priority)` - уникальная позиция в очереди

### 6. WaitlistAudit (Аудит waitlist)

История обработки очереди ожидания.

**Поля**:
```java
UUID id
UUID waitlistId
String action                  // NOTIFIED | CONVERTED | REMOVED | EXPIRED
String details                 // Детали действия
Instant createdAt
```

### 7. Favorites (Избранное)

Избранные события пользователей.

**Поля** (composite key):
```java
@EmbeddedId FavoritesId id
    UUID userId
    UUID eventId
Instant createdAt
```

### 8. TeamMember (Член команды)

Участники команды организатора.

**Поля**:
```java
UUID id
String organizerSlug           // Ссылка на организатора
String name                    // Имя участника
String role                    // Роль в команде
String photoUrl                // Фото
String bio                     // Биография
Instant createdAt
Instant updatedAt
```

### 9. FaqItem (FAQ)

Часто задаваемые вопросы организатора.

**Поля**:
```java
UUID id
String organizerSlug
String question
String answer
Integer position               // Порядок отображения
Instant createdAt
Instant updatedAt
```

## API Endpoints

### Public - Organizers

```http
# Получить всех организаторов
GET /api/v1/organizers
Query: ?search=string&page=0&size=20

# Получить конкретного организатора
GET /api/v1/organizers/{slug}

# Получить события организатора
GET /api/v1/organizers/{slug}/events
Query: ?status=PUBLISHED&type=сплав&minPrice=0&maxPrice=10000
       &dateFrom=2024-06-01T00:00:00Z&dateTo=2024-08-31T23:59:59Z
       &page=0&size=20

# Получить команду организатора
GET /api/v1/organizers/{slug}/team

# Получить FAQ организатора
GET /api/v1/organizers/{slug}/faq
```

### Public - Events

```http
# Получить все опубликованные события
GET /api/v1/events
Query: ?status=PUBLISHED&type=string&minPrice=0&maxPrice=10000
       &dateFrom=ISO8601&dateTo=ISO8601&search=string&page=0&size=20

# Получить конкретное событие
GET /api/v1/events/{eventId}
```

### Organizer - Events (ORGANIZER role)

```http
# Создать событие
POST /api/v1/events
Body: CreateEventDto

# Обновить событие
PUT /api/v1/events/{eventId}
Body: UpdateEventDto

# Опубликовать событие (DRAFT → PUBLISHED)
POST /api/v1/events/{eventId}/publish
```

### User - Bookings

```http
# Создать бронирование
POST /api/v1/bookings
Body: CreateBookingRequest

# Получить свои бронирования
GET /api/v1/bookings
Query: ?status=PENDING&page=0&size=20

# Получить конкретное бронирование
GET /api/v1/bookings/{bookingId}

# Отменить бронирование
DELETE /api/v1/bookings/{bookingId}
Query: ?reason=string
```

### Organizer - Bookings Management (ORGANIZER role)

```http
# Получить бронирования события
GET /api/v1/events/{eventId}/bookings
Query: ?status=CONFIRMED&page=0&size=20

# Подтвердить бронирование (для бесплатных событий)
PUT /api/v1/bookings/{bookingId}/confirm

# Отметить no-show
PUT /api/v1/bookings/{bookingId}/no-show
```

### User - Waitlist

```http
# Присоединиться к очереди ожидания
POST /api/v1/waitlist
Body: { eventId: UUID }

# Покинуть очередь ожидания
DELETE /api/v1/waitlist/{eventId}

# Получить свою позицию в очереди
GET /api/v1/waitlist/{eventId}/position
```

### User - Favorites

```http
# Добавить в избранное
POST /api/v1/favorites/{eventId}

# Удалить из избранного
DELETE /api/v1/favorites/{eventId}

# Получить избранные события
GET /api/v1/favorites
Query: ?page=0&size=20
```

## Бизнес-логика

### Создание бронирования

**Процесс**:

1. **Валидация события**
   - Событие существует и в статусе PUBLISHED
   - Дата начала события в будущем

2. **Проверка дубликатов**
   - У пользователя нет активной брони (PENDING/CONFIRMED) на это событие

3. **Проверка вместимости**
   - Есть доступные места (`available > 0`)
   - Если мест нет → предложить waitlist

4. **Создание брони**
   - Статус: PENDING
   - Amount: фиксируется текущая цена события
   - ExpiresAt: текущее время + 30 минут
   - PaymentStatus: PENDING (если платное) или NOT_REQUIRED (если бесплатное)

5. **Декремент available** (атомарно в транзакции)
   ```sql
   UPDATE event.events
   SET available = available - 1
   WHERE id = ? AND available > 0
   ```

6. **Создание BookingLog**
   - Запись в аудит лог

7. **Интеграция**
   - Если требуется оплата → создать payment через Payment Service
   - Отправить уведомление о создании брони

**Исключения**:
- `EventNotFoundException` - событие не найдено
- `BookingConflictException` - уже есть активная бронь / нет мест
- `IllegalStateException` - событие не PUBLISHED

### Автоматическое истечение бронирований

**Scheduled Job** (каждую минуту):

```java
@Scheduled(cron = "0 * * * * *") // Каждую минуту
public void expirePendingBookings() {
    // 1. Найти все PENDING брони с expiresAt < now
    List<BookingEntity> expired = bookingRepository
        .findByStatusAndExpiresAtBefore(
            BookingStatus.PENDING, Instant.now()
        );

    // 2. Для каждой брони:
    for (BookingEntity booking : expired) {
        // - Изменить статус на EXPIRED
        booking.setStatus(BookingStatus.EXPIRED);

        // - Вернуть место в событие
        eventRepository.incrementAvailable(booking.getEvent().getId());

        // - Создать BookingLog
        createBookingLog(booking, "AUTO_EXPIRED");

        // - Обработать waitlist для этого события
        waitlistService.processWaitlist(booking.getEvent().getId());

        // - Отправить уведомление пользователю
        notificationService.sendBookingExpired(booking);
    }
}
```

### Подтверждение бронирования

**Триггер**: Webhook от Payment Service о успешной оплате

```java
public void confirmBooking(UUID bookingId) {
    BookingEntity booking = findBookingOrThrow(bookingId);

    // Проверки
    if (booking.getStatus() != BookingStatus.PENDING) {
        throw new IllegalStateException("Booking is not pending");
    }

    if (booking.requiresPayment() &&
        booking.getPaymentStatus() != PaymentStatus.SUCCEEDED) {
        throw new IllegalStateException("Payment not completed");
    }

    // Подтверждение
    booking.setStatus(BookingStatus.CONFIRMED);
    bookingRepository.save(booking);

    // Аудит
    createBookingLog(booking, BookingStatus.PENDING, BookingStatus.CONFIRMED,
                     "Payment completed");

    // Уведомление
    notificationService.sendBookingConfirmed(booking);
}
```

### Waitlist Management

**Добавление в очередь**:

```java
public WaitlistDto joinWaitlist(UUID userId, UUID eventId) {
    // 1. Проверить что события нет доступных мест
    EventEntity event = findEventOrThrow(eventId);
    if (event.getAvailable() > 0) {
        throw new IllegalStateException("Event has available seats");
    }

    // 2. Проверить что пользователь еще не в очереди
    if (waitlistRepository.existsByEventIdAndUserId(eventId, userId)) {
        throw new WaitlistConflictException("User already in waitlist");
    }

    // 3. Получить следующий priority (max + 1)
    Integer nextPriority = waitlistRepository.getMaxPriority(eventId)
        .map(p -> p + 1)
        .orElse(1);

    // 4. Создать запись
    WaitlistEntity waitlist = WaitlistEntity.builder()
        .eventId(eventId)
        .userId(userId)
        .priority(nextPriority)
        .build();

    return toDto(waitlistRepository.save(waitlist));
}
```

**Обработка очереди** (при освобождении места):

```java
public void processWaitlist(UUID eventId) {
    EventEntity event = findEventOrThrow(eventId);

    // Пока есть доступные места и есть очередь
    while (event.getAvailable() > 0) {
        // Найти следующего в очереди (min priority, не уведомленного)
        Optional<WaitlistEntity> nextOpt = waitlistRepository
            .findTopByEventIdAndNotifiedAtIsNullOrderByPriority(eventId);

        if (nextOpt.isEmpty()) {
            break; // Очередь закончилась
        }

        WaitlistEntity next = nextOpt.get();

        // Уведомить пользователя
        next.setNotifiedAt(Instant.now());
        next.setNotificationExpiresAt(Instant.now().plusSeconds(30 * 60)); // 30 мин
        waitlistRepository.save(next);

        // Отправить уведомление
        notificationService.sendWaitlistSlotAvailable(next);

        // Аудит
        waitlistAuditService.logAction(next, "NOTIFIED",
            "Slot available, user has 30 minutes to book");

        // Декремент available (резервирование места)
        event.setAvailable(event.getAvailable() - 1);
        eventRepository.save(event);
    }
}
```

### Машина состояний бронирования

```
PENDING (30 мин)
   ├─→ CONFIRMED    (оплата успешна / бесплатное событие подтверждено)
   ├─→ EXPIRED      (истекло 30 минут)
   └─→ CANCELLED    (отменено пользователем)

CONFIRMED
   ├─→ COMPLETED    (событие прошло - scheduled job)
   ├─→ CANCELLED    (отменено с возвратом средств)
   └─→ NO_SHOW      (пользователь не явился - отметка организатора)

EXPIRED/CANCELLED/NO_SHOW
   └─→ (финальные состояния)
```

## База данных

### Схема event

```sql
-- Организаторы
CREATE TABLE event.organizers (
    id UUID PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    contacts JSONB,
    brand_color VARCHAR(7),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- События
CREATE TABLE event.events (
    id UUID PRIMARY KEY,
    organizer_slug VARCHAR(100) NOT NULL REFERENCES event.organizers(slug),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    date_start TIMESTAMPTZ NOT NULL,
    date_end TIMESTAMPTZ NOT NULL,
    location JSONB NOT NULL,
    price DECIMAL(10,2),
    capacity INTEGER NOT NULL,
    available INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    tags TEXT[],
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Бронирования
CREATE TABLE event.bookings (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES event.events(id),
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2),
    payment_status VARCHAR(20),
    payment_id UUID,
    expires_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE(event_id, user_id)  -- Один пользователь - одна бронь на событие
);

-- Лог изменений бронирований
CREATE TABLE event.booking_logs (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES event.bookings(id),
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason TEXT,
    changed_by UUID,
    changed_at TIMESTAMPTZ NOT NULL
);

-- Очередь ожидания
CREATE TABLE event.waitlist (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES event.events(id),
    user_id UUID NOT NULL,
    priority INTEGER NOT NULL,
    notified_at TIMESTAMPTZ,
    notification_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE(event_id, user_id),
    UNIQUE(event_id, priority)
);

-- Аудит waitlist
CREATE TABLE event.waitlist_audit (
    id UUID PRIMARY KEY,
    waitlist_id UUID NOT NULL REFERENCES event.waitlist(id),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL
);

-- Избранное
CREATE TABLE event.favorites (
    user_id UUID NOT NULL,
    event_id UUID NOT NULL REFERENCES event.events(id),
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY(user_id, event_id)
);

-- Команда организатора
CREATE TABLE event.team_members (
    id UUID PRIMARY KEY,
    organizer_slug VARCHAR(100) NOT NULL REFERENCES event.organizers(slug),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    photo_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- FAQ организатора
CREATE TABLE event.faq_items (
    id UUID PRIMARY KEY,
    organizer_slug VARCHAR(100) NOT NULL REFERENCES event.organizers(slug),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
```

### Индексы

```sql
-- Events
CREATE INDEX idx_events_organizer_slug ON event.events(organizer_slug);
CREATE INDEX idx_events_status ON event.events(status);
CREATE INDEX idx_events_date_start ON event.events(date_start);
CREATE INDEX idx_events_type ON event.events(type);

-- Bookings
CREATE INDEX idx_bookings_event_id ON event.bookings(event_id);
CREATE INDEX idx_bookings_user_id ON event.bookings(user_id);
CREATE INDEX idx_bookings_status ON event.bookings(status);
CREATE INDEX idx_bookings_expires_at ON event.bookings(expires_at)
    WHERE status = 'PENDING';

-- Waitlist
CREATE INDEX idx_waitlist_event_id ON event.waitlist(event_id);
CREATE INDEX idx_waitlist_user_id ON event.waitlist(user_id);
CREATE INDEX idx_waitlist_priority ON event.waitlist(event_id, priority);

-- Favorites
CREATE INDEX idx_favorites_user_id ON event.favorites(user_id);
```

## Зависимости

```gradle
dependencies {
    implementation project(':backend-common')
    implementation project(':backend-event:backend-event-db')

    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.boot:spring-boot-starter-security'

    // JSON handling
    implementation 'io.hypersistence:hypersistence-utils-hibernate-60:3.5.1'
}
```

## Конфигурация

### application.yml

```yaml
server:
  port: 8102

spring:
  application:
    name: backend-event

  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
    username: aquastream
    password: ${DB_PASSWORD}

  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        default_schema: event

  liquibase:
    change-log: classpath:migration/liquibase/master.xml
    default-schema: event

  task:
    scheduling:
      pool:
        size: 2  # Для scheduled jobs

# Application-specific configuration
app:
  booking:
    expiration-minutes: 30       # TTL для PENDING бронирований
    cleanup-interval: "0 * * * * *"  # Cron: каждую минуту

  waitlist:
    notification-window-minutes: 30   # Окно для брони после уведомления
    cleanup-interval-minutes: 5       # Очистка expired уведомлений

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

## Интеграции

### С Payment Service

**Создание платежа** (при создании платного бронирования):

```java
PaymentDto payment = paymentClient.createPayment(CreatePaymentRequest.builder()
    .bookingId(booking.getId())
    .userId(userId)
    .amount(booking.getAmount())
    .description("Оплата участия в событии: " + event.getTitle())
    .build());

booking.setPaymentId(payment.getId());
```

**Webhook от Payment** (при успешной оплате):

```http
POST /api/v1/bookings/{bookingId}/payment-callback
Body: { status: "SUCCEEDED", paymentId: UUID }

→ Вызывает bookingService.confirmBooking(bookingId)
```

### С Notification Service

**События для уведомлений**:

- Booking created (PENDING) → email/Telegram с деталями и ссылкой на оплату
- Booking confirmed → email/Telegram с подтверждением
- Booking expired → email/Telegram о истечении
- Booking cancelled → email/Telegram об отмене
- Waitlist slot available → email/Telegram с окном 30 минут на бронирование
- Event reminder (за 24 часа) → email/Telegram с напоминанием о событии

### С User Service (будущее)

**Валидация профиля** при создании бронирования:

```java
// Проверка что заполнен phone ИЛИ telegram
UserProfileDto profile = userClient.getUserProfile(userId);
if (profile.getPhone() == null && profile.getTelegram() == null) {
    throw new ProfileIncompleteException(
        "Please complete your profile: phone or telegram required"
    );
}
```

## Scheduled Jobs

### 1. Expire Pending Bookings

**Частота**: Каждую минуту (`0 * * * * *`)

**Задача**:
- Найти все PENDING брони с `expiresAt < now`
- Изменить статус на EXPIRED
- Вернуть места в события
- Обработать waitlist
- Отправить уведомления

### 2. Complete Finished Events

**Частота**: Каждый час (`0 0 * * * *`)

**Задача**:
- Найти все CONFIRMED брони для событий с `dateEnd < now`
- Изменить статус броней на COMPLETED
- Изменить статус событий на COMPLETED

### 3. Cleanup Expired Waitlist Notifications

**Частота**: Каждые 5 минут

**Задача**:
- Найти записи waitlist с `notificationExpiresAt < now`
- Удалить из waitlist
- Вернуть места в события
- Обработать следующего в очереди

## Права доступа

### GUEST (неавторизованный)
- Просмотр опубликованных событий
- Просмотр организаторов
- Просмотр команды и FAQ

### USER (авторизованный)
- Все права GUEST
- Создание бронирований
- Отмена своих бронирований
- Просмотр своих бронирований
- Управление избранным
- Присоединение к waitlist

### ORGANIZER
- Создание и управление событиями
- Публикация событий
- Просмотр всех бронирований своих событий
- Подтверждение бронирований (для бесплатных событий)
- Отметка no-show
- Управление командой и FAQ

### ADMIN
- Все права ORGANIZER для всех событий

## Мониторинг

### Health Check

```bash
curl http://localhost:8102/actuator/health
```

### Метрики

```bash
# Количество активных бронирований
curl http://localhost:8102/actuator/metrics/aquastream.bookings.active

# P95 latency создания бронирования
curl http://localhost:8102/actuator/metrics/aquastream.bookings.create.latency.p95
```

### Логи

```bash
docker logs aquastream-backend-event

# Фильтрация
docker logs aquastream-backend-event 2>&1 | grep "BookingService"
docker logs aquastream-backend-event 2>&1 | grep "EXPIRED"
```

## См. также

- [API Documentation](api.md) - детальное описание API endpoints
- [Business Logic](business-logic.md) - бизнес-правила и валидации
- [Operations](operations.md) - развертывание и обслуживание
- [Database Schema](../database.md) - схема event в PostgreSQL
- [Payment Service](../payment/README.md) - интеграция с платежами