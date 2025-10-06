# Runbook: Database Maintenance

---
title: Database Maintenance Runbook
summary: Регламентные операции с PostgreSQL для AquaStream.
tags: [operations, runbook, database]
---

## Контекст

PostgreSQL 16 развёрнут в Docker, данные хранятся в volume `pgdata`. Резервные копии создаются скриптами из `backend-infra/backup/`.

## Операции обслуживания

### 1. Vacuum & Analyze

```bash
make db-vacuum
```

Команда выполняет `VACUUM (FULL, ANALYZE)` для всех схем. Запускать еженедельно или при росте bloated таблиц.

### 2. Ротация бэкапов

```bash
make backup                # Полный backup
make backup SCHEMA=event   # Частичный backup схемы
```

- Хранение бэкапов: S3 (MinIO) с retention 30 дней.
- Проверка целостности: `pg_restore --list`.

### 3. Обновление расширений

```bash
docker exec aquastream-postgres psql -U aquastream -c 'ALTER EXTENSION pgcrypto UPDATE;'
```

### 4. Мониторинг производительности

- Статистика блокировок: `pg_locks`.
- Долгие запросы: `pg_stat_activity` (`state = 'active'` и `now() - query_start > interval '5 minutes'`).
- Индексы: `pg_stat_all_indexes`.

## Падение базы данных

1. Проверить логи: `docker logs aquastream-postgres`.
2. Проверить дисковое пространство: `df -h`.
3. В случае повреждения данных — восстановить из последнего валидного бэкапа:

```bash
make down
make restore FILE=backup/<date>/all.dump
make up-prod
```

## Плановые обновления

- Обновление образа: `make build-images` → `make push-images`.
- Создать миграцию Liquibase (`backend-*/db`), проверить в dev/stage.
- При major обновлениях — dry-run на стейдже.

## SLA

- Доступность: 99.5%.
- MTTR при incident: < 30 минут.
- Backup restore тест: ежемесячно.

## Связанные документы

- [Backup & Recovery](../backup-recovery.md)
- [Incident Response](incident-response.md)
- [Security Policy](../policies/security.md)
