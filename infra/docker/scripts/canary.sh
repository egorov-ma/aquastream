#!/bin/bash
#
# AquaStream - Скрипт для управления канареечным развертыванием
# Версия: 1.1.0
#

# Подключаем библиотеку утилит
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

# Устанавливаем перехватчик ошибок
setup_error_trap

# Функция для вывода подсказки
show_help() {
    cat << EOF
Использование: $0 [опции]
Опции:
  -h, --help               Показать эту подсказку
  -s, --start              Запустить канареечное окружение
  -p, --stop               Остановить канареечное окружение
  -r, --restart            Перезапустить канареечное окружение
  -t, --traffic ПРОЦЕНТ    Установить процент трафика на канареечную версию (1-100)
  -v, --version ВЕРСИЯ     Указать версию для канареечного развертывания
  -m, --monitor            Открыть мониторинг канареечного развертывания
  -l, --logs               Показать логи канареечных сервисов
  -c, --compare            Сравнить метрики стабильной и канареечной версий
  -x, --promote            Повысить канареечную версию до стабильной
  -e, --elk                Include ELK stack in canary deployment
  --verbose                Подробный вывод

Примеры:
  $0 -s -v 1.2.3           Запустить канареечное окружение с версией 1.2.3
  $0 -t 20                 Установить 20% трафика на канареечную версию
  $0 -m                    Открыть дашборд мониторинга канареечного развертывания
  $0 -x                    Повысить канареечную версию до стабильной (если тесты успешны)
  $0 -e                    Include ELK stack in canary deployment
EOF
}

# Инициализация переменных
START=false
STOP=false
RESTART=false
TRAFFIC=""
VERSION=""
MONITOR=false
LOGS=false
COMPARE=false
PROMOTE=false
INCLUDE_ELK=false
VERBOSE=false

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--start)
            START=true
            shift
            ;;
        -p|--stop)
            STOP=true
            shift
            ;;
        -r|--restart)
            RESTART=true
            shift
            ;;
        -t|--traffic)
            TRAFFIC="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -m|--monitor)
            MONITOR=true
            shift
            ;;
        -l|--logs)
            LOGS=true
            shift
            ;;
        -c|--compare)
            COMPARE=true
            shift
            ;;
        -x|--promote)
            PROMOTE=true
            shift
            ;;
        -e|--elk)
            INCLUDE_ELK=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            export LOG_LEVEL=$LOG_LEVEL_DEBUG
            shift
            ;;
        *)
            log_error "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Проверка несовместимых опций
if [[ "$START" == "true" && "$STOP" == "true" ]]; then
    log_error "Нельзя одновременно запустить и остановить канареечное окружение"
    exit 1
fi

# Проверка зависимостей
if ! check_dependencies; then
    log_error "Отсутствуют необходимые зависимости. Установите их и попробуйте снова."
    exit 1
fi

# Проверка наличия файла конфигурации канареечного развертывания
if [[ ! -f "$DOCKER_COMPOSE_CANARY" ]]; then
    log_error "Файл конфигурации канареечного развертывания не найден: $DOCKER_COMPOSE_CANARY"
    exit 1
fi

# Создание директорий для канареечной конфигурации, если их нет
mkdir -p "${DOCKER_COMPOSE_DIR}/../config/canary/templates" 2>/dev/null
mkdir -p "${DOCKER_COMPOSE_DIR}/../config/canary/grafana/provisioning/datasources" 2>/dev/null
mkdir -p "${DOCKER_COMPOSE_DIR}/../config/canary/grafana/dashboards" 2>/dev/null

# Запуск канареечного окружения
start_canary() {
    log_info "Запуск канареечного окружения..."
    
    # Устанавливаем переменные окружения для канареечного развертывания
    export USE_CANARY=true
    
    if [[ -n "$VERSION" ]]; then
        export CANARY_VERSION="$VERSION"
        log_info "Устанавливаем версию канареечного развертывания: $VERSION"
    else
        export CANARY_VERSION="canary"
        log_info "Версия не указана, используем canary по умолчанию"
    fi
    
    if [[ -n "$TRAFFIC" ]]; then
        export CANARY_TRAFFIC_PERCENT="$TRAFFIC"
        log_info "Устанавливаем процент трафика на канареечную версию: $TRAFFIC%"
    else
        export CANARY_TRAFFIC_PERCENT=10
        log_info "Процент трафика не указан, используем 10% по умолчанию"
    fi
    
    # Запускаем канареечные сервисы
    local docker_compose_cmd
    docker_compose_cmd=$(get_docker_compose_cmd)
    
    # Создаем сеть, если она не существует
    if ! docker network inspect aquastream-network &>/dev/null; then
        log_info "Создаем сеть aquastream-network..."
        docker network create aquastream-network
    fi
    
    # Запускаем канареечные сервисы
    if ! $docker_compose_cmd up -d traffic-manager api-gateway-canary user-service-canary crew-service-canary grafana-canary; then
        log_error "Не удалось запустить канареечное окружение"
        return 1
    fi
    
    log_info "Канареечное окружение успешно запущено!"
    log_info "Трафик распределяется: ${CANARY_TRAFFIC_PERCENT}% на канареечную версию, ${remaining}% на стабильную версию"
    log_info "Мониторинг доступен по адресу: http://localhost:3002 (логин: admin, пароль: admin)"
    
    # Проверяем доступность основных сервисов
    if ! check_http_endpoint "http://localhost:80/health" 200 10 1; then
        log_warn "Сервис маршрутизации трафика недоступен"
    fi
    
    return 0
}

# Остановка канареечного окружения
stop_canary() {
    log_info "Остановка канареечного окружения..."
    
    # Устанавливаем переменные окружения для канареечного развертывания
    export USE_CANARY=true
    
    # Останавливаем канареечные сервисы
    local docker_compose_cmd
    docker_compose_cmd=$(get_docker_compose_cmd)
    
    # Останавливаем канареечные сервисы
    if ! $docker_compose_cmd stop traffic-manager api-gateway-canary user-service-canary crew-service-canary grafana-canary; then
        log_error "Не удалось остановить канареечные сервисы"
        return 1
    fi
    
    # Удаляем контейнеры
    if ! $docker_compose_cmd rm -f traffic-manager api-gateway-canary user-service-canary crew-service-canary grafana-canary; then
        log_warn "Не удалось удалить канареечные контейнеры"
    fi
    
    log_info "Канареечное окружение успешно остановлено"
    
    return 0
}

# Перезапуск канареечного окружения
restart_canary() {
    log_info "Перезапуск канареечного окружения..."
    
    if ! stop_canary; then
        log_error "Не удалось остановить канареечное окружение"
        return 1
    fi
    
    if ! start_canary; then
        log_error "Не удалось запустить канареечное окружение"
        return 1
    fi
    
    log_info "Канареечное окружение успешно перезапущено"
    
    return 0
}

# Установка процента трафика на канареечную версию
set_canary_traffic() {
    if [[ -z "$TRAFFIC" ]]; then
        log_error "Не указан процент трафика"
        return 1
    fi
    
    # Проверяем, что значение в допустимом диапазоне
    if [[ "$TRAFFIC" -lt 0 || "$TRAFFIC" -gt 100 ]]; then
        log_error "Процент трафика должен быть в диапазоне от 0 до 100"
        return 1
    fi
    
    log_info "Устанавливаем процент трафика на канареечную версию: $TRAFFIC%"
    
    # Проверяем, запущен ли контейнер traffic-manager
    if ! docker ps --format "{{.Names}}" | grep -q "aquastream-traffic-manager"; then
        log_error "Сервис маршрутизации трафика не запущен"
        return 1
    fi
    
    # Устанавливаем переменную окружения для контейнера
    if ! docker exec aquastream-traffic-manager sh -c "export CANARY_TRAFFIC_PERCENT=$TRAFFIC"; then
        log_error "Не удалось установить процент трафика"
        return 1
    fi
    
    # Перезапускаем Nginx для применения новых настроек
    if ! docker exec aquastream-traffic-manager nginx -s reload; then
        log_error "Не удалось перезапустить Nginx"
        return 1
    fi
    
    log_info "Процент трафика на канареечную версию успешно установлен: $TRAFFIC%"
    
    return 0
}

# Открытие мониторинга канареечного развертывания
open_monitor() {
    log_info "Открытие мониторинга канареечного развертывания..."
    
    # Проверяем, запущен ли контейнер grafana-canary
    if ! docker ps --format "{{.Names}}" | grep -q "aquastream-grafana-canary"; then
        log_warn "Мониторинг канареечного развертывания не запущен"
        
        # Спрашиваем пользователя, хочет ли он запустить канареечное окружение
        read -r -p "Хотите запустить канареечное окружение? [y/N] " response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            if ! start_canary; then
                log_error "Не удалось запустить канареечное окружение"
                return 1
            fi
        else
            return 1
        fi
    fi
    
    log_info "Мониторинг доступен по адресу: http://localhost:3002 (логин: admin, пароль: admin)"
    
    # Пытаемся открыть браузер с дашбордом (если это возможно)
    if command -v open &>/dev/null; then
        open "http://localhost:3002/d/canary/canary-deployment-monitoring"
    elif command -v xdg-open &>/dev/null; then
        xdg-open "http://localhost:3002/d/canary/canary-deployment-monitoring"
    elif command -v google-chrome &>/dev/null; then
        google-chrome "http://localhost:3002/d/canary/canary-deployment-monitoring"
    else
        log_info "Пожалуйста, откройте следующий URL в вашем браузере:"
        log_info "http://localhost:3002/d/canary/canary-deployment-monitoring"
    fi
    
    return 0
}

# Показ логов канареечных сервисов
show_canary_logs() {
    log_info "Показ логов канареечных сервисов..."
    
    # Устанавливаем переменные окружения для канареечного развертывания
    export USE_CANARY=true
    
    # Получаем команду docker-compose
    local docker_compose_cmd
    docker_compose_cmd=$(get_docker_compose_cmd)
    
    # Показываем логи канареечных сервисов
    $docker_compose_cmd logs --tail=100 -f api-gateway-canary user-service-canary crew-service-canary
    
    return 0
}

# Сравнение метрик стабильной и канареечной версий
compare_metrics() {
    log_info "Сравнение метрик стабильной и канареечной версий..."
    
    # Проверяем, запущен ли контейнер prometheus
    if ! docker ps --format "{{.Names}}" | grep -q "aquastream-prometheus"; then
        log_error "Prometheus не запущен, невозможно сравнить метрики"
        return 1
    fi
    
    # Проверяем, запущены ли канареечные сервисы
    if ! docker ps --format "{{.Names}}" | grep -q "aquastream-api-canary"; then
        log_error "Канареечные сервисы не запущены, невозможно сравнить метрики"
        return 1
    fi
    
    # Получаем метрики из Prometheus
    log_info "Получение метрик из Prometheus..."
    
    # Метрики для стабильной версии
    stable_success_rate=$(curl -s "http://localhost:9091/api/v1/query?query=sum(rate(http_server_requests_seconds_count{status=~\"2..\",service=\"api-gateway\"}[5m]))/sum(rate(http_server_requests_seconds_count{service=\"api-gateway\"}[5m]))*100" | jq -r '.data.result[0].value[1]' 2>/dev/null || echo "N/A")
    stable_latency=$(curl -s "http://localhost:9091/api/v1/query?query=sum(rate(http_server_requests_seconds_sum{service=\"api-gateway\"}[5m]))/sum(rate(http_server_requests_seconds_count{service=\"api-gateway\"}[5m]))" | jq -r '.data.result[0].value[1]' 2>/dev/null || echo "N/A")
    
    # Метрики для канареечной версии
    canary_success_rate=$(curl -s "http://localhost:9091/api/v1/query?query=sum(rate(http_server_requests_seconds_count{status=~\"2..\",service=\"api-gateway-canary\"}[5m]))/sum(rate(http_server_requests_seconds_count{service=\"api-gateway-canary\"}[5m]))*100" | jq -r '.data.result[0].value[1]' 2>/dev/null || echo "N/A")
    canary_latency=$(curl -s "http://localhost:9091/api/v1/query?query=sum(rate(http_server_requests_seconds_sum{service=\"api-gateway-canary\"}[5m]))/sum(rate(http_server_requests_seconds_count{service=\"api-gateway-canary\"}[5m]))" | jq -r '.data.result[0].value[1]' 2>/dev/null || echo "N/A")
    
    # Вывод результатов
    print_colored_text "$COLOR_CYAN" "=== Сравнение метрик стабильной и канареечной версий ==="
    print_colored_text "$COLOR_CYAN" "Показатель успешных запросов (%):"
    print_colored_text "$COLOR_GREEN" "  Стабильная версия: $stable_success_rate%"
    print_colored_text "$COLOR_YELLOW" "  Канареечная версия: $canary_success_rate%"
    print_colored_text "$COLOR_CYAN" "Средняя задержка (секунды):"
    print_colored_text "$COLOR_GREEN" "  Стабильная версия: $stable_latency с"
    print_colored_text "$COLOR_YELLOW" "  Канареечная версия: $canary_latency с"
    
    # Проверка на аномалии
    if [[ "$canary_success_rate" != "N/A" && "$stable_success_rate" != "N/A" ]]; then
        success_diff=$(echo "$canary_success_rate - $stable_success_rate" | bc 2>/dev/null || echo "N/A")
        
        if [[ "$success_diff" != "N/A" && $(echo "$success_diff < -5" | bc -l) -eq 1 ]]; then
            print_colored_text "$COLOR_RED" "ВНИМАНИЕ: Показатель успешных запросов канареечной версии значительно ниже стабильной версии!"
        fi
    fi
    
    if [[ "$canary_latency" != "N/A" && "$stable_latency" != "N/A" ]]; then
        latency_ratio=$(echo "$canary_latency / $stable_latency" | bc 2>/dev/null || echo "N/A")
        
        if [[ "$latency_ratio" != "N/A" && $(echo "$latency_ratio > 1.5" | bc -l) -eq 1 ]]; then
            print_colored_text "$COLOR_RED" "ВНИМАНИЕ: Задержка канареечной версии значительно выше стабильной версии!"
        fi
    fi
    
    print_colored_text "$COLOR_CYAN" "Подробная информация доступна в дашборде Grafana: http://localhost:3002"
    
    return 0
}

# Повышение канареечной версии до стабильной
promote_canary() {
    log_info "Повышение канареечной версии до стабильной..."
    
    # Проверяем, запущены ли канареечные сервисы
    if ! docker ps --format "{{.Names}}" | grep -q "aquastream-api-canary"; then
        log_error "Канареечные сервисы не запущены, невозможно повысить версию"
        return 1
    fi
    
    # Получаем версию канареечного развертывания
    local canary_version
    if [[ -n "$VERSION" ]]; then
        canary_version="$VERSION"
    else
        canary_version=$(docker inspect aquastream-api-canary --format "{{.Config.Image}}" | sed 's/.*://')
    fi
    
    log_info "Повышение версии $canary_version до стабильной..."
    
    # Спрашиваем пользователя о подтверждении
    read -r -p "Вы уверены, что хотите повысить канареечную версию $canary_version до стабильной? [y/N] " response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_info "Операция отменена"
        return 0
    fi
    
    # Получаем команду docker-compose
    local docker_compose_cmd
    docker_compose_cmd=$(get_docker_compose_cmd)
    
    # Создаем теги для стабильной версии
    docker tag "aquastream-api-gateway:$canary_version" "aquastream-api-gateway:stable"
    docker tag "aquastream-user-service:$canary_version" "aquastream-user-service:stable"
    docker tag "aquastream-crew-service:$canary_version" "aquastream-crew-service:stable"
    
    # Перезапускаем стабильные сервисы
    if ! $docker_compose_cmd up -d --no-deps api-gateway user-service crew-service; then
        log_error "Не удалось перезапустить стабильные сервисы"
        return 1
    fi
    
    log_info "Канареечная версия $canary_version успешно повышена до стабильной"
    log_info "Рекомендуется постепенно увеличить процент трафика до 100%, а затем остановить канареечное окружение"
    
    return 0
}

# Главная логика
main() {
    log_info "Запуск скрипта управления канареечным развертыванием..."
    
    # Проверяем, что указана хотя бы одна опция
    if [[ "$START" != "true" && "$STOP" != "true" && "$RESTART" != "true" && -z "$TRAFFIC" && "$MONITOR" != "true" && "$LOGS" != "true" && "$COMPARE" != "true" && "$PROMOTE" != "true" ]]; then
        log_error "Необходимо указать хотя бы одну опцию"
        show_help
        exit 1
    fi
    
    # Выполняем соответствующие действия
    if [[ "$START" == "true" ]]; then
        if ! start_canary; then
            log_error "Не удалось запустить канареечное окружение"
            exit 1
        fi
    fi
    
    if [[ "$STOP" == "true" ]]; then
        if ! stop_canary; then
            log_error "Не удалось остановить канареечное окружение"
            exit 1
        fi
    fi
    
    if [[ "$RESTART" == "true" ]]; then
        if ! restart_canary; then
            log_error "Не удалось перезапустить канареечное окружение"
            exit 1
        fi
    fi
    
    if [[ -n "$TRAFFIC" ]]; then
        if ! set_canary_traffic; then
            log_error "Не удалось установить процент трафика"
            exit 1
        fi
    fi
    
    if [[ "$MONITOR" == "true" ]]; then
        if ! open_monitor; then
            log_error "Не удалось открыть мониторинг"
            exit 1
        fi
    fi
    
    if [[ "$LOGS" == "true" ]]; then
        if ! show_canary_logs; then
            log_error "Не удалось показать логи"
            exit 1
        fi
    fi
    
    if [[ "$COMPARE" == "true" ]]; then
        if ! compare_metrics; then
            log_error "Не удалось сравнить метрики"
            exit 1
        fi
    fi
    
    if [[ "$PROMOTE" == "true" ]]; then
        if ! promote_canary; then
            log_error "Не удалось повысить канареечную версию"
            exit 1
        fi
    fi
    
    log_info "Скрипт управления канареечным развертыванием завершен"
    
    return 0
}

# Запуск основной логики
main 