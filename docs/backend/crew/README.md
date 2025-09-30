# Crew Service

## Обзор

**Порт**: 8103
**База данных**: PostgreSQL схема `crew`
**Назначение**: Управление экипажами (crews), распределение участников по группам, управление лодками и палатками

Crew Service отвечает за создание и управление группами участников событий: экипажи лодок, палатки для кемпинга, столы на банкетах, места в автобусах.

## Структура модуля

```
backend-crew/
├── backend-crew-api/       # REST API endpoints (порт 8103)
├── backend-crew-service/   # Бизнес-логика сервиса
└── backend-crew-db/        # Entities и repositories (схема crew)
```

## Основные сущности

### 1. Crew (Экипаж/Группа)

Группа участников для конкретного события.

**Типы crews**:
- `CREW` - Экипаж лодки (гребцы + рулевой)
- `TENT` - Палатка для кемпинга
- `TABLE` - Стол на банкете
- `BUS` - Места в автобусе

**Поля**:
```java
UUID id
UUID eventId
String name                // Название (например, "Лодка #1", "Палатка Северная")
CrewType type              // CREW | TENT | TABLE | BUS
Integer capacity           // Максимальная вместимость
Integer currentSize        // Текущее количество участников
String description         // Описание
Map<String, Object> metadata  // Дополнительные данные (JSONB)
```

**Отношения**:
- `OneToMany` → CrewAssignment (назначения участников)
- `OneToOne` → Boat (для type=CREW)
- `OneToOne` → Tent (для type=TENT)

### 2. CrewAssignment (Назначение)

Назначение участника в crew.

**Поля**:
```java
UUID id
UUID crewId               // Ссылка на crew
UUID userId               // ID участника
UUID bookingId            // ID брони участника
Integer seatNumber        // Номер места (опционально)
String position           // Позиция (например, "гребец", "рулевой")
UUID assignedBy           // Кто назначил (organizer)
Instant assignedAt        // Когда назначено
AssignmentStatus status   // ACTIVE | REMOVED | TRANSFERRED
String notes              // Заметки
```

### 3. Boat (Лодка)

Детали лодки для экипажа.

**Поля**:
```java
UUID id
UUID crewId               // Ссылка на crew
String boatType           // Тип лодки (катамаран, каяк, рафт)
String boatNumber         // Номер лодки
String condition          // Состояние (отлично, хорошо, требует ремонта)
Map<String, Object> specifications  // Спецификации (JSONB)
```

### 4. Tent (Палатка)

Детали палатки для кемпинга.

**Поля**:
```java
UUID id
UUID crewId               // Ссылка на crew
String tentType           // Тип палатки (двухместная, четырехместная)
String location           // Локация на кемпинге
String condition          // Состояние
Map<String, Object> specifications  // Спецификации (JSONB)
```

### 5. TeamPreferences (Предпочтения)

Предпочтения участника по составу команды.

**Поля**:
```java
UUID id
UUID userId               // ID участника
UUID eventId              // ID события
List<UUID> prefersWithUserIds  // С кем хочет быть
List<UUID> avoidsUserIds       // Кого хочет избежать
```

## API Endpoints

### Crews

```http
# Получить все crews события
GET /api/v1/events/{eventId}/crews
Query: ?type=CREW&availableOnly=true

# Получить конкретный crew
GET /api/v1/events/{eventId}/crews/{crewId}

# Создать crew (ORGANIZER)
POST /api/v1/events/{eventId}/crews
Body: CreateCrewDto

# Обновить crew (ORGANIZER)
PUT /api/v1/events/{eventId}/crews/{crewId}
Body: CreateCrewDto

# Удалить crew (ORGANIZER)
DELETE /api/v1/events/{eventId}/crews/{crewId}
```

### Assignments

```http
# Создать назначение (ORGANIZER)
POST /api/v1/assignments
Body: CreateAssignmentDto

# Удалить назначение (ORGANIZER)
DELETE /api/v1/assignments/{assignmentId}

# Получить назначения crew
GET /api/v1/assignments/crews/{crewId}

# Получить назначения пользователя
GET /api/v1/assignments/users/{userId}

# Получить назначение пользователя для события
GET /api/v1/assignments/events/{eventId}/users/{userId}
```

### Boats

```http
# Получить лодки события
GET /api/v1/events/{eventId}/boats
Query: ?boatType=катамаран&condition=отлично

# Получить конкретную лодку
GET /api/v1/events/{eventId}/boats/{boatId}
```

### Tents

```http
# Получить палатки события
GET /api/v1/events/{eventId}/tents
Query: ?tentType=четырехместная&condition=хорошо

# Получить конкретную палатку
GET /api/v1/events/{eventId}/tents/{tentId}
```

## Бизнес-логика

### Создание crew

1. Организатор создает crew для события
2. Указывает тип (CREW, TENT, TABLE, BUS)
3. Устанавливает capacity (вместимость)
4. Опционально: привязывает Boat или Tent

```java
CrewDto crew = crewService.createCrew(eventId, CreateCrewDto.builder()
    .name("Лодка #1")
    .type(CrewType.CREW)
    .capacity(8)
    .build());
```

### Назначение участников

1. Организатор назначает участника в crew
2. Проверка: crew не заполнен (currentSize < capacity)
3. Проверка: участник имеет активную бронь
4. Создается CrewAssignment
5. Увеличивается currentSize crew

```java
CrewAssignmentDto assignment = assignmentService.createAssignment(
    CreateAssignmentDto.builder()
        .crewId(crewId)
        .userId(userId)
        .bookingId(bookingId)
        .seatNumber(3)      // Опционально
        .position("гребец")  // Опционально
        .build()
);
```

### Team Preferences (В разработке)

Участники могут указать предпочтения:
- **Prefers with**: с кем хотят быть в одной команде
- **Avoids**: кого хотят избежать

Организатор может учитывать эти предпочтения при назначении.

## База данных

### Схема crew

```sql
-- Crews (группы)
CREATE TABLE crew.crews (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,  -- CREW, TENT, TABLE, BUS
    capacity INTEGER NOT NULL,
    current_size INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(event_id, name)
);

-- Назначения участников
CREATE TABLE crew.crew_assignments (
    id UUID PRIMARY KEY,
    crew_id UUID NOT NULL REFERENCES crew.crews(id),
    user_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    seat_number INTEGER,
    position VARCHAR(50),
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMP NOT NULL,
    unassigned_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP NOT NULL
);

-- Лодки
CREATE TABLE crew.boats (
    id UUID PRIMARY KEY,
    crew_id UUID NOT NULL UNIQUE REFERENCES crew.crews(id),
    boat_type VARCHAR(50) NOT NULL,
    boat_number VARCHAR(50),
    condition VARCHAR(50),
    specifications JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Палатки
CREATE TABLE crew.tents (
    id UUID PRIMARY KEY,
    crew_id UUID NOT NULL UNIQUE REFERENCES crew.crews(id),
    tent_type VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    condition VARCHAR(50),
    specifications JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Предпочтения команд
CREATE TABLE crew.team_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    prefers_with_user_ids UUID[],
    avoids_user_ids UUID[],
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(user_id, event_id)
);
```

### Индексы

```sql
CREATE INDEX idx_crews_event_id ON crew.crews(event_id);
CREATE INDEX idx_crews_type ON crew.crews(type);
CREATE INDEX idx_crew_assignments_crew_id ON crew.crew_assignments(crew_id);
CREATE INDEX idx_crew_assignments_user_id ON crew.crew_assignments(user_id);
CREATE INDEX idx_crew_assignments_booking_id ON crew.crew_assignments(booking_id);
CREATE INDEX idx_crew_assignments_status ON crew.crew_assignments(status);
CREATE INDEX idx_boats_crew_id ON crew.boats(crew_id);
CREATE INDEX idx_tents_crew_id ON crew.tents(crew_id);
CREATE INDEX idx_team_preferences_user_event ON crew.team_preferences(user_id, event_id);
```

## Зависимости

```gradle
dependencies {
    implementation project(':backend-common')
    implementation project(':backend-crew:backend-crew-db')

    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
}
```

## Конфигурация

### application.yml

```yaml
server:
  port: 8103

spring:
  application:
    name: crew-service

  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
    username: aquastream
    password: ${DB_PASSWORD}

  jpa:
    properties:
      hibernate:
        default_schema: crew

# Rate limiting
aquastream:
  rate-limit:
    enabled: true
    limits:
      default:
        capacity: 60
        window: 1m
```

## Сценарии использования

### 1. Организатор создает экипажи для сплава

```java
// Создать crew для лодки
CrewDto crew1 = crewService.createCrew(eventId, CreateCrewDto.builder()
    .name("Катамаран #1")
    .type(CrewType.CREW)
    .capacity(6)
    .description("Опытный экипаж для сложных порогов")
    .build());

// Добавить информацию о лодке
boatService.createBoat(CreateBoatDto.builder()
    .crewId(crew1.getId())
    .boatType("Катамаран 6-местный")
    .boatNumber("K-001")
    .condition("Отлично")
    .build());

// Назначить участников
for (Booking booking : confirmedBookings) {
    assignmentService.createAssignment(CreateAssignmentDto.builder()
        .crewId(crew1.getId())
        .userId(booking.getUserId())
        .bookingId(booking.getId())
        .build());
}
```

### 2. Участник смотрит свой экипаж

```java
// Получить назначение пользователя
CrewAssignmentDto assignment = assignmentService
    .getUserEventAssignment(eventId, userId);

// Получить детали crew
CrewDto crew = crewService.getCrew(eventId, assignment.getCrewId());

// Crew type=CREW → получить лодку
if (crew.getType() == CrewType.CREW) {
    BoatDto boat = boatService.getBoat(eventId, crew.getBoatId());
}

// Получить всех участников crew
List<CrewAssignmentDto> teammates = assignmentService
    .getCrewAssignments(crew.getId());
```

### 3. Кемпинг: распределение по палаткам

```java
// Создать палатки
CrewDto tent1 = crewService.createCrew(eventId, CreateCrewDto.builder()
    .name("Палатка Северная")
    .type(CrewType.TENT)
    .capacity(4)
    .build());

tentService.createTent(CreateTentDto.builder()
    .crewId(tent1.getId())
    .tentType("Четырехместная")
    .location("Северная поляна, место 12")
    .condition("Хорошо")
    .build());

// Назначить участников в палатку
assignmentService.createAssignment(...);
```

## Права доступа

### ORGANIZER
- Создание/изменение/удаление crews
- Назначение/удаление участников
- Просмотр всех crews и назначений события

### USER
- Просмотр своего crew и назначения
- Просмотр списка crews события (публичный)
- Установка team preferences (в разработке)

### GUEST
- Нет доступа к crew информации

## Мониторинг

### Health Check
```bash
curl http://localhost:8103/actuator/health
```

### Метрики
```bash
curl http://localhost:8103/actuator/metrics
```

### Логи
```bash
# Просмотр логов сервиса
docker logs backend-crew-service

# Фильтрация по уровню
docker logs backend-crew-service | grep ERROR
```

## См. также

- [API Documentation](api.md) - детальное описание API endpoints
- [Business Logic](business-logic.md) - бизнес-правила и валидации
- [Operations](operations.md) - развертывание и обслуживание
- [Database Schema](../database.md) - схема crew в PostgreSQL