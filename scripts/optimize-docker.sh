#!/bin/bash

# Скрипт для обновления Docker-образов
# Данный скрипт создает оптимизированные Docker-образы для всех компонентов проекта

# Переходим в корневую директорию проекта
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

# Цветовые коды для вывода
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Функция для вывода сообщений
log() {
  echo -e "${GREEN}[$(date "+%Y-%m-%d %H:%M:%S")]${NC} $1"
}

error() {
  echo -e "${RED}[ОШИБКА]${NC} $1"
  exit 1
}

warning() {
  echo -e "${YELLOW}[ПРЕДУПРЕЖДЕНИЕ]${NC} $1"
}

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
  error "Docker не установлен. Пожалуйста, установите Docker и попробуйте снова."
fi

# Сборка фронтенда
build_frontend() {
  log "Сборка оптимизированного образа фронтенда..."
  # Собираем образ из корневой директории
  docker build -t aquastream-frontend:v2 -f infra/docker/images/Dockerfile.frontend . || error "Не удалось собрать образ фронтенда"
  log "Образ фронтенда успешно собран (размер: $(docker image ls aquastream-frontend:v2 --format '{{.Size}}'))"
}

# Основная логика
log "Начинаем сборку оптимизированных Docker-образов"

# Сборка компонентов
build_frontend

log "Все образы успешно собраны!"
log "Для запуска фронтенда выполните: docker run -d -p 3000:80 --name aquastream-frontend aquastream-frontend:v2"

exit 0 