# Обработка ошибок

## Обзор

Централизованная обработка ошибок через `GlobalExceptionHandler` в формате **RFC 7807 Problem Details**. Все backend сервисы автоматически получают эту функциональность через `backend-common`.

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

**Headers**:
```http
Content-Type: application/problem+json
```

### Поля ProblemDetails

| Поле | Тип | Описание |
|------|-----|----------|
| `type` | URI | Тип проблемы (https://aquastream.app/problems/{status}) |
| `title` | String | Краткое описание (обычно HTTP status reason) |
| `status` | Integer | HTTP status code |
| `detail` | String | Детальное описание |
| `instance` | URI | URI запроса который вызвал ошибку |
| `code` | String | Машиночитаемый код ошибки |
| `correlationId` | String | ID для трейсинга (из X-Request-Id или MDC) |
| `errors` | Array | Массив валидационных ошибок (опционально) |

## Реализация (backend-common)

### GlobalExceptionHandler

Обрабатывает все исключения и преобразует в Problem Details:

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    // ApiException → Problem Details
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ProblemDetails> handleApiException(ApiException ex) {
        // status, code, detail из исключения
    }
    
    // Bean Validation → 400 + errors[]
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetails> handleValidation(
        MethodArgumentNotValidException ex
    ) {
        // Собрать field errors в errors[]
    }
    
    // Security → 401 Unauthorized
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetails> handleAuth(...) {
        // code: "unauthorized"
    }
    
    // Security → 403 Forbidden
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetails> handleAccessDenied(...) {
        // code: "access.denied"
    }
    
    // ResponseStatusException → соответствующий status
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetails> handleResponseStatus(...) {
        // Маппинг status → code
    }
    
    // Любые другие → 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetails> handleOther(...) {
        // code: "internal.error"
        // detail: "Unexpected error" (без stacktrace!)
    }
}
```

### Автоконфигурация

Включается автоматически для всех сервисов:

```java
@AutoConfiguration
public class CommonErrorHandlingAutoConfiguration {
    @Bean
    public GlobalExceptionHandler globalExceptionHandler() {
        return new GlobalExceptionHandler();
    }
}
```

## Маппинг исключений → HTTP Status

| Исключение | Status | Code | Title |
|------------|--------|------|-------|
| `ApiException` | Из ex.status | Из ex.code | Status reason |
| `MethodArgumentNotValidException` | 400 | `validation.failed` | Validation Failed |
| `AuthenticationException` | 401 | `unauthorized` | Unauthorized |
| `AccessDeniedException` | 403 | `access.denied` | Forbidden |
| `ResponseStatusException(404)` | 404 | `not.found` | Not Found |
| `ResponseStatusException(409)` | 409 | `conflict` | Conflict |
| `ResponseStatusException(422)` | 422 | `unprocessable` | Unprocessable Entity |
| `ResponseStatusException(429)` | 429 | `rate.limit-exceeded` | Too Many Requests |
| `Exception` (fallback) | 500 | `internal.error` | Internal Server Error |

### Rate Limit Special Handling

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/problem+json

{
  "type": "https://aquastream.app/problems/429",
  "title": "Too Many Requests",
  "status": 429,
  "code": "rate.limit-exceeded",
  "detail": "Rate limit exceeded",
  "correlationId": "..."
}
```

**Обязательно**: заголовок `Retry-After` для 429 responses

## ApiException

### Использование в сервисах

```java
// Создание кастомного исключения
throw new ApiException(404, "event.not-found", "Event not found");

// С деталями
throw new ApiException(
    409, 
    "booking.duplicate", 
    "Active booking already exists for this event"
);

// Rate limit
throw new ApiException(429, "rate.limit-exceeded", "Too many requests");
```

### Конструктор

```java
public ApiException(int status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
}
```

## Correlation ID

### Автоматическое добавление

`CorrelationIdFilter` автоматически:
1. Читает `X-Request-Id` заголовок
2. Если отсутствует - генерирует новый (через `Ids.newIdempotencyKey()`)
3. Добавляет в MDC как `correlationId`
4. Propagates в логи и error responses

### В логах

```
[correlationId=xR3k9mP2nQ] POST /api/bookings - 201 Created
[correlationId=xR3k9mP2nQ] Booking created: id=550e8400...
```

### В ответах

Автоматически добавляется в ProblemDetails:

```json
{
  ...
  "correlationId": "xR3k9mP2nQ"
}
```

## Validation Errors

### Bean Validation

```java
// DTO с аннотациями
public class CreateBookingRequest {
    @NotNull(message = "Event ID is required")
    private UUID eventId;
    
    @Positive
    @Max(10)
    private Integer quantity;
}
```

### Error Response

```json
{
  "type": "https://aquastream.app/problems/400",
  "title": "Validation Failed",
  "status": 400,
  "code": "validation.failed",
  "instance": "/api/bookings",
  "correlationId": "xR3k9mP2nQ",
  "errors": [
    {
      "field": "eventId",
      "message": "Event ID is required",
      "code": "NotNull"
    },
    {
      "field": "quantity",
      "message": "must be less than or equal to 10",
      "code": "Max"
    }
  ]
}
```

## Error Codes

### Стандартные коды

| Code | Status | Описание |
|------|--------|----------|
| `bad.request` | 400 | Некорректный запрос |
| `unauthorized` | 401 | Не авторизован |
| `access.denied` | 403 | Доступ запрещен |
| `not.found` | 404 | Ресурс не найден |
| `conflict` | 409 | Конфликт (duplicate, etc) |
| `validation.failed` | 400 | Ошибка валидации |
| `unprocessable` | 422 | Бизнес-правило нарушено |
| `rate.limit-exceeded` | 429 | Превышен лимит запросов |
| `internal.error` | 500 | Внутренняя ошибка |

### Доменные коды

Сервисы могут определять свои:
- `event.not-found` - событие не найдено
- `booking.duplicate` - дубликат брони
- `booking.expired` - бронь истекла
- `payment.failed` - оплата не прошла
- `profile.incomplete` - профиль не заполнен

## Best Practices

### Не раскрывайте внутренние детали

```java
// ✅ Хорошо
throw new ApiException(500, "internal.error", "Unexpected error");

// ❌ Плохо - stacktrace в response
throw new Exception("NullPointerException at UserService.java:123");
```

### Используйте понятные сообщения

```java
// ✅ Хорошо
"Phone or Telegram must be filled in profile"

// ❌ Плохо
"Validation error: field phone null"
```

### Всегда включайте correlationId

- Автоматически через CorrelationIdFilter
- Можно передать из клиента через `X-Request-Id`
- Используется для отладки и трейсинга

### Используйте правильные HTTP статусы

- **400**: Bad Request (некорректный синтаксис)
- **401**: Unauthorized (нет/невалидный токен)
- **403**: Forbidden (нет прав)
- **404**: Not Found (ресурс не существует)
- **409**: Conflict (duplicate, concurrency)
- **422**: Unprocessable (бизнес-правило)
- **429**: Too Many Requests
- **500**: Internal Server Error

## Автоматическая конфигурация

Все сервисы автоматически получают:
- ✅ GlobalExceptionHandler (@ControllerAdvice)
- ✅ ProblemDetails serialization
- ✅ CorrelationId в MDC
- ✅ RFC 7807 Content-Type: `application/problem+json`

Никаких дополнительных настроек не требуется!

## См. также

- [Backend Common](README.md) - обзор модуля
- [Security](security.md) - обработка security exceptions
- [API Design](../../development/style-guides.md) - API guidelines
