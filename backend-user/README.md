# backend-user

Сервис управления пользователями, авторизации и профилей.

## API Endpoints

### Admin Panel - User Management

#### GET /api/v1/admin/users
Получение списка пользователей с пагинацией и фильтрами (только для роли ADMIN).

**Параметры запроса:**
- `page` (int, по умолчанию 0) - номер страницы
- `size` (int, по умолчанию 20) - размер страницы  
- `q` (string, опционально) - поиск по username
- `role` (string, опционально) - фильтр по роли (USER, ORGANIZER, ADMIN)

**Авторизация:** Требуется роль ADMIN

**Пример запроса:**
```bash
GET /api/v1/admin/users?page=0&size=10&role=ORGANIZER&q=john
Authorization: Bearer <admin-jwt-token>
```

**Пример ответа:**
```json
{
  "total": 25,
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_organizer",
      "role": "ORGANIZER", 
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "john_user",
      "role": "USER",
      "active": true, 
      "createdAt": "2024-01-16T14:20:00Z"
    }
  ]
}
```

#### POST /api/v1/admin/users/{id}/role
Изменение роли пользователя (только для роли ADMIN).

**Параметры запроса:**
- `role` (string, required) - новая роль: USER, ORGANIZER, ADMIN

**Авторизация:** Требуется роль ADMIN

**Пример запроса:**
```bash
POST /api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000/role?role=ORGANIZER
Authorization: Bearer <admin-jwt-token>
```

**Пример успешного ответа:**
```json
{
  "success": true
}
```

**Примеры ошибок:**

403 Forbidden - Недостаточно прав:
```json
{
  "type": "https://aquastream.app/problems/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "Access denied"
}
```

400 Bad Request - Некорректная роль:
```json
{
  "type": "https://aquastream.app/problems/validation-failed",
  "title": "Validation Failed", 
  "status": 400,
  "detail": "unsupported role"
}
```

400 Bad Request - Попытка понизить последнего админа:
```json
{
  "type": "https://aquastream.app/problems/business-logic-error",
  "title": "Business Logic Error",
  "status": 400, 
  "detail": "cannot demote last admin"
}
```

404 Not Found - Пользователь не найден:
```json
{
  "type": "https://aquastream.app/problems/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "User not found"
}
```

### Аудит

Все изменения ролей автоматически записываются в таблицу `audit_log` со следующими данными:
- `actor_user_id` - ID администратора, выполнившего операцию
- `action` - "role.change"
- `target_type` - "user" 
- `target_id` - ID пользователя, чья роль была изменена
- `payload` - JSON с новой ролью: `{"role":"ORGANIZER"}`
- `created_at` - время операции

## Валидации

1. **Защита последнего админа**: Нельзя понизить роль пользователя, если он единственный оставшийся ADMIN в системе
2. **Поддерживаемые роли**: USER, ORGANIZER, ADMIN
3. **Авторизация**: Все admin endpoints требуют роль ADMIN

## Архитектура

Сервис состоит из трех модулей:
- `backend-user-api` - REST контроллеры и DTO
- `backend-user-service` - бизнес-логика и сервисы  
- `backend-user-db` - entities, repositories, миграции

## База данных

Схема: `user`

Основные таблицы:
- `users` - пользователи (id, username, password_hash, role, active)
- `profiles` - профили (user_id, phone, telegram, is_telegram_verified)
- `audit_log` - аудит операций (actor_user_id, action, target_type, target_id, payload)
- `refresh_sessions` - сессии обновления токенов
- `recovery_codes` - коды восстановления пароля