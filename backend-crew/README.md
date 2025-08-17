# backend-crew

Сервис управления группами, экипажами, лодками, палатками и назначениями участников.

## Схема базы данных

### Схема: `crew`

#### Таблица: `crews`
Основная таблица групп (экипажи, палатки, столы, автобусы)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| event_id | UUID | ID события (ссылка на event.events.id) |
| name | VARCHAR(100) | Название группы |
| type | VARCHAR(20) | Тип группы: CREW, TENT, TABLE, BUS |
| capacity | INTEGER | Максимальная вместимость |
| current_size | INTEGER | Текущее количество участников (авто-обновляется триггером) |
| description | TEXT | Описание группы |
| metadata | JSONB | Дополнительные данные в JSON формате |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |

**Ограничения:**
- `capacity > 0`
- `current_size >= 0`
- `current_size <= capacity` (проверяется триггерами)
- Уникальность (event_id, name)

#### Таблица: `crew_assignments`
Назначения участников в группы с отслеживанием позиций

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| crew_id | UUID | FK к crews.id |
| user_id | UUID | ID пользователя (ссылка на user.users.id) |
| booking_id | UUID | ID бронирования (ссылка на event.bookings.id) |
| seat_number | INTEGER | Номер места/позиции (опционально) |
| position | VARCHAR(50) | Роль в группе (например, капитан, штурман) |
| assigned_by | UUID | ID пользователя, назначившего |
| assigned_at | TIMESTAMPTZ | Время назначения |
| unassigned_at | TIMESTAMPTZ | Время отмены назначения |
| status | VARCHAR(20) | Статус: ACTIVE, REMOVED, TRANSFERRED |
| notes | TEXT | Заметки |
| created_at | TIMESTAMPTZ | Дата создания |

**Уникальные ограничения:**
- (user_id, crew_id) WHERE status = 'ACTIVE' - пользователь может быть назначен только в одну группу данного типа
- (booking_id) WHERE status = 'ACTIVE' - одно бронирование = одно назначение
- (crew_id, seat_number) WHERE seat_number IS NOT NULL AND status = 'ACTIVE' - уникальность мест

#### Таблица: `team_preferences`
Предпочтения пользователей для назначения в команды

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | ID пользователя |
| event_id | UUID | ID события |
| prefers_with_user_ids | UUID[] | Массив ID пользователей, с которыми хочет быть |
| avoids_user_ids | UUID[] | Массив ID пользователей, которых хочет избежать |
| preferred_crew_types | VARCHAR(20)[] | Предпочитаемые типы групп |
| preferred_positions | VARCHAR(50)[] | Предпочитаемые позиции/роли |
| special_requirements | TEXT | Специальные требования |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |

**Уникальные ограничения:**
- (user_id, event_id) - одни предпочтения на пользователя на событие

#### Таблица: `boats`
Специфическая информация о лодках для групп типа CREW

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| crew_id | UUID | FK к crews.id (1:1 связь) |
| boat_number | VARCHAR(20) | Номер лодки |
| boat_type | VARCHAR(50) | Тип лодки |
| brand | VARCHAR(100) | Марка |
| model | VARCHAR(100) | Модель |
| year_manufactured | INTEGER | Год производства |
| length_meters | DECIMAL(4,2) | Длина в метрах |
| max_weight_kg | INTEGER | Максимальная нагрузка в кг |
| condition | VARCHAR(20) | Состояние: EXCELLENT, GOOD, FAIR, POOR |
| equipment | JSONB | Список оборудования в JSON |
| maintenance_notes | TEXT | Заметки по обслуживанию |
| last_inspection | TIMESTAMPTZ | Дата последней проверки |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |

#### Таблица: `tents`
Специфическая информация о палатках для групп типа TENT

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| crew_id | UUID | FK к crews.id (1:1 связь) |
| tent_number | VARCHAR(20) | Номер палатки |
| tent_type | VARCHAR(50) | Тип палатки |
| brand | VARCHAR(100) | Марка |
| model | VARCHAR(100) | Модель |
| capacity_persons | INTEGER | Вместимость в человеках |
| season_rating | VARCHAR(20) | Сезонность: 1_SEASON, 2_SEASON, 3_SEASON, 4_SEASON |
| waterproof_rating | INTEGER | Рейтинг водостойкости |
| setup_difficulty | VARCHAR(20) | Сложность установки: EASY, MEDIUM, HARD |
| weight_kg | DECIMAL(5,2) | Вес в кг |
| packed_size_cm | VARCHAR(50) | Размер в упаковке |
| condition | VARCHAR(20) | Состояние: EXCELLENT, GOOD, FAIR, POOR |
| equipment | JSONB | Список оборудования в JSON |
| maintenance_notes | TEXT | Заметки по обслуживанию |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |

## Типы групп

### CREW (Экипажи лодок)
- Управление экипажами байдарок, катамаранов, рафтов
- Назначение ролей: капитан, штурман, гребец
- Привязка к конкретной лодке через таблицу `boats`
- Учет опыта и предпочтений участников

### TENT (Палатки)
- Распределение по палаткам в походах
- Учет вместимости и характеристик палаток
- Привязка к конкретной палатке через таблицу `tents`
- Предпочтения соседства участников

### TABLE (Столы на банкетах)
- Рассадка участников за столами
- Номерация мест при необходимости
- Учет диетических предпочтений через metadata

### BUS (Места в автобусе)
- Распределение мест в транспорте
- Номерация сидений
- Учет предпочтений по расположению

## Бизнес-правила

### Ограничения вместимости
1. **Жесткая проверка на уровне БД**: Триггер `tr_crew_assignments_validate_capacity` предотвращает превышение capacity
2. **Автоматический подсчет**: Триггер `tr_crew_assignments_update_size` обновляет current_size при изменениях
3. **Каскадное удаление**: При удалении группы автоматически удаляются все назначения

### Уникальность назначений
1. **Один активный assignment на booking**: Пользователь не может быть назначен дважды с одним бронированием
2. **Уникальные места**: Номера мест в группе уникальны среди активных назначений  
3. **Предотвращение конфликтов**: Нельзя назначить пользователя в несколько групп одновременно

### Статусы назначений
- **ACTIVE**: Активное назначение
- **REMOVED**: Отменено (с указанием времени unassigned_at)
- **TRANSFERRED**: Переведено в другую группу

### Предпочтения команд
1. **Алгоритм назначения** должен учитывать:
   - `prefers_with_user_ids` - желаемые соседи
   - `avoids_user_ids` - нежелательные соседи
   - `preferred_crew_types` - предпочитаемые типы групп
2. **Конфликт интересов**: Если A избегает B, но B хочет быть с A - приоритет у избегания

## Архитектурные особенности

### Межсхемные ссылки
- `crews.event_id` ссылается на `event.events.id`
- `crew_assignments.user_id` ссылается на `user.users.id`
- `crew_assignments.booking_id` ссылается на `event.bookings.id`
- Целостность обеспечивается на уровне приложения (микросервисная архитектура)

### Триггеры и автоматизация
1. **update_crew_current_size()**: Автоматическое обновление счетчика участников
2. **validate_crew_capacity()**: Проверка превышения вместимости
3. **Автоматические timestamp**: updated_at обновляется при изменениях

### JSONB поля
- `crews.metadata` - дополнительная гибкая информация
- `boats.equipment` - список оборудования лодки
- `tents.equipment` - список оборудования палатки

### Массивы UUID
- `team_preferences.prefers_with_user_ids` - массив предпочитаемых соседей
- `team_preferences.avoids_user_ids` - массив избегаемых пользователей
- Используются GIN индексы для быстрого поиска

## Индексы для производительности

### Основные запросы
- Поиск групп по событию: `ix_crews_event`
- Поиск по типу группы: `ix_crews_type`
- Назначения пользователя: `ix_crew_assignments_user`
- Активные назначения: `ix_crew_assignments_active`

### Оптимизация массивов
- GIN индексы на UUID[] колонки для быстрого поиска пересечений
- Partial индексы на активные записи

### Уникальность
- Составные unique индексы предотвращают дублирование
- Partial unique индексы учитывают только активные записи

## Примеры использования

### Создание экипажа для сплава
```sql
-- Создаем группу-экипаж
INSERT INTO crew.crews (event_id, name, type, capacity) 
VALUES ('event-uuid', 'Экипаж №1', 'CREW', 4);

-- Добавляем информацию о лодке
INSERT INTO crew.boats (crew_id, boat_type, brand, model, capacity_persons)
VALUES ('crew-uuid', 'Катамаран', 'Тритон', 'K-4', 4);

-- Назначаем участников
INSERT INTO crew.crew_assignments (crew_id, user_id, booking_id, position, assigned_by)
VALUES 
  ('crew-uuid', 'user1-uuid', 'booking1-uuid', 'captain', 'organizer-uuid'),
  ('crew-uuid', 'user2-uuid', 'booking2-uuid', 'navigator', 'organizer-uuid');
```

### Распределение по палаткам
```sql
-- Создаем палатку
INSERT INTO crew.crews (event_id, name, type, capacity)
VALUES ('event-uuid', 'Палатка №3', 'TENT', 3);

-- Добавляем характеристики палатки
INSERT INTO crew.tents (crew_id, tent_type, capacity_persons, season_rating)
VALUES ('crew-uuid', 'Кемпинговая', 3, '3_SEASON');
```

Это обеспечивает гибкое и надежное управление группами с автоматическим контролем ограничений.

## API Endpoints

### Управление группами

#### GET /api/v1/events/{eventId}/crews
Получение списка групп для события

**Параметры запроса:**
- `type` (опционально) - тип группы (CREW, TENT, TABLE, BUS)
- `availableOnly` (опционально, boolean) - только доступные группы (default: false)

**Пример запроса:**
```bash
GET /api/v1/events/123e4567-e89b-12d3-a456-426614174000/crews?type=CREW&availableOnly=true
```

**Пример ответа:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "eventId": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Экипаж №1",
    "type": "CREW",
    "capacity": 4,
    "currentSize": 2,
    "description": "Опытный экипаж для катамарана",
    "metadata": {
      "difficulty": "advanced",
      "route": "порог Семилужский"
    },
    "boat": {
      "id": "boat-uuid",
      "boatType": "Катамаран",
      "brand": "Тритон",
      "model": "K-4",
      "condition": "GOOD"
    },
    "createdAt": "2024-08-16T10:00:00Z",
    "updatedAt": "2024-08-16T12:30:00Z"
  }
]
```

#### POST /api/v1/events/{eventId}/crews
Создание новой группы

**Пример запроса:**
```json
{
  "name": "Экипаж №2",
  "type": "CREW",
  "capacity": 4,
  "description": "Новичковый экипаж",
  "metadata": {
    "difficulty": "beginner"
  },
  "boat": {
    "boatType": "Байдарка",
    "brand": "Таймень",
    "model": "Т-2",
    "condition": "EXCELLENT"
  }
}
```

#### PUT /api/v1/events/{eventId}/crews/{crewId}
Обновление группы

#### DELETE /api/v1/events/{eventId}/crews/{crewId}
Удаление группы (только если нет активных назначений)

### Управление лодками

#### GET /api/v1/events/{eventId}/boats
Получение списка лодок для события

**Параметры запроса:**
- `boatType` (опционально) - тип лодки
- `condition` (опционально) - состояние (EXCELLENT, GOOD, FAIR, POOR)

**Пример ответа:**
```json
[
  {
    "id": "boat-uuid",
    "crewId": "crew-uuid",
    "boatNumber": "№12",
    "boatType": "Катамаран",
    "brand": "Тритон",
    "model": "K-4",
    "yearManufactured": 2020,
    "lengthMeters": 4.2,
    "maxWeightKg": 400,
    "condition": "GOOD",
    "equipment": {
      "paddles": 4,
      "pump": 1,
      "repair_kit": 1
    },
    "lastInspection": "2024-08-01T00:00:00Z"
  }
]
```

### Управление палатками

#### GET /api/v1/events/{eventId}/tents
Получение списка палаток для события

**Параметры запроса:**
- `tentType` (опционально) - тип палатки
- `seasonRating` (опционально) - сезонность (ONE_SEASON, TWO_SEASON, THREE_SEASON, FOUR_SEASON)
- `condition` (опционально) - состояние

**Пример ответа:**
```json
[
  {
    "id": "tent-uuid",
    "crewId": "crew-uuid",
    "tentNumber": "№5",
    "tentType": "Кемпинговая",
    "brand": "MSR",
    "model": "Hubba Hubba NX",
    "capacityPersons": 3,
    "seasonRating": "THREE_SEASON",
    "waterproofRating": 3000,
    "setupDifficulty": "MEDIUM",
    "weightKg": 2.5,
    "condition": "EXCELLENT",
    "equipment": {
      "stakes": 10,
      "guylines": 4,
      "footprint": 1
    }
  }
]
```

### Управление назначениями

#### POST /api/v1/assignments
Назначение участника в группу

**Пример запроса:**
```json
{
  "crewId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid",
  "bookingId": "booking-uuid",
  "seatNumber": 1,
  "position": "captain",
  "notes": "Опытный участник"
}
```

**Пример ответа:**
```json
{
  "id": "assignment-uuid",
  "crewId": "crew-uuid",
  "userId": "user-uuid",
  "bookingId": "booking-uuid",
  "seatNumber": 1,
  "position": "captain",
  "assignedBy": "user-uuid",
  "assignedAt": "2024-08-16T14:00:00Z",
  "status": "ACTIVE",
  "notes": "Опытный участник",
  "crew": {
    "id": "crew-uuid",
    "name": "Экипаж №1",
    "type": "CREW"
  }
}
```

#### DELETE /api/v1/assignments/{assignmentId}
Отмена назначения

#### GET /api/v1/assignments/crews/{crewId}
Получение назначений для группы

#### GET /api/v1/assignments/users/{userId}
Получение назначений пользователя

#### GET /api/v1/assignments/events/{eventId}/users/{userId}
Получение назначения пользователя в конкретном событии

## Обработка ошибок

### 422 Unprocessable Entity - Превышение вместимости
```json
{
  "type": "https://aquastream.org/problems/crew.capacity-exceeded",
  "title": "Crew Capacity Exceeded",
  "status": 422,
  "detail": "Crew capacity exceeded. Current: 4, Capacity: 4",
  "timestamp": "2024-08-16T14:00:00Z",
  "path": "uri=/api/v1/assignments"
}
```

### 404 Not Found - Группа не найдена
```json
{
  "type": "https://aquastream.org/problems/crew.not-found",
  "title": "Crew Not Found",
  "status": 404,
  "detail": "Crew not found: 550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-08-16T14:00:00Z"
}
```

### 400 Bad Request - Некорректные данные
```json
{
  "type": "https://aquastream.org/problems/invalid-argument",
  "title": "Invalid Argument",
  "status": 400,
  "detail": "User user-uuid is already assigned to a crew in event event-uuid",
  "timestamp": "2024-08-16T14:00:00Z"
}
```

## Примеры использования API

### Создание экипажа с лодкой
```bash
curl -X POST /api/v1/events/event-uuid/crews \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Экипаж Молния",
    "type": "CREW", 
    "capacity": 4,
    "description": "Скоростной экипаж для порогов",
    "boat": {
      "boatType": "Рафт",
      "brand": "AIRE",
      "model": "Super Puma",
      "condition": "EXCELLENT"
    }
  }'
```

### Назначение участника
```bash
curl -X POST /api/v1/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "crewId": "crew-uuid",
    "userId": "user-uuid", 
    "bookingId": "booking-uuid",
    "position": "капитан"
  }'
```

### Поиск доступных экипажей
```bash
curl "GET /api/v1/events/event-uuid/crews?type=CREW&availableOnly=true"
```