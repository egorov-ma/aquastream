# Docker Compose (dev|stage|prod)

Файл: `backend-infra/docker/compose/docker-compose.yml`

## Профили
- `dev`: локальная разработка (можно переопределять переменные в `.env`).
- `stage`: стенд интеграционного тестирования по умолчанию.
- `prod`: продовый профиль (требует реальных секретов).

## Сети
- `aquastream-net` — единая сеть для всех контейнеров (фиксированное имя для удобства вспомогательных скриптов).

## Volume
- `pgdata` — данные PostgreSQL.
- `redisdata` — данные Redis (AOF).
- `miniodata` — данные MinIO.

## Порты
- Postgres: `${POSTGRES_PORT:-5432}` → 5432
- Redis: `${REDIS_PORT:-6379}` → 6379
- MinIO API / Console: `${MINIO_PORT:-9000}` / `${MINIO_CONSOLE_PORT:-9001}`
- Gateway: 8080
- User/Event/Crew/Payment/Notification/Media: 8101..8106

## Секреты и переменные
Используются переменные из `.env` (рекомендуется подключать через `env_file`):
- БД: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`.
- Redis: `REDIS_PASSWORD`, `REDIS_PORT`.
- MinIO/S3: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.
- Безопасность: `JWT_SECRET` (HS512 по спецификации).
- Интеграции: `TELEGRAM_BOT_TOKEN`, `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`.
- Профили Spring: `SPRING_PROFILES_ACTIVE`.

### MinIO bootstrap
Автосоздание бакетов выполняет сервис `minio-setup` (MinIO client `mc`, образ `bitnami/minio-client`).
- Список бакетов: `MINIO_BOOTSTRAP_BUCKETS` (через запятую или пробел, по умолчанию `aquastream-media`).
- Доступ: `MINIO_BUCKET_PUBLIC=true` включает анонимное скачивание (удобно для dev).
Переменные добавлены в `.env.*.example`.

## Инициализация схем БД
При первом старте Postgres применяется `init-schemas.sql` для создания схем: `user`, `event`, `crew`, `payment`, `notification`, `media`.

## Быстрый старт
```bash
cd backend-infra/docker/compose
cp .env.dev.example .env.dev
cp .env.stage.example .env.stage

# Dev окружение (base + override.dev)
make -C ../../make up-dev

# Stage окружение (base + override.stage)
make -C ../../make up-stage

# Проверка здоровья (пример):
curl -s http://localhost:8080/actuator/health | jq
```

### Оверлеи
- `docker-compose.override.dev.yml`: публикует порты Postgres/Redis/MinIO и всех приложений для локальной разработки.
- `docker-compose.override.stage.yml`: публикует только порт `gateway` (8080); БД/Redis/MinIO и остальные сервисы без внешних портов.

Базовый `docker-compose.yml` не публикует порты, содержит политики перезапуска, ротацию логов, ресурсные лимиты и healthcheck’и.

## Образы
- Для каждого сервиса есть Dockerfile: `backend-infra/docker/images/Dockerfile.<service>`.
- В dev окружении (через `make up-dev`) образы собираются локально и используются Compose‑ом.
