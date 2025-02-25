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
    echo "  -s, --service СЕРВИС  Остановить только указанный сервис (например: frontend, api-gateway)"
    echo "  -r, --remove          Удалить контейнеры после остановки (эквивалент docker compose down)"
    echo "  -v, --volumes         Удалить также и тома (только вместе с -r)"
    echo "  -a, --all             Удалить все неиспользуемые контейнеры, сети и образы (очистка)"
    echo "  --verbose             Подробный вывод"
    echo
    echo "Примеры:"
    echo "  $0                   Остановить все сервисы"
    echo "  $0 -s frontend       Остановить только frontend"
    echo "  $0 -r                Остановить и удалить контейнеры"
    echo "  $0 -r -v             Остановить и удалить контейнеры вместе с томами"
    echo "  $0 -a                Остановить контейнеры и выполнить полную очистку"
}

# Инициализация переменных
SERVICE=""
REMOVE=false
VOLUMES=false
CLEAN_ALL=false
VERBOSE=false

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
        -r|--remove)
            REMOVE=true
            shift
            ;;
        -v|--volumes)
            VOLUMES=true
            shift
            ;;
        -a|--all)
            CLEAN_ALL=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            print_colored_text "31" "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Переход в директорию со скриптом (если нужно)
cd "$(dirname "$0")"

# Формирование команды docker compose
CMD="docker compose -f ../compose/docker-compose.yml -f ../compose/docker-compose.override.yml"

# Остановка сервисов
if [ -z "$SERVICE" ]; then
    if [ "$REMOVE" = true ]; then
        DOWN_OPTIONS="--remove-orphans"
        
        if [ "$VOLUMES" = true ]; then
            DOWN_OPTIONS="$DOWN_OPTIONS -v"
            print_colored_text "33" "Остановка всех сервисов и удаление контейнеров вместе с томами..."
        else
            print_colored_text "33" "Остановка всех сервисов и удаление контейнеров..."
        fi
        
        $CMD down $DOWN_OPTIONS
    else
        print_colored_text "33" "Остановка всех сервисов..."
        $CMD stop
    fi
else
    if [ "$REMOVE" = true ]; then
        print_colored_text "31" "Опция --remove не может использоваться вместе с --service"
        exit 1
    else
        print_colored_text "33" "Остановка сервиса $SERVICE..."
        $CMD stop $SERVICE
    fi
fi

exit_code=$?
if [ $exit_code -eq 0 ]; then
    if [ -z "$SERVICE" ]; then
        print_colored_text "32" "Сервисы AquaStream успешно остановлены!"
    else
        print_colored_text "32" "Сервис $SERVICE успешно остановлен!"
    fi
else
    if [ -z "$SERVICE" ]; then
        print_colored_text "31" "Ошибка при остановке сервисов!"
    else
        print_colored_text "31" "Ошибка при остановке сервиса $SERVICE!"
    fi
    exit $exit_code
fi

# Дополнительная очистка, если запрошена
if [ "$CLEAN_ALL" = true ]; then
    print_colored_text "33" "Выполнение полной очистки неиспользуемых ресурсов..."
    
    print_colored_text "36" "Удаление неиспользуемых контейнеров..."
    docker container prune -f
    
    print_colored_text "36" "Удаление неиспользуемых сетей..."
    docker network prune -f
    
    print_colored_text "36" "Удаление неиспользуемых образов..."
    docker image prune -f
    
    print_colored_text "32" "Очистка завершена!"
fi

# Вывод состояния контейнеров после остановки
if [ "$VERBOSE" = true ]; then
    print_colored_text "36" "Текущий статус контейнеров:"
    $CMD ps
fi 