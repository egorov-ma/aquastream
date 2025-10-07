# Media API

API для работы с файлами в MinIO/S3.

## Endpoints

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/api/images/upload` | Multipart-загрузка изображения (ресайз, оптимизация) | USER |
| GET | `/api/images/{imageId}` | Получение изображения (параметры ресайза/формата) | По owner |
| DELETE | `/api/images/{imageId}` | Удаление изображения и presigned ссылок | Owner/ADMIN |
| POST | `/api/documents/upload` | Загрузка документов/квитанций | USER |
| GET | `/api/documents/{documentId}` | Presigned URL (TTL 15 минут) | По owner |
| DELETE | `/api/documents/{documentId}` | Удаление документа и метаданных | Owner/ADMIN |

## Ограничения

| Параметр | Значение | Настройка |
|----------|----------|-----------|
| **Max размер** | По умолчанию 25 MB | `MEDIA_UPLOAD_MAX_SIZE_MB` |
| **MIME типы** | Конфигурируемо | `media.limits` в `application.yml` |
| **Presigned TTL** | 15 минут | `MEDIA_PRESIGNED_TTL_MINUTES` |

## Доступ

- ✅ JWT с ролью пользователя/организатора
- ✅ Проверка прав по `owner_type`/`owner_id`
- ✅ Повторная выдача ссылки требует валидации

---

См. [Business Logic](business-logic.md), [Operations](operations.md), [README](README.md).