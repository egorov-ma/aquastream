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
    if ! command -v docker &> /dev/null; then
        log ERROR "Docker не установлен!"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        log ERROR "Плагин Docker Compose (docker compose) не найден! Обновите Docker до актуальной версии."
        exit 1
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

# Функция для запуска контейнеров
wait_healthy() {
    local max_wait=${1:-120}
    local elapsed=0
    log "[INFO] Ожидание готовности контейнеров (до ${max_wait}s)..."
    while [ $elapsed -lt $max_wait ]; do
        if ! command -v jq &>/dev/null; then
            log "[WARN] jq не установлен — пропускаю проверку healthcheck"
            return 0
        fi
        unhealthy=$(docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ps --format json | jq -r '.[]? | select(.State? != "running" or .Health? != "healthy") | .Name')
        if [ -z "$unhealthy" ]; then
            log "[INFO] Все контейнеры в статусе healthy."
            return 0
        fi
        sleep 5
        elapsed=$((elapsed+5))
    done
    log "[WARN] Некоторые контейнеры не стартовали вовремя:" $unhealthy
}

# Функция для сборки проекта (backend, frontend, Docker images)
build_project() {
    log "[INFO] Сборка backend (Gradle) и frontend..."
    ./gradlew clean build -x test || { log "[ERROR] Gradle build failed"; exit 1; }

    (cd frontend && npm ci && npm run build) || { log "[ERROR] Frontend build failed"; exit 1; }

    log "[INFO] Docker compose build..."
    docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" build || { log "[ERROR] Docker build failed"; exit 1; }
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
    echo "  build                 Собрать backend, frontend и образы Docker"
    echo "  start                 Запустить контейнеры (pull/build + up -d)"
    echo "  stop                  Остановить контейнеры и очистить ресурсы"
    echo "  logs [service]        Показать логи (docker compose logs -f)"
    echo "  status                Показать статус контейнеров (docker compose ps)"
    echo
    echo "Примеры:"
    echo "  $0 build                      Скомпилировать проект и собрать образы"
    echo "  $0 start                      Запустить контейнеры"
    echo "  $0 logs api-gateway           Tail -f логов сервиса api-gateway"
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
        build_project
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