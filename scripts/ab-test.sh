#!/bin/bash
#
# AquaStream - Скрипт для проведения A/B тестирования
# Версия: 1.0.0
#

# Подключаем библиотеку утилит
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "/Users/egorovma/IdeaProjects/aquastream/scripts/utils.sh"

# Устанавливаем перехватчик ошибок
setup_error_trap

# Определение констант
readonly DEFAULT_REQUESTS=1000
readonly DEFAULT_CONCURRENCY=10
readonly DEFAULT_ENDPOINTS=(
  "/api/health"
  "/api/users/me"
  "/api/catalog/featured"
)
readonly RESULT_DIR="${SCRIPT_DIR}/../reports/ab-test"

# Функция для вывода подсказки
show_help() {
  cat << EOF
Использование: $0 [опции]

Описание:
  Скрипт для проведения A/B тестирования между стабильной и канареечной версиями API.
  Позволяет сравнить производительность и стабильность двух версий.

Опции:
  -h, --help                      Показать эту подсказку
  -n, --requests NUM              Количество запросов (по умолчанию: $DEFAULT_REQUESTS)
  -c, --concurrency NUM          Количество одновременных соединений (по умолчанию: $DEFAULT_CONCURRENCY)
  -e, --endpoint URL              Тестируемый эндпоинт (может быть указан несколько раз)
  -H, --header "Header: Value"    HTTP-заголовок для запросов (может быть указан несколько раз)
  -o, --output DIR                Директория для сохранения результатов (по умолчанию: $RESULT_DIR)
  -s, --stable-host HOST:PORT     Хост стабильной версии (по умолчанию: localhost:8080)
  -k, --canary-host HOST:PORT     Хост канареечной версии (по умолчанию: localhost:8081)
  -g, --gnuplot                   Создать графики с помощью gnuplot
  -v, --verbose                   Подробный вывод
  --csv                           Сохранить результаты в CSV формате
  --json                          Сохранить результаты в JSON формате
  --html                          Сохранить отчет в HTML формате

Примеры:
  $0 -n 500 -c 20                 Запустить тест с 500 запросами и 20 одновременными соединениями
  $0 -e "/api/users" -e "/api/products"   Тестировать указанные эндпоинты
  $0 -s api.example.com:8080 -k canary.example.com:8080   Указать хосты для стабильной и канареечной версий

EOF
}

# Проверка зависимостей
check_dependencies() {
  local missing=false

  if ! command -v ab &>/dev/null; then
    log_error "Не найден Apache Benchmark (ab). Установите: apt-get install apache2-utils"
    missing=true
  fi

  if [[ "$GNUPLOT" == "true" ]] && ! command -v gnuplot &>/dev/null; then
    log_error "Не найден gnuplot. Установите: apt-get install gnuplot"
    missing=true
  fi

  if [[ "$missing" == "true" ]]; then
    exit 1
  fi
}

# Создание директории для отчетов
create_result_dir() {
  if [[ ! -d "$RESULT_DIR" ]]; then
    log_info "Создание директории для отчетов: $RESULT_DIR"
    mkdir -p "$RESULT_DIR" || {
      log_error "Не удалось создать директорию для отчетов: $RESULT_DIR"
      exit 1
    }
  fi
}

# Запуск тестирования одного эндпоинта
run_endpoint_test() {
  local endpoint="$1"
  local safe_endpoint
  safe_endpoint=$(echo "$endpoint" | sed 's/\//_/g' | sed 's/^_//')
  local timestamp
  timestamp=$(date +"%Y%m%d_%H%M%S")
  
  log_info "Тестирование эндпоинта: $endpoint"
  
  # Запуск теста для стабильной версии
  log_info "Тестирование стабильной версии ($STABLE_HOST)..."
  local stable_output="${RESULT_DIR}/${timestamp}_stable_${safe_endpoint}.txt"
  local stable_cmd="ab -n $REQUESTS -c $CONCURRENCY"
  
  # Добавляем заголовки, если они есть
  for header in "${HEADERS[@]}"; do
    stable_cmd+=" -H \"$header\""
  done
  
  # Добавляем форматы вывода
  if [[ "$CSV" == "true" ]]; then
    stable_cmd+=" -e ${stable_output%.txt}.csv"
  fi
  if [[ "$JSON" == "true" ]]; then
    # Apache Benchmark не поддерживает вывод в JSON, поэтому преобразуем результаты позже
    :
  fi
  if [[ "$GNUPLOT" == "true" ]]; then
    stable_cmd+=" -g ${stable_output%.txt}.dat"
  fi
  
  # Добавляем URL
  stable_cmd+=" http://${STABLE_HOST}${endpoint}"
  
  # Выводим команду в режиме отладки
  log_debug "Выполняется команда: $stable_cmd"
  
  # Выполняем тест
  eval "$stable_cmd" > "$stable_output" || {
    log_error "Ошибка при тестировании стабильной версии для эндпоинта $endpoint"
    return 1
  }
  
  # Запуск теста для канареечной версии
  log_info "Тестирование канареечной версии ($CANARY_HOST)..."
  local canary_output="${RESULT_DIR}/${timestamp}_canary_${safe_endpoint}.txt"
  local canary_cmd="ab -n $REQUESTS -c $CONCURRENCY"
  
  # Добавляем заголовки, если они есть
  for header in "${HEADERS[@]}"; do
    canary_cmd+=" -H \"$header\""
  done
  
  # Добавляем форматы вывода
  if [[ "$CSV" == "true" ]]; then
    canary_cmd+=" -e ${canary_output%.txt}.csv"
  fi
  if [[ "$JSON" == "true" ]]; then
    # Apache Benchmark не поддерживает вывод в JSON, поэтому преобразуем результаты позже
    :
  fi
  if [[ "$GNUPLOT" == "true" ]]; then
    canary_cmd+=" -g ${canary_output%.txt}.dat"
  fi
  
  # Добавляем URL
  canary_cmd+=" http://${CANARY_HOST}${endpoint}"
  
  # Выводим команду в режиме отладки
  log_debug "Выполняется команда: $canary_cmd"
  
  # Выполняем тест
  eval "$canary_cmd" > "$canary_output" || {
    log_error "Ошибка при тестировании канареечной версии для эндпоинта $endpoint"
    return 1
  }
  
  # Создаем HTML-отчет, если требуется
  if [[ "$HTML" == "true" ]]; then
    create_html_report "$endpoint" "$stable_output" "$canary_output" "${RESULT_DIR}/${timestamp}_comparison_${safe_endpoint}.html"
  fi
  
  # Создаем графики, если требуется
  if [[ "$GNUPLOT" == "true" ]]; then
    create_graphs "$endpoint" "${stable_output%.txt}.dat" "${canary_output%.txt}.dat" "${RESULT_DIR}/${timestamp}_graph_${safe_endpoint}.png"
  fi
  
  # Создаем JSON-отчет, если требуется
  if [[ "$JSON" == "true" ]]; then
    convert_to_json "$endpoint" "$stable_output" "$canary_output" "${RESULT_DIR}/${timestamp}_comparison_${safe_endpoint}.json"
  fi
  
  # Сравниваем результаты
  compare_results "$endpoint" "$stable_output" "$canary_output"
  
  return 0
}

# Функция для сравнения результатов
compare_results() {
  local endpoint="$1"
  local stable_output="$2"
  local canary_output="$3"
  
  # Извлекаем ключевые метрики из результатов
  local stable_rps
  stable_rps=$(grep "Requests per second" "$stable_output" | awk '{print $4}')
  local canary_rps
  canary_rps=$(grep "Requests per second" "$canary_output" | awk '{print $4}')
  
  local stable_time
  stable_time=$(grep "Time per request" "$stable_output" | head -1 | awk '{print $4}')
  local canary_time
  canary_time=$(grep "Time per request" "$canary_output" | head -1 | awk '{print $4}')
  
  local stable_failed
  stable_failed=$(grep "Failed requests" "$stable_output" | awk '{print $3}')
  local canary_failed
  canary_failed=$(grep "Failed requests" "$canary_output" | awk '{print $3}')
  
  # Если 'Failed requests' не найдено, считаем, что нет ошибок
  stable_failed=${stable_failed:-0}
  canary_failed=${canary_failed:-0}
  
  # Расчет процентного изменения
  local rps_change
  rps_change=$(bc -l <<< "scale=2; (($canary_rps - $stable_rps) / $stable_rps) * 100")
  local time_change
  time_change=$(bc -l <<< "scale=2; (($canary_time - $stable_time) / $stable_time) * 100")
  
  # Вывод результатов сравнения
  log_info "Результаты сравнения для эндпоинта $endpoint:"
  log_info "┌─────────────────────┬────────────┬────────────┬─────────────┐"
  log_info "│ Метрика             │ Стабильная │ Канареечная│ Изменение % │"
  log_info "├─────────────────────┼────────────┼────────────┼─────────────┤"
  log_info "│ Запросов в секунду  │ $stable_rps │ $canary_rps │ $rps_change% │"
  log_info "│ Время на запрос (мс)│ $stable_time │ $canary_time │ $time_change% │"
  log_info "│ Ошибки              │ $stable_failed │ $canary_failed │ - │"
  log_info "└─────────────────────┴────────────┴────────────┴─────────────┘"
  
  # Интерпретация результатов
  if (( $(bc -l <<< "$rps_change > 5") )); then
    log_info "✅ Канареечная версия обрабатывает запросы быстрее на $rps_change%"
  elif (( $(bc -l <<< "$rps_change < -5") )); then
    log_warn "⚠️ Канареечная версия обрабатывает запросы медленнее на $(bc -l <<< "-1 * $rps_change")%"
  else
    log_info "ℹ️ Производительность сопоставима (разница в пределах 5%)"
  fi
  
  if [[ "$canary_failed" -gt "$stable_failed" ]]; then
    log_warn "⚠️ Канареечная версия имеет больше ошибок"
  elif [[ "$canary_failed" -lt "$stable_failed" ]]; then
    log_info "✅ Канареечная версия имеет меньше ошибок"
  else
    log_info "ℹ️ Количество ошибок одинаково"
  fi
}

# Функция для создания HTML-отчета
create_html_report() {
  local endpoint="$1"
  local stable_output="$2"
  local canary_output="$3"
  local html_output="$4"
  
  log_debug "Создание HTML-отчета для эндпоинта $endpoint"
  
  # Извлекаем ключевые метрики из результатов
  local stable_rps
  stable_rps=$(grep "Requests per second" "$stable_output" | awk '{print $4}')
  local canary_rps
  canary_rps=$(grep "Requests per second" "$canary_output" | awk '{print $4}')
  
  local stable_time
  stable_time=$(grep "Time per request" "$stable_output" | head -1 | awk '{print $4}')
  local canary_time
  canary_time=$(grep "Time per request" "$canary_output" | head -1 | awk '{print $4}')
  
  local stable_failed
  stable_failed=$(grep "Failed requests" "$stable_output" | awk '{print $3}')
  local canary_failed
  canary_failed=$(grep "Failed requests" "$canary_output" | awk '{print $3}')
  
  # Если 'Failed requests' не найдено, считаем, что нет ошибок
  stable_failed=${stable_failed:-0}
  canary_failed=${canary_failed:-0}
  
  # Расчет процентного изменения
  local rps_change
  rps_change=$(bc -l <<< "scale=2; (($canary_rps - $stable_rps) / $stable_rps) * 100")
  local time_change
  time_change=$(bc -l <<< "scale=2; (($canary_time - $stable_time) / $stable_time) * 100")
  
  # Создаем HTML-отчет
  cat > "$html_output" << EOF
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Сравнение производительности: $endpoint</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2 {
      color: #2c3e50;
    }
    .container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .comparison {
      flex: 1;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
      margin: 0 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #4CAF50;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    .better {
      color: green;
      font-weight: bold;
    }
    .worse {
      color: red;
      font-weight: bold;
    }
    .neutral {
      color: gray;
    }
    .summary {
      padding: 15px;
      background-color: #e9f7ef;
      border-radius: 5px;
      margin-top: 20px;
    }
    .timestamp {
      font-size: 0.8em;
      color: #666;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <h1>Сравнение производительности A/B тестирования</h1>
  <p>Эндпоинт: <code>$endpoint</code></p>
  
  <div class="container">
    <div class="comparison">
      <h2>Стабильная версия</h2>
      <p>Хост: $STABLE_HOST</p>
      <table>
        <tr><th>Метрика</th><th>Значение</th></tr>
        <tr><td>Запросов в секунду</td><td>$stable_rps</td></tr>
        <tr><td>Время на запрос (мс)</td><td>$stable_time</td></tr>
        <tr><td>Ошибки</td><td>$stable_failed</td></tr>
      </table>
    </div>
    
    <div class="comparison">
      <h2>Канареечная версия</h2>
      <p>Хост: $CANARY_HOST</p>
      <table>
        <tr><th>Метрика</th><th>Значение</th></tr>
        <tr><td>Запросов в секунду</td><td>$canary_rps</td></tr>
        <tr><td>Время на запрос (мс)</td><td>$canary_time</td></tr>
        <tr><td>Ошибки</td><td>$canary_failed</td></tr>
      </table>
    </div>
  </div>
  
  <h2>Сравнение результатов</h2>
  <table>
    <tr><th>Метрика</th><th>Изменение</th><th>Оценка</th></tr>
    <tr>
      <td>Запросов в секунду</td>
      <td>$rps_change%</td>
      <td>
        $(if (( $(bc -l <<< "$rps_change > 5") )); then
            echo '<span class="better">Лучше</span>'
          elif (( $(bc -l <<< "$rps_change < -5") )); then
            echo '<span class="worse">Хуже</span>'
          else
            echo '<span class="neutral">Нейтрально</span>'
          fi)
      </td>
    </tr>
    <tr>
      <td>Время на запрос</td>
      <td>$time_change%</td>
      <td>
        $(if (( $(bc -l <<< "$time_change < -5") )); then
            echo '<span class="better">Лучше</span>'
          elif (( $(bc -l <<< "$time_change > 5") )); then
            echo '<span class="worse">Хуже</span>'
          else
            echo '<span class="neutral">Нейтрально</span>'
          fi)
      </td>
    </tr>
    <tr>
      <td>Ошибки</td>
      <td>$(if [[ "$stable_failed" -eq 0 && "$canary_failed" -eq 0 ]]; then
            echo "0%"
          elif [[ "$stable_failed" -eq 0 ]]; then
            echo "∞%"
          else
            bc -l <<< "scale=2; (($canary_failed - $stable_failed) / $stable_failed) * 100"
          fi)%</td>
      <td>
        $(if [[ "$canary_failed" -lt "$stable_failed" ]]; then
            echo '<span class="better">Лучше</span>'
          elif [[ "$canary_failed" -gt "$stable_failed" ]]; then
            echo '<span class="worse">Хуже</span>'
          else
            echo '<span class="neutral">Нейтрально</span>'
          fi)
      </td>
    </tr>
  </table>
  
  <div class="summary">
    <h2>Резюме</h2>
    <p>
      $(if (( $(bc -l <<< "$rps_change > 5") )) && [[ "$canary_failed" -le "$stable_failed" ]]; then
          echo 'Канареечная версия показывает лучшую производительность и стабильность. Рекомендуется продвижение в стабильную версию.'
        elif (( $(bc -l <<< "$rps_change < -5") )) || [[ "$canary_failed" -gt "$stable_failed" ]]; then
          echo 'Канареечная версия показывает худшую производительность или стабильность. Рекомендуется доработка перед продвижением.'
        else
          echo 'Канареечная версия показывает сопоставимую производительность. Можно рассмотреть продвижение в стабильную версию, если другие метрики также удовлетворительны.'
        fi)
    </p>
  </div>
  
  <div class="timestamp">
    Отчет создан: $(date '+%Y-%m-%d %H:%M:%S')
  </div>
</body>
</html>
EOF
  
  log_info "HTML-отчет создан: $html_output"
}

# Функция для создания графиков
create_graphs() {
  local endpoint="$1"
  local stable_dat="$2"
  local canary_dat="$3"
  local output_graph="$4"
  
  log_debug "Создание графиков для эндпоинта $endpoint"
  
  # Создаем временный файл для скрипта gnuplot
  local gnuplot_script="${RESULT_DIR}/gnuplot_script.plt"
  
  cat > "$gnuplot_script" << EOF
set terminal png size 1200,800 enhanced font "Arial,12"
set output "$output_graph"
set title "Сравнение времени отклика: $endpoint" font "Arial,16"
set grid
set xlabel "Percentile"
set ylabel "Response time (ms)"
set key outside right top
set datafile separator ","
plot "$stable_dat" using 2 title "Стабильная версия" with lines lw 2 lt 1, \
     "$canary_dat" using 2 title "Канареечная версия" with lines lw 2 lt 2
EOF
  
  # Запускаем gnuplot для создания графика
  gnuplot "$gnuplot_script" || {
    log_error "Ошибка при создании графика для эндпоинта $endpoint"
    return 1
  }
  
  # Удаляем временный файл скрипта
  rm -f "$gnuplot_script"
  
  log_info "График создан: $output_graph"
}

# Функция для преобразования результатов в JSON
convert_to_json() {
  local endpoint="$1"
  local stable_output="$2"
  local canary_output="$3"
  local json_output="$4"
  
  log_debug "Создание JSON-отчета для эндпоинта $endpoint"
  
  # Извлекаем ключевые метрики из результатов
  local stable_rps
  stable_rps=$(grep "Requests per second" "$stable_output" | awk '{print $4}')
  local canary_rps
  canary_rps=$(grep "Requests per second" "$canary_output" | awk '{print $4}')
  
  local stable_time
  stable_time=$(grep "Time per request" "$stable_output" | head -1 | awk '{print $4}')
  local canary_time
  canary_time=$(grep "Time per request" "$canary_output" | head -1 | awk '{print $4}')
  
  local stable_failed
  stable_failed=$(grep "Failed requests" "$stable_output" | awk '{print $3}')
  local canary_failed
  canary_failed=$(grep "Failed requests" "$canary_output" | awk '{print $3}')
  
  # Если 'Failed requests' не найдено, считаем, что нет ошибок
  stable_failed=${stable_failed:-0}
  canary_failed=${canary_failed:-0}
  
  # Расчет процентного изменения
  local rps_change
  rps_change=$(bc -l <<< "scale=2; (($canary_rps - $stable_rps) / $stable_rps) * 100")
  local time_change
  time_change=$(bc -l <<< "scale=2; (($canary_time - $stable_time) / $stable_time) * 100")
  
  # Формируем JSON
  cat > "$json_output" << EOF
{
  "test_info": {
    "endpoint": "$endpoint",
    "stable_host": "$STABLE_HOST",
    "canary_host": "$CANARY_HOST",
    "requests": $REQUESTS,
    "concurrency": $CONCURRENCY,
    "timestamp": "$(date '+%Y-%m-%d %H:%M:%S')"
  },
  "stable": {
    "requests_per_second": $stable_rps,
    "time_per_request_ms": $stable_time,
    "failed_requests": $stable_failed
  },
  "canary": {
    "requests_per_second": $canary_rps,
    "time_per_request_ms": $canary_time,
    "failed_requests": $canary_failed
  },
  "comparison": {
    "rps_change_percent": $rps_change,
    "time_change_percent": $time_change,
    "recommendation": "$(if (( $(bc -l <<< "$rps_change > 5") )) && [[ "$canary_failed" -le "$stable_failed" ]]; then
          echo 'promote'
        elif (( $(bc -l <<< "$rps_change < -5") )) || [[ "$canary_failed" -gt "$stable_failed" ]]; then
          echo 'rollback'
        else
          echo 'neutral'
        fi)"
  }
}
EOF
  
  log_info "JSON-отчет создан: $json_output"
}

# Инициализация переменных
REQUESTS=$DEFAULT_REQUESTS
CONCURRENCY=$DEFAULT_CONCURRENCY
ENDPOINTS=()
HEADERS=()
RESULT_DIR="${SCRIPT_DIR}/../reports/ab-test"
STABLE_HOST="localhost:8080"
CANARY_HOST="localhost:8081"
GNUPLOT=false
CSV=false
JSON=false
HTML=false
export VERBOSE=false

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -n|--requests)
      REQUESTS="$2"
      shift 2
      ;;
    -c|--concurrency)
      CONCURRENCY="$2"
      shift 2
      ;;
    -e|--endpoint)
      ENDPOINTS+=("$2")
      shift 2
      ;;
    -H|--header)
      HEADERS+=("$2")
      shift 2
      ;;
    -o|--output)
      RESULT_DIR="$2"
      shift 2
      ;;
    -s|--stable-host)
      STABLE_HOST="$2"
      shift 2
      ;;
    -k|--canary-host)
      CANARY_HOST="$2"
      shift 2
      ;;
    -g|--gnuplot)
      GNUPLOT=true
      shift
      ;;
    -v|--verbose)
      export VERBOSE=true
      export LOG_LEVEL=$LOG_LEVEL_DEBUG
      shift
      ;;
    --csv)
      CSV=true
      shift
      ;;
    --json)
      JSON=true
      shift
      ;;
    --html)
      HTML=true
      shift
      ;;
    *)
      log_error "Неизвестная опция: $1"
      show_help
      exit 1
      ;;
  esac
done

# Основная логика
main() {
  log_info "Запуск A/B тестирования..."
  
  # Проверяем зависимости
  check_dependencies
  
  # Создаем директорию для отчетов
  create_result_dir
  
  # Если эндпоинты не указаны, используем значения по умолчанию
  if [[ ${#ENDPOINTS[@]} -eq 0 ]]; then
    ENDPOINTS=("${DEFAULT_ENDPOINTS[@]}")
  fi
  
  # Отображаем информацию о тестировании
  log_info "Параметры тестирования:"
  log_info "- Количество запросов: $REQUESTS"
  log_info "- Одновременных соединений: $CONCURRENCY"
  log_info "- Хост стабильной версии: $STABLE_HOST"
  log_info "- Хост канареечной версии: $CANARY_HOST"
  log_info "- Тестируемые эндпоинты: ${ENDPOINTS[*]}"
  log_info "- Директория отчетов: $RESULT_DIR"
  
  # Проверяем доступность хостов
  log_info "Проверка доступности хостов..."
  if ! check_http_endpoint "http://${STABLE_HOST}/api/health" 5; then
    log_error "Хост стабильной версии $STABLE_HOST недоступен"
    exit 1
  fi
  
  if ! check_http_endpoint "http://${CANARY_HOST}/api/health" 5; then
    log_error "Хост канареечной версии $CANARY_HOST недоступен"
    exit 1
  fi
  
  log_info "Оба хоста доступны, начинаем тестирование"
  
  # Запускаем тестирование для каждого эндпоинта
  for endpoint in "${ENDPOINTS[@]}"; do
    run_endpoint_test "$endpoint"
  done
  
  log_info "A/B тестирование завершено. Результаты доступны в директории: $RESULT_DIR"
  
  return 0
}

# Запуск основной логики
main 