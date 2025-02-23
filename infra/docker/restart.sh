#!/bin/bash

# Переход в директорию со скриптом
cd "$(dirname "$0")"

echo "Перезапуск проекта: остановка контейнеров..."
docker-compose down

echo "Удаление старых образов..."
docker images -q aquastream-* | xargs -r docker rmi

echo "Сборка и запуск проекта..."
docker-compose build
docker-compose up -d

echo "Статус запущенных контейнеров:"
docker-compose ps 