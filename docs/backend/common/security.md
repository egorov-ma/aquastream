# Security Utilities

## Обзор

`backend-common` предоставляет набор security utilities для защиты API и валидации данных. Включает input validation, password hashing utilities и общие security константы.

## Domain Constants

### Security Headers

```java
public class DomainConstants {
    // HTTP Headers
    public static final String HEADER_REQUEST_ID = "X-Request-Id";
    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USER_ROLE = "X-User-Role";

    // MDC Keys
    public static final String LOG_CORRELATION_ID = "correlationId";
}
```

Используются для:
- Трейсинга запросов между сервисами
- Передачи user context от Gateway к сервисам
- Структурированного логирования

## Роли (UserRole enum)

```java
public enum UserRole {
    GUEST,      // Неавторизованный пользователь
    USER,       // Обычный пользователь
    ORGANIZER,  // Организатор событий
    ADMIN       // Администратор
}
```

**Использование**:

```java
// В DTO
private UserRole role = UserRole.USER;

// Проверка прав
if (role != UserRole.ORGANIZER && role != UserRole.ADMIN) {
    throw new ForbiddenException("Only organizers can create events");
}

// С enum ordinal
if (userRole.ordinal() >= UserRole.ORGANIZER.ordinal()) {
    // Organizer or higher
}
```

См. [Authentication](../authentication.md) для детальных прав каждой роли

## Input Validation

### Bean Validation

```java
public class CreateEventRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200)
    private String title;
    
    @NotNull
    @Future(message = "Event must be in the future")
    private LocalDateTime dateStart;
    
    @Positive
    @Max(10000)
    private Integer capacity;
    
    @Email
    private String contactEmail;
}
```

### SQL Injection Protection

- ✅ JPA/Hibernate параметризованные запросы
- ✅ PreparedStatement для нативных SQL
- ❌ String concatenation в queries

```java
// ✅ Безопасно
@Query("SELECT e FROM Event e WHERE e.title LIKE %:search%")
List<Event> findByTitleContaining(@Param("search") String search);

// ❌ Опасно
String sql = "SELECT * FROM events WHERE title = '" + userInput + "'";
```

## Secrets Management

### Environment Variables

```bash
# Критичные секреты через env
JWT_SECRET=<strong-secret-key>
POSTGRES_PASSWORD=<db-password>
REDIS_PASSWORD=<redis-password>
TELEGRAM_BOT_TOKEN=<bot-token>
YOOKASSA_SECRET_KEY=<payment-secret>
```

### Best Practices

- ✅ Никогда не коммитьте секреты в Git
- ✅ Используйте `.env.example` с placeholder значениями
- ✅ Используйте GitHub Secrets для CI/CD
- ✅ Ротация секретов каждые 90 дней (JWT, DB passwords)
- ✅ Разные секреты для dev/stage/prod

### Секреты в Docker

```yaml
# docker-compose.yml
services:
  backend-user:
    secrets:
      - jwt_secret
      - db_password
      
secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt
```

## Password Validation Regex

Используется для валидации паролей при регистрации и изменении:

```java
@Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$",
    message = "Password must be at least 12 characters with uppercase, lowercase, digit and special char"
)
private String password;
```

**Правила**:
- Минимум 12 символов
- Хотя бы одна заглавная буква (`A-Z`)
- Хотя бы одна строчная буква (`a-z`)
- Хотя бы одна цифра (`\d`)
- Хотя бы один спецсимвол (`@$!%*?&`)

## Статусы (Domain Enums)

### BookingStatus

```java
public enum BookingStatus {
    PENDING,     // Ожидает оплаты
    CONFIRMED,   // Оплачено и подтверждено
    COMPLETED,   // Событие прошло
    EXPIRED,     // Истекло время оплаты
    CANCELLED,   // Отменено пользователем
    NO_SHOW      // Не явился на событие
}
```

### PaymentStatus

```java
public enum PaymentStatus {
    PENDING,      // Ожидает оплаты
    PROCESSING,   // Обрабатывается провайдером
    SUCCEEDED,    // Успешно оплачено
    FAILED,       // Ошибка оплаты
    REFUNDED      // Возврат средств
}
```

Используются в DTO и entity для стандартизации статусов во всех сервисах.

## Best Practices

### Input Validation

- ✅ Используйте Bean Validation аннотации
- ✅ Валидируйте на уровне DTO
- ✅ Используйте `@Valid` в контроллерах
- ❌ Не доверяйте клиентским данным

```java
@PostMapping("/api/events")
public EventResponse create(@Valid @RequestBody CreateEventRequest request) {
    // Bean Validation автоматически проверит request
}
```

### SQL Injection

- ✅ JPA/Hibernate параметризованные запросы
- ✅ PreparedStatement для native SQL
- ❌ НИКОГДА string concatenation в SQL

### Secrets

- ✅ Environment variables для секретов
- ✅ `.env.example` без реальных значений
- ✅ Разные секреты для dev/stage/prod
- ❌ Никогда не коммитьте секреты в Git

## См. также

- [Backend Common](README.md) - обзор модуля
- [Error Handling](error-handling.md) - обработка security exceptions
- [Rate Limiting](rate-limiting.md) - защита от злоупотреблений
- [Authentication](../authentication.md) - JWT и RBAC (общий для backend)
- [Operations: Security Policy](../../operations/policies/security.md) - security политики
