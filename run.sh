#!/bin/bash
set -euo pipefail
# Используйте: ./run.sh <команда> [аргументы]

# Определяем корневую директорию проекта
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="${PROJECT_ROOT}/infra/scripts"

# Цвета
NC="\033[0m"; GREEN="\033[0;32m"; YELLOW="\033[0;33m"; RED="\033[0;31m"

# Функция логирования с уровнями
log() {
    local level="$1"; shift
    # Удаляем квадратные скобки, если переданы
    level="${level//[\[\]]/}"
    local msg="$*"
    local color="$GREEN"
    case "$level" in
      INFO)  color="$GREEN";;
      WARN)  color="$YELLOW";;
      ERROR) color="$RED";;
    esac
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${color}${level}${NC} ${msg}"
}

# Функция для проверки наличия необходимых инструментов
check_requirements() {
    # Проверка Docker
    if ! command -v docker &> /dev/null; then
        log ERROR "Docker не установлен!"
        exit 1
    fi

    # Проверка Docker Compose
    if ! docker compose version &> /dev/null; then
        log ERROR "Плагин Docker Compose (docker compose) не найден! Обновите Docker до актуальной версии."
        exit 1
    fi

    # Проверка Docker daemon
    check_docker_daemon_ready
}

# Функция для проверки готовности Docker daemon
check_docker_daemon_ready() {
    local max_attempts=10
    local attempt=1
    local delay=2
    
    log INFO "Проверка состояния Docker daemon..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker info &>/dev/null; then
            log INFO "Docker daemon готов к работе"
            check_docker_resources
            return 0
        fi
        
        log WARN "Docker daemon недоступен (попытка $attempt/$max_attempts), ожидание ${delay}s..."
        sleep $delay
        attempt=$((attempt + 1))
        delay=$((delay + 1))  # Увеличиваем задержку
    done
    
    log ERROR "Docker daemon недоступен после $max_attempts попыток!"
    log ERROR "Попробуйте: 'sudo systemctl start docker' (Linux) или перезапустите Docker Desktop"
    exit 1
}

# Функция для проверки ресурсов Docker
check_docker_resources() {
    # Проверяем доступную память
    local total_memory
    if command -v docker system info &>/dev/null; then
        total_memory=$(docker system info --format '{{.MemTotal}}' 2>/dev/null || echo "0")
        if [ "$total_memory" -gt 0 ] && [ "$total_memory" -lt 5368709120 ]; then  # 5GB в байтах
            log WARN "Доступная память в Docker: $(numfmt --to=iec $total_memory). Рекомендуется минимум 5GB"
        fi
    fi
    
    # Проверяем доступность сетей Docker
    if ! docker network ls &>/dev/null; then
        log WARN "Проблемы с Docker сетями, проверьте настройки"
    fi
    
    # Проверяем доступность volume driver
    if ! docker volume ls &>/dev/null; then
        log WARN "Проблемы с Docker volumes, проверьте настройки"
    fi
}

# Функция для остановки контейнеров
stop_containers() {
    log "[INFO] Остановка всех контейнеров и очистка ресурсов..."
    if [ -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ]; then
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" down -v --remove-orphans
    else
        log "[ERROR] Файл docker-compose.yml не найден!"
        exit 1
    fi
    # Очистка данных ZooKeeper (если volume существует)
    ZOOKEEPER_VOLUME=$(docker volume ls -q | grep zookeeper | head -n1 || true)
    if [ -n "$ZOOKEEPER_VOLUME" ]; then
        MNT=$(docker volume inspect "$ZOOKEEPER_VOLUME" -f '{{ .Mountpoint }}')
        if [ -d "$MNT/version-2" ]; then
            log INFO "Очистка данных ZooKeeper в $MNT..."
            rm -rf "$MNT/version-2"/*
            log INFO "Данные ZooKeeper очищены"
        fi
    fi
}

# Функция для запуска контейнеров
start_containers() {
    log "[INFO] Полный перезапуск контейнеров..."
    stop_containers
    log "[INFO] Запускаем docker compose..."

    local compose_file="$PROJECT_ROOT/infra/docker/compose/docker-compose.yml"
    if [ -f "$compose_file" ]; then
        # Тянем образы без секции build
        docker compose -f "$compose_file" pull --quiet --ignore-buildable 2>/dev/null || true
        # Собираем build-образа
        docker compose -f "$compose_file" build --quiet
        # Запускаем контейнеры
        docker compose -f "$compose_file" up -d
        wait_healthy 180
    else
        log "[ERROR] Файл docker-compose.yml не найден!"
        exit 1
    fi
}

# Улучшенная функция ожидания готовности контейнеров
wait_healthy() {
    local max_wait=${1:-180}
    local elapsed=0
    local check_interval=10
    local previous_status=""
    
    log INFO "Ожидание готовности контейнеров (до ${max_wait}s)..."
    
    while [ $elapsed -lt $max_wait ]; do
        # Получаем статус без jq для совместимости
        local status_info
        status_info=$(docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}" 2>/dev/null || true)
        
        # Подсчитываем контейнеры
        local total_containers running_containers healthy_containers
        total_containers=$(echo "$status_info" | tail -n +2 | wc -l)
        running_containers=$(echo "$status_info" | grep -c "Up " || echo "0")
        healthy_containers=$(echo "$status_info" | grep -c "healthy" || echo "0")
        
        # Логируем прогресс только при изменениях
        local current_status="$running_containers/$total_containers running, $healthy_containers healthy"
        if [ "$current_status" != "$previous_status" ]; then
            log INFO "Прогресс: $current_status"
            previous_status="$current_status"
        fi
        
        # Проверяем условие готовности
        if [ "$running_containers" -eq "$total_containers" ] && [ "$healthy_containers" -eq "$total_containers" ]; then
            log INFO "✅ Все $total_containers контейнеров готовы к работе!"
            show_service_endpoints
            return 0
        fi
        
        # Проверяем на failed контейнеры
        local failed_containers
        failed_containers=$(echo "$status_info" | grep -E "(Exited|Dead)" | cut -f1 || true)
        if [ -n "$failed_containers" ]; then
            log ERROR "❌ Обнаружены упавшие контейнеры: $failed_containers"
            log ERROR "Используйте './run.sh logs' для диагностики"
            return 1
        fi
        
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
    done
    
    # Таймаут - показываем детальную информацию
    log WARN "⏰ Таймаут ожидания готовности контейнеров после ${max_wait}s"
    log INFO "Текущий статус контейнеров:"
    echo "$status_info"
    
    return 1
}

# Функция для отображения доступных endpoints
show_service_endpoints() {
    log INFO "🌐 Доступные сервисы:"
    echo "  • Веб-приложение:      https://localhost/"
    echo "  • API:                 https://localhost/api/"
    echo "  • Мониторинг:          https://localhost/monitoring/ (admin:monitoring123)"
    echo "  • Health Check:        https://localhost/health"
    echo ""
    echo "  Для разработки (прямой доступ):"
    echo "  • PostgreSQL:          localhost:5432"
    echo "  • Kafka:               localhost:19092"
}

# Функция для сборки проекта (backend, frontend, Docker images)
build_project() {
    local mode="summary"

    # Определяем режим вывода логов
    if [[ "${1:-}" =~ ^(--full|-f)$ ]]; then
        mode="full"
    elif [[ -z "${1:-}" || "${1:-}" =~ ^(--summary|-s)$ ]]; then
        mode="summary"
    else
        log ERROR "Неизвестный режим билда: $1"
        exit 1
    fi

    # ========================= Backend =========================
    log INFO "========== Сборка backend (${mode}) =========="
    if [ "$mode" = "full" ]; then
        ./gradlew clean build -x test || { log ERROR "Gradle build failed"; exit 1; }
    else
        backend_log=$(mktemp)
        ./gradlew clean build -x test --console=plain >"$backend_log" 2>&1
        if [ $? -eq 0 ]; then
            log INFO "Backend build SUCCESS"
        else
            log ERROR "Backend build FAILED. Полный лог: $backend_log"
            exit 1
        fi
    fi

    # ========================= Frontend =========================
    log INFO "========== Сборка frontend (${mode}) =========="
    if [ "$mode" = "full" ]; then
        (cd frontend && npm ci && npm run build) || { log ERROR "Frontend build failed"; exit 1; }
    else
        frontend_log=$(mktemp)
        (cd frontend && npm ci --silent && npm run build --silent) >"$frontend_log" 2>&1
        if [ $? -eq 0 ]; then
            log INFO "Frontend build SUCCESS"
        else
            log ERROR "Frontend build FAILED. Полный лог: $frontend_log"
            exit 1
        fi
    fi

    # ========================= Docker images =========================
    log INFO "========== Docker compose build (${mode}) =========="
    if [ "$mode" = "full" ]; then
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" build || { log ERROR "Docker build failed"; exit 1; }
    else
        docker_log=$(mktemp)
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" build --quiet >"$docker_log" 2>&1
        if [ $? -eq 0 ]; then
            log INFO "Docker images build SUCCESS"
        else
            log ERROR "Docker images build FAILED. Полный лог: $docker_log"
            exit 1
        fi
    fi
}

# Функция для просмотра логов
view_logs() {
    log "[INFO] Просмотр логов..."
    if [ -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ]; then
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" logs -f
    else
        log "[ERROR] Файл docker-compose.yml не найден!"
        exit 1
    fi
}

# Функция для отображения подробной справки
show_help() {
    echo "Использование: $0 <команда> [аргументы]"
    echo
    echo "Команды:"
    echo "  build [--full|-f|--summary|-s]   Собрать backend, frontend и образы Docker (по умолчанию краткий вывод)"
    echo "  start                 Запустить контейнеры (pull/build + up -d)"
    echo "  stop                  Остановить контейнеры и очистить ресурсы"
    echo "  logs [service]        Показать логи (docker compose logs -f)"
    echo "  status                Показать статус контейнеров (docker compose ps)"
    echo
    echo "Примеры:"
    echo "  $0 build                      Скомпилировать проект и собрать образы"
    echo "  $0 start                      Запустить контейнеры"
    echo "  $0 logs api-gateway           Tail -f логов сервиса api-gateway"
    echo "  $0 build --full               Скомпилировать проект с полным выводом логов"
    echo
    exit 0
}

# Переходим в корневую директорию проекта
cd "$PROJECT_ROOT" || { echo "Ошибка: не могу перейти в директорию ${PROJECT_ROOT}"; exit 1; }

# Если нет аргументов или указан флаг help, показываем справку
if [ $# -eq 0 ]; then
    show_help
fi

# Проверяем первый аргумент на команду help
if [ "$1" = "help" ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
fi

# Проверяем наличие необходимых инструментов
check_requirements

# Обработка команд для работы с контейнерами
case "$1" in
    "start")
        start_containers
        ;;
    "stop")
        stop_containers
        ;;
    "build")
        shift  # убираем ключевое слово build
        build_project "$@"  # передаём оставшиеся аргументы функции
        ;;
    "logs")
        shift
        if [ -n "$1" ]; then
            docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" logs -f "$1"
        else
            view_logs
        fi
        ;;
    "status")
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ps
        ;;
    *)
        log "[ERROR] Неизвестная команда: $1"
        show_help
        ;;
esac

log "[INFO] Операция завершена успешно!"