#!/bin/bash

# Определяем путь к директории проекта
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Функция для логирования
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Функция для проверки наличия необходимых инструментов
check_requirements() {
    if ! command -v docker &> /dev/null; then
        log "[ERROR] Docker не установлен!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log "[ERROR] Docker Compose не установлен!"
        exit 1
    fi
}

# Функция для остановки контейнеров
stop_containers() {
    log "[INFO] Остановка всех контейнеров..."
    if [ -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ]; then
        docker-compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" down
    else
        log "[ERROR] Файл docker-compose.yml не найден!"
        exit 1
    fi
}

# Функция для запуска контейнеров
start_containers() {
    log "[INFO] Запуск контейнеров..."
    if [ -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ]; then
        docker-compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" up -d
    else
        log "[ERROR] Файл docker-compose.yml не найден!"
        exit 1
    fi
}

# Функция для перезапуска контейнеров
restart_containers() {
    log "[INFO] Перезапуск проекта: остановка всех контейнеров..."
    stop_containers
    log "[INFO] Перезапуск проекта: запуск контейнеров..."
    start_containers
}

# Функция для просмотра логов
view_logs() {
    log "[INFO] Просмотр логов..."
    if [ -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ]; then
        docker-compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" logs -f
    else
        log "[ERROR] Файл docker-compose.yml не найден!"
        exit 1
    fi
}

# Проверяем наличие необходимых инструментов
check_requirements

# Обработка аргументов командной строки
case "$1" in
    "start")
        start_containers
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        restart_containers
        ;;
    "logs")
        view_logs
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|logs}"
        exit 1
        ;;
esac

log "[INFO] Операция завершена успешно!" 