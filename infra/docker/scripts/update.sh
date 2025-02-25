#!/bin/bash

# Вывод текста с заданным цветом
print_colored_text() {
    local color_code=$1
    local text=$2
    echo -e "\033[${color_code}m${text}\033[0m"
}

# Функция для вывода подсказки
show_help() {
    echo "Использование: $0 [опции]"
    echo "Опции:"
    echo "  -h, --help            Показать эту подсказку"
    echo "  -s, --service СЕРВИС  Обновить только указанный сервис (например: frontend, api-gateway)"
    echo "  -b, --branch ВЕТКА    Обновить до указанной ветки Git (по умолчанию: main)"
    echo "  -t, --tag ТЕГ         Обновить до указанной версии/тега"
    echo "  -p, --pull-only       Только получить обновления из репозитория, без пересборки и перезапуска"
    echo "  -r, --restart         Перезапустить сервисы после обновления"
    echo "  -f, --force           Принудительное обновление (сброс локальных изменений)"
    echo "  --skip-pull           Пропустить этап получения обновлений из репозитория"
    echo "  --no-cache            Не использовать кеш при сборке образов"
    echo
    echo "Примеры:"
    echo "  $0                   Обновить весь проект до последней версии в ветке main"
    echo "  $0 -b develop        Обновить проект до последней версии в ветке develop"
    echo "  $0 -s frontend       Обновить только frontend"
    echo "  $0 -t v1.2.3         Обновить до указанной версии/тега"
    echo "  $0 -r                Обновить и перезапустить сервисы"
}

# Инициализация переменных
SERVICE=""
BRANCH="main"
TAG=""
PULL_ONLY=false
RESTART=false
FORCE=false
SKIP_PULL=false
NO_CACHE=false

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -p|--pull-only)
            PULL_ONLY=true
            shift
            ;;
        -r|--restart)
            RESTART=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        --skip-pull)
            SKIP_PULL=true
            shift
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        *)
            print_colored_text "31" "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Переход в директорию со скриптом
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR"

# Переход в корневую директорию проекта (на два уровня выше infra/docker)
cd "../.."
PROJECT_ROOT=$(pwd)

print_colored_text "36" "=== Обновление проекта AquaStream ==="
print_colored_text "36" "Корневая директория проекта: $PROJECT_ROOT"

# Проверка наличия Git
if ! command -v git &> /dev/null; then
    print_colored_text "31" "Ошибка: Git не установлен!"
    exit 1
fi

# Получение обновлений из репозитория
if [ "$SKIP_PULL" != true ]; then
    print_colored_text "36" "\n=== Получение обновлений из репозитория ==="
    
    # Проверка на наличие локальных изменений
    if [ -n "$(git status --porcelain)" ]; then
        if [ "$FORCE" = true ]; then
            print_colored_text "33" "Обнаружены локальные изменения. Принудительная отмена изменений..."
            git reset --hard
            git clean -fd
        else
            print_colored_text "31" "Ошибка: Обнаружены локальные изменения. Используйте -f для принудительного обновления или сохраните изменения."
            exit 1
        fi
    fi
    
    # Сохранение текущей ветки
    CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "detached")
    
    # Получение последних обновлений
    print_colored_text "36" "Получение последних обновлений..."
    git fetch --all --tags --prune
    
    # Переключение на указанную ветку или тег
    if [ -n "$TAG" ]; then
        print_colored_text "36" "Переключение на тег/версию: $TAG"
        if ! git checkout "$TAG"; then
            print_colored_text "31" "Ошибка: Не удалось переключиться на тег/версию $TAG!"
            exit 1
        fi
    else
        print_colored_text "36" "Переключение на ветку: $BRANCH"
        if ! git checkout "$BRANCH"; then
            print_colored_text "31" "Ошибка: Не удалось переключиться на ветку $BRANCH!"
            exit 1
        fi
        
        # Обновление до последней версии ветки
        if ! git pull origin "$BRANCH"; then
            print_colored_text "31" "Ошибка: Не удалось получить последние изменения из ветки $BRANCH!"
            exit 1
        fi
    fi
    
    print_colored_text "32" "Репозиторий успешно обновлен до последней версии."
fi

# Если выбрана опция только получения обновлений, завершаем работу
if [ "$PULL_ONLY" = true ]; then
    print_colored_text "32" "Обновление кода завершено. Сборка и перезапуск сервисов пропущены."
    exit 0
fi

# Формирование команды docker compose
CMD="docker compose -f ../compose/docker-compose.yml -f ../compose/docker-compose.override.yml"

# Сборка образов
print_colored_text "36" "\n=== Сборка Docker образов ==="

BUILD_OPTS=""
if [ "$NO_CACHE" = true ]; then
    BUILD_OPTS="$BUILD_OPTS --no-cache"
fi

if [ -z "$SERVICE" ]; then
    print_colored_text "36" "Сборка всех Docker образов..."
    if ! $CMD build $BUILD_OPTS; then
        print_colored_text "31" "Ошибка при сборке Docker образов!"
        exit 1
    fi
else
    print_colored_text "36" "Сборка Docker образа для '$SERVICE'..."
    if ! $CMD build $BUILD_OPTS "$SERVICE"; then
        print_colored_text "31" "Ошибка при сборке Docker образа для '$SERVICE'!"
        exit 1
    fi
fi

# Перезапуск сервисов, если требуется
if [ "$RESTART" = true ]; then
    print_colored_text "36" "\n=== Перезапуск сервисов ==="
    
    cd "$SCRIPT_DIR"
    
    RESTART_OPTS=""
    if [ -n "$SERVICE" ]; then
        RESTART_OPTS="$RESTART_OPTS -s $SERVICE"
    fi
    
    if ! ./restart.sh $RESTART_OPTS; then
        print_colored_text "31" "Ошибка при перезапуске сервисов!"
        exit 1
    fi
else
    print_colored_text "33" "\nОбразы собраны, но сервисы не перезапущены."
    print_colored_text "33" "Для применения изменений запустите: ./restart.sh"
fi

print_colored_text "32" "\n=== Обновление проекта успешно завершено ===" 