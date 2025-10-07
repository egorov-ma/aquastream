# Crew Service - Business Logic

## Обзор

Crew Service управляет группами участников событий и их распределением: crews (экипажи, палатки, столы, транспорт), назначение участников, управление лодками и палатками.

## Типы Crews

| Тип | Описание | Применение |
|-----|----------|------------|
| `CREW` | Экипаж лодки | Водные мероприятия (сплавы, регаты) |
| `TENT` | Палатка | Кемпинговые события |
| `TABLE` | Стол | Банкеты, ужины |
| `BUS` | Транспорт | Автобус/микроавтобус |

## Бизнес-правила

### 1. Создание Crew

| Правило | Требование |
|---------|------------|
| Название | Уникально в рамках события, max 100 символов |
| Capacity | >= 1 |
| Type | Валидный CrewType |
| Boat | Только для type=CREW |
| Tent | Только для type=TENT |
| currentSize | Инициализируется 0 |

**Exceptions**: `IllegalArgumentException` (дубликат имени), `ConstraintViolationException` (валидация DTO)

### 2. Обновление Crew

**Правила**:
- ❌ Нельзя уменьшить capacity ниже currentSize
- ✅ Новое имя должно быть уникальным
- ❌ Нельзя изменить type если есть назначения

**Валидация capacity**:
```java
if (updateCapacity < currentSize) {
    throw new CrewCapacityExceededException(
        "Cannot reduce capacity to " + updateCapacity +
        " as current size is " + currentSize);
}
```

**Exceptions**: `CrewCapacityExceededException`, `IllegalArgumentException`, `CrewNotFoundException`

### 3. Удаление Crew

**Правила**:
- ❌ Нельзя удалить crew с активными назначениями (`currentSize > 0`)
- ✅ Cascade удаление boat/tent (если есть)

**Exceptions**: `IllegalArgumentException` (есть активные назначения), `CrewNotFoundException`

### 4. Назначение участника в Crew

**Правила валидации**:

| Проверка | Требование |
|----------|------------|
| Capacity | `currentSize < capacity` |
| Booking | `booking.status = CONFIRMED`, принадлежит этому event |
| Уникальность user | Участник не в другом crew этого события |
| Уникальность booking | Бронь не назначена в другой crew |
| Seat number | Место свободно (если указан) |

**Процесс**:
1. Валидация capacity
2. Проверка дублирования (user в событии, booking в crew)
3. Валидация seat number (если указан)
4. Создание назначения со статусом ACTIVE
5. Увеличение `currentSize` crew на 1

**Exceptions**: `CrewCapacityExceededException`, `IllegalArgumentException` (участник/бронь уже назначены, место занято), `CrewNotFoundException`

### 5. Удаление назначения

**Правила**:
- ✅ Можно удалить только ACTIVE назначение
- ✅ Status меняется на REMOVED, `unassignedAt` устанавливается
- ✅ `currentSize` crew уменьшается на 1

**Exceptions**: `IllegalArgumentException` (не ACTIVE), `AssignmentNotFoundException`

## Статусы назначений

| Статус | Описание | Переходы |
|--------|----------|----------|
| `ACTIVE` | Активное назначение | → REMOVED, TRANSFERRED |
| `REMOVED` | Удалено (участник выбыл) | Финальный |
| `TRANSFERRED` | Переведено в другую группу | → новый ACTIVE |

## Интеграции

### С Event Service

**Проверка брони** при создании assignment:
- Booking существует для userId
- `booking.status = CONFIRMED`
- `booking.eventId` = `crew.eventId`

*Примечание*: Валидация делегируется на уровень API Gateway или предполагается что выполнена ранее.

### С Notification Service (будущее)

**События для уведомлений**:
- Участник назначен в crew → email/Telegram
- Участник удален из crew → уведомление
- Изменились детали crew (лодка, место) → уведомление

## Team Preferences (в разработке)

Участники могут указать предпочтения:
- **prefersWithUserIds**: с кем хотят быть в одной команде
- **avoidsUserIds**: кого хотят избежать

**Алгоритм** (планируется):
1. Жесткие ограничения: capacity, avoids
2. Мягкие предпочтения: prefers with
3. Балансировка заполнения crews
4. Минимизация конфликтов

## Транзакционность

```java
@Service
@Transactional  // Класс уровень
public class CrewService {
    // Все методы модификации в транзакции
    public CrewDto createCrew(...) { ... }

    // Read-only
    @Transactional(readOnly = true)
    public CrewDto getCrew(...) { ... }
}
```

**Гарантии**: Atomicity (crew + boat/tent), Consistency (currentSize корректен), Isolation (нет превышения capacity при конкурентных назначениях).

## Race Conditions

### Concurrent assignments

**Проблема**: Два organizer'а одновременно назначают участников на последнее место.

**Решение**: Оптимистичная блокировка на crew entity (`@Version`)

```java
@Entity
public class CrewEntity {
    @Version
    private Long version;  // Оптимистичная блокировка
}
```

При конфликте → retry с exponential backoff.

### Seat number conflicts

**Проблема**: Два участника назначаются на одно место.

**Решение**: Unique constraint + pessimistic lock

```sql
SELECT * FROM crew_assignments
WHERE crew_id = ? AND seat_number = ? AND status = 'ACTIVE'
FOR UPDATE;
```

## Валидации

### Crew level

- ✅ Уникальность имени в событии
- ✅ `capacity >= 1`
- ✅ `currentSize <= capacity` (всегда)
- ✅ `type` соответствует CrewType enum

### Assignment level

- ✅ `userId` существует (через Event Service)
- ✅ `bookingId` существует и CONFIRMED
- ✅ Нет дублирующих назначений (user + event)
- ✅ Seat number уникален в crew (если указан)

### Boat/Tent level

- ✅ Только для соответствующих типов crews
- ✅ One-to-One связь с crew

## Exceptions

### Custom Exceptions

```java
public class CrewNotFoundException extends RuntimeException { }
public class CrewCapacityExceededException extends RuntimeException { }
public class AssignmentNotFoundException extends RuntimeException { }
public class BoatNotFoundException extends RuntimeException { }
public class TentNotFoundException extends RuntimeException { }
```

### Маппинг в HTTP статусы

| Exception | HTTP Status |
|-----------|-------------|
| `*NotFoundException` | 404 Not Found |
| `CrewCapacityExceededException` | 422 Unprocessable Entity |
| `IllegalArgumentException` | 400 Bad Request / 409 Conflict |

## Performance

### Оптимизация запросов

**N+1 проблема** при загрузке crews с assignments:

```java
// ✅ Fetch Join
@Query("SELECT c FROM CrewEntity c " +
       "LEFT JOIN FETCH c.assignments a " +
       "WHERE c.eventId = :eventId AND a.status = 'ACTIVE'")
List<CrewEntity> findByEventIdWithAssignments(@Param("eventId") UUID eventId);
```

### Кэширование

```java
@Cacheable(value = "event-crews", key = "#eventId")
public List<CrewDto> getCrews(UUID eventId, String type, boolean availableOnly) { }
```

**Кандидаты**: список crews события, детали boat/tent.

### Критичные индексы

```sql
CREATE INDEX idx_crews_event_id ON crew.crews(event_id);
CREATE INDEX idx_crew_assignments_crew_id ON crew.crew_assignments(crew_id);
CREATE INDEX idx_crew_assignments_user_event ON crew.crew_assignments(user_id, crew_id);
CREATE INDEX idx_crew_assignments_booking ON crew.crew_assignments(booking_id);
```

---

См. [README](README.md), [API Documentation](api.md), [Operations](operations.md), [Database Schema](../database.md).