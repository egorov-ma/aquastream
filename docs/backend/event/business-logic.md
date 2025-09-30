# Event Service - Business Logic

## Обзор

Event Service - центральный сервис платформы для управления событиями, организаторами и бронированиями. Включает сложную бизнес-логику автоматического истечения броней, управления waitlist и интеграции с платежным сервисом.

## Основные функции

- **Управление событиями**: создание, публикация, обновление статусов
- **Бронирования**: создание с автоматическим истечением через 30 минут
- **Waitlist**: FIFO очередь с окном уведомления 30 минут
- **Capacity management**: атомарное управление доступными местами
- **Payment integration**: интеграция с Payment Service
- **Audit logging**: полная история изменений бронирований

## Типы и енумы

### EventStatus

```java
// Хранится как String в БД
"DRAFT"      // Черновик (не виден публично)
"PUBLISHED"  // Опубликовано (доступно для бронирования)
"COMPLETED"  // Завершено
"CANCELLED"  // Отменено
```

**Переходы статусов**:
```
DRAFT → PUBLISHED → COMPLETED
        ↓
    CANCELLED
```

### BookingStatus enum

```java
public enum BookingStatus {
    PENDING,      // Ожидает оплаты (TTL 30 минут)
    CONFIRMED,    // Оплачено и подтверждено
    COMPLETED,    // Событие прошло
    EXPIRED,      // Истекло время оплаты (30 минут)
    CANCELLED,    // Отменено пользователем
    NO_SHOW       // Не явился на событие (отметка организатора)
}
```

### PaymentStatus enum

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

## Бизнес-правила

### 1. Создание события

**Endpoint**: `POST /api/v1/events` (ORGANIZER)

**Процесс**:

1. **Валидация организатора**
   ```java
   OrganizerEntity organizer = organizerRepository.findBySlug(organizerSlug)
       .orElseThrow(() -> new OrganizerNotFoundException(
           "Organizer not found: " + organizerSlug));
   ```

2. **Валидация дат**
   ```java
   private void validateDates(Instant dateStart, Instant dateEnd) {
       Instant now = Instant.now();

       // dateStart должна быть в будущем
       if (dateStart.isBefore(now)) {
           throw new ValidationException("Event start date must be in the future");
       }

       // dateEnd должна быть после dateStart
       if (dateEnd.isBefore(dateStart)) {
           throw new ValidationException("Event end date must be after start date");
       }
   }
   ```

3. **Создание события**
   ```java
   EventEntity event = EventEntity.builder()
       .organizerSlug(organizerSlug)
       .type(dto.getType())
       .title(dto.getTitle())
       .dateStart(dto.getDateStart())
       .dateEnd(dto.getDateEnd())
       .location(dto.getLocation())        // JSONB
       .price(dto.getPrice())              // null для бесплатных
       .capacity(dto.getCapacity())
       .available(dto.getCapacity())       // = capacity при создании
       .status("DRAFT")                    // Всегда DRAFT при создании
       .tags(dto.getTags())                // PostgreSQL TEXT[]
       .description(dto.getDescription())
       .build();
   ```

**Правила**:
- ✅ `organizerSlug` должен существовать
- ✅ `title`: 3-500 символов
- ✅ `dateStart`: в будущем
- ✅ `dateEnd`: после `dateStart`
- ✅ `capacity`: целое число > 0
- ✅ `price`: >= 0 или null для бесплатных
- ✅ Статус всегда DRAFT при создании
- ✅ `available` = `capacity` при создании

**Exceptions**:
- `OrganizerNotFoundException` - организатор не найден
- `ValidationException` - невалидные даты/поля
- `ConstraintViolationException` - Bean Validation errors

---

### 2. Обновление события

**Endpoint**: `PUT /api/v1/events/{eventId}` (ORGANIZER)

**Правила**:
- ✅ Только свои события (проверка `organizerSlug`)
- ❌ Нельзя обновлять опубликованные события (status != DRAFT)
- ❌ Нельзя уменьшить `capacity` ниже текущих броней
- ✅ При изменении `capacity`: `available` пересчитывается

**Процесс**:

```java
public EventDto updateEvent(UUID eventId, UpdateEventDto dto, String organizerSlug) {
    // 1. Проверка прав
    EventEntity event = getEventWithOwnershipCheck(eventId, organizerSlug);

    // 2. Проверка статуса
    if (!"DRAFT".equals(event.getStatus())) {
        throw new EventConflictException("Cannot update published event");
    }

    // 3. Обновление полей (если переданы)
    if (dto.getCapacity() != null) {
        // Проверка: нельзя уменьшить ниже текущих броней
        long confirmedBookings = bookingRepository
            .countByEventIdAndStatus(eventId, BookingStatus.CONFIRMED);

        if (dto.getCapacity() < confirmedBookings) {
            throw new EventConflictException(
                "Cannot reduce capacity below confirmed bookings: " + confirmedBookings);
        }

        event.setCapacity(dto.getCapacity());
        // Пересчет available
        event.setAvailable(dto.getCapacity() - (int) confirmedBookings);
    }

    // 4. Валидация дат (если изменились)
    validateDates(event.getDateStart(), event.getDateEnd());

    return eventRepository.save(event);
}
```

---

### 3. Публикация события

**Endpoint**: `POST /api/v1/events/{eventId}/publish` (ORGANIZER)

**Правила**:
- ✅ Событие в статусе DRAFT
- ✅ Все обязательные поля заполнены
- ✅ `dateStart` в будущем

**Процесс**:

```java
public EventDto publishEvent(UUID eventId, String organizerSlug) {
    EventEntity event = getEventWithOwnershipCheck(eventId, organizerSlug);

    // Проверка статуса
    if (!"DRAFT".equals(event.getStatus())) {
        throw new EventConflictException("Event is already published or completed");
    }

    // Проверка обязательных полей
    validateEventForPublishing(event);

    // Проверка даты
    if (event.getDateStart().isBefore(Instant.now())) {
        throw new ValidationException("Cannot publish event with past start date");
    }

    // Публикация
    event.setStatus("PUBLISHED");
    return eventRepository.save(event);
}
```

---

### 4. Создание бронирования

**Endpoint**: `POST /api/v1/bookings` (USER)

**Самая критичная операция сервиса с множеством проверок.**

**Процесс** (атомарная транзакция):

```java
@Transactional
public BookingDto createBooking(UUID userId, CreateBookingRequest request) {
    // 1. Валидация события
    EventEntity event = eventRepository.findById(request.getEventId())
        .orElseThrow(() -> new EventNotFoundException("Event not found"));

    if (!"PUBLISHED".equals(event.getStatus())) {
        throw new BookingConflictException("Event is not available for booking");
    }

    // 2. Проверка дубликатов
    List<BookingStatus> activeStatuses = Arrays.asList(
        BookingStatus.PENDING, BookingStatus.CONFIRMED
    );

    if (bookingRepository.existsByUserIdAndEventIdAndStatusIn(
            userId, request.getEventId(), activeStatuses)) {
        throw new BookingConflictException(
            "User already has an active booking for this event");
    }

    // 3. Проверка capacity (pessimistic lock)
    long activeBookings = bookingRepository
        .countActiveBookingsByEventId(request.getEventId());

    if (activeBookings >= event.getCapacity()) {
        log.warn("Event {} is at capacity", request.getEventId());
        throw new BookingConflictException(
            "Event is at full capacity. Please join the waitlist.");
    }

    // 4. TODO: Проверка профиля пользователя
    // validateUserProfile(userId);
    // - phone ИЛИ telegram должен быть заполнен

    // 5. Создание бронирования
    BookingEntity booking = new BookingEntity();
    booking.setEvent(event);
    booking.setUserId(userId);
    booking.setStatus(BookingStatus.PENDING);
    booking.setAmount(event.getPrice());  // Фиксируем цену

    // Установка payment status
    if (event.getPrice() != null && event.getPrice().compareTo(BigDecimal.ZERO) > 0) {
        booking.setPaymentStatus(PaymentStatus.PENDING);
    } else {
        booking.setPaymentStatus(PaymentStatus.NOT_REQUIRED);
    }

    // expiresAt устанавливается в @PrePersist: now + 30 минут

    booking = bookingRepository.save(booking);

    // 6. Декремент available (атомарно!)
    int updated = eventRepository.decrementAvailableIfPositive(event.getId());
    if (updated == 0) {
        // Race condition: места закончились между проверкой и декрементом
        bookingRepository.delete(booking);
        throw new BookingConflictException("Event is at full capacity");
    }

    // 7. Инициализация платежа (если платное)
    if (booking.requiresPayment()) {
        try {
            PaymentInitResponse payment = paymentClient.initializePayment(
                booking.getId(),
                userId,
                event.getPrice(),
                "Payment for event: " + event.getTitle()
            );

            booking.setPaymentId(payment.getPaymentId());
            booking = bookingRepository.save(booking);

        } catch (Exception e) {
            log.error("Failed to initialize payment: {}", e.getMessage());
            // Бронь создана, но без платежа
            // Пользователь увидит ошибку, но бронь останется PENDING
        }
    }

    // 8. Audit log
    createBookingLog(booking, BookingLogAction.CREATED, null, userId);

    // 9. Уведомление (асинхронно)
    notificationService.sendBookingCreated(booking);

    log.info("Created booking {} for user {} and event {}",
        booking.getId(), userId, request.getEventId());

    return bookingMapper.toBookingDto(booking);
}
```

**Правила**:
- ✅ Событие в статусе PUBLISHED
- ✅ `dateStart` в будущем
- ✅ Есть доступные места (`activeBookings < capacity`)
- ✅ У пользователя нет активной брони (PENDING/CONFIRMED) на это событие
- ✅ Цена фиксируется на момент создания брони
- ✅ TTL = 30 минут для PENDING бронирований
- ✅ Декремент `available` атомарно с созданием брони

**Атомарный декремент**:
```sql
UPDATE event.events
SET available = available - 1
WHERE id = ? AND available > 0
RETURNING available;
```

**Exceptions**:
- `EventNotFoundException` - событие не найдено
- `BookingConflictException` - уже есть активная бронь / нет мест
- `IllegalStateException` - событие не PUBLISHED

---

### 5. Автоматическое истечение бронирований

**Scheduled Job**: Каждую минуту (`@Scheduled(cron = "0 * * * * *")`)

**Критичная фоновая задача для освобождения мест.**

```java
@Scheduled(cron = "0 * * * * *")
@Transactional
public void expirePendingBookings() {
    Instant now = Instant.now();

    // 1. Найти все PENDING брони с истекшим expiresAt
    List<BookingEntity> expiredBookings = bookingRepository
        .findByStatusAndExpiresAtBefore(BookingStatus.PENDING, now);

    log.info("Found {} expired bookings to process", expiredBookings.size());

    // 2. Обработать каждую бронь
    for (BookingEntity booking : expiredBookings) {
        try {
            // Изменить статус
            BookingStatus oldStatus = booking.getStatus();
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);

            // Аудит
            createBookingLog(booking, BookingLogAction.EXPIRED,
                oldStatus, null, "AUTO_EXPIRED");

            // Вернуть место в событие
            eventRepository.incrementAvailable(booking.getEvent().getId());

            // Обработать waitlist
            waitlistService.processWaitlistForEvent(booking.getEvent().getId());

            // Уведомление
            notificationService.sendBookingExpired(booking);

            log.info("Expired booking {}", booking.getId());

        } catch (Exception e) {
            log.error("Failed to expire booking {}: {}",
                booking.getId(), e.getMessage());
            // Продолжаем обработку остальных броней
        }
    }
}
```

**Правила**:
- ✅ Обрабатываются только PENDING брони
- ✅ `expiresAt < now`
- ✅ Место возвращается в событие (`available++`)
- ✅ Обрабатывается waitlist
- ✅ Отправляется уведомление пользователю
- ✅ Создается audit log

**Increment available**:
```sql
UPDATE event.events
SET available = available + 1
WHERE id = ?;
```

---

### 6. Подтверждение бронирования

**Triggers**:
1. Webhook от Payment Service (при успешной оплате)
2. Ручное подтверждение организатором (для бесплатных событий)
3. Пользователь подтверждает бесплатное событие

**Процесс**:

```java
public BookingDto confirmBooking(UUID bookingId, UUID userId) {
    BookingEntity booking = findBookingByIdAndUserId(bookingId, userId);

    // Проверка возможности подтверждения
    if (!booking.canBeConfirmed()) {
        throw new BookingConflictException(
            "Booking cannot be confirmed in current state");
    }

    // Метод entity для проверки
    // public boolean canBeConfirmed() {
    //     if (status != BookingStatus.PENDING) return false;
    //     if (requiresPayment()) {
    //         return paymentStatus == PaymentStatus.SUCCEEDED;
    //     }
    //     return true; // Free events can be confirmed
    // }

    BookingStatus oldStatus = booking.getStatus();
    booking.setStatus(BookingStatus.CONFIRMED);
    booking = bookingRepository.save(booking);

    // Аудит
    createBookingLog(booking, BookingLogAction.CONFIRMED,
        oldStatus, userId, "Payment completed");

    // Уведомление
    notificationService.sendBookingConfirmed(booking);

    log.info("Confirmed booking {}", bookingId);

    return bookingMapper.toBookingDto(booking);
}
```

**Правила**:
- ✅ Бронирование в статусе PENDING
- ✅ Для платных: `paymentStatus = SUCCEEDED`
- ✅ Для бесплатных: `paymentStatus = NOT_REQUIRED`
- ✅ Место НЕ возвращается (уже зарезервировано)

---

### 7. Отмена бронирования

**Endpoint**: `PUT /api/v1/bookings/{bookingId}/cancel` (USER)

**Процесс**:

```java
public BookingDto cancelBooking(UUID bookingId, UUID userId, String reason) {
    BookingEntity booking = findBookingByIdAndUserId(bookingId, userId);

    // Проверка статуса
    if (booking.getStatus() == BookingStatus.COMPLETED ||
        booking.getStatus() == BookingStatus.CANCELLED) {
        throw new BookingConflictException(
            "Cannot cancel booking in status: " + booking.getStatus());
    }

    BookingStatus oldStatus = booking.getStatus();
    booking.setStatus(BookingStatus.CANCELLED);
    booking = bookingRepository.save(booking);

    // Аудит с причиной
    JsonNode reasonNode = objectMapper.valueToTree(reason);
    createBookingLog(booking, BookingLogAction.CANCELLED,
        oldStatus, userId, reasonNode);

    // Вернуть место в событие
    eventRepository.incrementAvailable(booking.getEvent().getId());

    // Обработать waitlist
    waitlistService.processWaitlistForEvent(booking.getEvent().getId());

    // Инициировать возврат средств (если CONFIRMED и платное)
    if (oldStatus == BookingStatus.CONFIRMED && booking.requiresPayment()) {
        paymentClient.initiateRefund(booking.getPaymentId(), reason);
    }

    // Уведомление
    notificationService.sendBookingCancelled(booking, reason);

    log.info("Cancelled booking {}", bookingId);

    return bookingMapper.toBookingDto(booking);
}
```

**Правила**:
- ✅ Можно отменить PENDING или CONFIRMED
- ❌ Нельзя отменить COMPLETED, EXPIRED, CANCELLED, NO_SHOW
- ✅ Место возвращается в событие
- ✅ Обрабатывается waitlist
- ✅ Если CONFIRMED и платное → возврат средств
- ✅ Причина сохраняется в audit log

---

### 8. Waitlist Management

#### Присоединение к очереди

**Endpoint**: `POST /api/v1/events/{eventId}/waitlist` (USER)

**Процесс**:

```java
public WaitlistStatusDto joinWaitlist(UUID eventId, UUID userId) {
    // 1. Проверка события
    EventEntity event = eventRepository.findById(eventId)
        .orElseThrow(() -> new EventNotFoundException("Event not found"));

    if (!"PUBLISHED".equals(event.getStatus())) {
        throw new WaitlistException("Can only join waitlist for published events");
    }

    // 2. Проверка: есть ли доступные места?
    if (event.getAvailable() > 0) {
        throw new WaitlistException(
            "Event has available spots. Book directly instead.");
    }

    // 3. Проверка: уже в очереди?
    if (waitlistRepository.existsByEventIdAndUserId(eventId, userId)) {
        throw new WaitlistException("User is already in waitlist");
    }

    // 4. Получить следующий priority (FIFO)
    Integer maxPriority = waitlistRepository.getMaxPriorityForEvent(eventId);
    Integer newPriority = (maxPriority != null) ? maxPriority + 1 : 1;

    // 5. Создать запись
    WaitlistEntity waitlist = WaitlistEntity.builder()
        .eventId(eventId)
        .userId(userId)
        .priority(newPriority)
        .build();

    WaitlistEntity saved = waitlistRepository.save(waitlist);

    // 6. Аудит
    auditService.logJoined(eventId, userId, newPriority);

    log.info("User {} joined waitlist for event {} at position {}",
        userId, eventId, newPriority);

    return mapToStatusDto(saved);
}
```

**Правила**:
- ✅ Событие в статусе PUBLISHED
- ✅ Нет доступных мест (`available = 0`)
- ✅ Пользователь еще не в очереди
- ✅ Позиция = max(priority) + 1 (FIFO)
- ✅ Unique constraint: `(event_id, user_id)`
- ✅ Unique constraint: `(event_id, priority)`

---

#### Обработка очереди (при освобождении места)

**Triggers**:
- Истечение PENDING брони
- Отмена бронирования
- Организатор увеличивает capacity

**Процесс**:

```java
@Async
public void processWaitlistForEvent(UUID eventId) {
    EventEntity event = eventRepository.findById(eventId)
        .orElseThrow(() -> new EventNotFoundException("Event not found"));

    // Пока есть доступные места И есть очередь
    while (event.getAvailable() > 0) {
        // Найти следующего в очереди (min priority, не уведомленного)
        Optional<WaitlistEntity> nextOpt = waitlistRepository
            .findTopByEventIdAndNotifiedAtIsNullOrderByPriorityAsc(eventId);

        if (nextOpt.isEmpty()) {
            log.info("No more users in waitlist for event {}", eventId);
            break;
        }

        WaitlistEntity next = nextOpt.get();

        // Уведомить пользователя
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(30 * 60); // 30 минут

        next.setNotifiedAt(now);
        next.setNotificationExpiresAt(expiresAt);
        waitlistRepository.save(next);

        // Резервируем место (декремент available)
        eventRepository.decrementAvailableIfPositive(eventId);

        // Отправить уведомление
        notificationService.sendWaitlistSlotAvailable(
            next.getUserId(), eventId, expiresAt);

        // Аудит
        auditService.logNotified(eventId, next.getUserId(),
            next.getPriority(), expiresAt);

        log.info("Notified user {} about available spot for event {}. " +
            "Expires at {}", next.getUserId(), eventId, expiresAt);
    }
}
```

**Правила**:
- ✅ Обрабатывается асинхронно
- ✅ FIFO порядок (по `priority ASC`)
- ✅ Уведомляются только пользователи с `notifiedAt = null`
- ✅ Окно для бронирования: 30 минут
- ✅ Место резервируется сразу (`available--`)
- ✅ Если пользователь не забронирует → место освободится через 30 минут

---

#### Очистка expired уведомлений

**Scheduled Job**: Каждые 5 минут

```java
@Scheduled(fixedDelayString = "${app.waitlist.cleanup-interval-minutes:5}m")
@Transactional
public void cleanupExpiredNotifications() {
    Instant now = Instant.now();

    // Найти уведомления с истекшим окном
    List<WaitlistEntity> expired = waitlistRepository
        .findByNotificationExpiresAtBeforeAndNotifiedAtIsNotNull(now);

    log.info("Found {} expired waitlist notifications", expired.size());

    for (WaitlistEntity waitlist : expired) {
        try {
            // Удалить из очереди
            waitlistRepository.delete(waitlist);

            // Вернуть место в событие
            eventRepository.incrementAvailable(waitlist.getEventId());

            // Обработать следующего в очереди
            processWaitlistForEvent(waitlist.getEventId());

            // Аудит
            auditService.logExpired(waitlist.getEventId(),
                waitlist.getUserId(), waitlist.getPriority());

            log.info("Cleaned up expired notification for user {} and event {}",
                waitlist.getUserId(), waitlist.getEventId());

        } catch (Exception e) {
            log.error("Failed to cleanup waitlist {}: {}",
                waitlist.getId(), e.getMessage());
        }
    }
}
```

---

### 9. Завершение событий

**Scheduled Job**: Каждый час (`@Scheduled(cron = "0 0 * * * *")`)

```java
@Scheduled(cron = "0 0 * * * *")
@Transactional
public void completeFinishedEvents() {
    Instant now = Instant.now();

    // 1. Найти события с dateEnd < now и status = PUBLISHED
    List<EventEntity> finishedEvents = eventRepository
        .findByDateEndBeforeAndStatus(now, "PUBLISHED");

    log.info("Found {} finished events", finishedEvents.size());

    for (EventEntity event : finishedEvents) {
        // Изменить статус события
        event.setStatus("COMPLETED");
        eventRepository.save(event);

        // Изменить статус всех CONFIRMED бронирований на COMPLETED
        List<BookingEntity> confirmedBookings = bookingRepository
            .findByEventIdAndStatus(event.getId(), BookingStatus.CONFIRMED);

        for (BookingEntity booking : confirmedBookings) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);

            createBookingLog(booking, BookingLogAction.COMPLETED,
                BookingStatus.CONFIRMED, null, "Event completed");
        }

        log.info("Completed event {} with {} bookings",
            event.getId(), confirmedBookings.size());
    }
}
```

---

## Машина состояний

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

---

## Транзакционность

Все операции модификации выполняются в транзакциях:

```java
@Service
@Transactional  // Класс уровень
public class BookingService {

    // Методы модификации в транзакции по умолчанию
    public BookingDto createBooking(...) { }
    public void cancelBooking(...) { }

    // Read-only методы
    @Transactional(readOnly = true)
    public PagedResponse<BookingDto> getUserBookings(...) { }
}
```

**Гарантии**:
- **Atomicity**: Бронь создается + available декрементируется атомарно
- **Consistency**: available всегда корректный
- **Isolation**: Pessimistic/Optimistic locks предотвращают race conditions
- **Durability**: Все изменения персистятся в PostgreSQL

---

## Race Conditions

### Concurrent booking creation

**Проблема**: Два пользователя одновременно бронируют последнее место.

**Решение**: Атомарный декремент с проверкой

```sql
-- Атомарная операция
UPDATE event.events
SET available = available - 1
WHERE id = ? AND available > 0
RETURNING available;

-- Если вернулось NULL или 0 строк → rollback создания брони
```

**Альтернатива**: Pessimistic lock

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT e FROM EventEntity e WHERE e.id = :id")
Optional<EventEntity> findByIdWithLock(@Param("id") UUID id);
```

---

### Waitlist priority conflicts

**Проблема**: Два пользователя одновременно присоединяются к waitlist.

**Решение**: Unique constraint на `(event_id, priority)`

```sql
CREATE UNIQUE INDEX idx_waitlist_event_priority
ON event.waitlist(event_id, priority);
```

При конфликте → `DataIntegrityViolationException` → retry с новым priority.

---

## Валидации

### Event level

- ✅ `dateStart` в будущем
- ✅ `dateEnd` после `dateStart`
- ✅ `capacity` > 0
- ✅ `available` <= `capacity`
- ✅ `available` >= 0 (всегда)
- ✅ `price` >= 0 или null

### Booking level

- ✅ Только одна активная бронь (PENDING/CONFIRMED) на событие
- ✅ `expiresAt` = `createdAt` + 30 минут (для PENDING)
- ✅ `amount` фиксируется на момент создания
- ✅ `paymentStatus` соответствует `amount`

### Waitlist level

- ✅ Unique: `(event_id, user_id)`
- ✅ Unique: `(event_id, priority)`
- ✅ `priority` >= 1
- ✅ `notificationExpiresAt` = `notifiedAt` + 30 минут

---

## Интеграции

### С Payment Service

**Создание платежа**:
```java
PaymentInitResponse payment = paymentClient.initializePayment(
    bookingId, userId, amount, description);
booking.setPaymentId(payment.getPaymentId());
```

**Webhook от Payment** (успешная оплата):
```http
PUT /api/v1/bookings/payment/{paymentId}/confirm
→ Вызывает bookingService.confirmBookingAfterPayment(paymentId)
```

**Возврат средств** (при отмене):
```java
if (booking.getStatus() == BookingStatus.CONFIRMED && booking.requiresPayment()) {
    paymentClient.initiateRefund(booking.getPaymentId(), reason);
}
```

---

### С Notification Service

**События для уведомлений**:

1. **booking.created** (PENDING)
   - Email/Telegram с деталями и ссылкой на оплату
   - Напоминание об истечении через 25 минут

2. **booking.confirmed**
   - Email/Telegram с подтверждением
   - QR-код для регистрации на событии

3. **booking.expired**
   - Email/Telegram об истечении
   - Предложение присоединиться к waitlist

4. **booking.cancelled**
   - Email/Telegram об отмене
   - Информация о возврате средств (если платное)

5. **waitlist.slot_available**
   - Email/Telegram об освободившемся месте
   - Окно 30 минут для бронирования

6. **event.reminder** (за 24 часа)
   - Email/Telegram с напоминанием
   - Детали локации, времени, контакты

---

### С User Service (будущее)

**Валидация профиля** при создании бронирования:

```java
private void validateUserProfile(UUID userId) {
    UserProfileDto profile = userClient.getUserProfile(userId);

    // Должен быть заполнен phone ИЛИ telegram
    if (profile.getPhone() == null && profile.getTelegram() == null) {
        throw new ProfileIncompleteException(
            "Please complete your profile: phone or telegram required");
    }
}
```

---

## Audit Logging

Все изменения статусов бронирований логируются в `booking_logs`:

```java
private void createBookingLog(
    BookingEntity booking,
    BookingLogAction action,
    BookingStatus oldStatus,
    UUID changedBy,
    Object details
) {
    BookingLogEntity log = BookingLogEntity.builder()
        .booking(booking)
        .action(action.toString())
        .oldStatus(oldStatus != null ? oldStatus.toString() : null)
        .newStatus(booking.getStatus().toString())
        .changedBy(changedBy)
        .changedAt(Instant.now())
        .details(objectMapper.valueToTree(details))  // JSONB
        .build();

    bookingLogRepository.save(log);
}
```

**BookingLogAction enum**:
```java
public enum BookingLogAction {
    CREATED,
    CONFIRMED,
    CANCELLED,
    EXPIRED,
    COMPLETED,
    NO_SHOW
}
```

---

## Performance Considerations

### Оптимизация запросов

**N+1 проблема** при загрузке бронирований с событиями:

```java
// ❌ Плохо: N+1 запросы
List<BookingEntity> bookings = bookingRepository.findByUserId(userId);
// При итерации: N запросов для загрузки event для каждой брони

// ✅ Хорошо: Fetch Join
@Query("SELECT b FROM BookingEntity b " +
       "LEFT JOIN FETCH b.event e " +
       "LEFT JOIN FETCH e.organizer " +
       "WHERE b.userId = :userId")
List<BookingEntity> findByUserIdWithEvent(@Param("userId") UUID userId);
```

---

### Индексы

**Критичные для производительности**:

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
CREATE INDEX idx_waitlist_event_priority
    ON event.waitlist(event_id, priority);
CREATE INDEX idx_waitlist_notification_expires
    ON event.waitlist(notification_expires_at)
    WHERE notified_at IS NOT NULL;  -- Partial index
```

---

### Кэширование

**Candidates для кэша** (будущее):

```java
@Cacheable(value = "events", key = "#eventId")
public EventDto getEventById(UUID eventId) { }

@Cacheable(value = "organizers", key = "#slug")
public OrganizerDetailDto getOrganizerBySlug(String slug) { }
```

**Redis TTL**:
- Events: 5 минут
- Organizers: 15 минут
- Invalidation при обновлении

---

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

- `*NotFoundException` → 404 Not Found
- `*ConflictException` → 409 Conflict
- `UnauthorizedBookingAccessException` → 403 Forbidden
- `ProfileIncompleteException` → 422 Unprocessable Entity
- `ValidationException` → 400 Bad Request
- `IllegalStateException` → 400 Bad Request

---

## См. также

- [README](README.md) - обзор сервиса и entities
- [API Documentation](api.md) - детальное описание API endpoints
- [Operations](operations.md) - развертывание и мониторинг
- [Database Schema](../database.md) - схема event в PostgreSQL
- [Backend Common - Error Handling](../common/error-handling.md) - RFC 7807