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
    echo "  -e, --elk                Включить проверку компонентов ELK-стека"
    echo
    echo "Примеры:"
    echo "  $0                      Проверить все сервисы"
    echo "  $0 -s frontend          Проверить только frontend"
    echo "  $0 -p                   Проверить все сервисы, включая HTTP-проверку"
    echo "  $0 -t 10 -a 5           Проверить с таймаутом 10 секунд и 5 попытками"
    echo "  $0 -v -l                Проверить с подробным выводом и логами при ошибке"
    echo "  $0 -e                   Проверить все сервисы, включая компоненты ELK-стека"
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
CHECK_ELK=false

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
        -e|--elk)
            CHECK_ELK=true
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
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR" || exit 1

# Команда для работы с Docker Compose
CMD="docker compose -f ../compose/docker-compose.yml"
if [ -f "../compose/docker-compose.override.yml" ]; then
    CMD="$CMD -f ../compose/docker-compose.override.yml"
    if [ "$VERBOSE" = true ]; then
        print_colored_text "36" "Найден файл docker-compose.override.yml, он будет использован"
    fi
else
    if [ "$VERBOSE" = true ]; then
        print_colored_text "36" "Файл docker-compose.override.yml не найден, используется только основная конфигурация"
    fi
fi

if [ "$VERBOSE" = true ]; then
    print_colored_text "36" "Проверка контейнеров с использованием Docker Compose..."
fi

# Проверка наличия утилиты curl
check_curl() {
    if ! command -v curl &> /dev/null; then
        print_colored_text "31" "Ошибка: curl не установлен. Пожалуйста, установите curl."
        exit 1
    fi
}

# Проверяем статус определенного контейнера
check_container_status() {
    local container_name="$1"
    local container_id
    container_id=$(eval "$CMD ps -q $container_name" 2>/dev/null)
    
    if [ -z "$container_id" ]; then
        print_colored_text "31" "Контейнер $container_name не запущен"
        
        if [ "$SHOW_LOGS" = true ]; then
            print_colored_text "36" "Последние логи контейнера $container_name:"
            eval "$CMD logs --tail=20 $container_name" 2>/dev/null || echo "Логи недоступны"
        fi
        
        return 1
    else
        print_colored_text "32" "Контейнер $container_name запущен (ID: $container_id)"
        
        if [ "$VERBOSE" = true ]; then
            local container_info=$(docker inspect --format='{{.State.Status}} | Uptime: {{.State.StartedAt}} | {{.Config.Image}}' "$container_id" 2>/dev/null)
            print_colored_text "36" "  Информация: $container_info"
        fi
        
        return 0
    fi
}

# Проверяем доступность HTTP эндпоинта
check_http_endpoint() {
    local service_name="$1"
    local endpoint="$2"
    local max_attempts=$ATTEMPTS
    local attempt=1
    local status_code=0
    
    check_curl
    
    print_colored_text "36" "Проверка HTTP-доступности $service_name ($endpoint)..."
    
    while [ $attempt -le $max_attempts ]; do
        if [ "$VERBOSE" = true ]; then
            print_colored_text "36" "  Попытка $attempt/$max_attempts..."
        fi
        
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null)
        
        if [ "$status_code" = "200" ] || [ "$status_code" = "302" ] || [ "$status_code" = "401" ]; then
            print_colored_text "32" "HTTP-эндпоинт $service_name доступен (код ответа: $status_code)"
            return 0
        else
            if [ "$VERBOSE" = true ]; then
                print_colored_text "33" "  Ожидание $TIMEOUT секунд перед следующей попыткой..."
            fi
            
            sleep $TIMEOUT
            attempt=$((attempt + 1))
        fi
    done
    
    print_colored_text "31" "HTTP-эндпоинт $service_name недоступен после $max_attempts попыток (последний код ответа: $status_code)"
    return 1
}

# Проверяем статус Elasticsearch
check_elasticsearch() {
    local host="localhost"
    local port="9200"
    local container_name="elasticsearch"
    local container_id
    container_id=$(docker ps -q -f name=aquastream-elasticsearch)
    
    if [ -z "$container_id" ]; then
        print_colored_text "31" "Контейнер Elasticsearch не запущен"
        return 1
    fi
    
    print_colored_text "36" "Проверка статуса Elasticsearch..."
    
    check_curl
    
    # Проверяем доступность API
    local health_response=$(curl -s "http://$host:$port/_cluster/health" 2>/dev/null)
    
    if [ -z "$health_response" ]; then
        print_colored_text "31" "Не удалось получить ответ от Elasticsearch API"
        
        if [ "$SHOW_LOGS" = true ]; then
            print_colored_text "36" "Последние логи Elasticsearch:"
            docker logs --tail=20 "$container_id" 2>/dev/null || echo "Логи недоступны"
        fi
        
        return 1
    fi
    
    # Парсим статус из JSON-ответа
    local status=$(echo "$health_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$status" = "green" ]; then
        print_colored_text "32" "Elasticsearch работает нормально (статус: green)"
    elif [ "$status" = "yellow" ]; then
        print_colored_text "33" "Elasticsearch работает, но есть предупреждения (статус: yellow)"
    elif [ "$status" = "red" ]; then
        print_colored_text "31" "Elasticsearch в аварийном состоянии (статус: red)"
    else
        print_colored_text "31" "Неизвестный статус Elasticsearch: $status"
    fi
    
    if [ "$VERBOSE" = true ]; then
        local indices_count=$(curl -s "http://$host:$port/_cat/indices?h=i" 2>/dev/null | wc -l)
        indices_count=$(echo "$indices_count" | xargs) # trim spaces
        print_colored_text "36" "  Количество индексов: $indices_count"
    fi
    
    return 0
}

# Проверяем статус Logstash
check_logstash() {
    local container_name="logstash"
    local container_id
    container_id=$(docker ps -q -f name=aquastream-logstash)
    
    if [ -z "$container_id" ]; then
        print_colored_text "31" "Контейнер Logstash не запущен"
        return 1
    fi
    
    print_colored_text "36" "Проверка статуса Logstash..."
    
    # Проверяем порт
    if docker exec "$container_id" bash -c "nc -z localhost 5000" &>/dev/null; then
        print_colored_text "32" "Logstash работает и слушает порт 5000"
    else
        print_colored_text "31" "Logstash запущен, но не слушает порт 5000"
        
        if [ "$SHOW_LOGS" = true ]; then
            print_colored_text "36" "Последние логи Logstash:"
            docker logs --tail=20 "$container_id" 2>/dev/null || echo "Логи недоступны"
        fi
        
        return 1
    fi
    
    if [ "$VERBOSE" = true ]; then
        print_colored_text "36" "  Проверка логов Logstash на наличие ошибок..."
        docker exec "$container_id" bash -c "cat /usr/share/logstash/logs/logstash-plain.log | grep -i error | tail -5" 2>/dev/null || echo "  Ошибок не найдено или логи недоступны"
    fi
    
    return 0
}

# Проверяем статус Kibana
check_kibana() {
    local host="localhost"
    local port="5601"
    local container_name="kibana"
    local container_id
    container_id=$(docker ps -q -f name=aquastream-kibana)
    
    if [ -z "$container_id" ]; then
        print_colored_text "31" "Контейнер Kibana не запущен"
        return 1
    fi
    
    print_colored_text "36" "Проверка статуса Kibana..."
    
    check_curl
    
    # Проверяем доступность API
    local max_attempts=$ATTEMPTS
    local attempt=1
    local status_code=0
    
    while [ $attempt -le $max_attempts ]; do
        if [ "$VERBOSE" = true ]; then
            print_colored_text "36" "  Попытка $attempt/$max_attempts..."
        fi
        
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://$host:$port/api/status" 2>/dev/null)
        
        if [ "$status_code" = "200" ] || [ "$status_code" = "302" ]; then
            print_colored_text "32" "Kibana доступна (код ответа: $status_code)"
            
            if [ "$VERBOSE" = true ]; then
                local status_json=$(curl -s "http://$host:$port/api/status" 2>/dev/null)
                local status=$(echo "$status_json" | grep -o '"overall":{[^}]*}' | grep -o '"level":"[^"]*"' | cut -d'"' -f4)
                print_colored_text "36" "  Статус Kibana: $status"
            fi
            
            return 0
        else
            if [ "$VERBOSE" = true ]; then
                print_colored_text "33" "  Ожидание $TIMEOUT секунд перед следующей попыткой..."
            fi
            
            sleep $TIMEOUT
            attempt=$((attempt + 1))
        fi
    done
    
    print_colored_text "31" "Kibana недоступна после $max_attempts попыток (последний код ответа: $status_code)"
    
    if [ "$SHOW_LOGS" = true ]; then
        print_colored_text "36" "Последние логи Kibana:"
        docker logs --tail=20 "$container_id" 2>/dev/null || echo "Логи недоступны"
    fi
    
    return 1
}

# Функция для проверки всех сервисов
check_all_services() {
    local containers
    containers=$(eval "$CMD ps --services" 2>/dev/null)
    
    if [ -z "$containers" ]; then
        print_colored_text "31" "Не найдено запущенных контейнеров или ошибка в команде Docker Compose."
        exit 1
    fi
    
    print_colored_text "36" "Проверка статуса всех сервисов..."
    
    local total_services=0
    local failed_services=0
    
    for service in $containers; do
        ((total_services++))
        
        check_container_status "$service"
        if [ $? -ne 0 ]; then
            ((failed_services++))
            continue
        fi
        
        # HTTP-проверка только для веб-сервисов
        if [ "$CHECK_HTTP" = true ]; then
            case "$service" in
                frontend)
                    check_http_endpoint "Frontend" "http://localhost:3000"
                    ;;
                api-gateway)
                    check_http_endpoint "API Gateway" "http://localhost:8080/api/health"
                    ;;
                backend-user)
                    check_http_endpoint "User Service" "http://localhost:8081/actuator/health"
                    ;;
                backend-notification)
                    check_http_endpoint "Notification Service" "http://localhost:8082/actuator/health"
                    ;;
                backend-planning)
                    check_http_endpoint "Planning Service" "http://localhost:8083/actuator/health"
                    ;;
            esac
        fi
    done
    
    # Дополнительно проверяем компоненты ELK-стека
    if [ "$CHECK_ELK" = true ]; then
        print_colored_text "36" "Проверка компонентов ELK-стека..."
        
        ((total_services+=3)) # Elasticsearch, Logstash, Kibana
        
        check_elasticsearch
        if [ $? -ne 0 ]; then
            ((failed_services++))
        fi
        
        check_logstash
        if [ $? -ne 0 ]; then
            ((failed_services++))
        fi
        
        check_kibana
        if [ $? -ne 0 ]; then
            ((failed_services++))
        fi
    fi
    
    # Выводим итоговое сообщение
    print_colored_text "36" "Проверка завершена. Всего проверено сервисов: $total_services"
    
    if [ $failed_services -eq 0 ]; then
        print_colored_text "32" "Все сервисы работают нормально."
        return 0
    else
        print_colored_text "31" "Обнаружены проблемы с $failed_services сервисами."
        return 1
    fi
}

# Проверяем определенный сервис по имени
check_specific_service() {
    local service_name="$1"
    print_colored_text "36" "Проверка статуса сервиса $service_name..."
    
    # Проверка компонентов ELK-стека
    if [ "$CHECK_ELK" = true ] || [ "$service_name" = "elasticsearch" ] || [ "$service_name" = "logstash" ] || [ "$service_name" = "kibana" ]; then
        case "$service_name" in
            elasticsearch)
                check_elasticsearch
                return $?
                ;;
            logstash)
                check_logstash
                return $?
                ;;
            kibana)
                check_kibana
                return $?
                ;;
        esac
    fi
    
    # Проверка обычных контейнеров Docker Compose
    check_container_status "$service_name"
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    # HTTP-проверка только для веб-сервисов
    if [ "$CHECK_HTTP" = true ]; then
        case "$service_name" in
            frontend)
                check_http_endpoint "Frontend" "http://localhost:3000"
                ;;
            api-gateway)
                check_http_endpoint "API Gateway" "http://localhost:8080/api/health"
                ;;
            backend-user)
                check_http_endpoint "User Service" "http://localhost:8081/actuator/health"
                ;;
            backend-notification)
                check_http_endpoint "Notification Service" "http://localhost:8082/actuator/health"
                ;;
            backend-planning)
                check_http_endpoint "Planning Service" "http://localhost:8083/actuator/health"
                ;;
        esac
    fi
    
    return 0
}

# Основная логика скрипта
if [ -n "$SERVICE" ]; then
    check_specific_service "$SERVICE"
    exit $?
else
    check_all_services
    exit $?
fi 