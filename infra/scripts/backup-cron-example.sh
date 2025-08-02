#!/bin/bash

# Пример настройки cron для автоматических бэкапов AquaStream
# 
# Для установки cron задач выполните:
# 1. Скопируйте этот файл и настройте пути
# 2. Сделайте исполняемым: chmod +x backup-cron-example.sh  
# 3. Добавьте в crontab: crontab -e
# 4. Добавьте строки из раздела "CRON КОНФИГУРАЦИЯ" ниже

# =============================================================================
# КОНФИГУРАЦИЯ ОКРУЖЕНИЯ
# =============================================================================

# Путь к проекту AquaStream (НАСТРОИТЬ!)
export PROJECT_ROOT="/path/to/aquastream"

# Путь к директории бэкапов (НАСТРОИТЬ!)
export BACKUP_DIR="/backup/aquastream"

# Retention период (дни)
export RETENTION_DAYS=30

# Email для уведомлений (НАСТРОИТЬ!)
export NOTIFICATION_EMAIL="admin@company.com"

# Slack webhook для уведомлений (опционально)
export SLACK_WEBHOOK_URL=""

# =============================================================================
# CRON КОНФИГУРАЦИЯ
# =============================================================================

# Добавьте эти строки в crontab (crontab -e):
#
# # AquaStream Backup Jobs
# # Ежедневный полный бэкап в 2:00 AM
# 0 2 * * * /path/to/aquastream/infra/scripts/backup-cron-example.sh full
# 
# # Быстрый бэкап PostgreSQL каждые 6 часов
# 0 */6 * * * /path/to/aquastream/infra/scripts/backup-cron-example.sh postgres
# 
# # Еженедельный полный бэкап с архивированием (воскресенье в 1:00 AM)
# 0 1 * * 0 /path/to/aquastream/infra/scripts/backup-cron-example.sh weekly
#
# # Ежемесячная очистка старых бэкапов (1 число каждого месяца в 3:00 AM)
# 0 3 1 * * /path/to/aquastream/infra/scripts/backup-cron-example.sh cleanup

# =============================================================================
# ФУНКЦИИ
# =============================================================================

# Настройка переменных окружения для cron
setup_environment() {
    # cron имеет ограниченное окружение, добавляем необходимые пути
    export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    
    # Переходим в директорию проекта
    cd "$PROJECT_ROOT" || {
        echo "ERROR: Не удается перейти в директорию проекта: $PROJECT_ROOT"
        exit 1
    }
    
    # Проверяем наличие необходимых файлов
    if [ ! -f "run.sh" ]; then
        echo "ERROR: run.sh не найден в $PROJECT_ROOT"
        exit 1
    fi
    
    if [ ! -f "infra/scripts/backup-volumes.sh" ]; then
        echo "ERROR: backup-volumes.sh не найден"
        exit 1
    fi
}

# Отправка email уведомления
send_email_notification() {
    local subject="$1"
    local message="$2"
    
    if [ -n "${NOTIFICATION_EMAIL:-}" ] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "$subject" "$NOTIFICATION_EMAIL"
    fi
}

# Отправка Slack уведомления
send_slack_notification() {
    local message="$1"
    
    if [ -n "${SLACK_WEBHOOK_URL:-}" ] && command -v curl >/dev/null 2>&1; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" >/dev/null 2>&1
    fi
}

# Отправка уведомления
notify() {
    local status="$1"
    local message="$2"
    local full_message="AquaStream Backup [$status]: $message"
    
    echo "[$(date)] $full_message"
    send_email_notification "AquaStream Backup $status" "$full_message"
    send_slack_notification "$full_message"
}

# Полный бэкап
full_backup() {
    local start_time=$(date +%s)
    
    notify "STARTED" "Начинаем полный бэкап"
    
    # Проверяем, что контейнеры запущены
    if ! docker compose -f infra/docker/compose/docker-compose.yml ps | grep -q "Up"; then
        notify "ERROR" "Контейнеры не запущены"
        return 1
    fi
    
    # Выполняем бэкап
    if ./infra/scripts/backup-volumes.sh; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        local duration_formatted=$(printf "%02d:%02d:%02d" $((duration/3600)) $((duration%3600/60)) $((duration%60)))
        
        notify "SUCCESS" "Полный бэкап завершен за $duration_formatted"
        return 0
    else
        notify "FAILED" "Ошибка выполнения полного бэкапа"
        return 1
    fi
}

# Быстрый бэкап PostgreSQL
postgres_backup() {
    local start_time=$(date +%s)
    
    notify "STARTED" "Начинаем бэкап PostgreSQL"
    
    if ./infra/scripts/backup-volumes.sh --postgres-only; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        notify "SUCCESS" "Бэкап PostgreSQL завершен за ${duration}s"
        return 0
    else
        notify "FAILED" "Ошибка бэкапа PostgreSQL"
        return 1
    fi
}

# Еженедельный бэкап с архивированием
weekly_backup() {
    local week_number=$(date +%V)
    local year=$(date +%Y)
    local weekly_dir="${BACKUP_DIR}/weekly/week_${year}_${week_number}"
    
    notify "STARTED" "Начинаем еженедельный бэкап (неделя $week_number)"
    
    # Создаем директорию для еженедельного бэкапа
    mkdir -p "$weekly_dir"
    
    # Временно меняем BACKUP_DIR для этого бэкапа
    local original_backup_dir="$BACKUP_DIR"
    export BACKUP_DIR="$weekly_dir"
    
    # Выполняем полный бэкап
    if full_backup; then
        # Создаем архив недели
        local archive_name="${original_backup_dir}/weekly_backup_${year}_week_${week_number}.tar.gz"
        tar -czf "$archive_name" -C "$weekly_dir" .
        
        # Восстанавливаем оригинальный BACKUP_DIR
        export BACKUP_DIR="$original_backup_dir"
        
        # Удаляем временную директорию
        rm -rf "$weekly_dir"
        
        local archive_size=$(du -h "$archive_name" | cut -f1)
        notify "SUCCESS" "Еженедельный архив создан: $archive_name (размер: $archive_size)"
        
        # Удаляем старые еженедельные архивы (старше 12 недель)
        find "${BACKUP_DIR}" -name "weekly_backup_*.tar.gz" -mtime +84 -delete 2>/dev/null || true
        
        return 0
    else
        export BACKUP_DIR="$original_backup_dir"
        notify "FAILED" "Ошибка еженедельного бэкапа"
        return 1
    fi
}

# Очистка старых бэкапов
cleanup_backups() {
    notify "STARTED" "Начинаем очистку старых бэкапов"
    
    local deleted_count=0
    local total_size_before=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    
    # Удаляем файлы старше RETENTION_DAYS дней
    while IFS= read -r -d '' file; do
        rm "$file"
        deleted_count=$((deleted_count + 1))
    done < <(find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -print0 2>/dev/null || true)
    
    # Удаляем пустые директории
    find "$BACKUP_DIR" -type d -empty -delete 2>/dev/null || true
    
    local total_size_after=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    
    notify "SUCCESS" "Очистка завершена: удалено $deleted_count файлов. Размер до: $total_size_before, после: $total_size_after"
}

# Проверка состояния системы
health_check() {
    local issues=""
    
    # Проверяем доступное место на диске
    local disk_usage=$(df "$BACKUP_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        issues="$issues\n- Диск заполнен на ${disk_usage}%"
    fi
    
    # Проверяем статус Docker
    if ! docker info >/dev/null 2>&1; then
        issues="$issues\n- Docker недоступен"
    fi
    
    # Проверяем статус контейнеров
    local unhealthy_containers
    unhealthy_containers=$(docker compose -f infra/docker/compose/docker-compose.yml ps --filter "health=unhealthy" --format "table {{.Name}}" 2>/dev/null | tail -n +2 || true)
    if [ -n "$unhealthy_containers" ]; then
        issues="$issues\n- Нездоровые контейнеры: $unhealthy_containers"
    fi
    
    # Проверяем возраст последнего бэкапа
    local last_backup
    last_backup=$(find "$BACKUP_DIR" -name "postgres_backup_*.sql.gz" -mtime -1 | head -1)
    if [ -z "$last_backup" ]; then
        issues="$issues\n- Нет свежих бэкапов PostgreSQL (старше 24 часов)"
    fi
    
    if [ -n "$issues" ]; then
        notify "WARNING" "Обнаружены проблемы:$issues"
        return 1
    else
        notify "SUCCESS" "Система в порядке"
        return 0
    fi
}

# =============================================================================
# ОСНОВНАЯ ЛОГИКА
# =============================================================================

# Настраиваем окружение
setup_environment

# Создаем директорию бэкапов если не существует
mkdir -p "$BACKUP_DIR"

# Логируем запуск
echo "[$(date)] AquaStream Backup Cron Job started with command: ${1:-none}"

# Обрабатываем команды
case "${1:-}" in
    "full")
        full_backup
        exit $?
        ;;
    "postgres")
        postgres_backup
        exit $?
        ;;
    "weekly")
        weekly_backup
        exit $?
        ;;
    "cleanup")
        cleanup_backups
        exit $?
        ;;
    "health")
        health_check
        exit $?
        ;;
    *)
        echo "Использование: $0 {full|postgres|weekly|cleanup|health}"
        echo ""
        echo "Команды:"
        echo "  full     - Полный бэкап всех компонентов"
        echo "  postgres - Только бэкап PostgreSQL"
        echo "  weekly   - Еженедельный архивированный бэкап"
        echo "  cleanup  - Очистка старых бэкапов"
        echo "  health   - Проверка состояния системы"
        exit 1
        ;;
esac