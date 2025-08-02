#!/bin/bash
# Скрипт генерации сильных паролей для AquaStream
# Использует cryptographically secure random для production security

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="${SCRIPT_DIR}/../docker/compose"
ENV_FILE="${COMPOSE_DIR}/.env"
SECRETS_DIR="${COMPOSE_DIR}/secrets"

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

# Функция генерации криптографически стойкого пароля
generate_password() {
    local length=${1:-32}
    # Используем /dev/urandom для криптографически стойкой генерации
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -base64 $((length * 3 / 4)) | tr -d "=+/" | cut -c1-${length}
    elif command -v python3 >/dev/null 2>&1; then
        python3 -c "import secrets, string; print(''.join(secrets.choice(string.ascii_letters + string.digits + '@#%^&*') for _ in range(${length})))"
    else
        log_error "Не найден openssl или python3 для генерации паролей"
        exit 1
    fi
}

# Функция создания Docker secret
create_docker_secret() {
    local secret_name="$1"
    local secret_value="$2"
    
    # Проверяем, существует ли уже secret
    if docker secret ls --format "table {{.Name}}" | grep -q "^${secret_name}$"; then
        log_warn "Secret ${secret_name} уже существует, пропускаем..."
        return 0
    fi
    
    echo "${secret_value}" | docker secret create "${secret_name}" - 2>/dev/null
    if [[ $? -eq 0 ]]; then
        log_success "Docker secret ${secret_name} создан"
    else
        log_error "Ошибка создания Docker secret ${secret_name}"
        return 1
    fi
}

# Функция сохранения пароля в файл
save_password_to_file() {
    local filename="$1"
    local password="$2"
    
    echo "${password}" > "${SECRETS_DIR}/${filename}"
    chmod 600 "${SECRETS_DIR}/${filename}"
    log_success "Пароль сохранен в ${SECRETS_DIR}/${filename}"
}

# Проверяем наличие .env файла
if [[ ! -f "${ENV_FILE}" ]]; then
    log_error "Файл .env не найден: ${ENV_FILE}"
    log_info "Скопируйте .env.example в .env и настройте переменные"
    exit 1
fi

# Создаем директорию для secrets
mkdir -p "${SECRETS_DIR}"
chmod 700 "${SECRETS_DIR}"

log_info "========== Генерация сильных паролей для AquaStream =========="

# Генерируем пароли
POSTGRES_PASS=$(generate_password 24)
GRAFANA_PASS=$(generate_password 20) 
ELASTIC_PASS=$(generate_password 28)
KIBANA_PASS=$(generate_password 24)

log_info "Сгенерированы сильные пароли для всех сервисов"

# Опция 1: Docker Secrets (рекомендуется для production)
echo
read -p "Создать Docker Secrets? (рекомендуется для production) [y/N]: " use_docker_secrets

if [[ "${use_docker_secrets,,}" =~ ^(y|yes)$ ]]; then
    log_info "Создание Docker Secrets..."
    
    # Проверяем Docker Swarm
    if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "active"; then
        log_warn "Docker Swarm не активен. Инициализируем..."
        docker swarm init --advertise-addr 127.0.0.1 2>/dev/null || {
            log_error "Не удалось инициализировать Docker Swarm"
            exit 1
        }
        log_success "Docker Swarm инициализирован"
    fi
    
    # Создаем secrets
    create_docker_secret "aquastream_postgres_password" "${POSTGRES_PASS}"
    create_docker_secret "aquastream_grafana_password" "${GRAFANA_PASS}"
    create_docker_secret "aquastream_elastic_password" "${ELASTIC_PASS}"
    create_docker_secret "aquastream_kibana_password" "${KIBANA_PASS}"
    
    log_success "Все Docker Secrets созданы"
    log_info "Для использования secrets обновите docker-compose.yml"
else
    log_info "Docker Secrets пропущены"
fi

# Опция 2: Файлы (для разработки)
echo
read -p "Сохранить пароли в защищенные файлы? [y/N]: " save_to_files

if [[ "${save_to_files,,}" =~ ^(y|yes)$ ]]; then
    log_info "Сохранение паролей в файлы..."
    
    save_password_to_file "postgres_password.txt" "${POSTGRES_PASS}"
    save_password_to_file "grafana_password.txt" "${GRAFANA_PASS}"
    save_password_to_file "elastic_password.txt" "${ELASTIC_PASS}"
    save_password_to_file "kibana_password.txt" "${KIBANA_PASS}"
    
    log_success "Пароли сохранены в ${SECRETS_DIR}/"
fi

# Опция 3: Обновление .env файла
echo
read -p "Обновить .env файл с новыми паролями? [y/N]: " update_env

if [[ "${update_env,,}" =~ ^(y|yes)$ ]]; then
    log_info "Обновление .env файла..."
    
    # Создаем резервную копию
    cp "${ENV_FILE}" "${ENV_FILE}.backup.$(date +%Y%m%d-%H%M%S)"
    
    # Обновляем пароли в .env
    sed -i.tmp \
        -e "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASS}/" \
        -e "s/^GRAFANA_ADMIN_PASSWORD=.*/GRAFANA_ADMIN_PASSWORD=${GRAFANA_PASS}/" \
        -e "s/^ELASTIC_PASSWORD=.*/ELASTIC_PASSWORD=${ELASTIC_PASS}/" \
        -e "s/^KIBANA_PASSWORD=.*/KIBANA_PASSWORD=${KIBANA_PASS}/" \
        "${ENV_FILE}"
    
    rm -f "${ENV_FILE}.tmp"
    log_success "Файл .env обновлен с новыми паролями"
    log_warn "Старая версия сохранена как .env.backup.*"
fi

echo
log_success "========== Генерация паролей завершена =========="
log_info "Сгенерированные пароли:"
echo "  PostgreSQL: ${POSTGRES_PASS}"
echo "  Grafana:    ${GRAFANA_PASS}" 
echo "  Elastic:    ${ELASTIC_PASS}"
echo "  Kibana:     ${KIBANA_PASS}"
echo
log_warn "⚠️  ВАЖНО: Сохраните эти пароли в безопасном месте!"
log_warn "⚠️  После смены паролей потребуется пересоздание контейнеров"

# Добавляем в .gitignore
GITIGNORE_FILE="${SCRIPT_DIR}/../../.gitignore"
if [[ -f "${GITIGNORE_FILE}" ]]; then
    if ! grep -q "secrets/" "${GITIGNORE_FILE}"; then
        echo "" >> "${GITIGNORE_FILE}"
        echo "# Security: Docker secrets and passwords" >> "${GITIGNORE_FILE}"
        echo "infra/docker/compose/secrets/" >> "${GITIGNORE_FILE}"
        echo "*.backup.*" >> "${GITIGNORE_FILE}"
        log_info "Добавлено в .gitignore: secrets/ и backup файлы"
    fi
fi