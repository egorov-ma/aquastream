# AquaStream Backend Crew Service

Микросервис управления экипажами, группами, лодками, палатками и назначениями участников для мероприятий AquaStream.

## Описание

`backend-crew` предоставляет функциональность для управления различными типами групп участников в походах и мероприятиях: экипажи лодок, распределение по палаткам, рассадка за столами, места в автобусе. Сервис следует принципам чистой архитектуры и микросервисной модели.

## Архитектура

### Мультимодульная структура

```
backend-crew/
├── backend-crew-api/        # REST контроллеры и DTO
│   ├── controller/          # REST endpoints
│   ├── dto/                # Data Transfer Objects
│   └── exception/          # Обработка ошибок API
├── backend-crew-service/    # Бизнес-логика
│   ├── service/            # Бизнес-сервисы
│   ├── mapper/             # Entity ↔ DTO маппинг
│   └── exception/          # Бизнес-исключения
└── backend-crew-db/        # Слой данных
    ├── entity/             # JPA Entity классы
    ├── repository/         # Spring Data JPA репозитории
    └── migration/          # Liquibase миграции БД
```

### Типы групп

#### 🚣 CREW - Экипажи лодок
- Управление экипажами байдарок, катамаранов, рафтов
- Назначение ролей: капитан, штурман, гребец
- Привязка к конкретной лодке с характеристиками
- Учет опыта и предпочтений участников

#### 🏕️ TENT - Палатки
- Распределение по палаткам в походах
- Учет вместимости и характеристик палаток
- Предпочтения соседства участников
- Управление оборудованием палаток

#### 🍽️ TABLE - Столы на банкетах
- Рассадка участников за столами
- Номерация мест при необходимости
- Учет диетических предпочтений

#### 🚌 BUS - Места в автобусе
- Распределение мест в транспорте
- Номерация сидений
- Учет предпочтений по расположению

## Доменная модель

### Основные сущности

#### CrewEntity - Группы
- **id** - Уникальный идентификатор
- **eventId** - Ссылка на событие
- **name** - Название группы
- **type** - Тип (CREW, TENT, TABLE, BUS)
- **capacity** - Максимальная вместимость
- **currentSize** - Текущее количество участников
- **metadata** - Дополнительные данные (JSON)

#### CrewAssignmentEntity - Назначения
- **crewId** - Ссылка на группу
- **userId** - Идентификатор пользователя
- **bookingId** - Ссылка на бронирование
- **seatNumber** - Номер места (опционально)
- **position** - Роль в группе
- **status** - Статус: ACTIVE, REMOVED, TRANSFERRED

#### BoatEntity - Лодки
- **crewId** - Связь с группой (1:1)
- **boatType** - Тип лодки
- **brand, model** - Марка и модель
- **condition** - Состояние лодки
- **equipment** - Оборудование (JSON)

#### TentEntity - Палатки
- **crewId** - Связь с группой (1:1)
- **tentType** - Тип палатки
- **seasonRating** - Сезонность (1-4 сезона)
- **capacityPersons** - Вместимость людей
- **equipment** - Оборудование (JSON)

### Бизнес-правила

#### Контроль вместимости
- Автоматический подсчет участников через триггеры БД
- Жесткая проверка превышения capacity
- Каскадное удаление при удалении группы

#### Уникальность назначений
- Один активный assignment на booking
- Уникальные номера мест в группе
- Предотвращение двойных назначений

#### Предпочтения команд
- Алгоритм учитывает желаемых/нежелательных соседей
- Предпочтения по типам групп и позициям
- Приоритет избегания над желанием

## API Endpoints

### Управление группами

#### `GET /api/v1/events/{eventId}/crews`
Получение списка групп для события

**Параметры:**
- `type` - фильтр по типу группы
- `availableOnly` - только доступные группы

#### `POST /api/v1/events/{eventId}/crews`
Создание новой группы

```json
{
  "name": "Экипаж №1",
  "type": "CREW",
  "capacity": 4,
  "description": "Опытный экипаж",
  "boat": {
    "boatType": "Катамаран",
    "brand": "Тритон",
    "model": "K-4"
  }
}
```

#### `PUT /api/v1/crews/{crewId}`
Обновление группы

#### `DELETE /api/v1/crews/{crewId}`
Удаление группы

### Управление лодками

#### `GET /api/v1/events/{eventId}/boats`
Список лодок для события

#### `POST /api/v1/boats`
Создание лодки

#### `PUT /api/v1/boats/{boatId}`
Обновление характеристик лодки

### Управление палатками

#### `GET /api/v1/events/{eventId}/tents`
Список палаток для события

#### `POST /api/v1/tents`
Создание палатки

#### `PUT /api/v1/tents/{tentId}`
Обновление характеристик палатки

### Управление назначениями

#### `POST /api/v1/assignments`
Назначение участника в группу

```json
{
  "crewId": "crew-uuid",
  "userId": "user-uuid",
  "bookingId": "booking-uuid",
  "seatNumber": 1,
  "position": "captain"
}
```

#### `DELETE /api/v1/assignments/{assignmentId}`
Отмена назначения

#### `GET /api/v1/assignments/crews/{crewId}`
Назначения для группы

#### `GET /api/v1/assignments/users/{userId}`
Назначения пользователя

## Использование

### Подключение

```gradle
dependencies {
    implementation project(':backend-crew:backend-crew-api')
    implementation project(':backend-crew:backend-crew-service')
    implementation project(':backend-crew:backend-crew-db')
}
```

### Конфигурация

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
    username: aquastream_user
    password: ${DB_PASSWORD}
  
  liquibase:
    change-log: classpath:migration/liquibase/master.xml
    default-schema: crew

server:
  port: 8103

aquastream:
  crew:
    auto-assignment: true
    capacity-buffer: 0.1
```

### Примеры использования

#### Создание экипажа для сплава

```java
@Autowired
private CrewService crewService;

// Создание экипажа
CreateCrewDto crewDto = CreateCrewDto.builder()
    .name("Экипаж Молния")
    .type(CrewType.CREW)
    .capacity(4)
    .description("Скоростной экипаж")
    .boat(CreateBoatDto.builder()
        .boatType("Рафт")
        .brand("AIRE")
        .model("Super Puma")
        .build())
    .build();

CrewDto crew = crewService.createCrew(eventId, crewDto);
```

#### Назначение участника

```java
@Autowired
private AssignmentService assignmentService;

CreateAssignmentDto assignment = CreateAssignmentDto.builder()
    .crewId(crewId)
    .userId(userId)
    .bookingId(bookingId)
    .position("captain")
    .build();

CrewAssignmentDto result = assignmentService.assignUserToCrew(assignment);
```

#### Поиск доступных групп

```java
List<CrewDto> availableCrews = crewService.getCrewsByEvent(
    eventId, 
    CrewType.CREW, 
    true // availableOnly
);
```

## База данных

### Схема: crew

#### Таблицы
- **crews** - Основная таблица групп
- **crew_assignments** - Назначения участников
- **boats** - Характеристики лодок
- **tents** - Характеристики палаток
- **team_preferences** - Предпочтения участников

#### Индексы
- `ix_crews_event` - Поиск по событию
- `ix_crews_type` - Фильтрация по типу
- `ix_crew_assignments_user` - Назначения пользователя
- `ix_crew_assignments_active` - Активные назначения

#### Ограничения
- Проверка capacity > 0
- Уникальность (event_id, name)
- Контроль превышения вместимости
- Уникальность активных назначений

## Обработка ошибок

### Стандартные HTTP коды

- **422 Unprocessable Entity** - Превышение вместимости
- **404 Not Found** - Группа/назначение не найдено
- **400 Bad Request** - Некорректные данные
- **409 Conflict** - Конфликт назначений

### Формат ошибок (RFC 7807)

```json
{
  "type": "https://api.aquastream.org/errors/crew-capacity-exceeded",
  "title": "Превышение вместимости экипажа",
  "status": 422,
  "detail": "Превышена вместимость экипажа. Текущий размер: 4, Максимум: 4",
  "instance": "/api/v1/assignments",
  "timestamp": "2025-08-20T10:30:00Z",
  "correlationId": "req-abc123"
}
```

## Мониторинг

### Health Check

```bash
GET /actuator/health
```

### Metrics

```bash
GET /actuator/metrics
```

### OpenAPI документация

```bash
GET /swagger-ui.html
GET /v3/api-docs
```

## Тестирование

### Unit тесты

```bash
./gradlew backend-crew:backend-crew-service:test
```

### Integration тесты

```bash
./gradlew backend-crew:backend-crew-api:test
```

### Тестовые данные

Модуль поддерживает создание тестовых данных через TestContainers и встроенную базу данных H2.

## Производительность

### Оптимизации
- Составные индексы для частых запросов
- Partial индексы только для активных записей
- GIN индексы для JSONB полей
- Batch операции для массовых назначений

### Кэширование
- Spring Cache для часто запрашиваемых данных
- Redis для сессионных данных (опционально)

### Масштабирование
- Stateless сервис, поддерживает горизонтальное масштабирование
- Database connection pooling
- Асинхронная обработка уведомлений

## Безопасность

### Авторизация
- JWT токены через Gateway
- Role-based доступ (ORGANIZER, ADMIN)
- Проверка владения ресурсами

### Валидация
- Валидация входных данных
- Санитизация пользовательского ввода
- Проверка бизнес-правил

## Развертывание

### Docker

```dockerfile
FROM openjdk:21-jre-slim
COPY backend-crew-api/build/libs/*.jar app.jar
EXPOSE 8103
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment переменные

```bash
SPRING_PROFILES_ACTIVE=prod
DB_HOST=postgres
DB_PASSWORD=secure_password
REDIS_HOST=redis
JWT_SECRET=secret_key
```

## Зависимости

### Основные
- Spring Boot 3.x
- Spring Data JPA
- PostgreSQL 15+
- Liquibase
- Swagger/OpenAPI 3

### Опциональные
- Redis (кэширование)
- Micrometer (метрики)
- TestContainers (тестирование)