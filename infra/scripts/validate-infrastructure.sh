#!/bin/bash
set -euo pipefail

# Скрипт валидации инфраструктуры как кода (Infrastructure as Code validation)
# Проверяет корректность Docker Compose, конфигураций и следование best practices

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

# Счетчики для отчета
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Функция для отчета о проверке
report_check() {
    local status="$1"
    local message="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    case "$status" in
        "PASS")
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            log INFO "✅ $message"
            ;;
        "FAIL")
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            log ERROR "❌ $message"
            ;;
        "WARN")
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
            log WARN "⚠️ $message"
            ;;
    esac
}

# Проверка синтаксиса Docker Compose
validate_docker_compose() {
    log INFO "=== Валидация Docker Compose файлов ==="
    
    local compose_files=(
        "${PROJECT_ROOT}/infra/docker/compose/docker-compose.yml"
    )
    
    for compose_file in "${compose_files[@]}"; do
        if [ ! -f "$compose_file" ]; then
            report_check "FAIL" "Docker Compose файл не найден: $compose_file"
            continue
        fi
        
        # Проверка синтаксиса YAML
        if command -v yq >/dev/null 2>&1; then
            if yq eval '.' "$compose_file" >/dev/null 2>&1; then
                report_check "PASS" "YAML синтаксис корректен: $(basename "$compose_file")"
            else
                report_check "FAIL" "Ошибка YAML синтаксиса: $(basename "$compose_file")"
                continue
            fi
        else
            report_check "WARN" "yq не установлен, пропускаем проверку YAML синтаксиса"
        fi
        
        # Проверка Docker Compose конфигурации
        if docker compose -f "$compose_file" config >/dev/null 2>&1; then
            report_check "PASS" "Docker Compose конфигурация валидна: $(basename "$compose_file")"
        else
            report_check "FAIL" "Ошибка Docker Compose конфигурации: $(basename "$compose_file")"
            # Показываем детали ошибки
            log ERROR "Детали ошибки:"
            docker compose -f "$compose_file" config 2>&1 | head -10 | while read line; do
                log ERROR "  $line"
            done
        fi
        
        # Проверка на использование latest тегов
        if grep -q ":latest" "$compose_file"; then
            report_check "FAIL" "Найдены :latest теги в $(basename "$compose_file") - используйте конкретные версии"
        else
            report_check "PASS" "Все образы имеют конкретные версии: $(basename "$compose_file")"
        fi
        
        # Проверка наличия health checks для всех сервисов
        local services_without_healthcheck
        services_without_healthcheck=$(docker compose -f "$compose_file" config 2>/dev/null | yq eval '.services | to_entries | map(select(.value.healthcheck == null)) | .[].key' - 2>/dev/null || echo "")
        
        if [ -n "$services_without_healthcheck" ]; then
            report_check "WARN" "Сервисы без health checks: $services_without_healthcheck"
        else
            report_check "PASS" "Все сервисы имеют health checks"
        fi
        
        # Проверка использования secrets вместо environment для паролей
        if grep -E "(PASSWORD|SECRET|KEY).*=" "$compose_file" | grep -v "\\$\\{" >/dev/null; then
            report_check "FAIL" "Найдены hardcoded пароли/секреты в $(basename "$compose_file")"
        else
            report_check "PASS" "Пароли и секреты используют переменные окружения"
        fi
        
        # Проверка resource limits
        local services_without_limits
        services_without_limits=$(docker compose -f "$compose_file" config 2>/dev/null | yq eval '.services | to_entries | map(select(.value.deploy.resources.limits == null)) | .[].key' - 2>/dev/null || echo "")
        
        if [ -n "$services_without_limits" ]; then
            report_check "WARN" "Сервисы без resource limits: $services_without_limits"
        else
            report_check "PASS" "Все сервисы имеют resource limits"
        fi
    done
}

# Проверка переменных окружения
validate_environment_files() {
    log INFO "=== Валидация файлов окружения ==="
    
    local env_file="${PROJECT_ROOT}/infra/docker/compose/.env"
    local env_example="${PROJECT_ROOT}/infra/docker/compose/.env.example"
    
    # Проверка основного .env файла
    if [ -f "$env_file" ]; then
        report_check "PASS" ".env файл существует"
        
        # Проверка на слабые пароли
        local weak_passwords=0
        while IFS= read -r line; do
            if [[ "$line" =~ ^[A-Z_]+_PASSWORD= ]]; then
                local password_value=$(echo "$line" | cut -d'=' -f2-)
                if [[ ${#password_value} -lt 12 ]] || [[ "$password_value" =~ ^(password|123456|admin|test)$ ]]; then
                    weak_passwords=$((weak_passwords + 1))
                fi
            fi
        done < "$env_file"
        
        if [ $weak_passwords -gt 0 ]; then
            report_check "FAIL" "Найдено $weak_passwords слабых паролей в .env файле"
        else
            report_check "PASS" "Все пароли соответствуют требованиям безопасности"
        fi
        
        # Проверка на незаполненные обязательные переменные
        local required_vars=(
            "POSTGRES_PASSWORD"
            "ELASTIC_PASSWORD"
            "KIBANA_PASSWORD"
            "GRAFANA_ADMIN_PASSWORD"
        )
        
        for var in "${required_vars[@]}"; do
            if grep -q "^${var}=\s*$" "$env_file"; then
                report_check "FAIL" "Переменная $var не заполнена"
            elif grep -q "^${var}=" "$env_file"; then
                report_check "PASS" "Переменная $var заполнена"
            else
                report_check "FAIL" "Переменная $var отсутствует в .env файле"
            fi
        done
        
    else
        report_check "FAIL" ".env файл не найден"
    fi
    
    # Проверка .env.example файла
    if [ -f "$env_example" ]; then
        report_check "PASS" ".env.example файл существует"
        
        # Проверка, что все переменные из .env есть в .env.example
        if [ -f "$env_file" ]; then
            local missing_in_example=0
            while IFS= read -r line; do
                if [[ "$line" =~ ^[A-Z_]+=.*$ ]]; then
                    local var_name=$(echo "$line" | cut -d'=' -f1)
                    if ! grep -q "^${var_name}=" "$env_example"; then
                        missing_in_example=$((missing_in_example + 1))
                    fi
                fi
            done < "$env_file"
            
            if [ $missing_in_example -gt 0 ]; then
                report_check "WARN" "$missing_in_example переменных отсутствуют в .env.example"
            else
                report_check "PASS" "Все переменные из .env присутствуют в .env.example"
            fi
        fi
    else
        report_check "FAIL" ".env.example файл не найден - создайте шаблон для новых развертываний"
    fi
}

# Проверка Dockerfile файлов
validate_dockerfiles() {
    log INFO "=== Валидация Dockerfile файлов ==="
    
    local dockerfile_dir="${PROJECT_ROOT}/infra/docker/images"
    
    if [ ! -d "$dockerfile_dir" ]; then
        report_check "FAIL" "Директория с Dockerfile не найдена: $dockerfile_dir"
        return
    fi
    
    find "$dockerfile_dir" -name "Dockerfile.*" | while read dockerfile; do
        local filename=$(basename "$dockerfile")
        
        # Проверка базовых образов
        if grep -q "FROM.*:latest" "$dockerfile"; then
            report_check "FAIL" "Использование :latest тега в $filename"
        else
            report_check "PASS" "Конкретные версии базовых образов в $filename"
        fi
        
        # Проверка на root пользователя
        if grep -q "USER root" "$dockerfile" || ! grep -q "USER " "$dockerfile"; then
            report_check "WARN" "Контейнер может запускаться под root в $filename"
        else
            report_check "PASS" "Используется non-root пользователь в $filename"
        fi
        
        # Проверка на COPY/ADD с правильными правами
        if grep -E "(COPY|ADD)" "$dockerfile" | grep -v -- "--chown=" >/dev/null; then
            report_check "WARN" "COPY/ADD без --chown в $filename может создать файлы с неправильными правами"
        else
            report_check "PASS" "Правильное использование COPY/ADD в $filename"
        fi
        
        # Проверка многоэтапной сборки для больших образов
        if grep -q "FROM.*AS.*" "$dockerfile"; then
            report_check "PASS" "Используется многоэтапная сборка в $filename"
        else
            report_check "WARN" "Рассмотрите использование многоэтапной сборки в $filename"
        fi
        
        # Проверка на очистку кэша пакетных менеджеров
        if grep -q "apt-get" "$dockerfile" && ! grep -q "rm -rf /var/lib/apt/lists" "$dockerfile"; then
            report_check "WARN" "apt кэш не очищается в $filename"
        elif grep -q "yum\|dnf" "$dockerfile" && ! grep -q "yum clean all\|dnf clean all" "$dockerfile"; then
            report_check "WARN" "yum/dnf кэш не очищается в $filename"
        else
            report_check "PASS" "Кэш пакетных менеджеров очищается в $filename"
        fi
    done
}

# Проверка конфигураций мониторинга
validate_monitoring_configs() {
    log INFO "=== Валидация конфигураций мониторинга ==="
    
    local monitoring_dir="${PROJECT_ROOT}/infra/monitoring"
    
    # Проверка Prometheus конфигурации
    local prometheus_config="${monitoring_dir}/prometheus/prometheus.yml"
    if [ -f "$prometheus_config" ]; then
        if command -v promtool >/dev/null 2>&1; then
            if promtool check config "$prometheus_config" >/dev/null 2>&1; then
                report_check "PASS" "Prometheus конфигурация валидна"
            else
                report_check "FAIL" "Ошибка в Prometheus конфигурации"
            fi
        else
            report_check "WARN" "promtool не установлен, пропускаем валидацию Prometheus"
        fi
    else
        report_check "FAIL" "Prometheus конфигурация не найдена"
    fi
    
    # Проверка Logstash конфигурации
    local logstash_config="${monitoring_dir}/logstash/pipeline/logstash.conf"
    if [ -f "$logstash_config" ]; then
        # Базовая проверка синтаксиса Logstash
        if grep -q "input\s*{" "$logstash_config" && grep -q "output\s*{" "$logstash_config"; then
            report_check "PASS" "Logstash конфигурация имеет базовую структуру"
        else
            report_check "FAIL" "Logstash конфигурация не имеет необходимых секций input/output"
        fi
        
        # Проверка на security фильтры
        if grep -q "gsub.*password\|gsub.*secret\|gsub.*token" "$logstash_config"; then
            report_check "PASS" "Logstash содержит фильтры для санитизации чувствительных данных"
        else
            report_check "WARN" "Logstash не содержит фильтры для санитизации чувствительных данных"
        fi
    else
        report_check "FAIL" "Logstash конфигурация не найдена"
    fi
    
    # Проверка Nginx конфигурации
    local nginx_config="${monitoring_dir}/nginx/nginx.conf"
    if [ -f "$nginx_config" ]; then
        if command -v nginx >/dev/null 2>&1; then
            if nginx -t -c "$nginx_config" >/dev/null 2>&1; then
                report_check "PASS" "Nginx конфигурация валидна"
            else
                report_check "FAIL" "Ошибка в Nginx конфигурации"
            fi
        else
            # Базовая проверка без nginx
            if grep -q "server\s*{" "$nginx_config"; then
                report_check "PASS" "Nginx конфигурация имеет базовую структуру"
            else
                report_check "FAIL" "Nginx конфигурация не имеет server блоков"
            fi
        fi
        
        # Проверка security headers
        local security_headers=(
            "X-Content-Type-Options"
            "X-Frame-Options"
            "X-XSS-Protection"
            "Strict-Transport-Security"
        )
        
        local missing_headers=0
        for header in "${security_headers[@]}"; do
            if ! grep -q "$header" "$nginx_config"; then
                missing_headers=$((missing_headers + 1))
            fi
        done
        
        if [ $missing_headers -eq 0 ]; then
            report_check "PASS" "Все необходимые security headers настроены в Nginx"
        else
            report_check "WARN" "$missing_headers security headers отсутствуют в Nginx конфигурации"
        fi
    else
        report_check "FAIL" "Nginx конфигурация не найдена"
    fi
}

# Проверка скриптов
validate_scripts() {
    log INFO "=== Валидация скриптов ==="
    
    local scripts_dir="${PROJECT_ROOT}/infra/scripts"
    
    if [ ! -d "$scripts_dir" ]; then
        report_check "FAIL" "Директория скриптов не найдена"
        return
    fi
    
    # Проверка всех shell скриптов
    find "$scripts_dir" -name "*.sh" | while read script; do
        local script_name=$(basename "$script")
        
        # Проверка синтаксиса bash
        if bash -n "$script" 2>/dev/null; then
            report_check "PASS" "Синтаксис bash корректен: $script_name"
        else
            report_check "FAIL" "Ошибка синтаксиса bash: $script_name"
        fi
        
        # Проверка на executable права
        if [ -x "$script" ]; then
            report_check "PASS" "Скрипт исполняемый: $script_name"
        else
            report_check "WARN" "Скрипт не исполняемый: $script_name"
        fi
        
        # Проверка на set -e для безопасности
        if grep -q "set -e" "$script"; then
            report_check "PASS" "Используется set -e для обработки ошибок: $script_name"
        else
            report_check "WARN" "Рекомендуется использовать set -e: $script_name"
        fi
        
        # Проверка на hardcoded пути
        if grep -E "/usr/local|/opt|/home/[^/]+" "$script" >/dev/null; then
            report_check "WARN" "Найдены потенциально hardcoded пути в $script_name"
        else
            report_check "PASS" "Пути выглядят портируемыми: $script_name"
        fi
    done
    
    # Проверка основного run.sh скрипта
    local run_script="${PROJECT_ROOT}/run.sh"
    if [ -f "$run_script" ]; then
        if bash -n "$run_script" 2>/dev/null; then
            report_check "PASS" "Синтаксис run.sh корректен"
        else
            report_check "FAIL" "Ошибка синтаксиса в run.sh"
        fi
        
        # Проверка на функции help
        if grep -q "show_help\|--help\|-h" "$run_script"; then
            report_check "PASS" "run.sh содержит справку"
        else
            report_check "WARN" "run.sh не содержит функцию справки"
        fi
    else
        report_check "FAIL" "Основной run.sh скрипт не найден"
    fi
}

# Проверка безопасности файлов
validate_security() {
    log INFO "=== Проверка безопасности файлов ==="
    
    # Проверка .gitignore
    local gitignore="${PROJECT_ROOT}/.gitignore"
    if [ -f "$gitignore" ]; then
        local sensitive_patterns=(
            "*.env"
            "*.key"
            "*.pem"
            "*.p12"
            "passwords.txt"
            "secrets.yml"
        )
        
        local missing_patterns=0
        for pattern in "${sensitive_patterns[@]}"; do
            if ! grep -q "$pattern" "$gitignore"; then
                missing_patterns=$((missing_patterns + 1))
            fi
        done
        
        if [ $missing_patterns -eq 0 ]; then
            report_check "PASS" "Все чувствительные файлы в .gitignore"
        else
            report_check "WARN" "$missing_patterns паттернов отсутствуют в .gitignore"
        fi
    else
        report_check "FAIL" ".gitignore файл не найден"
    fi
    
    # Проверка на чувствительные файлы в репозитории
    local sensitive_files_found=0
    find "$PROJECT_ROOT" -name "*.env" -not -path "*/node_modules/*" -not -name "*.env.example" 2>/dev/null | while read file; do
        if [ -f "$file" ]; then
            sensitive_files_found=$((sensitive_files_found + 1))
            report_check "WARN" "Найден .env файл в репозитории: $(basename "$file")"
        fi
    done
    
    # Проверка прав доступа к критичным файлам
    local critical_files=(
        "${PROJECT_ROOT}/infra/docker/compose/.env"
        "${PROJECT_ROOT}/infra/scripts/backup-volumes.sh"
        "${PROJECT_ROOT}/infra/scripts/restore-volumes.sh"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            local perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%A" "$file" 2>/dev/null || echo "unknown")
            if [[ "$perms" =~ ^[67][04][04]$ ]]; then
                report_check "PASS" "Правильные права доступа: $(basename "$file") ($perms)"
            else
                report_check "WARN" "Проверьте права доступа: $(basename "$file") ($perms)"
            fi
        fi
    done
}

# Проверка структуры проекта
validate_project_structure() {
    log INFO "=== Проверка структуры проекта ==="
    
    local required_dirs=(
        "infra/docker/compose"
        "infra/docker/images"
        "infra/monitoring"
        "infra/scripts"
        "infra/docs"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "${PROJECT_ROOT}/${dir}" ]; then
            report_check "PASS" "Директория существует: $dir"
        else
            report_check "FAIL" "Отсутствует обязательная директория: $dir"
        fi
    done
    
    local required_files=(
        "run.sh"
        "infra/docker/compose/docker-compose.yml"
        "infra/README.md"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "${PROJECT_ROOT}/${file}" ]; then
            report_check "PASS" "Файл существует: $file"
        else
            report_check "FAIL" "Отсутствует обязательный файл: $file"
        fi
    done
}

# Создание отчета валидации
generate_report() {
    log INFO "=== Генерация отчета валидации ==="
    
    local report_file="${PROJECT_ROOT}/validation_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
AquaStream Infrastructure Validation Report
==========================================
Дата: $(date)
Проект: $PROJECT_ROOT

РЕЗУЛЬТАТЫ ВАЛИДАЦИИ:
EOF
    
    echo "📊 Статистика проверок:" >> "$report_file"
    echo "  • Всего проверок: $TOTAL_CHECKS" >> "$report_file"
    echo "  • ✅ Пройдено: $PASSED_CHECKS" >> "$report_file"
    echo "  • ❌ Провалено: $FAILED_CHECKS" >> "$report_file"
    echo "  • ⚠️ Предупреждения: $WARNING_CHECKS" >> "$report_file"
    echo "" >> "$report_file"
    
    local success_rate=0
    if [ $TOTAL_CHECKS -gt 0 ]; then
        success_rate=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
    fi
    
    echo "📈 Процент успешности: ${success_rate}%" >> "$report_file"
    echo "" >> "$report_file"
    
    if [ $FAILED_CHECKS -gt 0 ]; then
        echo "🚨 КРИТИЧНЫЕ ПРОБЛЕМЫ:" >> "$report_file"
        echo "Обнаружено $FAILED_CHECKS критичных проблем, требующих немедленного исправления." >> "$report_file"
        echo "" >> "$report_file"
    fi
    
    if [ $WARNING_CHECKS -gt 0 ]; then
        echo "⚠️ ПРЕДУПРЕЖДЕНИЯ:" >> "$report_file"
        echo "Обнаружено $WARNING_CHECKS предупреждений для улучшения." >> "$report_file"
        echo "" >> "$report_file"
    fi
    
    echo "РЕКОМЕНДАЦИИ:" >> "$report_file"
    if [ $FAILED_CHECKS -gt 0 ]; then
        echo "1. Исправьте все критичные проблемы перед развертыванием в продакшн" >> "$report_file"
    fi
    if [ $WARNING_CHECKS -gt 0 ]; then
        echo "2. Рассмотрите устранение предупреждений для повышения качества" >> "$report_file"
    fi
    echo "3. Запускайте валидацию регулярно (например, в CI/CD)" >> "$report_file"
    echo "4. Обновляйте проверки при изменении инфраструктуры" >> "$report_file"
    
    log INFO "Отчет сохранен: $report_file"
}

# Основная функция
main() {
    log INFO "🚀 Начинаем валидацию инфраструктуры AquaStream"
    log INFO "📂 Проект: $PROJECT_ROOT"
    echo
    
    # Выполняем все проверки
    validate_docker_compose
    validate_environment_files
    validate_dockerfiles
    validate_monitoring_configs
    validate_scripts
    validate_security
    validate_project_structure
    
    echo
    log INFO "🏁 Валидация завершена!"
    
    # Показываем итоговую статистику
    echo
    log INFO "📊 Итоговая статистика:"
    log INFO "  • Всего проверок: $TOTAL_CHECKS"
    log INFO "  • ✅ Пройдено: $PASSED_CHECKS"
    log INFO "  • ❌ Провалено: $FAILED_CHECKS"
    log INFO "  • ⚠️ Предупреждения: $WARNING_CHECKS"
    
    local success_rate=0
    if [ $TOTAL_CHECKS -gt 0 ]; then
        success_rate=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
    fi
    
    log INFO "📈 Процент успешности: ${success_rate}%"
    
    # Генерируем отчет
    generate_report
    
    # Определяем exit code
    if [ $FAILED_CHECKS -gt 0 ]; then
        log ERROR "🚨 Обнаружены критичные проблемы! Исправьте их перед развертыванием."
        return 1
    elif [ $WARNING_CHECKS -gt 0 ]; then
        log WARN "⚠️ Есть предупреждения для улучшения качества инфраструктуры."
        return 0
    else
        log INFO "🎉 Все проверки пройдены успешно!"
        return 0
    fi
}

# Обработка аргументов командной строки
case "${1:-}" in
    "--help"|"-h")
        echo "AquaStream Infrastructure Validation Tool"
        echo "========================================="
        echo ""
        echo "Использование: $0 [опции]"
        echo ""
        echo "Опции:"
        echo "  --help, -h          Показать эту справку"
        echo "  --docker-only       Только проверки Docker Compose"
        echo "  --security-only     Только проверки безопасности"
        echo "  --quick             Быстрая проверка (пропустить тяжелые проверки)"
        echo ""
        echo "Проверки включают:"
        echo "  • Docker Compose синтаксис и best practices"
        echo "  • Переменные окружения и пароли"
        echo "  • Dockerfile оптимизации"
        echo "  • Конфигурации мониторинга"
        echo "  • Shell скрипты"
        echo "  • Безопасность файлов"
        echo "  • Структура проекта"
        echo ""
        exit 0
        ;;
    "--docker-only")
        log INFO "🐳 Только проверки Docker"
        validate_docker_compose
        validate_dockerfiles
        ;;
    "--security-only")
        log INFO "🔒 Только проверки безопасности"
        validate_security
        validate_environment_files
        ;;
    "--quick")
        log INFO "⚡ Быстрая валидация"
        validate_docker_compose
        validate_environment_files
        validate_security
        ;;
    "")
        # Полная валидация
        main
        ;;
    *)
        log ERROR "Неизвестная опция: $1"
        log INFO "Используйте --help для справки"
        exit 1
        ;;
esac