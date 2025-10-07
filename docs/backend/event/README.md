# Event Service

## Обзор

**Порт**: 8102
**База данных**: PostgreSQL схема `event`
**Назначение**: Управление событиями, организаторами, бронированиями и waitlist

Event Service — центральный сервис платформы для создания мероприятий, обработки бронирований с автоматическим истечением (30 мин), FIFO waitlist и интеграции с Payment Service.

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

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Primary key |
| `slug` | String | Уникальный URL-friendly идентификатор |
| `name` | String | Название организации |
| `logoUrl` | String | Ссылка на логотип |
| `description` | String | Описание |
| `contacts` | JSONB | email, phone, telegram, website |
| `brandColor` | String | #HEX фирменный цвет |

**Отношения**: `OneToMany` → Event, TeamMember, FaqItem

### 2. Event (Событие)

Мероприятие с управлением вместимостью.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Primary key |
| `organizerSlug` | String | FK на организатора |
| `type` | String | Тип (сплав, регата, кемпинг) |
| `title` | String | Название события |
| `dateStart`, `dateEnd` | Instant | Даты начала и окончания |
| `location` | JSONB | address, city, coordinates |
| `price` | BigDecimal | Цена (null = бесплатное) |
| `capacity` | Integer | Максимальная вместимость |
| `available` | Integer | Доступные места |
| `status` | String | DRAFT \| PUBLISHED \| COMPLETED \| CANCELLED |
| `tags` | String[] | Теги для поиска |
| `description` | String | Полное описание |

**Отношения**: `ManyToOne` → Organizer; `OneToMany` → Booking, Waitlist

### 3. Booking (Бронирование)

Бронирование с автоматическим истечением.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Primary key |
| `eventId`, `userId` | UUID | FK на событие и пользователя |
| `status` | BookingStatus | PENDING \| CONFIRMED \| COMPLETED \| EXPIRED \| CANCELLED \| NO_SHOW |
| `amount` | BigDecimal | Зафиксированная цена |
| `paymentStatus` | PaymentStatus | NOT_REQUIRED \| PENDING \| PROCESSING \| SUCCEEDED \| FAILED \| REFUNDED |
| `paymentId` | UUID | ID платежа (если есть) |
| `expiresAt` | Instant | Время истечения (для PENDING, 30 мин) |
| `createdBy` | UUID | Кто создал |

**Методы**: `isExpired()`, `requiresPayment()`, `canBeConfirmed()`

### 4. BookingLog (Аудит бронирований)

| Поле | Тип | Описание |
|------|-----|----------|
| `id`, `bookingId` | UUID | - |
| `oldStatus`, `newStatus` | String | Переход статусов |
| `reason` | String | Причина изменения |
| `changedBy` | UUID | Кто изменил |
| `changedAt` | Instant | Когда |

### 5. Waitlist (Очередь ожидания)

FIFO очередь для заполненных событий.

| Поле | Тип | Описание |
|------|-----|----------|
| `id`, `eventId`, `userId` | UUID | - |
| `priority` | Integer | Позиция в очереди (уникальная) |
| `notifiedAt` | Instant | Когда уведомлен |
| `notificationExpiresAt` | Instant | До какого времени действует (30 мин) |

**Constraints**: Unique `(event_id, user_id)`, Unique `(event_id, priority)`

### 6-9. Дополнительные сущности

| Сущность | Описание | Ключевые поля |
|----------|----------|---------------|
| **WaitlistAudit** | История обработки waitlist | action (NOTIFIED \| CONVERTED \| REMOVED \| EXPIRED), details |
| **Favorites** | Избранные события | Composite key: `(userId, eventId)` |
| **TeamMember** | Команда организатора | name, role, photoUrl, bio |
| **FaqItem** | FAQ организатора | question, answer, position |

## API Endpoints

См. [api.md](api.md) для полного описания. Краткий обзор:

| Группа | Примеры | Доступ |
|--------|---------|--------|
| **Organizers** | `GET /organizers`, `GET /organizers/{slug}`, `GET /organizers/{slug}/events` | PUBLIC |
| **Events (Public)** | `GET /events`, `GET /events/{eventId}` | PUBLIC |
| **Events (Organizer)** | `POST /events`, `PUT /events/{eventId}`, `POST /events/{eventId}/publish` | ORGANIZER |
| **Bookings (User)** | `POST /bookings`, `GET /bookings`, `DELETE /bookings/{bookingId}` | USER |
| **Bookings (Organizer)** | `GET /events/{eventId}/bookings`, `PUT /bookings/{id}/confirm`, `PUT /bookings/{id}/no-show` | ORGANIZER |
| **Waitlist** | `POST /waitlist`, `DELETE /waitlist/{eventId}`, `GET /waitlist/{eventId}/position` | USER |
| **Favorites** | `POST /favorites/{eventId}`, `DELETE /favorites/{eventId}`, `GET /favorites` | USER |

## Бизнес-логика

См. [business-logic.md](business-logic.md) для детального описания. Основные процессы:

### Создание бронирования

**Процесс**:
1. Валидация события (PUBLISHED, есть места)
2. Проверка дубликатов (нет активной брони)
3. Создание брони со статусом PENDING, TTL 30 минут
4. Атомарный декремент `available`
5. Инициализация платежа (если платное)
6. Audit log + уведомление

**Исключения**: `EventNotFoundException`, `BookingConflictException` (нет мест / дубликат)

### Автоматическое истечение бронирований

**Scheduled Job**: Каждую минуту (`@Scheduled(cron = "0 * * * * *")`)

Находит PENDING брони с `expiresAt < now`, изменяет статус → EXPIRED, возвращает место, обрабатывает waitlist, отправляет уведомление.

### Waitlist Management

**Добавление**: Проверка отсутствия мест → получение `max(priority) + 1` → создание записи

**Обработка** (при освобождении места):
- FIFO порядок (min priority, не уведомленный)
- Уведомление с окном 30 минут
- Резервирование места (`available--`)
- Автоматическая очистка expired уведомлений (каждые 5 мин)

### Машина состояний

```
PENDING (30 мин)
   ├─→ CONFIRMED    (оплата успешна / бесплатное подтверждено)
   ├─→ EXPIRED      (истекло 30 минут)
   └─→ CANCELLED    (отменено пользователем)

CONFIRMED
   ├─→ COMPLETED    (событие прошло - scheduled job)
   ├─→ CANCELLED    (отмена с возвратом средств)
   └─→ NO_SHOW      (не явился - отметка организатора)

EXPIRED/CANCELLED/NO_SHOW
   └─→ (финальные состояния)
```

## База данных

### Схема event

**Таблицы**:
```sql
event.organizers         -- Организаторы (slug UNIQUE)
event.events             -- События (FK: organizer_slug)
event.bookings           -- Бронирования (FK: event_id, UNIQUE: event_id + user_id)
event.booking_logs       -- Аудит бронирований (FK: booking_id)
event.waitlist           -- Очередь (UNIQUE: event_id + user_id, event_id + priority)
event.waitlist_audit     -- Аудит waitlist
event.favorites          -- Избранное (PK: user_id + event_id)
event.team_members       -- Команда организатора
event.faq_items          -- FAQ
```

### Критичные индексы

```sql
-- Events
CREATE INDEX idx_events_organizer_slug ON event.events(organizer_slug);
CREATE INDEX idx_events_status ON event.events(status);
CREATE INDEX idx_events_date_start ON event.events(date_start);

-- Bookings
CREATE INDEX idx_bookings_event_id ON event.bookings(event_id);
CREATE INDEX idx_bookings_user_id ON event.bookings(user_id);
CREATE INDEX idx_bookings_status ON event.bookings(status);
CREATE INDEX idx_bookings_expires_at ON event.bookings(expires_at)
    WHERE status = 'PENDING';  -- Partial index

-- Waitlist
CREATE INDEX idx_waitlist_priority ON event.waitlist(event_id, priority);
```

## Конфигурация

```yaml
server:
  port: 8102

spring:
  application:
    name: backend-event
  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
  jpa:
    properties:
      hibernate:
        default_schema: event
  liquibase:
    change-log: classpath:migration/liquibase/master.xml
    default-schema: event

app:
  booking:
    expiration-minutes: 30                # TTL для PENDING
    cleanup-interval: "0 * * * * *"       # Cron: каждую минуту
  waitlist:
    notification-window-minutes: 30       # Окно после уведомления
    cleanup-interval-minutes: 5           # Очистка expired
```

## Интеграции

### С Payment Service

| Операция | Endpoint/Метод |
|----------|----------------|
| Создание платежа | `paymentClient.createPayment(bookingId, userId, amount, description)` |
| Webhook (оплата) | `POST /bookings/{bookingId}/payment-callback` → `confirmBooking()` |
| Возврат средств | `paymentClient.initiateRefund(paymentId, reason)` (при отмене CONFIRMED) |

### С Notification Service

**События для уведомлений**:
- `booking.created` (PENDING) → email/Telegram с деталями и ссылкой на оплату
- `booking.confirmed` → подтверждение с QR-кодом
- `booking.expired` → уведомление об истечении, предложение waitlist
- `booking.cancelled` → информация о возврате средств
- `waitlist.slot_available` → окно 30 минут на бронирование
- `event.reminder` (за 24 часа) → напоминание с деталями

### С User Service (будущее)

Валидация профиля при бронировании: phone ИЛИ telegram должны быть заполнены.

## Scheduled Jobs

| Job | Частота | Задача |
|-----|---------|--------|
| **Expire Pending Bookings** | Каждую минуту | PENDING → EXPIRED, вернуть места, обработать waitlist |
| **Complete Finished Events** | Каждый час | События с `dateEnd < now` → COMPLETED, брони CONFIRMED → COMPLETED |
| **Cleanup Waitlist Notifications** | Каждые 5 минут | Удалить expired уведомления, вернуть места, обработать очередь |

## Права доступа

| Роль | Права |
|------|-------|
| **GUEST** | Просмотр опубликованных событий, организаторов, команды, FAQ |
| **USER** | GUEST + создание/отмена бронирований, избранное, waitlist |
| **ORGANIZER** | Создание/управление событиями, публикация, просмотр броней, подтверждение (бесплатных), no-show, управление командой/FAQ |
| **ADMIN** | Все права ORGANIZER для всех событий |

## Мониторинг

```bash
# Health check
curl http://localhost:8102/actuator/health

# Метрики
curl http://localhost:8102/actuator/metrics/aquastream.bookings.active
curl http://localhost:8102/actuator/metrics/aquastream.bookings.create.latency.p95

# Логи
docker logs aquastream-backend-event
docker logs aquastream-backend-event 2>&1 | grep "BookingService"
```

---

См. [API Documentation](api.md), [Business Logic](business-logic.md), [Operations](operations.md), [Database Schema](../database.md), [Payment Service](../payment/README.md).