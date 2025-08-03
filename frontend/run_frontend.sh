#!/bin/bash

# Упрощенный скрипт для работы с фронтендом AquaStream
# =============================================

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Пути к файлам
# FRONTEND_DIR="$(pwd)"  # Unused variable
# INFRA_DOCKER_FILE="../infra/docker/images/Dockerfile.frontend"  # Unused variable

# Функция для освобождения порта 3000
free_port() {
    echo -e "${YELLOW}Проверка порта 3000...${NC}"
    
    # Останавливаем Docker-контейнеры на порту 3000
    if command -v docker &> /dev/null; then
        docker stop "$(docker ps -q --filter "publish=3000")" 2>/dev/null || true
    fi
    
    # Если порт все еще занят, завершаем процессы
    PID=$(lsof -t -i :3000 2>/dev/null)
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}Завершаем процессы на порту 3000...${NC}"
        kill "$PID" &>/dev/null || kill -9 "$PID" &>/dev/null 2>&1
    fi
    
    echo -e "${GREEN}Порт 3000 свободен.${NC}"
}

# Функция для освобождения порта 5173 (для тестов)
# shellcheck disable=SC2317
free_test_port() {
    echo -e "${YELLOW}Проверка порта 5173...${NC}"
    
    # Останавливаем Docker-контейнеры на порту 5173
    if command -v docker &> /dev/null; then
        docker stop "$(docker ps -q --filter "publish=5173")" 2>/dev/null || true
    fi
    
    # Если порт все еще занят, завершаем процессы
    PID=$(lsof -t -i :5173 2>/dev/null)
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}Завершаем процессы на порту 5173...${NC}"
        kill "$PID" &>/dev/null || kill -9 "$PID" &>/dev/null 2>&1
    fi
    
    echo -e "${GREEN}Порт 5173 свободен.${NC}"
}

# Функция для освобождения порта 6006 (для Storybook)
free_storybook_port() {
    echo -e "${YELLOW}Проверка порта 6006...${NC}"
    
    # Останавливаем Docker-контейнеры на порту 6006
    if command -v docker &> /dev/null; then
        docker stop "$(docker ps -q --filter "publish=6006")" 2>/dev/null || true
    fi
    
    # Если порт все еще занят, завершаем процессы
    PID=$(lsof -t -i :6006 2>/dev/null)
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}Завершаем процессы на порту 6006...${NC}"
        kill "$PID" &>/dev/null || kill -9 "$PID" &>/dev/null 2>&1
    fi
    
    echo -e "${GREEN}Порт 6006 свободен.${NC}"
}

# Функция для проверки и установки зависимостей Storybook
check_storybook_deps() {
    echo -e "${YELLOW}Проверка зависимостей Storybook...${NC}"
    
    # Определяем текущую версию Storybook
    local sb_version
    sb_version=$(npm list @storybook/react | grep -o '@storybook/react@[0-9.]*' | cut -d '@' -f 3)
    
    if [ -z "$sb_version" ]; then
        echo -e "${RED}Не удалось определить версию Storybook. Используем последнюю версию.${NC}"
        sb_version="8.6.8"
    fi
    
    echo -e "${GREEN}Используем Storybook версии: ${sb_version}${NC}"
    
    echo -e "${YELLOW}Исправление зависимостей Storybook...${NC}"
    
    # Сохраняем текущий package.json
    cp package.json package.json.backup
    
    # Очистка и переустановка Storybook аддонов
    echo -e "${YELLOW}Удаление проблемных зависимостей...${NC}"
    npm uninstall --save-dev @storybook/addon-links @storybook/addon-essentials @storybook/addon-onboarding @storybook/addon-interactions
    
    # Проверяем директорию node_modules и удаляем проблемные пакеты напрямую если они остались
    echo -e "${YELLOW}Проверка наличия оставшихся файлов...${NC}"
    for addon in "addon-links" "addon-essentials" "addon-onboarding" "addon-interactions"; do
        if [ -d "node_modules/@storybook/$addon" ]; then
            echo -e "${YELLOW}Ручное удаление @storybook/$addon...${NC}"
            rm -rf "node_modules/@storybook/$addon"
        fi
    done
    
    # Устанавливаем аддоны заново с точной версией
    echo -e "${YELLOW}Установка аддонов Storybook...${NC}"
    
    npm install --save-dev \
        "@storybook/addon-links@${sb_version}" \
        "@storybook/addon-essentials@${sb_version}" \
        "@storybook/addon-onboarding@${sb_version}" \
        "@storybook/addon-interactions@${sb_version}"
    
    INSTALL_STATUS=$?
    
    if [ $INSTALL_STATUS -eq 0 ]; then
        echo -e "${GREEN}Зависимости Storybook успешно установлены!${NC}"
        # Удаляем бэкап, так как все в порядке
        rm package.json.backup
    else
        echo -e "${RED}Не удалось установить аддоны Storybook, код ошибки: $INSTALL_STATUS${NC}"
        echo -e "${YELLOW}Восстанавливаем оригинальный package.json...${NC}"
        mv package.json.backup package.json
        echo -e "${YELLOW}Рекомендуемое действие:"
        echo -e "1. Запустите 'npm install'"
        echo -e "2. Исправьте main.ts в .storybook, временно убрав неустановленные аддоны${NC}"
    fi
}

# Вывод справки
show_help() {
    echo -e "${BLUE}AquaStream Frontend - Команды:${NC}"
    echo -e "${YELLOW}--- Подготовка проекта ---${NC}"
    echo -e "  ${GREEN}setup-all${NC}     - Полная подготовка проекта (все нижеследующие шаги)"
    echo -e "  ${GREEN}clean${NC}         - Очистка Docker и кэша"
    echo -e "  ${GREEN}install${NC}       - Установка зависимостей"
    echo -e "  ${GREEN}update-deps${NC}   - Обновление и безопасное исправление зависимостей"
    echo -e "  ${GREEN}format${NC}        - Форматирование кода"
    echo -e "  ${GREEN}lint:fix${NC}      - Автоматическое исправление ошибок линтера"
    echo -e "  ${GREEN}lint${NC}          - Проверка кода линтером"
    echo -e "  ${GREEN}build${NC}         - Сборка для продакшена"
    echo -e "  ${GREEN}analyze${NC}       - Анализ бандла"
    echo -e "${YELLOW}--- Запуск проекта ---${NC}"
    echo -e "  ${GREEN}dev${NC}           - Запуск в режиме разработки"
    echo -e "  ${GREEN}docker${NC}        - Запуск в Docker-контейнере"
    echo -e "  ${GREEN}rebuild${NC}       - Полное обновление и перезапуск"
    echo -e "${YELLOW}--- Тестирование ---${NC}"
    echo -e "  ${GREEN}test${NC}          - Запуск всех тестов"
    echo -e "  ${GREEN}test:watch${NC}    - Запуск тестов в режиме отслеживания изменений"
    echo -e "  ${GREEN}test:coverage${NC} - Запуск тестов с отчетом о покрытии"
    echo -e "  ${GREEN}coverage:report${NC} - Генерация и отображение отчета о покрытии"
    echo -e "  ${GREEN}coverage:badge${NC}  - Генерация бейджей о покрытии для README"
    echo -e "${YELLOW}--- Документация ---${NC}"
    echo -e "  ${GREEN}storybook${NC}     - Запуск Storybook"
    echo -e "  ${GREEN}build-storybook${NC} - Сборка Storybook"
    echo -e "  ${GREEN}fix-storybook${NC}   - Исправление проблем с аддонами Storybook"
    echo -e "  ${GREEN}repair-storybook${NC} - Полное восстановление Storybook"
    echo -e "${YELLOW}--- API ---${NC}"
    echo -e "  ${GREEN}api:gen${NC}       - Генерация API клиента из локального OpenAPI"
    echo -e "  ${GREEN}api:gen:remote${NC} - Генерация API клиента из удаленного OpenAPI"
    echo -e "  ${GREEN}api:gen:mock${NC}  - Генерация API клиента из локального JSON файла"
    echo -e "${YELLOW}--- Мониторинг ---${NC}"
    echo -e "  ${GREEN}logs${NC}          - Просмотр логов (определяет запущенный режим)"
    echo -e "  ${GREEN}docker-logs${NC}   - Просмотр логов Docker-контейнера"
    echo -e "  ${GREEN}status${NC}        - Проверка статуса приложения"
}

# Основные функции
run_clean() {
    echo -e "${YELLOW}Очистка...${NC}"
    docker stop "$(docker ps -q --filter ancestor=aquastream-frontend)" 2>/dev/null || true
    docker rm "$(docker ps -a -q --filter ancestor=aquastream-frontend)" 2>/dev/null || true
    docker rmi aquastream-frontend:latest 2>/dev/null || true
    npm cache clean --force
    echo -e "${GREEN}Очистка завершена${NC}"
}

run_install() {
    echo -e "${YELLOW}Установка зависимостей...${NC}"
    npm install
    echo -e "${GREEN}Установка завершена${NC}"
}

update_dependencies() {
    echo -e "${YELLOW}Обновляем зависимости...${NC}"
    npm update

    echo -e "${YELLOW}Решаем проблемы с безопасностью...${NC}"
    npm audit fix || npm audit fix --force
    
    echo -e "${GREEN}Зависимости обновлены${NC}"
}

run_format() {
    echo -e "${YELLOW}Форматирование кода...${NC}"
    npm run format
    echo -e "${GREEN}Форматирование завершено${NC}"
}

run_lint_fix() {
    echo -e "${YELLOW}Автоматическое исправление ошибок линтера...${NC}"
    npm run lint:fix
    echo -e "${GREEN}Исправление завершено${NC}"
}

run_lint() {
    echo -e "${YELLOW}Проверка кода линтером...${NC}"
    npm run lint
    echo -e "${GREEN}Проверка завершена${NC}"
}

# Запуск тестов
run_tests() {
    echo -e "${YELLOW}Запуск тестов...${NC}"
    npm run test
    echo -e "${GREEN}Тесты выполнены${NC}"
}

run_tests_watch() {
    echo -e "${YELLOW}Запуск тестов в режиме отслеживания изменений...${NC}"
    npm run test:watch
}

run_tests_coverage() {
    echo -e "${YELLOW}Запуск тестов с отчетом о покрытии...${NC}"
    npm run test:coverage
    echo -e "${GREEN}Тесты с покрытием выполнены${NC}"
}

generate_coverage_report() {
    echo -e "${YELLOW}Генерация и отображение отчета о покрытии...${NC}"
    npm run coverage:report
}

generate_coverage_badge() {
    echo -e "${YELLOW}Генерация бейджей о покрытии для README...${NC}"
    npm run coverage:badge
    echo -e "${GREEN}Бейджи обновлены${NC}"
}

# Запуск Storybook
run_storybook() {
    free_storybook_port
    
    # Временно исправляем конфигурацию Storybook
    fix_storybook_config
    
    echo -e "${YELLOW}Запуск Storybook...${NC}"
    # Используем npx вместо npm run
    npx storybook dev -p 6006
}

build_storybook() {
    # Временно исправляем конфигурацию Storybook
    fix_storybook_config
    
    echo -e "${YELLOW}Сборка Storybook...${NC}"
    # Используем npx вместо npm run
    npx storybook build
    echo -e "${GREEN}Storybook собран${NC}"
}

# Генерация API
generate_api() {
    echo -e "${YELLOW}Генерация API клиента из локального OpenAPI...${NC}"
    npm run api:gen
    echo -e "${GREEN}API клиент сгенерирован${NC}"
}

generate_api_remote() {
    echo -e "${YELLOW}Генерация API клиента из удаленного OpenAPI...${NC}"
    npm run api:gen:remote
    echo -e "${GREEN}API клиент сгенерирован${NC}"
}

generate_api_mock() {
    echo -e "${YELLOW}Генерация API клиента из локального JSON файла...${NC}"
    npm run api:gen:mock
    echo -e "${GREEN}API клиент сгенерирован${NC}"
}

# Функция для запуска всех проверок
run_all_checks() {
    echo -e "${BLUE}=== Запуск всех проверок ===${NC}"
    
    local errors=0
    
    # Запускаем линтер
    echo -e "${YELLOW}Запуск линтера...${NC}"
    if run_lint; then
        echo -e "${GREEN}Линтер успешно выполнен${NC}"
    else
        echo -e "${RED}Ошибки при проверке линтером${NC}"
        errors=$((errors+1))
    fi
    
    # Запускаем тесты
    echo -e "${YELLOW}Запуск тестов...${NC}"
    if run_tests; then
        echo -e "${GREEN}Тесты успешно пройдены${NC}"
    else
        echo -e "${RED}Ошибки при выполнении тестов${NC}"
        errors=$((errors+1))
    fi
    
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}Все проверки пройдены успешно!${NC}"
    else
        echo -e "${RED}Проверки завершены с ошибками.${NC}"
        return 1
    fi
}

# Запуск в режиме разработки
run_dev() {
    free_port
    echo -e "${YELLOW}Запуск в режиме разработки...${NC}"
    npm run dev
}

run_docker() {
    echo -e "${YELLOW}Запуск в Docker-контейнере...${NC}"
    npm run docker:run
    echo -e "${GREEN}Контейнер запущен на порту 3000${NC}"
}

run_rebuild() {
    echo -e "${YELLOW}Полное обновление и перезапуск...${NC}"
    npm run docker:rebuild
    echo -e "${GREEN}Контейнер перезапущен на порту 3000${NC}"
}

# Функция для установки всего необходимого
run_setup_all() {
    echo -e "${BLUE}=== Полная подготовка проекта ===${NC}"
    run_clean
    run_install
    run_format
    run_lint_fix
    run_lint
    echo -e "${GREEN}Проект готов к работе!${NC}"
}

# Функция для временного исправления конфигурации Storybook
fix_storybook_config() {
    echo -e "${YELLOW}Проверка и исправление конфигурации Storybook...${NC}"
    
    if [ -f ".storybook/main.ts" ]; then
        echo -e "${YELLOW}Резервное копирование .storybook/main.ts...${NC}"
        cp .storybook/main.ts .storybook/main.ts.backup
        
        # Временно отключаем проблемные аддоны
        echo -e "${YELLOW}Отключение проблемных аддонов в .storybook/main.ts...${NC}"
        sed -i.bak 's/'\''@storybook\/addon-links'\'',/\/\/ '\''@storybook\/addon-links'\'',/g' .storybook/main.ts
        sed -i.bak 's/'\''@storybook\/addon-essentials'\'',/\/\/ '\''@storybook\/addon-essentials'\'',/g' .storybook/main.ts
        sed -i.bak 's/'\''@storybook\/addon-onboarding'\'',/\/\/ '\''@storybook\/addon-onboarding'\'',/g' .storybook/main.ts
        sed -i.bak 's/'\''@storybook\/addon-interactions'\'',/\/\/ '\''@storybook\/addon-interactions'\'',/g' .storybook/main.ts
        
        # Убираем временные файлы
        rm -f .storybook/main.ts.bak
        
        echo -e "${GREEN}Конфигурация Storybook временно исправлена${NC}"
    else
        echo -e "${RED}Файл .storybook/main.ts не найден${NC}"
    fi
}

# Функция для принудительной установки базовых пакетов Storybook
install_storybook_base() {
    echo -e "${YELLOW}Принудительная установка базовых пакетов Storybook...${NC}"
    
    # Удаляем текущие зависимости Storybook
    npm uninstall --save-dev \
        @storybook/react \
        @storybook/react-webpack5 \
        @storybook/addon-links \
        @storybook/addon-essentials \
        @storybook/addon-onboarding \
        @storybook/addon-interactions
    
    # Очищаем кэш npm
    npm cache clean --force
    
    # Устанавливаем минимальный набор зависимостей Storybook с принудительным разрешением зависимостей
    npm install --save-dev --legacy-peer-deps \
        @storybook/react@^8.6.8 \
        @storybook/react-webpack5@^8.6.8 \
        @storybook/manager-api@^8.6.8 \
        @storybook/theming@^8.6.8 \
        @storybook/addon-a11y@^8.6.8
    
    echo -e "${GREEN}Базовые пакеты Storybook установлены с опцией --legacy-peer-deps${NC}"
}

# Функция для полного исправления Storybook
repair_storybook() {
    echo -e "${BLUE}=== Полное исправление Storybook ===${NC}"
    
    # Резервируем текущую конфигурацию
    if [ -f ".storybook/main.ts" ]; then
        echo -e "${YELLOW}Создание резервной копии конфигурации Storybook...${NC}"
        cp .storybook/main.ts .storybook/main.ts.backup
    fi
    
    # Устанавливаем базовые пакеты
    install_storybook_base
    
    # Временно исправляем конфигурацию для работы без аддонов
    fix_storybook_config
    
    echo -e "${GREEN}Базовая функциональность Storybook восстановлена${NC}"
    echo -e "${YELLOW}Примечание: Проблемные аддоны были отключены в конфигурации.${NC}"
    echo -e "${YELLOW}Если хотите восстановить полную функциональность, выполните:${NC}"
    echo -e "1. ${GREEN}npm install --save-dev --legacy-peer-deps @storybook/addon-links@^8.6.8 @storybook/addon-essentials@^8.6.8 @storybook/addon-onboarding@^8.6.8 @storybook/addon-interactions@^8.6.8${NC}"
    echo -e "2. ${GREEN}mv .storybook/main.ts.backup .storybook/main.ts${NC}"
}

# Обработка аргументов командной строки
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
    help)
        show_help
        ;;
    setup-all)
        run_setup_all
        ;;
    clean)
        run_clean
        ;;
    install)
        run_install
        ;;
    update-deps)
        update_dependencies
        ;;
    format)
        run_format
        ;;
    lint:fix)
        run_lint_fix
        ;;
    lint)
        run_lint
        ;;
    build)
        npm run build
        ;;
    analyze)
        npm run analyze
        ;;
    dev)
        run_dev
        ;;
    docker)
        run_docker
        ;;
    rebuild)
        run_rebuild
        ;;
    test)
        run_tests
        ;;
    test:watch)
        run_tests_watch
        ;;
    test:coverage)
        run_tests_coverage
        ;;
    coverage:report)
        generate_coverage_report
        ;;
    coverage:badge)
        generate_coverage_badge
        ;;
    storybook)
        run_storybook
        ;;
    build-storybook)
        build_storybook
        ;;
    fix-storybook)
        check_storybook_deps
        ;;
    api:gen)
        generate_api
        ;;
    api:gen:remote)
        generate_api_remote
        ;;
    api:gen:mock)
        generate_api_mock
        ;;
    logs)
        # Проверяем запущенный режим
        if docker ps | grep -q aquastream-frontend; then
            # Docker запущен
            docker logs -f aquastream-frontend
        else
            # Вероятно, режим разработки
            echo -e "${YELLOW}Docker-контейнер не запущен. Проверьте логи в консоли режима разработки.${NC}"
        fi
        ;;
    docker-logs)
        docker logs -f aquastream-frontend
        ;;
    status)
        # Проверяем статус
        if docker ps | grep -q aquastream-frontend; then
            echo -e "${GREEN}Docker-контейнер запущен.${NC}"
        else
            echo -e "${YELLOW}Docker-контейнер не запущен.${NC}"
        fi
        
        echo -e "${YELLOW}Проверка доступности на localhost:3000${NC}"
        if curl -s http://localhost:3000 >/dev/null; then
            echo -e "${GREEN}Сервис доступен на порту 3000.${NC}"
        else
            echo -e "${RED}Сервис недоступен на порту 3000.${NC}"
        fi
        ;;
    all-checks)
        run_all_checks
        ;;
    repair-storybook)
        repair_storybook
        ;;
    *)
        echo -e "${RED}Неизвестная команда: $1${NC}"
        show_help
        exit 1
        ;;
esac

exit 0
