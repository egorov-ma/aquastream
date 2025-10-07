# User Service — Бизнес-логика

## Обзор

User Service отвечает за аутентификацию, авторизацию, управление профилями и RBAC.

**Основные функции**: JWT генерация/валидация, password recovery через Telegram, RBAC, audit logging.

## Аутентификация

### Auth Endpoints

| Endpoint | Ключевые шаги | Возвращает |
|----------|---------------|------------|
| `POST /api/auth/register` | 1. Проверка уникальности username<br>2. BCrypt hash (strength 12)<br>3. Создание user (role=USER) + profile<br>4. Генерация JWT<br>5. Audit log | Access + refresh tokens |
| `POST /api/auth/login` | 1. Поиск user + проверка активности<br>2. Проверка пароля (BCrypt)<br>3. Генерация JWT<br>4. Сохранение refresh session<br>5. Audit log | Access + refresh tokens |
| `POST /api/auth/refresh` | 1. Валидация refresh token<br>2. Проверка не revoked<br>3. Revoke старого токена<br>4. Генерация новых токенов<br>5. Сохранение новой session | Новые tokens |
| `POST /api/auth/logout` | 1. Валидация refresh token<br>2. Revoke session<br>3. Audit log | 204 No Content |

### Валидация

| Поле | Требования |
|------|------------|
| `username` | Email формат, уникальный |
| `password` | Min 12 символов, uppercase + lowercase + digit + special char |
| `phone` | Опционально, E.164 формат |

## Профили

### Управление

- `GET /api/users/me` - получить свой профиль
- `PUT /api/users/me` - обновить профиль

**Обязательные поля для бронирования**: `phone` ИЛИ `telegram` (проверяется в Event Service).

### Поля профиля

| Поле | Тип | Описание |
|------|-----|----------|
| `userId` | UUID | FK на user |
| `phone` | String | E.164 format |
| `telegram` | String | @username |
| `isTelegramVerified` | Boolean | Верификация через бота |
| `firstName`, `lastName` | String | Имя, фамилия |
| `birthDate` | LocalDate | Дата рождения |
| `extra` | JsonNode | Дополнительные поля |

## Password Recovery

**Процесс**:

| Шаг | Endpoint | Действия |
|-----|----------|----------|
| 1. Инициация | `POST /api/auth/recovery` | Генерация 6-значного кода → отправка через Telegram/Email, TTL 15 минут |
| 2. Верификация | `POST /api/auth/recovery/verify` | Проверка кода → возврат временного токена (TTL 15 минут) |
| 3. Сброс | `POST /api/auth/recovery/reset` | Обновление пароля, revoke всех sessions, возврат новых JWT |

**Recovery codes**: таблица `recovery_codes`, one-time use, TTL 15 минут.

## RBAC

| Роль | Описание | Изменение роли |
|------|----------|----------------|
| `GUEST` | Только публичные данные | - |
| `USER` | Зарегистрированный пользователь | - |
| `ORGANIZER` | Организатор событий | Только ADMIN |
| `ADMIN` | Полный доступ | Только ADMIN |

**Изменение роли**: `POST /api/admin/users/{id}/role` (только ADMIN), audit log обязателен.

См. [Authentication](../authentication.md) для детальных прав.

## JWT Токены

### Access Token

- **TTL**: 1 час (3600 секунд)
- **Алгоритм**: HS512
- **Payload**: `sub` (user_id), `username`, `role`, `jti`

### Refresh Token

- **TTL**: 30 дней (2592000 секунд)
- **Storage**: БД (`refresh_sessions`)
- **Rotation**: При каждом refresh
- **Revoke**: При logout, password change, смене роли

## База данных

### Таблицы (схема `user`)

| Таблица | Ключевые поля | Описание |
|---------|---------------|----------|
| `users` | `id` (PK), `username` (unique), `password_hash`, `role`, `active` | Пользователи |
| `profiles` | `user_id` (PK, FK), `phone`, `telegram`, `is_telegram_verified`, `first_name`, `last_name`, `birth_date`, `extra` (JSONB) | Профили |
| `refresh_sessions` | `jti` (PK), `user_id` (FK), `issued_at`, `expires_at`, `revoked_at`, `device_info`, `ip_address` | Refresh tokens |
| `recovery_codes` | `id` (PK), `user_id` (FK), `code_hash`, `used_at`, `expires_at` | Password recovery |
| `audit_log` | `id` (PK), `actor_user_id`, `action`, `target_type`, `target_id`, `payload` (JSONB), `ip_address`, `created_at` | Audit trail |

### Индексы

```sql
CREATE INDEX idx_users_username ON user.users(username);
CREATE INDEX idx_refresh_sessions_user_id ON user.refresh_sessions(user_id);
CREATE INDEX idx_refresh_sessions_expires_at ON user.refresh_sessions(expires_at);
CREATE INDEX idx_audit_log_actor_user_id ON user.audit_log(actor_user_id);
```

## Интеграции

| Сервис | Использование |
|--------|---------------|
| **Gateway** | JWT валидация, добавление `X-User-Id`, `X-User-Role` headers |
| **Notification** | Password recovery через Telegram/Email |
| **Event** | Проверка заполненности профиля при бронировании |

## Безопасность

| Механизм | Реализация |
|----------|------------|
| **Password hashing** | BCrypt (strength 12) |
| **JWT secret** | Сильный ключ, environment variable |
| **Refresh rotation** | Новый refresh при каждом использовании |
| **Rate limiting** | 10 req/min для auth endpoints, 5 req/5min для recovery |
| **Audit logging** | Все критичные операции (login, logout, role change) |
| **Session cleanup** | Автоматическое удаление expired sessions (TTL > 30 дней) |

## Audit Events

| Action | Trigger | Payload |
|--------|---------|---------|
| `USER_REGISTERED` | Регистрация | - |
| `USER_LOGIN` | Логин | `ip_address` |
| `USER_LOGOUT` | Logout | - |
| `PASSWORD_CHANGED` | Смена пароля | - |
| `ROLE_CHANGED` | Изменение роли | `old_role`, `new_role` |
| `PROFILE_UPDATED` | Обновление профиля | Измененные поля |

---

См. [Authentication](../authentication.md), [Security](../common/security.md), [User API](api.md).