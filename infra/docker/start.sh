#!/bin/bash

# Переход в директорию со скриптом, чтобы docker-compose.yml был доступен
cd "$(dirname "$0")"

echo "Запуск проекта..."
docker-compose build
docker-compose up -d

echo "Статус запущенных контейнеров:"
docker-compose ps 