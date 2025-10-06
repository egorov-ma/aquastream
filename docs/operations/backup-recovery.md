---
title: Backup & Recovery
summary: Автоматическое резервное копирование PostgreSQL и процедуры восстановления
tags: [operations, backup, recovery, postgresql]
---

# Резервное копирование и восстановление

## Обзор

Автоматическое резервное копирование PostgreSQL с поддержкой retention policy для ежедневных, еженедельных и ежемесячных бэкапов.

## PostgreSQL Бэкапы

### Автоматическое создание

#### Через Make

```bash
# Создать бэкап всех схем
make backup

# Или напрямую через скрипт
bash backend-infra/backup/backup.sh
```

#### Что происходит при бэкапе

1. Создаются дампы для каждой схемы: `user`, `event`, `crew`, `payment`, `notification`, `media`
2. Файлы сохраняются в `backend-infra/backup/artifacts/`
3. Формат файлов: `{schema}_{YYYYMMDD}.dump.gz`
4. Еженедельные копии (воскресенье): `weekly_{schema}_{YYYY-WW}.dump.gz`
5. Ежемесячные копии (1 число): `monthly_{schema}_{YYYY-MM}.dump.gz`

### Политика retention

- **Ежедневные бэкапы**: 7 дней
- **Еженедельные бэкапы**: 4 недели
- **Ежемесячные бэкапы**: 3 месяца

### Расписание

- **Production**: ежедневно в 02:00 UTC (cron)
- **Staging**: ежедневно в 03:00 UTC
- **Development**: вручную по необходимости

## Восстановление из бэкапа

### Восстановление одной схемы

```bash
# Синтаксис
make restore SCHEMA=<schema> FILE=<path>

# Примеры
make restore SCHEMA=user FILE=backend-infra/backup/artifacts/user_20250818.dump.gz
make restore SCHEMA=event FILE=backend-infra/backup/artifacts/weekly_event_2025-33.dump.gz
```

### Восстановление вручную

```bash
# Через скрипт
bash backend-infra/backup/restore.sh <schema> <dump-file>

# Напрямую через pg_restore
gunzip -c backend-infra/backup/artifacts/user_20250818.dump.gz | \
  docker exec -i aquastream-postgres pg_restore -U aquastream -d aquastream --schema=user --clean --if-exists
```

### Восстановление всех схем

```bash
# Восстановить последние бэкапы всех схем
for schema in user event crew payment notification media; do
    latest=$(ls -t backend-infra/backup/artifacts/${schema}_*.dump.gz | head -1)
    make restore SCHEMA=$schema FILE=$latest
done
```

## Структура бэкапов

```
backend-infra/backup/
├── backup.sh                 # Скрипт создания бэкапов
├── restore.sh                # Скрипт восстановления
└── artifacts/                # Хранилище бэкапов
    ├── user_20250930.dump.gz
    ├── event_20250930.dump.gz
    ├── weekly_user_2025-40.dump.gz
    ├── weekly_event_2025-40.dump.gz
    ├── monthly_user_2025-09.dump.gz
    └── monthly_event_2025-09.dump.gz
```

## Redis бэкапы

### Настройка BGSAVE

```bash
# В redis.conf или через команду
CONFIG SET save "3600 1"  # BGSAVE каждый час при наличии изменений

# Ручной BGSAVE
docker exec aquastream-redis redis-cli BGSAVE

# Проверка статуса
docker exec aquastream-redis redis-cli LASTSAVE
```

### Копирование RDB файла

```bash
# RDB файл находится в /data/dump.rdb
docker cp aquastream-redis:/data/dump.rdb ./redis-backup-$(date +%Y%m%d).rdb
```

## Проверка восстановлений

### Тестирование восстановления

```bash
# 1. Создать тестовую БД
docker exec -it aquastream-postgres psql -U postgres -c "CREATE DATABASE aquastream_test;"

# 2. Восстановить бэкап в тестовую БД
gunzip -c backend-infra/backup/artifacts/user_20250930.dump.gz | \
  docker exec -i aquastream-postgres pg_restore -U postgres -d aquastream_test --schema=user

# 3. Проверить данные
docker exec -it aquastream-postgres psql -U postgres -d aquastream_test -c "\dt user.*"

# 4. Удалить тестовую БД
docker exec -it aquastream-postgres psql -U postgres -c "DROP DATABASE aquastream_test;"
```

### Регулярная проверка

- **Частота**: ежемесячно
- **Процесс**: восстановление последнего бэкапа на staging окружение
- **Верификация**: запуск smoke-тестов на восстановленной БД

## Автоматизация

### Настройка cron (Production)

```bash
# /etc/cron.d/aquastream-backup
0 2 * * * aquastream /path/to/backend-infra/backup/backup.sh >> /var/log/aquastream-backup.log 2>&1
```

### Docker Compose (встроенный scheduler)

```yaml
# В docker-compose.yml можно добавить сервис
backup-scheduler:
  image: alpine:latest
  command: crond -f
  volumes:
    - ./backend-infra/backup:/backup
    - /var/run/docker.sock:/var/run/docker.sock
  environment:
    - POSTGRES_HOST=postgres
    - POSTGRES_USER=aquastream
```

## Мониторинг бэкапов

### Проверка успешности

```bash
# Проверить последний бэкап каждой схемы
for schema in user event crew payment notification media; do
    latest=$(ls -t backend-infra/backup/artifacts/${schema}_*.dump.gz 2>/dev/null | head -1)
    if [ -f "$latest" ]; then
        echo "✓ $schema: $(basename $latest) ($(stat -f%z $latest) bytes)"
    else
        echo "✗ $schema: NO BACKUP FOUND"
    fi
done
```

### Алерты

- Алерт если бэкап не создавался > 25 часов
- Алерт если размер бэкапа < 10% от предыдущего
- Алерт если backup.sh завершился с ошибкой

## Offsite копирование

### S3/MinIO

```bash
# Копирование в S3 (для production)
aws s3 sync backend-infra/backup/artifacts/ s3://aquastream-backups/postgres/ \
    --exclude "*" \
    --include "monthly_*.dump.gz" \
    --include "weekly_*.dump.gz"

# Или в MinIO
mc cp --recursive backend-infra/backup/artifacts/ minio/backups/postgres/
```

## Disaster Recovery

### RTO (Recovery Time Objective)

- **Цель**: < 1 час
- **Процедура**: восстановление из последнего бэкапа + replay WAL логов (если настроено)

### RPO (Recovery Point Objective)

- **Цель**: < 24 часа (ежедневные бэкапы)
- **Улучшение**: continuous archiving (WAL) для RPO < 15 минут

## См. также

- [Database Guide](../backend/database.md) - детали схем и миграций
- [Infrastructure](infrastructure.md) - настройка окружения
- [Deployment](deployment.md) - процесс развертывания
- [Architecture](../architecture.md) - архитектура системы
