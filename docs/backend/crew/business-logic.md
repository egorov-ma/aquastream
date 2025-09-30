# Crew Service - Business Logic

## Обзор

Crew Service управляет группами участников событий и их распределением. Основные задачи:
- Создание и управление crews (экипажи, палатки, столы, транспорт)
- Назначение участников в crews с учетом вместимости
- Управление лодками и палатками для crews
- Валидация бизнес-правил при назначениях

## Типы Crews

### CrewType enum

```java
public enum CrewType {
    CREW,    // Экипаж лодки (гребцы + рулевой)
    TENT,    // Палатка для кемпинга
    TABLE,   // Стол на банкете
    BUS      // Места в автобусе/транспорте
}
```

**Применение**:
- `CREW` - водные мероприятия (сплавы, регаты)
- `TENT` - кемпинговые события
- `TABLE` - банкеты, ужины
- `BUS` - транспортировка участников

## Бизнес-правила

### 1. Создание Crew

**Правила**:
- ✅ Название crew уникально в рамках события
- ✅ Capacity >= 1
- ✅ Type должен быть валидным CrewType
- ✅ Boat можно привязать только к type=CREW
- ✅ Tent можно привязать только к type=TENT

**Валидация**:
```java
public CrewDto createCrew(UUID eventId, CreateCrewDto createCrewDto) {
    // Проверка уникальности имени
    crewRepository.findByEventIdAndName(eventId, createCrewDto.getName())
        .ifPresent(existing -> {
            throw new IllegalArgumentException(
                "Crew with name '" + createCrewDto.getName() +
                "' already exists in event " + eventId);
        });

    // Создание crew
    CrewEntity crew = CrewEntity.builder()
        .eventId(eventId)
        .name(createCrewDto.getName())
        .type(CrewEntity.CrewType.valueOf(createCrewDto.getType().toUpperCase()))
        .capacity(createCrewDto.getCapacity())
        .currentSize(0)  // Начальный размер 0
        .build();

    // Привязка boat/tent если указаны
    if (createCrewDto.getBoat() != null) {
        createBoatForCrew(crew, createCrewDto.getBoat());
    }
}
```

**Exceptions**:
- `IllegalArgumentException` - дубликат имени
- `ConstraintViolationException` - валидация DTO

---

### 2. Обновление Crew

**Правила**:
- ✅ Нельзя уменьшить capacity ниже currentSize
- ✅ Новое имя должно быть уникальным
- ✅ Можно изменить type только если нет назначений

**Валидация capacity**:
```java
public CrewDto updateCrew(UUID eventId, UUID crewId, CreateCrewDto updateCrewDto) {
    CrewEntity crew = findCrewOrThrow(crewId, eventId);

    // Проверка capacity
    if (updateCrewDto.getCapacity() < crew.getCurrentSize()) {
        throw new CrewCapacityExceededException(
            "Cannot reduce capacity to " + updateCrewDto.getCapacity() +
            " as current size is " + crew.getCurrentSize());
    }

    // Проверка уникальности имени (если изменилось)
    if (!crew.getName().equals(updateCrewDto.getName())) {
        validateUniqueNameInEvent(eventId, updateCrewDto.getName());
    }

    crew.setCapacity(updateCrewDto.getCapacity());
    // ... другие поля
}
```

**Exceptions**:
- `CrewCapacityExceededException` - capacity < currentSize
- `IllegalArgumentException` - дубликат имени
- `CrewNotFoundException` - crew не найден

---

### 3. Удаление Crew

**Правила**:
- ❌ Нельзя удалить crew с активными назначениями (currentSize > 0)
- ✅ При удалении cascade удаляются boat/tent (если есть)

**Валидация**:
```java
public void deleteCrew(UUID eventId, UUID crewId) {
    CrewEntity crew = findCrewOrThrow(crewId, eventId);

    if (crew.getCurrentSize() > 0) {
        throw new IllegalArgumentException(
            "Cannot delete crew with active assignments. " +
            "Current size: " + crew.getCurrentSize());
    }

    crewRepository.delete(crew);  // Cascade удалит boat/tent
}
```

**Exceptions**:
- `IllegalArgumentException` - есть активные назначения
- `CrewNotFoundException` - crew не найден

---

### 4. Назначение участника в Crew

**Правила**:
- ✅ Crew не должен быть заполнен (currentSize < capacity)
- ✅ Участник имеет активную подтвержденную бронь (booking status = CONFIRMED)
- ✅ Участник не может быть в нескольких crews одного события
- ✅ Бронь не может быть назначена в несколько crews
- ✅ Если указан seatNumber, место должно быть свободно

**Процесс назначения**:
```java
public CrewAssignmentDto createAssignment(CreateAssignmentDto dto) {
    // 1. Валидация capacity
    crewService.validateCrewCapacity(dto.getCrewId());

    CrewEntity crew = findCrewOrThrow(dto.getCrewId());

    // 2. Проверка: участник уже назначен в событии?
    assignmentRepository.findByEventIdAndUserIdAndStatus(
        crew.getEventId(), dto.getUserId(), AssignmentStatus.ACTIVE)
        .ifPresent(existing -> {
            throw new IllegalArgumentException(
                "User " + dto.getUserId() +
                " is already assigned to a crew in event " + crew.getEventId());
        });

    // 3. Проверка: бронь уже назначена?
    assignmentRepository.findByBookingIdAndStatus(
        dto.getBookingId(), AssignmentStatus.ACTIVE)
        .ifPresent(existing -> {
            throw new IllegalArgumentException(
                "Booking " + dto.getBookingId() +
                " is already assigned to a crew");
        });

    // 4. Проверка seat number (если указан)
    if (dto.getSeatNumber() != null) {
        validateSeatAvailability(dto.getCrewId(), dto.getSeatNumber());
    }

    // 5. Создание назначения
    CrewAssignmentEntity assignment = CrewAssignmentEntity.builder()
        .crew(crew)
        .userId(dto.getUserId())
        .bookingId(dto.getBookingId())
        .seatNumber(dto.getSeatNumber())
        .position(dto.getPosition())
        .assignedBy(currentUserId())  // От имени organizer
        .status(AssignmentStatus.ACTIVE)
        .build();

    assignment = assignmentRepository.save(assignment);

    // 6. Увеличение currentSize crew
    crew.setCurrentSize(crew.getCurrentSize() + 1);
    crewRepository.save(crew);

    return toDto(assignment);
}
```

**Валидация capacity**:
```java
public void validateCrewCapacity(UUID crewId) {
    CrewEntity crew = findCrewOrThrow(crewId);

    if (crew.getCurrentSize() >= crew.getCapacity()) {
        throw new CrewCapacityExceededException(
            "Crew capacity exceeded. Current: " + crew.getCurrentSize() +
            ", Capacity: " + crew.getCapacity());
    }
}
```

**Exceptions**:
- `CrewCapacityExceededException` - crew заполнен
- `IllegalArgumentException` - участник уже назначен / бронь занята / место занято
- `CrewNotFoundException` - crew не найден

---

### 5. Удаление назначения

**Правила**:
- ✅ Можно удалить только ACTIVE назначение
- ✅ При удалении currentSize crew уменьшается на 1
- ✅ Status меняется на REMOVED, unassignedAt устанавливается

**Процесс**:
```java
public void removeAssignment(UUID assignmentId) {
    CrewAssignmentEntity assignment = findAssignmentOrThrow(assignmentId);

    // Проверка статуса
    if (assignment.getStatus() != AssignmentStatus.ACTIVE) {
        throw new IllegalArgumentException(
            "Assignment " + assignmentId + " is not active");
    }

    // Изменение статуса
    assignment.setStatus(AssignmentStatus.REMOVED);
    assignment.setUnassignedAt(Instant.now());
    assignmentRepository.save(assignment);

    // Уменьшение currentSize crew
    CrewEntity crew = assignment.getCrew();
    crew.setCurrentSize(Math.max(0, crew.getCurrentSize() - 1));
    crewRepository.save(crew);
}
```

**Exceptions**:
- `IllegalArgumentException` - назначение не ACTIVE
- `AssignmentNotFoundException` - назначение не найдено

---

## Статусы назначений

### AssignmentStatus enum

```java
public enum AssignmentStatus {
    ACTIVE,       // Активное назначение
    REMOVED,      // Удалено (участник выбыл)
    TRANSFERRED   // Переведено в другую группу (для истории)
}
```

**Lifecycle**:
```
ACTIVE → REMOVED (при удалении)
ACTIVE → TRANSFERRED → новый ACTIVE (при переводе между crews)
```

## Интеграции

### С Event Service

**Проверка брони**:
- При создании assignment нужно валидировать что:
  - Booking существует для этого userId
  - Booking status = CONFIRMED
  - Booking относится к тому же eventId что и crew

*Примечание*: В текущей реализации эта валидация делегируется на уровень API Gateway или предполагается что она сделана ранее.

### С Notification Service (будущее)

**События для уведомлений**:
- Участник назначен в crew → email/Telegram уведомление
- Участник удален из crew → уведомление
- Изменились детали crew (лодка, место) → уведомление

## Team Preferences (В разработке)

### Концепция

Участники могут указать предпочтения по составу:
- **prefersWithUserIds**: с кем хотят быть в одной команде
- **avoidsUserIds**: кого хотят избежать

### Использование

Organizer может учитывать эти предпочтения при назначении:

```sql
-- Запрос предпочтений участника
SELECT * FROM crew.team_preferences
WHERE user_id = ? AND event_id = ?;

-- При назначении проверить:
-- 1. Нет ли avoidsUserIds уже в crew?
-- 2. Есть ли prefersWithUserIds, которых можно добавить?
```

**Алгоритм** (в разработке):
1. Жесткие ограничения: capacity, avoids
2. Мягкие предпочтения: prefers with
3. Балансировка заполнения crews
4. Минимизация конфликтов

## Транзакционность

Все операции изменения данных выполняются в транзакциях:

```java
@Service
@Transactional  // Класс уровень
public class CrewService {

    // Все методы модификации выполняются в транзакции
    public CrewDto createCrew(...) { ... }
    public void deleteCrew(...) { ... }

    // Read-only методы
    @Transactional(readOnly = true)
    public CrewDto getCrew(...) { ... }
}
```

**Гарантии**:
- Атомарность: crew создается вместе с boat/tent или откатывается
- Consistency: currentSize всегда корректен
- Isolation: одновременные назначения не приводят к превышению capacity

## Race Conditions

### Concurrent assignments

**Проблема**: Два organizer'а одновременно назначают участников в crew на последнее место.

**Решение**:
1. Оптимистичная блокировка на crew entity (version field)
2. Проверка capacity в транзакции
3. При конфликте - retry с exponential backoff

```java
@Entity
public class CrewEntity {
    @Version
    private Long version;  // Оптимистичная блокировка
}
```

### Seat number conflicts

**Проблема**: Два участника назначаются на одно место одновременно.

**Решение**: Unique constraint + проверка в транзакции

```sql
-- При назначении с seat number
SELECT * FROM crew_assignments
WHERE crew_id = ? AND seat_number = ? AND status = 'ACTIVE'
FOR UPDATE;  -- Pessimistic lock
```

## Валидации

### Crew level

- ✅ Уникальность имени в рамках события
- ✅ Capacity >= 1
- ✅ currentSize <= capacity (всегда)
- ✅ Type соответствует CrewType enum

### Assignment level

- ✅ userId существует (проверка через Event Service)
- ✅ bookingId существует и CONFIRMED
- ✅ Нет дублирующих назначений (user + event)
- ✅ Seat number уникален в crew (если указан)

### Boat/Tent level

- ✅ Только для соответствующих типов crews
- ✅ One-to-One связь с crew

## Exceptions

### Custom Exceptions

```java
// Crew не найден
public class CrewNotFoundException extends RuntimeException { }

// Превышена вместимость
public class CrewCapacityExceededException extends RuntimeException { }

// Назначение не найдено
public class AssignmentNotFoundException extends RuntimeException { }

// Лодка не найдена
public class BoatNotFoundException extends RuntimeException { }

// Палатка не найдена
public class TentNotFoundException extends RuntimeException { }
```

### Маппинг в HTTP статусы

- `CrewNotFoundException` → 404 Not Found
- `AssignmentNotFoundException` → 404 Not Found
- `BoatNotFoundException` → 404 Not Found
- `TentNotFoundException` → 404 Not Found
- `CrewCapacityExceededException` → 422 Unprocessable Entity
- `IllegalArgumentException` → 400 Bad Request / 409 Conflict

## Performance Considerations

### Оптимизация запросов

**Проблема**: N+1 запросы при загрузке crews с assignments

**Решение**: Fetch Join
```java
@Query("SELECT c FROM CrewEntity c " +
       "LEFT JOIN FETCH c.assignments a " +
       "WHERE c.eventId = :eventId AND a.status = 'ACTIVE'")
List<CrewEntity> findByEventIdWithAssignments(@Param("eventId") UUID eventId);
```

### Кэширование

**Кандидаты для кэша**:
- Список crews события (часто читается, редко меняется)
- Детали boat/tent (статичные данные)

```java
@Cacheable(value = "event-crews", key = "#eventId")
public List<CrewDto> getCrews(UUID eventId, String type, boolean availableOnly) {
    // ...
}
```

### Индексы

```sql
-- Критичные для производительности
CREATE INDEX idx_crews_event_id ON crew.crews(event_id);
CREATE INDEX idx_crew_assignments_crew_id ON crew.crew_assignments(crew_id);
CREATE INDEX idx_crew_assignments_user_event ON crew.crew_assignments(user_id, crew_id);
CREATE INDEX idx_crew_assignments_booking ON crew.crew_assignments(booking_id);
```

## См. также

- [README](README.md) - обзор сервиса
- [API Documentation](api.md) - детальное описание API
- [Operations](operations.md) - развертывание и мониторинг
- [Database Schema](../database.md) - схема crew в PostgreSQL