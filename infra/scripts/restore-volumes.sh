#!/bin/bash
set -euo pipefail

# Скрипт для восстановления persistent volumes AquaStream
# Восстанавливает данные из резервных копий

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
COMPOSE_FILE="${PROJECT_ROOT}/infra/docker/compose/docker-compose.yml"

# Загружаем переменные окружения
if [ -f "${PROJECT_ROOT}/infra/docker/compose/.env" ]; then
    source "${PROJECT_ROOT}/infra/docker/compose/.env"
else
    log ERROR "Файл .env не найден!"
    exit 1
fi

# Функция подтверждения действия
confirm_action() {
    local message="$1"
    log WARN "⚠️ $message"
    read -p "Продолжить? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log INFO "Операция отменена пользователем"
        exit 0
    fi
}

# Остановка сервисов перед восстановлением
stop_services() {
    local services=("$@")
    
    log INFO "Остановка сервисов: ${services[*]}"
    
    for service in "${services[@]}"; do
        if docker compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
            docker compose -f "$COMPOSE_FILE" stop "$service"
            log INFO "✅ Сервис $service остановлен"
        else
            log INFO "ℹ️ Сервис $service уже остановлен"
        fi
    done
}

# Запуск сервисов после восстановления
start_services() {
    local services=("$@")
    
    log INFO "Запуск сервисов: ${services[*]}"
    
    for service in "${services[@]}"; do
        docker compose -f "$COMPOSE_FILE" start "$service"
        log INFO "✅ Сервис $service запущен"
    done
    
    # Ждем готовности сервисов
    sleep 10
    for service in "${services[@]}"; do
        log INFO "Проверка здоровья сервиса $service..."
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if docker compose -f "$COMPOSE_FILE" ps "$service" | grep -q "healthy\|Up"; then
                log INFO "✅ Сервис $service готов"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                log WARN "⚠️ Сервис $service не готов после $max_attempts попыток"
            fi
            
            sleep 5
            attempt=$((attempt + 1))
        done
    done
}

# Восстановление PostgreSQL
restore_postgresql() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log ERROR "❌ Файл бэкапа не найден: $backup_file"
        exit 1
    fi
    
    log INFO "=== Восстановление PostgreSQL из $backup_file ==="
    
    confirm_action "Это действие полностью перезапишет все данные PostgreSQL!"
    
    # Останавливаем зависимые сервисы
    stop_services "user-service" "crew-service" "notification-service" "api-gateway"
    
    # Останавливаем PostgreSQL
    stop_services "postgres"
    
    # Удаляем старые данные
    log INFO "Удаление старых данных PostgreSQL..."
    docker volume rm aquastream_postgres_data 2>/dev/null || true
    docker volume create aquastream_postgres_data
    
    # Запускаем PostgreSQL
    start_services "postgres"
    
    # Восстанавливаем данные
    log INFO "Восстановление данных из бэкапа..."
    
    if [[ "$backup_file" == *.gz ]]; then
        # Сжатый файл
        zcat "$backup_file" | docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres
    else
        # Обычный SQL файл
        docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres < "$backup_file"
    fi
    
    if [ $? -eq 0 ]; then
        log INFO "✅ PostgreSQL восстановлен успешно"
        
        # Запускаем зависимые сервисы
        start_services "user-service" "crew-service" "notification-service" "api-gateway"
        
        return 0
    else
        log ERROR "❌ Ошибка восстановления PostgreSQL"
        return 1
    fi
}

# Восстановление Elasticsearch
restore_elasticsearch() {
    local snapshot_dir="$1"
    
    if [ ! -d "$snapshot_dir" ]; then
        log ERROR "❌ Директория snapshot не найдена: $snapshot_dir"
        exit 1
    fi
    
    log INFO "=== Восстановление Elasticsearch из $snapshot_dir ==="
    
    confirm_action "Это действие перезапишет индексы Elasticsearch!"
    
    # Останавливаем зависимые сервисы
    stop_services "logstash" "kibana"
    
    # Останавливаем Elasticsearch
    stop_services "elasticsearch"
    
    # Копируем snapshot данные в контейнер
    log INFO "Копирование snapshot данных..."
    
    # Создаем временный контейнер для копирования
    docker run --rm \
        -v aquastream_elasticsearch_data:/usr/share/elasticsearch/data \
        -v "$snapshot_dir:/snapshot:ro" \
        alpine:latest \
        sh -c "mkdir -p /usr/share/elasticsearch/backup && cp -r /snapshot/* /usr/share/elasticsearch/backup/"
    
    # Запускаем Elasticsearch
    start_services "elasticsearch"
    
    # Ждем готовности Elasticsearch
    log INFO "Ожидание готовности Elasticsearch..."
    sleep 30
    
    # Восстанавливаем snapshot
    log INFO "Восстановление snapshot..."
    
    # Регистрируем repository
    docker compose -f "$COMPOSE_FILE" exec -T elasticsearch curl -s -k \
        --cacert config/certs/ca/ca.crt \
        -u "elastic:${ELASTIC_PASSWORD}" \
        -X PUT "https://localhost:9200/_snapshot/restore_repo" \
        -H "Content-Type: application/json" \
        -d '{
            "type": "fs",
            "settings": {
                "location": "/usr/share/elasticsearch/backup",
                "compress": true
            }
        }'
    
    # Получаем список доступных snapshots
    local snapshots_response
    snapshots_response=$(docker compose -f "$COMPOSE_FILE" exec -T elasticsearch curl -s -k \
        --cacert config/certs/ca/ca.crt \
        -u "elastic:${ELASTIC_PASSWORD}" \
        "https://localhost:9200/_snapshot/restore_repo/_all")
    
    # Находим последний snapshot
    local snapshot_name
    snapshot_name=$(echo "$snapshots_response" | grep -o '"snapshot":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$snapshot_name" ]; then
        log ERROR "❌ Не найдено snapshots для восстановления"
        return 1
    fi
    
    log INFO "Восстанавливаем snapshot: $snapshot_name"
    
    # Восстанавливаем snapshot
    local restore_response
    restore_response=$(docker compose -f "$COMPOSE_FILE" exec -T elasticsearch curl -s -k \
        --cacert config/certs/ca/ca.crt \
        -u "elastic:${ELASTIC_PASSWORD}" \
        -X POST "https://localhost:9200/_snapshot/restore_repo/${snapshot_name}/_restore" \
        -H "Content-Type: application/json" \
        -d '{
            "ignore_unavailable": true,
            "include_global_state": false
        }')
    
    if echo "$restore_response" | grep -q '"accepted":true'; then
        log INFO "✅ Elasticsearch восстановление запущено"
        
        # Запускаем зависимые сервисы
        start_services "logstash" "kibana"
        
        return 0
    else
        log ERROR "❌ Ошибка восстановления Elasticsearch: $restore_response"
        return 1
    fi
}

# Восстановление конфигураций
restore_configs() {
    local config_archive="$1"
    
    if [ ! -f "$config_archive" ]; then
        log ERROR "❌ Архив конфигураций не найден: $config_archive"
        exit 1
    fi
    
    log INFO "=== Восстановление конфигураций из $config_archive ==="
    
    confirm_action "Это действие перезапишет текущие конфигурационные файлы!"
    
    # Создаем резервную копию текущих конфигураций
    local backup_current="${PROJECT_ROOT}/config_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_current"
    
    log INFO "Создание резервной копии текущих конфигураций в $backup_current"
    cp -r "${PROJECT_ROOT}/infra" "$backup_current/" 2>/dev/null || true
    cp "${PROJECT_ROOT}/run.sh" "$backup_current/" 2>/dev/null || true
    
    # Извлекаем архив
    log INFO "Извлечение конфигураций..."
    
    local temp_dir=$(mktemp -d)
    tar -xzf "$config_archive" -C "$temp_dir"
    
    # Восстанавливаем файлы
    if [ -f "$temp_dir/docker-compose.yml" ]; then
        cp "$temp_dir/docker-compose.yml" "${PROJECT_ROOT}/infra/docker/compose/"
        log INFO "✅ docker-compose.yml восстановлен"
    fi
    
    if [ -f "$temp_dir/.env" ]; then
        cp "$temp_dir/.env" "${PROJECT_ROOT}/infra/docker/compose/"
        log INFO "✅ .env восстановлен"
    fi
    
    if [ -d "$temp_dir/monitoring" ]; then
        cp -r "$temp_dir/monitoring" "${PROJECT_ROOT}/infra/"
        log INFO "✅ Конфигурации мониторинга восстановлены"
    fi
    
    if [ -d "$temp_dir/scripts" ]; then
        cp -r "$temp_dir/scripts" "${PROJECT_ROOT}/infra/"
        log INFO "✅ Скрипты восстановлены"
    fi
    
    if [ -f "$temp_dir/run.sh" ]; then
        cp "$temp_dir/run.sh" "${PROJECT_ROOT}/"
        chmod +x "${PROJECT_ROOT}/run.sh"
        log INFO "✅ run.sh восстановлен"
    fi
    
    # Удаляем временную директорию
    rm -rf "$temp_dir"
    
    log INFO "✅ Конфигурации восстановлены"
    log INFO "📋 Резервная копия предыдущих конфигураций: $backup_current"
}

# Восстановление Docker volume
restore_docker_volume() {
    local volume_name="$1"
    local archive_file="$2"
    
    if [ ! -f "$archive_file" ]; then
        log ERROR "❌ Архив volume не найден: $archive_file"
        exit 1
    fi
    
    log INFO "=== Восстановление Docker volume $volume_name из $archive_file ==="
    
    confirm_action "Это действие полностью перезапишет volume $volume_name!"
    
    local full_volume_name="aquastream_${volume_name}"
    
    # Останавливаем сервисы, использующие этот volume
    case "$volume_name" in
        "postgres_data")
            stop_services "postgres" "user-service" "crew-service" "notification-service"
            ;;
        "elasticsearch_data")
            stop_services "elasticsearch" "logstash" "kibana"
            ;;
        "kafka_data")
            stop_services "kafka" "user-service" "crew-service" "event-service" "notification-service"
            ;;
        "zookeeper_data")
            stop_services "zookeeper" "kafka"
            ;;
    esac
    
    # Удаляем старый volume
    log INFO "Удаление старого volume..."
    docker volume rm "$full_volume_name" 2>/dev/null || true
    docker volume create "$full_volume_name"
    
    # Восстанавливаем данные
    log INFO "Восстановление данных из архива..."
    docker run --rm \
        -v "${full_volume_name}:/volume" \
        -v "$(dirname "$archive_file"):/backup:ro" \
        alpine:latest \
        tar -xzf "/backup/$(basename "$archive_file")" -C /volume
    
    if [ $? -eq 0 ]; then
        log INFO "✅ Volume $volume_name восстановлен успешно"
        
        # Запускаем соответствующие сервисы
        case "$volume_name" in
            "postgres_data")
                start_services "postgres" "user-service" "crew-service" "notification-service"
                ;;
            "elasticsearch_data")
                start_services "elasticsearch" "logstash" "kibana"
                ;;
            "kafka_data")
                start_services "kafka" "user-service" "crew-service" "event-service" "notification-service"
                ;;
            "zookeeper_data")
                start_services "zookeeper" "kafka"
                ;;
        esac
        
        return 0
    else
        log ERROR "❌ Ошибка восстановления volume $volume_name"
        return 1
    fi
}

# Показать доступные бэкапы
list_backups() {
    log INFO "=== Доступные бэкапы в $BACKUP_DIR ==="
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log WARN "⚠️ Директория бэкапов не найдена: $BACKUP_DIR"
        return 1
    fi
    
    echo
    log INFO "📊 PostgreSQL бэкапы:"
    find "$BACKUP_DIR" -name "postgres_backup_*.sql.gz" -exec ls -lh {} \; 2>/dev/null || echo "  Не найдено"
    
    echo
    log INFO "🔍 Elasticsearch бэкапы:"
    find "$BACKUP_DIR" -name "elasticsearch_*" -type d -exec ls -ld {} \; 2>/dev/null || echo "  Не найдено"
    
    echo
    log INFO "⚙️ Конфигурации:"
    find "$BACKUP_DIR" -name "configs_*.tar.gz" -exec ls -lh {} \; 2>/dev/null || echo "  Не найдено"
    
    echo
    log INFO "📦 Docker volumes:"
    find "$BACKUP_DIR" -name "volumes_*" -type d -exec ls -ld {} \; 2>/dev/null || echo "  Не найдено"
    
    echo
    log INFO "📋 Отчеты:"
    find "$BACKUP_DIR" -name "backup_report_*.txt" -exec ls -lh {} \; 2>/dev/null || echo "  Не найдено"
}

# Функция помощи
show_help() {
    echo "AquaStream Volume Restore Script"
    echo "==============================="
    echo ""
    echo "Использование: $0 <команда> [параметры]"
    echo ""
    echo "Команды:"
    echo "  --postgres <backup_file>           Восстановить PostgreSQL из SQL дампа"
    echo "  --elasticsearch <snapshot_dir>     Восстановить Elasticsearch из snapshot"
    echo "  --configs <archive_file>           Восстановить конфигурации из архива"
    echo "  --volume <volume_name> <archive>   Восстановить Docker volume"
    echo "  --list                             Показать доступные бэкапы"
    echo "  --help                             Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 --postgres /path/to/postgres_backup_20240802_120000.sql.gz"
    echo "  $0 --elasticsearch /path/to/elasticsearch_20240802_120000/"
    echo "  $0 --configs /path/to/configs_20240802_120000.tar.gz"
    echo "  $0 --volume postgres_data /path/to/postgres_data.tar.gz"
    echo "  $0 --list"
    echo ""
    echo "Переменные окружения:"
    echo "  BACKUP_DIR                         Директория с бэкапами (по умолчанию: ./backups)"
    echo ""
    echo "⚠️ ВНИМАНИЕ: Все операции восстановления перезаписывают существующие данные!"
}

# Основная логика
case "${1:-}" in
    "--postgres")
        if [ -z "${2:-}" ]; then
            log ERROR "Необходимо указать файл бэкапа PostgreSQL"
            exit 1
        fi
        restore_postgresql "$2"
        ;;
    "--elasticsearch")
        if [ -z "${2:-}" ]; then
            log ERROR "Необходимо указать директорию snapshot Elasticsearch"
            exit 1
        fi
        restore_elasticsearch "$2"
        ;;
    "--configs")
        if [ -z "${2:-}" ]; then
            log ERROR "Необходимо указать архив конфигураций"
            exit 1
        fi
        restore_configs "$2"
        ;;
    "--volume")
        if [ -z "${2:-}" ] || [ -z "${3:-}" ]; then
            log ERROR "Необходимо указать имя volume и путь к архиву"
            log ERROR "Пример: $0 --volume postgres_data /path/to/archive.tar.gz"
            exit 1
        fi
        restore_docker_volume "$2" "$3"
        ;;
    "--list")
        list_backups
        ;;
    "--help"|"-h"|"")
        show_help
        ;;
    *)
        log ERROR "Неизвестная команда: $1"
        echo ""
        show_help
        exit 1
        ;;
esac