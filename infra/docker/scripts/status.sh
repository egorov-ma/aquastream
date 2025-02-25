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
    echo "  -s, --service СЕРВИС  Показать статус только указанного сервиса (например: frontend, api-gateway)"
    echo "  -d, --detailed        Показать подробную информацию о ресурсах"
    echo "  -n, --network         Показать информацию о сетевых подключениях"
    echo "  -v, --volumes         Показать информацию о подключенных томах"
    echo "  -p, --processes       Показать информацию о процессах внутри контейнеров"
    echo "  -a, --all             Показать всю доступную информацию (комбинация всех опций)"
    echo "  --json                Вывод в формате JSON (для интеграции с другими инструментами)"
    echo "  --health              Проверить доступность HTTP эндпоинтов сервисов"
    echo
    echo "Примеры:"
    echo "  $0                   Показать базовый статус всех сервисов"
    echo "  $0 -s frontend -d    Показать подробную информацию о frontend"
    echo "  $0 -a                Показать всю доступную информацию о сервисах"
    echo "  $0 --health          Проверить доступность сервисов через HTTP"
}

# Инициализация переменных
SERVICE=""
DETAILED=false
NETWORK=false
VOLUMES=false
PROCESSES=false
JSON=false
HEALTH=false

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
        -d|--detailed)
            DETAILED=true
            shift
            ;;
        -n|--network)
            NETWORK=true
            shift
            ;;
        -v|--volumes)
            VOLUMES=true
            shift
            ;;
        -p|--processes)
            PROCESSES=true
            shift
            ;;
        -a|--all)
            DETAILED=true
            NETWORK=true
            VOLUMES=true
            PROCESSES=true
            shift
            ;;
        --json)
            JSON=true
            shift
            ;;
        --health)
            HEALTH=true
            shift
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

# Формирование команды docker compose
CMD="docker compose -f ../compose/docker-compose.yml -f ../compose/docker-compose.override.yml"

# Получение базовой информации о контейнерах
print_colored_text "36" "=== Статус контейнеров ==="
if [ -z "$SERVICE" ]; then
    $CMD ps
else
    $CMD ps --services | grep -w "$SERVICE" || {
        print_colored_text "31" "Сервис '$SERVICE' не найден!"
        exit 1
    }
    $CMD ps --filter "service=$SERVICE"
fi

# Подробная информация о ресурсах
if [ "$DETAILED" = true ]; then
    print_colored_text "36" "\n=== Использование ресурсов ==="
    
    if [ -z "$SERVICE" ]; then
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}"
    else
        # Находим полное имя контейнера для указанного сервиса
        CONTAINER_NAME=$(docker ps --filter "name=aquastream-$SERVICE" --format "{{.Names}}")
        if [ -z "$CONTAINER_NAME" ]; then
            print_colored_text "33" "Контейнер для сервиса '$SERVICE' не найден или не запущен."
        else
            docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}" "$CONTAINER_NAME"
        fi
    fi
fi

# Информация о сетевых подключениях
if [ "$NETWORK" = true ]; then
    print_colored_text "36" "\n=== Сетевые подключения ==="
    
    if [ -z "$SERVICE" ]; then
        # Выводим список всех сетей
        print_colored_text "33" "Сети Docker:"
        docker network ls --filter "name=aquastream" --format "table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}"
        
        # Для каждой сети выводим подключенные контейнеры
        NETWORKS=$(docker network ls --filter "name=aquastream" --format "{{.Name}}")
        for network in $NETWORKS; do
            print_colored_text "33" "\nКонтейнеры в сети '$network':"
            docker network inspect --format "{{range .Containers}}{{.Name}} ({{.IPv4Address}})\n{{end}}" "$network"
        done
    else
        # Находим полное имя контейнера для указанного сервиса
        CONTAINER_NAME=$(docker ps --filter "name=aquastream-$SERVICE" --format "{{.Names}}")
        if [ -z "$CONTAINER_NAME" ]; then
            print_colored_text "33" "Контейнер для сервиса '$SERVICE' не найден или не запущен."
        else
            print_colored_text "33" "Сети контейнера '$CONTAINER_NAME':"
            docker inspect --format "{{range .NetworkSettings.Networks}}{{.NetworkID}} (IP: {{.IPAddress}})\n{{end}}" "$CONTAINER_NAME"
            
            print_colored_text "33" "\nПодробная информация о портах:"
            docker port "$CONTAINER_NAME"
        fi
    fi
fi

# Информация о томах
if [ "$VOLUMES" = true ]; then
    print_colored_text "36" "\n=== Тома и монтирования ==="
    
    if [ -z "$SERVICE" ]; then
        # Выводим список всех томов
        print_colored_text "33" "Тома Docker:"
        docker volume ls --filter "name=aquastream" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
        
        # Для каждого тома выводим пользователей
        print_colored_text "33" "\nКонтейнеры и их тома:"
        docker ps --format "{{.Names}}" | while read -r container; do
            mounts=$(docker inspect --format '{{range .Mounts}}{{.Type}}:{{.Source}} -> {{.Destination}}{{println}}{{end}}' "$container")
            if [ -n "$mounts" ]; then
                print_colored_text "32" "$container:"
                echo "$mounts"
            fi
        done
    else
        # Находим полное имя контейнера для указанного сервиса
        CONTAINER_NAME=$(docker ps --filter "name=aquastream-$SERVICE" --format "{{.Names}}")
        if [ -z "$CONTAINER_NAME" ]; then
            print_colored_text "33" "Контейнер для сервиса '$SERVICE' не найден или не запущен."
        else
            print_colored_text "33" "Тома контейнера '$CONTAINER_NAME':"
            mounts=$(docker inspect --format '{{range .Mounts}}{{.Type}}:{{.Source}} -> {{.Destination}}{{println}}{{end}}' "$CONTAINER_NAME")
            if [ -n "$mounts" ]; then
                echo "$mounts"
            else
                print_colored_text "33" "Контейнер не использует тома."
            fi
        fi
    fi
fi

# Информация о процессах внутри контейнеров
if [ "$PROCESSES" = true ]; then
    print_colored_text "36" "\n=== Процессы внутри контейнеров ==="
    
    if [ -z "$SERVICE" ]; then
        # Для каждого контейнера выводим процессы
        docker ps --format "{{.Names}}" | while read -r container; do
            print_colored_text "32" "Процессы в контейнере '$container':"
            docker top "$container" || echo "Не удалось получить процессы"
            echo
        done
    else
        # Находим полное имя контейнера для указанного сервиса
        CONTAINER_NAME=$(docker ps --filter "name=aquastream-$SERVICE" --format "{{.Names}}")
        if [ -z "$CONTAINER_NAME" ]; then
            print_colored_text "33" "Контейнер для сервиса '$SERVICE' не найден или не запущен."
        else
            print_colored_text "33" "Процессы в контейнере '$CONTAINER_NAME':"
            docker top "$CONTAINER_NAME" || echo "Не удалось получить процессы"
        fi
    fi
fi

# Проверка доступности HTTP эндпоинтов
if [ "$HEALTH" = true ]; then
    print_colored_text "36" "\n=== Проверка доступности сервисов ==="
    
    # Адреса для HTTP-проверок
    declare -A http_endpoints=(
        ["frontend"]="http://localhost:3000"
        ["api-gateway"]="http://localhost:8080/api/health"
        ["crew"]="http://localhost:8083/api/crew/health"
        ["notification"]="http://localhost:8084/api/notification/health"
        ["planning"]="http://localhost:8082/api/planning/health"
        ["user"]="http://localhost:8081/api/user/health"
        ["prometheus"]="http://localhost:9091"
        ["grafana"]="http://localhost:3001"
    )
    
    if [ -z "$SERVICE" ]; then
        # Проверяем все сервисы
        for service in "${!http_endpoints[@]}"; do
            endpoint="${http_endpoints[$service]}"
            print_colored_text "33" "Проверка $service: $endpoint"
            if curl -s --connect-timeout 2 "$endpoint" >/dev/null; then
                print_colored_text "32" "✓ Доступен"
            else
                print_colored_text "31" "✗ Недоступен"
            fi
        done
    else
        # Проверяем только указанный сервис
        endpoint="${http_endpoints[$SERVICE]}"
        if [ -n "$endpoint" ]; then
            print_colored_text "33" "Проверка $SERVICE: $endpoint"
            if curl -s --connect-timeout 2 "$endpoint" >/dev/null; then
                print_colored_text "32" "✓ Доступен"
            else
                print_colored_text "31" "✗ Недоступен"
            fi
        else
            print_colored_text "33" "Для сервиса '$SERVICE' не настроена HTTP-проверка."
        fi
    fi
fi 