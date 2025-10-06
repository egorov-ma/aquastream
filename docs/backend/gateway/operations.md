# Gateway — операции

## Где находится в контурах
- Nginx принимает внешний трафик (80/443) и проксирует в Gateway на `:8080`.
- Все действия по перезапуску: `make restart SERVICE=backend-gateway` (и при необходимости `SERVICE=nginx`).
- Конфиг Nginx: `backend-infra/docker/compose/nginx.conf` — проверяйте, что upstream `backend-gateway:8080` доступен.

## Health aggregation
- Админ‑эндпоинт: `GET /api/v1/admin/health` — агрегированный статус сервисов
- При деградации: проверить доступность `/actuator/health` каждого сервиса

## Rate limiting
- Общий: 60/min; для auth: 10/min (см. конфиг в `application.yml`)

## CORS
- Разрешённые origin'ы: `https://aquastream.app`
- Edge-правила (широкие) задаются в `nginx.conf`, прикладные — в `gateway` `application.yml`
