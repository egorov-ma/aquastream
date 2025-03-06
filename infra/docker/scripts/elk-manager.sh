#!/bin/bash
#
# AquaStream - Скрипт для управления ELK-стеком (Elasticsearch, Logstash, Kibana)
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

Скрипт для управления ELK-стеком (Elasticsearch, Logstash, Kibana) в проекте AquaStream.

Опции:
  -h, --help                    Показать эту справку
  -s, --status                  Проверить статус компонентов ELK-стека
  -r, --restart [КОМПОНЕНТ]     Перезапустить компонент(ы) ELK-стека
  -l, --logs [КОМПОНЕНТ]        Показать логи компонента
  -i, --indices                 Показать список индексов Elasticsearch
  -c, --clean [ДНЕЙ]            Очистить индексы старше указанного числа дней (по умолчанию: 30)
  -e, --export [ИНДЕКС]         Экспортировать данные индекса в JSON
  -d, --dashboard               Открыть Kibana дашборд
  -t, --test-connection         Проверить подключения микросервисов к Logstash
  --force                       Принудительное выполнение операций
  -v, --verbose                 Подробный вывод

Компоненты:
  elasticsearch                 Управление Elasticsearch
  logstash                      Управление Logstash
  kibana                        Управление Kibana
  all                           Все компоненты (по умолчанию)

Примеры:
  $0 --status                  Проверить статус всех компонентов ELK-стека
  $0 --restart logstash        Перезапустить только Logstash
  $0 --logs elasticsearch      Показать логи Elasticsearch
  $0 --clean 15                Очистить индексы старше 15 дней
  $0 --indices                 Показать список индексов Elasticsearch
  $0 --test-connection         Проверить подключения всех микросервисов к Logstash

EOF
}

# Константы
ELASTICSEARCH_PORT="9200"
LOGSTASH_PORT="5000"
KIBANA_PORT="5601"
ELASTICSEARCH_HOST="localhost"
KIBANA_HOST="localhost"
DOCKER_COMPOSE_FILE="${SCRIPT_DIR}/../compose/docker-compose.yml"
EXPORT_DIR="${SCRIPT_DIR}/../logs/elasticsearch/exports"
CLEANUP_DAYS=30

# Инициализация переменных
STATUS=false
RESTART=false
COMPONENT="all"
SHOW_LOGS=false
SHOW_INDICES=false
CLEAN_INDICES=false
EXPORT_INDEX=""
OPEN_DASHBOARD=false
TEST_CONNECTION=false
FORCE=false
VERBOSE=false

# Проверка и установка значений из окружения, если они определены
ELASTICSEARCH_HOST="${ELASTICSEARCH_HOST:-localhost}"
ELASTICSEARCH_PORT="${ELASTICSEARCH_PORT:-9200}"
LOGSTASH_PORT="${LOGSTASH_PORT:-5000}"
KIBANA_HOST="${KIBANA_HOST:-localhost}"
KIBANA_PORT="${KIBANA_PORT:-5601}"

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -s|--status)
      STATUS=true
      shift
      ;;
    -r|--restart)
      RESTART=true
      if [[ $# -gt 1 && ! $2 =~ ^- ]]; then
        COMPONENT="$2"
        shift
      fi
      shift
      ;;
    -l|--logs)
      SHOW_LOGS=true
      if [[ $# -gt 1 && ! $2 =~ ^- ]]; then
        COMPONENT="$2"
        shift
      fi
      shift
      ;;
    -i|--indices)
      SHOW_INDICES=true
      shift
      ;;
    -c|--clean)
      CLEAN_INDICES=true
      if [[ $# -gt 1 && ! $2 =~ ^- ]]; then
        CLEANUP_DAYS="$2"
        shift
      fi
      shift
      ;;
    -e|--export)
      if [[ $# -gt 1 && ! $2 =~ ^- ]]; then
        EXPORT_INDEX="$2"
        shift
      else
        log_error "Необходимо указать имя индекса для экспорта"
        exit 1
      fi
      shift
      ;;
    -d|--dashboard)
      OPEN_DASHBOARD=true
      shift
      ;;
    -t|--test-connection)
      TEST_CONNECTION=true
      shift
      ;;
    --force)
      FORCE=true
      shift
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

# Проверка существования docker-compose файла
if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
  log_error "Файл Docker Compose не найден по пути: $DOCKER_COMPOSE_FILE"
  exit 1
fi

# Проверка наличия компонента в docker-compose
check_component_exists() {
  local component="$1"
  case "$component" in
    "elasticsearch"|"aquastream-elasticsearch")
      grep -q "elasticsearch:" "$DOCKER_COMPOSE_FILE" || grep -q "aquastream-elasticsearch:" "$DOCKER_COMPOSE_FILE"
      ;;
    "logstash"|"aquastream-logstash")
      grep -q "logstash:" "$DOCKER_COMPOSE_FILE" || grep -q "aquastream-logstash:" "$DOCKER_COMPOSE_FILE"
      ;;
    "kibana"|"aquastream-kibana")
      grep -q "kibana:" "$DOCKER_COMPOSE_FILE" || grep -q "aquastream-kibana:" "$DOCKER_COMPOSE_FILE"
      ;;
    "all")
      return 0
      ;;
    *)
      log_error "Неизвестный компонент: $component"
      return 1
      ;;
  esac
}

# Получение статуса компонентов ELK-стека
get_elk_status() {
  local component="$1"
  
  log_info "Проверка статуса ELK-стека..."
  
  case "$component" in
    "elasticsearch"|"aquastream-elasticsearch")
      get_elasticsearch_status
      ;;
    "logstash"|"aquastream-logstash")
      get_logstash_status
      ;;
    "kibana"|"aquastream-kibana")
      get_kibana_status
      ;;
    "all")
      get_elasticsearch_status
      get_logstash_status
      get_kibana_status
      ;;
  esac
}

# Проверка статуса Elasticsearch
get_elasticsearch_status() {
  log_info "Проверка статуса Elasticsearch..."
  
  local es_container=$(docker ps -q -f name=aquastream-elasticsearch)
  
  if [[ -z "$es_container" ]]; then
    log_error "Контейнер Elasticsearch не найден или не запущен"
    return 1
  fi
  
  local es_status=$(curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_cluster/health" 2>/dev/null | jq -r '.status')
  
  if [[ "$es_status" == "green" ]]; then
    log_success "Elasticsearch работает нормально (статус: green)"
  elif [[ "$es_status" == "yellow" ]]; then
    log_warn "Elasticsearch работает, но некоторые реплики недоступны (статус: yellow)"
  elif [[ "$es_status" == "red" ]]; then
    log_error "Elasticsearch работает в аварийном режиме (статус: red)"
  else
    log_error "Не удалось получить статус Elasticsearch"
    return 1
  fi
  
  # Получение информации о версии и статистике
  if [[ "$VERBOSE" == "true" ]]; then
    curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}" | jq '.version'
    
    local indices_count=$(curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_cat/indices?h=i" | wc -l)
    local disk_usage=$(curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_cat/allocation?v" | grep -v ^shards)
    
    log_info "Количество индексов: $indices_count"
    log_info "Использование диска:\n$disk_usage"
  fi
  
  return 0
}

# Проверка статуса Logstash
get_logstash_status() {
  log_info "Проверка статуса Logstash..."
  
  local ls_container=$(docker ps -q -f name=aquastream-logstash)
  
  if [[ -z "$ls_container" ]]; then
    log_error "Контейнер Logstash не найден или не запущен"
    return 1
  fi
  
  # Проверяем порт Logstash
  if docker exec $ls_container bash -c "nc -z localhost $LOGSTASH_PORT"; then
    log_success "Logstash работает и слушает порт $LOGSTASH_PORT"
  else
    log_error "Logstash запущен, но не слушает порт $LOGSTASH_PORT"
    return 1
  fi
  
  if [[ "$VERBOSE" == "true" ]]; then
    # Проверяем статистику Logstash
    docker exec $ls_container bash -c "cat /usr/share/logstash/logs/logstash-plain.log | grep -i 'pipeline\|error\|failed' | tail -10"
  fi
  
  return 0
}

# Проверка статуса Kibana
get_kibana_status() {
  log_info "Проверка статуса Kibana..."
  
  local kb_container=$(docker ps -q -f name=aquastream-kibana)
  
  if [[ -z "$kb_container" ]]; then
    log_error "Контейнер Kibana не найден или не запущен"
    return 1
  fi
  
  # Проверяем доступность Kibana
  local status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://${KIBANA_HOST}:${KIBANA_PORT}/app/home")
  
  if [[ "$status_code" == "200" || "$status_code" == "302" ]]; then
    log_success "Kibana работает и доступна по адресу http://${KIBANA_HOST}:${KIBANA_PORT}"
  else
    log_error "Kibana недоступна (код ответа: $status_code)"
    return 1
  fi
  
  return 0
}

# Перезапуск компонентов ELK-стека
restart_elk_component() {
  local component="$1"
  
  log_info "Перезапуск компонентов ELK-стека..."
  
  case "$component" in
    "elasticsearch"|"aquastream-elasticsearch")
      log_info "Перезапуск Elasticsearch..."
      docker-compose -f "$DOCKER_COMPOSE_FILE" restart elasticsearch || docker-compose -f "$DOCKER_COMPOSE_FILE" restart aquastream-elasticsearch
      log_success "Elasticsearch перезапущен"
      ;;
    "logstash"|"aquastream-logstash")
      log_info "Перезапуск Logstash..."
      docker-compose -f "$DOCKER_COMPOSE_FILE" restart logstash || docker-compose -f "$DOCKER_COMPOSE_FILE" restart aquastream-logstash
      log_success "Logstash перезапущен"
      ;;
    "kibana"|"aquastream-kibana")
      log_info "Перезапуск Kibana..."
      docker-compose -f "$DOCKER_COMPOSE_FILE" restart kibana || docker-compose -f "$DOCKER_COMPOSE_FILE" restart aquastream-kibana
      log_success "Kibana перезапущена"
      ;;
    "all")
      log_info "Перезапуск всех компонентов ELK-стека..."
      docker-compose -f "$DOCKER_COMPOSE_FILE" restart elasticsearch logstash kibana || \
      docker-compose -f "$DOCKER_COMPOSE_FILE" restart aquastream-elasticsearch aquastream-logstash aquastream-kibana
      log_success "Все компоненты ELK-стека перезапущены"
      ;;
  esac
  
  # Даем время на запуск
  sleep 10
  
  # Проверяем статус после перезапуска
  get_elk_status "$component"
}

# Показать логи компонентов ELK-стека
show_component_logs() {
  local component="$1"
  
  log_info "Просмотр логов компонентов ELK-стека..."
  
  case "$component" in
    "elasticsearch"|"aquastream-elasticsearch")
      log_info "Логи Elasticsearch:"
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=100 elasticsearch 2>/dev/null || \
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=100 aquastream-elasticsearch
      ;;
    "logstash"|"aquastream-logstash")
      log_info "Логи Logstash:"
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=100 logstash 2>/dev/null || \
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=100 aquastream-logstash
      ;;
    "kibana"|"aquastream-kibana")
      log_info "Логи Kibana:"
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=100 kibana 2>/dev/null || \
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=100 aquastream-kibana
      ;;
    "all")
      log_info "Логи всех компонентов ELK-стека:"
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=100 elasticsearch logstash kibana 2>/dev/null || \
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=100 aquastream-elasticsearch aquastream-logstash aquastream-kibana
      ;;
  esac
}

# Показать список индексов Elasticsearch
show_elasticsearch_indices() {
  log_info "Получение списка индексов Elasticsearch..."
  
  local indices=$(curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_cat/indices?v")
  
  if [[ -z "$indices" ]]; then
    log_error "Не удалось получить список индексов"
    return 1
  fi
  
  echo "$indices"
  
  # Дополнительная информация о размере индексов
  if [[ "$VERBOSE" == "true" ]]; then
    log_info "Статистика по индексам:"
    curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_cat/indices?v&h=index,docs.count,store.size,creation.date.string" | sort -k4
  fi
  
  return 0
}

# Очистить индексы старше указанного числа дней
clean_old_indices() {
  local days="$1"
  
  log_info "Очистка индексов старше $days дней..."
  
  if [[ "$FORCE" != "true" ]]; then
    log_warn "Эта операция удалит старые индексы. Продолжить? (y/n)"
    read -r confirm
    
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
      log_info "Операция отменена пользователем"
      return 0
    fi
  fi
  
  # Вычисляем дату, старше которой нужно удалить индексы
  local cutoff_date=$(date -d "$days days ago" +%Y.%m.%d)
  log_debug "Дата отсечения: $cutoff_date"
  
  # Получаем список индексов для удаления
  local indices_to_delete=$(curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_cat/indices" | \
                          grep -E "logstash-[0-9]{4}\.[0-9]{2}\.[0-9]{2}" | \
                          awk '{gsub("logstash-", "", $3); if ($3 < "'$cutoff_date'") print $3}')
  
  if [[ -z "$indices_to_delete" ]]; then
    log_info "Нет индексов старше $days дней для удаления"
    return 0
  fi
  
  local count=$(echo "$indices_to_delete" | wc -l)
  log_warn "Найдено $count индексов для удаления"
  
  for index_date in $indices_to_delete; do
    local index_name="logstash-$index_date"
    log_info "Удаление индекса $index_name..."
    
    local result=$(curl -s -X DELETE "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/$index_name")
    
    if echo "$result" | grep -q "acknowledged" && echo "$result" | grep -q "true"; then
      log_success "Индекс $index_name успешно удален"
    else
      log_error "Не удалось удалить индекс $index_name: $result"
    fi
  done
  
  log_success "Очистка индексов завершена"
  return 0
}

# Экспортировать данные индекса в JSON
export_index_data() {
  local index="$1"
  
  log_info "Экспорт данных индекса $index..."
  
  # Создаем директорию для экспорта, если она не существует
  mkdir -p "$EXPORT_DIR"
  
  local date=$(date +"%Y%m%d_%H%M%S")
  local export_file="${EXPORT_DIR}/${index}_${date}.json"
  
  # Проверяем существование индекса
  if ! curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/_cat/indices" | grep -q "$index"; then
    log_error "Индекс $index не найден"
    return 1
  fi
  
  log_info "Экспорт данных в файл $export_file..."
  
  # Экспортируем данные
  curl -s "http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/${index}/_search?size=10000" | \
    jq '.hits.hits' > "$export_file"
  
  if [[ $? -eq 0 && -s "$export_file" ]]; then
    log_success "Данные индекса $index успешно экспортированы в файл $export_file"
    log_info "Количество записей: $(jq '. | length' "$export_file")"
  else
    log_error "Не удалось экспортировать данные индекса $index"
    return 1
  fi
  
  return 0
}

# Открыть Kibana дашборд
open_kibana_dashboard() {
  log_info "Открытие Kibana дашборда..."
  
  # Пытаемся открыть Kibana в браузере (в зависимости от платформы)
  if [[ "$(uname)" == "Darwin" ]]; then
    open "http://${KIBANA_HOST}:${KIBANA_PORT}"
  elif [[ "$(uname)" == "Linux" ]]; then
    if command -v xdg-open &>/dev/null; then
      xdg-open "http://${KIBANA_HOST}:${KIBANA_PORT}"
    elif command -v gnome-open &>/dev/null; then
      gnome-open "http://${KIBANA_HOST}:${KIBANA_PORT}"
    else
      log_warn "Не удалось автоматически открыть браузер"
      log_info "Пожалуйста, откройте следующий URL в вашем браузере: http://${KIBANA_HOST}:${KIBANA_PORT}"
    fi
  else
    log_warn "Не удалось автоматически открыть браузер"
    log_info "Пожалуйста, откройте следующий URL в вашем браузере: http://${KIBANA_HOST}:${KIBANA_PORT}"
  fi
  
  return 0
}

# Проверить подключения микросервисов к Logstash
test_logstash_connections() {
  log_info "Проверка подключений микросервисов к Logstash..."
  
  # Получаем список контейнеров микросервисов
  local service_containers=$(docker ps --format '{{.Names}}' | grep -E 'aquastream-' | grep -v -E 'elasticsearch|logstash|kibana')
  
  if [[ -z "$service_containers" ]]; then
    log_warn "Не найдено запущенных контейнеров микросервисов"
    return 1
  fi
  
  for container in $service_containers; do
    log_info "Проверка подключения $container к Logstash..."
    
    # Проверяем наличие соединений к порту Logstash
    local connections=$(docker exec $container netstat -an 2>/dev/null | grep -c "$LOGSTASH_PORT")
    
    if [[ $? -eq 0 && "$connections" -gt 0 ]]; then
      log_success "$container имеет $connections активных соединений с Logstash"
    else
      log_warn "$container не имеет активных соединений с Logstash"
      
      # Проверяем конфигурацию логирования в контейнере
      if docker exec $container bash -c "grep -r logstash /app --include='*.xml' 2>/dev/null"; then
        log_info "Найдена конфигурация Logstash в $container"
      else
        log_error "Не найдена конфигурация Logstash в $container"
      fi
    fi
  done
  
  return 0
}

# Главная функция
main() {
  log_info "Запуск инструмента управления ELK-стеком..."
  
  # Проверяем наличие зависимостей
  check_dependency "docker" "Docker необходим для работы с контейнерами ELK-стека"
  check_dependency "curl" "Curl необходим для взаимодействия с API Elasticsearch"
  check_dependency "jq" "jq необходим для обработки JSON-ответов"
  
  # Проверяем выбранный компонент
  if ! check_component_exists "$COMPONENT"; then
    log_error "Компонент '$COMPONENT' не найден в docker-compose файле"
    exit 1
  fi
  
  # Выполняем запрошенные операции
  if [[ "$STATUS" == "true" ]]; then
    get_elk_status "$COMPONENT"
  fi
  
  if [[ "$RESTART" == "true" ]]; then
    restart_elk_component "$COMPONENT"
  fi
  
  if [[ "$SHOW_LOGS" == "true" ]]; then
    show_component_logs "$COMPONENT"
  fi
  
  if [[ "$SHOW_INDICES" == "true" ]]; then
    show_elasticsearch_indices
  fi
  
  if [[ "$CLEAN_INDICES" == "true" ]]; then
    clean_old_indices "$CLEANUP_DAYS"
  fi
  
  if [[ -n "$EXPORT_INDEX" ]]; then
    export_index_data "$EXPORT_INDEX"
  fi
  
  if [[ "$OPEN_DASHBOARD" == "true" ]]; then
    open_kibana_dashboard
  fi
  
  if [[ "$TEST_CONNECTION" == "true" ]]; then
    test_logstash_connections
  fi
  
  # Если не задана ни одна операция, показываем справку
  if [[ "$STATUS" != "true" && "$RESTART" != "true" && "$SHOW_LOGS" != "true" && 
        "$SHOW_INDICES" != "true" && "$CLEAN_INDICES" != "true" && -z "$EXPORT_INDEX" && 
        "$OPEN_DASHBOARD" != "true" && "$TEST_CONNECTION" != "true" ]]; then
    show_help
  fi
  
  log_success "Операции с ELK-стеком завершены"
  return 0
}

# Запуск главной функции
main
exit $? 