# Security Utilities

## Обзор

Security utilities в `backend-common`: input validation, password hashing, domain enums, security constants.

## Domain Constants

**Security Headers и MDC Keys**:

| Константа | Значение | Использование |
|-----------|----------|---------------|
| `HEADER_REQUEST_ID` | `X-Request-Id` | Трейсинг запросов |
| `HEADER_USER_ID` | `X-User-Id` | User context от Gateway |
| `HEADER_USER_ROLE` | `X-User-Role` | Role context от Gateway |
| `LOG_CORRELATION_ID` | `correlationId` | MDC key для логов |

## UserRole Enum

| Роль | Описание | Ordinal |
|------|----------|---------|
| `GUEST` | Неавторизованный | 0 |
| `USER` | Обычный пользователь | 1 |
| `ORGANIZER` | Организатор событий | 2 |
| `ADMIN` | Администратор | 3 |

**Использование**:
```java
// Проверка прав
if (role != UserRole.ORGANIZER && role != UserRole.ADMIN) {
    throw new ForbiddenException("Only organizers can create events");
}

// Ordinal comparison (Organizer or higher)
if (userRole.ordinal() >= UserRole.ORGANIZER.ordinal()) { }
```

См. [Authentication](../authentication.md) для детальных прав.

## Input Validation

### Bean Validation

**Ключевые аннотации**:

| Аннотация | Использование |
|-----------|---------------|
| `@NotBlank`, `@NotNull` | Обязательные поля |
| `@Size(min, max)` | Длина строки |
| `@Future`, `@Past` | Даты |
| `@Positive`, `@Max`, `@Min` | Числа |
| `@Email`, `@Pattern` | Форматы |

**Пример**:
```java
public class CreateEventRequest {
    @NotBlank @Size(min = 3, max = 200)
    private String title;

    @NotNull @Future
    private LocalDateTime dateStart;

    @Positive @Max(10000)
    private Integer capacity;
}

// В контроллере
@PostMapping("/api/events")
public EventResponse create(@Valid @RequestBody CreateEventRequest request) { }
```

### SQL Injection Protection

| Подход | Статус | Пример |
|--------|--------|--------|
| **JPA/Hibernate параметризованные запросы** | ✅ Безопасно | `@Query("SELECT e FROM Event e WHERE e.title LIKE %:search%")` |
| **PreparedStatement** | ✅ Безопасно | `stmt.setString(1, userInput)` |
| **String concatenation** | ❌ Опасно | `"SELECT * FROM events WHERE title = '" + userInput + "'"` |

## Secrets Management

### Best Practices

| Правило | Реализация |
|---------|------------|
| **Environment variables** | Критичные секреты через env vars |
| **Git** | ❌ Никогда не коммитить секреты |
| **Examples** | `.env.example` с placeholders |
| **CI/CD** | GitHub Secrets |
| **Rotation** | Каждые 90 дней (JWT, DB passwords) |
| **Environments** | Разные секреты для dev/stage/prod |

**Критичные секреты**:
```bash
JWT_SECRET=<strong-secret-key>
POSTGRES_PASSWORD=<db-password>
REDIS_PASSWORD=<redis-password>
TELEGRAM_BOT_TOKEN=<bot-token>
YOOKASSA_SECRET_KEY=<payment-secret>
```

**Docker Secrets**:
```yaml
services:
  backend-user:
    secrets:
      - jwt_secret
      - db_password

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

## Password Validation

**Regex**:
```java
@Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$",
    message = "Password must be at least 12 characters..."
)
```

**Требования**:
- ✅ Min 12 символов
- ✅ Uppercase (`A-Z`)
- ✅ Lowercase (`a-z`)
- ✅ Digit (`\d`)
- ✅ Special char (`@$!%*?&`)

## Domain Enums

### BookingStatus

| Статус | Описание |
|--------|----------|
| `PENDING` | Ожидает оплаты |
| `CONFIRMED` | Оплачено и подтверждено |
| `COMPLETED` | Событие прошло |
| `EXPIRED` | Истекло время оплаты |
| `CANCELLED` | Отменено пользователем |
| `NO_SHOW` | Не явился на событие |

### PaymentStatus

| Статус | Описание |
|--------|----------|
| `PENDING` | Ожидает оплаты |
| `PROCESSING` | Обрабатывается провайдером |
| `SUCCEEDED` | Успешно оплачено |
| `FAILED` | Ошибка оплаты |
| `REFUNDED` | Возврат средств |

**Использование**: Стандартизация статусов во всех сервисах через `backend-common`.

---

См. [Backend Common](README.md), [Error Handling](error-handling.md), [Rate Limiting](rate-limiting.md), [Authentication](../authentication.md).