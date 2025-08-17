# backend-media

Сервис управления медиафайлами (изображения, документы, видео) с учетом владельцев, политик доступа и автоматической очисткой.

## Схема базы данных

### Схема: `media`

#### Таблица: `files`
Центральный реестр всех медиафайлов в системе

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| key | VARCHAR(255) | Уникальный ключ/путь файла в системе хранения |
| owner_type | VARCHAR(50) | Тип владельца файла |
| owner_id | UUID | ID владельца файла |
| checksum | VARCHAR(64) | SHA-256 хеш для проверки целостности |
| content_type | VARCHAR(255) | MIME-тип файла |
| size_bytes | BIGINT | Размер файла в байтах |
| original_filename | VARCHAR(500) | Оригинальное имя файла |
| upload_session_id | UUID | ID сессии загрузки (для multipart uploads) |
| status | VARCHAR(20) | Статус обработки файла |
| visibility | VARCHAR(20) | Уровень доступа к файлу |
| created_at | TIMESTAMPTZ | Дата создания |
| updated_at | TIMESTAMPTZ | Дата обновления |
| expires_at | TIMESTAMPTZ | Время истечения (для временных файлов) |
| uploaded_by | UUID | Пользователь, загрузивший файл |
| uploaded_from_ip | INET | IP-адрес загрузчика |

**Ограничения:**
- `key` уникален и соответствует формату пути
- `checksum` валидный SHA-256 хеш
- `content_type` валидный MIME-тип
- `size_bytes >= 0`

#### Таблица: `cleanup_log`
Лог операций автоматической очистки

| Поле | Тип | Описание |
|------|-----|----------|
| id | SERIAL | Первичный ключ |
| cleaned_at | TIMESTAMPTZ | Время выполнения очистки |
| files_deleted | INTEGER | Количество удаленных файлов |

## Типы владельцев файлов

### USER
- Аватары пользователей
- Приложенные к профилю документы
- Личные файлы в чатах

### EVENT  
- Изображения события (обложки, галерея)
- Документы мероприятия (программы, карты)
- Материалы для участников

### ORGANIZER
- Логотипы организаций
- Документы верификации
- Рекламные материалы

### PROFILE
- Фотографии профиля
- Сертификаты и достижения
- Документы подтверждения опыта

### SYSTEM
- Дефолтные изображения
- Шаблоны документов
- Системные ресурсы

## Статусы файлов

### UPLOADING
- Файл в процессе загрузки
- Может быть неполным
- Автоматическая очистка через 24 часа

### UPLOADED
- Загрузка завершена
- Файл доступен для обработки
- Базовые проверки пройдены

### PROCESSING  
- Файл обрабатывается (ресайз, конвертация)
- Временно недоступен
- Автоматическая очистка при сбоях

### READY
- Файл готов к использованию
- Все обработки завершены
- Доступен согласно политике visibility

### DELETED
- Файл помечен к удалению
- Недоступен для новых запросов
- Физическое удаление по расписанию

## Политики доступа (Visibility)

### PRIVATE
- Доступ только владельцу
- Требует аутентификации и авторизации
- По умолчанию для пользовательских файлов

### PUBLIC
- Публичный доступ без аутентификации
- Индексируется поисковиками
- Для общедоступного контента

### UNLISTED
- Доступ по прямой ссылке
- Не индексируется
- Для шаринга без регистрации

## Ключи файлов (Key Format)

### Структура ключей
```
{owner_type}/{owner_id}/{category}/{filename}
```

### Примеры ключей:
```
user/550e8400-e29b-41d4-a716-446655440000/avatar/profile.jpg
event/123e4567-e89b-12d3-a456-426614174000/gallery/photo-001.jpg
organizer/987fcdeb-51d2-4c3a-8b45-123456789abc/logo/brand.png
system/defaults/avatars/user-placeholder.png
```

### Правила именования:
- Только латинские символы, цифры, `/`, `_`, `.`, `-`
- Минимальная длина: 3 символа
- Максимальная длина: 255 символов
- Без двойных слешей и недопустимых символов

## Индексы для производительности

### Основные запросы
- Поиск по ключу: `ix_files_key`
- Поиск по владельцу: `ix_files_owner`
- Проверка целостности: `ix_files_checksum`

### Запросы по статусу и видимости
- Фильтрация по статусу: `ix_files_status`
- Контроль доступа: `ix_files_visibility`

### Временные запросы
- Сортировка по дате: `ix_files_created_at`
- Очистка просроченных: `ix_files_expires_at`

### Составные индексы
- Файлы владельца по статусу: `ix_files_owner_status`
- Публичные файлы: `ix_files_owner_visibility`
- Активные файлы: `ix_files_active`

## Автоматизация и триггеры

### Обновление timestamp
- Автоматическое обновление `updated_at` при изменениях
- Триггер `tr_files_update_updated_at`

### Функция очистки
- `media.cleanup_expired_files()` - удаление просроченных файлов
- Возвращает количество обработанных файлов
- Логирование в `cleanup_log`

### Scheduled задачи (рекомендуется)
```sql
-- Ежедневная очистка в 02:00
SELECT media.cleanup_expired_files();

-- Очистка застрявших загрузок (старше 24 часов)
UPDATE media.files 
SET status = 'DELETED' 
WHERE status = 'UPLOADING' 
  AND created_at < NOW() - INTERVAL '24 hours';
```

## Интеграция с внешними хранилищами

### S3-совместимые хранилища
- Ключ в БД = ключ в S3
- Поддержка multipart uploads
- Automatic cleanup через lifecycle policies

### CDN интеграция
- Public файлы через CDN
- Cache headers на основе `updated_at`
- Purge кеша при изменении статуса

### Backup стратегия
- Регулярный backup БД
- Репликация файлов в другие регионы
- Версионирование критичных файлов

## Мониторинг и метрики

### Ключевые метрики
- Количество файлов по типам владельцев
- Распределение размеров файлов
- Успешность загрузок (по статусам)
- Время обработки файлов

### Алерты
- Большое количество failed uploads
- Превышение квот хранилища
- Длительное время в статусе PROCESSING

### Cleanup статистика
- Количество очищенных файлов
- Частота срабатывания cleanup
- Размер освобожденного места

## Примеры использования

### Загрузка аватара пользователя
```sql
INSERT INTO media.files (
    key, owner_type, owner_id, 
    checksum, content_type, size_bytes,
    original_filename, status, visibility,
    uploaded_by
) VALUES (
    'user/550e8400-e29b-41d4-a716-446655440000/avatar/profile.jpg',
    'user', '550e8400-e29b-41d4-a716-446655440000',
    'sha256hashhere...', 'image/jpeg', 245760,
    'my-photo.jpg', 'READY', 'PRIVATE',
    '550e8400-e29b-41d4-a716-446655440000'
);
```

### Публичная галерея события
```sql
INSERT INTO media.files (
    key, owner_type, owner_id,
    checksum, content_type, size_bytes,
    status, visibility
) VALUES (
    'event/123e4567-e89b-12d3-a456-426614174000/gallery/photo-001.jpg',
    'event', '123e4567-e89b-12d3-a456-426614174000',
    'anotherhash...', 'image/jpeg', 1048576,
    'READY', 'PUBLIC'
);
```

### Временный файл с автоочисткой
```sql
INSERT INTO media.files (
    key, owner_type, owner_id,
    checksum, content_type, size_bytes,
    status, expires_at
) VALUES (
    'system/temp/upload-session-123/document.pdf',
    'system', '00000000-0000-0000-0000-000000000000',
    'temphash...', 'application/pdf', 2097152,
    'READY', NOW() + INTERVAL '1 hour'
);
```

Это обеспечивает надежное и масштабируемое управление медиафайлами с автоматическим контролем доступа и очисткой.

## API Endpoints

### Генерация presigned URLs

#### POST /api/v1/media/presign
Генерация presigned URL для загрузки файла

**Пример запроса:**
```json
{
  "contentType": "image/jpeg",
  "contentLength": 2048576,
  "ownerType": "user",
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "originalFilename": "avatar.jpg",
  "purpose": "avatar",
  "checksum": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
}
```

**Пример ответа:**
```json
{
  "url": "https://minio.example.com/aquastream-media/user/550e8400-e29b-41d4-a716-446655440000/avatar/avatar.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "key": "user/550e8400-e29b-41d4-a716-446655440000/avatar/avatar.jpg",
  "expires": "2024-08-17T15:30:00Z",
  "uploadSessionId": "123e4567-e89b-12d3-a456-426614174000",
  "method": "PUT",
  "instructions": "Upload file using PUT method with Content-Type: image/jpeg",
  "maxSizeBytes": 2048576,
  "allowedContentType": "image/jpeg"
}
```

#### GET /api/v1/media/download/{key}
Генерация presigned URL для скачивания файла

**Пример ответа:**
```json
{
  "url": "https://minio.example.com/aquastream-media/user/550e8400-e29b-41d4-a716-446655440000/avatar/avatar.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
  "key": "user/550e8400-e29b-41d4-a716-446655440000/avatar/avatar.jpg",
  "expires": "2024-08-17T16:00:00Z",
  "method": "GET"
}
```

#### POST /api/v1/media/confirm/{key}
Подтверждение успешной загрузки файла

**Параметры:**
- `checksum` (optional) - SHA-256 хеш загруженного файла

## Конфигурация лимитов

### Размеры файлов (application.yml)
```yaml
app:
  media:
    storage:
      files:
        max-photo-mb: 5      # Максимум 5 МБ для фотографий
        max-proof-mb: 5      # Максимум 5 МБ для документов-пруфов
        max-document-mb: 10  # Максимум 10 МБ для документов
        max-video-mb: 50     # Максимум 50 МБ для видео
```

### Ретенция файлов
```yaml
app:
  media:
    storage:
      retention:
        proofs-days: 90        # Пруфы удаляются через 90 дней
        temp-files-days: 1     # Временные файлы через 1 день
        log-retention-days: 365 # Логи очистки через 365 дней
```

### Сроки жизни URL
```yaml
app:
  media:
    storage:
      presigned-url:
        upload-expiry: PT15M   # Upload URL действует 15 минут
        download-expiry: PT1H  # Download URL действует 1 час
```

## Примеры ключей файлов

### Аватар пользователя
```
user/550e8400-e29b-41d4-a716-446655440000/avatar/profile.jpg
```

### Документ верификации организатора
```
organizer/987fcdeb-51d2-4c3a-8b45-123456789abc/proof/certificate.pdf
```

### Галерея события
```
event/123e4567-e89b-12d3-a456-426614174000/gallery/photo-001.jpg
event/123e4567-e89b-12d3-a456-426614174000/gallery/photo-002.jpg
```

### Системные файлы
```
system/defaults/avatars/user-placeholder.png
system/templates/certificate-template.pdf
```

## Сроки жизни presigned URLs

### Upload URLs
- **Время жизни**: 15 минут
- **Назначение**: Загрузка файлов клиентами
- **Метод**: PUT
- **Особенности**: Включают валидацию Content-Type и размера

### Download URLs  
- **Время жизни**: 1 час
- **Назначение**: Скачивание файлов
- **Метод**: GET
- **Особенности**: Только для файлов в статусе READY

## Валидация и обработка ошибок

### 413 Payload Too Large
```json
{
  "type": "https://aquastream.org/problems/media.file-too-large",
  "title": "payload too large",
  "status": 413,
  "detail": "File size 10485760 bytes exceeds maximum allowed 5242880 bytes for photo files",
  "timestamp": "2024-08-17T14:00:00Z"
}
```

### 415 Unsupported Media Type
```json
{
  "type": "https://aquastream.org/problems/media.unsupported-type", 
  "title": "unsupported media type",
  "status": 415,
  "detail": "Unsupported file type: application/x-executable",
  "timestamp": "2024-08-17T14:00:00Z"
}
```

### 503 Service Unavailable (Storage)
```json
{
  "type": "https://aquastream.org/problems/media.storage-unavailable",
  "title": "Storage Service Unavailable", 
  "status": 503,
  "detail": "Storage service temporarily unavailable",
  "timestamp": "2024-08-17T14:00:00Z"
}
```

## Процесс загрузки файла

### 1. Запрос presigned URL
```bash
curl -X POST /api/v1/media/presign \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "image/jpeg",
    "contentLength": 1048576,
    "ownerType": "user", 
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "originalFilename": "photo.jpg",
    "purpose": "avatar"
  }'
```

### 2. Загрузка файла в MinIO
```bash
curl -X PUT "${presigned_url}" \
  -H "Content-Type: image/jpeg" \
  -H "Content-Length: 1048576" \
  --data-binary @photo.jpg
```

### 3. Подтверждение загрузки
```bash
curl -X POST /api/v1/media/confirm/user/550e8400-e29b-41d4-a716-446655440000/avatar/photo.jpg \
  -H "Content-Type: application/json" \
  -d '{"checksum": "sha256-hash-here"}'
```

## Автоматическая очистка

### Scheduled задачи
- **Ежедневно в 2:00**: Удаление просроченных файлов (proofs > 90 дней)
- **Каждый час**: Очистка зависших загрузок (> 24 часа в статусе UPLOADING)
- **Ежемесячно**: Очистка старых логов (> 365 дней)
- **Каждые 5 минут**: Health check соединения с MinIO

### Мониторинг очистки
```sql
-- Статистика очистки за последний месяц
SELECT DATE(cleaned_at) as date, SUM(files_deleted) as total_deleted
FROM media.cleanup_log 
WHERE cleaned_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(cleaned_at)
ORDER BY date DESC;
```

## Интеграция с MinIO

### Docker Compose пример
```yaml
version: '3.8'
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

### Создание bucket
```bash
# Используя MinIO Client
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/aquastream-media
mc policy set public local/aquastream-media/public/
```