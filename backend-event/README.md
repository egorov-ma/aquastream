# backend-event

Сервис управления событиями, организаторами и связанным контентом.

## Схема базы данных

### Схема: `event`

#### Таблица: `organizers`
Организаторы мероприятий (компании/индивидуальные организаторы)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| slug | VARCHAR(100) | Уникальный идентификатор для URL (например: aqua-adventures) |
| name | VARCHAR(255) | Название организатора |
| logo_url | VARCHAR(500) | URL логотипа |
| description | TEXT | Описание организатора |
| contacts | JSONB | Контакты (телефон, email, telegram, сайт) |
| brand_color | VARCHAR(7) | Цвет бренда в формате HEX (#RRGGBB) |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |

**Индексы:**
- `ix_organizers_slug` - для поиска по slug

#### Таблица: `events`
События и мероприятия

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| organizer_slug | VARCHAR(100) | FK к organizers.slug |
| type | VARCHAR(50) | Тип события (RAFTING, HIKING, BANQUET, etc.) |
| title | VARCHAR(500) | Название события |
| date_start | TIMESTAMPTZ | Дата начала |
| date_end | TIMESTAMPTZ | Дата окончания |
| location | JSONB | Локация (адрес, координаты, место проведения) |
| price | DECIMAL(10,2) | Цена (NULL для бесплатных) |
| capacity | INTEGER | Общая вместимость |
| available | INTEGER | Доступные места |
| status | VARCHAR(20) | Статус (DRAFT, PUBLISHED, CANCELLED, COMPLETED) |
| tags | TEXT[] | Массив тегов для фильтрации |
| description | TEXT | Описание события |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |

**Ограничения:**
- `date_end >= date_start`
- `available <= capacity`
- `capacity > 0`
- `available >= 0`

**Индексы для фильтрации:**
- `ix_events_organizer` - по организатору
- `ix_events_status` - по статусу
- `ix_events_type` - по типу события  
- `ix_events_date_start` - по дате начала
- `ix_events_price` - по цене
- `ix_events_available` - по доступности мест
- `ix_events_tags` (GIN) - поиск по тегам
- `ix_events_title_fts` (GIN) - полнотекстовый поиск по названию

**Составные индексы для оптимизации:**
- `ix_events_status_date` - опубликованные события по дате
- `ix_events_type_date` - события по типу и дате
- `ix_events_price_date` - платные события по цене и дате
- `ix_events_upcoming` - ближайшие опубликованные события
- `ix_events_active_with_spots` - доступные события с местами

#### Таблица: `team_members`
Участники команды организатора (для страниц организаторов)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| organizer_id | UUID | FK к organizers.id |
| name | VARCHAR(255) | Имя участника |
| role | VARCHAR(100) | Роль (Guide, Instructor, Manager, etc.) |
| photo_url | VARCHAR(500) | URL фотографии |
| bio | TEXT | Биография |
| sort_order | INTEGER | Порядок сортировки |
| created_at | TIMESTAMPTZ | Дата создания |

**Индексы:**
- `ix_team_members_organizer` - по организатору
- `ix_team_members_sort` - по организатору и порядку сортировки

#### Таблица: `faq_items`
FAQ элементы для страниц организаторов

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| organizer_id | UUID | FK к organizers.id |
| question | TEXT | Вопрос |
| answer | TEXT | Ответ |
| sort_order | INTEGER | Порядок сортировки |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |

**Индексы:**
- `ix_faq_items_organizer` - по организатору
- `ix_faq_items_sort` - по организатору и порядку сортировки

#### Таблица: `favorites`
Избранные события пользователей

| Поле | Тип | Описание |
|------|-----|----------|
| user_id | UUID | ID пользователя (ссылка на user.users.id) |
| event_id | UUID | FK к events.id |
| created_at | TIMESTAMPTZ | Дата добавления в избранное |

**Первичный ключ:** (user_id, event_id)

**Индексы:**
- `ix_favorites_user` - по пользователю
- `ix_favorites_event` - по событию

#### Таблица: `waitlist`
Лист ожидания для событий без мест (FIFO)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| event_id | UUID | FK к events.id |
| user_id | UUID | ID пользователя (ссылка на user.users.id) |
| priority | INTEGER | Приоритет FIFO (меньше = выше приоритет) |
| notified_at | TIMESTAMPTZ | Время уведомления о доступном месте |
| notification_expires_at | TIMESTAMPTZ | Истечение 30-минутного окна подтверждения |
| created_at | TIMESTAMPTZ | Дата добавления в лист ожидания |

**Уникальные ограничения:**
- (event_id, user_id) - пользователь может быть в листе ожидания события только один раз
- (event_id, priority) - уникальный приоритет в рамках события

**Индексы:**
- `ix_waitlist_event` - по событию
- `ix_waitlist_user` - по пользователю
- `ix_waitlist_priority` - по событию и приоритету
- `ix_waitlist_notified` - по времени уведомления
- `ix_waitlist_expires` - по времени истечения уведомления

## Архитектурные особенности

### Межсхемные ссылки
- `favorites.user_id` и `waitlist.user_id` ссылаются на `user.users.id`, но без FK constraints (микросервисная архитектура)
- Целостность обеспечивается на уровне приложения

### JSONB поля
- `organizers.contacts` - контактная информация
- `events.location` - данные о локации (адрес, координаты, место проведения)

### Массивы
- `events.tags` - массив строковых тегов для фильтрации

### Автоматические триггеры
- `updated_at` автоматически обновляется при изменении записи в таблицах:
  - organizers
  - events  
  - faq_items

### Типы событий
Примеры значений для `events.type`:
- RAFTING (сплавы)
- HIKING (походы)
- BANQUET (банкеты)
- WORKSHOP (мастер-классы)
- TOUR (экскурсии)

### Статусы событий и переходы

| Статус | Описание | Разрешенные переходы |
|--------|----------|---------------------|
| `DRAFT` | Черновик события (по умолчанию) | → `PUBLISHED` |
| `PUBLISHED` | Опубликованное событие | → `CANCELLED`, → `COMPLETED` |
| `CANCELLED` | Отмененное событие | *конечный статус* |
| `COMPLETED` | Завершенное событие | *конечный статус* |

**Правила переходов:**
- Новые события создаются в статусе `DRAFT`
- Редактировать можно только события в статусе `DRAFT`
- Публикация возможна только из `DRAFT` → `PUBLISHED`
- Попытка невалидного перехода возвращает 409 Conflict с Problem Details
- Опубликованные события нельзя редактировать (только отменить или завершить)

## Оптимизация производительности

### Индексы для фильтров главной страницы
- По дате (ближайшие события)
- По типу событий
- По стоимости
- По наличию мест
- По тегам (GIN индекс)

### Полнотекстовый поиск
- GIN индекс на `events.title` для быстрого поиска по названиям

### Частичные индексы
- Только для опубликованных будущих событий
- Только для событий с доступными местами

Это обеспечивает быстрые запросы для основных сценариев использования приложения.

## Публичное API

### GET /api/v1/organizers
Получение списка организаторов с пагинацией и поиском.

**Параметры запроса:**
- `search` (string, опционально) - поиск по названию или описанию
- `page` (int, по умолчанию 0) - номер страницы
- `size` (int, по умолчанию 20) - размер страницы

**Пример запроса:**
```bash
GET /api/v1/organizers?search=aqua&page=0&size=10
```

**Пример ответа:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "aqua-adventures",
      "name": "Aqua Adventures",
      "logoUrl": "https://example.com/logo.png",
      "description": "Организатор водных приключений",
      "contacts": {
        "phone": "+7900123456",
        "email": "info@aqua-adventures.ru"
      },
      "brandColor": "#2563eb",
      "eventCount": 15,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T14:20:00Z"
    }
  ],
  "total": 25,
  "page": 0,
  "size": 10,
  "totalPages": 3,
  "hasNext": true,
  "hasPrevious": false
}
```

### GET /api/v1/organizers/{slug}
Получение детальной информации об организаторе с командой, FAQ и последними событиями.

**Пример запроса:**
```bash
GET /api/v1/organizers/aqua-adventures
```

**Пример ответа:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "aqua-adventures",
  "name": "Aqua Adventures",
  "logoUrl": "https://example.com/logo.png",
  "description": "Мы организуем незабываемые водные приключения...",
  "contacts": {
    "phone": "+7900123456",
    "email": "info@aqua-adventures.ru",
    "website": "https://aqua-adventures.ru"
  },
  "brandColor": "#2563eb",
  "events": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "type": "RAFTING",
      "title": "Сплав по реке Белая",
      "dateStart": "2024-06-15T09:00:00Z",
      "dateEnd": "2024-06-15T18:00:00Z",
      "location": {
        "address": "Республика Адыгея, река Белая",
        "coordinates": [44.0, 40.0]
      },
      "price": 3500.00,
      "capacity": 20,
      "available": 5,
      "status": "PUBLISHED",
      "tags": ["rafting", "adventure", "weekend"]
    }
  ],
  "teamMembers": [
    {
      "id": "750e8400-e29b-41d4-a716-446655440002",
      "name": "Иван Петров",
      "role": "Главный инструктор",
      "photoUrl": "https://example.com/ivan.jpg",
      "bio": "Опыт работы 15 лет, сертифицированный инструктор",
      "sortOrder": 1
    }
  ],
  "faqItems": [
    {
      "id": "850e8400-e29b-41d4-a716-446655440003",
      "question": "Что взять с собой на сплав?",
      "answer": "Сменную одежду, солнцезащитный крем, головной убор...",
      "sortOrder": 1
    }
  ]
}
```

### GET /api/v1/organizers/{slug}/events
Получение событий конкретного организатора с фильтрами.

**Параметры запроса:**
- `status` (string, опционально) - статус события (PUBLISHED, DRAFT, etc.)
- `type` (string, опционально) - тип события (RAFTING, HIKING, etc.)
- `minPrice` (decimal, опционально) - минимальная цена
- `maxPrice` (decimal, опционально) - максимальная цена
- `dateFrom` (datetime, опционально) - события от даты
- `dateTo` (datetime, опционально) - события до даты
- `page` (int, по умолчанию 0) - номер страницы
- `size` (int, по умолчанию 20) - размер страницы

**Пример запроса:**
```bash
GET /api/v1/organizers/aqua-adventures/events?status=PUBLISHED&type=RAFTING&minPrice=2000&page=0&size=10
```

### GET /api/v1/events/{id}
Получение детальной информации о событии.

**Пример запроса:**
```bash
GET /api/v1/events/650e8400-e29b-41d4-a716-446655440001
```

**Пример ответа:**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "type": "RAFTING",
  "title": "Сплав по реке Белая",
  "dateStart": "2024-06-15T09:00:00Z",
  "dateEnd": "2024-06-15T18:00:00Z",
  "location": {
    "address": "Республика Адыгея, река Белая",
    "coordinates": [44.0, 40.0],
    "venue": "База отдыха 'Горная'"
  },
  "price": 3500.00,
  "capacity": 20,
  "available": 5,
  "status": "PUBLISHED",
  "tags": ["rafting", "adventure", "weekend"],
  "organizer": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "aqua-adventures",
    "name": "Aqua Adventures",
    "logoUrl": "https://example.com/logo.png",
    "brandColor": "#2563eb"
  }
}
```

### GET /api/v1/events
Глобальный поиск событий с фильтрами (дополнительный endpoint).

**Параметры запроса:** те же что в `/organizers/{slug}/events` + `search` для полнотекстового поиска.

## CRUD API для организаторов (T13)

### POST /api/v1/events
Создание нового события организатором (требуется роль ORGANIZER).

**Заголовки:**
- `Authorization: Bearer <jwt-token>`

**Тело запроса:**
```json
{
  "type": "RAFTING",
  "title": "Сплав по реке Белая",
  "dateStart": "2024-06-15T09:00:00Z",
  "dateEnd": "2024-06-15T18:00:00Z",
  "location": {
    "address": "Республика Адыгея, река Белая",
    "coordinates": [44.0, 40.0],
    "venue": "База отдыха 'Горная'"
  },
  "price": 3500.00,
  "capacity": 20,
  "tags": ["rafting", "adventure", "weekend"],
  "description": "Увлекательный сплав по живописной реке..."
}
```

**Ответ (201 Created):**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "type": "RAFTING",
  "title": "Сплав по реке Белая",
  "dateStart": "2024-06-15T09:00:00Z",
  "dateEnd": "2024-06-15T18:00:00Z",
  "location": {
    "address": "Республика Адыгея, река Белая",
    "coordinates": [44.0, 40.0],
    "venue": "База отдыха 'Горная'"
  },
  "price": 3500.00,
  "capacity": 20,
  "available": 20,
  "status": "DRAFT",
  "tags": ["rafting", "adventure", "weekend"],
  "description": "Увлекательный сплав по живописной реке...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### PUT /api/v1/events/{id}
Обновление события организатором (только для событий в статусе DRAFT).

**Заголовки:**
- `Authorization: Bearer <jwt-token>`

**Тело запроса (все поля опциональны):**
```json
{
  "title": "Обновленное название сплава",
  "dateStart": "2024-06-16T09:00:00Z",
  "dateEnd": "2024-06-16T18:00:00Z",
  "price": 4000.00,
  "capacity": 25,
  "description": "Обновленное описание..."
}
```

**Ответ (200 OK):** тот же формат что и при создании.

**Ошибки:**
- `404 Not Found` - событие не найдено
- `403 Forbidden` - не владелец события
- `409 Conflict` - событие не в статусе DRAFT

### POST /api/v1/events/{id}/publish
Публикация события (переход из DRAFT в PUBLISHED).

**Заголовки:**
- `Authorization: Bearer <jwt-token>`

**Ответ (200 OK):**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "status": "PUBLISHED",
  "updatedAt": "2024-01-15T12:45:00Z"
}
```

**Ошибки:**
- `404 Not Found` - событие не найдено  
- `403 Forbidden` - не владелец события
- `409 Conflict` - событие не в статусе DRAFT или данные неполные

## Валидация

### Валидация дат:
- `dateStart` должна быть в будущем
- `dateEnd` должна быть после `dateStart`

### Валидация цены:
- Должна быть >= 0

### Валидация вместимости:
- Должна быть >= 1

### Валидация для публикации:
- Все обязательные поля должны быть заполнены
- Данные должны пройти стандартную валидацию

## Waitlist API (T14)

### POST /api/v1/events/{eventId}/waitlist
Присоединение к листу ожидания события (требуется роль USER).

**Заголовки:**
- `Authorization: Bearer <jwt-token>`

**Ответ (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "eventId": "650e8400-e29b-41d4-a716-446655440001",
  "userId": "789e0123-e89b-12d3-a456-426614174000",
  "position": 1,
  "totalInQueue": 5,
  "joinedAt": "2024-01-15T10:30:00Z",
  "notified": false,
  "status": "WAITING"
}
```

**Ошибки:**
- `400 Bad Request` - событие имеет доступные места или пользователь уже в очереди
- `404 Not Found` - событие не найдено
- `401 Unauthorized` - требуется авторизация

### DELETE /api/v1/events/{eventId}/waitlist
Покинуть лист ожидания события.

**Заголовки:**
- `Authorization: Bearer <jwt-token>`

**Ответ (204 No Content)**

### GET /api/v1/events/{eventId}/waitlist/status
Получить статус пользователя в листе ожидания.

**Ответ (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "eventId": "650e8400-e29b-41d4-a716-446655440001",
  "userId": "789e0123-e89b-12d3-a456-426614174000",
  "position": 2,
  "totalInQueue": 8,
  "joinedAt": "2024-01-15T10:30:00Z",
  "notified": true,
  "notifiedAt": "2024-01-15T14:00:00Z",
  "notificationExpiresAt": "2024-01-15T14:30:00Z",
  "status": "NOTIFIED"
}
```

### GET /api/v1/events/waitlist
Получить все листы ожидания пользователя.

**Ответ (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "eventId": "650e8400-e29b-41d4-a716-446655440001",
    "position": 1,
    "status": "WAITING"
  },
  {
    "id": "456e7890-e89b-12d3-a456-426614174000", 
    "eventId": "750e8400-e29b-41d4-a716-446655440002",
    "position": 3,
    "status": "NOTIFIED"
  }
]
```

### POST /api/v1/events/{eventId}/waitlist/{userId}/notify
Уведомить следующего в очереди (только для организаторов).

**Заголовки:**
- `Authorization: Bearer <jwt-token>`

**Ответ (200 OK):** тот же формат что и статус.

## Логика Waitlist

### FIFO (First In, First Out)
- Пользователи добавляются в конец очереди с увеличивающимся приоритетом
- При освобождении места уведомляется пользователь с наименьшим приоритетом
- При выходе из очереди все последующие пользователи поднимаются на одну позицию

### Окно удержания места (30 минут)
- При уведомлении о доступном месте у пользователя есть 30 минут для подтверждения
- Время окна конфигурируется в `app.waitlist.notification-window-minutes`
- Если время истекает, место передается следующему в очереди
- Фоновый процесс проверяет истекшие уведомления каждые 5 минут

### Статусы
- `WAITING` - ожидает в очереди
- `NOTIFIED` - уведомлен о доступном месте, окно активно
- `EXPIRED` - время уведомления истекло

### Аудит событий
Все операции waitlist логируются в таблицу `waitlist_audit`:
- `JOINED` - пользователь присоединился к очереди
- `LEFT` - пользователь покинул очередь
- `NOTIFIED` - пользователь уведомлен о доступном месте
- `CONFIRMED` - пользователь подтвердил бронирование
- `EXPIRED` - время уведомления истекло
- `POSITION_CHANGED` - позиция в очереди изменилась

### Конфигурация
```yaml
app:
  waitlist:
    notification-window-minutes: 30  # Окно удержания места
    cleanup-interval-minutes: 5     # Интервал проверки истекших уведомлений
```

## Фильтры и сортировки

### Дефолтные сортировки:
- **Организаторы**: по названию (name ASC)
- **События**: по дате начала (dateStart ASC)
- **Команда**: по порядку сортировки (sortOrder ASC)
- **FAQ**: по порядку сортировки (sortOrder ASC)

### Поддерживаемые фильтры:
- **Поиск организаторов**: по названию и описанию (LIKE)
- **Фильтры событий**: статус, тип, ценовой диапазон, временной диапазон
- **Полнотекстовый поиск**: по названию события (PostgreSQL FTS)