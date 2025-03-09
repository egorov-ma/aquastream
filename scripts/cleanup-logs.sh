#!/bin/bash
#
# AquaStream - Скрипт для очистки и ротации логов
# Версия: 1.0.0
#

# Определение директории скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Подключаем библиотеку утилит
source "/Users/egorovma/IdeaProjects/aquastream/scripts/utils.sh"

# Устанавливаем перехватчик ошибок
setup_error_trap

# Показать помощь по использованию скрипта
show_help() {
  cat << EOF
Использование: $0 [опции]

Скрипт для автоматической очистки и ротации логов AquaStream.

Опции:
  -h, --help               Показать эту справку
  -a, --all                Очистить все логи (включая архивные)
  -d, --days DAYS          Удалить логи старше указанного количества дней (по умолчанию: 30)
  -s, --size SIZE          Максимальный размер файла логов в MB перед ротацией (по умолчанию: 100)
  -c, --compress           Сжимать ротированные логи
  -k, --keep NUMBER        Количество архивных файлов логов для хранения (по умолчанию: 5)
  -v, --verbose            Подробный вывод
  --dry-run                Показать, что будет сделано, без выполнения действий

Примеры:
  $0                      Выполнить стандартную очистку логов
  $0 -d 7                 Удалить логи старше 7 дней
  $0 -a                   Очистить все логи
  $0 --dry-run            Симуляция очистки без реального удаления файлов

EOF
}

# Инициализация переменных
CLEAN_ALL=false
MAX_DAYS=30
MAX_SIZE=100  # MB
COMPRESS=false
KEEP_COUNT=5
DRY_RUN=false
VERBOSE=false

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -a|--all)
      CLEAN_ALL=true
      shift
      ;;
    -d|--days)
      MAX_DAYS="$2"
      shift 2
      ;;
    -s|--size)
      MAX_SIZE="$2"
      shift 2
      ;;
    -c|--compress)
      COMPRESS=true
      shift
      ;;
    -k|--keep)
      KEEP_COUNT="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE=true
      export LOG_LEVEL=$LOG_LEVEL_DEBUG
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      log_error "Неизвестная опция: $1"
      show_help
      exit 1
      ;;
  esac
done

# Пути к директориям логов
LOGS_DIR="${SCRIPT_DIR}/../logs"
CONTAINER_LOGS_DIR="${SCRIPT_DIR}/../compose/logs"
ARCHIVED_LOGS_DIR="${LOGS_DIR}/archived"

# Создаем директорию для архивных логов, если её нет
mkdir -p "${ARCHIVED_LOGS_DIR}"

# Функция для очистки старых логов
cleanup_old_logs() {
  local dir="$1"
  local days="$2"
  
  if [[ ! -d "$dir" ]]; then
    log_debug "Директория $dir не существует, пропускаем"
    return 0
  fi
  
  log_info "Удаление логов старше $days дней в $dir"
  
  # Находим файлы логов старше указанного количества дней
  local old_logs
  old_logs=$(find "$dir" -type f -name "*.log*" -o -name "*.gz" -mtime +"$days" 2>/dev/null)
  
  if [[ -z "$old_logs" ]]; then
    log_info "Старые логи не найдены"
    return 0
  fi
  
  if [[ "$VERBOSE" == "true" ]]; then
    log_debug "Будут удалены следующие файлы:"
    echo "$old_logs" | while read -r file; do
      log_debug "  - $file"
    done
  fi
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "Режим DRY RUN: файлы не будут удалены"
    return 0
  fi
  
  # Удаляем старые логи
  echo "$old_logs" | while read -r file; do
    if [[ -f "$file" ]]; then
      rm -f "$file"
      if [[ "$VERBOSE" == "true" ]]; then
        log_debug "Удален файл: $file"
      fi
    fi
  done
  
  log_info "Очистка старых логов завершена"
  return 0
}

# Функция для ротации больших файлов логов
rotate_large_logs() {
  local dir="$1"
  # Переменная total_size_bytes или просто переменная MAX_SIZE используется напрямую
  # поэтому max_size_bytes можно удалить или закомментировать
  # local max_size_bytes=$((MAX_SIZE * 1024 * 1024))  # Конвертируем MB в байты
  
  if [[ ! -d "$dir" ]]; then
    log_debug "Директория $dir не существует, пропускаем"
    return 0
  fi
  
  log_info "Ротация файлов логов размером более $MAX_SIZE MB в $dir"
  
  # Находим файлы логов размером больше указанного
  local large_logs
  large_logs=$(find "$dir" -type f -name "*.log" -size +"${MAX_SIZE}M" 2>/dev/null)
  
  if [[ -z "$large_logs" ]]; then
    log_info "Крупные файлы логов не найдены"
    return 0
  fi
  
  if [[ "$VERBOSE" == "true" ]]; then
    log_debug "Будут ротированы следующие файлы:"
    echo "$large_logs" | while read -r file; do
      log_debug "  - $file ($(du -h "$file" | cut -f1))"
    done
  fi
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "Режим DRY RUN: файлы не будут ротированы"
    return 0
  fi
  
  # Ротируем большие файлы логов
  echo "$large_logs" | while read -r file; do
    if [[ -f "$file" ]]; then
      local filename
      filename=$(basename "$file")
      local timestamp
      timestamp=$(date +"%Y%m%d-%H%M%S")
      local rotated_file="${ARCHIVED_LOGS_DIR}/${filename%.log}_${timestamp}.log"
      
      # Копируем в архив и очищаем оригинальный файл
      cp "$file" "$rotated_file"
      
      # Если нужно сжать файл
      if [[ "$COMPRESS" == "true" ]]; then
        gzip "$rotated_file"
        log_debug "Файл сжат: ${rotated_file}.gz"
      fi
      
      # Очищаем исходный файл, но не удаляем его
      truncate -s 0 "$file"
      
      if [[ "$VERBOSE" == "true" ]]; then
        log_debug "Файл ротирован: $file -> $rotated_file"
      fi
    fi
  done
  
  log_info "Ротация крупных файлов логов завершена"
  return 0
}

# Функция для ограничения количества архивных файлов
limit_archived_files() {
  local dir="$1"
  local keep_count="$2"
  local file_pattern="$3"
  
  if [[ ! -d "$dir" ]]; then
    log_debug "Директория $dir не существует, пропускаем"
    return 0
  fi
  
  log_info "Ограничение количества архивных файлов ($keep_count) в $dir"
  
  # Считаем количество файлов, соответствующих шаблону
  local file_count
  file_count=$(find "$dir" -type f -name "$file_pattern" | wc -l)
  
  if [[ "$file_count" -le "$keep_count" ]]; then
    log_debug "Количество архивных файлов ($file_count) не превышает лимит ($keep_count)"
    return 0
  fi
  
  # Получаем список файлов, отсортированный по времени изменения (старые первыми)
  local files_to_remove
  files_to_remove=$(find "$dir" -type f -name "$file_pattern" -print0 | 
                    xargs -0 ls -1t | 
                    tail -n +$((keep_count + 1)))
  
  if [[ -z "$files_to_remove" ]]; then
    log_info "Нет файлов для удаления"
    return 0
  fi
  
  if [[ "$VERBOSE" == "true" ]]; then
    log_debug "Будут удалены следующие архивные файлы (превышен лимит $keep_count):"
    echo "$files_to_remove" | while read -r file; do
      log_debug "  - $file"
    done
  fi
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "Режим DRY RUN: архивные файлы не будут удалены"
    return 0
  fi
  
  # Удаляем лишние архивные файлы
  echo "$files_to_remove" | while read -r file; do
    if [[ -f "$file" ]]; then
      rm -f "$file"
      if [[ "$VERBOSE" == "true" ]]; then
        log_debug "Удален архивный файл: $file"
      fi
    fi
  done
  
  log_info "Очистка лишних архивных файлов завершена"
  return 0
}

# Главная функция
main() {
  log_info "Запуск процедуры очистки логов..."
  
  # Выводим информацию о параметрах
  log_debug "Параметры очистки:"
  log_debug "- Полная очистка: $CLEAN_ALL"
  log_debug "- Максимальный возраст: $MAX_DAYS дней"
  log_debug "- Максимальный размер: $MAX_SIZE MB"
  log_debug "- Сжатие: $COMPRESS"
  log_debug "- Количество сохраняемых архивов: $KEEP_COUNT"
  log_debug "- Dry run: $DRY_RUN"
  
  # Если указана полная очистка, удаляем все логи
  if [[ "$CLEAN_ALL" == "true" ]]; then
    log_warn "Выполняется полная очистка всех логов!"
    
    if [[ "$DRY_RUN" == "true" ]]; then
      log_info "Режим DRY RUN: логи не будут удалены"
    else
      # Очищаем директории с логами, но сохраняем сами директории
      find "${LOGS_DIR}" -type f -delete
      find "${CONTAINER_LOGS_DIR}" -type f -delete
      log_info "Все логи успешно удалены"
    fi
    
    return 0
  fi
  
  # Очистка старых логов в основной директории
  cleanup_old_logs "${LOGS_DIR}" "${MAX_DAYS}"
  
  # Очистка старых логов в директории контейнеров
  cleanup_old_logs "${CONTAINER_LOGS_DIR}" "${MAX_DAYS}"
  
  # Очистка старых архивных логов
  cleanup_old_logs "${ARCHIVED_LOGS_DIR}" "${MAX_DAYS}"
  
  # Ротация больших файлов логов
  rotate_large_logs "${LOGS_DIR}"
  rotate_large_logs "${CONTAINER_LOGS_DIR}"
  
  # Ограничение количества архивных файлов
  limit_archived_files "${ARCHIVED_LOGS_DIR}" "${KEEP_COUNT}" "*.log"
  limit_archived_files "${ARCHIVED_LOGS_DIR}" "${KEEP_COUNT}" "*.log.gz"
  
  log_info "Процедура очистки логов успешно завершена"
  return 0
}

# Запуск главной функции
main
exit $? 