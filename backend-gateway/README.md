# Backend Gateway

Входная точка API на Spring Cloud Gateway.

## Роутинг
- `/api/v1/auth/**`, `/api/v1/profile/**` → `http://localhost:8101`
- `/api/v1/events/**`, `/api/v1/bookings/**`, `/api/v1/organizers/**` → `http://localhost:8102`
- `/api/v1/crews/**` → `http://localhost:8103`
- `/api/v1/payments/**`, `/api/v1/webhooks/**` → `http://localhost:8104`
- `/api/v1/notifications/**` → `http://localhost:8105`
- `/api/v1/media/**` → `http://localhost:8106`

См. `src/main/resources/application.yml` → `spring.cloud.gateway.routes`.

## Безопасные заголовки и CORS
- Заголовки: `X-Content-Type-Options=nosniff`, `X-Frame-Options=DENY`, `Strict-Transport-Security=max-age=31536000`.
- CORS whitelist: `gateway.cors.allowed-origins`.

## Лимитирование (Bucket4j)
- Конфиг в `application.yml` → `gateway.rate-limit.*`:
  - `default-per-minute` = 60
  - `login-per-minute` = 10
  - `recovery-per-minute` = 5
- При превышении — `429` с Problem Details (`application/problem+json`) и заголовком `Retry-After`.

## Админ-эндпойнты
- `GET /api/v1/admin/health` — агрегирует `/actuator/health` сервисов (таймаут 2s). Список сервисов: `gateway.admin.services`.
- `GET /api/v1/admin/metrics/series?service=X&metric=Y&range=h24` — таймсерии из Redis (`metrics:*`). Диапазоны: `h1|h6|h24|d7`.

## Problem Types (RFC 7807)
Типы/URI, используемые в ответах об ошибках:
- `validation.failed` → `https://aquastream.app/problems/validation-failed`
- `unauthorized` → `https://aquastream.app/problems/401`
- `access.denied` → `https://aquastream.app/problems/403`
- `not.found` → `https://aquastream.app/problems/404`
- `conflict` → `https://aquastream.app/problems/409`
- `unprocessable` → `https://aquastream.app/problems/422`
- `rate.limit-exceeded` → `https://aquastream.app/problems/429` (доп. заголовок `Retry-After`)
- `internal.error` → `https://aquastream.app/problems/500`

## Запуск
```
./gradlew :backend-gateway:bootRun
```
