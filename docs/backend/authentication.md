# Аутентификация и авторизация

## Обзор

Единая система аутентификации на основе JWT с RBAC (Role-Based Access Control) для всех сервисов.

**Архитектура**: Gateway валидирует JWT → добавляет `X-User-Id`, `X-User-Role` → сервисы доверяют headers.

## Роли (RBAC)

| Роль | Ключевые права | Ограничения |
|------|----------------|-------------|
| **Guest** | Просмотр публичных страниц, событий, организаторов | ❌ Бронирование |
| **User** | + Профиль, бронирование, оплата, участие в экипажах, уведомления | ❌ Создание событий |
| **Organizer** | + Управление событиями/брендом, QR модерация, управление экипажами, FAQ | ❌ Управление пользователями |
| **Admin** | Полный доступ: управление ролями, модерация, системные настройки | - |

## Поток аутентификации

### Endpoints

| Endpoint | Тело запроса | Описание | Ответ |
|----------|--------------|----------|-------|
| `POST /api/auth/register` | `username`, `password`, `phone` | Регистрация (role=USER) | JWT tokens |
| `POST /api/auth/login` | `username`, `password` | Вход | Access + refresh tokens |
| `POST /api/auth/refresh` | `refreshToken` | Обновление токена | Новые tokens |
| `POST /api/auth/logout` | `Authorization: Bearer` | Выход (revoke refresh) | 204 No Content |

### Password Recovery

**Процесс**:
1. `POST /api/auth/recovery` (email) → генерирует код → отправляет на email/Telegram
2. `POST /api/auth/recovery/verify` (code) → возвращает временный токен
3. `POST /api/auth/recovery/reset` (token, newPassword) → обновляет пароль, revoke все сессии

**Recovery codes**: TTL 15 минут, one-time use (таблица `recovery_codes` в БД).

## JWT Структура

### Access Token

| Поле | Описание | Пример |
|------|----------|--------|
| `sub` | User ID (UUID) | `550e8400-e29b-...` |
| `username` | Email | `user@example.com` |
| `role` | Роль | `USER`, `ORGANIZER`, `ADMIN` |
| `iat` / `exp` | Issued at / Expiration | Timestamps |
| `jti` | JWT ID (для revoke) | `at-550e8400-...` |

**TTL**: 1 час (3600 секунд)

### Refresh Token

| Поле | Описание |
|------|----------|
| `sub` | User ID |
| `type` | `"refresh"` |
| `iat` / `exp` | Timestamps |
| `jti` | JWT ID |

**TTL**: 30 дней (2592000 секунд)

## Gateway валидация

**Процесс**:
1. Извлекает токен из `Authorization: Bearer <token>`
2. Проверяет подпись (HS512 + secret)
3. Проверяет expiration
4. Извлекает `user_id` и `role`
5. Добавляет headers: `X-User-Id`, `X-User-Role`
6. Пробрасывает к сервису

**Headers propagation**:
```http
# Client → Gateway
Authorization: Bearer eyJhbGc...

# Gateway → Service
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
X-User-Role: USER
```

### Публичные маршруты (без JWT)

```
/api/auth/register, /api/auth/login, /api/auth/refresh
/api/events (GET), /api/events/{id} (GET)
/api/organizers (GET), /api/organizers/{id} (GET)
/actuator/health
```

## Сервисы - авторизация

### Trust Gateway Headers

Сервисы **доверяют** заголовкам от Gateway:

```java
@PostMapping("/api/bookings")
public BookingResponse create(
    @RequestHeader("X-User-Id") UUID userId,
    @RequestHeader("X-User-Role") String role,
    @RequestBody BookingRequest request
) {
    // userId и role уже валидированы Gateway
    // Проверяем только бизнес-правила
    if (!"USER".equals(role) && !"ORGANIZER".equals(role)) {
        throw new ForbiddenException();
    }
    return bookingService.create(userId, request);
}
```

### Role Checks

```java
// Проверка роли
public void checkOrganizer(String role) {
    if (!"ORGANIZER".equals(role) && !"ADMIN".equals(role)) {
        throw new ForbiddenException("Only organizers can perform this action");
    }
}
```

## Session Management

### Refresh Sessions

**Таблица `refresh_sessions`** (схема `user`):

| Поле | Описание |
|------|----------|
| `jti` | JWT ID (PK) |
| `user_id` | FK на user |
| `issued_at`, `expires_at` | Timestamps |
| `revoked_at` | NULL = активна, NOT NULL = revoked |
| `device_info`, `ip_address` | Метаданные |

### Revoke механизм

```java
// При logout
public void logout(String refreshTokenJti) {
    refreshSessionRepository.revokeByJti(refreshTokenJti);
}

// При смене пароля - revoke all
public void revokeAllSessions(UUID userId) {
    refreshSessionRepository.revokeAllByUserId(userId);
}
```

## Security Best Practices

| Правило | Реализация |
|---------|------------|
| **Secret хранение** | Environment variables, никогда в коде |
| **HTTPS только** | Все auth endpoints через HTTPS |
| **Refresh rotation** | Новый refresh при каждом обновлении |
| **Revoke при смене пароля** | Автоматически revoke всех сессий |
| **Rate limiting** | 10 requests/min для `/auth/login`, 5 requests/5min для recovery |
| **Password requirements** | Min 8 символов, буквы + цифры |

---

См. [Security](common/security.md), [User Service](user/README.md), [Gateway](gateway/business-logic.md).