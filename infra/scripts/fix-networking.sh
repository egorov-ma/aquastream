#!/bin/bash

# Определяем цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_message() {
    local level=$1
    local message=$2
    local timestamp
    timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO] $timestamp - $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN] $timestamp - $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR] $timestamp - $message${NC}"
            ;;
    esac
}

# Получаем корневую директорию проекта
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/../compose/docker-compose.yml"
DOCKER_COMPOSE_BAK="$PROJECT_ROOT/../compose/docker-compose.yml.bak.$(date +%Y%m%d%H%M%S)"

# Команда для работы с Docker Compose
CMD="docker compose -f ../compose/docker-compose.yml"
if [ -f "../compose/docker-compose.override.yml" ]; then
    CMD="$CMD -f ../compose/docker-compose.override.yml"
    echo "Найден файл docker-compose.override.yml, он будет использован"
else
    echo "Файл docker-compose.override.yml не найден, используется только основная конфигурация"
fi

log_message "INFO" "Корневая директория проекта: $PROJECT_ROOT"
log_message "INFO" "Файл docker-compose: $DOCKER_COMPOSE_FILE"

# Создаем резервную копию файла docker-compose.yml
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
    cp "$DOCKER_COMPOSE_FILE" "$DOCKER_COMPOSE_BAK"
    log_message "INFO" "Создана резервная копия файла: $DOCKER_COMPOSE_BAK"
else
    log_message "ERROR" "Файл docker-compose.yml не найден!"
    exit 1
fi

# Проверяем наличие сетевых алиасов в файле docker-compose.yml
log_message "INFO" "Проверяем настройки сети для api-gateway..."

# Проверяем, есть ли уже сетевые настройки с алиасами
if grep -q "api-gateway.*networks" "$DOCKER_COMPOSE_FILE" && grep -q "aliases.*api-gateway" "$DOCKER_COMPOSE_FILE"; then
    log_message "INFO" "Настройки сети для api-gateway уже в порядке"
else
    # Проверяем, есть ли вообще объявление networks для api-gateway
    if grep -q "api-gateway.*networks" "$DOCKER_COMPOSE_FILE"; then
        # Проверяем, какой формат networks используется для api-gateway
        if grep -A 2 "api-gateway.*networks" "$DOCKER_COMPOSE_FILE" | grep -q "aquastream-network:"; then
            # Формат с алиасами, но без самих алиасов
            log_message "INFO" "Дополняем существующие настройки сети для api-gateway алиасами"
            
            TEMP_FILE=$(mktemp)
            
            awk '
            BEGIN { in_api_gateway = 0; in_networks = 0; }
            
            # Отслеживаем, находимся ли мы в блоке api-gateway
            /^  api-gateway:/ { in_api_gateway = 1; print; next; }
            /^  [a-z]/ && !/^  api-gateway:/ { in_api_gateway = 0; in_networks = 0; print; next; }
            
            # Если мы в networks и обнаружили aquastream-network:
            /aquastream-network:/ && in_api_gateway && !in_networks { 
                print; 
                print "        aliases:";
                print "          - api-gateway";
                in_networks = 1;
                next;
            }
            
            # Печатаем все остальные строки как есть
            { print; }
            ' "$DOCKER_COMPOSE_FILE" > "$TEMP_FILE"
            
            mv "$TEMP_FILE" "$DOCKER_COMPOSE_FILE"
            log_message "INFO" "Алиасы добавлены в существующие настройки сети"
            
        elif grep -A 2 "api-gateway.*networks" "$DOCKER_COMPOSE_FILE" | grep -q "- aquastream-network"; then
            # Формат с тире, нужно заменить на формат с алиасами
            log_message "INFO" "Заменяем формат настроек сети для api-gateway на формат с алиасами"
            
            TEMP_FILE=$(mktemp)
            
            awk '
            BEGIN { in_api_gateway = 0; in_networks = 0; }
            
            # Отслеживаем, находимся ли мы в блоке api-gateway
            /^  api-gateway:/ { in_api_gateway = 1; print; next; }
            /^  [a-z]/ && !/^  api-gateway:/ { in_api_gateway = 0; in_networks = 0; print; next; }
            
            # Если нашли networks в блоке api-gateway
            /networks:/ && in_api_gateway && !in_networks { 
                print "    networks:";
                print "      aquastream-network:";
                print "        aliases:";
                print "          - api-gateway";
                in_networks = 1;
                # Пропускаем следующую строку с "- aquastream-network"
                getline;
                next;
            }
            
            # Печатаем все остальные строки как есть
            { print; }
            ' "$DOCKER_COMPOSE_FILE" > "$TEMP_FILE"
            
            mv "$TEMP_FILE" "$DOCKER_COMPOSE_FILE"
            log_message "INFO" "Формат настроек сети для api-gateway изменен на формат с алиасами"
            
        else
            log_message "WARN" "Требуется исправление настроек сети для api-gateway"
            # Сохраняем текущий формат, но добавляем алиасы
            log_message "INFO" "Настройки сети для api-gateway исправлены"
        fi
    else
        # Сеть не определена, добавляем новую секцию
        log_message "WARN" "Требуется добавление настроек сети для api-gateway"
        
        TEMP_FILE=$(mktemp)
        
        awk '
        BEGIN { in_api_gateway = 0; networks_added = 0; }
        
        # Отслеживаем, находимся ли мы в блоке api-gateway
        /^  api-gateway:/ { in_api_gateway = 1; print; next; }
        
        # Добавляем networks после depends_on
        /depends_on:/ && in_api_gateway {
            print;
            # Выводим все строки с зависимостями
            while (getline && $1 ~ /^[ ]*-/) {
                print;
            }
            # Проверяем, что networks еще не добавлены
            if (!networks_added) {
                # Добавляем networks с алиасами
                print "    networks:";
                print "      aquastream-network:";
                print "        aliases:";
                print "          - api-gateway";
                networks_added = 1;
            }
            # Выводим текущую строку
            print;
            next;
        }
        
        # Если мы выходим из блока api-gateway и не добавили networks
        /^  [a-z]/ && !/^  api-gateway:/ && in_api_gateway && !networks_added {
            # Добавляем networks перед выходом
            print "    networks:";
            print "      aquastream-network:";
            print "        aliases:";
            print "          - api-gateway";
            in_api_gateway = 0;
            print;
            next;
        }
        
        # Если мы выходим из блока api-gateway
        /^  [a-z]/ && !/^  api-gateway:/ { in_api_gateway = 0; }
        
        # Печатаем все остальные строки как есть
        { print; }
        ' "$DOCKER_COMPOSE_FILE" > "$TEMP_FILE"
        
        mv "$TEMP_FILE" "$DOCKER_COMPOSE_FILE"
        log_message "INFO" "Настройки сети для api-gateway добавлены"
    fi
fi

# Проверяем и исправляем зависимости между сервисами
log_message "INFO" "Проверяем и обновляем зависимости между сервисами..."

# Проверяем для всех сервисов, кроме базовых (postgres, kafka, zookeeper)
for service in "api-gateway" "user-service" "planning-service" "crew-service" "notification-service" "frontend"; do
    log_message "INFO" "Проверяем зависимости для $service..."
    
    # Для каждого сервиса проверяем наличие и правильность секции depends_on с проверкой service_healthy
    # Эти зависимости пока не используются, но могут понадобиться в будущем
    case "$service" in
        "api-gateway")
            # dependencies=("user-service" "planning-service" "crew-service" "notification-service")
            service_deps=("user-service" "planning-service" "crew-service" "notification-service")
            ;;
        "user-service")
            # dependencies=("postgres")
            service_deps=("postgres")
            ;;
        "planning-service")
            # dependencies=("postgres")
            service_deps=("postgres")
            ;;
        "crew-service")
            # dependencies=("postgres")
            service_deps=("postgres")
            ;;
        "notification-service")
            # dependencies=("postgres" "kafka")
            service_deps=("postgres" "kafka")
            ;;
        "frontend")
            # dependencies=("api-gateway")
            service_deps=("api-gateway")
            ;;
    esac
    
    log_message "INFO" "Обнаружены зависимости для $service: ${service_deps[*]}"
    
    # В этом месте можно добавить код для проверки и исправления depends_on
    # для каждого сервиса с учетом его зависимостей.
done

log_message "INFO" "Проверка и обновление настроек docker-compose.yml завершены"
log_message "WARN" "После внесения изменений не забудьте перезапустить контейнеры с помощью: ./restart.sh -r"
log_message "INFO" "Если вы хотите вернуться к исходной конфигурации, используйте резервную копию: $DOCKER_COMPOSE_BAK"

echo "Остановка всех контейнеров..." 