# User Service — Бизнес-логика

## Обзор

User Service отвечает за аутентификацию, авторизацию, управление профилями и RBAC.

## Основные функции

- Регистрация и аутентификация пользователей
- Генерация и валидация JWT токенов
- Управление профилями
- Password recovery через Telegram
- RBAC (Role-Based Access Control)
- Audit logging

## Домены

### Аутентификация

#### Регистрация

**Endpoint**: `POST /api/auth/register`

**Логика**:
```java
public AuthResponse register(RegisterRequest request) {
    // 1. Проверка уникальности username (email)
    if (userRepository.existsByUsername(request.getUsername())) {
        throw new ConflictException("User already exists");
    }
    
    // 2. Хеширование пароля (BCrypt strength 12)
    String passwordHash = passwordEncoder.encode(request.getPassword());
    
    // 3. Создание пользователя с ролью USER
    User user = new User();
    user.setUsername(request.getUsername());
    user.setPasswordHash(passwordHash);
    user.setRole(UserRole.USER);
    user.setActive(true);
    userRepository.save(user);
    
    // 4. Создание профиля
    Profile profile = new Profile();
    profile.setUserId(user.getId());
    profile.setPhone(request.getPhone());
    profileRepository.save(profile);
    
    // 5. Генерация JWT токенов
    String accessToken = jwtService.generateAccessToken(user);
    String refreshToken = jwtService.generateRefreshToken(user);
    
    // 6. Сохранение refresh session
    refreshSessionRepository.save(new RefreshSession(refreshToken, user.getId()));
    
    // 7. Audit log
    auditLog.log(user.getId(), "USER_REGISTERED", null, null);
    
    return new AuthResponse(accessToken, refreshToken);
}
```

**Валидация**:
- Username: email формат, уникальный
- Password: минимум 12 символов, uppercase + lowercase + digit + special char
- Phone: опционально, E.164 формат

#### Логин

**Endpoint**: `POST /api/auth/login`

**Логика**:
```java
public AuthResponse login(LoginRequest request) {
    // 1. Поиск пользователя
    User user = userRepository.findByUsername(request.getUsername())
        .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
    
    // 2. Проверка активности
    if (!user.isActive()) {
        throw new UnauthorizedException("Account is disabled");
    }
    
    // 3. Проверка пароля
    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
        throw new UnauthorizedException("Invalid credentials");
    }
    
    // 4. Генерация новых токенов
    String accessToken = jwtService.generateAccessToken(user);
    String refreshToken = jwtService.generateRefreshToken(user);
    
    // 5. Сохранение refresh session
    refreshSessionRepository.save(new RefreshSession(refreshToken, user.getId()));
    
    // 6. Audit log
    auditLog.log(user.getId(), "USER_LOGIN", request.getIpAddress());
    
    return new AuthResponse(accessToken, refreshToken);
}
```

#### Refresh Token

**Endpoint**: `POST /api/auth/refresh`

**Логика**:
```java
public AuthResponse refresh(RefreshRequest request) {
    // 1. Валидация refresh token
    Claims claims = jwtService.validateRefreshToken(request.getRefreshToken());
    String jti = claims.get("jti", String.class);
    UUID userId = UUID.fromString(claims.getSubject());
    
    // 2. Проверка что session не revoked
    RefreshSession session = refreshSessionRepository.findByJti(jti)
        .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
    
    if (session.isRevoked()) {
        throw new UnauthorizedException("Token was revoked");
    }
    
    // 3. Revoke старого refresh token
    refreshSessionRepository.revokeByJti(jti);
    
    // 4. Генерация новых токенов
    User user = userRepository.findById(userId).orElseThrow();
    String newAccessToken = jwtService.generateAccessToken(user);
    String newRefreshToken = jwtService.generateRefreshToken(user);
    
    // 5. Сохранение новой session
    refreshSessionRepository.save(new RefreshSession(newRefreshToken, userId));
    
    return new AuthResponse(newAccessToken, newRefreshToken);
}
```

#### Logout

**Endpoint**: `POST /api/auth/logout`

**Логика**:
```java
public void logout(String refreshToken) {
    // Revoke refresh session
    Claims claims = jwtService.validateRefreshToken(refreshToken);
    String jti = claims.get("jti", String.class);
    refreshSessionRepository.revokeByJti(jti);
    
    // Audit log
    UUID userId = UUID.fromString(claims.getSubject());
    auditLog.log(userId, "USER_LOGOUT");
}
```

### Профили

#### Управление профилем

**Endpoints**:
- `GET /api/users/me` - получить свой профиль
- `PUT /api/users/me` - обновить профиль

**Обязательные поля для бронирования**:
- `phone` ИЛИ `telegram` должен быть заполнен
- Проверяется в Event Service при создании брони

**Поля профиля**:
```java
public class Profile {
    UUID userId;
    String phone;              // E.164 format
    String telegram;           // @username
    Boolean isTelegramVerified;
    String firstName;
    String lastName;
    LocalDate birthDate;
    JsonNode extra;            // Дополнительные поля
}
```

### Password Recovery

**Процесс**:

1. **Инициация**: `POST /api/auth/recovery`
   - Проверка существования пользователя
   - Генерация 6-значного кода
   - Отправка через Telegram (приоритет) или Email
   - TTL кода: 15 минут

2. **Верификация**: `POST /api/auth/recovery/verify`
   - Проверка кода
   - Возврат временного токена (TTL 15 минут)

3. **Сброс пароля**: `POST /api/auth/recovery/reset`
   - Проверка временного токена
   - Обновление пароля
   - Revoke всех refresh sessions
   - Возврат новых JWT

### RBAC

**Роли**:
- `GUEST` - только публичные данные
- `USER` - зарегистрированный пользователь
- `ORGANIZER` - организатор событий
- `ADMIN` - полный доступ

**Изменение роли**:
- Только `ADMIN` может изменять роли
- `POST /api/admin/users/{id}/role`
- Audit log обязателен

См. [Authentication](../common/authentication.md) для детальных прав.

## JWT Токены

### Access Token

- **TTL**: 1 час (3600 секунд)
- **Алгоритм**: HS512
- **Payload**: user_id, username, role, jti

### Refresh Token

- **TTL**: 30 дней (2592000 секунд)
- **Storage**: БД (`refresh_sessions`)
- **Rotation**: при каждом refresh
- **Revoke**: при logout, password change

## Базы данных

### Таблицы (схема `user`)

```sql
-- Пользователи
users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Профили
profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    phone VARCHAR(20),
    telegram VARCHAR(100),
    is_telegram_verified BOOLEAN DEFAULT false,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    extra JSONB
);

-- Refresh sessions
refresh_sessions (
    jti UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    device_info VARCHAR(255),
    ip_address VARCHAR(45)
);

-- Recovery codes
recovery_codes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    code_hash VARCHAR(255) NOT NULL,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log
audit_log (
    id UUID PRIMARY KEY,
    actor_user_id UUID,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    payload JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Интеграции

- **JWT**: все сервисы валидируют через Gateway
- **Telegram**: для recovery и верификации аккаунтов
- **Audit**: критичные действия логируются

## Безопасность

- Password hashing: BCrypt (strength 12)
- JWT secret: сильный ключ, env variable
- Refresh token rotation: при каждом использовании
- Rate limiting: 10 req/min на auth endpoints
- Audit logging: все критичные операции

## См. также

- [Authentication](../common/authentication.md) - JWT и RBAC детали
- [Security](../common/security.md) - политики безопасности
- [User API](api.md) - REST endpoints
