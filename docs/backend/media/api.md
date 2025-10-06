# Media API

Media API предоставляет REST-эндпоинты для работы с изображениями и документами в MinIO.

## Основные операции

- `POST /api/v1/images/upload` — multipart-загрузка изображения с автоматическим ресайзом и оптимизацией.
- `GET /api/v1/images/{imageId}` — получение изображения (поддерживает параметры ресайза/формата).
- `DELETE /api/v1/images/{imageId}` — удаление изображения и отзыв presigned ссылок.
- `POST /api/v1/documents/upload` — загрузка документов/квитанций (используется Payment Service).
- `GET /api/v1/documents/{documentId}` — выдача краткоживущего presigned URL на документ.
- `DELETE /api/v1/documents/{documentId}` — удаление документа и метаданных.

## Доступ и ограничения

- Требуется JWT с ролью пользователя/организатора (доступ проверяется по `owner_type/owner_id`).
- Ограничения по размеру и MIME‑типу задаются в `application.yml` (`media.limits`).
- Presigned ссылки имеют TTL 15 минут; повторная выдача требует повторной валидации прав.

## Документация API
- Полная спецификация: [`../../api/redoc/root/backend-media-api.html`](../../api/redoc/root/backend-media-api.html)
