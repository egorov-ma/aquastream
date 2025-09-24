# AquaStream Backend User Service

Микросервис управления пользователями, аутентификации и авторизации для платформы AquaStream с поддержкой JWT токенов, ролевой модели, восстановления паролей и интеграции с Telegram.

## Описание

`backend-user` предоставляет централизованную систему управления пользователями для AquaStream:
- Регистрация и аутентификация пользователей
- JWT токены с ротацией refresh tokens
- Ролевая модель (USER, ORGANIZER, ADMIN)
- Административное управление пользователями
- Восстановление паролей через коды
- Интеграция с Telegram для связывания аккаунтов
- Профили пользователей с контактной информацией
- Аудит всех изменений и операций
- Автоматическая очистка просроченных сессий

Сервис следует принципам чистой архитектуры и микросервисной модели.

## Архитектура

### Мультимодульная структура

```
backend-user/
├── backend-user-api/          # REST контроллеры и DTO
│   ├── controller/           # REST endpoints
│   │   ├── AuthController    # Аутентификация и сессии
│   │   ├── AdminUserController # Управление пользователями
│   │   ├── ProfileController # Профили пользователей
│   │   ├── RecoveryController # Восстановление паролей
│   │   └── TelegramController # Telegram интеграция
│   ├── dto/                  # Data Transfer Objects
│   └── resources/            # Конфигурация API слоя
├── backend-user-service/      # Бизнес-логика
│   ├── service/             # Основные сервисы
│   │   ├── AuthService      # Аутентификация и JWT
│   │   ├── RecoveryService  # Восстановление паролей
│   │   └── TelegramLinkService # Связывание Telegram
│   ├── security/            # Безопасность и фильтры
│   ├── scheduler/           # Планировщики задач
│   └── Tokens.java          # JWT токены модель
└── backend-user-db/           # Слой данных
    ├── entity/              # JPA Entity классы
    ├── repository/          # Spring Data JPA репозитории
    └── migration/           # Liquibase миграции БД
```

### Основные компоненты

#### 🔐 Система аутентификации
- JWT access tokens (15 минут) + refresh tokens (30 дней)
- Ротация refresh tokens для повышенной безопасности
- HTTP-only cookies для защиты от XSS
- Автоматическая очистка просроченных сессий

#### 👥 Управление пользователями
- Трехуровневая ролевая модель: USER, ORGANIZER, ADMIN
- Административная панель для управления ролями
- Защита от понижения последнего администратора
- Полный аудит всех изменений ролей

#### 🔄 Восстановление паролей
- Генерация одноразовых кодов восстановления
- Временные коды с истечением срока действия
- Email уведомления о восстановлении
- Защита от brute force атак

#### 📱 Telegram интеграция
- Связывание аккаунтов через коды
- Верификация Telegram профилей
- Deep-link коды для привязки
- Управление связанными аккаунтами

#### 👤 Профили пользователей
- Персональная информация пользователей
- Контактные данные (телефон, email)
- Telegram профили с верификацией
- История изменений профиля

## Доменная модель

### Основные сущности

#### UserEntity - Основная сущность пользователя
- **id** - UUID первичный ключ
- **username** - Уникальное имя пользователя
- **passwordHash** - Хеш пароля (bcrypt)
- **role** - Роль пользователя (USER, ORGANIZER, ADMIN)
- **active** - Статус активности аккаунта
- **createdAt** - Время создания аккаунта

#### ProfileEntity - Профиль пользователя
- **userId** - Ссылка на пользователя
- **phone** - Номер телефона
- **telegram** - Telegram username
- **isTelegramVerified** - Статус верификации Telegram
- **firstName/lastName** - Имя и фамилия
- **avatar** - Ссылка на аватар

#### RefreshSessionEntity - Сессии refresh токенов
- **jti** - JWT ID (уникальный идентификатор)
- **userId** - Владелец сессии
- **issuedAt** - Время выдачи
- **expiresAt** - Время истечения
- **revokedAt** - Время отзыва (NULL если активна)

#### RecoveryCodeEntity - Коды восстановления
- **userId** - Пользователь для восстановления
- **code** - Одноразовый код
- **type** - Тип восстановления (PASSWORD_RESET)
- **expiresAt** - Время истечения кода
- **usedAt** - Время использования

#### AuditLogEntity - Аудит операций
- **actorUserId** - Кто выполнил операцию
- **action** - Тип действия
- **targetType** - Тип объекта
- **targetId** - ID объекта
- **payload** - JSON данные операции

### Ролевая модель

#### USER (Пользователь)
- Базовая роль для всех зарегистрированных пользователей
- Доступ к собственному профилю
- Участие в событиях и бронирования

#### ORGANIZER (Организатор)
- Создание и управление событиями
- Модерация участников событий
- Доступ к аналитике собственных событий

#### ADMIN (Администратор)
- Полный доступ ко всем функциям системы
- Управление ролями пользователей
- Административная панель
- Доступ к аудиту и метрикам

### Бизнес-правила

#### Защита последнего администратора
Система предотвращает понижение роли последнего ADMIN пользователя:
```java
if (isLastAdmin(userId) && !newRole.equals("ADMIN")) {
    throw new BusinessLogicException("cannot demote last admin");
}
```

#### Ротация refresh токенов
При каждом обновлении access токена старый refresh токен отзывается:
```java
public Tokens refresh(UUID userId, String oldJti) {
    revokeRefresh(oldJti);  // Отзыв старого
    return issueNewTokens(userId);  // Выдача новых
}
```

#### Ограничения времени жизни
- **Access token**: 15 минут (для минимизации рисков)
- **Refresh token**: 30 дней (для удобства пользователей)
- **Recovery code**: 24 часа (для срочности восстановления)

## API Endpoints

### Модели ответов (общее)

- SimpleSuccessResponse:
```json
{ "success": true, "message": "..." }
```

- ProfileResponse:
```json
{
  "id": "<uuid>",
  "username": "john_doe",
  "role": "USER",
  "active": true,
  "profile": {
    "phone": "+1-234-567-890",
    "telegram": "@john",
    "isTelegramVerified": true
  }
}
```

- AdminUserListResponse:
```json
{
  "total": 123,
  "items": [
    { "id":"<uuid>", "username":"john", "role":"USER", "active":true, "createdAt":"2025-02-16T10:00:00Z" }
  ]
}
```

- RecoveryOptionsResponse:
```json
{ "telegram": true, "backupCode": false }
```

- TelegramLinkInitResponse:
```json
{ "code": "ABC123", "deeplink": "https://t.me/aqstream_bot?start=ABC123" }
```

### Аутентификация

#### `POST /api/v1/auth/register`
Регистрация нового пользователя

**Request:**
```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```

**Response:** `200 OK` + HTTP-only cookies, body:
```json
{ "success": true, "message": "registered" }
```

#### `POST /api/v1/auth/login`
Вход в систему

**Request:**
```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```

**Response:** `200 OK` + HTTP-only cookies, body:
```json
{ "success": true, "message": "logged in" }
```
- `access` cookie (15 минут)
- `refresh` cookie (30 дней)

#### `POST /api/v1/auth/logout`
Выход из системы с отзывом сессии

**Response:** `200 OK` + очистка cookies, body:
```json
{ "success": true, "message": "logged out" }
```

#### `POST /api/v1/auth/refresh`
Обновление access токена

**Request:** refresh cookie
**Response:** `200 OK` + новые cookies

#### `POST /api/v1/auth/revoke-all`
Отзыв всех активных сессий пользователя

**Response:**
```json
{
  "revokedCount": 3,
  "message": "All sessions revoked successfully"
}
```

### Административное управление

#### `GET /api/v1/admin/users`
Получение списка пользователей (только ADMIN)

**Параметры:**
- `page` (int) - номер страницы
- `size` (int) - размер страницы
- `q` (string) - поиск по username
- `role` (string) - фильтр по роли

**Response:**
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
    }
  ]
}
```

#### `POST /api/v1/admin/users/{id}/role?role=ORGANIZER`
Изменение роли пользователя (только ADMIN)

**Response:**
```json
{
  "success": true
}
```

### Восстановление паролей

#### `POST /api/v1/recovery/request`
Запрос кода восстановления пароля

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com"
}
```

#### `POST /api/v1/recovery/reset`
Сброс пароля по коду

**Request:**
```json
{
  "code": "ABC12345",
  "newPassword": "new_secure_password123"
}
```

### Telegram интеграция

#### `POST /api/v1/telegram/generate-link`
Генерация кода для связывания Telegram

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "linkCode": "ABC123DEF456",
  "telegramUrl": "https://t.me/aquastream_bot?start=ABC123DEF456",
  "expiresAt": "2024-08-20T14:30:00Z"
}
```

#### `POST /api/v1/telegram/verify`
Верификация связывания с Telegram

**Request:**
```json
{
  "linkCode": "ABC123DEF456",
  "telegramUserId": "123456789",
  "telegramUsername": "john_doe_tg"
}
```

## Использование

### Подключение

```gradle
dependencies {
    implementation project(':backend-user:backend-user-api')
    implementation project(':backend-user:backend-user-service')  
    implementation project(':backend-user:backend-user-db')
}
```

### Конфигурация

```yaml
server:
  port: 8101

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
    username: aquastream_user
    password: ${DB_PASSWORD}
  
  liquibase:
    change-log: classpath:migration/liquibase/master.xml
    default-schema: user
    
  security:
    user:
      password: ${ADMIN_PASSWORD:admin}

app:
  jwt:
    secret: ${JWT_SECRET:dev-secret-change-me}
    accessTtlSeconds: 900       # 15 минут
    refreshTtlSeconds: 2592000  # 30 дней
    
  scheduler:
    refresh-cleanup:
      enabled: true  # Автоматическая очистка сессий
      
  logging:
    maskPII: true  # Маскирование персональных данных в логах
```

### Примеры использования

#### Регистрация и вход

```java
@Autowired
private AuthService authService;

// Регистрация
UserEntity user = authService.register("john_doe", "password123");

// Аутентификация
Tokens tokens = authService.login("john_doe", "password123");
String accessToken = tokens.access();
String refreshJti = tokens.refreshJti();
```

#### Обновление токенов

```java
// Проверка refresh токена
UUID userId = authService.validateRefreshAndGetUser(refreshJti);

// Ротация токенов
Tokens newTokens = authService.refresh(userId, oldRefreshJti);
```

#### Административные операции

```java
@PreAuthorize("hasRole('ADMIN')")
public void changeUserRole(UUID userId, String newRole) {
    // Проверка последнего админа
    userService.validateRoleChange(userId, newRole);
    
    // Изменение роли
    userService.updateUserRole(userId, newRole);
    
    // Аудит
    auditService.logRoleChange(actorId, userId, newRole);
}
```

## База данных

### Схема: user

#### Основные таблицы
- **users** - Пользователи системы
- **profiles** - Профили пользователей
- **refresh_sessions** - Активные сессии
- **recovery_codes** - Коды восстановления
- **audit_log** - Аудит операций

#### Индексы для производительности
- **users**: по username (уникальный), роли
- **refresh_sessions**: по пользователю и времени истечения
- **recovery_codes**: по коду и времени истечения
- **audit_log**: по актору, типу действия и времени

#### Ограничения целостности
- Уникальность username
- Каскадное удаление связанных данных
- Проверка валидности ролей
- Ограничения времени жизни токенов

### Миграции

#### 0001_create_tables.sql
```sql
-- Создание основных таблиц
CREATE TABLE user.users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user.refresh_sessions (
    jti VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user.users(id),
    issued_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);
```

#### 0002_indexes_constraints.sql
```sql
-- Создание индексов и ограничений
CREATE INDEX idx_users_role ON user.users(role);
CREATE INDEX idx_refresh_sessions_user_expires 
ON user.refresh_sessions(user_id, expires_at);
```

#### 0003_audit_log.sql
```sql
-- Аудит операций
CREATE TABLE user.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES user.users(id),
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Система Refresh Tokens

### Архитектура безопасности

#### Ротация токенов
При каждом обновлении access токена старый refresh токен отзывается и выдается новый:

```java
public Tokens refresh(UUID userId, String oldJti) {
    revokeRefresh(oldJti);  // Отзыв старого токена
    UserEntity user = userRepository.findById(userId).orElseThrow();
    String newAccess = issueAccessToken(user, accessTtlSeconds);
    RefreshSessionEntity newRefresh = issueRefreshSession(userId);
    return new Tokens(newAccess, newRefresh.getJti());
}
```

#### Управление сессиями
- **Отзыв всех сессий**: При смене пароля или подозрительной активности
- **Автоматическая очистка**: Планировщик удаляет просроченные сессии каждый час
- **Аудит сессий**: Логирование всех операций с токенами

### Жизненный цикл токенов

```
1. Вход → Access Token (15мин) + Refresh Token (30 дней)
2. Access истекает → Refresh Token → Новые токены
3. Refresh использован → Старый отозван + Новый выдан
4. Выход → Все токены отозваны
```

### Автоматическая очистка

```java
@Scheduled(fixedRate = 3600000) // Каждый час
public void cleanupExpiredSessions() {
    int cleaned = authService.cleanupExpiredSessions();
    if (cleaned > 0) {
        log.info("Cleaned up {} expired sessions", cleaned);
    }
}
```

## Безопасность

### JWT Токены

#### Access Tokens
- **Время жизни**: 15 минут
- **Подпись**: HMAC-SHA512
- **Содержимое**: userId, role, выдача, истечение
- **Валидация**: Gateway проверяет подпись и срок

#### Refresh Tokens
- **Время жизни**: 30 дней
- **Хранение**: База данных + HTTP-only cookie
- **Ротация**: При каждом использовании
- **Отзыв**: Поддержка массового отзыва

### HTTP Cookies

```java
private Cookie buildJwtCookie(String name, String value, int maxAge) {
    Cookie cookie = new Cookie(name, value);
    cookie.setHttpOnly(true);  // Защита от XSS
    cookie.setSecure(true);    // Только HTTPS
    cookie.setPath("/");       // Доступность для всего сайта
    cookie.setMaxAge(maxAge);  // Время жизни
    return cookie;
}
```

### Защита от атак

- **Brute Force**: Rate limiting на попытки входа
- **Session Fixation**: Ротация токенов при аутентификации
- **XSS**: HTTP-only cookies
- **CSRF**: SameSite cookies + CORS политики
- **Token Theft**: Короткое время жизни access токенов

### Аудит безопасности

Все критические операции логируются:
```java
// Успешная аутентификация
log.info("user.auth.success username={} id={}", masked(username), userId);

// Неудачная попытка входа
log.warn("user.auth.fail username={}", masked(username));

// Изменение роли
log.info("user.role.changed actor={} target={} role={}", actorId, targetId, newRole);

// Отзыв сессий
log.info("user.sessions.revokeAll userId={} count={}", userId, revokedCount);
```

## Мониторинг и метрики

### Ключевые метрики
- Количество активных пользователей
- Время жизни сессий
- Частота использования refresh токенов
- Количество неудачных попыток входа
- Статистика по ролям

### Prometheus метрики
- `user_total` - общее количество пользователей
- `user_sessions_active` - активные сессии
- `user_auth_attempts_total` - попытки аутентификации
- `user_role_changes_total` - изменения ролей

### Алерты
- Высокое количество неудачных попыток входа
- Подозрительная активность с токенами
- Превышение лимитов сессий
- Ошибки в планировщике очистки

## Обработка ошибок

### Стандартные HTTP коды

- **400 Bad Request** - Некорректные данные
- **401 Unauthorized** - Неверные учетные данные
- **403 Forbidden** - Недостаточно прав
- **404 Not Found** - Пользователь не найден
- **409 Conflict** - Пользователь уже существует

### Формат ошибок (RFC 7807)

```json
{
  "type": "https://api.aquastream.org/errors/business-logic-error",
  "title": "Business Logic Error",
  "status": 400,
  "detail": "cannot demote last admin",
  "instance": "/api/v1/admin/users/123/role",
  "timestamp": "2025-08-20T10:30:00Z"
}
```

### Специфические ошибки

#### Последний администратор
```json
{
  "type": "https://api.aquastream.org/errors/last-admin-protection",
  "title": "Last Admin Protection",
  "status": 400,
  "detail": "Cannot demote the last administrator"
}
```

#### Неверный refresh токен
```json
{
  "type": "https://api.aquastream.org/errors/invalid-refresh-token",
  "title": "Invalid Refresh Token",
  "status": 401,
  "detail": "Refresh token is expired or revoked"
}
```

## Тестирование

### Unit тесты

```bash
./gradlew backend-user:backend-user-service:test
```

### Integration тесты

```bash
./gradlew backend-user:backend-user-api:test
```

### Тестовые сценарии

#### Аутентификация
- Успешная регистрация и вход
- Обновление токенов
- Отзыв сессий
- Восстановление пароля

#### Ролевая модель
- Изменение ролей
- Защита последнего админа
- Проверка прав доступа
- Аудит операций

## Производительность

### Оптимизации
- Индексы для частых запросов
- Connection pooling для БД
- Кэширование JWT секретов
- Batch операции для очистки сессий

### Кэширование
- JWT валидация в памяти
- Результаты проверки ролей
- Метаданные пользователей (TTL)

### Масштабирование
- Stateless JWT токены
- Горизонтальное масштабирование
- Shared JWT secret между инстансами
- Балансировка нагрузки

## Развертывание

### Docker

```dockerfile
FROM openjdk:21-jre-slim
COPY backend-user-api/build/libs/*.jar app.jar
EXPOSE 8101
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment переменные

```bash
SPRING_PROFILES_ACTIVE=prod
DB_HOST=postgres
DB_PASSWORD=secure_password
JWT_SECRET=production-jwt-secret-key
ADMIN_PASSWORD=secure_admin_password
PII_MASKING_ENABLED=true
```

### Docker Compose

```yaml
services:
  user:
    image: aquastream/backend-user:vX.Y.Z
    ports:
      - "8101:8101"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=postgres
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
```

## Зависимости

### Основные
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- PostgreSQL 15+
- JWT (jjwt)
- BCrypt password encoder

### Опциональные
- Micrometer (метрики)
- Spring Actuator (health checks)
- TestContainers (тестирование)
- Swagger/OpenAPI (документация)

## Интеграция с другими сервисами

### Gateway интеграция
- Валидация JWT токенов
- Добавление `X-User-Id` header
- Проброс ролей в `X-User-Role`
- CORS и CSRF защита

### Notification интеграция
- Уведомления о смене пароля
- Коды восстановления по email/SMS
- Telegram уведомления о входе
- Алерты о подозрительной активности

### Event интеграция
- Проверка ролей организаторов
- Фильтрация событий по ролям
- Аудит действий пользователей
- Статистика участников

## Roadmap

### Планируемые улучшения
- OAuth2 интеграция (Google, VK, Yandex)
- Двухфакторная аутентификация (2FA)
- Расширенный профиль пользователя
- Система репутации и рейтингов
- LDAP интеграция для корпоративных клиентов
- Расширенная аналитика пользователей
