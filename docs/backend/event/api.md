# Event Service - API Documentation

## Обзор

Event Service предоставляет REST API для управления организаторами, событиями, бронированиями и waitlist.

**Base URL**: `http://localhost:8102/api/v1`
**Аутентификация**: JWT через Gateway (headers: `X-User-Id`, `X-User-Role`)
**Формат**: JSON
**Ошибки**: RFC 7807 Problem Details

## Public Endpoints

### Organizers

#### GET /organizers

Получить список всех организаторов с пагинацией.

**Права доступа**: PUBLIC (без аутентификации)

**Query Parameters**:
```typescript
{
  search?: string;    // Поиск по имени организатора
  page?: number;      // Номер страницы (default: 0)
  size?: number;      // Размер страницы (default: 20)
}
```

**Response** `200 OK`:
```typescript
{
  items: [
    {
      id: string;              // UUID
      slug: string;            // URL-friendly идентификатор
      name: string;
      logoUrl: string | null;
      description: string | null;
      brandColor: string | null;  // #RRGGBB
      eventsCount: number;     // Количество активных событий
    }
  ],
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
```

**Пример**:
```bash
curl "http://localhost:8102/api/v1/organizers?search=aqua&page=0&size=10"
```

---

#### GET /organizers/{slug}

Получить детальную информацию об организаторе.

**Права доступа**: PUBLIC

**Path Parameters**:
- `slug` - уникальный slug организатора

**Response** `200 OK`:
```typescript
{
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  contacts: {
    email?: string;
    phone?: string;
    telegram?: string;
    website?: string;
  } | null;
  brandColor: string | null;
  createdAt: string;           // ISO 8601
  updatedAt: string;

  // Статистика
  stats: {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
  };
}
```

**Response** `404 Not Found`:
```typescript
{
  type: "https://aquastream.org/problems/organizer-not-found",
  title: "Organizer Not Found",
  status: 404,
  detail: "Organizer with slug 'invalid-slug' not found",
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

---

#### GET /organizers/{slug}/team

Получить команду организатора.

**Права доступа**: PUBLIC

**Response** `200 OK`:
```typescript
[
  {
    id: string;
    organizerSlug: string;
    name: string;
    role: string;              // "Founder", "Event Manager", etc.
    photoUrl: string | null;
    bio: string | null;
    createdAt: string;
  }
]
```

---

#### GET /organizers/{slug}/faq

Получить FAQ организатора.

**Права доступа**: PUBLIC

**Response** `200 OK`:
```typescript
[
  {
    id: string;
    organizerSlug: string;
    question: string;
    answer: string;
    position: number;          // Порядок отображения
  }
]
```

---

#### GET /organizers/{slug}/events

Получить события организатора с фильтрацией.

**Права доступа**: PUBLIC

**Query Parameters**:
```typescript
{
  status?: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
  type?: string;               // Тип события
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;           // ISO 8601
  dateTo?: string;             // ISO 8601
  page?: number;
  size?: number;
}
```

**Response** `200 OK`:
```typescript
{
  items: [
    {
      id: string;
      organizerSlug: string;
      type: string;
      title: string;
      dateStart: string;       // ISO 8601
      dateEnd: string;
      location: {
        address?: string;
        city?: string;
        coordinates?: {
          lat: number;
          lng: number;
        };
      };
      price: number | null;    // null для бесплатных
      capacity: number;
      available: number;       // Доступные места
      status: string;
      tags: string[];
      description: string | null;

      // Дополнительная информация
      organizer: {
        slug: string;
        name: string;
        logoUrl: string | null;
      };

      isFull: boolean;         // available === 0
      registrationOpen: boolean;
    }
  ],
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
```

---

### Events

#### GET /events

Получить все опубликованные события с фильтрацией и поиском.

**Права доступа**: PUBLIC

**Query Parameters**:
```typescript
{
  status?: "PUBLISHED" | "COMPLETED";  // По умолчанию PUBLISHED
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;           // ISO 8601
  dateTo?: string;
  search?: string;             // Поиск по названию, описанию, тегам
  page?: number;
  size?: number;
}
```

**Response** `200 OK`: Аналогичен GET /organizers/{slug}/events

**Пример**:
```bash
curl "http://localhost:8102/api/v1/events?status=PUBLISHED&type=сплав&minPrice=0&maxPrice=5000&dateFrom=2024-06-01T00:00:00Z"
```

---

#### GET /events/{eventId}

Получить детальную информацию о событии.

**Права доступа**: PUBLIC

**Path Parameters**:
- `eventId` - UUID события

**Response** `200 OK`:
```typescript
{
  id: string;
  organizerSlug: string;
  type: string;
  title: string;
  dateStart: string;
  dateEnd: string;
  location: {
    address?: string;
    city?: string;
    coordinates?: { lat: number; lng: number; };
  };
  price: number | null;
  capacity: number;
  available: number;
  status: string;
  tags: string[];
  description: string | null;
  createdAt: string;
  updatedAt: string;

  // Вложенная информация об организаторе
  organizer: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    description: string | null;
    contacts: object | null;
    brandColor: string | null;
  };

  // Статистика
  stats: {
    confirmedBookings: number;
    waitlistSize: number;
    favoriteCount: number;
  };

  // Вычисляемые поля
  isFull: boolean;
  registrationOpen: boolean;
  isPast: boolean;
}
```

**Response** `404 Not Found`:
```typescript
{
  type: "https://aquastream.org/problems/event-not-found",
  title: "Event Not Found",
  status: 404,
  detail: "Event with id '550e8400-e29b-41d4-a716-446655440000' not found",
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

---

## Organizer Endpoints

### Events Management

#### POST /events

Создать новое событие.

**Права доступа**: ORGANIZER
**Headers**: `X-User-Id`, `X-User-Role: ORGANIZER`

**Request Body**:
```typescript
{
  type: string;                // Обязательно, max 50 символов
  title: string;               // Обязательно, max 500 символов
  dateStart: string;           // Обязательно, ISO 8601, в будущем
  dateEnd: string;             // Обязательно, ISO 8601, после dateStart
  location: {                  // Обязательно
    address?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price?: number;              // >= 0, null для бесплатных
  capacity: number;            // Обязательно, > 0
  tags?: string[];
  description?: string;
}
```

**Валидация**:
- `title`: не пустой, 3-500 символов
- `dateStart`: в будущем
- `dateEnd`: после `dateStart`
- `capacity`: целое число > 0
- `price`: >= 0 или null

**Response** `201 Created`:
```typescript
{
  id: string;                  // UUID созданного события
  organizerSlug: string;       // Автоматически из JWT
  type: string;
  title: string;
  dateStart: string;
  dateEnd: string;
  location: object;
  price: number | null;
  capacity: number;
  available: number;           // = capacity при создании
  status: "DRAFT";             // Всегда DRAFT при создании
  tags: string[];
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Пример**:
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
    "tags": ["сплав", "катамаран", "3 дня"],
    "description": "Захватывающий трёхдневный сплав..."
  }'
```

**Response** `400 Bad Request`:
```typescript
{
  type: "https://aquastream.org/problems/validation-error",
  title: "Validation Error",
  status: 400,
  detail: "Validation failed for request body",
  errors: [
    {
      field: "dateStart",
      message: "Date must be in the future"
    },
    {
      field: "title",
      message: "Title must be between 3 and 500 characters"
    }
  ],
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

---

#### PUT /events/{eventId}

Обновить существующее событие.

**Права доступа**: ORGANIZER (только свои события)
**Path Parameters**: `eventId` - UUID события

**Request Body**: Аналогичен POST /events (все поля опциональны)

**Бизнес-правила**:
- ❌ Нельзя уменьшить `capacity` ниже количества подтвержденных броней
- ❌ Нельзя изменять опубликованное событие за 24 часа до начала
- ❌ Нельзя изменить `dateStart` на прошедшую дату

**Response** `200 OK`: Обновленное событие

**Response** `403 Forbidden`:
```typescript
{
  type: "https://aquastream.org/problems/event-locked",
  title: "Event Modification Not Allowed",
  status: 403,
  detail: "Cannot modify event within 24 hours of start time",
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

---

#### POST /events/{eventId}/publish

Опубликовать событие (DRAFT → PUBLISHED).

**Права доступа**: ORGANIZER
**Path Parameters**: `eventId`

**Response** `200 OK`:
```typescript
{
  id: string;
  // ... остальные поля события
  status: "PUBLISHED";         // Изменен статус
  publishedAt: string;         // Добавлено время публикации
}
```

**Бизнес-правила**:
- ✅ Событие должно быть в статусе DRAFT
- ✅ Все обязательные поля заполнены
- ✅ `dateStart` в будущем

---

## User Endpoints

### Bookings

#### POST /bookings

Создать бронирование для авторизованного пользователя.

**Права доступа**: USER
**Headers**: `X-User-Id`

**Request Body**:
```typescript
{
  eventId: string;             // UUID события, обязательно
}
```

**Бизнес-правила**:
- ✅ Событие в статусе PUBLISHED
- ✅ Есть доступные места (`available > 0`)
- ✅ У пользователя нет активной брони (PENDING/CONFIRMED) на это событие
- ✅ Дата начала события в будущем

**Response** `201 Created`:
```typescript
{
  id: string;                  // UUID брони
  eventId: string;
  userId: string;
  status: "PENDING";           // Всегда PENDING при создании
  amount: number | null;       // Зафиксированная цена
  paymentStatus: "PENDING" | "NOT_REQUIRED";
  paymentId: string | null;    // ID платежа (если платное)
  expiresAt: string;           // Время истечения (now + 30 минут)
  createdAt: string;
  updatedAt: string;

  // Вложенная информация о событии
  event: {
    id: string;
    title: string;
    dateStart: string;
    dateEnd: string;
    location: object;
    organizerSlug: string;
  };

  // Действия
  actions: {
    canCancel: boolean;
    canConfirm: boolean;       // true для бесплатных
    paymentUrl: string | null; // Ссылка на оплату (если платное)
  };
}
```

**Response** `409 Conflict` (уже есть бронь):
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

**Response** `409 Conflict` (нет мест):
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

**Пример**:
```bash
curl -X POST http://localhost:8102/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-User-Role: USER" \
  -d '{"eventId": "123e4567-e89b-12d3-a456-426614174000"}'
```

---

#### GET /bookings

Получить бронирования пользователя с фильтрацией.

**Права доступа**: USER
**Headers**: `X-User-Id`

**Query Parameters**:
```typescript
{
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "NO_SHOW";
  page?: number;
  size?: number;
}
```

**Response** `200 OK`:
```typescript
{
  items: [
    {
      id: string;
      eventId: string;
      userId: string;
      status: string;
      amount: number | null;
      paymentStatus: string;
      paymentId: string | null;
      expiresAt: string | null;
      createdAt: string;
      updatedAt: string;

      // Вложенная информация
      event: {
        id: string;
        title: string;
        dateStart: string;
        dateEnd: string;
        location: object;
        organizerSlug: string;
        organizerName: string;
      };

      // Действия
      actions: {
        canCancel: boolean;
        canConfirm: boolean;
      };
    }
  ],
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
```

---

#### GET /bookings/{bookingId}

Получить детали конкретного бронирования.

**Права доступа**: USER (только свои бронирования)
**Path Parameters**: `bookingId`

**Response** `200 OK`: Объект бронирования (см. выше)

**Response** `404 Not Found`:
```typescript
{
  type: "https://aquastream.org/problems/booking-not-found",
  title: "Booking Not Found",
  status: 404,
  detail: "Booking not found or access denied",
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

---

#### PUT /bookings/{bookingId}/confirm

Подтвердить бронирование (для бесплатных событий).

**Права доступа**: USER
**Path Parameters**: `bookingId`

**Бизнес-правила**:
- ✅ Бронирование в статусе PENDING
- ✅ Событие бесплатное (`amount = null` или `amount = 0`)
- ✅ Или оплата уже прошла (`paymentStatus = SUCCEEDED`)

**Response** `200 OK`:
```typescript
{
  id: string;
  // ... остальные поля
  status: "CONFIRMED";         // Изменен статус
  paymentStatus: "NOT_REQUIRED";
}
```

**Response** `400 Bad Request`:
```typescript
{
  type: "https://aquastream.org/problems/invalid-booking-state",
  title: "Invalid Booking State",
  status: 400,
  detail: "Booking requires payment before confirmation",
  paymentUrl: "https://payment.example.com/...",
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

---

#### PUT /bookings/{bookingId}/cancel

Отменить бронирование.

**Права доступа**: USER
**Path Parameters**: `bookingId`
**Query Parameters**:
```typescript
{
  reason?: string;             // Причина отмены (опционально)
}
```

**Бизнес-правила**:
- ✅ Бронирование в статусе PENDING или CONFIRMED
- ✅ Если CONFIRMED и платное → инициируется возврат средств
- ✅ Место возвращается в событие
- ✅ Обрабатывается waitlist

**Response** `200 OK`:
```typescript
{
  id: string;
  // ... остальные поля
  status: "CANCELLED";
  cancelledAt: string;
  cancellationReason: string | null;
  refundInitiated: boolean;    // true если был возврат
}
```

---

### Waitlist

#### POST /events/{eventId}/waitlist

Присоединиться к очереди ожидания.

**Права доступа**: USER
**Path Parameters**: `eventId`

**Бизнес-правила**:
- ✅ Событие заполнено (`available = 0`)
- ✅ Пользователь еще не в очереди
- ✅ У пользователя нет активной брони на это событие

**Response** `201 Created`:
```typescript
{
  id: string;
  eventId: string;
  userId: string;
  priority: number;            // Позиция в очереди (1, 2, 3...)
  notifiedAt: string | null;
  notificationExpiresAt: string | null;
  createdAt: string;

  event: {
    id: string;
    title: string;
    dateStart: string;
  };

  estimatedWaitTime: string;   // "1-2 days", "1 week", etc.
}
```

**Response** `409 Conflict`:
```typescript
{
  type: "https://aquastream.org/problems/waitlist-conflict",
  title: "Already in Waitlist",
  status: 409,
  detail: "User is already in the waitlist for this event",
  existingPosition: 5,
  timestamp: "2024-01-15T10:23:45.123Z"
}
```

---

#### DELETE /events/{eventId}/waitlist

Покинуть очередь ожидания.

**Права доступа**: USER
**Path Parameters**: `eventId`

**Response** `204 No Content`

---

#### GET /events/{eventId}/waitlist/status

Получить статус в очереди ожидания.

**Права доступа**: USER
**Path Parameters**: `eventId`

**Response** `200 OK`:
```typescript
{
  id: string;
  eventId: string;
  userId: string;
  priority: number;
  notifiedAt: string | null;
  notificationExpiresAt: string | null;
  createdAt: string;

  // Дополнительная информация
  isNotified: boolean;         // Было ли уведомление о доступности
  timeRemaining: string | null; // Оставшееся время для брони (если уведомлен)
}
```

**Response** `404 Not Found`: Пользователь не в очереди

---

#### GET /waitlist

Получить все очереди пользователя.

**Права доступа**: USER

**Response** `200 OK`:
```typescript
[
  {
    id: string;
    eventId: string;
    priority: number;
    notifiedAt: string | null;
    notificationExpiresAt: string | null;
    createdAt: string;

    event: {
      id: string;
      title: string;
      dateStart: string;
      organizerName: string;
    };
  }
]
```

---

### Favorites

#### POST /events/{eventId}/favorite

Добавить событие в избранное.

**Права доступа**: USER
**Path Parameters**: `eventId`

**Response** `200 OK`:
```typescript
{
  success: true;
  message: "Event added to favorites";
  favoriteCount: number;       // Общее количество пользователей, добавивших в избранное
}
```

**Idempotent**: Повторный вызов вернет success=true

---

#### DELETE /events/{eventId}/favorite

Удалить событие из избранного.

**Права доступа**: USER
**Path Parameters**: `eventId`

**Response** `200 OK`:
```typescript
{
  success: true;
  message: "Event removed from favorites";
  favoriteCount: number;
}
```

---

#### GET /profile/favorites

Получить избранные события пользователя.

**Права доступа**: USER

**Response** `200 OK`:
```typescript
[
  {
    userId: string;
    eventId: string;
    createdAt: string;

    // Вложенная информация о событии
    event: {
      id: string;
      title: string;
      dateStart: string;
      dateEnd: string;
      location: object;
      price: number | null;
      available: number;
      status: string;
      organizerName: string;
      organizerSlug: string;
    };
  }
]
```

---

#### GET /events/{eventId}/favorite/status

Проверить, добавлено ли событие в избранное.

**Права доступа**: USER
**Path Parameters**: `eventId`

**Response** `200 OK`:
```typescript
true  // или false
```

---

#### GET /events/{eventId}/favorites/count

Получить количество добавлений в избранное.

**Права доступа**: PUBLIC
**Path Parameters**: `eventId`

**Response** `200 OK`:
```typescript
42  // количество
```

---

## Internal Endpoints

### Payment Service Integration

#### PUT /bookings/payment/{paymentId}/status

Обновить статус оплаты бронирования (вызывается Payment Service).

**Права доступа**: SERVICE (internal)
**Path Parameters**: `paymentId`

**Request Body**:
```typescript
{
  paymentStatus: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
}
```

**Response** `200 OK`: Обновленное бронирование

---

#### PUT /bookings/payment/{paymentId}/confirm

Подтвердить бронирование после успешной оплаты.

**Права доступа**: SERVICE (internal)
**Path Parameters**: `paymentId`

**Response** `200 OK`: Подтвержденное бронирование с status=CONFIRMED

---

## Error Responses

Все ошибки возвращаются в формате RFC 7807 Problem Details:

```typescript
{
  type: string;                // URI проблемы
  title: string;               // Человекочитаемый заголовок
  status: number;              // HTTP статус код
  detail: string;              // Детальное описание
  instance?: string;           // URI запроса
  timestamp: string;           // ISO 8601

  // Дополнительные поля (зависит от типа ошибки)
  [key: string]: any;
}
```

### Стандартные коды ошибок

**400 Bad Request**:
- Невалидный request body
- Нарушены бизнес-правила

**401 Unauthorized**:
- Отсутствует JWT токен
- Невалидный токен

**403 Forbidden**:
- Недостаточно прав
- Попытка доступа к чужим данным

**404 Not Found**:
- Ресурс не найден

**409 Conflict**:
- Конфликт бронирований
- Дубликат в waitlist
- Событие заполнено

**422 Unprocessable Entity**:
- Некорректные даты
- Нарушение constraints

**429 Too Many Requests**:
- Rate limit exceeded (см. backend-common)

**500 Internal Server Error**:
- Внутренняя ошибка сервера

---

## Rate Limiting

Применяются лимиты из backend-common:

- **Default**: 100 req/min
- **Login endpoints**: 10 req/min
- **Создание бронирований**: 20 req/min (кастомный лимит)

Headers в ответе:
```
X-RateLimit-Remaining: 95
```

При превышении → `429 Too Many Requests` с header `Retry-After: 60`

---

## Pagination

Все list endpoints поддерживают пагинацию:

**Query Parameters**:
- `page` - номер страницы (0-indexed, default: 0)
- `size` - размер страницы (default: 20, max: 100)

**Response**:
```typescript
{
  items: T[];
  total: number;              // Общее количество элементов
  page: number;               // Текущая страница
  size: number;               // Размер страницы
  totalPages: number;         // Общее количество страниц
}
```

---

## Filtering & Search

### Events filtering

```http
GET /api/v1/events?status=PUBLISHED&type=сплав&minPrice=0&maxPrice=10000
  &dateFrom=2024-06-01T00:00:00Z&dateTo=2024-08-31T23:59:59Z
  &search=Белая&page=0&size=20
```

**Search** работает по полям:
- `title` (полнотекстовый поиск)
- `description`
- `tags` (массив)

**Фильтры** объединяются через AND:
```sql
WHERE status = 'PUBLISHED'
  AND type = 'сплав'
  AND price BETWEEN 0 AND 10000
  AND date_start >= '2024-06-01'
  AND date_start <= '2024-08-31'
  AND (title ILIKE '%Белая%' OR 'Белая' = ANY(tags))
```

---

## Sorting

По умолчанию:
- **Events**: сортировка по `dateStart ASC`
- **Bookings**: сортировка по `createdAt DESC`
- **Waitlist**: сортировка по `priority ASC`

Кастомная сортировка (в разработке):
```http
GET /api/v1/events?sort=price,asc&sort=dateStart,desc
```

---

## Webhooks

Event Service отправляет webhooks в Notification Service:

### booking.created
```json
{
  "type": "booking.created",
  "timestamp": "2024-01-15T10:23:45.123Z",
  "data": {
    "bookingId": "uuid",
    "userId": "uuid",
    "eventId": "uuid",
    "amount": 4500,
    "expiresAt": "2024-01-15T10:53:45.123Z",
    "paymentUrl": "https://..."
  }
}
```

### booking.confirmed
```json
{
  "type": "booking.confirmed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "bookingId": "uuid",
    "userId": "uuid",
    "eventId": "uuid",
    "eventTitle": "Сплав по реке Белая",
    "eventDateStart": "2024-06-15T10:00:00Z"
  }
}
```

### booking.expired
```json
{
  "type": "booking.expired",
  "timestamp": "2024-01-15T10:53:45.123Z",
  "data": {
    "bookingId": "uuid",
    "userId": "uuid",
    "eventId": "uuid"
  }
}
```

### waitlist.slot_available
```json
{
  "type": "waitlist.slot_available",
  "timestamp": "2024-01-15T11:00:00.000Z",
  "data": {
    "waitlistId": "uuid",
    "userId": "uuid",
    "eventId": "uuid",
    "priority": 1,
    "expiresAt": "2024-01-15T11:30:00.000Z"
  }
}
```

---

## OpenAPI / Swagger

Интерактивная документация доступна:

- **Swagger UI**: `http://localhost:8102/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8102/v3/api-docs`
- **ReDoc**: `http://localhost:8102/redoc`

---

## См. также

- [README](README.md) - обзор сервиса и entities
- [Business Logic](business-logic.md) - детальные бизнес-правила
- [Operations](operations.md) - развертывание и мониторинг
- [Backend Common - Error Handling](../common/error-handling.md) - RFC 7807
- [Backend Common - Rate Limiting](../common/rate-limiting.md) - защита API