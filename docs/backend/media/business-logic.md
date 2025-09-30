# Media Service — Бизнес-логика

## Обзор

Media Service управляет файлами в MinIO/S3, генерирует presigned URLs.

## Ответственности
- Хранение и выдача файлов доменов (proofs, логотипы, медиа)
- Контроль доступа (владение/роль), срок жизни ссылок

## Потоки
1. Загрузка
   - Генерация `presigned URL` для PUT, валидация типа/размера
   - Сохранение метаданных (owner_type/owner_id, content_type, size)
2. Доступ
   - Проверка прав доступа → генерация `presigned URL` (TTL 15 минут)
3. Удаление/Retention
   - Плановый GC/Retention (например, proofs — 90 дней)

## Политики и безопасность
- Ограничения по размеру и MIME
- Генерация ключей `file_key` по префиксам доменов
- Антивирус/сканирование по возможности

## База данных (схема `media`)

```sql
files (
    id,
    owner_type,        -- event | organizer | payment_proof
    owner_id,          -- UUID владельца
    file_key,          -- Ключ в S3
    content_type,      -- MIME type
    size_bytes,
    storage_url,       -- Полный URL
    expires_at         -- Retention policy
)
```

## Presigned URLs

**TTL**: 15 минут
**Проверка прав**: только владелец или organizer/admin

## Retention

- Payment proofs: 90 дней
- Event images: постоянно
- Organizer logos: постоянно

## См. также

- [Media API](api.md)
- [Payment Service](../payment/business-logic.md) - payment proofs
