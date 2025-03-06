#!/bin/bash
#
# AquaStream - Общая библиотека утилит для скриптов
# Версия: 1.0.0
#

# Если скрипт был запущен напрямую, выводим предупреждение
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "Этот скрипт предназначен для подключения в другие скрипты, а не для прямого запуска."
  echo "Пример использования: source $(basename "${BASH_SOURCE[0]}")"
  exit 1
fi

# Переменные цветов для ANSI-совместимых терминалов
readonly COLOR_RESET='\033[0m'
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[0;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_MAGENTA='\033[0;35m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_WHITE='\033[0;37m'
readonly COLOR_BOLD='\033[1m'

# Имя проекта и префикс для контейнеров
readonly PROJECT_NAME="aquastream"
readonly CONTAINER_PREFIX="${PROJECT_NAME}"

# Пути к конфигурационным файлам
readonly DOCKER_COMPOSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../compose" && pwd)"
readonly DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_DIR}/docker-compose.yml"
readonly DOCKER_COMPOSE_OVERRIDE="${DOCKER_COMPOSE_DIR}/docker-compose.override.yml"
readonly DOCKER_COMPOSE_CANARY="${DOCKER_COMPOSE_DIR}/docker-compose.canary.yml"

# Директория для логов скриптов
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOGS_DIR="${SCRIPT_DIR}/../logs"
mkdir -p "${LOGS_DIR}" 2>/dev/null || true

# Уровни логирования
readonly LOG_LEVEL_DEBUG=0
readonly LOG_LEVEL_INFO=1
readonly LOG_LEVEL_WARN=2
readonly LOG_LEVEL_ERROR=3

# Текущий уровень логирования (можно изменить через переменную окружения)
LOG_LEVEL="${LOG_LEVEL:-$LOG_LEVEL_INFO}"

# Включение/отключение цветового вывода
COLOR_OUTPUT=true
# Проверяем, подключен ли терминал к stdout
if [[ ! -t 1 ]]; then
  COLOR_OUTPUT=false
fi
# Также можно отключить через переменную окружения
if [[ "${NO_COLOR:-}" == "true" ]]; then
  COLOR_OUTPUT=false
fi

# Функция для вывода текста с заданным цветом
print_colored_text() {
  local color_code="$1"
  local text="$2"
  
  if [[ "${COLOR_OUTPUT}" == "true" ]]; then
    echo -e "${color_code}${text}${COLOR_RESET}"
  else
    echo "${text}"
  fi
}

# Функция для логирования
log_message() {
  local level="$1"
  local message="$2"
  local timestamp
  timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  local log_file="${LOGS_DIR}/script.log"
  
  # Преобразуем текстовый уровень в числовой
  local level_num
  case "${level}" in
    "DEBUG") level_num="${LOG_LEVEL_DEBUG}" ;;
    "INFO") level_num="${LOG_LEVEL_INFO}" ;;
    "WARN") level_num="${LOG_LEVEL_WARN}" ;;
    "ERROR") level_num="${LOG_LEVEL_ERROR}" ;;
    *) level_num="${LOG_LEVEL_INFO}" ;;
  esac
  
  # Выводим сообщение только если его уровень >= текущему уровню логирования
  if [[ "${level_num}" -ge "${LOG_LEVEL}" ]]; then
    case "${level}" in
      "DEBUG")
        print_colored_text "${COLOR_BLUE}" "[DEBUG] ${timestamp} - ${message}"
        ;;
      "INFO")
        print_colored_text "${COLOR_GREEN}" "[INFO] ${timestamp} - ${message}"
        ;;
      "WARN")
        print_colored_text "${COLOR_YELLOW}" "[WARN] ${timestamp} - ${message}"
        ;;
      "ERROR")
        print_colored_text "${COLOR_RED}" "[ERROR] ${timestamp} - ${message}"
        ;;
    esac
  fi
  
  # Всегда записываем в файл лога, независимо от уровня вывода на экран
  echo "[${level}] ${timestamp} - ${message}" >> "${log_file}"
}

# Функции-обертки для разных уровней логирования
log_debug() {
  log_message "DEBUG" "$1"
}

log_info() {
  log_message "INFO" "$1"
}

log_warn() {
  log_message "WARN" "$1"
}

log_error() {
  log_message "ERROR" "$1"
}

# Функция для перехвата ошибок
setup_error_trap() {
  trap 'handle_error ${LINENO}' ERR
}

handle_error() {
  local line="$1"
  log_error "Ошибка в скрипте $(basename "${BASH_SOURCE[1]}") на строке ${line}"
  exit 1
}

# Функция для получения команды docker-compose с нужными флагами
get_docker_compose_cmd() {
  local cmd="docker compose -f ${DOCKER_COMPOSE_FILE}"
  
  if [[ -f "${DOCKER_COMPOSE_OVERRIDE}" ]]; then
    cmd="${cmd} -f ${DOCKER_COMPOSE_OVERRIDE}"
    log_debug "Найден файл docker-compose.override.yml, он будет использован"
  fi
  
  # Если запрошена канареечная среда
  if [[ "${USE_CANARY:-}" == "true" ]] && [[ -f "${DOCKER_COMPOSE_CANARY}" ]]; then
    cmd="${cmd} -f ${DOCKER_COMPOSE_CANARY}"
    log_debug "Включена канареечная среда, используется docker-compose.canary.yml"
  fi
  
  echo "${cmd}"
}

# Функция для проверки состояния сервиса
check_service_health() {
  local service="$1"
  local max_attempts="${2:-30}"
  local delay="${3:-2}"
  local attempt=0
  
  log_info "Проверка готовности сервиса ${service}..."
  
  while [[ "${attempt}" -lt "${max_attempts}" ]]; do
    if $(get_docker_compose_cmd) ps --services --filter "status=running" | grep -q "^${service}$"; then
      log_info "Сервис ${service} запущен и работает"
      return 0
    fi
    
    attempt=$((attempt + 1))
    log_debug "Ожидание сервиса ${service}, попытка ${attempt}/${max_attempts}"
    sleep "${delay}"
  done
  
  log_error "Сервис ${service} не запустился после ${max_attempts} попыток"
  return 1
}

# Функция для проверки HTTP-эндпоинта
check_http_endpoint() {
  local url="$1"
  local expected_status="${2:-200}"
  local max_attempts="${3:-30}"
  local delay="${4:-2}"
  local attempt=0
  
  log_info "Проверка доступности HTTP-эндпоинта ${url}..."
  
  while [[ "${attempt}" -lt "${max_attempts}" ]]; do
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" "${url}" 2>/dev/null || echo "000")
    
    if [[ "${status}" == "${expected_status}" ]]; then
      log_info "Эндпоинт ${url} доступен, статус: ${status}"
      return 0
    fi
    
    attempt=$((attempt + 1))
    if [[ "${status}" != "000" ]]; then
      log_debug "Эндпоинт ${url} вернул статус ${status}, ожидается ${expected_status}, попытка ${attempt}/${max_attempts}"
    else
      log_debug "Эндпоинт ${url} недоступен, попытка ${attempt}/${max_attempts}"
    fi
    
    sleep "${delay}"
  done
  
  log_error "Эндпоинт ${url} не стал доступен после ${max_attempts} попыток"
  return 1
}

# Функция для работы с сервисами
get_service_info() {
  local service="$1"
  
  # Маппинг сервисов на контейнеры
  declare -A service_to_container=(
    ["frontend"]="frontend"
    ["api-gateway"]="api"
    ["crew"]="crew"
    ["notification"]="notification"
    ["planning"]="planning"
    ["user"]="user"
    ["postgres"]="postgres"
    ["zookeeper"]="zookeeper"
    ["kafka"]="kafka"
    ["prometheus"]="prometheus"
    ["grafana"]="grafana"
  )
  
  # Маппинг сервисов на HTTP-эндпоинты для проверки работоспособности
  declare -A service_to_health_endpoint=(
    ["frontend"]="http://localhost:3000"
    ["api-gateway"]="http://localhost:8080/actuator/health"
    ["crew"]="http://localhost:8083/api/crew/health"
    ["notification"]="http://localhost:8084/api/notification/health"
    ["planning"]="http://localhost:8082/api/planning/health"
    ["user"]="http://localhost:8081/api/user/health"
    ["prometheus"]="http://localhost:9091"
    ["grafana"]="http://localhost:3001"
  )
  
  # Получаем имя контейнера для сервиса
  local container="${service_to_container[${service}]}"
  if [[ -z "${container}" ]]; then
    container="${service}"
  fi
  
  # Получаем эндпоинт для проверки здоровья
  local health_endpoint="${service_to_health_endpoint[${service}]}"
  
  # Формируем полное имя контейнера
  local full_container_name="${CONTAINER_PREFIX}-${container}"
  
  # Возвращаем результат в виде строки, разделенной точкой с запятой
  echo "${full_container_name};${health_endpoint}"
}

# Функция для проверки зависимостей
check_dependencies() {
  log_debug "Проверка наличия необходимых зависимостей..."
  
  local missing_deps=()
  
  # Проверяем необходимые утилиты
  for cmd in docker curl jq grep awk sed; do
    if ! command -v "${cmd}" &>/dev/null; then
      missing_deps+=("${cmd}")
    fi
  done
  
  # Если есть отсутствующие зависимости, выводим сообщение
  if [[ "${#missing_deps[@]}" -gt 0 ]]; then
    log_error "Отсутствуют необходимые зависимости: ${missing_deps[*]}"
    return 1
  fi
  
  # Проверяем, запущен ли Docker
  if ! docker info &>/dev/null; then
    log_error "Docker не запущен или нет доступа к Docker daemon"
    return 1
  fi
  
  log_debug "Все необходимые зависимости установлены"
  return 0
}

# Функция для обеспечения безопасного ввода команд
sanitize_input() {
  local input="$1"
  # Экранируем спецсимволы
  echo "${input}" | sed 's/[;&|"'"'"'`$(){}]//g'
}

# Функция для создания резервной копии файла
backup_file() {
  local file="$1"
  local backup_dir="${SCRIPT_DIR}/../backups"
  mkdir -p "${backup_dir}" 2>/dev/null || true
  
  local timestamp
  timestamp=$(date +"%Y%m%d_%H%M%S")
  local backup_file="${backup_dir}/$(basename "${file}")_${timestamp}.bak"
  
  if [[ -f "${file}" ]]; then
    cp "${file}" "${backup_file}" 2>/dev/null
    log_debug "Создана резервная копия файла ${file} в ${backup_file}"
    return 0
  else
    log_warn "Не удалось создать резервную копию файла ${file}: файл не существует"
    return 1
  fi
}

# Экспортируем API версии скрипта
UTILS_API_VERSION="1.0.0"

log_debug "Библиотека утилит AquaStream загружена, версия ${UTILS_API_VERSION}" 