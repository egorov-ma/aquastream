#!/bin/bash

BACKUP_DIR="/backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="postgres"
DB_NAME="aquastream_db"
DB_USER="postgres"

# Создаем бэкап базы данных
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Ротация бэкапов (оставляем последние 7 дней)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

# Отправляем бэкап в облачное хранилище
aws s3 cp "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz" "s3://aquastream-backups/" 