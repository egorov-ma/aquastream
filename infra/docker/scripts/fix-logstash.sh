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
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    
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
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
log_message "INFO" "Корневая директория проекта: $PROJECT_ROOT"

# Список gradle файлов для микросервисов
GRADLE_FILES=(
    "backend-api/build.gradle"
    "backend-user/build.gradle"
    "backend-crew/build.gradle"
    "backend-notification/build.gradle"
    "backend-planning/build.gradle"
)

# Зависимость, которую нужно добавить
LOGSTASH_DEPENDENCY="implementation 'net.logstash.logback:logstash-logback-encoder:7.4'"

# Проверяем и добавляем зависимость в каждый файл build.gradle
for gradle_file in "${GRADLE_FILES[@]}"; do
    FULL_PATH="$PROJECT_ROOT/$gradle_file"
    
    if [ ! -f "$FULL_PATH" ]; then
        log_message "WARN" "Файл $gradle_file не найден, пропускаем"
        continue
    fi
    
    log_message "INFO" "Проверяем файл $gradle_file"
    
    # Проверяем, есть ли уже зависимость logstash в файле
    if grep -q "logstash-logback-encoder" "$FULL_PATH"; then
        log_message "INFO" "Зависимость logstash уже присутствует в $gradle_file"
    else
        log_message "INFO" "Добавляем зависимость logstash в $gradle_file"
        
        # Находим блок dependencies и добавляем нашу зависимость
        sed -i '' '/dependencies {/a\
    '"$LOGSTASH_DEPENDENCY"'
' "$FULL_PATH"
        
        if [ $? -eq 0 ]; then
            log_message "INFO" "Зависимость успешно добавлена в $gradle_file"
        else
            log_message "ERROR" "Ошибка при добавлении зависимости в $gradle_file"
        fi
    fi
done

log_message "INFO" "Проверка и обновление зависимостей завершены"
log_message "INFO" "Теперь необходимо пересобрать проект с помощью команды: ./gradlew clean build"
log_message "WARN" "После внесения изменений не забудьте перезапустить контейнеры с помощью: ./restart.sh -r -b" 