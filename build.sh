#!/bin/bash
#
# AquaStream - Скрипт для сборки проекта (backend и frontend)
# Версия: 2.0.0
#

# Установка строгого режима
set -eo pipefail

# Определение директории скрипта
BUILD_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BUILD_SCRIPT_DIR"

# Подключаем библиотеку утилит, если она доступна
if [[ -f "./infra/docker/scripts/utils.sh" ]]; then
  source "./infra/docker/scripts/utils.sh"
else
  # Минимальная реализация логирования, если библиотека недоступна
  log_info() {
    echo -e "\033[0;32m[INFO] $(date +"%Y-%m-%d %H:%M:%S") - $1\033[0m"
  }
  
  log_error() {
    echo -e "\033[0;31m[ERROR] $(date +"%Y-%m-%d %H:%M:%S") - $1\033[0m" >&2
  }
  
  log_warn() {
    echo -e "\033[0;33m[WARN] $(date +"%Y-%m-%d %H:%M:%S") - $1\033[0m"
  }
  
  log_debug() {
    if [[ "${VERBOSE:-false}" == "true" ]]; then
      echo -e "\033[0;36m[DEBUG] $(date +"%Y-%m-%d %H:%M:%S") - $1\033[0m"
    fi
  }
  
  setup_error_trap() {
    trap 'handle_error $LINENO' ERR
  }
  
  handle_error() {
    local line="$1"
    log_error "Ошибка в скрипте $(basename "${BASH_SOURCE[0]}") на строке ${line}"
    exit 1
  }
fi

# Устанавливаем перехватчик ошибок
setup_error_trap

# Функция для вывода подсказки
show_help() {
  cat << EOF
Использование: $0 [опции]
Опции:
  -h, --help               Показать эту подсказку
  -b, --backend-only       Собрать только backend
  -f, --frontend-only      Собрать только frontend
  -c, --clean              Полная пересборка (очистка кэша)
  -t, --tests              Запустить тесты
  -s, --skip-tests         Пропустить тесты
  -d, --dev                Сборка для разработки (dev-профиль)
  -p, --prod               Сборка для продакшена (prod-профиль)
  -v, --verbose            Подробный вывод
  --canary VERSION         Создать канареечную версию с указанным номером
  --java-opts OPTS         Дополнительные параметры для Java (для Gradle)
  --npm-opts OPTS          Дополнительные параметры для npm

Примеры:
  $0                      Собрать весь проект (backend и frontend)
  $0 -b -c                Собрать только backend с очисткой кэша
  $0 -t -v                Собрать проект, запустить тесты и вывести подробную информацию
  $0 --canary 1.2.3       Собрать канареечную версию 1.2.3

EOF
}

# Инициализация переменных
BACKEND_ONLY=false
FRONTEND_ONLY=false
CLEAN=false
RUN_TESTS=true
VERBOSE=false
ENV_PROFILE="default"
CANARY_VERSION=""
JAVA_OPTS=""
NPM_OPTS=""

# Проверка наличия файла settings.gradle в корневой директории
if [[ ! -f "settings.gradle" ]]; then
  log_error "Ошибка: скрипт должен быть запущен из корневой директории проекта."
  exit 1
fi

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -b|--backend-only)
      BACKEND_ONLY=true
      shift
      ;;
    -f|--frontend-only)
      FRONTEND_ONLY=true
      shift
      ;;
    -c|--clean)
      CLEAN=true
      shift
      ;;
    -t|--tests)
      RUN_TESTS=true
      shift
      ;;
    -s|--skip-tests)
      RUN_TESTS=false
      shift
      ;;
    -d|--dev)
      ENV_PROFILE="dev"
      shift
      ;;
    -p|--prod)
      ENV_PROFILE="prod"
      shift
      ;;
    -v|--verbose)
      VERBOSE=true
      export LOG_LEVEL=$LOG_LEVEL_DEBUG
      shift
      ;;
    --canary)
      CANARY_VERSION="$2"
      shift 2
      ;;
    --java-opts)
      JAVA_OPTS="$2"
      shift 2
      ;;
    --npm-opts)
      NPM_OPTS="$2"
      shift 2
      ;;
    *)
      log_error "Неизвестная опция: $1"
      show_help
      exit 1
      ;;
  esac
done

# Проверка несовместимых опций
if [[ "$BACKEND_ONLY" == "true" && "$FRONTEND_ONLY" == "true" ]]; then
  log_error "Нельзя указать одновременно --backend-only и --frontend-only"
  exit 1
fi

# Формирование команды для сборки backend
build_backend() {
  log_info "Сборка Backend..."
  
  local gradle_cmd="./gradlew"
  local gradle_tasks=()
  
  if [[ "$CLEAN" == "true" ]]; then
    gradle_tasks+=("clean")
    log_debug "Включена очистка кэша"
  fi
  
  gradle_tasks+=("build")
  
  if [[ "$RUN_TESTS" == "false" ]]; then
    gradle_tasks+=("-x" "test")
    log_debug "Тесты пропущены"
  fi
  
  # Добавляем профиль окружения, если указан
  if [[ "$ENV_PROFILE" != "default" ]]; then
    gradle_cmd="$gradle_cmd -Penv=$ENV_PROFILE"
    log_debug "Установлен профиль окружения: $ENV_PROFILE"
  fi
  
  # Добавляем версию для канареечного развертывания, если указана
  if [[ -n "$CANARY_VERSION" ]]; then
    gradle_cmd="$gradle_cmd -Pversion=$CANARY_VERSION-canary"
    log_debug "Установлена версия для канареечного развертывания: $CANARY_VERSION-canary"
  fi
  
  # Добавляем дополнительные Java опции, если указаны
  if [[ -n "$JAVA_OPTS" ]]; then
    gradle_cmd="JAVA_OPTS=\"$JAVA_OPTS\" $gradle_cmd"
    log_debug "Установлены дополнительные Java опции: $JAVA_OPTS"
  fi
  
  # Выводим команду в режиме отладки
  log_debug "Выполняется команда: $gradle_cmd ${gradle_tasks[*]}"
  
  # Выполняем сборку
  if $gradle_cmd "${gradle_tasks[@]}"; then
    log_info "Backend успешно собран"
    return 0
  else
    log_error "Ошибка при сборке backend"
    return 1
  fi
}

# Формирование команды для сборки frontend
build_frontend() {
  log_info "Сборка Frontend..."
  
  # Убедимся, что мы находимся в корневой директории проекта
  if [[ "$PWD" != "$BUILD_SCRIPT_DIR" ]]; then
    log_debug "Возвращаемся в корневую директорию проекта ($BUILD_SCRIPT_DIR)"
    cd "$BUILD_SCRIPT_DIR" || {
      log_error "Не удалось перейти в корневую директорию проекта"
      return 1
    }
  fi
  
  # Переходим в директорию frontend
  cd "$BUILD_SCRIPT_DIR/frontend" || {
    log_error "Директория frontend не найдена"
    return 1
  }
  
  # Проверяем наличие package.json
  if [[ ! -f "package.json" ]]; then
    log_error "Файл package.json не найден в директории frontend"
    return 1
  fi
  
  # Проверяем, нужно ли устанавливать зависимости
  local install_deps=true
  if [[ "$CLEAN" == "false" && -d "node_modules" ]]; then
    # Проверяем, изменился ли package.json с последней установки
    if [[ -f "node_modules/.package-timestamp" && "$(stat -c %Y package.json 2>/dev/null || stat -f %m package.json 2>/dev/null)" -le "$(cat node_modules/.package-timestamp 2>/dev/null || echo 0)" ]]; then
      install_deps=false
      log_debug "Пропуск установки npm-зависимостей (package.json не изменился)"
    fi
  fi
  
  # Устанавливаем зависимости, если необходимо
  if [[ "$install_deps" == "true" ]]; then
    log_info "Установка npm-зависимостей..."
    if ! npm install $NPM_OPTS; then
      log_error "Ошибка при установке npm-зависимостей"
      return 1
    fi
    
    # Сохраняем timestamp для package.json
    date +%s > node_modules/.package-timestamp
  fi
  
  # Формируем команду для сборки
  local npm_cmd="npm run build"
  
  # Добавляем профиль окружения, если указан
  if [[ "$ENV_PROFILE" != "default" ]]; then
    npm_cmd="$npm_cmd:$ENV_PROFILE"
    log_debug "Установлен профиль окружения для frontend: $ENV_PROFILE"
  fi
  
  # Добавляем опции для канареечного развертывания, если указаны
  if [[ -n "$CANARY_VERSION" ]]; then
    npm_cmd="REACT_APP_VERSION=$CANARY_VERSION-canary REACT_APP_CANARY=true $npm_cmd"
    log_debug "Установлена версия для канареечного развертывания frontend: $CANARY_VERSION-canary"
  fi
  
  # Добавляем дополнительные npm опции, если указаны
  if [[ -n "$NPM_OPTS" ]]; then
    npm_cmd="$npm_cmd $NPM_OPTS"
    log_debug "Установлены дополнительные npm опции: $NPM_OPTS"
  fi
  
  # Выводим команду в режиме отладки
  log_debug "Выполняется команда: $npm_cmd"
  
  # Выполняем сборку
  if eval "$npm_cmd"; then
    log_info "Frontend успешно собран"
    
    # Возвращаемся в корневую директорию
    cd "$BUILD_SCRIPT_DIR" || {
      log_error "Не удалось вернуться в корневую директорию"
      return 1
    }
    
    return 0
  else
    log_error "Ошибка при сборке frontend"
    return 1
  fi
}

# Основная логика
main() {
  log_info "Запуск сборки проекта AquaStream..."
  
  # Отображаем информацию о параметрах сборки
  log_debug "Параметры сборки:"
  log_debug "- Backend-only: $BACKEND_ONLY"
  log_debug "- Frontend-only: $FRONTEND_ONLY"
  log_debug "- Clean: $CLEAN"
  log_debug "- Запуск тестов: $RUN_TESTS"
  log_debug "- Профиль окружения: $ENV_PROFILE"
  log_debug "- Канареечная версия: ${CANARY_VERSION:-не указана}"
  
  # Запускаем сборку backend, если требуется
  if [[ "$FRONTEND_ONLY" != "true" ]]; then
    if ! build_backend; then
      log_error "Сборка backend завершилась с ошибкой"
      exit 1
    fi
  fi
  
  # Запускаем сборку frontend, если требуется
  if [[ "$BACKEND_ONLY" != "true" ]]; then
    if ! build_frontend; then
      log_error "Сборка frontend завершилась с ошибкой"
      exit 1
    fi
  fi
  
  log_info "Сборка проекта успешно завершена"
  
  # Если это канареечная версия, выводим информацию о дальнейших действиях
  if [[ -n "$CANARY_VERSION" ]]; then
    log_info "Создана канареечная версия $CANARY_VERSION-canary"
    log_info "Для запуска канареечного окружения используйте:"
    log_info "  ./infra/docker/scripts/canary.sh -s -v $CANARY_VERSION"
  fi
  
  return 0
}

# Запуск основной логики
main 