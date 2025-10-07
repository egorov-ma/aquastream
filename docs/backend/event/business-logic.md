# Event Service - Business Logic

## Обзор

Event Service — центральный сервис управления событиями и бронированиями с автоматическим истечением броней (30 мин), FIFO waitlist и интеграцией с Payment Service.

**Ключевые функции**:
- Управление событиями (создание, публикация, статусы)
- Бронирования с TTL 30 минут
- Waitlist: FIFO очередь с уведомлениями
- Атомарное управление capacity
- Payment integration + audit logging

## Типы и статусы

### EventStatus

| Статус | Описание | Переходы |
|--------|----------|----------|
| `DRAFT` | Черновик (не виден публично) | → PUBLISHED, CANCELLED |
| `PUBLISHED` | Опубликовано (доступно для бронирования) | → COMPLETED, CANCELLED |
| `COMPLETED` | Завершено (dateEnd прошла) | Финальный |
| `CANCELLED` | Отменено | Финальный |

### BookingStatus

| Статус | Описание | TTL | Переходы |
|--------|----------|-----|----------|
| `PENDING` | Ожидает оплаты | 30 мин | → CONFIRMED, EXPIRED, CANCELLED |
| `CONFIRMED` | Оплачено и подтверждено | - | → COMPLETED, CANCELLED, NO_SHOW |
| `COMPLETED` | Событие прошло | - | Финальный |
| `EXPIRED` | Истекло время оплаты | - | Финальный |
| `CANCELLED` | Отменено пользователем | - | Финальный |
| `NO_SHOW` | Не явился (отметка организатора) | - | Финальный |

### PaymentStatus

| Статус | Описание |
|--------|----------|
| `NOT_REQUIRED` | Бесплатное событие |
| `PENDING` | Ожидает оплаты |
| `PROCESSING` | Обрабатывается провайдером |
| `SUCCEEDED` | Успешно оплачено |
| `FAILED` | Ошибка оплаты |
| `REFUNDED` | Возврат средств |

## Бизнес-правила

### 1. Создание события

**Endpoint**: `POST /api/v1/events` (ORGANIZER)

| Правило | Требование |
|---------|------------|
| Организатор | `organizerSlug` должен существовать |
| Название | `title`: 3-500 символов |
| Даты | `dateStart` в будущем, `dateEnd` > `dateStart` |
| Capacity | Целое число > 0 |
| Цена | >= 0 или null для бесплатных |
| Статус | Всегда `DRAFT` при создании |
| Available | = `capacity` при создании |

**Exceptions**: `OrganizerNotFoundException`, `ValidationException`, `ConstraintViolationException`

### 2. Обновление события

**Endpoint**: `PUT /api/v1/events/{eventId}` (ORGANIZER)

- ✅ Только свои события (проверка `organizerSlug`)
- ❌ Нельзя обновлять опубликованные события (`status != DRAFT`)
- ❌ Нельзя уменьшить `capacity` ниже текущих подтвержденных броней
- ✅ При изменении `capacity`: `available` пересчитывается

```java
// Проверка capacity
long confirmedBookings = bookingRepository
    .countByEventIdAndStatus(eventId, BookingStatus.CONFIRMED);

if (dto.getCapacity() < confirmedBookings) {
    throw new EventConflictException(
        "Cannot reduce capacity below confirmed bookings: " + confirmedBookings);
}

event.setAvailable(dto.getCapacity() - (int) confirmedBookings);
```

### 3. Публикация события

**Endpoint**: `POST /api/v1/events/{eventId}/publish` (ORGANIZER)

- ✅ Событие в статусе `DRAFT`
- ✅ Все обязательные поля заполнены
- ✅ `dateStart` в будущем

### 4. Создание бронирования

**Endpoint**: `POST /api/v1/bookings` (USER)

**Критичная операция с атомарной транзакцией.**

| Правило | Описание |
|---------|----------|
| Событие | `status = PUBLISHED`, `dateStart` в будущем |
| Capacity | Есть доступные места (`activeBookings < capacity`) |
| Дубликаты | Нет активной брони (PENDING/CONFIRMED) на это событие |
| Цена | Фиксируется на момент создания |
| TTL | 30 минут для PENDING |
| Available | Декремент атомарно с созданием брони |

**Атомарный декремент** (предотвращает race conditions):
```sql
UPDATE event.events
SET available = available - 1
WHERE id = ? AND available > 0
RETURNING available;
-- Если вернулось NULL или 0 → rollback
```

**Процесс**:
1. Валидация события (`PUBLISHED`, есть места)
2. Проверка дубликатов
3. Создание брони со статусом `PENDING`
4. Атомарный декремент `available`
5. Инициализация платежа (если платное)
6. Audit log + уведомление

**Exceptions**: `EventNotFoundException`, `BookingConflictException` (нет мест / уже есть бронь)

### 5. Автоматическое истечение бронирований

**Scheduled Job**: Каждую минуту (`@Scheduled(cron = "0 * * * * *")`)

**Процесс**:
1. Найти все `PENDING` брони с `expiresAt < now`
2. Изменить статус → `EXPIRED`
3. Вернуть место (`available++`)
4. Обработать waitlist
5. Audit log + уведомление

### 6. Подтверждение бронирования

**Triggers**: Webhook от Payment Service | Ручное подтверждение организатором | Пользователь (для бесплатных)

**Правила**:
- ✅ Бронирование в статусе `PENDING`
- ✅ Для платных: `paymentStatus = SUCCEEDED`
- ✅ Для бесплатных: `paymentStatus = NOT_REQUIRED`
- ✅ Место НЕ возвращается (уже зарезервировано)

### 7. Отмена бронирования

**Endpoint**: `PUT /api/v1/bookings/{bookingId}/cancel` (USER)

| Можно отменить | Нельзя отменить |
|----------------|-----------------|
| PENDING, CONFIRMED | COMPLETED, EXPIRED, CANCELLED, NO_SHOW |

**Процесс**:
1. Изменить статус → `CANCELLED`
2. Вернуть место (`available++`)
3. Обработать waitlist
4. Инициировать возврат средств (если CONFIRMED и платное)
5. Audit log + уведомление

### 8. Waitlist Management

#### Присоединение к очереди

**Endpoint**: `POST /api/v1/events/{eventId}/waitlist` (USER)

**Правила**:
- ✅ Событие в статусе `PUBLISHED`
- ✅ Нет доступных мест (`available = 0`)
- ✅ Пользователь не в очереди
- ✅ Позиция = `max(priority) + 1` (FIFO)

**Constraints**:
- Unique: `(event_id, user_id)`
- Unique: `(event_id, priority)`

#### Обработка очереди (при освобождении места)

**Triggers**: Истечение брони | Отмена | Увеличение capacity

**Процесс** (асинхронно):
```java
@Async
public void processWaitlistForEvent(UUID eventId) {
    while (event.getAvailable() > 0) {
        // Найти следующего (min priority, не уведомленного)
        WaitlistEntity next = waitlistRepository
            .findTopByEventIdAndNotifiedAtIsNullOrderByPriorityAsc(eventId);

        if (next.isEmpty()) break;

        // Уведомить с окном 30 минут
        next.setNotifiedAt(now);
        next.setNotificationExpiresAt(now.plusSeconds(30 * 60));

        // Резервируем место
        eventRepository.decrementAvailableIfPositive(eventId);

        // Отправить уведомление
        notificationService.sendWaitlistSlotAvailable(next.getUserId(), eventId, expiresAt);
    }
}
```

**Правила**:
- ✅ FIFO порядок (по `priority ASC`)
- ✅ Окно для бронирования: 30 минут
- ✅ Место резервируется сразу (`available--`)
- ✅ Если не забронирует → место освобождается через 30 минут

#### Очистка expired уведомлений

**Scheduled Job**: Каждые 5 минут

Удаляет записи waitlist с истекшим `notificationExpiresAt`, возвращает место, обрабатывает следующего в очереди.

### 9. Завершение событий

**Scheduled Job**: Каждый час (`@Scheduled(cron = "0 0 * * * *")`)

Находит события с `dateEnd < now` и `status = PUBLISHED`, изменяет статус события → `COMPLETED`, изменяет все `CONFIRMED` брони → `COMPLETED`.

## Машины состояний

### Booking Status Flow

```
PENDING (30 минут TTL)
   ├─→ CONFIRMED    (оплата успешна ИЛИ бесплатное подтверждено)
   ├─→ EXPIRED      (истекло 30 минут - auto job)
   └─→ CANCELLED    (отменено пользователем)

CONFIRMED
   ├─→ COMPLETED    (событие прошло - scheduled job)
   ├─→ CANCELLED    (отмена с возвратом средств)
   └─→ NO_SHOW      (отметка организатора)

EXPIRED/COMPLETED/CANCELLED/NO_SHOW
   └─→ (финальные состояния, нельзя изменить)
```

### Event Status Flow

```
DRAFT
   ├─→ PUBLISHED    (организатор публикует)
   └─→ CANCELLED    (организатор отменяет до публикации)

PUBLISHED
   ├─→ COMPLETED    (dateEnd прошла - scheduled job)
   └─→ CANCELLED    (организатор отменяет)

COMPLETED/CANCELLED
   └─→ (финальные состояния)
```

## Транзакционность

```java
@Service
@Transactional  // Класс уровень
public class BookingService {
    // Методы модификации в транзакции по умолчанию
    public BookingDto createBooking(...) { }

    // Read-only методы
    @Transactional(readOnly = true)
    public PagedResponse<BookingDto> getUserBookings(...) { }
}
```

**Гарантии**: Atomicity (бронь + available атомарно), Consistency (available корректный), Isolation (pessimistic/optimistic locks), Durability (PostgreSQL).

## Race Conditions

### Concurrent booking creation

**Проблема**: Два пользователя одновременно бронируют последнее место.

**Решение**: Атомарный декремент с проверкой

```sql
UPDATE event.events
SET available = available - 1
WHERE id = ? AND available > 0
RETURNING available;
-- Если вернулось NULL → rollback создания брони
```

**Альтернатива**: Pessimistic lock
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT e FROM EventEntity e WHERE e.id = :id")
Optional<EventEntity> findByIdWithLock(@Param("id") UUID id);
```

### Waitlist priority conflicts

**Решение**: Unique constraint на `(event_id, priority)`

При конфликте → `DataIntegrityViolationException` → retry с новым priority.

## Валидации

### Event

- ✅ `dateStart` в будущем, `dateEnd` > `dateStart`
- ✅ `capacity` > 0, `available` <= `capacity`, `available` >= 0
- ✅ `price` >= 0 или null

### Booking

- ✅ Только одна активная бронь (PENDING/CONFIRMED) на событие
- ✅ `expiresAt` = `createdAt` + 30 минут (для PENDING)
- ✅ `amount` фиксируется на момент создания
- ✅ `paymentStatus` соответствует `amount`

### Waitlist

- ✅ Unique: `(event_id, user_id)`, `(event_id, priority)`
- ✅ `priority` >= 1
- ✅ `notificationExpiresAt` = `notifiedAt` + 30 минут

## Интеграции

### С Payment Service

| Операция | Endpoint/Метод |
|----------|----------------|
| Создание платежа | `paymentClient.initializePayment(bookingId, userId, amount, description)` |
| Webhook (оплата) | `PUT /bookings/payment/{paymentId}/confirm` → `confirmBookingAfterPayment()` |
| Возврат средств | `paymentClient.initiateRefund(paymentId, reason)` (при отмене CONFIRMED) |

### С Notification Service

| Event | Когда | Данные |
|-------|-------|--------|
| `booking.created` | PENDING | bookingId, userId, eventId, amount, expiresAt, paymentUrl |
| `booking.confirmed` | CONFIRMED | bookingId, eventId, eventTitle, eventDateStart, QR-код |
| `booking.expired` | EXPIRED | bookingId, eventId, предложение waitlist |
| `booking.cancelled` | CANCELLED | bookingId, eventId, refund info |
| `waitlist.slot_available` | Освободилось место | userId, eventId, priority, expiresAt (30 мин окно) |
| `event.reminder` | За 24 часа | eventId, eventTitle, location, contacts |

### С User Service (будущее)

Валидация профиля при бронировании: phone ИЛИ telegram должны быть заполнены.

## Audit Logging

Все изменения статусов бронирований логируются в `booking_logs`:

```java
BookingLogEntity log = BookingLogEntity.builder()
    .booking(booking)
    .action(action.toString())          // CREATED, CONFIRMED, CANCELLED, EXPIRED, COMPLETED, NO_SHOW
    .oldStatus(oldStatus != null ? oldStatus.toString() : null)
    .newStatus(booking.getStatus().toString())
    .changedBy(changedBy)
    .changedAt(Instant.now())
    .details(objectMapper.valueToTree(details))  // JSONB
    .build();
```

## Performance

### Оптимизация запросов

**N+1 проблема**:
```java
// ❌ Плохо: N+1 запросы
List<BookingEntity> bookings = bookingRepository.findByUserId(userId);

// ✅ Хорошо: Fetch Join
@Query("SELECT b FROM BookingEntity b " +
       "LEFT JOIN FETCH b.event e " +
       "LEFT JOIN FETCH e.organizer " +
       "WHERE b.userId = :userId")
List<BookingEntity> findByUserIdWithEvent(@Param("userId") UUID userId);
```

### Индексы

**Критичные**:
```sql
-- Bookings
CREATE INDEX idx_bookings_user_id ON event.bookings(user_id);
CREATE INDEX idx_bookings_event_id ON event.bookings(event_id);
CREATE INDEX idx_bookings_status ON event.bookings(status);
CREATE INDEX idx_bookings_expires_at ON event.bookings(expires_at)
    WHERE status = 'PENDING';  -- Partial index

-- Events
CREATE INDEX idx_events_status ON event.events(status);
CREATE INDEX idx_events_date_start ON event.events(date_start);
CREATE INDEX idx_events_organizer_slug ON event.events(organizer_slug);

-- Waitlist
CREATE INDEX idx_waitlist_event_priority ON event.waitlist(event_id, priority);
CREATE INDEX idx_waitlist_notification_expires ON event.waitlist(notification_expires_at)
    WHERE notified_at IS NOT NULL;
```

### Кэширование (будущее)

```java
@Cacheable(value = "events", key = "#eventId")
public EventDto getEventById(UUID eventId) { }

@Cacheable(value = "organizers", key = "#slug")
public OrganizerDetailDto getOrganizerBySlug(String slug) { }
```

**Redis TTL**: Events (5 мин), Organizers (15 мин), invalidation при обновлении.

## Exceptions

### Custom Exceptions

```java
// Event
public class EventNotFoundException extends RuntimeException { }
public class EventConflictException extends RuntimeException { }

// Booking
public class BookingNotFoundException extends RuntimeException { }
public class BookingConflictException extends RuntimeException { }

// Waitlist
public class WaitlistException extends RuntimeException { }

// Organizer
public class OrganizerNotFoundException extends RuntimeException { }

// User
public class UnauthorizedBookingAccessException extends RuntimeException { }
public class ProfileIncompleteException extends RuntimeException { }
```

### Маппинг в HTTP статусы

| Exception | HTTP Status |
|-----------|-------------|
| `*NotFoundException` | 404 Not Found |
| `*ConflictException` | 409 Conflict |
| `UnauthorizedBookingAccessException` | 403 Forbidden |
| `ProfileIncompleteException` | 422 Unprocessable Entity |
| `ValidationException`, `IllegalStateException` | 400 Bad Request |

---

См. [README](README.md), [API Documentation](api.md), [Operations](operations.md), [Database Schema](../database.md), [Backend Common - Error Handling](../common/error-handling.md).