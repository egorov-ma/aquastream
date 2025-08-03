#!/bin/bash
set -euo pipefail
# Используйте: ./run.sh <команда> [аргументы]

# Определяем корневую директорию проекта
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="${PROJECT_ROOT}/infra/scripts"

# Цвета
NC="\033[0m"; GREEN="\033[0;32m"; YELLOW="\033[0;33m"; RED="\033[0;31m"

# Функция логирования с уровнями
log() {
    local level="$1"; shift
    # Удаляем квадратные скобки, если переданы
    level="${level//[\[\]]/}"
    local msg="$*"
    local color="$GREEN"
    case "$level" in
      INFO)  color="$GREEN";;
      WARN)  color="$YELLOW";;
      ERROR) color="$RED";;
    esac
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${color}${level}${NC} ${msg}"
}

# Функция для проверки наличия необходимых инструментов
check_requirements() {
    # Проверка Docker
    if ! command -v docker &> /dev/null; then
        log ERROR "Docker не установлен!"
        exit 1
    fi

    # Проверка Docker Compose
    if ! docker compose version &> /dev/null; then
        log ERROR "Плагин Docker Compose (docker compose) не найден! Обновите Docker до актуальной версии."
        exit 1
    fi

    # Проверка Docker daemon
    check_docker_daemon_ready
}

# Функция для проверки готовности Docker daemon
check_docker_daemon_ready() {
    local max_attempts=10
    local attempt=1
    local delay=2
    
    log INFO "Проверка состояния Docker daemon..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker info &>/dev/null; then
            log INFO "Docker daemon готов к работе"
            check_docker_resources
            return 0
        fi
        
        log WARN "Docker daemon недоступен (попытка $attempt/$max_attempts), ожидание ${delay}s..."
        sleep $delay
        attempt=$((attempt + 1))
        delay=$((delay + 1))  # Увеличиваем задержку
    done
    
    log ERROR "Docker daemon недоступен после $max_attempts попыток!"
    log ERROR "Попробуйте: 'sudo systemctl start docker' (Linux) или перезапустите Docker Desktop"
    exit 1
}

# Функция для проверки ресурсов Docker
check_docker_resources() {
    # Проверяем доступную память
    local total_memory
    if command -v docker system info &>/dev/null; then
        total_memory=$(docker system info --format '{{.MemTotal}}' 2>/dev/null || echo "0")
        if [ "$total_memory" -gt 0 ] && [ "$total_memory" -lt 5368709120 ]; then  # 5GB в байтах
            log WARN "Доступная память в Docker: $(numfmt --to=iec $total_memory). Рекомендуется минимум 5GB"
        fi
    fi
    
    # Проверяем доступность сетей Docker
    if ! docker network ls &>/dev/null; then
        log WARN "Проблемы с Docker сетями, проверьте настройки"
    fi
    
    # Проверяем доступность volume driver
    if ! docker volume ls &>/dev/null; then
        log WARN "Проблемы с Docker volumes, проверьте настройки"
    fi
}

# Функция для остановки контейнеров
stop_containers() {
    log "[INFO] Остановка всех контейнеров и очистка ресурсов..."
    if [ -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ]; then
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" down -v --remove-orphans
    else
        log "[ERROR] Файл docker-compose.yml не найден!"
        exit 1
    fi
    # Очистка данных ZooKeeper (если volume существует)
    ZOOKEEPER_VOLUME=$(docker volume ls -q | grep zookeeper | head -n1 || true)
    if [ -n "$ZOOKEEPER_VOLUME" ]; then
        MNT=$(docker volume inspect "$ZOOKEEPER_VOLUME" -f '{{ .Mountpoint }}')
        if [ -d "$MNT/version-2" ]; then
            log INFO "Очистка данных ZooKeeper в $MNT..."
            rm -rf "$MNT/version-2"/*
            log INFO "Данные ZooKeeper очищены"
        fi
    fi
}

# Функция для запуска контейнеров
start_containers() {
    log "[INFO] Полный перезапуск контейнеров..."
    stop_containers
    log "[INFO] Запускаем docker compose..."

    local compose_file="$PROJECT_ROOT/infra/docker/compose/docker-compose.yml"
    if [ -f "$compose_file" ]; then
        # Тянем образы без секции build
        docker compose -f "$compose_file" pull --quiet --ignore-buildable 2>/dev/null || true
        # Собираем build-образа
        docker compose -f "$compose_file" build --quiet
        # Запускаем контейнеры
        docker compose -f "$compose_file" up -d
        wait_healthy 180
    else
        log "[ERROR] Файл docker-compose.yml не найден!"
        exit 1
    fi
}

# Улучшенная функция ожидания готовности контейнеров
wait_healthy() {
    local max_wait=${1:-180}
    local elapsed=0
    local check_interval=10
    local previous_status=""
    
    log INFO "Ожидание готовности контейнеров (до ${max_wait}s)..."
    
    while [ $elapsed -lt $max_wait ]; do
        # Получаем статус без jq для совместимости
        local status_info
        status_info=$(docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}" 2>/dev/null || true)
        
        # Подсчитываем контейнеры
        local total_containers running_containers healthy_containers
        total_containers=$(echo "$status_info" | tail -n +2 | wc -l)
        running_containers=$(echo "$status_info" | grep -c "Up " || echo "0")
        healthy_containers=$(echo "$status_info" | grep -c "healthy" || echo "0")
        
        # Логируем прогресс только при изменениях
        local current_status="$running_containers/$total_containers running, $healthy_containers healthy"
        if [ "$current_status" != "$previous_status" ]; then
            log INFO "Прогресс: $current_status"
            previous_status="$current_status"
        fi
        
        # Проверяем условие готовности
        if [ "$running_containers" -eq "$total_containers" ] && [ "$healthy_containers" -eq "$total_containers" ]; then
            log INFO "✅ Все $total_containers контейнеров готовы к работе!"
            show_service_endpoints
            return 0
        fi
        
        # Проверяем на failed контейнеры
        local failed_containers
        failed_containers=$(echo "$status_info" | grep -E "(Exited|Dead)" | cut -f1 || true)
        if [ -n "$failed_containers" ]; then
            log ERROR "❌ Обнаружены упавшие контейнеры: $failed_containers"
            log ERROR "Используйте './run.sh logs' для диагностики"
            return 1
        fi
        
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
    done
    
    # Таймаут - показываем детальную информацию
    log WARN "⏰ Таймаут ожидания готовности контейнеров после ${max_wait}s"
    log INFO "Текущий статус контейнеров:"
    echo "$status_info"
    
    return 1
}

# Функция для отображения доступных endpoints
show_service_endpoints() {
    log INFO "🌐 Доступные сервисы:"
    echo "  • Веб-приложение:      https://localhost/"
    echo "  • API:                 https://localhost/api/"
    echo "  • Мониторинг:          https://localhost/monitoring/ (admin:monitoring123)"
    echo "  • Health Check:        https://localhost/health"
    echo ""
    echo "  Для разработки (прямой доступ):"
    echo "  • PostgreSQL:          localhost:5432"
    echo "  • Kafka:               localhost:19092"
}

# Функция для валидации инфраструктуры
validate_infrastructure() {
    log "[INFO] Запуск валидации инфраструктуры..."
    local validation_script="$SCRIPT_DIR/validate-infrastructure.sh"
    
    if [ -f "$validation_script" ]; then
        bash "$validation_script" "$@"
    else
        log "[ERROR] Скрипт валидации не найден: $validation_script"
        exit 1
    fi
}

# Функция для запуска тестов
run_tests() {
    log "[INFO] Запуск тестов..."
    local test_script="$SCRIPT_DIR/run-tests.sh"
    
    if [ -f "$test_script" ]; then
        bash "$test_script" "$@"
    else
        log "[ERROR] Скрипт тестирования не найден: $test_script"
        exit 1
    fi
}

# Функция для резервного копирования
run_backup() {
    log INFO "Запуск резервного копирования..."
    local backup_script="$SCRIPT_DIR/backup-restore.sh"
    
    if [ -f "$backup_script" ]; then
        bash "$backup_script" backup "$@"
    else
        log ERROR "Скрипт резервного копирования не найден: $backup_script"
        exit 1
    fi
}

# Функция для восстановления из резервных копий
run_restore() {
    log INFO "Запуск восстановления..."
    local backup_script="$SCRIPT_DIR/backup-restore.sh"
    
    if [ -f "$backup_script" ]; then
        if [ -z "${1:-}" ]; then
            # Показываем список доступных backup'ов
            bash "$backup_script" list
            echo
            read -p "Введите дату backup'а для восстановления (YYYYMMDD_HHMMSS): " backup_date
            if [ -n "$backup_date" ]; then
                bash "$backup_script" restore "$backup_date"
            else
                log WARN "Восстановление отменено"
            fi
        else
            bash "$backup_script" restore "$@"
        fi
    else
        log ERROR "Скрипт восстановления не найден: $backup_script"
        exit 1
    fi
}

# Функция генерации криптографически стойкого пароля
generate_password() {
    local length=${1:-32}
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -base64 $((length * 3 / 4)) | tr -d "=+/" | cut -c1-${length}
    elif command -v python3 >/dev/null 2>&1; then
        python3 -c "import secrets, string; print(''.join(secrets.choice(string.ascii_letters + string.digits + '@#%^&*') for _ in range(${length})))"
    else
        log ERROR "Не найден openssl или python3 для генерации паролей"
        exit 1
    fi
}


# Функция генерации паролей
generate_passwords() {
    log INFO "========== Генерация сильных паролей для AquaStream =========="
    
    local env_file="$PROJECT_ROOT/infra/docker/compose/.env"
    if [[ ! -f "$env_file" ]]; then
        log ERROR "Файл .env не найден: $env_file"
        log INFO "Скопируйте .env.example в .env и настройте переменные"
        exit 1
    fi
    
    # Генерируем пароли
    local postgres_pass=$(generate_password 24)
    local grafana_pass=$(generate_password 20)
    local elastic_pass=$(generate_password 28)
    local kibana_pass=$(generate_password 24)
    
    log INFO "Сгенерированы сильные пароли для всех сервисов"
    
    # Обновляем .env файл
    log INFO "Обновление .env файла..."
    cp "$env_file" "${env_file}.backup.$(date +%Y%m%d-%H%M%S)"
    
    sed -i.tmp \
        -e "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${postgres_pass}/" \
        -e "s/^GRAFANA_ADMIN_PASSWORD=.*/GRAFANA_ADMIN_PASSWORD=${grafana_pass}/" \
        -e "s/^ELASTIC_PASSWORD=.*/ELASTIC_PASSWORD=${elastic_pass}/" \
        -e "s/^KIBANA_PASSWORD=.*/KIBANA_PASSWORD=${kibana_pass}/" \
        "$env_file"
    
    rm -f "${env_file}.tmp"
    log INFO "Файл .env обновлен с новыми паролями"
    
    # Добавляем в .gitignore
    local gitignore_file="$PROJECT_ROOT/.gitignore"
    if [[ -f "$gitignore_file" ]] && ! grep -q "secrets/" "$gitignore_file"; then
        echo "" >> "$gitignore_file"
        echo "# Security: Docker secrets and passwords" >> "$gitignore_file"
        echo "infra/docker/compose/secrets/" >> "$gitignore_file"
        echo "*.backup.*" >> "$gitignore_file"
        log INFO "Добавлено в .gitignore: secrets/ и backup файлы"
    fi
    
    echo
    log INFO "Сгенерированные пароли:"
    echo "  PostgreSQL: ${postgres_pass}"
    echo "  Grafana:    ${grafana_pass}"
    echo "  Elastic:    ${elastic_pass}"
    echo "  Kibana:     ${kibana_pass}"
    echo
    log WARN "⚠️  ВАЖНО: Сохраните эти пароли в безопасном месте!"
    log WARN "⚠️  После смены паролей потребуется пересоздание контейнеров"
}

# Функция проверки силы пароля
check_password_strength() {
    local password="$1"
    local min_length=12
    
    if [[ ${#password} -lt $min_length ]]; then
        echo "Пароль слишком короткий (минимум $min_length символов)"
        return 1
    fi
    
    local has_upper=false has_lower=false has_digit=false has_special=false
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
    
    return 0
}

# Функция интерактивного ввода пароля
input_password() {
    local service_name="$1"
    local password confirm_password
    
    while true; do
        read -s -p "Введите новый пароль для ${service_name}: " password
        echo
        
        if ! check_password_strength "$password"; then
            log WARN "Пароль не соответствует требованиям безопасности. Попробуйте еще раз."
            continue
        fi
        
        read -s -p "Подтвердите пароль: " confirm_password
        echo
        
        if [[ "$password" != "$confirm_password" ]]; then
            log WARN "Пароли не совпадают. Попробуйте еще раз."
            continue
        fi
        
        echo "$password"
        return 0
    done
}

# Функция обновления паролей
update_passwords() {
    log INFO "========== Обновление паролей AquaStream =========="
    
    local env_file="$PROJECT_ROOT/infra/docker/compose/.env"
    if [[ ! -f "$env_file" ]]; then
        log ERROR "Файл .env не найден: $env_file"
        exit 1
    fi
    
    # Выбор метода обновления
    echo "Выберите метод обновления паролей:"
    echo "1) Автоматическая генерация сильных паролей (рекомендуется)"
    echo "2) Ввод паролей вручную"
    read -p "Ваш выбор [1-2]: " choice
    
    case $choice in
        1)
            generate_passwords
            ;;
        2)
            log INFO "Ввод паролей вручную..."
            cp "$env_file" "${env_file}.backup.$(date +%Y%m%d-%H%M%S)"
            
            local postgres_pass=$(input_password "PostgreSQL")
            local grafana_pass=$(input_password "Grafana Admin")
            local elastic_pass=$(input_password "Elasticsearch")
            local kibana_pass=$(input_password "Kibana")
            
            sed -i.tmp \
                -e "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${postgres_pass}/" \
                -e "s/^GRAFANA_ADMIN_PASSWORD=.*/GRAFANA_ADMIN_PASSWORD=${grafana_pass}/" \
                -e "s/^ELASTIC_PASSWORD=.*/ELASTIC_PASSWORD=${elastic_pass}/" \
                -e "s/^KIBANA_PASSWORD=.*/KIBANA_PASSWORD=${kibana_pass}/" \
                "$env_file"
            
            rm -f "${env_file}.tmp"
            log INFO "Пароли обновлены в .env файле"
            ;;
        *)
            log ERROR "Неверный выбор"
            exit 1
            ;;
    esac
    
    echo
    log WARN "⚠️  Для применения новых паролей требуется перезапуск сервисов"
    read -p "Перезапустить сервисы сейчас? [y/N]: " restart_services
    
    if [[ "${restart_services,,}" =~ ^(y|yes)$ ]]; then
        log INFO "Перезапуск сервисов с новыми паролями..."
        stop_containers
        start_containers
        log INFO "Пароли успешно обновлены и применены!"
    else
        log WARN "Не забудьте перезапустить сервисы: ./run.sh stop && ./run.sh start"
    fi
}

# Функция для управления безопасностью и паролями  
run_security() {
    log INFO "Управление безопасностью..."
    local action="${1:-update}"
    
    case "$action" in
        "generate"|"gen")
            generate_passwords
            ;;
        "update"|"upd")
            update_passwords
            ;;
        *)
            log ERROR "Неизвестное действие безопасности: $action"
            log INFO "Доступные действия: generate (gen), update (upd)"
            exit 1
            ;;
    esac
}

# Функция проверки git репозитория
check_git_repo() {
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        log ERROR "Не git репозиторий!"
        exit 1
    fi
    log INFO "✅ Git репозиторий найден"
}

# Функция настройки git hooks директории
setup_hooks_directory() {
    local git_dir
    git_dir=$(git rev-parse --git-dir)
    local custom_hooks_dir="$PROJECT_ROOT/.githooks"
    
    log INFO "📁 Настройка git hooks директории..."
    
    mkdir -p "$custom_hooks_dir"
    git config core.hooksPath "$custom_hooks_dir"
    
    log INFO "✅ Git hooks директория настроена: $custom_hooks_dir"
}

# Упрощенная функция проверки основных инструментов
check_basic_tools() {
    local missing_tools=()
    
    if ! command -v docker >/dev/null 2>&1; then
        missing_tools+=("docker")
    fi
    
    if ! docker compose version >/dev/null 2>&1; then
        missing_tools+=("docker-compose")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log ERROR "❌ Отсутствуют инструменты: ${missing_tools[*]}"
        return 1
    fi
    
    return 0
}

# Функция создания базового pre-commit hook
create_precommit_hook() {
    local custom_hooks_dir="$PROJECT_ROOT/.githooks"
    local precommit_hook="$custom_hooks_dir/pre-commit"
    
    if [ -f "$precommit_hook" ]; then
        log INFO "✅ Pre-commit hook уже существует"
        chmod +x "$precommit_hook"
        return 0
    fi
    
    log INFO "🔧 Создание pre-commit hook..."
    
    cat > "$precommit_hook" << 'EOF'
#!/bin/bash
# AquaStream pre-commit hook
# Автоматическая валидация изменений инфраструктуры

set -e

echo "🔍 Запуск валидации инфраструктуры..."

# Проверяем изменения в Docker файлах
if git diff --cached --name-only | grep -qE '\.(yml|yaml|dockerfile|sh)$'; then
    echo "📋 Обнаружены изменения в инфраструктурных файлах"
    
    # Запускаем быструю валидацию
    if [ -f "infra/scripts/validate-infrastructure.sh" ]; then
        bash infra/scripts/validate-infrastructure.sh --quick
    elif [ -f "run.sh" ]; then
        ./run.sh validate --quick
    else
        echo "⚠️ Скрипт валидации не найден, пропускаем проверку"
    fi
fi

echo "✅ Pre-commit валидация завершена"
EOF
    
    chmod +x "$precommit_hook"
    log INFO "✅ Pre-commit hook создан: $precommit_hook"
}

# Упрощенная функция настройки среды разработчика
run_setup_dev() {
    log INFO "Настройка среды разработчика..."
    
    # Основная настройка
    check_git_repo
    setup_hooks_directory
    create_precommit_hook
    check_basic_tools
    
    log INFO "✅ Настройка завершена"
    log INFO "Git hooks установлены в .githooks/"
}

# Функция для очистки Docker ресурсов
clean_docker() {
    local clean_type="${1:-basic}"
    
    log "[INFO] Очистка Docker ресурсов (режим: $clean_type)..."
    
    case "$clean_type" in
        "basic")
            log "[INFO] Базовая очистка: остановка контейнеров и удаление volumes..."
            stop_containers
            ;;
        "full")
            log "[INFO] Полная очистка: контейнеры, образы, volumes, сети..."
            stop_containers
            
            # Удаляем все остановленные контейнеры
            local stopped_containers=$(docker ps -a -q -f status=exited || true)
            if [ -n "$stopped_containers" ]; then
                log "[INFO] Удаление остановленных контейнеров..."
                docker rm $stopped_containers || true
            fi
            
            # Удаляем неиспользуемые образы
            log "[INFO] Удаление неиспользуемых образов..."
            docker image prune -f || true
            
            # Удаляем неиспользуемые volumes
            log "[INFO] Удаление неиспользуемых volumes..."
            docker volume prune -f || true
            
            # Удаляем неиспользуемые сети
            log "[INFO] Удаление неиспользуемых сетей..."
            docker network prune -f || true
            ;;
        "deep")
            log "[WARN] Глубокая очистка: ВСЕ Docker ресурсы будут удалены!"
            read -p "Вы уверены? Это удалит ВСЕ Docker данные (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                stop_containers
                
                # Полная очистка системы
                log "[INFO] Выполняется docker system prune --all --volumes..."
                docker system prune --all --volumes -f || true
                
                # Удаляем все контейнеры принудительно
                local all_containers=$(docker ps -a -q || true)
                if [ -n "$all_containers" ]; then
                    log "[INFO] Принудительное удаление всех контейнеров..."
                    docker rm -f $all_containers || true
                fi
                
                # Удаляем все образы принудительно
                local all_images=$(docker images -q || true)
                if [ -n "$all_images" ]; then
                    log "[INFO] Принудительное удаление всех образов..."
                    docker rmi -f $all_images || true
                fi
            else
                log "[INFO] Глубокая очистка отменена"
                return 0
            fi
            ;;
        *)
            log "[ERROR] Неизвестный тип очистки: $clean_type"
            log "[INFO] Доступные типы: basic, full, deep"
            exit 1
            ;;
    esac
    
    # Показываем статистику использования диска после очистки
    log "[INFO] Статистика Docker после очистки:"
    docker system df 2>/dev/null || log "[WARN] Не удалось получить статистику Docker"
}

# Функция для сборки проекта (backend, frontend, Docker images)
build_project() {
    local mode="summary"

    # Определяем режим вывода логов
    if [[ "${1:-}" =~ ^(--full|-f)$ ]]; then
        mode="full"
    elif [[ -z "${1:-}" || "${1:-}" =~ ^(--summary|-s)$ ]]; then
        mode="summary"
    else
        log ERROR "Неизвестный режим билда: $1"
        exit 1
    fi

    # ========================= Backend =========================
    log INFO "========== Сборка backend (${mode}) =========="
    if [ "$mode" = "full" ]; then
        ./gradlew clean build -x test || { log ERROR "Gradle build failed"; exit 1; }
    else
        backend_log=$(mktemp)
        ./gradlew clean build -x test --console=plain >"$backend_log" 2>&1
        if [ $? -eq 0 ]; then
            log INFO "Backend build SUCCESS"
        else
            log ERROR "Backend build FAILED. Полный лог: $backend_log"
            exit 1
        fi
    fi

    # ========================= Frontend =========================
    log INFO "========== Сборка frontend (${mode}) =========="
    if [ "$mode" = "full" ]; then
        (cd frontend && npm ci && npm run build) || { log ERROR "Frontend build failed"; exit 1; }
    else
        frontend_log=$(mktemp)
        (cd frontend && npm ci --silent && npm run build --silent) >"$frontend_log" 2>&1
        if [ $? -eq 0 ]; then
            log INFO "Frontend build SUCCESS"
        else
            log ERROR "Frontend build FAILED. Полный лог: $frontend_log"
            exit 1
        fi
    fi

    # ========================= Docker images =========================
    log INFO "========== Docker compose build (${mode}) =========="
    if [ "$mode" = "full" ]; then
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" build || { log ERROR "Docker build failed"; exit 1; }
    else
        docker_log=$(mktemp)
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" build --quiet >"$docker_log" 2>&1
        if [ $? -eq 0 ]; then
            log INFO "Docker images build SUCCESS"
        else
            log ERROR "Docker images build FAILED. Полный лог: $docker_log"
            exit 1
        fi
    fi
}

# Функция для просмотра логов
view_logs() {
    log "[INFO] Просмотр логов..."
    if [ -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ]; then
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" logs -f
    else
        log "[ERROR] Файл docker-compose.yml не найден!"
        exit 1
    fi
}

# Упрощенная справка - только ежедневные команды
show_help() {
    echo "AquaStream Management Tool"
    echo "========================="
    echo "Использование: $0 <команда>"
    echo
    echo "📋 Ежедневные команды:"
    echo "  start         Запустить проект"
    echo "  stop          Остановить проект" 
    echo "  build         Собрать проект"
    echo "  test          Запустить тесты"
    echo "  logs          Показать логи"
    echo "  status        Статус контейнеров"
    echo
    echo "🔧 Разовые команды:"
    echo "  setup-dev     Настройка среды разработчика (один раз)"
    echo "  security      Обновление паролей"
    echo "  validate      Проверка конфигурации"
    echo "  backup        Резервное копирование"
    echo "  clean         Очистка Docker"
    echo
    echo "📖 Документация:"
    echo "  Подробное описание функций: infra/docs/SCRIPTS_REFERENCE.md"
    echo "  Все опции команд: ./run.sh help-advanced"
    echo
    exit 0
}

# Функция для отображения опций команд
show_help_options() {
    echo "AquaStream Management Tool - Расширенная справка"
    echo "================================================"
    echo "Использование: $0 <команда> [аргументы]"
    echo
    echo "ОСНОВНЫЕ КОМАНДЫ:"
    echo
    echo "  build [опции]         Сборка проекта"
    echo "    --full, -f          Полный вывод логов сборки"
    echo "    --summary, -s       Краткий вывод (по умолчанию)"
    echo
    echo "  start                 Запуск контейнеров"
    echo "    • Останавливает существующие контейнеры"
    echo "    • Собирает и запускает все сервисы"
    echo "    • Ждет готовности всех health checks"
    echo
    echo "  stop                  Остановка контейнеров"
    echo "    • Останавливает все контейнеры"
    echo "    • Удаляет volumes и networks"
    echo "    • Очищает ZooKeeper данные"
    echo
    echo "  validate [опции]      Валидация инфраструктуры"
    echo "    --quick             Быстрая проверка основных компонентов"
    echo "    --docker-only       Только проверки Docker Compose и Dockerfile"
    echo "    --security-only     Только проверки безопасности"
    echo "    --help              Подробная справка по валидации"
    echo
    echo "  test [опции]          Запуск тестов"
    echo "    --backend-only      Только backend тесты (Gradle)"
    echo "    --frontend-only     Только frontend тесты (npm test)"
    echo "    --integration-only  Только интеграционные тесты"
    echo "    --infrastructure-only  Только тесты инфраструктуры"
    echo "    --no-report         Не генерировать отчет"
    echo
    echo "  clean [тип]           Очистка Docker ресурсов"
    echo "    basic               Остановка контейнеров и удаление volumes (по умолчанию)"
    echo "    full                + удаление неиспользуемых образов и сетей"
    echo "    deep                Полная очистка всех Docker данных (с подтверждением)"
    echo
    echo "ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ:"
    echo
    echo "  backup [тип]          Резервное копирование"
    echo "    • Поддерживает PostgreSQL, Elasticsearch, конфигурации"
    echo "    • Создает архивы с меткой времени"
    echo "    • Автоматическая проверка целостности"
    echo
    echo "  restore [файл]        Восстановление из backup"
    echo "    • Восстановление из указанного файла"
    echo "    • Поддержка различных типов бэкапов"
    echo "    • Автоматическая валидация данных"
    echo
    echo "  security [действие]   Управление безопасностью"
    echo "    generate, gen       Генерация новых секретов и паролей"
    echo "    update, upd         Обновление существующих паролей"
    echo
    echo "  setup-dev [опция]     Настройка среды разработчика (встроено)"
    echo "    full                Полная настройка (hooks, инструменты, документация)"
    echo "    git-hooks, hooks    Только Git hooks"
    echo "    check               Проверка текущих настроек"
    echo "    uninstall           Удаление Git hooks"
    echo
    echo "СЛУЖЕБНЫЕ КОМАНДЫ:"
    echo
    echo "  logs [service]        Просмотр логов"
    echo "    • Без параметров: все логи"
    echo "    • С именем сервиса: логи конкретного сервиса"
    echo
    echo "  status                Статус системы"
    echo "    • Статус всех контейнеров"
    echo "    • Health check статус"
    echo "    • Использование ресурсов"
    echo
    echo "ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ:"
    echo
    echo "  # Полный цикл разработки"
    echo "  $0 build --full && $0 validate && $0 test && $0 start"
    echo
    echo "  # Резервное копирование перед обновлением"
    echo "  $0 backup && $0 stop && $0 build && $0 start"
    echo
    echo "  # Диагностика проблем"
    echo "  $0 status && $0 logs api-gateway"
    echo
    echo "  # Полная очистка и перезапуск"
    echo "  $0 clean deep && $0 build && $0 start"
    echo
    echo "  # Настройка новой среды разработки"
    echo "  $0 setup-dev && $0 security generate && $0 build"
    echo
    exit 0
}


# Переходим в корневую директорию проекта
cd "$PROJECT_ROOT" || { echo "Ошибка: не могу перейти в директорию ${PROJECT_ROOT}"; exit 1; }

# Если нет аргументов или указан флаг help, показываем справку
if [ $# -eq 0 ]; then
    show_help
fi

# Проверяем первый аргумент на команду help
if [ "$1" = "help" ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
elif [ "$1" = "help-advanced" ] || [ "$1" = "options" ]; then
    show_help_options
fi

# Проверяем наличие необходимых инструментов
check_requirements

# Обработка команд для работы с контейнерами
case "$1" in
    "start")
        start_containers
        ;;
    "stop")
        stop_containers
        ;;
    "build")
        shift  # убираем ключевое слово build
        build_project "$@"  # передаём оставшиеся аргументы функции
        ;;
    "validate")
        shift  # убираем ключевое слово validate
        validate_infrastructure "$@"  # передаём оставшиеся аргументы функции
        ;;
    "test")
        shift  # убираем ключевое слово test
        run_tests "$@"  # передаём оставшиеся аргументы функции
        ;;
    "clean")
        shift  # убираем ключевое слово clean
        clean_docker "${1:-basic}"  # по умолчанию basic очистка
        ;;
    "logs")
        shift
        if [ -n "$1" ]; then
            docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" logs -f "$1"
        else
            view_logs
        fi
        ;;
    "status")
        docker compose -f "$PROJECT_ROOT/infra/docker/compose/docker-compose.yml" ps
        ;;
    "backup")
        shift  # убираем ключевое слово backup
        run_backup "$@"  # передаём оставшиеся аргументы функции
        ;;
    "restore")
        shift  # убираем ключевое слово restore
        run_restore "$@"  # передаём оставшиеся аргументы функции
        ;;
    "security")
        shift  # убираем ключевое слово security
        run_security "$@"  # передаём оставшиеся аргументы функции
        ;;
    "setup-dev")
        shift  # убираем ключевое слово setup-dev
        run_setup_dev "$@"  # передаём оставшиеся аргументы функции
        ;;
    *)
        log "[ERROR] Неизвестная команда: $1"
        show_help
        ;;
esac

log "[INFO] Операция завершена успешно!"