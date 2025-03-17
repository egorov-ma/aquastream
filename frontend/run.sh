#!/bin/bash

# Скрипт для быстрого запуска фронтенда AquaStream
# =============================================

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для освобождения порта 3000
free_port_3000() {
    echo -e "${YELLOW}Проверка порта 3000...${NC}"
    
    # Если порт свободен, ничего не делаем
    if ! lsof -i :3000 &> /dev/null; then
        echo -e "${GREEN}Порт 3000 свободен.${NC}"
        return 0
    fi
    
    # Сначала проверяем и останавливаем Docker-контейнеры
    if command -v docker &> /dev/null; then
        # Находим и останавливаем Docker-контейнеры на порту 3000
        DOCKER_CONTAINERS=$(docker ps -q --filter "publish=3000" 2>/dev/null)
        if [ -n "$DOCKER_CONTAINERS" ]; then
            echo -e "${YELLOW}Останавливаем Docker-контейнеры на порту 3000...${NC}"
            docker stop $DOCKER_CONTAINERS &>/dev/null
        fi
    fi
    
    # Проверяем, освободился ли порт
    if ! lsof -i :3000 &> /dev/null; then
        echo -e "${GREEN}Порт 3000 освобожден.${NC}"
        return 0
    fi
    
    # Если порт все еще занят, завершаем процессы напрямую
    echo -e "${YELLOW}Завершаем процессы на порту 3000...${NC}"
    PIDS=$(lsof -t -i :3000 2>/dev/null)
    if [ -n "$PIDS" ]; then
        kill $PIDS &>/dev/null
        sleep 1
        kill -9 $PIDS &>/dev/null 2>&1
    fi
    
    # Финальная проверка
    if ! lsof -i :3000 &> /dev/null; then
        echo -e "${GREEN}Порт 3000 освобожден.${NC}"
        return 0
    else
        echo -e "${RED}Не удалось освободить порт 3000.${NC}"
        return 1
    fi
}

# Главное меню скрипта
main() {
    echo -e "${BLUE}=== AquaStream Frontend - Быстрый запуск ===${NC}\n"
    
    # Проверка наличия Node.js и npm
    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        echo -e "${RED}Ошибка: Node.js или npm не установлены.${NC}"
        echo -e "Установите Node.js: https://nodejs.org/"
        exit 1
    fi
    
    cd "$(dirname "$0")" || exit 1
    
    # Вывод меню
    echo -e "Выберите действие:"
    echo -e "  ${GREEN}1)${NC} Локальный запуск для разработки"
    echo -e "  ${GREEN}2)${NC} Запуск через Docker"
    echo -e "  ${GREEN}3)${NC} Установка зависимостей"
    echo -e "  ${GREEN}4)${NC} Сборка для продакшена"
    echo -e "  ${GREEN}5)${NC} Устранение проблем с зависимостями"
    echo -e "  ${GREEN}0)${NC} Выход"
    echo -e ""
    
    read -p "Ваш выбор: " choice
    
    case $choice in
        1)
            echo -e "\n${YELLOW}Запуск в режиме разработки...${NC}"
            free_port_3000
            npm run dev
            ;;
        2)
            echo -e "\n${YELLOW}Запуск через Docker...${NC}"
            free_port_3000
            
            if ! docker info &>/dev/null; then
                echo -e "${RED}Docker не запущен или недоступен.${NC}"
                exit 1
            fi
            
            npm run docker:build && npm run docker:run
            ;;
        3)
            echo -e "\n${YELLOW}Установка зависимостей...${NC}"
            npm run setup
            echo -e "${GREEN}Установка завершена!${NC}"
            ;;
        4)
            echo -e "\n${YELLOW}Сборка для продакшена...${NC}"
            npm run build
            echo -e "${GREEN}Сборка завершена в директории build/${NC}"
            ;;
        5)
            troubleshoot_menu
            ;;
        0)
            echo -e "\n${GREEN}Выход${NC}"
            exit 0
            ;;
        *)
            echo -e "\n${RED}Неверный выбор${NC}"
            exit 1
            ;;
    esac
}

# Подменю для устранения проблем
troubleshoot_menu() {
    echo -e "\n${YELLOW}Выберите способ решения проблем:${NC}"
    echo -e "  ${GREEN}1)${NC} Установка с --legacy-peer-deps"
    echo -e "  ${GREEN}2)${NC} Использовать yarn"
    echo -e "  ${GREEN}3)${NC} Запустить npm audit fix"
    echo -e "  ${GREEN}0)${NC} Назад"
    echo -e ""
    
    read -p "Ваш выбор: " troubleshoot_choice
    
    case $troubleshoot_choice in
        1)
            echo -e "\n${YELLOW}Установка с --legacy-peer-deps...${NC}"
            npm install --legacy-peer-deps
            ;;
        2)
            echo -e "\n${YELLOW}Использование yarn...${NC}"
            if ! command -v yarn &> /dev/null; then
                echo -e "${YELLOW}Установка yarn...${NC}"
                npm install -g yarn
            fi
            yarn install
            ;;
        3)
            echo -e "\n${YELLOW}Исправление уязвимостей...${NC}"
            npm audit fix
            ;;
        0)
            main
            return
            ;;
        *)
            echo -e "\n${RED}Неверный выбор${NC}"
            troubleshoot_menu
            return
            ;;
    esac
    
    echo -e "\n${GREEN}Готово!${NC}"
}

# Запуск главной функции
main
