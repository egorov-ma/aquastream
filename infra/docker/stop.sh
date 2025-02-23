#!/bin/bash

# Переход в директорию со скриптом
cd "$(dirname "$0")"

echo "Остановка проекта..."
if docker-compose down; then
  echo "Контейнеры остановлены успешно."
else
  echo "Ошибка при остановке контейнеров." >&2
fi

echo "Проверка статуса контейнеров:"
docker-compose ps 