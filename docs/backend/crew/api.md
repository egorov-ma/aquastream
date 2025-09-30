# Crew Service API

## Обзор

**Base URL**: `http://localhost:8103`
**Версия**: v1
**Формат**: JSON
**Аутентификация**: JWT Bearer token (через Gateway)

Все endpoints возвращают ошибки в формате RFC 7807 Problem Details.

## Endpoints

### Crews

#### GET /api/v1/events/{eventId}/crews

Получить все crews для события.

**Параметры**:
- `eventId` (path, UUID) - ID события

**Query параметры**:
- `type` (string, optional) - Фильтр по типу: `CREW`, `TENT`, `TABLE`, `BUS`
- `availableOnly` (boolean, optional, default=false) - Только доступные (не заполненные)

**Права**: USER, ORGANIZER

**Response 200**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "eventId": "650e8400-e29b-41d4-a716-446655440000",
    "name": "Катамаран #1",
    "type": "CREW",
    "capacity": 6,
    "currentSize": 4,
    "description": "Опытный экипаж для сложных порогов",
    "metadata": {},
    "boat": {
      "id": "750e8400-e29b-41d4-a716-446655440000",
      "crewId": "550e8400-e29b-41d4-a716-446655440000",
      "boatType": "Катамаран 6-местный",
      "boatNumber": "K-001",
      "condition": "Отлично",
      "specifications": {}
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

**Примеры**:
```bash
# Все crews события
curl http://localhost:8103/api/v1/events/650e8400-e29b-41d4-a716-446655440000/crews

# Только экипажи лодок
curl "http://localhost:8103/api/v1/events/650e8400-e29b-41d4-a716-446655440000/crews?type=CREW"

# Только доступные палатки
curl "http://localhost:8103/api/v1/events/650e8400-e29b-41d4-a716-446655440000/crews?type=TENT&availableOnly=true"
```

---

#### GET /api/v1/events/{eventId}/crews/{crewId}

Получить конкретный crew.

**Параметры**:
- `eventId` (path, UUID) - ID события
- `crewId` (path, UUID) - ID crew

**Права**: USER, ORGANIZER

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "650e8400-e29b-41d4-a716-446655440000",
  "name": "Катамаран #1",
  "type": "CREW",
  "capacity": 6,
  "currentSize": 4,
  "description": "Опытный экипаж",
  "metadata": {},
  "boat": { ... },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Response 404**: Crew не найден

---

#### POST /api/v1/events/{eventId}/crews

Создать новый crew для события.

**Параметры**:
- `eventId` (path, UUID) - ID события

**Права**: ORGANIZER

**Request Body**:
```json
{
  "name": "Катамаран #1",
  "type": "CREW",
  "capacity": 6,
  "description": "Опытный экипаж для сложных порогов",
  "metadata": {},
  "boat": {
    "boatType": "Катамаран 6-местный",
    "boatNumber": "K-001",
    "condition": "Отлично",
    "specifications": {
      "length": "4.5m",
      "width": "2.0m"
    }
  }
}
```

**Валидация**:
- `name`: required, max 100 символов, уникален в рамках события
- `type`: required, одно из: `CREW`, `TENT`, `TABLE`, `BUS`
- `capacity`: required, >= 1
- `description`: optional, max 1000 символов
- `boat`: optional, только для type=CREW
- `tent`: optional, только для type=TENT

**Response 201**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "eventId": "650e8400-e29b-41d4-a716-446655440000",
  "name": "Катамаран #1",
  "type": "CREW",
  "capacity": 6,
  "currentSize": 0,
  "description": "Опытный экипаж для сложных порогов",
  "boat": { ... },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Response 400**: Валидация не прошла
**Response 403**: Недостаточно прав
**Response 409**: Crew с таким именем уже существует для события

---

#### PUT /api/v1/events/{eventId}/crews/{crewId}

Обновить crew.

**Параметры**:
- `eventId` (path, UUID) - ID события
- `crewId` (path, UUID) - ID crew

**Права**: ORGANIZER

**Request Body**: То же что для POST

**Response 200**: Обновленный CrewDto
**Response 404**: Crew не найден
**Response 403**: Недостаточно прав

---

#### DELETE /api/v1/events/{eventId}/crews/{crewId}

Удалить crew.

**Параметры**:
- `eventId` (path, UUID) - ID события
- `crewId` (path, UUID) - ID crew

**Права**: ORGANIZER

**Response 204**: Успешно удален
**Response 404**: Crew не найден
**Response 403**: Недостаточно прав

---

### Assignments

#### POST /api/v1/assignments

Создать назначение участника в crew.

**Права**: ORGANIZER

**Request Body**:
```json
{
  "crewId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "450e8400-e29b-41d4-a716-446655440000",
  "bookingId": "350e8400-e29b-41d4-a716-446655440000",
  "seatNumber": 3,
  "position": "гребец",
  "notes": "Опытный, может быть рулевым"
}
```

**Валидация**:
- `crewId`: required
- `userId`: required
- `bookingId`: required, бронь должна существовать и быть CONFIRMED
- `seatNumber`: optional
- `position`: optional
- `notes`: optional

**Бизнес-правила**:
- Crew не должен быть заполнен (currentSize < capacity)
- Участник должен иметь активную бронь для этого события
- Участник не может быть назначен в несколько crews одного события

**Response 201**:
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440000",
  "crewId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "450e8400-e29b-41d4-a716-446655440000",
  "bookingId": "350e8400-e29b-41d4-a716-446655440000",
  "seatNumber": 3,
  "position": "гребец",
  "assignedBy": "150e8400-e29b-41d4-a716-446655440000",
  "assignedAt": "2024-01-15T12:00:00Z",
  "status": "ACTIVE",
  "notes": "Опытный, может быть рулевым",
  "createdAt": "2024-01-15T12:00:00Z"
}
```

**Response 400**: Валидация не прошла
**Response 403**: Недостаточно прав
**Response 422**: Бизнес-правило нарушено (crew заполнен, участник уже назначен, и т.д.)

---

#### DELETE /api/v1/assignments/{assignmentId}

Удалить назначение участника.

**Параметры**:
- `assignmentId` (path, UUID) - ID назначения

**Права**: ORGANIZER

**Действия**:
1. Устанавливает status=REMOVED
2. Устанавливает unassignedAt=now
3. Уменьшает currentSize crew

**Response 204**: Успешно удалено
**Response 404**: Назначение не найдено
**Response 403**: Недостаточно прав

---

#### GET /api/v1/assignments/crews/{crewId}

Получить все назначения crew.

**Параметры**:
- `crewId` (path, UUID) - ID crew

**Права**: USER (только для своих назначений), ORGANIZER

**Response 200**:
```json
[
  {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "crewId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "450e8400-e29b-41d4-a716-446655440000",
    "bookingId": "350e8400-e29b-41d4-a716-446655440000",
    "seatNumber": 3,
    "position": "гребец",
    "assignedBy": "150e8400-e29b-41d4-a716-446655440000",
    "assignedAt": "2024-01-15T12:00:00Z",
    "status": "ACTIVE",
    "notes": "Опытный",
    "createdAt": "2024-01-15T12:00:00Z"
  }
]
```

---

#### GET /api/v1/assignments/users/{userId}

Получить все назначения пользователя (все события).

**Параметры**:
- `userId` (path, UUID) - ID пользователя

**Права**: USER (только свои), ORGANIZER, ADMIN

**Response 200**: Массив CrewAssignmentDto

---

#### GET /api/v1/assignments/events/{eventId}/users/{userId}

Получить назначение пользователя для конкретного события.

**Параметры**:
- `eventId` (path, UUID) - ID события
- `userId` (path, UUID) - ID пользователя

**Права**: USER (только свое), ORGANIZER

**Response 200**: CrewAssignmentDto
**Response 404**: Назначение не найдено (пользователь не назначен в crew)

---

### Boats

#### GET /api/v1/events/{eventId}/boats

Получить все лодки события.

**Параметры**:
- `eventId` (path, UUID) - ID события

**Query параметры**:
- `boatType` (string, optional) - Фильтр по типу лодки
- `condition` (string, optional) - Фильтр по состоянию

**Права**: USER, ORGANIZER

**Response 200**:
```json
[
  {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "crewId": "550e8400-e29b-41d4-a716-446655440000",
    "boatType": "Катамаран 6-местный",
    "boatNumber": "K-001",
    "condition": "Отлично",
    "specifications": {
      "length": "4.5m",
      "width": "2.0m",
      "manufacturer": "Вуокса"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

#### GET /api/v1/events/{eventId}/boats/{boatId}

Получить конкретную лодку.

**Параметры**:
- `eventId` (path, UUID) - ID события
- `boatId` (path, UUID) - ID лодки

**Права**: USER, ORGANIZER

**Response 200**: BoatDto
**Response 404**: Лодка не найдена

---

### Tents

#### GET /api/v1/events/{eventId}/tents

Получить все палатки события.

**Параметры**:
- `eventId` (path, UUID) - ID события

**Query параметры**:
- `tentType` (string, optional) - Фильтр по типу палатки
- `condition` (string, optional) - Фильтр по состоянию

**Права**: USER, ORGANIZER

**Response 200**:
```json
[
  {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "crewId": "550e8400-e29b-41d4-a716-446655440000",
    "tentType": "Четырехместная",
    "location": "Северная поляна, место 12",
    "condition": "Хорошо",
    "specifications": {
      "brand": "Alexika",
      "waterproof": "5000mm"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

#### GET /api/v1/events/{eventId}/tents/{tentId}

Получить конкретную палатку.

**Параметры**:
- `eventId` (path, UUID) - ID события
- `tentId` (path, UUID) - ID палатки

**Права**: USER, ORGANIZER

**Response 200**: TentDto
**Response 404**: Палатка не найдена

---

## DTO Schemas

### CreateCrewDto

```typescript
{
  name: string;              // required, max 100
  type: string;              // required: CREW | TENT | TABLE | BUS
  capacity: number;          // required, >= 1
  description?: string;      // optional, max 1000
  metadata?: object;         // optional
  boat?: CreateBoatDto;      // optional, для type=CREW
  tent?: CreateTentDto;      // optional, для type=TENT
}
```

### CrewDto

```typescript
{
  id: UUID;
  eventId: UUID;
  name: string;
  type: string;              // CREW | TENT | TABLE | BUS
  capacity: number;
  currentSize: number;
  description?: string;
  metadata?: object;
  boat?: BoatDto;
  tent?: TentDto;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

### CreateAssignmentDto

```typescript
{
  crewId: UUID;              // required
  userId: UUID;              // required
  bookingId: UUID;           // required
  seatNumber?: number;       // optional
  position?: string;         // optional
  notes?: string;            // optional
}
```

### CrewAssignmentDto

```typescript
{
  id: UUID;
  crewId: UUID;
  userId: UUID;
  bookingId: UUID;
  seatNumber?: number;
  position?: string;
  assignedBy: UUID;
  assignedAt: ISO8601;
  unassignedAt?: ISO8601;
  status: string;            // ACTIVE | REMOVED | TRANSFERRED
  notes?: string;
  createdAt: ISO8601;
}
```

### BoatDto

```typescript
{
  id: UUID;
  crewId: UUID;
  boatType: string;
  boatNumber?: string;
  condition?: string;
  specifications?: object;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

### TentDto

```typescript
{
  id: UUID;
  crewId: UUID;
  tentType: string;
  location?: string;
  condition?: string;
  specifications?: object;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

## Error Responses

Все ошибки возвращаются в формате RFC 7807 Problem Details:

### 400 Bad Request

```json
{
  "type": "https://aquastream.app/problems/400",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Invalid request parameters",
  "instance": "/api/v1/events/123/crews",
  "code": "validation.failed",
  "correlationId": "xR3k9mP2nQ",
  "errors": [
    {
      "field": "capacity",
      "message": "Capacity must be at least 1",
      "code": "Min"
    }
  ]
}
```

### 403 Forbidden

```json
{
  "type": "https://aquastream.app/problems/403",
  "title": "Forbidden",
  "status": 403,
  "detail": "Only organizers can create crews",
  "code": "access.denied",
  "correlationId": "xR3k9mP2nQ"
}
```

### 404 Not Found

```json
{
  "type": "https://aquastream.app/problems/404",
  "title": "Not Found",
  "status": 404,
  "detail": "Crew not found",
  "code": "not.found",
  "correlationId": "xR3k9mP2nQ"
}
```

### 409 Conflict

```json
{
  "type": "https://aquastream.app/problems/409",
  "title": "Conflict",
  "status": 409,
  "detail": "Crew with name 'Катамаран #1' already exists for this event",
  "code": "conflict",
  "correlationId": "xR3k9mP2nQ"
}
```

### 422 Unprocessable Entity

```json
{
  "type": "https://aquastream.app/problems/422",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "Crew is full (6/6)",
  "code": "unprocessable",
  "correlationId": "xR3k9mP2nQ"
}
```

## Rate Limiting

Применяется default rate limit от `backend-common`:
- **Capacity**: 60 requests
- **Window**: 1 minute
- **Refill**: 10 requests/second

При превышении:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Remaining: 0
```

## См. также

- [README](README.md) - обзор сервиса
- [Business Logic](business-logic.md) - бизнес-правила
- [Error Handling](../common/error-handling.md) - детали обработки ошибок
- [Rate Limiting](../common/rate-limiting.md) - детали rate limiting