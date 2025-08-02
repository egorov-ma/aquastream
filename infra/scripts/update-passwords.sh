#!/bin/bash
# Скрипт для безопасного обновления паролей в AquaStream
# Поддерживает как .env файлы, так и Docker Secrets

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="${SCRIPT_DIR}/../docker/compose"
ENV_FILE="${COMPOSE_DIR}/.env"

# Цвета для вывода
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

# Проверка слабых паролей
check_weak_passwords() {
    local has_weak=false
    
    log_info "Проверка текущих паролей на предмет слабости..."
    
    if grep -q "POSTGRES_PASSWORD=postgres" "${ENV_FILE}" 2>/dev/null; then
        log_error "❌ Обнаружен слабый пароль PostgreSQL: 'postgres'"
        has_weak=true
    fi
    
    if grep -q "GRAFANA_ADMIN_PASSWORD=admin" "${ENV_FILE}" 2>/dev/null; then
        log_error "❌ Обнаружен слабый пароль Grafana: 'admin'"
        has_weak=true
    fi
    
    if grep -q "ELASTIC_PASSWORD=changeMe123!" "${ENV_FILE}" 2>/dev/null; then
        log_error "❌ Обнаружен слабый пароль Elasticsearch: 'changeMe123!'"
        has_weak=true
    fi
    
    if grep -q "KIBANA_PASSWORD=kibanaUser123!" "${ENV_FILE}" 2>/dev/null; then
        log_error "❌ Обнаружен слабый пароль Kibana: 'kibanaUser123!'"
        has_weak=true
    fi
    
    # Проверка на пустые пароли
    if grep -qE "PASSWORD=\s*$" "${ENV_FILE}" 2>/dev/null; then
        log_error "❌ Обнаружены пустые пароли"
        has_weak=true
    fi
    
    if $has_weak; then
        log_warn "🚨 КРИТИЧЕСКАЯ ПРОБЛЕМА БЕЗОПАСНОСТИ: Обнаружены слабые пароли!"
        echo
        return 1
    else
        log_success "✅ Проверка пройдена: слабые пароли не обнаружены"
        return 0
    fi
}

# Функция проверки силы пароля
check_password_strength() {
    local password="$1"
    local min_length=12
    
    # Проверка длины
    if [[ ${#password} -lt $min_length ]]; then
        echo "Пароль слишком короткий (минимум $min_length символов)"
        return 1
    fi
    
    # Проверка на наличие различных типов символов
    local has_upper=false
    local has_lower=false
    local has_digit=false
    local has_special=false
    
    if [[ "$password" =~ [A-Z] ]]; then has_upper=true; fi
    if [[ "$password" =~ [a-z] ]]; then has_lower=true; fi
    if [[ "$password" =~ [0-9] ]]; then has_digit=true; fi
    if [[ "$password" =~ [^A-Za-z0-9] ]]; then has_special=true; fi
    
    local score=0
    $has_upper && ((score++))
    $has_lower && ((score++)) 
    $has_digit && ((score++))
    $has_special && ((score++))
    
    if [[ $score -lt 3 ]]; then
        echo "Пароль слабый. Должен содержать минимум 3 из 4: заглавные буквы, строчные буквы, цифры, спецсимволы"
        return 1
    fi
    
    # Проверка на словарные слова
    local common_words=("password" "admin" "user" "test" "demo" "default" "changeme" "postgres" "grafana" "elastic" "kibana")
    local lower_password="${password,,}"
    
    for word in "${common_words[@]}"; do
        if [[ "$lower_password" == *"$word"* ]]; then
            echo "Пароль содержит словарное слово: $word"
            return 1
        fi
    done
    
    return 0
}

# Функция интерактивного ввода пароля
input_password() {
    local service_name="$1"
    local password
    local confirm_password
    
    while true; do
        read -s -p "Введите новый пароль для ${service_name}: " password
        echo
        
        if ! check_password_strength "$password"; then
            log_warn "Пароль не соответствует требованиям безопасности. Попробуйте еще раз."
            continue
        fi
        
        read -s -p "Подтвердите пароль: " confirm_password
        echo
        
        if [[ "$password" != "$confirm_password" ]]; then
            log_warn "Пароли не совпадают. Попробуйте еще раз."
            continue
        fi
        
        echo "$password"
        return 0
    done
}

# Функция остановки сервисов с паролями
stop_services_with_passwords() {
    log_info "Остановка сервисов, использующих пароли..."
    
    cd "${COMPOSE_DIR}"
    
    # Останавливаем только сервисы, которые используют пароли
    local services=("postgres" "elasticsearch" "kibana" "logstash" "grafana" "user-service" "crew-service" "notification-service")
    
    for service in "${services[@]}"; do
        if docker compose ps -q "$service" >/dev/null 2>&1; then
            log_info "Остановка $service..."
            docker compose stop "$service" 2>/dev/null || true
        fi
    done
    
    log_success "Сервисы остановлены"
}

# Функция запуска сервисов
start_services() {
    log_info "Запуск сервисов с новыми паролями..."
    
    cd "${COMPOSE_DIR}"
    
    # Пересоздаем контейнеры для применения новых паролей
    docker compose up -d --force-recreate postgres elasticsearch 2>/dev/null || {
        log_error "Ошибка запуска основных сервисов"
        return 1
    }
    
    # Ждем готовности основных сервисов
    log_info "Ожидание готовности основных сервисов..."
    sleep 10
    
    # Запускаем остальные сервисы
    docker compose up -d 2>/dev/null || {
        log_error "Ошибка запуска всех сервисов"
        return 1
    }
    
    log_success "Сервисы запущены с новыми паролями"
}

# Основная функция
main() {
    log_info "========== Обновление паролей AquaStream =========="
    
    # Проверяем .env файл
    if [[ ! -f "${ENV_FILE}" ]]; then
        log_error "Файл .env не найден: ${ENV_FILE}"
        exit 1
    fi
    
    # Проверяем текущие пароли
    if ! check_weak_passwords; then
        log_warn "Требуется обновление паролей!"
        echo
    else
        echo
        read -p "Все равно обновить пароли? [y/N]: " force_update
        if [[ ! "${force_update,,}" =~ ^(y|yes)$ ]]; then
            log_info "Обновление отменено"
            exit 0
        fi
    fi
    
    # Выбор метода обновления
    echo "Выберите метод обновления паролей:"
    echo "1) Автоматическая генерация сильных паролей (рекомендуется)"
    echo "2) Ввод паролей вручную"
    echo "3) Использовать скрипт generate-secrets.sh"
    read -p "Ваш выбор [1-3]: " choice
    
    case $choice in
        1)
            log_info "Генерация сильных паролей..."
            "${SCRIPT_DIR}/generate-secrets.sh"
            ;;
        2)
            log_info "Ввод паролей вручную..."
            
            # Создаем резервную копию
            cp "${ENV_FILE}" "${ENV_FILE}.backup.$(date +%Y%m%d-%H%M%S)"
            
            # Вводим новые пароли
            POSTGRES_PASS=$(input_password "PostgreSQL")
            GRAFANA_PASS=$(input_password "Grafana Admin")
            ELASTIC_PASS=$(input_password "Elasticsearch")
            KIBANA_PASS=$(input_password "Kibana")
            
            # Обновляем .env
            sed -i.tmp \
                -e "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASS}/" \
                -e "s/^GRAFANA_ADMIN_PASSWORD=.*/GRAFANA_ADMIN_PASSWORD=${GRAFANA_PASS}/" \
                -e "s/^ELASTIC_PASSWORD=.*/ELASTIC_PASSWORD=${ELASTIC_PASS}/" \
                -e "s/^KIBANA_PASSWORD=.*/KIBANA_PASSWORD=${KIBANA_PASS}/" \
                "${ENV_FILE}"
            
            rm -f "${ENV_FILE}.tmp"
            log_success "Пароли обновлены в .env файле"
            ;;
        3)
            log_info "Запуск скрипта генерации..."
            "${SCRIPT_DIR}/generate-secrets.sh"
            ;;
        *)
            log_error "Неверный выбор"
            exit 1
            ;;
    esac
    
    # Предупреждение о перезапуске
    echo
    log_warn "⚠️  Для применения новых паролей требуется перезапуск сервисов"
    read -p "Перезапустить сервисы сейчас? [y/N]: " restart_services
    
    if [[ "${restart_services,,}" =~ ^(y|yes)$ ]]; then
        stop_services_with_passwords
        start_services
        log_success "Пароли успешно обновлены и применены!"
    else
        log_warn "Не забудьте перезапустить сервисы: docker compose down && docker compose up -d"
    fi
    
    echo
    log_success "========== Обновление паролей завершено =========="
}

# Запуск
main "$@"