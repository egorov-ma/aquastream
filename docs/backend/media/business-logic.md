# Media Service — Бизнес-логика

## Обзор

Media Service управляет файлами в MinIO/S3, генерирует presigned URLs для загрузки и доступа.

## Ответственности

- Хранение файлов доменов (payment proofs, логотипы, медиа)
- Контроль доступа (владение/роль)
- Срок жизни ссылок (TTL 15 минут)
- Retention policies

## Потоки

| Поток | Действия |
|-------|----------|
| **Загрузка** | Генерация presigned URL для PUT<br>Валидация MIME/размера<br>Сохранение метаданных (owner_type, owner_id, content_type, size) |
| **Доступ** | Проверка прав → presigned URL (TTL 15 мин) |
| **Удаление** | Retention: payment proofs 90 дней, event images постоянно |

## База данных (схема `media`)

| Поле | Тип | Описание |
|------|-----|----------|
| `owner_type` | String | event, organizer, payment_proof |
| `owner_id` | UUID | Владелец |
| `file_key` | String | Ключ в S3 (по префиксам доменов) |
| `content_type` | String | MIME type |
| `size_bytes` | Long | Размер файла |
| `expires_at` | Timestamp | Retention policy |

## Безопасность

- ✅ Ограничения по размеру и MIME
- ✅ Проверка прав доступа (только владелец или ORGANIZER/ADMIN)
- ✅ Presigned URLs TTL 15 минут

---

См. [API](api.md), [Operations](operations.md), [Payment Service](../payment/business-logic.md).