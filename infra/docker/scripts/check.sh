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
    echo "  -h, --help               Показать эту подсказку"
    echo "  -s, --service СЕРВИС     Проверить только указанный сервис (например: frontend, api-gateway)"
    echo "  -t, --timeout СЕКУНДЫ    Таймаут между попытками проверки (по умолчанию: 5 секунд)"
    echo "  -a, --attempts ЧИСЛО     Количество попыток проверки (по умолчанию: 3)"
    echo "  -v, --verbose            Подробный вывод"
    echo "  -p, --ping               Проверить доступность сервисов через HTTP/HTTPS"
    echo "  -l, --logs               Показать логи контейнеров при ошибке"
    echo
    echo "Примеры:"
    echo "  $0                      Проверить все сервисы"
    echo "  $0 -s frontend          Проверить только frontend"
    echo "  $0 -p                   Проверить все сервисы, включая HTTP-проверку"
    echo "  $0 -t 10 -a 5           Проверить с таймаутом 10 секунд и 5 попытками"
    echo "  $0 -v -l                Проверить с подробным выводом и логами при ошибке"
    echo
    echo "Примечание:"
    echo "  Скрипт совместим с Bash 3.2 (macOS по умолчанию) и использует"
    echo "  индексированные массивы вместо ассоциативных для обеспечения совместимости."
}

# Инициализация переменных
SERVICE=""
TIMEOUT=5
ATTEMPTS=3
VERBOSE=false
CHECK_HTTP=false
SHOW_LOGS=false

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
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -a|--attempts)
            ATTEMPTS="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -p|--ping)
            CHECK_HTTP=true
            shift
            ;;
        -l|--logs)
            SHOW_LOGS=true
            shift
            ;;
        *)
            print_colored_text "31" "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Переход в директорию, где находится файл docker-compose.yml
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR"

# Формирование команды docker compose
CMD="docker compose -f ../compose/docker-compose.yml -f ../compose/docker-compose.override.yml"

if [ "$VERBOSE" = true ]; then
    print_colored_text "36" "Проверка контейнеров с использованием Docker Compose..."
fi

# Получаем список запущенных контейнеров
output=$($CMD ps)
if [ "$VERBOSE" = true ]; then
    echo "$output"
    echo
fi

# Ожидаемые контейнеры и их портовые маппинги
# Используем индексированные массивы вместо ассоциативных для совместимости с Bash 3.2
container_names=(
  "aquastream-frontend"
  "aquastream-api"
  "aquastream-crew"
  "aquastream-notification"
  "aquastream-planning"
  "aquastream-user"
  "aquastream-postgres"
  "aquastream-zookeeper"
  "aquastream-kafka"
  "aquastream-prometheus"
  "aquastream-grafana"
)

container_ports=(
  "3000->80"
  "8080->8080"
  "8083->8083"
  "8084->8084"
  "8082->8082"
  "8081->8081"
  "5432->5432"
  "2181"
  "9092->9092"
  "9091->9090"
  "3001->3000"
)

# Зависимости между контейнерами (какой контейнер зависит от какого)
# Формат: "зависимый_контейнер:от_какого_зависит"
container_dependencies=(
  "aquastream-frontend:aquastream-api"
  "aquastream-api:aquastream-user"
  "aquastream-api:aquastream-crew"
  "aquastream-api:aquastream-notification"
  "aquastream-api:aquastream-planning"
  "aquastream-user:aquastream-postgres"
  "aquastream-crew:aquastream-postgres"
  "aquastream-notification:aquastream-postgres"
  "aquastream-notification:aquastream-kafka"
  "aquastream-kafka:aquastream-zookeeper"
)

# Сопоставление сервисов с контейнерами
service_names=(
  "frontend"
  "api-gateway"
  "crew"
  "notification"
  "planning"
  "user"
  "postgres"
  "zookeeper"
  "kafka"
  "prometheus"
  "grafana"
)

service_containers=(
  "aquastream-frontend"
  "aquastream-api"
  "aquastream-crew"
  "aquastream-notification"
  "aquastream-planning"
  "aquastream-user"
  "aquastream-postgres"
  "aquastream-zookeeper"
  "aquastream-kafka"
  "aquastream-prometheus"
  "aquastream-grafana"
)

# Адреса для HTTP-проверок (URL для проверки доступности)
http_containers=(
  "aquastream-frontend"
  "aquastream-api"
  "aquastream-crew"
  "aquastream-notification"
  "aquastream-planning"
)

http_urls=(
  "http://localhost:3000"
  "http://localhost:3000/api/actuator/health"
  "http://localhost:8083/api/crew/health"
  "http://localhost:8084/api/notification/health"
  "http://localhost:8082/api/planning/health"
)

error=0
containers_to_check=()

# Определяем, какие контейнеры нужно проверять
if [ -z "$SERVICE" ]; then
    # Проверяем все контейнеры
    for i in "${!container_names[@]}"; do
        containers_to_check+=("${container_names[$i]}")
    done
    print_colored_text "33" "Проверка всех контейнеров..."
else
    # Проверяем только указанный сервис
    container=""
    for i in "${!service_names[@]}"; do
        if [ "${service_names[$i]}" = "$SERVICE" ]; then
            container="${service_containers[$i]}"
            break
        fi
    done
    
    if [ -z "$container" ]; then
        print_colored_text "31" "Сервис '$SERVICE' не найден в списке известных сервисов!"
        exit 1
    fi
    
    containers_to_check+=("$container")
    print_colored_text "33" "Проверка контейнера для сервиса $SERVICE: $container"
fi

# Функция для проверки зависимостей контейнера
check_container_dependencies() {
  local container=$1
  local has_dependency=false
  
  for dep in "${container_dependencies[@]}"; do
    local dependent="${dep%%:*}"
    local dependency="${dep##*:}"
    
    if [ "$dependent" = "$container" ]; then
      has_dependency=true
      
      # Проверяем, запущен ли контейнер, от которого зависит
      if ! docker ps --format "{{.Names}}" | grep -q "$dependency"; then
        print_colored_text "31" "ОШИБКА: Контейнер $container зависит от $dependency, но $dependency не запущен!"
        return 1
      fi
    fi
  done
  
  return 0
}

# Функция для проверки контейнера
check_container() {
    local container_name=$1
    local container_idx=-1
    
    # Найдем индекс контейнера
    for i in "${!container_names[@]}"; do
        if [ "${container_names[$i]}" = "$container_name" ]; then
            container_idx=$i
            break
        fi
    done
    
    if [ $container_idx -eq -1 ]; then
        print_colored_text "31" "[ERROR] Контейнер $container_name не найден в списке известных контейнеров!"
        return 1
    fi
    
    local expected_port="${container_ports[$container_idx]}"
    
    # Сначала проверим зависимости
    if ! check_container_dependencies "$container_name"; then
        print_colored_text "31" "[ERROR] Проблемы с зависимостями для контейнера $container_name!"
        return 1
    fi
    
    # Находим строку с именем контейнера в выводе docker-compose ps
    local line=$(echo "$output" | grep -F "$container_name")
    
    if [ -z "$line" ]; then
        print_colored_text "31" "[ERROR] Контейнер $container_name не найден!"
        return 1
    else
        # Проверяем, что контейнер в состоянии "Up"
        if ! echo "$line" | grep -q "Up"; then
            print_colored_text "31" "[ERROR] Контейнер $container_name найден, но не работает (не в состоянии 'Up')!"
            if [ "$SHOW_LOGS" = true ]; then
                print_colored_text "33" "--- Последние логи контейнера $container_name: ---"
                $CMD logs --tail=20 ${container_name##*-} 2>&1
                print_colored_text "33" "--- Конец логов ---"
            fi
            return 1
        fi
    
        # Проверяем наличие ожидаемого отображения портов
        if ! echo "$line" | grep -q "$expected_port"; then
            print_colored_text "31" "[ERROR] Для контейнера $container_name ожидаемые порты '$expected_port' не найдены!"
            if [ "$VERBOSE" = true ]; then
                print_colored_text "33" "Строка контейнера: $line"
            fi
            return 1
        fi
    
        # Проверка через HTTP, если запрошена
        # Найдем индекс в массиве http_containers
        local http_idx=-1
        for i in "${!http_containers[@]}"; do
            if [ "${http_containers[$i]}" = "$container_name" ]; then
                http_idx=$i
                break
            fi
        done
        
        if [ "$CHECK_HTTP" = true ] && [ $http_idx -ne -1 ]; then
            local endpoint="${http_urls[$http_idx]}"
            
            if [ "$VERBOSE" = true ]; then
                print_colored_text "36" "Проверка доступности $container_name по адресу $endpoint"
            fi
            
            for ((i=1; i<=$ATTEMPTS; i++)); do
                if curl -s --connect-timeout 2 "$endpoint" >/dev/null; then
                    if [ "$VERBOSE" = true ]; then
                        print_colored_text "32" "HTTP-проверка успешна для $container_name"
                    fi
                    return 0
                else
                    if [ "$VERBOSE" = true ] && [ $i -lt $ATTEMPTS ]; then
                        print_colored_text "33" "Попытка $i/$ATTEMPTS для $container_name не удалась, повтор через $TIMEOUT сек..."
                    fi
                    sleep $TIMEOUT
                fi
            done
            
            print_colored_text "31" "[ERROR] HTTP-проверка не удалась для $container_name после $ATTEMPTS попыток!"
            return 1
        fi
    fi
    
    if [ "$VERBOSE" = true ]; then
        print_colored_text "32" "Контейнер $container_name работает корректно."
    fi
    return 0
}

# Проверяем все необходимые контейнеры
print_colored_text "36" "Проверка состояния контейнеров:"
for container in "${containers_to_check[@]}"; do
    if [ "$VERBOSE" = true ]; then
        print_colored_text "36" "Проверка контейнера $container..."
    fi
    
    if ! check_container "$container"; then
        error=1
    fi
done

# Вывод результата
if [ $error -ne 0 ]; then
    print_colored_text "31" "Проверка состояния контейнеров обнаружила ошибки."
    exit 1
else
    if [ -z "$SERVICE" ]; then
        print_colored_text "32" "Все необходимые контейнеры запущены и их порты соответствуют ожидаемым значениям."
    else
        print_colored_text "32" "Контейнер для сервиса '$SERVICE' запущен корректно."
    fi
    exit 0
fi 