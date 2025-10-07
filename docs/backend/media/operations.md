# Media Service — Operations

## Обзор

**Порт**: 8106
**Зависимости**: MinIO (`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`), схема БД `media`

## Конфигурация

| Параметр | Default | Описание |
|----------|---------|----------|
| `MEDIA_UPLOAD_MAX_SIZE_MB` | 25 | Максимальный размер файла |
| `MEDIA_ALLOWED_MIME` | - | Разрешенные MIME-типы |
| `MEDIA_PRESIGNED_TTL_MINUTES` | 15 | TTL presigned URLs |
| Retention | - | `media.retention.*` в application.yml |

## Запуск

```bash
make up-dev
curl http://localhost:8106/actuator/health

# Проверка MinIO
docker compose exec minio mc ls local/
```

## Мониторинг

| Метрика | Описание |
|---------|----------|
| `media.storage.requests` | Количество операций (Actuator) |
| **Логи** | `docker logs backend-media` - ошибки доступа/MinIO timeouts |
| **Grafana**: Media Storage | Запросы, размер хранилища |

## Типичные операции

| Задача | Команда |
|--------|---------|
| **Проверить метаданные** | `psql media -c "SELECT * FROM files WHERE id='<uuid>'"` |
| **Удалить файл** | `docker compose exec minio mc rm local/<bucket>/<key>` |
| **Повторно выдать ссылку** | `POST /api/documents/{id}` |

## Retention

- **Payment proofs**: автоудаление через 90 дней (cron `RetentionJob`)
- **Event images**: постоянно
- **Проверка**: `psql media -c "SELECT file_key, expires_at FROM files WHERE owner_type='payment_proof'"`

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| **403 при скачивании** | Проверить права доступа (owner), TTL ссылки |
| **SignatureDoesNotMatch** | Синхронизировать часы, проверить секреты MinIO |
| **Large file upload fails** | Увеличить `MEDIA_UPLOAD_MAX_SIZE_MB` и `nginx client_max_body_size` |

---

См. [Business Logic](business-logic.md), [API](api.md), [README](README.md).