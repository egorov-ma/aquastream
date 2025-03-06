#!/bin/bash
#
# AquaStream - Скрипт оповещений для канареечных деплойментов
# Версия: 1.0.0
#

# Определение директории скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Подключаем библиотеку утилит
source "${SCRIPT_DIR}/utils.sh"

# Устанавливаем перехватчик ошибок
setup_error_trap

# Показать помощь по использованию скрипта
show_help() {
  cat << EOF
Использование: $0 [опции]

Скрипт для настройки и отправки оповещений при мониторинге канареечных деплойментов.

Опции:
  -h, --help                    Показать эту справку
  -c, --configure               Настроить каналы оповещений
  -t, --test                    Отправить тестовое оповещение для проверки настроек
  -s, --slack WEBHOOK_URL       Настроить оповещения в Slack
  -e, --email EMAIL             Настроить оповещения по email
  -m, --metrics THRESHOLD       Порог отклонения метрик для оповещений (%, по умолчанию: 20)
  --errors-threshold COUNT      Порог количества ошибок для оповещений (по умолчанию: 5)
  --latency-threshold MS        Порог задержки для оповещений (мс, по умолчанию: 500)
  -i, --interval MINUTES        Интервал проверки метрик (по умолчанию: 5 минут)
  -v, --verbose                 Подробный вывод

Примеры:
  $0 --configure                Запустить интерактивную настройку оповещений
  $0 --slack https://hooks.slack.com/services/XXX/YYY/ZZZ  Настроить оповещения в Slack
  $0 --test                     Отправить тестовое оповещение
  $0 --metrics 30               Установить порог отклонения метрик в 30%

EOF
}

# Константы
CONFIG_DIR="${SCRIPT_DIR}/../config/canary/alerts"
CONFIG_FILE="${CONFIG_DIR}/alerts_config.json"
PROMETHEUS_URL="http://localhost:9090"
GRAFANA_URL="http://localhost:3000"
DEFAULT_METRICS_THRESHOLD=20
DEFAULT_ERRORS_THRESHOLD=5
DEFAULT_LATENCY_THRESHOLD=500
DEFAULT_CHECK_INTERVAL=5

# Инициализация переменных
CONFIGURE=false
TEST_ALERT=false
SLACK_WEBHOOK=""
EMAIL_RECIPIENTS=""
METRICS_THRESHOLD=$DEFAULT_METRICS_THRESHOLD
ERRORS_THRESHOLD=$DEFAULT_ERRORS_THRESHOLD
LATENCY_THRESHOLD=$DEFAULT_LATENCY_THRESHOLD
CHECK_INTERVAL=$DEFAULT_CHECK_INTERVAL
VERBOSE=false

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -c|--configure)
      CONFIGURE=true
      shift
      ;;
    -t|--test)
      TEST_ALERT=true
      shift
      ;;
    -s|--slack)
      SLACK_WEBHOOK="$2"
      shift 2
      ;;
    -e|--email)
      EMAIL_RECIPIENTS="$2"
      shift 2
      ;;
    -m|--metrics)
      METRICS_THRESHOLD="$2"
      shift 2
      ;;
    --errors-threshold)
      ERRORS_THRESHOLD="$2"
      shift 2
      ;;
    --latency-threshold)
      LATENCY_THRESHOLD="$2"
      shift 2
      ;;
    -i|--interval)
      CHECK_INTERVAL="$2"
      shift 2
      ;;
    -v|--verbose)
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

# Создаем директорию для конфигурации, если её нет
mkdir -p "${CONFIG_DIR}"

# Функция для создания JSON-файла конфигурации
create_config_file() {
  log_info "Создание конфигурационного файла оповещений..."
  
  cat > "${CONFIG_FILE}" << EOF
{
  "notifications": {
    "slack": {
      "enabled": $([ -n "$SLACK_WEBHOOK" ] && echo "true" || echo "false"),
      "webhook_url": "$SLACK_WEBHOOK"
    },
    "email": {
      "enabled": $([ -n "$EMAIL_RECIPIENTS" ] && echo "true" || echo "false"),
      "recipients": "$EMAIL_RECIPIENTS"
    }
  },
  "thresholds": {
    "metrics_deviation_percent": $METRICS_THRESHOLD,
    "error_count": $ERRORS_THRESHOLD,
    "latency_ms": $LATENCY_THRESHOLD
  },
  "check_interval_minutes": $CHECK_INTERVAL,
  "last_updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

  log_info "Конфигурационный файл создан: ${CONFIG_FILE}"
}

# Функция для интерактивной настройки оповещений
configure_alerts() {
  log_info "Запуск интерактивной настройки оповещений..."
  
  echo -e "\n===== Настройка каналов оповещений ====="
  
  # Настройка Slack
  read -p "Настроить оповещения в Slack? (y/n): " setup_slack
  if [[ "$setup_slack" == "y" || "$setup_slack" == "Y" ]]; then
    read -p "Введите Webhook URL для Slack: " SLACK_WEBHOOK
    log_info "Webhook URL для Slack настроен"
  fi
  
  # Настройка Email
  read -p "Настроить оповещения по Email? (y/n): " setup_email
  if [[ "$setup_email" == "y" || "$setup_email" == "Y" ]]; then
    read -p "Введите Email-адреса через запятую: " EMAIL_RECIPIENTS
    log_info "Email-оповещения настроены для: $EMAIL_RECIPIENTS"
  fi
  
  echo -e "\n===== Настройка порогов оповещений ====="
  
  # Настройка порогов
  read -p "Порог отклонения метрик (%, по умолчанию $DEFAULT_METRICS_THRESHOLD): " input_metrics
  METRICS_THRESHOLD=${input_metrics:-$DEFAULT_METRICS_THRESHOLD}
  
  read -p "Порог количества ошибок (по умолчанию $DEFAULT_ERRORS_THRESHOLD): " input_errors
  ERRORS_THRESHOLD=${input_errors:-$DEFAULT_ERRORS_THRESHOLD}
  
  read -p "Порог задержки (мс, по умолчанию $DEFAULT_LATENCY_THRESHOLD): " input_latency
  LATENCY_THRESHOLD=${input_latency:-$DEFAULT_LATENCY_THRESHOLD}
  
  read -p "Интервал проверки (минуты, по умолчанию $DEFAULT_CHECK_INTERVAL): " input_interval
  CHECK_INTERVAL=${input_interval:-$DEFAULT_CHECK_INTERVAL}
  
  # Создание конфигурационного файла
  create_config_file
  
  log_info "Настройка оповещений завершена"
}

# Функция для отправки оповещения в Slack
send_slack_alert() {
  local message="$1"
  local level="$2"
  local color="good"
  
  if [[ "$level" == "warning" ]]; then
    color="warning"
  elif [[ "$level" == "error" ]]; then
    color="danger"
  fi
  
  if [[ -z "$SLACK_WEBHOOK" ]]; then
    if [[ -f "$CONFIG_FILE" ]]; then
      SLACK_WEBHOOK=$(jq -r '.notifications.slack.webhook_url' "$CONFIG_FILE")
    fi
    
    if [[ -z "$SLACK_WEBHOOK" || "$SLACK_WEBHOOK" == "null" ]]; then
      log_warn "Не настроен Webhook URL для Slack"
      return 1
    fi
  fi
  
  log_debug "Отправка оповещения в Slack (уровень: $level)"
  
  local payload=$(cat << EOF
{
  "attachments": [
    {
      "color": "$color",
      "title": "AquaStream - Оповещение о канареечном деплойменте",
      "text": "$message",
      "footer": "AquaStream Canary Monitoring",
      "ts": $(date +%s)
    }
  ]
}
EOF
)

  curl -s -X POST -H "Content-type: application/json" --data "$payload" "$SLACK_WEBHOOK" > /dev/null
  
  if [[ $? -eq 0 ]]; then
    log_info "Оповещение успешно отправлено в Slack"
    return 0
  else
    log_error "Не удалось отправить оповещение в Slack"
    return 1
  fi
}

# Функция для отправки оповещения по Email
send_email_alert() {
  local subject="$1"
  local message="$2"
  local level="$3"
  
  if [[ -z "$EMAIL_RECIPIENTS" ]]; then
    if [[ -f "$CONFIG_FILE" ]]; then
      EMAIL_RECIPIENTS=$(jq -r '.notifications.email.recipients' "$CONFIG_FILE")
    fi
    
    if [[ -z "$EMAIL_RECIPIENTS" || "$EMAIL_RECIPIENTS" == "null" ]]; then
      log_warn "Не настроены получатели Email"
      return 1
    fi
  fi
  
  log_debug "Отправка оповещения по Email (уровень: $level) на: $EMAIL_RECIPIENTS"
  
  # Добавляем префикс к теме в зависимости от уровня
  if [[ "$level" == "warning" ]]; then
    subject="[ПРЕДУПРЕЖДЕНИЕ] $subject"
  elif [[ "$level" == "error" ]]; then
    subject="[ОШИБКА] $subject"
  else
    subject="[ИНФО] $subject"
  fi
  
  echo "$message" | mail -s "$subject" "$EMAIL_RECIPIENTS"
  
  if [[ $? -eq 0 ]]; then
    log_info "Оповещение успешно отправлено по Email"
    return 0
  else
    log_error "Не удалось отправить оповещение по Email"
    return 1
  fi
}

# Функция для отправки тестового оповещения
send_test_alert() {
  log_info "Отправка тестового оповещения..."
  
  local test_message="Это тестовое оповещение от системы мониторинга канареечных деплойментов AquaStream. Дата и время: $(date)"
  
  # Загружаем конфигурацию, если существует
  if [[ -f "$CONFIG_FILE" ]]; then
    SLACK_WEBHOOK=$(jq -r '.notifications.slack.webhook_url' "$CONFIG_FILE")
    EMAIL_RECIPIENTS=$(jq -r '.notifications.email.recipients' "$CONFIG_FILE")
    
    local slack_enabled=$(jq -r '.notifications.slack.enabled' "$CONFIG_FILE")
    local email_enabled=$(jq -r '.notifications.email.enabled' "$CONFIG_FILE")
    
    if [[ "$slack_enabled" == "true" && -n "$SLACK_WEBHOOK" && "$SLACK_WEBHOOK" != "null" ]]; then
      send_slack_alert "$test_message" "info"
    fi
    
    if [[ "$email_enabled" == "true" && -n "$EMAIL_RECIPIENTS" && "$EMAIL_RECIPIENTS" != "null" ]]; then
      send_email_alert "Тестовое оповещение" "$test_message" "info"
    fi
    
    log_info "Тестовые оповещения отправлены"
  else
    log_error "Конфигурационный файл не найден: ${CONFIG_FILE}"
    log_error "Сначала выполните настройку с помощью: $0 --configure"
    return 1
  fi
}

# Функция для проверки метрик в Prometheus
check_prometheus_metrics() {
  log_info "Проверка метрик Prometheus для канареечного деплоймента..."
  
  # Загружаем пороги из конфигурации
  if [[ -f "$CONFIG_FILE" ]]; then
    METRICS_THRESHOLD=$(jq -r '.thresholds.metrics_deviation_percent' "$CONFIG_FILE")
    ERRORS_THRESHOLD=$(jq -r '.thresholds.error_count' "$CONFIG_FILE")
    LATENCY_THRESHOLD=$(jq -r '.thresholds.latency_ms' "$CONFIG_FILE")
  fi
  
  # Проверяем метрики и отправляем оповещения при необходимости
  
  # 1. Проверка задержки (latency)
  local stable_latency=$(curl -s "$PROMETHEUS_URL/api/v1/query" --data-urlencode 'query=sum(rate(http_server_requests_seconds_sum{service="api-gateway"}[5m]))/sum(rate(http_server_requests_seconds_count{service="api-gateway"}[5m]))' | jq -r '.data.result[0].value[1]')
  local canary_latency=$(curl -s "$PROMETHEUS_URL/api/v1/query" --data-urlencode 'query=sum(rate(http_server_requests_seconds_sum{service="api-gateway-canary"}[5m]))/sum(rate(http_server_requests_seconds_count{service="api-gateway-canary"}[5m]))' | jq -r '.data.result[0].value[1]')
  
  if [[ "$stable_latency" != "null" && "$canary_latency" != "null" ]]; then
    stable_latency=$(echo "$stable_latency * 1000" | bc)  # Convert to ms
    canary_latency=$(echo "$canary_latency * 1000" | bc)  # Convert to ms
    
    if (( $(echo "$canary_latency > $LATENCY_THRESHOLD" | bc -l) )); then
      local latency_message="Задержка канареечной версии ($canary_latency мс) превышает пороговое значение ($LATENCY_THRESHOLD мс)"
      send_slack_alert "$latency_message" "warning"
      send_email_alert "Высокая задержка в канареечной версии" "$latency_message" "warning"
    fi
    
    # Проверяем отклонение от стабильной версии
    local latency_diff_percent=$(echo "scale=2; ($canary_latency - $stable_latency) / $stable_latency * 100" | bc)
    if (( $(echo "$latency_diff_percent > $METRICS_THRESHOLD" | bc -l) )); then
      local diff_message="Задержка канареечной версии ($canary_latency мс) на $latency_diff_percent% выше, чем у стабильной версии ($stable_latency мс)"
      send_slack_alert "$diff_message" "warning"
      send_email_alert "Отклонение производительности канареечной версии" "$diff_message" "warning"
    fi
  fi
  
  # 2. Проверка количества ошибок
  local canary_errors=$(curl -s "$PROMETHEUS_URL/api/v1/query" --data-urlencode 'query=sum(rate(http_server_requests_seconds_count{status=~"5..",service="api-gateway-canary"}[5m]))' | jq -r '.data.result[0].value[1]')
  
  if [[ "$canary_errors" != "null" ]]; then
    if (( $(echo "$canary_errors > $ERRORS_THRESHOLD" | bc -l) )); then
      local errors_message="Количество ошибок в канареечной версии ($canary_errors) превышает пороговое значение ($ERRORS_THRESHOLD)"
      send_slack_alert "$errors_message" "error"
      send_email_alert "Критические ошибки в канареечной версии" "$errors_message" "error"
    fi
  fi
  
  log_info "Проверка метрик завершена"
}

# Функция для запуска периодической проверки метрик
start_metrics_checker() {
  log_info "Запуск периодической проверки метрик..."
  
  if [[ -f "$CONFIG_FILE" ]]; then
    CHECK_INTERVAL=$(jq -r '.check_interval_minutes' "$CONFIG_FILE")
  fi
  
  # Запускаем проверку метрик каждые CHECK_INTERVAL минут
  while true; do
    check_prometheus_metrics
    log_debug "Ожидание $CHECK_INTERVAL минут до следующей проверки..."
    sleep $(( CHECK_INTERVAL * 60 ))
  done
}

# Главная функция
main() {
  log_info "Запуск системы оповещений канареечных деплойментов..."
  
  # Проверяем зависимости
  check_dependency "curl" "Curl необходим для отправки HTTP-запросов"
  check_dependency "jq" "jq необходим для обработки JSON-данных"
  
  # Выполняем соответствующее действие на основе аргументов
  if [[ "$CONFIGURE" == "true" ]]; then
    configure_alerts
  elif [[ "$TEST_ALERT" == "true" ]]; then
    send_test_alert
  elif [[ -n "$SLACK_WEBHOOK" || -n "$EMAIL_RECIPIENTS" ]]; then
    create_config_file
    log_info "Настройки оповещений обновлены"
  else
    # Если нет специфичных аргументов, запускаем проверку метрик
    if [[ -f "$CONFIG_FILE" ]]; then
      start_metrics_checker
    else
      log_error "Конфигурационный файл не найден: ${CONFIG_FILE}"
      log_error "Сначала выполните настройку с помощью: $0 --configure"
      exit 1
    fi
  fi
  
  log_info "Операция успешно завершена"
  return 0
}

# Запуск главной функции
main
exit $? 