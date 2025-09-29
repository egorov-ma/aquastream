# AquaStream Backend Media Service

Микросервис управления медиафайлами (изображения, документы, видео) с поддержкой различных типов владельцев, политик доступа, автоматической очистки и интеграцией с MinIO S3-совместимым хранилищем.

## Описание

`backend-media` предоставляет централизованное управление всеми медиафайлами в системе AquaStream:
- Безопасная загрузка и хранение файлов
- Политики доступа (публичные, приватные, unlisted)
- Presigned URLs для прямой загрузки в S3-хранилище
- Автоматическая очистка просроченных файлов
- Валидация типов и размеров файлов
- Аудит и мониторинг операций

Сервис следует принципам чистой архитектуры и микросервисной модели.

## Архитектура

### Мультимодульная структура

```
backend-media/
├── backend-media-api/        # REST контроллеры и DTO
│   ├── controller/          # REST endpoints
│   ├── config/             # Конфигурация API
│   └── exception/          # Обработка ошибок API
├── backend-media-service/   # Бизнес-логика
│   ├── service/            # Бизнес-сервисы
│   ├── storage/            # Абстракция хранилища
│   ├── validation/         # Валидация файлов
│   ├── scheduler/          # Фоновые задачи очистки
│   └── dto/                # Data Transfer Objects
└── backend-media-db/       # Слой данных
    ├── entity/             # JPA Entity классы
    ├── repository/         # Spring Data JPA репозитории
    └── migration/          # Liquibase миграции БД
```

### Основные компоненты

#### 📁 Управление файлами
- Централизованный реестр всех медиафайлов
- Метаданные: размер, тип, checksum, владелец
- Статусы жизненного цикла: UPLOADING → UPLOADED → READY → DELETED
- Поддержка различных типов владельцев и категорий

#### 🔐 Политики доступа
- **PRIVATE** - доступ только владельцу
- **PUBLIC** - публичный доступ без аутентификации  
- **UNLISTED** - доступ по прямой ссылке

#### ☁️ S3-совместимое хранилище
- MinIO как основное хранилище
- Presigned URLs для прямой загрузки клиентами
- Автоматическое управление lifecycle политиками

#### 🧹 Автоматическая очистка
- Scheduled задачи для удаления просроченных файлов
- Очистка зависших загрузок
- Логирование операций очистки

## Доменная модель

### Основные сущности

#### MediaFileEntity - Медиафайлы
- **id** - Уникальный идентификатор
- **key** - Уникальный путь файла в хранилище
- **ownerType** - Тип владельца (USER, EVENT, ORGANIZER, etc.)
- **ownerId** - Идентификатор владельца
- **checksum** - SHA-256 хеш для проверки целостности
- **contentType** - MIME-тип файла
- **sizeBytes** - Размер файла в байтах
- **originalFilename** - Оригинальное имя файла
- **status** - Статус обработки (UPLOADING, UPLOADED, READY, DELETED)
- **visibility** - Политика доступа (PRIVATE, PUBLIC, UNLISTED)
- **expiresAt** - Время истечения для временных файлов

#### CleanupLogEntity - Лог очистки
- **id** - Идентификатор записи
- **cleanedAt** - Время выполнения очистки
- **filesDeleted** - Количество удаленных файлов

### Типы владельцев файлов

#### USER
- Аватары пользователей
- Приложенные к профилю документы
- Личные файлы в чатах

#### EVENT  
- Изображения события (обложки, галерея)
- Документы мероприятия (программы, карты)
- Материалы для участников

#### ORGANIZER
- Логотипы организаций
- Документы верификации
- Рекламные материалы

#### PROFILE
- Фотографии профиля
- Сертификаты и достижения
- Документы подтверждения опыта

#### SYSTEM
- Дефолтные изображения
- Шаблоны документов
- Системные ресурсы

### Статусы файлов

#### UPLOADING
- Файл в процессе загрузки
- Может быть неполным
- Автоматическая очистка через 24 часа

#### UPLOADED
- Загрузка завершена
- Файл доступен для обработки
- Базовые проверки пройдены

#### READY
- Файл готов к использованию
- Все обработки завершены
- Доступен согласно политике visibility

#### DELETED
- Файл помечен к удалению
- Недоступен для новых запросов
- Физическое удаление по расписанию

### Бизнес-правила

#### Ключи файлов
Структура: `{owner_type}/{owner_id}/{category}/{filename}`

Примеры:
```
user/550e8400-e29b-41d4-a716-446655440000/avatar/profile.jpg
event/123e4567-e89b-12d3-a456-426614174000/gallery/photo-001.jpg
organizer/987fcdeb-51d2-4c3a-8b45-123456789abc/logo/brand.png
system/defaults/avatars/user-placeholder.png
```

#### Валидация файлов
- Проверка MIME-типов по whitelist
- Ограничения размеров по категориям
- SHA-256 checksum для проверки целостности
- Валидация структуры ключей

#### Автоматическая очистка
- Временные файлы удаляются по истечении expires_at
- Зависшие загрузки (>24 часа в UPLOADING) автоматически удаляются
- Proof документы имеют TTL 90 дней

## API Endpoints

### Presigned URLs

#### `POST /api/v1/media/presign`
Генерация presigned URL для загрузки файла

**Request:**
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

**Response:**
```json
{
  "url": "https://minio.example.com/aquastream-media/user/550e8400-e29b-41d4-a716-446655440000/avatar/avatar.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
  "key": "user/550e8400-e29b-41d4-a716-446655440000/avatar/avatar.jpg",
  "expires": "2025-08-20T15:30:00Z",
  "uploadSessionId": "123e4567-e89b-12d3-a456-426614174000",
  "method": "PUT",
  "instructions": "Upload file using PUT method with Content-Type: image/jpeg",
  "maxSizeBytes": 2048576,
  "allowedContentType": "image/jpeg"
}
```

### Загрузка файлов

#### `GET /api/v1/media/download/{key}`
Генерация presigned URL для скачивания файла

**Response:**
```json
{
  "url": "https://minio.example.com/aquastream-media/user/550e8400-e29b-41d4-a716-446655440000/avatar/avatar.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
  "key": "user/550e8400-e29b-41d4-a716-446655440000/avatar/avatar.jpg",
  "expires": "2025-08-20T16:00:00Z",
  "method": "GET"
}
```

#### `POST /api/v1/media/confirm/{key}`
Подтверждение успешной загрузки файла

**Request:**
```json
{
  "checksum": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
}
```

### Управление файлами

#### `GET /api/v1/media/files`
Список файлов с фильтрами

**Параметры:**
- `ownerType` - тип владельца
- `ownerId` - идентификатор владельца
- `status` - статус файла
- `visibility` - политика доступа
- `page/size` - пагинация

#### `DELETE /api/v1/media/files/{key}`
Пометка файла к удалению

#### `GET /api/v1/media/files/{key}/info`
Метаданные файла

## Использование

### Подключение

```gradle
dependencies {
    implementation project(':backend-media:backend-media-api')
    implementation project(':backend-media:backend-media-service')
    implementation project(':backend-media:backend-media-db')
}
```

### Конфигурация

```yaml
server:
  port: 8106

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aquastream
    username: aquastream_user
    password: ${DB_PASSWORD}
  
  liquibase:
    change-log: classpath:migration/liquibase/master.xml
    default-schema: media

app:
  media:
    storage:
      minio:
        endpoint: http://localhost:9000
        access-key: minioadmin
        secret-key: minioadmin
        bucket: aquastream-media
      files:
        max-photo-mb: 5
        max-proof-mb: 5
        max-document-mb: 10
        max-video-mb: 50
      retention:
        proofs-days: 90
        temp-files-days: 1
        log-retention-days: 365
      presigned-url:
        upload-expiry: PT15M
        download-expiry: PT1H
```

### Примеры использования

#### Загрузка аватара пользователя

```java
@Autowired
private MediaService mediaService;

// 1. Запрос presigned URL
PresignedUrlRequest request = PresignedUrlRequest.builder()
    .contentType("image/jpeg")
    .contentLength(1048576L)
    .ownerType("user")
    .ownerId(userId)
    .originalFilename("avatar.jpg")
    .purpose("avatar")
    .checksum("sha256-hash")
    .build();

PresignedUrlResponse response = mediaService.generatePresignedUrl(request);

// 2. Клиент загружает файл по presigned URL
// PUT request to response.getUrl()

// 3. Подтверждение загрузки
mediaService.confirmUpload(response.getKey(), "sha256-hash");
```

#### Получение download URL

```java
// Генерация URL для скачивания
String downloadUrl = mediaService.generateDownloadUrl(
    "user/550e8400-e29b-41d4-a716-446655440000/avatar/profile.jpg"
);
```

### Процесс загрузки файла

#### 1. Запрос presigned URL
```bash
curl -X POST /api/v1/media/presign \
  -H "Authorization: Bearer <jwt-token>" \
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

#### 2. Загрузка файла в MinIO
```bash
curl -X PUT "${presigned_url}" \
  -H "Content-Type: image/jpeg" \
  -H "Content-Length: 1048576" \
  --data-binary @photo.jpg
```

#### 3. Подтверждение загрузки
```bash
curl -X POST /api/v1/media/confirm/user/550e8400-e29b-41d4-a716-446655440000/avatar/photo.jpg \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"checksum": "sha256-hash-here"}'
```

## База данных

### Схема: media

#### Основные таблицы
- **files** - Центральный реестр всех медиафайлов
- **cleanup_log** - Лог операций автоматической очистки

#### Индексы для производительности
- **Основные запросы**: по ключу, владельцу, checksum
- **Статус и доступ**: по статусу, visibility
- **Временные запросы**: по датам создания и истечения
- **Составные индексы**: owner+status, owner+visibility

#### Ограничения
- Уникальность key
- Валидация checksum (SHA-256)
- Валидация MIME-типов
- size_bytes >= 0

### Автоматические функции

#### Триггеры
- Автоматическое обновление updated_at
- Валидация структуры ключей файлов

#### Функции очистки
```sql
-- Очистка просроченных файлов
SELECT media.cleanup_expired_files();

-- Очистка зависших загрузок
UPDATE media.files 
SET status = 'DELETED' 
WHERE status = 'UPLOADING' 
  AND created_at < NOW() - INTERVAL '24 hours';
```

## Интеграция с MinIO

### Настройка MinIO

#### Docker Compose
```yaml
services:
  minio:
    image: minio/minio:RELEASE.2024-06-13T22-53-53Z
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
```

#### Создание bucket
```bash
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/aquastream-media
mc policy set public local/aquastream-media/public/
```

### Конфигурация MinIO в приложении

```yaml
app:
  media:
    storage:
      minio:
        endpoint: http://localhost:9000
        access-key: minioadmin
        secret-key: minioadmin
        bucket: aquastream-media
        region: us-east-1
```

## Фоновые задачи

### Автоматическая очистка

#### Scheduled задачи
- **Ежедневно в 2:00**: Удаление просроченных файлов
- **Каждый час**: Очистка зависших загрузок (>24 часа в UPLOADING)
- **Ежемесячно**: Очистка старых логов (>365 дней)
- **Каждые 5 минут**: Health check соединения с MinIO

#### Конфигурация scheduler
```java
@Component
@ConditionalOnProperty(name = "app.scheduling.enabled", havingValue = "true")
public class FileCleanupScheduler {
    
    @Scheduled(cron = "0 0 2 * * *") // Ежедневно в 2:00
    public void cleanupExpiredFiles() {
        // Очистка просроченных файлов
    }
    
    @Scheduled(cron = "0 0 * * * *") // Каждый час
    public void cleanupStuckUploads() {
        // Очистка зависших загрузок
    }
}
```

## Валидация и ограничения

### Размеры файлов

| Категория | Максимальный размер |
|-----------|-------------------|
| Фотографии | 5 МБ |
| Документы-пруфы | 5 МБ |
| Документы | 10 МБ |
| Видео | 50 МБ |

### Поддерживаемые типы файлов

#### Изображения
- image/jpeg
- image/png
- image/webp
- image/gif

#### Документы
- application/pdf
- text/plain
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document

#### Видео
- video/mp4
- video/webm
- video/quicktime

### Время жизни presigned URLs

#### Upload URLs
- **Время жизни**: 15 минут
- **Назначение**: Загрузка файлов клиентами
- **Метод**: PUT
- **Валидация**: Content-Type и размера

#### Download URLs  
- **Время жизни**: 1 час
- **Назначение**: Скачивание файлов
- **Метод**: GET
- **Ограничения**: Только файлы в статусе READY

## Обработка ошибок

### Стандартные HTTP коды

- **400 Bad Request** - Некорректные параметры запроса
- **401 Unauthorized** - Требуется аутентификация
- **403 Forbidden** - Недостаточно прав доступа
- **404 Not Found** - Файл не найден
- **413 Payload Too Large** - Превышен максимальный размер файла
- **415 Unsupported Media Type** - Неподдерживаемый тип файла
- **503 Service Unavailable** - Недоступно хранилище

### Формат ошибок (RFC 7807)

#### 413 Payload Too Large
```json
{
  "type": "https://api.aquastream.org/errors/file-too-large",
  "title": "Превышен максимальный размер файла",
  "status": 413,
  "detail": "Размер файла 10485760 байт превышает максимально допустимый 5242880 байт для фотографий",
  "instance": "/api/v1/media/presign",
  "timestamp": "2025-08-20T10:30:00Z",
  "correlationId": "req-abc123"
}
```

#### 415 Unsupported Media Type
```json
{
  "type": "https://api.aquastream.org/errors/unsupported-media-type",
  "title": "Неподдерживаемый тип файла",
  "status": 415,
  "detail": "Тип файла application/x-executable не поддерживается",
  "instance": "/api/v1/media/presign",
  "timestamp": "2025-08-20T10:30:00Z",
  "correlationId": "req-abc123"
}
```

## Мониторинг

### Health Check

```bash
GET /actuator/health
```

### Метрики

```bash
GET /actuator/metrics
```

### Ключевые метрики для мониторинга

- Количество файлов по типам владельцев
- Распределение размеров файлов
- Успешность загрузок (по статусам)
- Время обработки файлов
- Статистика очистки файлов
- Доступность MinIO storage

### Prometheus метрики

- `media_files_total` - общее количество файлов
- `media_storage_size_bytes` - используемое место в хранилище
- `media_upload_duration_seconds` - время загрузки файлов
- `media_cleanup_files_total` - количество очищенных файлов
- `media_storage_health` - здоровье соединения с MinIO

## Тестирование

### Unit тесты

```bash
./gradlew backend-media:backend-media-service:test
```

### Integration тесты

```bash
./gradlew backend-media:backend-media-api:test
```

### Тестовые данные

Модуль поддерживает создание тестовых данных через TestContainers с MinIO и встроенную базу данных H2.

## Производительность

### Оптимизации
- Составные индексы для частых запросов
- Partial индексы для активных файлов
- Асинхронная обработка через CompletableFuture
- Connection pooling для MinIO клиента

### Кэширование
- Spring Cache для метаданных файлов
- CDN для публичных файлов
- HTTP cache headers на основе updated_at

### Масштабирование
- Stateless сервис
- Горизонтальное масштабирование
- Шардинг файлов по owner_type
- Репликация MinIO для высокой доступности

## Безопасность

### Авторизация
- JWT токены через Gateway
- Role-based доступ к файлам
- Проверка владения ресурсами

### Валидация
- Whitelist MIME-типов
- Проверка размеров файлов
- SHA-256 checksum валидация
- Санитизация имен файлов

### Защита данных
- Шифрование файлов в MinIO
- Audit trail всех операций
- Безопасное удаление с перезаписью

## Развертывание

### Docker

```dockerfile
FROM openjdk:21-jre-slim
COPY backend-media-api/build/libs/*.jar app.jar
EXPOSE 8106
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment переменные

```bash
SPRING_PROFILES_ACTIVE=prod
DB_HOST=postgres
DB_PASSWORD=secure_password
MINIO_ENDPOINT=https://minio.example.com
MINIO_ACCESS_KEY=access_key
MINIO_SECRET_KEY=secret_key
MINIO_BUCKET=aquastream-media
```

## Зависимости

### Основные
- Spring Boot 3.x
- Spring Data JPA
- PostgreSQL 15+
- Liquibase
- MinIO Java Client 8.x

### Опциональные
- Redis (кэширование)
- Micrometer (метрики)
- TestContainers (тестирование)

## Лицензия

Часть проекта AquaStream. См. LICENSE основного проекта для деталей.
