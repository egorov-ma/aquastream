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
FRONTEND_DIR="$(pwd)"
INFRA_DOCKER_FILE="../infra/docker/images/Dockerfile.frontend"

# Функция для освобождения порта 3000
free_port() {
    echo -e "${YELLOW}Проверка порта 3000...${NC}"
    
    # Останавливаем Docker-контейнеры на порту 3000
    if command -v docker &> /dev/null; then
        docker stop $(docker ps -q --filter "publish=3000") 2>/dev/null || true
    fi
    
    # Если порт все еще занят, завершаем процессы
    PID=$(lsof -t -i :3000 2>/dev/null)
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}Завершаем процессы на порту 3000...${NC}"
        kill $PID &>/dev/null || kill -9 $PID &>/dev/null 2>&1
    fi
    
    echo -e "${GREEN}Порт 3000 свободен.${NC}"
}

# Функция для освобождения порта 5173 (для тестов)
free_test_port() {
    echo -e "${YELLOW}Проверка порта 5173...${NC}"
    
    # Останавливаем Docker-контейнеры на порту 5173
    if command -v docker &> /dev/null; then
        docker stop $(docker ps -q --filter "publish=5173") 2>/dev/null || true
    fi
    
    # Если порт все еще занят, завершаем процессы
    PID=$(lsof -t -i :5173 2>/dev/null)
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}Завершаем процессы на порту 5173...${NC}"
        kill $PID &>/dev/null || kill -9 $PID &>/dev/null 2>&1
    fi
    
    echo -e "${GREEN}Порт 5173 свободен.${NC}"
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
    echo -e "${YELLOW}--- Мониторинг ---${NC}"
    echo -e "  ${GREEN}logs${NC}          - Просмотр логов (определяет запущенный режим)"
    echo -e "  ${GREEN}docker-logs${NC}   - Просмотр логов Docker-контейнера"
    echo -e "  ${GREEN}status${NC}        - Проверка статуса приложения"
}

# Основные функции
run_clean() {
    echo -e "${YELLOW}Очистка...${NC}"
    docker stop $(docker ps -q --filter ancestor=aquastream-frontend) 2>/dev/null || true
    docker rm $(docker ps -a -q --filter ancestor=aquastream-frontend) 2>/dev/null || true
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
    npx eslint src --ext ts,tsx --fix
    echo -e "${GREEN}Исправление завершено${NC}"
}

run_lint() {
    echo -e "${YELLOW}Проверка кода линтером...${NC}"
    npm run lint
    echo -e "${GREEN}Проверка завершена${NC}"
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
    *)
        echo -e "${RED}Неизвестная команда: $1${NC}"
        show_help
        exit 1
        ;;
esac

exit 0
