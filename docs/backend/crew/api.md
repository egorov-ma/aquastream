# Crew Service API

## Обзор

**Base URL**: `http://localhost:8103/api/v1`
**Аутентификация**: JWT через Gateway
**Формат**: JSON
**Ошибки**: RFC 7807 Problem Details

## API Endpoints

### Crews

| Метод | Endpoint | Описание | Права | Ключевые параметры |
|-------|----------|----------|-------|-------------------|
| GET | `/events/{eventId}/crews` | Список crews события | USER, ORGANIZER | `type` (CREW\|TENT\|TABLE\|BUS), `availableOnly` |
| GET | `/events/{eventId}/crews/{crewId}` | Детали crew | USER, ORGANIZER | - |
| POST | `/events/{eventId}/crews` | Создать crew | ORGANIZER | Body: CreateCrewDto |
| PUT | `/events/{eventId}/crews/{crewId}` | Обновить crew | ORGANIZER | Body: UpdateCrewDto |
| DELETE | `/events/{eventId}/crews/{crewId}` | Удалить crew | ORGANIZER | - |

### Assignments (Назначения участников)

| Метод | Endpoint | Описание | Права | Бизнес-правила |
|-------|----------|----------|-------|----------------|
| POST | `/assignments` | Создать назначение | ORGANIZER | Crew не заполнен, участник имеет CONFIRMED бронь, не назначен в другой crew |
| DELETE | `/assignments/{assignmentId}` | Удалить назначение | ORGANIZER | status=REMOVED, уменьшает currentSize |
| GET | `/assignments/crews/{crewId}` | Назначения crew | USER (свои), ORGANIZER | - |
| GET | `/assignments/users/{userId}` | Назначения пользователя | USER (свои), ORGANIZER, ADMIN | Все события |
| GET | `/assignments/events/{eventId}/users/{userId}` | Назначение пользователя для события | USER (свое), ORGANIZER | - |

### Boats

| Метод | Endpoint | Описание | Права | Фильтры |
|-------|----------|----------|-------|---------|
| GET | `/events/{eventId}/boats` | Список лодок | USER, ORGANIZER | `boatType`, `condition` |
| GET | `/events/{eventId}/boats/{boatId}` | Детали лодки | USER, ORGANIZER | - |

### Tents

| Метод | Endpoint | Описание | Права | Фильтры |
|-------|----------|----------|-------|---------|
| GET | `/events/{eventId}/tents` | Список палаток | USER, ORGANIZER | `tentType`, `condition` |
| GET | `/events/{eventId}/tents/{tentId}` | Детали палатки | USER, ORGANIZER | - |

## Schemas

### CrewDto

```typescript
{
  id: UUID;
  eventId: UUID;
  name: string;              // max 100, уникален в рамках события
  type: string;              // CREW | TENT | TABLE | BUS
  capacity: number;          // >= 1
  currentSize: number;       // Текущее заполнение
  description?: string;      // max 1000
  metadata?: object;
  boat?: BoatDto;            // Только для type=CREW
  tent?: TentDto;            // Только для type=TENT
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

### CreateCrewDto

| Поле | Тип | Обязательно | Валидация |
|------|-----|-------------|-----------|
| `name` | string | ✅ | max 100, уникален в событии |
| `type` | string | ✅ | CREW \| TENT \| TABLE \| BUS |
| `capacity` | number | ✅ | >= 1 |
| `description` | string | ❌ | max 1000 |
| `metadata` | object | ❌ | - |
| `boat` | CreateBoatDto | ❌ | Только для type=CREW |
| `tent` | CreateTentDto | ❌ | Только для type=TENT |

### CrewAssignmentDto

```typescript
{
  id: UUID;
  crewId: UUID;
  userId: UUID;
  bookingId: UUID;           // Бронь должна быть CONFIRMED
  seatNumber?: number;
  position?: string;         // Роль: гребец, рулевой, и т.д.
  assignedBy: UUID;
  assignedAt: ISO8601;
  unassignedAt?: ISO8601;
  status: string;            // ACTIVE | REMOVED | TRANSFERRED
  notes?: string;
  createdAt: ISO8601;
}
```

**Бизнес-правила создания**:
- Crew не заполнен (`currentSize < capacity`)
- Участник имеет активную CONFIRMED бронь для события
- Участник не может быть назначен в несколько crews одного события

### BoatDto

```typescript
{
  id: UUID;
  crewId: UUID;
  boatType: string;
  boatNumber?: string;
  condition?: string;
  specifications?: object;   // length, width, manufacturer, etc.
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
  specifications?: object;   // brand, waterproof, etc.
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

## Примеры использования

### Создать crew (катамаран)

```bash
curl -X POST http://localhost:8103/api/v1/events/{eventId}/crews \
  -H "Content-Type: application/json" \
  -H "X-User-Role: ORGANIZER" \
  -d '{
    "name": "Катамаран #1",
    "type": "CREW",
    "capacity": 6,
    "description": "Опытный экипаж для сложных порогов",
    "boat": {
      "boatType": "Катамаран 6-местный",
      "boatNumber": "K-001",
      "condition": "Отлично",
      "specifications": {
        "length": "4.5m",
        "width": "2.0m"
      }
    }
  }'
```

**Response** `201 Created`: CrewDto с `currentSize: 0`

### Создать назначение участника

```bash
curl -X POST http://localhost:8103/api/v1/assignments \
  -H "Content-Type: application/json" \
  -H "X-User-Role: ORGANIZER" \
  -d '{
    "crewId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "450e8400-e29b-41d4-a716-446655440000",
    "bookingId": "350e8400-e29b-41d4-a716-446655440000",
    "seatNumber": 3,
    "position": "гребец",
    "notes": "Опытный, может быть рулевым"
  }'
```

**Response** `201 Created`: CrewAssignmentDto с `status: ACTIVE`

### Фильтрация crews

```bash
# Все crews события
curl http://localhost:8103/api/v1/events/{eventId}/crews

# Только экипажи лодок
curl "http://localhost:8103/api/v1/events/{eventId}/crews?type=CREW"

# Только доступные палатки
curl "http://localhost:8103/api/v1/events/{eventId}/crews?type=TENT&availableOnly=true"
```

## Error Handling

Все ошибки в формате RFC 7807. См. [Backend Common - Error Handling](../common/error-handling.md).

### Коды ошибок

| Код | Описание | Примеры |
|-----|----------|---------|
| 400 | Bad Request | Невалидный body, нарушены constraints |
| 403 | Forbidden | Недостаточно прав (только ORGANIZER) |
| 404 | Not Found | Crew/Assignment не найден |
| 409 | Conflict | Crew с таким именем уже существует |
| 422 | Unprocessable Entity | Crew заполнен, участник уже назначен |

### Примеры ошибок

**Crew заполнен** (422):
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

**Duplicate name** (409):
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

## Rate Limiting

Default rate limit от `backend-common`:
- **Capacity**: 60 requests/minute
- **Refill**: 10 requests/second

При превышении: `429 Too Many Requests` с `Retry-After: 60`

См. [Backend Common - Rate Limiting](../common/rate-limiting.md).

---

См. [README](README.md), [Business Logic](business-logic.md), [Operations](operations.md), [Backend Common - Error Handling](../common/error-handling.md).