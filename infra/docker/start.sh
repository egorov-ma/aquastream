#!/bin/bash

# Переход в директорию со скриптом, чтобы docker-compose.yml был доступен
cd "$(dirname "$0")"

echo "Первичный запуск проекта..."
# Остановка контейнеров и удаление осиротевших
docker-compose down --remove-orphans

echo "Сборка Docker образов..."
docker-compose build

echo "Запуск контейнеров в фоновом режиме..."
docker-compose up -d

echo "Проект запущен. Статус контейнеров:"
docker-compose ps 