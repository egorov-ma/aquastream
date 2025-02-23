#!/bin/bash

# Переход в директорию со скриптом
cd "$(dirname "$0")"

echo "Остановка проекта..."
docker-compose down

echo "Проект остановлен. Проверка статуса контейнеров:"
docker-compose ps 