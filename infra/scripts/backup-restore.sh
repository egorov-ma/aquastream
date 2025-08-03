#!/bin/bash
set -euo pipefail

# Объединенный скрипт для backup и restore операций AquaStream
# Поддерживает PostgreSQL, Elasticsearch, конфигурации и Docker volumes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Цвета для вывода
NC="\033[0m"; GREEN="\033[0;32m"; YELLOW="\033[0;33m"; RED="\033[0;31m"; BLUE="\033[0;34m"

log() {
    local level="$1"; shift
    local msg="$*"
    local color="$GREEN"
    case "$level" in
      INFO)  color="$GREEN";;
      WARN)  color="$YELLOW";;
      ERROR) color="$RED";;
      DEBUG) color="$BLUE";;
    esac
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${color}${level}${NC} ${msg}"
}

# Конфигурация
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/backups}"
BACKUP_DATE="$(date +%Y%m%d_%H%M%S)"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
COMPOSE_FILE="${PROJECT_ROOT}/infra/docker/compose/docker-compose.yml"

# Создаем директорию для бэкапов
mkdir -p "$BACKUP_DIR"

# Загружаем переменные окружения
load_env() {
    if [ -f "${PROJECT_ROOT}/infra/docker/compose/.env" ]; then
        # shellcheck source=/dev/null
        source "${PROJECT_ROOT}/infra/docker/compose/.env"
    else
        log ERROR "Файл .env не найден!"
        exit 1
    fi
}

# Функция проверки доступности сервисов
check_service_health() {
    local service_name="$1"
    local max_attempts=10
    local attempt=1
    
    log INFO "Проверка здоровья сервиса $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        local container_id
        container_id=$(docker compose -f "$COMPOSE_FILE" ps -q "$service_name" 2>/dev/null || echo "")
        
        if [ -n "$container_id" ]; then
            local health_status
            health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_id" 2>/dev/null || echo "none")
            
            if [ "$health_status" = "healthy" ] || [ "$health_status" = "none" ]; then
                if docker exec "$container_id" echo "test" >/dev/null 2>&1; then
                    log INFO "✅ Сервис $service_name готов"
                    return 0
                fi
            fi
        fi
        
        log WARN "⏳ Сервис $service_name не готов (попытка $attempt/$max_attempts)..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log ERROR "❌ Сервис $service_name недоступен после $max_attempts попыток"
    return 1
}

# Функция backup PostgreSQL
backup_postgresql() {
    log INFO "========== Backup PostgreSQL =========="
    
    local pg_container
    pg_container=$(docker compose -f "$COMPOSE_FILE" ps -q postgres 2>/dev/null || echo "")
    
    if [ -z "$pg_container" ]; then
        log WARN "PostgreSQL контейнер не найден, пропускаем..."
        return 0
    fi
    
    if ! check_service_health "postgres"; then
        log ERROR "PostgreSQL не готов для backup"
        return 1
    fi
    
    local backup_file="$BACKUP_DIR/postgres_${BACKUP_DATE}.sql.gz"
    
    log INFO "Создание backup PostgreSQL..."
    
    if docker exec "$pg_container" pg_dumpall -U postgres | gzip > "$backup_file" && [ -f "$backup_file" ]; then
        local backup_size
        backup_size=$(du -h "$backup_file" | cut -f1)
        log INFO "✅ PostgreSQL backup создан: $backup_file ($backup_size)"
        return 0
    else
        log ERROR "❌ Ошибка создания PostgreSQL backup"
        return 1
    fi
}

# Функция backup Elasticsearch
backup_elasticsearch() {
    log INFO "========== Backup Elasticsearch =========="
    
    local es_container
    es_container=$(docker compose -f "$COMPOSE_FILE" ps -q elasticsearch 2>/dev/null || echo "")
    
    if [ -z "$es_container" ]; then
        log WARN "Elasticsearch контейнер не найден, пропускаем..."
        return 0
    fi
    
    if ! check_service_health "elasticsearch"; then
        log ERROR "Elasticsearch не готов для backup"
        return 1
    fi
    
    local backup_file="$BACKUP_DIR/elasticsearch_${BACKUP_DATE}.tar.gz"
    
    log INFO "Создание backup Elasticsearch данных..."
    
    if docker exec "$es_container" tar czf - /usr/share/elasticsearch/data > "$backup_file" && [ -f "$backup_file" ]; then
        local backup_size
        backup_size=$(du -h "$backup_file" | cut -f1)
        log INFO "✅ Elasticsearch backup создан: $backup_file ($backup_size)"
        return 0
    else
        log ERROR "❌ Ошибка создания Elasticsearch backup"
        return 1
    fi
}

# Функция backup конфигураций
backup_configs() {
    log INFO "========== Backup конфигураций =========="
    
    local config_backup_file="$BACKUP_DIR/configs_${BACKUP_DATE}.tar.gz"
    
    local config_dirs=(
        "infra/docker"
        "infra/monitoring"
        "infra/scripts"
        ".githooks"
    )
    
    local config_files=(
        ".env.example"
        "run.sh"
        "DEVELOPMENT_SETUP.md"
    )
    
    cd "$PROJECT_ROOT"
    
    # Создаем временный список файлов для backup
    local temp_list
    temp_list=$(mktemp)
    
    # Добавляем директории
    for dir in "${config_dirs[@]}"; do
        if [ -d "$dir" ]; then
            echo "$dir" >> "$temp_list"
        fi
    done
    
    # Добавляем файлы
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            echo "$file" >> "$temp_list"
        fi
    done
    
    if [ -s "$temp_list" ]; then
        tar czf "$config_backup_file" -T "$temp_list"
        rm -f "$temp_list"
        
        if [ -f "$config_backup_file" ]; then
            local backup_size
            backup_size=$(du -h "$config_backup_file" | cut -f1)
            log INFO "✅ Конфигурации backup создан: $config_backup_file ($backup_size)"
            return 0
        fi
    fi
    
    log ERROR "❌ Ошибка создания backup конфигураций"
    rm -f "$temp_list"
    return 1
}

# Функция backup Docker volumes
backup_volumes() {
    log INFO "========== Backup Docker Volumes =========="
    
    local volumes_backup_file="$BACKUP_DIR/volumes_${BACKUP_DATE}.tar.gz"
    
    # Получаем список volumes для проекта
    local project_volumes
    project_volumes=$(docker volume ls --filter "name=$(basename "$PROJECT_ROOT")" -q)
    
    if [ -z "$project_volumes" ]; then
        log WARN "Docker volumes не найдены, пропускаем..."
        return 0
    fi
    
    log INFO "Создание backup Docker volumes..."
    
    # Создаем временный контейнер для backup
    docker run --rm \
        $(echo "$project_volumes" | sed 's/^/-v /' | sed 's/$/:\\/backup\\/&:ro/' | tr '\n' ' ') \
        -v "$BACKUP_DIR:/host_backup" \
        alpine:latest \
        tar czf "/host_backup/volumes_${BACKUP_DATE}.tar.gz" -C /backup .
    
    if [ -f "$volumes_backup_file" ]; then
        local backup_size
        backup_size=$(du -h "$volumes_backup_file" | cut -f1)
        log INFO "✅ Docker volumes backup создан: $volumes_backup_file ($backup_size)"
        return 0
    else
        log ERROR "❌ Ошибка создания backup Docker volumes"
        return 1
    fi
}

# Функция restore PostgreSQL
restore_postgresql() {
    local backup_file="$1"
    
    log INFO "========== Restore PostgreSQL =========="
    
    if [ ! -f "$backup_file" ]; then
        log ERROR "Backup файл не найден: $backup_file"
        return 1
    fi
    
    local pg_container
    pg_container=$(docker compose -f "$COMPOSE_FILE" ps -q postgres 2>/dev/null || echo "")
    
    if [ -z "$pg_container" ]; then
        log ERROR "PostgreSQL контейнер не найден"
        return 1
    fi
    
    if ! check_service_health "postgres"; then
        log ERROR "PostgreSQL не готов для restore"
        return 1
    fi
    
    log WARN "⚠️ Это удалит все текущие данные PostgreSQL!"
    read -p "Продолжить restore? [y/N]: " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log INFO "Restore отменен"
        return 0
    fi
    
    log INFO "Восстановление PostgreSQL из $backup_file..."
    
    # Останавливаем подключения и восстанавливаем
    if zcat "$backup_file" | docker exec -i "$pg_container" psql -U postgres; then
        log INFO "✅ PostgreSQL restore завершен успешно"
        return 0
    else
        log ERROR "❌ Ошибка restore PostgreSQL"
        return 1
    fi
}

# Функция restore Elasticsearch
restore_elasticsearch() {
    local backup_file="$1"
    
    log INFO "========== Restore Elasticsearch =========="
    
    if [ ! -f "$backup_file" ]; then
        log ERROR "Backup файл не найден: $backup_file"
        return 1
    fi
    
    local es_container
    es_container=$(docker compose -f "$COMPOSE_FILE" ps -q elasticsearch 2>/dev/null || echo "")
    
    if [ -z "$es_container" ]; then
        log ERROR "Elasticsearch контейнер не найден"
        return 1
    fi
    
    log WARN "⚠️ Это удалит все текущие данные Elasticsearch!"
    read -p "Продолжить restore? [y/N]: " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log INFO "Restore отменен"
        return 0
    fi
    
    log INFO "Восстановление Elasticsearch из $backup_file..."
    
    # Останавливаем Elasticsearch, восстанавливаем данные и запускаем
    docker compose -f "$COMPOSE_FILE" stop elasticsearch
    docker exec -i "$es_container" tar xzf - -C / < "$backup_file"
    docker compose -f "$COMPOSE_FILE" start elasticsearch
    
    if check_service_health "elasticsearch"; then
        log INFO "✅ Elasticsearch restore завершен успешно"
        return 0
    else
        log ERROR "❌ Ошибка restore Elasticsearch"
        return 1
    fi
}

# Функция очистки старых backup'ов
cleanup_old_backups() {
    log INFO "========== Очистка старых backup'ов =========="
    
    log INFO "Удаление backup'ов старше $RETENTION_DAYS дней..."
    
    local deleted_count=0
    find "$BACKUP_DIR" -name "*.gz" -type f -mtime +"${RETENTION_DAYS}" -print0 | \
    while IFS= read -r -d '' file; do
        log INFO "Удаляем старый backup: $(basename "$file")"
        rm -f "$file"
        deleted_count=$((deleted_count + 1))
    done
    
    log INFO "✅ Очистка завершена"
}

# Функция создания полного backup'а
create_full_backup() {
    log INFO "🚀 Начинаем полное резервное копирование AquaStream"
    log INFO "📂 Backup директория: $BACKUP_DIR"
    echo
    
    load_env
    
    local total_errors=0
    
    # PostgreSQL backup
    if ! backup_postgresql; then
        total_errors=$((total_errors + 1))
    fi
    echo
    
    # Elasticsearch backup
    if ! backup_elasticsearch; then
        total_errors=$((total_errors + 1))
    fi
    echo
    
    # Конфигурации backup
    if ! backup_configs; then
        total_errors=$((total_errors + 1))
    fi
    echo
    
    # Docker volumes backup
    if ! backup_volumes; then
        total_errors=$((total_errors + 1))
    fi
    echo
    
    # Очистка старых backup'ов
    cleanup_old_backups
    echo
    
    # Создаем сводный манифест
    local manifest_file="$BACKUP_DIR/manifest_${BACKUP_DATE}.txt"
    cat > "$manifest_file" << EOF
AquaStream Backup Manifest
=========================
Дата создания: $(date)
Проект: $PROJECT_ROOT

Файлы backup'а:
$(ls -la "$BACKUP_DIR"/*_"${BACKUP_DATE}".* 2>/dev/null || echo "Нет файлов backup'а")

Размер backup'а:
$(du -sh "$BACKUP_DIR" | cut -f1)

Статус backup'а: $(if [ $total_errors -eq 0 ]; then echo "SUCCESS"; else echo "ERRORS: $total_errors"; fi)
EOF
    
    log INFO "📋 Манифест создан: $manifest_file"
    echo
    
    if [ $total_errors -eq 0 ]; then
        log INFO "🎉 Полное резервное копирование завершено успешно!"
        log INFO "📦 Backup файлы находятся в: $BACKUP_DIR"
        return 0
    else
        log ERROR "❌ Резервное копирование завершено с $total_errors ошибками"
        return 1
    fi
}

# Функция restore из backup'а
restore_from_backup() {
    local backup_date="$1"
    
    log INFO "🔄 Начинаем восстановление AquaStream"
    log INFO "📂 Backup дата: $backup_date"
    echo
    
    load_env
    
    # Проверяем наличие backup файлов
    local postgres_backup="$BACKUP_DIR/postgres_${backup_date}.sql.gz"
    local es_backup="$BACKUP_DIR/elasticsearch_${backup_date}.tar.gz"
    local configs_backup="$BACKUP_DIR/configs_${backup_date}.tar.gz"
    local volumes_backup="$BACKUP_DIR/volumes_${backup_date}.tar.gz"
    
    local available_backups=()
    
    if [ -f "$postgres_backup" ]; then
        available_backups+=("postgresql")
    fi
    
    if [ -f "$es_backup" ]; then
        available_backups+=("elasticsearch")
    fi
    
    if [ -f "$configs_backup" ]; then
        available_backups+=("configs")
    fi
    
    if [ -f "$volumes_backup" ]; then
        available_backups+=("volumes")
    fi
    
    if [ ${#available_backups[@]} -eq 0 ]; then
        log ERROR "Backup файлы для даты $backup_date не найдены"
        return 1
    fi
    
    log INFO "Доступные backup'ы: ${available_backups[*]}"
    echo
    
    local total_errors=0
    
    # PostgreSQL restore
    if [[ " ${available_backups[*]} " =~ " postgresql " ]]; then
        if ! restore_postgresql "$postgres_backup"; then
            total_errors=$((total_errors + 1))
        fi
        echo
    fi
    
    # Elasticsearch restore
    if [[ " ${available_backups[*]} " =~ " elasticsearch " ]]; then
        if ! restore_elasticsearch "$es_backup"; then
            total_errors=$((total_errors + 1))
        fi
        echo
    fi
    
    if [ $total_errors -eq 0 ]; then
        log INFO "🎉 Восстановление завершено успешно!"
        return 0
    else
        log ERROR "❌ Восстановление завершено с $total_errors ошибками"
        return 1
    fi
}

# Функция отображения справки
show_help() {
    echo "AquaStream Backup & Restore Tool"
    echo "================================"
    echo ""
    echo "Использование: $0 <command> [options]"
    echo ""
    echo "Команды:"
    echo "  backup                    Полное резервное копирование"
    echo "  restore <date>            Восстановление из backup'а"
    echo "  list                      Список доступных backup'ов"
    echo "  cleanup                   Очистка старых backup'ов"
    echo ""
    echo "Опции:"
    echo "  --help, -h               Показать эту справку"
    echo ""
    echo "Переменные окружения:"
    echo "  BACKUP_DIR               Директория для backup'ов (по умолчанию: ./backups)"
    echo "  RETENTION_DAYS           Количество дней хранения (по умолчанию: 30)"
    echo ""
    echo "Примеры:"
    echo "  $0 backup                Создать полный backup"
    echo "  $0 list                  Показать доступные backup'ы"
    echo "  $0 restore 20231201_143022  Восстановить backup от указанной даты"
    echo ""
}

# Функция списка доступных backup'ов
list_backups() {
    log INFO "📋 Доступные backup'ы в $BACKUP_DIR:"
    echo
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        log WARN "Backup'ы не найдены"
        return 0
    fi
    
    # Группируем backup'ы по дате
    local backup_dates
    backup_dates=$(find "$BACKUP_DIR" -name "*.gz" -type f -exec basename {} \; 2>/dev/null | sed 's/.*_\([0-9]\{8\}_[0-9]\{6\}\)\..*$/\1/' | sort -u)
    
    for date in $backup_dates; do
        echo "📅 Backup: $date"
        
        local postgres_file="$BACKUP_DIR/postgres_${date}.sql.gz"
        local es_file="$BACKUP_DIR/elasticsearch_${date}.tar.gz"
        local configs_file="$BACKUP_DIR/configs_${date}.tar.gz"
        local volumes_file="$BACKUP_DIR/volumes_${date}.tar.gz"
        
        if [ -f "$postgres_file" ]; then
            echo "   ✅ PostgreSQL: $(du -h "$postgres_file" | cut -f1)"
        fi
        
        if [ -f "$es_file" ]; then
            echo "   ✅ Elasticsearch: $(du -h "$es_file" | cut -f1)"
        fi
        
        if [ -f "$configs_file" ]; then
            echo "   ✅ Конфигурации: $(du -h "$configs_file" | cut -f1)"
        fi
        
        if [ -f "$volumes_file" ]; then
            echo "   ✅ Docker Volumes: $(du -h "$volumes_file" | cut -f1)"
        fi
        
        echo
    done
    
    local total_size
    total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    log INFO "📊 Общий размер backup'ов: $total_size"
}

# Основная функция
main() {
    case "${1:-}" in
        "backup")
            create_full_backup
            ;;
        "restore")
            if [ -z "${2:-}" ]; then
                log ERROR "Укажите дату backup'а для восстановления"
                log INFO "Используйте '$0 list' для просмотра доступных backup'ов"
                exit 1
            fi
            restore_from_backup "$2"
            ;;
        "list")
            list_backups
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "--help"|"-h"|"help")
            show_help
            ;;
        "")
            log ERROR "Укажите команду"
            show_help
            exit 1
            ;;
        *)
            log ERROR "Неизвестная команда: $1"
            show_help
            exit 1
            ;;
    esac
}

# Запуск основной функции
main "$@"