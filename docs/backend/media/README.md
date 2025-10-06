# Media Service — Overview

## Назначение

Media Service отвечает за хранение файлов (изображения, платежные доказательства, документы) в MinIO/S3, управляет доступом и сроками жизни ссылок.

**Порт**: 8106  
**База данных**: PostgreSQL схема `media`

## Архитектура модуля

```
backend-media/
├── backend-media-api/       # REST API, правила доступа, контроллеры
├── backend-media-service/   # Бизнес-логика presigned URLs и retention
└── backend-media-db/        # Entities, репозитории, миграции Liquibase
```

## Основные сценарии

1. **Загрузка файлов** — выдача presigned URL для загрузки, валидация размера и MIME-типа, регистрация метаданных (owner_type/owner_id).
2. **Доступ к файлам** — проверка прав, генерация краткоживущего presigned URL (TTL 15 минут).
3. **Retention** — плановое удаление просроченных файлов (payment proofs 90 дней, орг/ивент изображения бессрочно).

## Интеграции

- **MinIO/S3** — основное хранилище объектов.
- **Payment Service** — хранение квитанций для QR-оплаты.
- **Event Service** — изображения событий, обложки.

## Дополнительно

- Подробности бизнес-логики: [`business-logic.md`](business-logic.md)
- REST API и схемы: [`api.md`](api.md)
- Эксплуатация и конфигурация: [`operations.md`](operations.md)
