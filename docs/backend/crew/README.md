# Crew Service

## Обзор

**Порт**: 8103
**База данных**: PostgreSQL схема `crew`
**Назначение**: Управление экипажами (crews), распределение участников по группам

Crew Service управляет группами участников событий: экипажи лодок, палатки, столы, места в транспорте.

## Структура модуля

```
backend-crew/
├── backend-crew-api/       # REST API endpoints (порт 8103)
├── backend-crew-service/   # Бизнес-логика сервиса
└── backend-crew-db/        # Entities и repositories (схема crew)
```

## Основные сущности

### 1. Crew (Экипаж/Группа)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Primary key |
| `eventId` | UUID | FK на событие |
| `name` | String | Название (например, "Лодка #1") |
| `type` | CrewType | CREW \| TENT \| TABLE \| BUS |
| `capacity` | Integer | Максимальная вместимость |
| `currentSize` | Integer | Текущее количество участников |
| `description` | String | Описание |
| `metadata` | JSONB | Дополнительные данные |

**Типы crews**:
- `CREW` - Экипаж лодки (водные мероприятия)
- `TENT` - Палатка (кемпинги)
- `TABLE` - Стол (банкеты)
- `BUS` - Места в автобусе (транспортировка)

**Отношения**: `OneToMany` → CrewAssignment, `OneToOne` → Boat (для CREW), `OneToOne` → Tent (для TENT)

### 2. CrewAssignment (Назначение)

| Поле | Тип | Описание |
|------|-----|----------|
| `id`, `crewId`, `userId`, `bookingId` | UUID | - |
| `seatNumber` | Integer | Номер места (опционально) |
| `position` | String | Позиция: гребец, рулевой, и т.д. |
| `assignedBy`, `assignedAt` | UUID, Instant | Кто и когда назначил |
| `status` | AssignmentStatus | ACTIVE \| REMOVED \| TRANSFERRED |
| `notes` | String | Заметки |

### 3-5. Дополнительные сущности

| Сущность | Описание | Ключевые поля |
|----------|----------|---------------|
| **Boat** | Детали лодки для экипажа | boatType, boatNumber, condition, specifications (JSONB) |
| **Tent** | Детали палатки для кемпинга | tentType, location, condition, specifications (JSONB) |
| **TeamPreferences** | Предпочтения участника по составу | prefersWithUserIds, avoidsUserIds (в разработке) |

## API Endpoints

См. [api.md](api.md) для полного описания. Краткий обзор:

| Группа | Примеры | Доступ |
|--------|---------|--------|
| **Crews** | `GET /events/{eventId}/crews`, `POST /events/{eventId}/crews`, `DELETE /crews/{crewId}` | USER (read), ORGANIZER (write) |
| **Assignments** | `POST /assignments`, `DELETE /assignments/{assignmentId}`, `GET /assignments/crews/{crewId}` | ORGANIZER (write), USER (read свои) |
| **Boats** | `GET /events/{eventId}/boats`, `GET /boats/{boatId}` | USER, ORGANIZER |
| **Tents** | `GET /events/{eventId}/tents`, `GET /tents/{tentId}` | USER, ORGANIZER |

## Бизнес-логика

См. [business-logic.md](business-logic.md) для детального описания. Основные процессы:

### Создание crew

1. Организатор создает crew для события
2. Указывает тип (CREW, TENT, TABLE, BUS) и capacity
3. Опционально привязывает Boat или Tent

**Правила**: Название уникально в событии, capacity >= 1, тип соответствует CrewType.

### Назначение участников

**Процесс**:
1. Организатор назначает участника в crew
2. Валидация: crew не заполнен (`currentSize < capacity`)
3. Валидация: участник имеет CONFIRMED бронь для этого события
4. Валидация: участник не в другом crew этого события
5. Создание CrewAssignment со статусом ACTIVE
6. Увеличение `currentSize` crew

**Правила**:
- ✅ Один участник = один crew на событие
- ✅ Seat number уникален в crew (если указан)
- ❌ Нельзя удалить crew с активными назначениями

### Team Preferences (в разработке)

Участники могут указать предпочтения (prefers with / avoids). Организатор учитывает при назначении.

## База данных

**Схема**: `crew`

**Таблицы**: crews, crew_assignments, boats, tents, team_preferences

### Критичные индексы

```sql
CREATE INDEX idx_crews_event_id ON crew.crews(event_id);
CREATE INDEX idx_crew_assignments_crew_id ON crew.crew_assignments(crew_id);
CREATE INDEX idx_crew_assignments_user_id ON crew.crew_assignments(user_id);
CREATE INDEX idx_crew_assignments_booking_id ON crew.crew_assignments(booking_id);
```

**Constraints**:
- `crews`: UNIQUE(event_id, name)
- `crew_assignments`: UNIQUE(crew_id, seat_number) WHERE seat_number IS NOT NULL
- `boats`, `tents`: One-to-One с crew

## Конфигурация

```yaml
server:
  port: 8103

spring:
  application:
    name: crew-service
  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
  jpa:
    properties:
      hibernate:
        default_schema: crew

aquastream:
  rate-limit:
    enabled: true
    limits:
      default:
        capacity: 60
        window: 1m
```

## Сценарии использования

### Организатор создает экипажи для сплава

```java
// 1. Создать crew
CrewDto crew = crewService.createCrew(eventId, CreateCrewDto.builder()
    .name("Катамаран #1")
    .type(CrewType.CREW)
    .capacity(6)
    .build());

// 2. Добавить информацию о лодке
boatService.createBoat(CreateBoatDto.builder()
    .crewId(crew.getId())
    .boatType("Катамаран 6-местный")
    .boatNumber("K-001")
    .build());

// 3. Назначить участников
assignmentService.createAssignment(CreateAssignmentDto.builder()
    .crewId(crew.getId())
    .userId(userId)
    .bookingId(bookingId)
    .position("гребец")
    .build());
```

### Участник смотрит свой экипаж

```java
// Получить назначение
CrewAssignmentDto assignment = assignmentService
    .getUserEventAssignment(eventId, userId);

// Получить детали crew и лодки
CrewDto crew = crewService.getCrew(eventId, assignment.getCrewId());
BoatDto boat = boatService.getBoat(eventId, crew.getBoatId());

// Получить teammates
List<CrewAssignmentDto> teammates = assignmentService
    .getCrewAssignments(crew.getId());
```

## Права доступа

| Роль | Права |
|------|-------|
| **ORGANIZER** | Создание/изменение/удаление crews, назначение/удаление участников, просмотр всех crews события |
| **USER** | Просмотр своего crew, просмотр списка crews события, установка team preferences (в разработке) |
| **GUEST** | Нет доступа |

## Мониторинг

```bash
# Health check
curl http://localhost:8103/actuator/health

# Метрики
curl http://localhost:8103/actuator/metrics

# Логи
docker logs backend-crew-service
docker logs backend-crew-service | grep ERROR
```

---

См. [API Documentation](api.md), [Business Logic](business-logic.md), [Operations](operations.md), [Database Schema](../database.md).