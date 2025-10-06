# Media — операции

## Обзор

Media Service работает вместе с MinIO. Любые изменения конфигурации выполняются через переменные `MEDIA_*` и настройки MinIO.

**Порт сервиса**: 8106  
**Основные зависимости**: MinIO (`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`), PostgreSQL схема `media`.

## Запуск и проверка

```bash
# Локальный запуск вместе с MinIO
make up-dev

# Проверка health
curl http://localhost:8106/actuator/health

# Проверка связи с MinIO
docker compose exec minio mc ls local/
```

## Конфигурация

- `MEDIA_UPLOAD_MAX_SIZE_MB` — предельный размер файлов (по умолчанию 25 MB).
- `MEDIA_ALLOWED_MIME` — список разрешённых MIME-типа.
- `MEDIA_PRESIGNED_TTL_MINUTES` — TTL presigned URL (стандартно 15 минут).
- Retention настраивается через `media.retention.*` в `application.yml` (proofs 90 дней, event images — без удаления).

## Мониторинг

- Actuator `/actuator/metrics/media.storage.requests` — количество операций.
- Логи: `make logs SERVICE=backend-media` — ошибки доступа или MinIO timeouts.
- Grafana dashboard *Media Storage* (запросы, размер хранилища).

## Типичные операции

| Задача | Команда |
|--------|---------|
| Проверить метаданные файла | `psql media -c "select * from files where id='<uuid>'"` |
| Удалить проблемный файл | `docker compose exec minio mc rm local/<bucket>/<key>` |
| Повторно выдать ссылку | `POST /api/v1/documents/{id}` (см. API) |

## Retention

- Payment proofs: автоудаление по крону (`media.retention.payment-proofs.cron`).
- Отчёт в логах после каждого прохода (`RetentionJob`).
- Проверка: `psql media -c "select file_key, expires_at from files where owner_type='payment_proof'"`.

## Troubleshooting

- **403 при скачивании** — проверить права доступа (owner), TTL ссылки.
- **SignatureDoesNotMatch** — убедиться, что часы синхронизированы и секреты MinIO актуальны.
- **Large file uploads fail** — увеличить `MEDIA_UPLOAD_MAX_SIZE_MB` и параметры `nginx.conf` (`client_max_body_size`).

## См. также

- [Media Service Overview](README.md)
- [Media API](api.md)
- [Deployment Guide](../../operations/deployment.md)
