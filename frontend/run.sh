#!/bin/bash

# Скрипт для быстрого запуска фронтенда AquaStream

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Aquastream Frontend - Быстрый запуск ===${NC}\n"

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Ошибка: Node.js не установлен.${NC}"
    echo -e "Пожалуйста, установите Node.js с сайта: https://nodejs.org/"
    exit 1
fi

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Ошибка: npm не установлен.${NC}"
    echo -e "Обычно npm устанавливается вместе с Node.js. Пожалуйста, проверьте вашу установку."
    exit 1
fi

cd "$(dirname "$0")" || exit 1

# Вывод меню
echo -e "Выберите действие:"
echo -e "  ${GREEN}1)${NC} Локальный запуск для разработки"
echo -e "  ${GREEN}2)${NC} Запуск через Docker"
echo -e "  ${GREEN}3)${NC} Установка зависимостей и настройка проекта"
echo -e "  ${GREEN}4)${NC} Сборка для продакшена"
echo -e "  ${GREEN}5)${NC} Устранение проблем с установкой зависимостей"
echo -e "  ${GREEN}0)${NC} Выход"
echo -e ""

read -p "Ваш выбор: " choice

case $choice in
    1)
        echo -e "\n${YELLOW}Запуск в режиме разработки...${NC}"
        npm run dev
        ;;
    2)
        echo -e "\n${YELLOW}Сборка и запуск Docker-контейнера...${NC}"
        npm run docker:build && npm run docker:run
        ;;
    3)
        echo -e "\n${YELLOW}Установка зависимостей и настройка проекта...${NC}"
        npm run setup
        echo -e "\n${GREEN}Установка завершена!${NC}"
        echo -e "Теперь вы можете запустить проект с помощью команды ${BLUE}npm run dev${NC}"
        ;;
    4)
        echo -e "\n${YELLOW}Сборка проекта для продакшена...${NC}"
        npm run build
        echo -e "\n${GREEN}Сборка завершена!${NC}"
        echo -e "Собранный проект находится в директории ${BLUE}build/${NC}"
        ;;
    5)
        echo -e "\n${YELLOW}Выберите способ решения проблем:${NC}"
        echo -e "  ${GREEN}1)${NC} Использовать флаг --legacy-peer-deps"
        echo -e "  ${GREEN}2)${NC} Использовать yarn вместо npm"
        echo -e "  ${GREEN}3)${NC} Исправить уязвимости с помощью npm audit fix"
        echo -e "  ${GREEN}0)${NC} Назад"
        echo -e ""
        
        read -p "Ваш выбор: " troubleshoot_choice
        
        case $troubleshoot_choice in
            1)
                echo -e "\n${YELLOW}Установка с флагом --legacy-peer-deps...${NC}"
                npm install --legacy-peer-deps
                echo -e "\n${GREEN}Установка завершена!${NC}"
                ;;
            2)
                echo -e "\n${YELLOW}Проверка наличия yarn...${NC}"
                if ! command -v yarn &> /dev/null; then
                    echo -e "${YELLOW}Yarn не установлен. Установка yarn...${NC}"
                    npm install -g yarn
                fi
                echo -e "\n${YELLOW}Установка зависимостей с помощью yarn...${NC}"
                yarn install
                echo -e "\n${GREEN}Установка завершена!${NC}"
                ;;
            3)
                echo -e "\n${YELLOW}Исправление уязвимостей с помощью npm audit fix...${NC}"
                npm audit fix
                echo -e "\n${GREEN}Исправление завершено!${NC}"
                ;;
            0)
                exec "$0"
                ;;
            *)
                echo -e "\n${RED}Неправильный выбор.${NC}"
                exit 1
                ;;
        esac
        ;;
    0)
        echo -e "\n${GREEN}Выход.${NC}"
        exit 0
        ;;
    *)
        echo -e "\n${RED}Неправильный выбор.${NC}"
        exit 1
        ;;
esac
