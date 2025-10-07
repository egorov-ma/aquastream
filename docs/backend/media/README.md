# Media Service

## Обзор

Media Service управляет файлами в MinIO/S3: загрузка, доступ через presigned URLs, retention policies.

**Порт**: 8106
**Схема БД**: `media`
**Хранилище**: MinIO/S3

## Архитектура

```
backend-media/
├── backend-media-api/       # REST API, правила доступа
├── backend-media-service/   # Presigned URLs, retention
└── backend-media-db/        # Entities, миграции
```

## Основные процессы

| Процесс | Действия |
|---------|----------|
| **Загрузка** | Presigned URL для PUT → валидация MIME/размера → регистрация метаданных (owner_type, owner_id) |
| **Доступ** | Проверка прав → presigned URL (TTL 15 минут) |
| **Retention** | Автоудаление: payment proofs 90 дней, event images постоянно |

## Типы файлов

| Owner Type | Retention | Использование |
|------------|-----------|---------------|
| `payment_proof` | 90 дней | Скриншоты QR-оплаты (Payment Service) |
| `event` | Постоянно | Изображения событий, обложки |
| `organizer` | Постоянно | Логотипы организаторов |

## Интеграции

- **MinIO/S3** - хранилище объектов
- **Payment Service** - квитанции для QR-оплаты
- **Event Service** - изображения событий

---

См. [Business Logic](business-logic.md), [API](api.md), [Operations](operations.md).