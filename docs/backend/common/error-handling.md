# Обработка ошибок

## Обзор

Централизованная обработка ошибок через `GlobalExceptionHandler` в формате **RFC 7807 Problem Details**. Автоматически доступно всем сервисам через `backend-common`.

**Автоконфигурация**: `CommonErrorHandlingAutoConfiguration` регистрирует handler автоматически.

## RFC 7807 Problem Details

### Формат ответа

```json
{
  "type": "https://aquastream.app/problems/400",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Profile must be completed",
  "instance": "/api/bookings",
  "code": "validation.failed",
  "correlationId": "xR3k9mP2nQ",
  "errors": [
    {
      "field": "phone",
      "message": "Phone or Telegram required",
      "code": "required"
    }
  ]
}
```

**Headers**: `Content-Type: application/problem+json`

### Поля

| Поле | Описание |
|------|----------|
| `type` | URI типа проблемы: `https://aquastream.app/problems/{status}` |
| `title` | Краткое описание (HTTP status reason) |
| `status` | HTTP status code |
| `detail` | Детальное описание |
| `instance` | URI запроса |
| `code` | Машиночитаемый код (например, `validation.failed`) |
| `correlationId` | ID для трейсинга (из `X-Request-Id` или генерируется) |
| `errors` | Массив валидационных ошибок (опционально) |

## Маппинг исключений

| Исключение | Status | Code | Особенности |
|------------|--------|------|-------------|
| `ApiException` | Из ex.status | Из ex.code | Кастомные ошибки |
| `MethodArgumentNotValidException` | 400 | `validation.failed` | Bean Validation → `errors[]` |
| `AuthenticationException` | 401 | `unauthorized` | Security |
| `AccessDeniedException` | 403 | `access.denied` | Security |
| `ResponseStatusException(404)` | 404 | `not.found` | Ресурс не найден |
| `ResponseStatusException(409)` | 409 | `conflict` | Дубликаты |
| `ResponseStatusException(422)` | 422 | `unprocessable` | Бизнес-правила |
| `ResponseStatusException(429)` | 429 | `rate.limit-exceeded` | + `Retry-After` header |
| `Exception` (fallback) | 500 | `internal.error` | Без stacktrace |

## ApiException

**Использование**:
```java
// Базовое
throw new ApiException(404, "event.not-found", "Event not found");

// С деталями
throw new ApiException(409, "booking.duplicate",
    "Active booking already exists for this event");

// Rate limit
throw new ApiException(429, "rate.limit-exceeded", "Too many requests");
```

**Конструктор**:
```java
public ApiException(int status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
}
```

## Correlation ID

**Автоматически**:
1. `CorrelationIdFilter` читает `X-Request-Id` header или генерирует новый
2. Добавляет в MDC как `correlationId`
3. Propagates в логи и error responses

**Логи**:
```
[correlationId=xR3k9mP2nQ] POST /api/bookings - 201 Created
[correlationId=xR3k9mP2nQ] Booking created: id=550e8400...
```

**Ответы**: Автоматически в ProblemDetails.

**Отладка**:
```bash
# Найти все логи запроса
grep "xR3k9mP2nQ" logs/*.log
```

## Validation Errors

**DTO с аннотациями**:
```java
public class CreateBookingRequest {
    @NotNull(message = "Event ID is required")
    private UUID eventId;

    @Positive @Max(10)
    private Integer quantity;
}
```

**Response**:
```json
{
  "type": "https://aquastream.app/problems/400",
  "status": 400,
  "code": "validation.failed",
  "errors": [
    {
      "field": "eventId",
      "message": "Event ID is required",
      "code": "NotNull"
    }
  ]
}
```

## Error Codes

### Стандартные

| Code | Status | Описание |
|------|--------|----------|
| `bad.request` | 400 | Некорректный синтаксис запроса |
| `unauthorized` | 401 | Не авторизован |
| `access.denied` | 403 | Нет прав |
| `not.found` | 404 | Ресурс не найден |
| `conflict` | 409 | Конфликт (duplicate, concurrency) |
| `validation.failed` | 400 | Ошибка валидации |
| `unprocessable` | 422 | Нарушение бизнес-правила |
| `rate.limit-exceeded` | 429 | Превышен лимит (+ `Retry-After` header) |
| `internal.error` | 500 | Внутренняя ошибка |

### Доменные

Сервисы определяют свои:
- `event.not-found`, `event.full`
- `booking.duplicate`, `booking.expired`
- `payment.failed`
- `profile.incomplete`

## Best Practices

| Правило | ✅ Хорошо | ❌ Плохо |
|---------|----------|---------|
| **Сообщения** | "Phone or Telegram must be filled" | "Validation error: field phone null" |
| **500 errors** | "Unexpected error" | Stacktrace в response |
| **Correlation ID** | Автоматически через CorrelationIdFilter | Ручное добавление |
| **HTTP статусы** | 400 (синтаксис), 422 (бизнес-правило) | 400 для всего |
| **429 Rate Limit** | Обязательно `Retry-After` header | Без header |

### HTTP статусы

- **400**: Bad Request (некорректный синтаксис)
- **401**: Unauthorized (нет/невалидный токен)
- **403**: Forbidden (нет прав)
- **404**: Not Found (ресурс не существует)
- **409**: Conflict (duplicate, concurrency)
- **422**: Unprocessable (бизнес-правило нарушено)
- **429**: Too Many Requests
- **500**: Internal Server Error

## GlobalExceptionHandler

**Ключевые методы**:

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ProblemDetails> handleApiException(ApiException ex) {
        // status, code, detail из исключения
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetails> handleValidation(...) {
        // Собирает field errors в errors[]
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetails> handleOther(...) {
        // Fallback → 500 без stacktrace
    }
}
```

**Автоматическая регистрация**: Все сервисы получают handler, ProblemDetails serialization, RFC 7807 Content-Type.

---

См. [Backend Common](README.md), [Security](security.md), [Web Utilities](web-utilities.md), [API Design](../../development/style-guides.md).