#!/bin/bash

# Определяем файл для логирования
SCRIPT_DIR="$(dirname "$0")"
LOGFILE="$SCRIPT_DIR/restart.log"
touch "$LOGFILE"

# Вывод текста с заданным цветом
print_colored_text() {
    local color_code=$1
    local text=$2
    echo -e "\033[${color_code}m${text}\033[0m"
}

# Функция для логирования
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            print_colored_text "32" "[INFO] $timestamp - $message"
            echo "[INFO] $timestamp - $message" >> "$LOGFILE"
            ;;
        "WARN")
            print_colored_text "33" "[WARN] $timestamp - $message"
            echo "[WARN] $timestamp - $message" >> "$LOGFILE"
            ;;
        "ERROR")
            print_colored_text "31" "[ERROR] $timestamp - $message"
            echo "[ERROR] $timestamp - $message" >> "$LOGFILE"
            ;;
    esac
}

# Функция для вывода подсказки
show_help() {
    echo "Использование: $0 [опции]"
    echo "Опции:"
    echo "  -h, --help            Показать эту подсказку"
    echo "  -s, --service СЕРВИС  Перезапустить только указанный сервис (например: frontend, api-gateway)"
    echo "  -b, --build           Пересобрать образы перед запуском"
    echo "  -c, --skip-check      Пропустить проверку работоспособности после запуска"
    echo "  -r, --remove          Удалить контейнеры при остановке (эквивалент docker compose down)"
    echo "  -v, --volumes         Удалить также и тома (только вместе с -r)"
    echo "  -p, --prune           Удалить неиспользуемые контейнеры, сети и образы после перезапуска"
    echo "  -t, --timeout N       Таймаут между попытками проверки (по умолчанию: 5 секунд)"
    echo "  -a, --attempts N      Количество попыток проверки (по умолчанию: 3)"
    echo "  --verbose             Подробный вывод"
    echo
    echo "Примеры:"
    echo "  $0                   Перезапустить все сервисы"
    echo "  $0 -s frontend       Перезапустить только frontend"
    echo "  $0 -b                Пересобрать образы перед перезапуском"
    echo "  $0 -r -v             Перезапустить с удалением контейнеров и томов"
    echo
    echo "Примечание:"
    echo "  После выполнения скрипт отобразит статус всех контейнеров, включая остановленные,"
    echo "  что поможет диагностировать проблемы с запуском сервисов."
}

# Перехват ошибок
trap 'log_message "ERROR" "Ошибка на строке $LINENO. Скрипт прекращает выполнение."; exit 1' ERR

# Инициализация переменных
SERVICE=""
BUILD=false
SKIP_CHECK=false
REMOVE=false
VOLUMES=false
PRUNE=false
TIMEOUT=5
ATTEMPTS=3
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
        -b|--build)
            BUILD=true
            shift
            ;;
        -c|--skip-check)
            SKIP_CHECK=true
            shift
            ;;
        -r|--remove)
            REMOVE=true
            shift
            ;;
        -v|--volumes)
            VOLUMES=true
            shift
            ;;
        -p|--prune)
            PRUNE=true
            shift
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -a|--attempts)
            ATTEMPTS="$2"
            shift 2
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

# Переход в директорию со скриптом
cd "$SCRIPT_DIR"

# Команда для работы с Docker Compose
CMD="docker compose -f ../compose/docker-compose.yml -f ../compose/docker-compose.override.yml"

# Остановка сервисов
if [ -z "$SERVICE" ]; then
    log_message "INFO" "Перезапуск проекта: остановка всех контейнеров..."
    
    if [ "$REMOVE" = true ]; then
        DOWN_OPTIONS="--remove-orphans"
        
        if [ "$VOLUMES" = true ]; then
            DOWN_OPTIONS="$DOWN_OPTIONS -v"
            log_message "INFO" "Удаление контейнеров вместе с томами..."
        else
            log_message "INFO" "Удаление контейнеров..."
        fi
        
        if ! $CMD down $DOWN_OPTIONS; then
            log_message "ERROR" "Не удалось остановить и удалить контейнеры!"
        fi
        
        # Проверяем, остались ли контейнеры, и принудительно удаляем их
        REMAINING_CONTAINERS=$(docker ps -a -f "name=aquastream" -q)
        if [ ! -z "$REMAINING_CONTAINERS" ]; then
            log_message "WARN" "Обнаружены оставшиеся контейнеры. Принудительное удаление..."
            docker rm -f $REMAINING_CONTAINERS 2>/dev/null || true
        fi
    else
        if ! $CMD stop; then
            log_message "ERROR" "Не удалось остановить контейнеры!"
        fi
    fi
else
    log_message "INFO" "Перезапуск сервиса '$SERVICE'..."
    
    if ! $CMD stop $SERVICE; then
        log_message "ERROR" "Не удалось остановить сервис '$SERVICE'!"
    fi
fi

# Пересборка образов, если запрошена
if [ "$BUILD" = true ]; then
    if [ -z "$SERVICE" ]; then
        log_message "INFO" "Сборка всех Docker образов..."
        if ! $CMD build; then
            log_message "ERROR" "Ошибка при сборке Docker образов!"
        fi
    else
        log_message "INFO" "Сборка Docker образа для '$SERVICE'..."
        if ! $CMD build $SERVICE; then
            log_message "ERROR" "Ошибка при сборке Docker образа для '$SERVICE'!"
        fi
    fi
fi

# Запуск сервисов
if [ -z "$SERVICE" ]; then
    log_message "INFO" "Запуск критических сервисов (postgres, zookeeper, kafka)..."
    
    # Запускаем базовые сервисы, от которых зависят остальные
    $CMD up -d postgres zookeeper
    
    # Ожидаем готовности PostgreSQL
    log_message "INFO" "Ожидание готовности PostgreSQL..."
    max_attempts=30
    attempts=0
    while ! $CMD exec postgres pg_isready -U postgres &>/dev/null; do
        attempts=$((attempts+1))
        if [ $attempts -ge $max_attempts ]; then
            log_message "ERROR" "PostgreSQL не готов после $max_attempts попыток!"
            break
        fi
        sleep 1
    done
    
    # Запускаем Kafka после Zookeeper
    log_message "INFO" "Запуск Kafka..."
    $CMD up -d kafka
    
    # Ожидаем готовности Kafka
    log_message "INFO" "Ожидание готовности Kafka..."
    attempts=0
    while ! $CMD exec kafka kafka-topics --bootstrap-server localhost:9092 --list &>/dev/null; do
        attempts=$((attempts+1))
        if [ $attempts -ge $max_attempts ]; then
            log_message "ERROR" "Kafka не готова после $max_attempts попыток!"
            break
        fi
        sleep 1
    done
    
    # Запускаем микросервисы
    log_message "INFO" "Запуск всех микросервисов..."
    $CMD up -d user-service crew-service notification-service planning-service
    
    # Ожидаем запуска микросервисов
    log_message "INFO" "Ожидание запуска микросервисов..."
    sleep 5
    
    # Запускаем API Gateway
    log_message "INFO" "Запуск API Gateway..."
    $CMD up -d api-gateway
    
    # Ожидаем запуска API Gateway
    log_message "INFO" "Ожидание запуска API Gateway..."
    attempts=0
    max_attempts=60  # Увеличенное время ожидания для API Gateway
    while ! curl -s http://localhost:8080/actuator/health &>/dev/null; do
        attempts=$((attempts+1))
        if [ $attempts -ge $max_attempts ]; then
            log_message "WARN" "API Gateway не ответил после $max_attempts попыток!"
            break
        fi
        sleep 1
    done
    
    # Запускаем фронтенд и мониторинг
    log_message "INFO" "Запуск фронтенда и сервисов мониторинга..."
    $CMD up -d frontend prometheus grafana
else
    log_message "INFO" "Запуск сервиса '$SERVICE' в фоновом режиме..."
    if ! $CMD up -d $SERVICE; then
        log_message "ERROR" "Ошибка при запуске сервиса '$SERVICE'!"
    fi
fi

# Проверка состояния сервисов, если не пропущена
if [ "$SKIP_CHECK" != true ]; then
    log_message "INFO" "Проверка работоспособности сервисов..."
    
    CHECK_OPTS=""
    if [ ! -z "$SERVICE" ]; then
        CHECK_OPTS="$CHECK_OPTS -s $SERVICE"
    fi
    
    if [ "$VERBOSE" = true ]; then
        CHECK_OPTS="$CHECK_OPTS -v"
    fi
    
    CHECK_OPTS="$CHECK_OPTS -t $TIMEOUT -a $ATTEMPTS -p"
    
    if ! ./check.sh $CHECK_OPTS; then
        log_message "WARN" "Некоторые сервисы не прошли проверку работоспособности!"
    else
        if [ -z "$SERVICE" ]; then
            log_message "INFO" "Все сервисы успешно запущены и прошли проверку."
        else
            log_message "INFO" "Сервис '$SERVICE' успешно запущен и прошел проверку."
        fi
    fi
fi

# Очистка, если запрошена
if [ "$PRUNE" = true ]; then
    log_message "INFO" "Выполнение очистки неиспользуемых ресурсов..."
    
    if [ "$VERBOSE" = true ]; then
        log_message "INFO" "Удаление неиспользуемых контейнеров..."
    fi
    docker container prune -f
    
    if [ "$VERBOSE" = true ]; then
        log_message "INFO" "Удаление неиспользуемых сетей..."
    fi
    docker network prune -f
    
    if [ "$VERBOSE" = true ]; then
        log_message "INFO" "Удаление неиспользуемых образов..."
    fi
    docker image prune -f
    
    log_message "INFO" "Очистка завершена!"
fi

# Вывод состояния запущенных контейнеров
log_message "INFO" "Статус всех контейнеров (включая остановленные):"

# Используем docker ps -a для отображения всех контейнеров, включая остановленные
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

log_message "INFO" "Перезапуск завершен."

# =================================================================
# ВЫЯВЛЕННЫЕ ПРОБЛЕМЫ И ВОЗМОЖНЫЕ РЕШЕНИЯ
# =================================================================
# 
# 1. Проблема: Контейнеры останавливаются из-за отсутствия библиотеки logstash
#    Решение: Добавьте следующую зависимость в build.gradle каждого микросервиса:
#    implementation 'net.logstash.logback:logstash-logback-encoder:7.4'
#
# 2. Проблема: Frontend не может подключиться к api-gateway
#    Решение: В файле docker-compose.yml убедитесь, что сервис api-gateway 
#    имеет правильное network_alias:
#    services:
#      api-gateway:
#        ...
#        networks:
#          aquastream-network:
#            aliases:
#              - api-gateway
#
# 3. Проблема: Сервисы могут запускаться слишком быстро, без ожидания готовности зависимых сервисов
#    Решение: Используйте параметр depends_on с условием service_healthy для ожидания
#    полной готовности критических сервисов:
#    depends_on:
#      postgres:
#        condition: service_healthy
#      kafka:
#        condition: service_healthy
#
# 4. Проблема: Несогласованность переменных окружения между сервисами
#    Решение: Проверьте настройки .env файлов и убедитесь, что все сервисы
#    используют одинаковые переменные окружения для доступа к базе данных,
#    Kafka и другим компонентам инфраструктуры. 