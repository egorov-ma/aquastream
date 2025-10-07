# Event Service - API Documentation

## Обзор

Event Service - REST API для управления организаторами, событиями, бронированиями и waitlist.

**Base URL**: `http://localhost:8102/api/v1`
**Аутентификация**: JWT через Gateway (`X-User-Id`, `X-User-Role`)
**Формат**: JSON
**Ошибки**: RFC 7807 Problem Details

## API Endpoints

### Organizers

| Метод | Endpoint | Описание | Права | Ключевые параметры |
|-------|----------|----------|-------|-------------------|
| GET | `/organizers` | Список организаторов | PUBLIC | `search`, `page`, `size` |
| GET | `/organizers/{slug}` | Детали организатора | PUBLIC | - |
| GET | `/organizers/{slug}/team` | Команда организатора | PUBLIC | - |
| GET | `/organizers/{slug}/faq` | FAQ организатора | PUBLIC | - |
| GET | `/organizers/{slug}/events` | События организатора | PUBLIC | `status`, `type`, `minPrice`, `maxPrice`, `dateFrom`, `dateTo` |

### Events (Public)

| Метод | Endpoint | Описание | Права | Ключевые параметры |
|-------|----------|----------|-------|-------------------|
| GET | `/events` | Все опубликованные события | PUBLIC | `status`, `type`, `minPrice`, `maxPrice`, `dateFrom`, `dateTo`, `search` |
| GET | `/events/{eventId}` | Детали события | PUBLIC | - |
| GET | `/events/{eventId}/favorites/count` | Количество в избранном | PUBLIC | - |

### Events Management (Organizer)

| Метод | Endpoint | Описание | Права | Бизнес-правила |
|-------|----------|----------|-------|----------------|
| POST | `/events` | Создать событие | ORGANIZER | Статус DRAFT, dateStart в будущем |
| PUT | `/events/{eventId}` | Обновить событие | ORGANIZER | Нельзя уменьшить capacity ниже подтвержденных броней, нельзя менять за 24ч до начала |
| POST | `/events/{eventId}/publish` | Опубликовать событие | ORGANIZER | Только из DRAFT, все поля заполнены |

### Bookings (User)

| Метод | Endpoint | Описание | Права | Бизнес-правила |
|-------|----------|----------|-------|----------------|
| POST | `/bookings` | Создать бронь | USER | Событие PUBLISHED, есть места, нет активной брони, dateStart в будущем |
| GET | `/bookings` | Список броней | USER | `status`, `page`, `size` |
| GET | `/bookings/{bookingId}` | Детали брони | USER | Только свои брони |
| PUT | `/bookings/{bookingId}/confirm` | Подтвердить бронь | USER | Для бесплатных или после оплаты |
| PUT | `/bookings/{bookingId}/cancel` | Отменить бронь | USER | PENDING/CONFIRMED, инициирует возврат |

### Waitlist (User)

| Метод | Endpoint | Описание | Права | Бизнес-правила |
|-------|----------|----------|-------|----------------|
| POST | `/events/{eventId}/waitlist` | Присоединиться к очереди | USER | Событие заполнено, не в очереди, нет активной брони |
| DELETE | `/events/{eventId}/waitlist` | Покинуть очередь | USER | - |
| GET | `/events/{eventId}/waitlist/status` | Статус в очереди | USER | - |
| GET | `/waitlist` | Все очереди пользователя | USER | - |

### Favorites (User)

| Метод | Endpoint | Описание | Права |
|-------|----------|----------|-------|
| POST | `/events/{eventId}/favorite` | Добавить в избранное | USER |
| DELETE | `/events/{eventId}/favorite` | Удалить из избранного | USER |
| GET | `/profile/favorites` | Список избранного | USER |
| GET | `/events/{eventId}/favorite/status` | Проверить избранное | USER |

### Internal (Service-to-Service)

| Метод | Endpoint | Описание | Права |
|-------|----------|----------|-------|
| PUT | `/bookings/payment/{paymentId}/status` | Обновить статус оплаты | SERVICE |
| PUT | `/bookings/payment/{paymentId}/confirm` | Подтвердить после оплаты | SERVICE |

## Schemas

### Event

```typescript
{
  id: string;                   // UUID
  organizerSlug: string;
  type: string;                 // "сплав", "поход", etc.
  title: string;                // 3-500 символов
  dateStart: string;            // ISO 8601
  dateEnd: string;
  location: {
    address?: string;
    city?: string;
    coordinates?: { lat: number; lng: number; };
  };
  price: number | null;         // null = бесплатное
  capacity: number;             // > 0
  available: number;            // Свободные места
  status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
  tags: string[];
  description: string | null;
  createdAt: string;
  updatedAt: string;

  // Computed
  isFull: boolean;
  registrationOpen: boolean;
  isPast: boolean;
}
```

### Booking

```typescript
{
  id: string;
  eventId: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "NO_SHOW";
  amount: number | null;        // Зафиксированная цена
  paymentStatus: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "NOT_REQUIRED";
  paymentId: string | null;
  expiresAt: string | null;     // now + 30 минут для PENDING
  createdAt: string;
  updatedAt: string;

  // Actions
  actions: {
    canCancel: boolean;
    canConfirm: boolean;
    paymentUrl: string | null;
  };
}
```

### Paginated Response

```typescript
{
  items: T[];
  total: number;
  page: number;                 // 0-indexed
  size: number;                 // default: 20, max: 100
  totalPages: number;
}
```

## Примеры использования

### Создать событие

```bash
curl -X POST http://localhost:8102/api/v1/events \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-User-Role: ORGANIZER" \
  -d '{
    "type": "сплав",
    "title": "Сплав по реке Белая - июнь 2024",
    "dateStart": "2024-06-15T10:00:00Z",
    "dateEnd": "2024-06-17T18:00:00Z",
    "location": {
      "address": "Республика Адыгея, станица Даховская",
      "city": "Даховская",
      "coordinates": { "lat": 44.2, "lng": 40.1 }
    },
    "price": 4500,
    "capacity": 30,
    "tags": ["сплав", "катамаран", "3 дня"]
  }'
```

**Response** `201 Created`: Событие со статусом `DRAFT`

### Создать бронирование

```bash
curl -X POST http://localhost:8102/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-User-Role: USER" \
  -d '{"eventId": "123e4567-e89b-12d3-a456-426614174000"}'
```

**Response** `201 Created`: Бронь со статусом `PENDING`, `expiresAt` через 30 минут

### Поиск событий

```bash
curl "http://localhost:8102/api/v1/events?status=PUBLISHED&type=сплав&minPrice=0&maxPrice=5000&dateFrom=2024-06-01T00:00:00Z&search=Белая"
```

## Error Handling

Все ошибки в формате RFC 7807:

```typescript
{
  type: string;                 // https://aquastream.org/problems/{type}
  title: string;
  status: number;               // HTTP код
  detail: string;
  timestamp: string;
  // Дополнительные поля зависят от типа ошибки
}
```

### Коды ошибок

| Код | Описание | Примеры |
|-----|----------|---------|
| 400 | Bad Request | Невалидный body, нарушены бизнес-правила |
| 401 | Unauthorized | Отсутствует/невалидный JWT |
| 403 | Forbidden | Недостаточно прав, чужие данные |
| 404 | Not Found | Ресурс не найден |
| 409 | Conflict | Дубликат брони, событие заполнено |
| 422 | Unprocessable Entity | Некорректные даты, constraints |
| 429 | Too Many Requests | Rate limit (см. backend-common) |

### Примеры ошибок

**Validation Error** (400):
```typescript
{
  type: "https://aquastream.org/problems/validation-error",
  title: "Validation Error",
  status: 400,
  detail: "Validation failed for request body",
  errors: [
    { field: "dateStart", message: "Date must be in the future" },
    { field: "capacity", message: "Must be greater than 0" }
  ],
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

**Booking Conflict** (409):
```typescript
{
  type: "https://aquastream.org/problems/booking-conflict",
  title: "Booking Conflict",
  status: 409,
  detail: "User already has an active booking for this event",
  existingBookingId: "123e4567-e89b-12d3-a456-426614174000",
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

**Event Full** (409):
```typescript
{
  type: "https://aquastream.org/problems/event-full",
  title: "Event At Capacity",
  status: 409,
  detail: "Event is at full capacity. Please join the waitlist.",
  waitlistAvailable: true,
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

## Features

### Pagination

Все list endpoints поддерживают пагинацию:
- `page` - номер страницы (0-indexed, default: 0)
- `size` - размер страницы (default: 20, max: 100)

### Filtering & Search

**Events filtering**:
```http
GET /api/v1/events?status=PUBLISHED&type=сплав&minPrice=0&maxPrice=10000
  &dateFrom=2024-06-01T00:00:00Z&dateTo=2024-08-31T23:59:59Z
  &search=Белая
```

Search работает по: `title`, `description`, `tags` (полнотекстовый поиск)

### Sorting

По умолчанию:
- Events: `dateStart ASC`
- Bookings: `createdAt DESC`
- Waitlist: `priority ASC`

### Rate Limiting

- Default: 100 req/min
- Создание бронирований: 20 req/min

Headers: `X-RateLimit-Remaining: 95`
Ошибка: `429 Too Many Requests` с `Retry-After: 60`

## Webhooks

Event Service отправляет события в Notification Service:

| Event | Когда | Данные |
|-------|-------|--------|
| `booking.created` | Создана бронь | bookingId, userId, eventId, amount, expiresAt, paymentUrl |
| `booking.confirmed` | Подтверждена бронь | bookingId, userId, eventId, eventTitle, eventDateStart |
| `booking.expired` | Истекла бронь | bookingId, userId, eventId |
| `waitlist.slot_available` | Освободилось место | waitlistId, userId, eventId, priority, expiresAt |

## OpenAPI / Swagger

Интерактивная документация:
- **Swagger UI**: `http://localhost:8102/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8102/v3/api-docs`
- **ReDoc**: `http://localhost:8102/redoc`

## См. также

- [README](README.md) - обзор сервиса и entities
- [Business Logic](business-logic.md) - детальные бизнес-правила
- [Operations](operations.md) - развертывание и мониторинг
- [Backend Common - Error Handling](../common/error-handling.md)
- [Backend Common - Rate Limiting](../common/rate-limiting.md)