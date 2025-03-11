#!/bin/bash

# Вывод текста с заданным цветом
print_colored_text() {
    local color_code=$1
    local text=$2
    echo -e "\033[${color_code}m${text}\033[0m"
}

# Функция для вывода подсказки
show_help() {
    echo "Использование: $0 [опции]"
    echo "Опции:"
    echo "  -h, --help            Показать эту подсказку"
    echo "  -s, --service СЕРВИС  Запустить только указанный сервис (например: frontend, api-gateway)"
    echo "  -b, --build           Пересобрать образы перед запуском"
    echo "  -v, --verbose         Подробный вывод"
    echo "  -d, --detach          Запустить контейнеры в фоновом режиме (по умолчанию)"
    echo "  -a, --attach          Запустить контейнеры в интерактивном режиме (не в фоне)"
    echo
    echo "Примеры:"
    echo "  $0                   Запустить все сервисы"
    echo "  $0 -s frontend       Запустить только frontend"
    echo "  $0 -b -s api-gateway Пересобрать и запустить только api-gateway"
    echo "  $0 -a                Запустить все сервисы в интерактивном режиме"
}

# Функция для проверки поддержки флага
check_flag_support() {
    local flag=$1
    
    if docker compose up --help | grep -q -- "$flag"; then
        return 0  # Флаг поддерживается
    else
        return 1  # Флаг не поддерживается
    fi
}

# Инициализация переменных
SERVICE=""
BUILD=false
VERBOSE=false
DETACH=true

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--detach)
            DETACH=true
            shift
            ;;
        -a|--attach)
            DETACH=false
            shift
            ;;
        *)
            print_colored_text "31" "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Запуск сервисов
if [ -z "$SERVICE" ]; then
    print_colored_text "32" "Запуск всех сервисов AquaStream..."
else
    print_colored_text "32" "Запуск сервиса $SERVICE..."
fi

# Формирование команды docker compose
CMD="docker compose -f ./infra/docker/compose/docker-compose.yml"
if [ -f "./infra/docker/compose/docker-compose.override.yml" ]; then
    CMD="$CMD -f ./infra/docker/compose/docker-compose.override.yml"
    print_colored_text "36" "Найден файл docker-compose.override.yml, он будет использован"
else
    print_colored_text "36" "Файл docker-compose.override.yml не найден, используется только основная конфигурация"
fi

if [ "$VERBOSE" = true ]; then
    print_colored_text "36" "Режим подробного вывода активирован"
fi

# Примечание: флаг --quiet-pull присутствует в документации Docker Compose,
# но вызывает ошибку в текущей версии. Оставлен закомментированным до исправления в Docker.
# CMD="$CMD --quiet-pull"

# Функция для логирования
log() {
    local level=$1
    local msg=$2
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg"
}

# Если указан сервис, сначала собираем его образ
if [ -n "$SERVICE" ] && [ "$BUILD" = true ]; then
    log "INFO" "Сборка образа для сервиса $SERVICE..."
    if ! $CMD build "$SERVICE"; then
        log "ERROR" "Ошибка при сборке образа для сервиса $SERVICE"
        exit 1
    fi
fi

# Запуск с помощью docker compose
if [ "$DETACH" = true ]; then
    DETACH_FLAG="-d"
    print_colored_text "36" "Запуск в фоновом режиме"
else
    DETACH_FLAG=""
    print_colored_text "36" "Запуск в интерактивном режиме"
fi

# Запуск контейнеров
log "INFO" "Запуск контейнеров..."
if [ -n "$SERVICE" ]; then
    $CMD up $DETACH_FLAG "$SERVICE"
else
    $CMD up $DETACH_FLAG
fi

exit_code=$?
if [ $exit_code -eq 0 ]; then
    if [ -z "$SERVICE" ]; then
        print_colored_text "32" "Все сервисы успешно запущены!"
    else
        print_colored_text "32" "Сервис $SERVICE успешно запущен!"
    fi
else
    if [ -z "$SERVICE" ]; then
        print_colored_text "31" "Ошибка при запуске сервисов!"
    else
        print_colored_text "31" "Ошибка при запуске сервиса $SERVICE!"
    fi
    exit $exit_code
fi 