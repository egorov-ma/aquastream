# Обработка ошибок

Статус: as-is

## Политика
- Единый формат ответов об ошибках — RFC 7807 (Problem Details)
- Корреляция запросов через `correlationId`
- Валидационные ошибки собираются в массив `errors[]`

## Пример (RFC 7807)
```json
{
  "type": "https://aquastream.app/problems/validation-failed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Profile must be completed",
  "instance": "/api/v1/bookings",
  "correlationId": "req-123456",
  "errors": [
    { "field": "profile.phone", "message": "Phone or Telegram required", "code": "required" }
  ]
}
```

## Маппинг исключений
- `ValidationException` → 400 + заполнение `errors[]`
- `Unauthorized` → 401, `Forbidden` → 403, `NotFound` → 404, `Conflict` → 409
- Бизнес‑ошибки → 422 (`type`: `.../business`)
- Лимиты → 429 (`type`: `.../rate-limit`)

## Рекомендации
- Не раскрывать внутренние детали (stacktrace, SQL)
- Всегда возвращать `correlationId`
- Для idempotency конфликтов — 409 с указанием ключа
