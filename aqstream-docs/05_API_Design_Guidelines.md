# API Design Guidelines - AqStream

## Общие принципы

### RESTful архитектура
API следует принципам REST:
- Ресурсно-ориентированный подход
- Использование HTTP методов по назначению
- Stateless взаимодействие
- HATEOAS где применимо

### Версионирование
- Версия API включается в URL: `/api/v1/`
- Major версии для breaking changes
- Minor версии для backward-compatible изменений

### Формат данных
- JSON для request/response bodies
- UTF-8 encoding
- camelCase для названий полей
- ISO 8601 для дат и времени

## Структура URL

### Базовый URL
```
https://api.aqstream.ru/api/v1
```

### Соглашения о именовании
- Используем множественное число для коллекций: `/events`, `/users`
- Kebab-case для составных слов: `/event-templates`
- Вложенные ресурсы через слэш: `/events/{id}/registrations`

## HTTP методы

### GET
Получение ресурса или коллекции
```http
GET /api/v1/events
GET /api/v1/events/{id}
```

### POST
Создание нового ресурса
```http
POST /api/v1/events
Content-Type: application/json

{
  "title": "Название события",
  "description": "Описание"
}
```

### PUT
Полное обновление ресурса
```http
PUT /api/v1/events/{id}
Content-Type: application/json

{
  "title": "Новое название",
  "description": "Новое описание",
  // все поля
}
```

### PATCH
Частичное обновление ресурса
```http
PATCH /api/v1/events/{id}
Content-Type: application/json

{
  "title": "Только название изменилось"
}
```

### DELETE
Удаление ресурса
```http
DELETE /api/v1/events/{id}
```

## Основные эндпоинты

### Аутентификация

#### Регистрация
```http
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "Иван",
  "lastName": "Иванов"
}

Response 201:
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Иванов",
  "role": "USER",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

#### Вход
```http
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response 200:
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

#### Обновление токена
```http
POST /api/v1/auth/refresh
{
  "refreshToken": "jwt_refresh_token"
}

Response 200:
{
  "accessToken": "new_jwt_access_token",
  "expiresIn": 900
}
```

### События

#### Получение списка событий
```http
GET /api/v1/events?page=1&size=20&sort=startDate,asc&type=sport&location=moscow

Response 200:
{
  "content": [
    {
      "id": "uuid",
      "title": "Велозаезд в парке",
      "shortDescription": "Утренний заезд",
      "eventType": "sport",
      "coverImageUrl": "https://...",
      "startDate": "2024-01-15T10:00:00Z",
      "location": {
        "type": "OFFLINE",
        "address": "Парк Горького"
      },
      "price": 0,
      "availableSeats": 15,
      "totalSeats": 50
    }
  ],
  "pageable": {
    "page": 1,
    "size": 20,
    "total": 145,
    "totalPages": 8
  }
}
```

#### Создание события
```http
POST /api/v1/events
Authorization: Bearer {token}
{
  "title": "Название события",
  "description": "Полное описание",
  "shortDescription": "Краткое описание",
  "eventType": "education",
  "locationType": "OFFLINE",
  "locationAddress": "Москва, ул. Ленина 1",
  "startDate": "2024-01-20T18:00:00Z",
  "endDate": "2024-01-20T21:00:00Z",
  "maxParticipants": 30,
  "price": 500,
  "requiresApproval": true
}

Response 201:
{
  "id": "uuid",
  "status": "DRAFT",
  // все поля события
}
```

#### Обновление события
```http
PATCH /api/v1/events/{id}
Authorization: Bearer {token}
{
  "title": "Новое название",
  "maxParticipants": 40
}

Response 200:
{
  "id": "uuid",
  // обновленное событие
}
```

#### Отправка на модерацию
```http
POST /api/v1/events/{id}/submit-for-moderation
Authorization: Bearer {token}

Response 200:
{
  "id": "uuid",
  "status": "PENDING_MODERATION",
  "moderationStatus": "PENDING"
}
```

### Регистрации

#### Регистрация на событие
```http
POST /api/v1/events/{eventId}/registrations
Authorization: Bearer {token}
{
  "comment": "Хочу в группу с друзьями"
}

Response 201:
{
  "id": "uuid",
  "eventId": "event_uuid",
  "userId": "user_uuid",
  "status": "PENDING",
  "registeredAt": "2024-01-10T12:00:00Z"
}
```

#### Получение регистраций события
```http
GET /api/v1/events/{eventId}/registrations
Authorization: Bearer {token}

Response 200:
{
  "content": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "Иван",
        "lastName": "Иванов",
        "email": "ivan@example.com"
      },
      "status": "APPROVED",
      "paymentStatus": "PAID",
      "registeredAt": "2024-01-10T12:00:00Z"
    }
  ]
}
```

#### Подтверждение регистрации
```http
POST /api/v1/registrations/{id}/approve
Authorization: Bearer {token}

Response 200:
{
  "id": "uuid",
  "status": "APPROVED"
}
```

### Оплата

#### Загрузка подтверждения оплаты
```http
POST /api/v1/registrations/{id}/payment-proof
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary]

Response 200:
{
  "id": "uuid",
  "paymentStatus": "PENDING",
  "paymentProofUrl": "https://..."
}
```

#### Подтверждение оплаты
```http
POST /api/v1/registrations/{id}/confirm-payment
Authorization: Bearer {token}

Response 200:
{
  "id": "uuid",
  "paymentStatus": "PAID",
  "paymentConfirmedAt": "2024-01-11T15:00:00Z"
}
```

### Группы

#### Создание группы
```http
POST /api/v1/events/{eventId}/groups
Authorization: Bearer {token}
{
  "name": "Байдарка 1",
  "description": "Двухместная байдарка",
  "groupType": "transport",
  "maxMembers": 2
}

Response 201:
{
  "id": "uuid",
  "name": "Байдарка 1",
  "groupType": "transport",
  "maxMembers": 2,
  "currentMembers": 0
}
```

#### Добавление участника в группу
```http
POST /api/v1/groups/{groupId}/members
Authorization: Bearer {token}
{
  "registrationId": "registration_uuid",
  "userPreferences": "Предпочитаю с Петровым"
}

Response 201:
{
  "id": "uuid",
  "groupId": "group_uuid",
  "registrationId": "registration_uuid"
}
```

### Сообщества

#### Создание сообщества
```http
POST /api/v1/communities
Authorization: Bearer {token}
{
  "name": "Клуб велосипедистов",
  "description": "Сообщество любителей велоспорта",
  "isPublic": true,
  "requiresApproval": true
}

Response 201:
{
  "id": "uuid",
  "name": "Клуб велосипедистов",
  "slug": "klub-velosipedistov",
  "memberCount": 0
}
```

#### Запрос на вступление
```http
POST /api/v1/communities/{id}/join-request
Authorization: Bearer {token}
{
  "message": "Хочу присоединиться"
}

Response 201:
{
  "id": "uuid",
  "status": "PENDING"
}
```

### Уведомления

#### Получение уведомлений
```http
GET /api/v1/notifications?unread=true
Authorization: Bearer {token}

Response 200:
{
  "content": [
    {
      "id": "uuid",
      "type": "REGISTRATION_APPROVED",
      "title": "Регистрация подтверждена",
      "message": "Ваша регистрация на событие подтверждена",
      "isRead": false,
      "createdAt": "2024-01-11T10:00:00Z"
    }
  ]
}
```

#### Отметка как прочитанное
```http
POST /api/v1/notifications/{id}/mark-as-read
Authorization: Bearer {token}

Response 200:
{
  "id": "uuid",
  "isRead": true
}
```

## Пагинация

Используем стандартные параметры:
- `page` - номер страницы (начинается с 0)
- `size` - размер страницы (по умолчанию 20, макс 100)
- `sort` - сортировка в формате `field,direction`

```http
GET /api/v1/events?page=0&size=20&sort=startDate,desc
```

## Фильтрация

Параметры фильтрации передаются в query string:
```http
GET /api/v1/events?type=sport&location=moscow&priceMin=0&priceMax=1000
```

## Поиск

Полнотекстовый поиск через параметр `q`:
```http
GET /api/v1/events/search?q=велосипед&page=0&size=20
```

## Обработка ошибок

Используем RFC 7807 Problem Details:

### Структура ошибки
```json
{
  "type": "https://api.aqstream.ru/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request contains invalid fields",
  "instance": "/api/v1/events",
  "timestamp": "2024-01-01T12:00:00Z",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request - неверные параметры |
| 401 | Unauthorized - требуется аутентификация |
| 403 | Forbidden - недостаточно прав |
| 404 | Not Found - ресурс не найден |
| 409 | Conflict - конфликт состояния |
| 422 | Unprocessable Entity - бизнес-логика |
| 429 | Too Many Requests - rate limit |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Аутентификация и авторизация

### JWT токены
Используем Bearer токены в заголовке Authorization:
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Структура токена
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "role": "ORGANIZER",
  "organizationId": "org_uuid",
  "exp": 1234567890,
  "iat": 1234567890
}
```

## Rate Limiting

Используем Bucket4j для ограничения запросов:
- Анонимные: 100 req/hour
- Авторизованные: 1000 req/hour
- Организаторы: 5000 req/hour

Заголовки ответа:
```http
X-Rate-Limit-Limit: 1000
X-Rate-Limit-Remaining: 999
X-Rate-Limit-Reset: 1234567890
```

## CORS

Настройки для фронтенда:
```http
Access-Control-Allow-Origin: https://aqstream.ru
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

## Загрузка файлов

### Загрузка изображений
```http
POST /api/v1/upload/image
Content-Type: multipart/form-data

file: [binary]

Response 200:
{
  "url": "https://cdn.aqstream.ru/images/uuid.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg"
}
```

### Ограничения
- Максимальный размер: 10 MB
- Форматы: JPEG, PNG, WebP
- Автоматическая оптимизация

## WebSocket для real-time

### Подключение
```javascript
ws://api.aqstream.ru/ws?token={jwt_token}
```

### События
```json
{
  "type": "REGISTRATION_UPDATE",
  "data": {
    "eventId": "uuid",
    "registrationCount": 25
  }
}
```

## Метрики и мониторинг

### Health check
```http
GET /api/v1/health

Response 200:
{
  "status": "UP",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Metrics (Spring Actuator)
```http
GET /api/v1/actuator/metrics
Authorization: Bearer {admin_token}
```

## OpenAPI спецификация

Документация доступна по адресам:
- Swagger UI: `/swagger-ui.html`
- OpenAPI JSON: `/v3/api-docs`
- OpenAPI YAML: `/v3/api-docs.yaml`

## Примеры использования

### Полный флоу создания события

1. Аутентификация организатора
2. Создание черновика события
3. Загрузка обложки
4. Обновление события с URL обложки
5. Отправка на модерацию
6. (Админ) Одобрение события
7. Событие становится доступным

### Полный флоу регистрации участника

1. Аутентификация пользователя
2. Поиск события
3. Регистрация на событие
4. Загрузка подтверждения оплаты
5. (Организатор) Подтверждение оплаты
6. Получение уведомления о подтверждении
7. Просмотр информации о группе

## Версионирование и обратная совместимость

### Правила изменений

**Non-breaking changes:**
- Добавление новых эндпоинтов
- Добавление опциональных полей
- Добавление новых параметров запроса

**Breaking changes:**
- Удаление эндпоинтов
- Изменение обязательных полей
- Изменение типов данных
- Изменение поведения

### Deprecation policy
- Уведомление за 3 месяца
- Заголовок `Deprecation: true`
- Заголовок `Sunset: 2024-12-31`
