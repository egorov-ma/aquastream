#!/bin/bash
set -euo pipefail

# Скрипт для резервного копирования persistent volumes AquaStream
# Создает резервные копии PostgreSQL, Elasticsearch, и других критичных данных

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
if [ -f "${PROJECT_ROOT}/infra/docker/compose/.env" ]; then
    source "${PROJECT_ROOT}/infra/docker/compose/.env"
else
    log ERROR "Файл .env не найден!"
    exit 1
fi

# Функция проверки доступности сервисов
check_service_health() {
    local service_name="$1"
    local max_attempts=10
    local attempt=1
    
    log INFO "Проверка здоровья сервиса $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose -f "$COMPOSE_FILE" ps "$service_name" | grep -q "healthy\|Up"; then
            log INFO "✅ Сервис $service_name готов"
            return 0
        fi
        
        log WARN "Сервис $service_name не готов (попытка $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log ERROR "❌ Сервис $service_name недоступен после $max_attempts попыток"
    return 1
}

# Резервное копирование PostgreSQL
backup_postgresql() {
    log INFO "=== Резервное копирование PostgreSQL ==="
    
    local backup_file="${BACKUP_DIR}/postgres_backup_${BACKUP_DATE}.sql.gz"
    
    if ! check_service_health "postgres"; then
        log ERROR "PostgreSQL недоступен, пропускаем бэкап"
        return 1
    fi
    
    log INFO "Создание SQL дампа PostgreSQL..."
    
    # Создаем полный дамп базы данных
    docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dumpall -U postgres | gzip > "$backup_file"
    
    if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log INFO "✅ PostgreSQL бэкап создан: $backup_file (размер: $size)"
        
        # Создаем дополнительный дамп только схемы для быстрого восстановления структуры
        local schema_file="${BACKUP_DIR}/postgres_schema_${BACKUP_DATE}.sql"
        docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dumpall -U postgres --schema-only > "$schema_file"
        log INFO "✅ Схема PostgreSQL сохранена: $schema_file"
        
        return 0
    else
        log ERROR "❌ Ошибка создания PostgreSQL бэкапа"
        return 1
    fi
}

# Резервное копирование Elasticsearch
backup_elasticsearch() {
    log INFO "=== Резервное копирование Elasticsearch ==="
    
    if ! check_service_health "elasticsearch"; then
        log ERROR "Elasticsearch недоступен, пропускаем бэкап"
        return 1
    fi
    
    local es_backup_dir="${BACKUP_DIR}/elasticsearch_${BACKUP_DATE}"
    mkdir -p "$es_backup_dir"
    
    # Создаем snapshot через Elasticsearch API
    log INFO "Создание снимка Elasticsearch данных..."
    
    # Регистрируем snapshot repository
    local repo_response
    repo_response=$(docker compose -f "$COMPOSE_FILE" exec -T elasticsearch curl -s -k \
        --cacert config/certs/ca/ca.crt \
        -u "elastic:${ELASTIC_PASSWORD}" \
        -X PUT "https://localhost:9200/_snapshot/backup_repo" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"fs\",
            \"settings\": {
                \"location\": \"/usr/share/elasticsearch/backup\",
                \"compress\": true
            }
        }")
    
    if echo "$repo_response" | grep -q '"acknowledged":true'; then
        log INFO "✅ Snapshot repository зарегистрирован"
    else
        log WARN "⚠️ Repository уже существует или произошла ошибка: $repo_response"
    fi
    
    # Создаем snapshot всех индексов
    local snapshot_name="snapshot_${BACKUP_DATE}"
    local snapshot_response
    snapshot_response=$(docker compose -f "$COMPOSE_FILE" exec -T elasticsearch curl -s -k \
        --cacert config/certs/ca/ca.crt \
        -u "elastic:${ELASTIC_PASSWORD}" \
        -X PUT "https://localhost:9200/_snapshot/backup_repo/${snapshot_name}" \
        -H "Content-Type: application/json" \
        -d "{
            \"indices\": \"aquastream-*\",
            \"ignore_unavailable\": true,
            \"include_global_state\": false,
            \"metadata\": {
                \"taken_by\": \"backup-script\",
                \"taken_because\": \"scheduled backup\"
            }
        }")
    
    # Ждем завершения snapshot
    log INFO "Ожидание завершения snapshot..."
    local max_wait=300  # 5 минут
    local elapsed=0
    
    while [ $elapsed -lt $max_wait ]; do
        local status_response
        status_response=$(docker compose -f "$COMPOSE_FILE" exec -T elasticsearch curl -s -k \
            --cacert config/certs/ca/ca.crt \
            -u "elastic:${ELASTIC_PASSWORD}" \
            "https://localhost:9200/_snapshot/backup_repo/${snapshot_name}")
        
        if echo "$status_response" | grep -q '"state":"SUCCESS"'; then
            log INFO "✅ Elasticsearch snapshot создан успешно"
            
            # Копируем snapshot данные из контейнера
            docker cp "$(docker compose -f "$COMPOSE_FILE" ps -q elasticsearch):/usr/share/elasticsearch/backup/." "$es_backup_dir/"
            
            if [ -d "$es_backup_dir" ] && [ "$(ls -A "$es_backup_dir")" ]; then
                local size=$(du -sh "$es_backup_dir" | cut -f1)
                log INFO "✅ Elasticsearch данные скопированы: $es_backup_dir (размер: $size)"
                return 0
            else
                log ERROR "❌ Ошибка копирования Elasticsearch данных"
                return 1
            fi
        elif echo "$status_response" | grep -q '"state":"FAILED"'; then
            log ERROR "❌ Elasticsearch snapshot завершился с ошибкой: $status_response"
            return 1
        fi
        
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    log ERROR "❌ Timeout ожидания завершения Elasticsearch snapshot"
    return 1
}

# Резервное копирование конфигурационных файлов
backup_configs() {
    log INFO "=== Резервное копирование конфигураций ==="
    
    local config_backup_dir="${BACKUP_DIR}/configs_${BACKUP_DATE}"
    mkdir -p "$config_backup_dir"
    
    # Копируем критичные конфигурационные файлы
    local configs=(
        "${PROJECT_ROOT}/infra/docker/compose/docker-compose.yml"
        "${PROJECT_ROOT}/infra/docker/compose/.env"
        "${PROJECT_ROOT}/infra/monitoring"
        "${PROJECT_ROOT}/infra/scripts"
        "${PROJECT_ROOT}/run.sh"
    )
    
    for config in "${configs[@]}"; do
        if [ -e "$config" ]; then
            cp -r "$config" "$config_backup_dir/"
            log INFO "✅ Скопирован: $(basename "$config")"
        else
            log WARN "⚠️ Не найден: $config"
        fi
    done
    
    # Создаем архив конфигураций
    local config_archive="${BACKUP_DIR}/configs_${BACKUP_DATE}.tar.gz"
    tar -czf "$config_archive" -C "$config_backup_dir" .
    rm -rf "$config_backup_dir"
    
    local size=$(du -h "$config_archive" | cut -f1)
    log INFO "✅ Архив конфигураций создан: $config_archive (размер: $size)"
}

# Резервное копирование Docker volumes
backup_docker_volumes() {
    log INFO "=== Резервное копирование Docker volumes ==="
    
    local volumes_backup_dir="${BACKUP_DIR}/volumes_${BACKUP_DATE}"
    mkdir -p "$volumes_backup_dir"
    
    # Список критичных volumes
    local volumes=(
        "postgres_data"
        "elasticsearch_data"
        "elasticsearch_certs"
        "zookeeper_data"
        "kafka_data"
        "nginx_logs"
    )
    
    for volume in "${volumes[@]}"; do
        local volume_full_name="aquastream_${volume}"
        
        if docker volume ls | grep -q "$volume_full_name"; then
            log INFO "Копирование volume: $volume"
            
            # Создаем временный контейнер для копирования данных volume
            local archive_name="${volumes_backup_dir}/${volume}.tar.gz"
            docker run --rm \
                -v "${volume_full_name}:/volume:ro" \
                -v "${volumes_backup_dir}:/backup" \
                alpine:latest \
                tar -czf "/backup/${volume}.tar.gz" -C /volume .
            
            if [ -f "$archive_name" ] && [ -s "$archive_name" ]; then
                local size=$(du -h "$archive_name" | cut -f1)
                log INFO "✅ Volume $volume заархивирован: $archive_name (размер: $size)"
            else
                log WARN "⚠️ Ошибка архивирования volume: $volume"
            fi
        else
            log WARN "⚠️ Volume не найден: $volume_full_name"
        fi
    done
}

# Очистка старых бэкапов
cleanup_old_backups() {
    log INFO "=== Очистка старых бэкапов (старше $RETENTION_DAYS дней) ==="
    
    local deleted_count=0
    
    # Удаляем файлы старше RETENTION_DAYS дней
    while IFS= read -r -d '' file; do
        rm "$file"
        deleted_count=$((deleted_count + 1))
        log INFO "🗑️ Удален старый бэкап: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -print0 2>/dev/null || true)
    
    # Удаляем пустые директории
    find "$BACKUP_DIR" -type d -empty -delete 2>/dev/null || true
    
    if [ $deleted_count -gt 0 ]; then
        log INFO "✅ Удалено старых бэкапов: $deleted_count"
    else
        log INFO "ℹ️ Старых бэкапов для удаления не найдено"
    fi
}

# Создание отчета о бэкапе
create_backup_report() {
    log INFO "=== Создание отчета о бэкапе ==="
    
    local report_file="${BACKUP_DIR}/backup_report_${BACKUP_DATE}.txt"
    
    cat > "$report_file" << EOF
AquaStream Backup Report
=======================
Дата создания: $(date)
Версия скрипта: 1.0
Retention период: $RETENTION_DAYS дней

СТАТУС РЕЗЕРВНОГО КОПИРОВАНИЯ:
EOF
    
    # Проверяем наличие файлов бэкапа
    local backup_files=(
        "postgres_backup_${BACKUP_DATE}.sql.gz"
        "postgres_schema_${BACKUP_DATE}.sql"
        "elasticsearch_${BACKUP_DATE}"
        "configs_${BACKUP_DATE}.tar.gz"
    )
    
    for backup_file in "${backup_files[@]}"; do
        if [ -e "${BACKUP_DIR}/${backup_file}" ]; then
            local size=$(du -sh "${BACKUP_DIR}/${backup_file}" 2>/dev/null | cut -f1 || echo "N/A")
            echo "✅ $backup_file (размер: $size)" >> "$report_file"
        else
            echo "❌ $backup_file - НЕ СОЗДАН" >> "$report_file"
        fi
    done
    
    echo "" >> "$report_file"
    echo "ИСПОЛЬЗОВАНИЕ ДИСКА:" >> "$report_file"
    df -h "$BACKUP_DIR" >> "$report_file"
    
    echo "" >> "$report_file"
    echo "ОБЩИЙ РАЗМЕР БЭКАПОВ:" >> "$report_file"
    du -sh "$BACKUP_DIR" >> "$report_file"
    
    log INFO "✅ Отчет создан: $report_file"
}

# Функция отправки уведомления (заглушка для будущего расширения)
send_notification() {
    local status="$1"
    local message="$2"
    
    # TODO: Интеграция с системами уведомлений (Slack, email, Telegram)
    log INFO "📧 Уведомление: [$status] $message"
    
    # Пример для будущей интеграции:
    # if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #         --data "{\"text\":\"AquaStream Backup [$status]: $message\"}" \
    #         "$SLACK_WEBHOOK_URL"
    # fi
}

# Основная функция
main() {
    local start_time=$(date +%s)
    local overall_status="SUCCESS"
    local failed_backups=""
    
    log INFO "🚀 Начинаем процедуру резервного копирования AquaStream"
    log INFO "📅 Дата: $BACKUP_DATE"
    log INFO "📂 Директория бэкапов: $BACKUP_DIR"
    log INFO "🕐 Retention период: $RETENTION_DAYS дней"
    echo
    
    # Проверяем доступность Docker Compose
    if ! docker compose -f "$COMPOSE_FILE" ps >/dev/null 2>&1; then
        log ERROR "❌ Docker Compose недоступен или проект не запущен"
        send_notification "FAILED" "Docker Compose недоступен"
        exit 1
    fi
    
    # Выполняем резервное копирование
    if ! backup_postgresql; then
        overall_status="PARTIAL"
        failed_backups="$failed_backups PostgreSQL"
    fi
    
    if ! backup_elasticsearch; then
        overall_status="PARTIAL"
        failed_backups="$failed_backups Elasticsearch"
    fi
    
    backup_configs
    backup_docker_volumes
    cleanup_old_backups
    create_backup_report
    
    # Подсчитываем время выполнения
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf "%02d:%02d:%02d" $((duration/3600)) $((duration%3600/60)) $((duration%60)))
    
    echo
    log INFO "🏁 Резервное копирование завершено!"
    log INFO "⏱️ Время выполнения: $duration_formatted"
    log INFO "📊 Статус: $overall_status"
    
    if [ "$overall_status" = "SUCCESS" ]; then
        log INFO "✅ Все компоненты успешно скопированы"
        send_notification "SUCCESS" "Все бэкапы созданы успешно за $duration_formatted"
    elif [ "$overall_status" = "PARTIAL" ]; then
        log WARN "⚠️ Некоторые компоненты не удалось скопировать: $failed_backups"
        send_notification "PARTIAL" "Бэкап завершен частично. Неудачи: $failed_backups"
    fi
    
    echo
    log INFO "📋 Доступные команды восстановления:"
    log INFO "  • PostgreSQL: ./restore-volumes.sh --postgres backup_file.sql.gz"
    log INFO "  • Elasticsearch: ./restore-volumes.sh --elasticsearch snapshot_dir"
    log INFO "  • Конфигурации: ./restore-volumes.sh --configs configs.tar.gz"
}

# Обработка аргументов командной строки
case "${1:-}" in
    "--help"|"-h")
        echo "Использование: $0 [опции]"
        echo ""
        echo "Опции:"
        echo "  --help, -h                 Показать эту справку"
        echo "  --dry-run                  Только показать, что будет сделано"
        echo "  --postgres-only            Только PostgreSQL бэкап"
        echo "  --elasticsearch-only       Только Elasticsearch бэкап"
        echo "  --configs-only             Только конфигурации"
        echo ""
        echo "Переменные окружения:"
        echo "  BACKUP_DIR                 Директория для бэкапов (по умолчанию: ./backups)"
        echo "  RETENTION_DAYS             Дни хранения бэкапов (по умолчанию: 30)"
        echo ""
        exit 0
        ;;
    "--dry-run")
        log INFO "🔍 DRY RUN MODE - показываем только планируемые действия"
        log INFO "📂 Директория бэкапов: $BACKUP_DIR"
        log INFO "📅 Имя бэкапа: backup_${BACKUP_DATE}"
        log INFO "🕐 Retention: $RETENTION_DAYS дней"
        log INFO "📋 Планируемые бэкапы: PostgreSQL, Elasticsearch, Конфигурации, Docker Volumes"
        exit 0
        ;;
    "--postgres-only")
        log INFO "🐘 Только PostgreSQL бэкап"
        backup_postgresql
        exit $?
        ;;
    "--elasticsearch-only")
        log INFO "🔍 Только Elasticsearch бэкап"
        backup_elasticsearch
        exit $?
        ;;
    "--configs-only")
        log INFO "⚙️ Только конфигурации"
        backup_configs
        exit $?
        ;;
    "")
        # Обычный запуск без аргументов
        main
        ;;
    *)
        log ERROR "Неизвестная опция: $1"
        log INFO "Используйте --help для справки"
        exit 1
        ;;
esac