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
    echo "  -s, --service СЕРВИС  Показать логи только указанного сервиса (например: frontend, api-gateway)"
    echo "  -f, --follow          Следить за логами в реальном времени"
    echo "  -n, --lines ЧИСЛО     Количество строк для отображения (по умолчанию: 100)"
    echo "  -t, --timestamps      Показывать метки времени для каждой строки лога"
    echo "  --since ВРЕМЯ         Показать логи с указанного времени (например: 10m, 1h, 2023-01-01)"
    echo "  --until ВРЕМЯ         Показать логи до указанного времени"
    echo "  --tail                Показать только последние строки (эквивалент -n)"
    echo "  --no-color            Отключить цветной вывод"
    echo "  --grep ТЕКСТ          Фильтровать логи, содержащие указанный текст"
    echo
    echo "Примеры:"
    echo "  $0 -s frontend       Показать последние 100 строк логов frontend"
    echo "  $0 -s api -f         Следить за логами API шлюза в реальном времени"
    echo "  $0 -s user -n 500    Показать последние 500 строк логов сервиса пользователей"
    echo "  $0 --since 30m       Показать логи всех сервисов за последние 30 минут"
    echo "  $0 -s kafka --grep Error  Показать строки с ошибками в логах Kafka"
}

# Инициализация переменных
SERVICE=""
FOLLOW=false
LINES=100
TIMESTAMPS=false
SINCE=""
UNTIL=""
NO_COLOR=false
GREP=""

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
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines|--tail)
            LINES="$2"
            shift 2
            ;;
        -t|--timestamps)
            TIMESTAMPS=true
            shift
            ;;
        --since)
            SINCE="$2"
            shift 2
            ;;
        --until)
            UNTIL="$2"
            shift 2
            ;;
        --no-color)
            NO_COLOR=true
            shift
            ;;
        --grep)
            GREP="$2"
            shift 2
            ;;
        *)
            print_colored_text "31" "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Переход в директорию со скриптом
cd "$(dirname "$0")"

# Команда для работы с Docker Compose
CMD="docker compose -f ../compose/docker-compose.yml"
if [ -f "../compose/docker-compose.override.yml" ]; then
    CMD="$CMD -f ../compose/docker-compose.override.yml"
    [ "$VERBOSE" = true ] && echo "Найден файл docker-compose.override.yml, он будет использован"
else
    [ "$VERBOSE" = true ] && echo "Файл docker-compose.override.yml не найден, используется только основная конфигурация"
fi

# Строка для сервиса
SERVICE_STR=""
if [ -n "$SERVICE" ]; then
    # Сопоставление сервисов с контейнерами
    declare -A service_to_container=(
      ["frontend"]="frontend"
      ["api-gateway"]="api"
      ["crew"]="crew"
      ["notification"]="notification"
      ["planning"]="planning"
      ["user"]="user"
      ["postgres"]="postgres"
      ["zookeeper"]="zookeeper"
      ["kafka"]="kafka"
      ["prometheus"]="prometheus"
      ["grafana"]="grafana"
    )
    
    # Находим имя контейнера для указанного сервиса
    CONTAINER="${service_to_container[$SERVICE]}"
    if [ -z "$CONTAINER" ]; then
        # Если сервис не найден в маппинге, используем его как есть
        CONTAINER="$SERVICE"
    fi
    
    SERVICE_STR="$CONTAINER"
    print_colored_text "36" "Получение логов для сервиса: $SERVICE (контейнер: $CONTAINER)"
else
    print_colored_text "36" "Получение логов для всех сервисов"
fi

# Формирование опций для команды logs
LOGS_OPTIONS=""

if [ "$FOLLOW" = true ]; then
    LOGS_OPTIONS="$LOGS_OPTIONS -f"
fi

if [ "$TIMESTAMPS" = true ]; then
    LOGS_OPTIONS="$LOGS_OPTIONS -t"
fi

if [ -n "$SINCE" ]; then
    LOGS_OPTIONS="$LOGS_OPTIONS --since $SINCE"
fi

if [ -n "$UNTIL" ]; then
    LOGS_OPTIONS="$LOGS_OPTIONS --until $UNTIL"
fi

LOGS_OPTIONS="$LOGS_OPTIONS --tail $LINES"

# Выполнение команды получения логов
if [ -n "$GREP" ]; then
    if [ "$NO_COLOR" = true ]; then
        $CMD logs $LOGS_OPTIONS $SERVICE_STR | grep "$GREP"
    else
        # Подсветка найденного текста
        $CMD logs $LOGS_OPTIONS $SERVICE_STR | grep --color=always "$GREP"
    fi
else
    $CMD logs $LOGS_OPTIONS $SERVICE_STR
fi

# Проверка кода возврата
exit_code=$?
if [ $exit_code -ne 0 ] && [ $exit_code -ne 130 ]; then  # 130 - прерывание по Ctrl+C
    print_colored_text "31" "Ошибка при получении логов. Код ошибки: $exit_code"
    exit $exit_code
fi 