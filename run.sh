#!/bin/bash
# Скрипт для запуска других скриптов из новой директории
# Используйте: ./run.sh <команда> [аргументы]

# Определяем корневую директорию проекта
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="${PROJECT_ROOT}/infra/scripts"

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

# Функция для отображения подробной справки
show_help() {
    echo "Использование: $0 <команда> [аргументы]"
    echo
    echo "Команды:"
    echo "  start                 Запустить контейнеры"
    echo "  stop                  Остановить контейнеры"
    echo "  restart               Перезапустить контейнеры"
    echo "  logs                  Показать логи"
    echo "  status                Показать статус контейнеров"
    echo "  help                  Показать эту справку"
    echo "  list                  Показать список доступных скриптов"
    echo "  exec <скрипт> [...]   Запустить произвольный скрипт из infra/scripts"
    echo
    echo "Опции:"
    echo "  -h, --help            Показать эту справку"
    echo
    echo "Доступные скрипты:"
    for script in "$SCRIPT_DIR"/*.sh; do
        basename "${script%.sh}"
    done
    echo
    echo "Примеры:"
    echo "  $0 start              Запустить контейнеры"
    echo "  $0 stop               Остановить контейнеры"
    echo "  $0 restart            Перезапустить контейнеры"
    echo "  $0 logs               Показать логи контейнеров"
    echo "  $0 status             Запустить скрипт status.sh"
    echo
    exit 0
}

# Функция для отображения списка скриптов
list_scripts() {
    echo "Доступные скрипты:"
    for script in "$SCRIPT_DIR"/*.sh; do
        basename "${script%.sh}"
    done
    exit 0
}

# Переходим в корневую директорию проекта
cd "$PROJECT_ROOT" || { echo "Ошибка: не могу перейти в директорию ${PROJECT_ROOT}"; exit 1; }

# Если нет аргументов или указан флаг help, показываем справку
if [ $# -eq 0 ]; then
    show_help
fi

# Проверяем первый аргумент на команды help и list
if [ "$1" = "help" ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
fi

if [ "$1" = "list" ]; then
    list_scripts
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
    "restart")
        restart_containers
        ;;
    "logs")
        view_logs
        ;;
    "status")
        docker-compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ps
        ;;
    *)
        # Обработка запуска скриптов из директории scripts
        SCRIPT="$1"
        shift

        # Добавляем расширение .sh, если его нет
        if [[ ! "$SCRIPT" == *.sh ]]; then
            SCRIPT_WITH_EXT="${SCRIPT}.sh"
        else
            SCRIPT_WITH_EXT="$SCRIPT"
        fi

        if [ ! -f "$SCRIPT_DIR/$SCRIPT_WITH_EXT" ]; then
            echo "Ошибка: Скрипт $SCRIPT не найден"
            echo "Доступные скрипты:"
            for script in "$SCRIPT_DIR"/*.sh; do
                basename "${script%.sh}"
            done
            exit 1
        fi

        # Просто запускаем нужный скрипт из infra/scripts
        "${SCRIPT_DIR}/${SCRIPT_WITH_EXT}" "$@"
        exit $?
        ;;
esac

log "[INFO] Операция завершена успешно!"
