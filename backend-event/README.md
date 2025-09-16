# AquaStream Backend Event Service

Микросервис управления событиями, организаторами, бронированиями, избранным и листом ожидания для платформы AquaStream.

## Описание

`backend-event` предоставляет полный функционал для управления мероприятиями: создание и публикацию событий 
организаторами, бронирование участниками, систему избранного, лист ожидания для переполненных событий. 
Сервис следует принципам чистой архитектуры и микросервисной модели.

## Архитектура

### Мультимодульная структура

```
backend-event/
├── backend-event-api/        # REST контроллеры и DTO
│   ├── controller/          # REST endpoints
│   ├── dto/                # Data Transfer Objects
│   └── exception/          # Обработка ошибок API
├── backend-event-service/   # Бизнес-логика
│   ├── service/            # Бизнес-сервисы
│   ├── mapper/             # Entity ↔ DTO маппинг
│   ├── scheduler/          # Фоновые задачи
│   └── exception/          # Бизнес-исключения
└── backend-event-db/       # Слой данных
    ├── entity/             # JPA Entity классы
    ├── repository/         # Spring Data JPA репозитории
    └── migration/          # Liquibase миграции БД
```

### Основные модули

#### 🎪 События и организаторы
- Управление организаторами с профилями команды и FAQ
- Создание событий (черновики → публикация)
- Полнотекстовый поиск и фильтрация
- Типизированные события: RAFTING, HIKING, BANQUET, WORKSHOP

#### 📅 Система бронирования
- Жизненный цикл: PENDING → CONFIRMED → COMPLETED
- Автоматическое истечение через 30 минут
- Интеграция с платежной системой
- Валидация вместимости и бизнес-правил

#### ⭐ Избранные события
- Добавление/удаление событий в избранное
- Персональная коллекция пользователя
- Счетчики популярности событий

#### 📋 Лист ожидания (Waitlist)
- FIFO очередь для переполненных событий
- 30-минутное окно подтверждения при освобождении места
- Автоматические уведомления через Notification Service
- Полный аудит действий пользователей

## Доменная модель

### Основные сущности

#### EventEntity - События
- **id** - Уникальный идентификатор
- **organizerSlug** - Ссылка на организатора
- **type** - Тип события (RAFTING, HIKING, etc.)
- **title** - Название события
- **dateStart/dateEnd** - Временные рамки
- **location** - Локация (JSON: адрес, координаты, место)
- **price** - Стоимость (NULL для бесплатных)
- **capacity/available** - Вместимость и доступные места
- **status** - Статус: DRAFT, PUBLISHED, CANCELLED, COMPLETED
- **tags** - Массив тегов для фильтрации

#### OrganizerEntity - Организаторы
- **id** - Уникальный идентификатор
- **slug** - Уникальный URL-идентификатор
- **name** - Название организации
- **logoUrl** - URL логотипа
- **contacts** - Контакты (JSON)
- **brandColor** - Фирменный цвет (#RRGGBB)

#### BookingEntity - Бронирования
- **id** - Уникальный идентификатор
- **eventId** - Ссылка на событие
- **userId** - Идентификатор пользователя
- **status** - PENDING, CONFIRMED, CANCELLED, EXPIRED, COMPLETED, NO_SHOW
- **amount** - Стоимость бронирования
- **paymentStatus** - NOT_REQUIRED, PENDING, SUCCEEDED, REJECTED, CANCELED
- **expiresAt** - Время истечения для PENDING бронирований

#### WaitlistEntity - Лист ожидания
- **id** - Уникальный идентификатор
- **eventId** - Ссылка на событие
- **userId** - Идентификатор пользователя
- **priority** - FIFO приоритет (меньше = выше)
- **notifiedAt** - Время уведомления о доступном месте
- **notificationExpiresAt** - Истечение 30-минутного окна

### Бизнес-правила

#### Управление событиями
- Создание в статусе DRAFT, редактирование только черновиков
- Публикация переводит в PUBLISHED (необратимо)
- Завершенные события нельзя редактировать

#### Бронирования
- Одно активное бронирование на пользователя на событие
- Автоматическое истечение PENDING через 30 минут
- Успешная оплата автоматически подтверждает бронирование
- Валидация профиля пользователя (телефон или Telegram)

#### Лист ожидания
- FIFO очередь с автоматическим управлением приоритетами
- 30-минутное окно подтверждения при уведомлении
- Автоматическая передача места следующему при истечении

## API Endpoints

### Публичные события

#### `GET /api/v1/events`
Глобальный поиск событий с фильтрами

**Параметры:**
- `search` - полнотекстовый поиск
- `type` - тип события
- `status` - статус события
- `minPrice/maxPrice` - ценовой диапазон
- `dateFrom/dateTo` - временной диапазон
- `page/size` - пагинация

#### `GET /api/v1/events/{id}`
Детальная информация о событии

#### `GET /api/v1/organizers`
Список организаторов с поиском

#### `GET /api/v1/organizers/{slug}`
Профиль организатора с командой, FAQ и событиями

### Управление событиями (ORGANIZER)

#### `POST /api/v1/events`
Создание нового события

```json
{
  "type": "RAFTING",
  "title": "Сплав по реке Белая",
  "dateStart": "2025-08-25T09:00:00Z",
  "dateEnd": "2025-08-25T18:00:00Z",
  "location": {
    "address": "Республика Адыгея, река Белая",
    "coordinates": [44.0, 40.0]
  },
  "price": 3500.00,
  "capacity": 20,
  "tags": ["rafting", "adventure", "weekend"]
}
```

#### `PUT /api/v1/events/{id}`
Обновление события (только DRAFT)

#### `POST /api/v1/events/{id}/publish`
Публикация события (DRAFT → PUBLISHED)

### Бронирования

#### `POST /api/v1/bookings`
Создание бронирования

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### `GET /api/v1/bookings`
Бронирования пользователя с фильтрами

#### `PUT /api/v1/bookings/{id}/confirm`
Подтверждение бронирования (только для бесплатных событий)

#### `PUT /api/v1/bookings/{id}/cancel`
Отмена бронирования

### Избранное

#### `POST /api/v1/events/{eventId}/favorite`
Добавить в избранное

#### `DELETE /api/v1/events/{eventId}/favorite`
Удалить из избранного

#### `GET /api/v1/profile/favorites`
Список избранных событий пользователя

#### `GET /api/v1/events/{eventId}/favorite/status`
Проверить статус избранного

### Лист ожидания

#### `POST /api/v1/events/{eventId}/waitlist`
Присоединиться к листу ожидания

#### `DELETE /api/v1/events/{eventId}/waitlist`
Покинуть лист ожидания

#### `GET /api/v1/events/{eventId}/waitlist/status`
Статус в листе ожидания

#### `GET /api/v1/events/waitlist`
Все листы ожидания пользователя

## Использование

### Подключение

```gradle
dependencies {
    implementation project(':backend-event:backend-event-api')
    implementation project(':backend-event:backend-event-service')
    implementation project(':backend-event:backend-event-db')
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
    default-schema: event

server:
  port: 8102

aquastream:
  scheduling:
    enabled: true
  booking:
    expiration-minutes: 30
  waitlist:
    notification-window-minutes: 30
    cleanup-interval-minutes: 5
```

### Примеры использования

#### Создание события

```java
@Autowired
private OrganizerEventService eventService;

CreateEventDto eventDto = CreateEventDto.builder()
    .type("RAFTING")
    .title("Сплав по реке Белая")
    .dateStart(LocalDateTime.of(2025, 8, 25, 9, 0))
    .dateEnd(LocalDateTime.of(2025, 8, 25, 18, 0))
    .price(BigDecimal.valueOf(3500))
    .capacity(20)
    .tags(List.of("rafting", "adventure"))
    .build();

EventDto event = eventService.createEvent(organizerSlug, eventDto);
```

#### Создание бронирования

```java
@Autowired
private BookingService bookingService;

CreateBookingRequest request = new CreateBookingRequest();
request.setEventId(eventId);

BookingDto booking = bookingService.createBooking(userId, request);
```

#### Работа с листом ожидания

```java
@Autowired
private WaitlistService waitlistService;

// Присоединение к листу ожидания
JoinWaitlistDto joinResult = waitlistService.joinWaitlist(eventId, userId);

// Проверка статуса
WaitlistStatusDto status = waitlistService.getWaitlistStatus(eventId, userId);
```

## База данных

### Схема: event

#### Основные таблицы
- **organizers** - Организаторы мероприятий
- **events** - События и мероприятия
- **team_members** - Команда организатора
- **faq_items** - FAQ организатора
- **bookings** - Бронирования
- **booking_logs** - Аудит бронирований
- **favorites** - Избранные события
- **waitlist** - Лист ожидания
- **waitlist_audit** - Аудит действий в листе ожидания

#### Индексы
- **События**: по организатору, статусу, типу, дате, цене, тегам
- **Бронирования**: по пользователю, событию, статусу
- **Лист ожидания**: по событию, приоритету, уведомлениям
- **Полнотекстовый поиск**: GIN индекс на названия событий

#### Ограничения
- Валидация дат (dateEnd >= dateStart)
- Контроль вместимости (available <= capacity)
- Уникальность активных бронирований
- Уникальность приоритетов в листе ожидания

## Интеграции

### С Payment Service
- Автоматическое создание платежей для платных событий
- Webhook обработка для подтверждения бронирований
- Поддержка QR платежей с ручной модерацией

### С User Service
- Валидация полноты профиля (телефон/Telegram)
- JWT аутентификация и извлечение user ID
- Проверка ролей (USER, ORGANIZER)

### С Notification Service
- Уведомления о подтверждении бронирований
- Предупреждения об истечении времени
- Уведомления листа ожидания о доступных местах

## Фоновые задачи

### Истечение бронирований
- **Частота**: каждые 60 секунд
- **Функция**: перевод PENDING → EXPIRED после 30 минут
- **Эффект**: освобождение мест, активация листа ожидания

### Очистка листа ожидания
- **Частота**: каждые 5 минут
- **Функция**: обработка истекших уведомлений
- **Эффект**: передача места следующему в очереди

## Обработка ошибок

### Стандартные HTTP коды

- **400 Bad Request** - Некорректные данные запроса
- **401 Unauthorized** - Требуется аутентификация
- **403 Forbidden** - Недостаточно прав доступа
- **404 Not Found** - Ресурс не найден
- **409 Conflict** - Нарушение бизнес-правил
- **422 Unprocessable Entity** - Валидационные ошибки

### Формат ошибок (RFC 7807)

```json
{
  "type": "https://api.aquastream.org/errors/booking-conflict",
  "title": "Конфликт бронирования",
  "status": 409,
  "detail": "У пользователя уже есть активное бронирование на это событие",
  "instance": "/api/v1/bookings",
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
./gradlew backend-event:backend-event-service:test
```

### Integration тесты

```bash
./gradlew backend-event:backend-event-api:test
```

### Тестовые данные

Модуль поддерживает создание тестовых данных через TestContainers и встроенную базу данных H2.

## Производительность

### Оптимизации
- Составные индексы для частых запросов
- Partial индексы для активных записей
- GIN индексы для JSONB полей и массивов
- Batch операции для массовых уведомлений

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
- Role-based доступ (USER, ORGANIZER, ADMIN)
- Проверка владения ресурсами

### Валидация
- Валидация входных данных
- Санитизация пользовательского ввода
- Проверка бизнес-правил

## Развертывание

### Docker

```dockerfile
FROM openjdk:21-jre-slim
COPY backend-event-api/build/libs/*.jar app.jar
EXPOSE 8102
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