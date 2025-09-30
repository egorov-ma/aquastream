# Gateway — операции

Статус: as-is

## Health aggregation
- Админ‑эндпоинт: `GET /api/v1/admin/health` — агрегированный статус сервисов
- При деградации: проверить доступность `/actuator/health` каждого сервиса

## Rate limiting
- Общий: 60/min; для auth: 10/min (см. конфиг в `application.yml`)

## CORS
- Разрешённые origin'ы: `https://aquastream.app`
