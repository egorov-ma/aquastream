# Deployment (Frontend)

Статус: as-is

## Профили
- dev: порт 3100/3101, моки включены
- prod: порт 3000, standalone build

## Переменные окружения
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_USE_MOCKS`

## Docker
```bash
docker build -t aquastream/frontend:local .
```
