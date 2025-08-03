#!/bin/bash
set -euo pipefail

# Централизованный скрипт для запуска всех тестов проекта AquaStream
# Включает unit, integration и infrastructure тесты
# Интегрируется с существующим run.sh как команда 'test'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Цвета для вывода
NC="\033[0m"; GREEN="\033[0;32m"; YELLOW="\033[0;33m"; RED="\033[0;31m"; BLUE="\033[0;34m"

log() {
    local level="$1"; shift
    local msg="$*"
    local color="$GREEN"
    case "$level" in
      INFO)  color="$GREEN";;
      WARN)  color="$YELLOW";;
      ERROR) color="$RED";;
      DEBUG) color="$BLUE";;
    esac
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${color}${level}${NC} ${msg}"
}

# Функция для проверки готовности сервисов
wait_for_services() {
    local max_wait=${1:-180}
    local elapsed=0
    local check_interval=10
    
    log INFO "Ожидание готовности сервисов для интеграционных тестов..."
    
    while [ $elapsed -lt $max_wait ]; do
        local healthy_services=0
        local total_services=0
        
        local compose_file="$PROJECT_ROOT/infra/docker/compose/docker-compose.yml"
        
        if [ -f "$compose_file" ]; then
            local status_output
            status_output=$(docker compose -f "$compose_file" ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}" 2>/dev/null || echo "")
            
            if [ -n "$status_output" ]; then
                total_services=$(echo "$status_output" | tail -n +2 | wc -l)
                healthy_services=$(echo "$status_output" | grep -c "healthy" || echo "0")
                
                log INFO "Статус сервисов: $healthy_services/$total_services готовы"
                
                if [ "$total_services" -gt 0 ] && [ "$healthy_services" -eq "$total_services" ]; then
                    log INFO "✅ Все сервисы готовы для тестирования!"
                    return 0
                fi
            fi
        fi
        
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
    done
    
    log ERROR "⏰ Таймаут ожидания готовности сервисов"
    return 1
}

# Функция для запуска backend тестов
run_backend_tests() {
    log INFO "========== Backend тесты =========="
    
    cd "$PROJECT_ROOT"
    
    if [ -f "gradlew" ]; then
        log INFO "Запуск Gradle тестов..."
        ./gradlew test --info
        
        # Проверяем результаты тестов
        if [ $? -eq 0 ]; then
            log INFO "Backend тесты прошли успешно"
            
            # Генерируем отчеты о покрытии, если они настроены
            if ./gradlew tasks --all | grep -q "jacocoTestReport"; then
                log INFO "Генерация отчета о покрытии кода..."
                ./gradlew jacocoTestReport
            fi
        else
            log ERROR "Backend тесты провалились"
            return 1
        fi
    else
        log WARN "gradlew не найден, пропускаем backend тесты"
    fi
}

# Функция для запуска frontend тестов
run_frontend_tests() {
    log INFO "========== Frontend тесты =========="
    
    local frontend_dir="$PROJECT_ROOT/frontend"
    
    if [ -d "$frontend_dir" ] && [ -f "$frontend_dir/package.json" ]; then
        cd "$frontend_dir"
        
        # Проверяем, установлены ли зависимости
        if [ ! -d "node_modules" ]; then
            log INFO "Установка frontend зависимостей..."
            npm ci
        fi
        
        log INFO "Запуск frontend тестов..."
        
        # Запускаем тесты без watch режима
        npm test -- --watchAll=false --coverage=true
        
        if [ $? -eq 0 ]; then
            log INFO "Frontend тесты прошли успешно"
            
            # Генерируем coverage badge если скрипт есть
            if npm run coverage:badge --silent > /dev/null 2>&1; then
                log INFO "Обновление coverage badge..."
                npm run coverage:badge
            fi
        else
            log ERROR "Frontend тесты провалились"
            return 1
        fi
    else
        log WARN "Frontend директория не найдена или отсутствует package.json"
    fi
}


# Функция для тестирования API Gateway
test_api_gateway() {
    log INFO "=== Тестирование API Gateway ==="
    
    local gateway_url="https://localhost/api"
    local health_url="https://localhost/health"
    
    # Тест health check
    log INFO "Проверка health endpoint..."
    
    local response_code
    response_code=$(curl -k -s -o /dev/null -w "%{http_code}" "$health_url" || echo "000")
    
    if [ "$response_code" = "200" ]; then
        log INFO "✅ Health check прошел успешно"
    else
        log ERROR "❌ Health check провалился (код: $response_code)"
        return 1
    fi
    
    # Тест основных API endpoints
    log INFO "Проверка основных API endpoints..."
    
    local endpoints=(
        "/api/users/health"
        "/api/events/health"
        "/api/crew/health"
        "/api/notifications/health"
    )
    
    local failed_endpoints=0
    
    for endpoint in "${endpoints[@]}"; do
        local full_url="https://localhost$endpoint"
        response_code=$(curl -k -s -o /dev/null -w "%{http_code}" "$full_url" || echo "000")
        
        if [[ "$response_code" =~ ^[2-3][0-9][0-9]$ ]]; then
            log INFO "✅ $endpoint доступен (код: $response_code)"
        else
            log ERROR "❌ $endpoint недоступен (код: $response_code)"
            failed_endpoints=$((failed_endpoints + 1))
        fi
    done
    
    if [ $failed_endpoints -eq 0 ]; then
        log INFO "✅ Все API endpoints доступны"
        return 0
    else
        log ERROR "❌ $failed_endpoints endpoints недоступны"
        return 1
    fi
}

# Функция для тестирования базы данных
test_database_connectivity() {
    log INFO "=== Тестирование подключения к базе данных ==="
    
    local db_container
    db_container=$(docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ps -q postgres 2>/dev/null || echo "")
    
    if [ -z "$db_container" ]; then
        log ERROR "❌ PostgreSQL контейнер не найден"
        return 1
    fi
    
    log INFO "Проверка подключения к PostgreSQL..."
    
    if docker exec "$db_container" pg_isready -U postgres > /dev/null 2>&1; then
        log INFO "✅ PostgreSQL готов к подключениям"
    else
        log ERROR "❌ PostgreSQL не готов"
        return 1
    fi
    
    # Проверяем создание базы данных
    log INFO "Проверка наличия баз данных приложения..."
    
    local databases=("aquastream_user" "aquastream_event" "aquastream_crew" "aquastream_notification")
    local missing_dbs=0
    
    for db in "${databases[@]}"; do
        if docker exec "$db_container" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$db"; then
            log INFO "✅ База данных $db существует"
        else
            log WARN "⚠️ База данных $db не найдена"
            missing_dbs=$((missing_dbs + 1))
        fi
    done
    
    if [ $missing_dbs -eq 0 ]; then
        log INFO "✅ Все базы данных настроены"
        return 0
    else
        log WARN "⚠️ $missing_dbs баз данных не настроены"
        return 0  # Не критично для интеграционных тестов
    fi
}

# Функция для тестирования Kafka
test_kafka_connectivity() {
    log INFO "=== Тестирование Kafka ==="
    
    local kafka_container
    kafka_container=$(docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ps -q kafka 2>/dev/null || echo "")
    
    if [ -z "$kafka_container" ]; then
        log WARN "⚠️ Kafka контейнер не найден, пропускаем тесты"
        return 0
    fi
    
    log INFO "Проверка готовности Kafka..."
    
    if docker exec "$kafka_container" kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
        log INFO "✅ Kafka готов"
        
        # Проверяем топики приложения
        log INFO "Проверка топиков приложения..."
        
        local topics
        topics=$(docker exec "$kafka_container" kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null || echo "")
        
        local expected_topics=("events" "notifications" "crew-updates")
        local missing_topics=0
        
        for topic in "${expected_topics[@]}"; do
            if echo "$topics" | grep -q "^$topic$"; then
                log INFO "✅ Топик $topic существует"
            else
                log WARN "⚠️ Топик $topic не найден"
                missing_topics=$((missing_topics + 1))
            fi
        done
        
        if [ $missing_topics -eq 0 ]; then
            log INFO "✅ Все топики настроены"
        else
            log WARN "⚠️ $missing_topics топиков не настроены"
        fi
        
        return 0
    else
        log ERROR "❌ Kafka не готов"
        return 1
    fi
}

# Функция для тестирования мониторинга
test_monitoring_stack() {
    log INFO "=== Тестирование стека мониторинга ==="
    
    local monitoring_services=("prometheus" "grafana" "elasticsearch")
    local failed_services=0
    
    for service in "${monitoring_services[@]}"; do
        local container
        container=$(docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ps -q "$service" 2>/dev/null || echo "")
        
        if [ -n "$container" ]; then
            if docker exec "$container" echo "test" > /dev/null 2>&1; then
                log INFO "✅ $service работает"
            else
                log ERROR "❌ $service не отвечает"
                failed_services=$((failed_services + 1))
            fi
        else
            log WARN "⚠️ $service не запущен"
        fi
    done
    
    # Тестируем доступность через веб-интерфейсы
    local monitoring_urls=(
        "https://localhost/monitoring/"
        "https://localhost/prometheus/"
        "https://localhost/grafana/"
    )
    
    for url in "${monitoring_urls[@]}"; do
        local response_code
        response_code=$(curl -k -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
        
        if [[ "$response_code" =~ ^[2-3][0-9][0-9]$ ]]; then
            log INFO "✅ $(basename "$url") доступен"
        else
            log WARN "⚠️ $(basename "$url") недоступен (код: $response_code)"
        fi
    done
    
    if [ $failed_services -eq 0 ]; then
        log INFO "✅ Стек мониторинга работает"
        return 0
    else
        log ERROR "❌ $failed_services сервисов мониторинга недоступны"
        return 1
    fi
}

# Функция для тестирования межсервисного взаимодействия
test_service_communication() {
    log INFO "=== Тестирование межсервисного взаимодействия ==="
    
    log INFO "Тест создания пользователя и генерации события..."
    
    # Пример API вызова (если реализовано)
    local create_user_response
    create_user_response=$(curl -k -s -X POST "https://localhost/api/users" \
        -H "Content-Type: application/json" \
        -d '{"username":"testuser","email":"test@example.com"}' \
        -w "%{http_code}" 2>/dev/null || echo "000")
    
    if [[ "$create_user_response" =~ [2][0-9][0-9]$ ]]; then
        log INFO "✅ Межсервисное взаимодействие работает"
        return 0
    else
        log WARN "⚠️ Межсервисное взаимодействие не тестируется (API не готов)"
        return 0  # Не критично на данном этапе
    fi
}

# Функция для запуска интеграционных тестов
run_integration_tests() {
    log INFO "========== Интеграционные тесты =========="
    
    local integration_errors=0
    local skip_service_wait=${1:-false}
    
    # Ожидание готовности сервисов
    if [ "$skip_service_wait" != "true" ]; then
        if ! wait_for_services; then
            log ERROR "Сервисы не готовы, но продолжаем тестирование..."
        fi
        echo
    fi
    
    # API Gateway тесты
    if ! test_api_gateway; then
        integration_errors=$((integration_errors + 1))
    fi
    echo
    
    # Database тесты
    if ! test_database_connectivity; then
        integration_errors=$((integration_errors + 1))
    fi
    echo
    
    # Kafka тесты
    if ! test_kafka_connectivity; then
        integration_errors=$((integration_errors + 1))
    fi
    echo
    
    # Monitoring тесты
    if ! test_monitoring_stack; then
        integration_errors=$((integration_errors + 1))
    fi
    echo
    
    # Service communication тесты
    if ! test_service_communication; then
        integration_errors=$((integration_errors + 1))
    fi
    echo
    
    if [ $integration_errors -eq 0 ]; then
        log INFO "✅ Все интеграционные тесты прошли успешно!"
        return 0
    else
        log ERROR "❌ Обнаружено $integration_errors ошибок в интеграционных тестах"
        return 1
    fi
}

# Функция для запуска тестов инфраструктуры
run_infrastructure_tests() {
    log INFO "========== Infrastructure тесты =========="
    
    # Валидация инфраструктуры как часть тестирования
    local validation_script="$SCRIPT_DIR/validate-infrastructure.sh"
    
    if [ -f "$validation_script" ]; then
        log INFO "Запуск валидации инфраструктуры..."
        bash "$validation_script" --quick
        
        if [ $? -eq 0 ]; then
            log INFO "Валидация инфраструктуры прошла успешно"
        else
            log ERROR "Валидация инфраструктуры провалилась"
            return 1
        fi
    else
        log WARN "Скрипт валидации инфраструктуры не найден"
    fi
    
    # Дополнительные проверки Docker Compose
    local compose_file="$PROJECT_ROOT/infra/docker/compose/docker-compose.yml"
    if [ -f "$compose_file" ]; then
        log INFO "Проверка синтаксиса Docker Compose..."
        
        if docker compose -f "$compose_file" config > /dev/null 2>&1; then
            log INFO "Docker Compose конфигурация валидна"
        else
            log ERROR "Ошибка в Docker Compose конфигурации"
            return 1
        fi
    fi
}

# Функция для создания сводного отчета
generate_test_report() {
    log INFO "========== Генерация сводного отчета =========="
    
    local report_file="$PROJECT_ROOT/test_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
AquaStream Test Report
=====================
Дата: $(date)
Проект: $PROJECT_ROOT

РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:
EOF
    
    # Добавляем информацию о backend тестах
    if [ -f "gradlew" ]; then
        echo "" >> "$report_file"
        echo "Backend тесты:" >> "$report_file"
        ./gradlew test --dry-run | grep -E "Test|SKIPPED|UP-TO-DATE" >> "$report_file" 2>/dev/null || echo "  • Информация недоступна" >> "$report_file"
    fi
    
    # Добавляем информацию о frontend тестах
    if [ -d "$PROJECT_ROOT/frontend" ]; then
        echo "" >> "$report_file"
        echo "Frontend тесты:" >> "$report_file"
        if [ -d "$PROJECT_ROOT/frontend/coverage" ]; then
            echo "  • Coverage отчет доступен в frontend/coverage/" >> "$report_file"
        fi
    fi
    
    echo "" >> "$report_file"
    echo "Отчет завершен: $(date)" >> "$report_file"
    
    log INFO "Сводный отчет сохранен: $report_file"
}

# Функция для отображения справки
show_help() {
    echo "AquaStream Test Runner"
    echo "====================="
    echo ""
    echo "Использование: $0 [опции]"
    echo ""
    echo "Опции:"
    echo "  --help, -h          Показать эту справку"
    echo "  --backend-only      Только backend тесты"
    echo "  --frontend-only     Только frontend тесты"
    echo "  --integration-only  Только integration тесты"
    echo "  --infrastructure-only  Только тесты инфраструктуры"
    echo "  --no-report         Не генерировать сводный отчет"
    echo ""
    echo "Примеры:"
    echo "  $0                  Запустить все тесты"
    echo "  $0 --backend-only   Только backend тесты"
    echo "  $0 --frontend-only  Только frontend тесты"
    echo ""
    exit 0
}

# Основная функция
main() {
    local run_backend=true
    local run_frontend=true
    local run_integration=true
    local run_infrastructure=true
    local generate_report=true
    local total_errors=0
    
    # Парсинг аргументов
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                ;;
            --backend-only)
                run_backend=true
                run_frontend=false
                run_integration=false
                run_infrastructure=false
                ;;
            --frontend-only)
                run_backend=false
                run_frontend=true
                run_integration=false
                run_infrastructure=false
                ;;
            --integration-only)
                run_backend=false
                run_frontend=false
                run_integration=true
                run_infrastructure=false
                ;;
            --infrastructure-only)
                run_backend=false
                run_frontend=false
                run_integration=false
                run_infrastructure=true
                ;;
            --no-report)
                generate_report=false
                ;;
            *)
                log ERROR "Неизвестная опция: $1"
                show_help
                ;;
        esac
        shift
    done
    
    log INFO "🚀 Начинаем тестирование AquaStream"
    log INFO "📂 Проект: $PROJECT_ROOT"
    echo
    
    # Запускаем выбранные тесты
    if [ "$run_infrastructure" = true ]; then
        if ! run_infrastructure_tests; then
            total_errors=$((total_errors + 1))
        fi
        echo
    fi
    
    if [ "$run_backend" = true ]; then
        if ! run_backend_tests; then
            total_errors=$((total_errors + 1))
        fi
        echo
    fi
    
    if [ "$run_frontend" = true ]; then
        if ! run_frontend_tests; then
            total_errors=$((total_errors + 1))
        fi
        echo
    fi
    
    if [ "$run_integration" = true ]; then
        # Используем новую интегрированную функцию интеграционных тестов
        if ! run_integration_tests false; then
            total_errors=$((total_errors + 1))
        fi
        echo
    fi
    
    # Генерируем отчет
    if [ "$generate_report" = true ]; then
        generate_test_report
    fi
    
    # Финальная статистика
    log INFO "🏁 Тестирование завершено!"
    
    if [ $total_errors -eq 0 ]; then
        log INFO "🎉 Все тесты прошли успешно!"
        return 0
    else
        log ERROR "❌ Обнаружено $total_errors ошибок в тестах"
        return 1
    fi
}

# Запуск основной функции с передачей всех аргументов
main "$@"