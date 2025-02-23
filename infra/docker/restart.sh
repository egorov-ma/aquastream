#!/bin/bash

# Определяем файл для логирования ошибок
LOGFILE="$(dirname "$0")/restart.log"
touch "$LOGFILE"

# Функция для логирования ошибок
log_error() {
  echo "[ERROR] $(date +'%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGFILE"
}

# Перехват ошибок: при возникновении ошибки выводим сообщение и продолжаем выполнение
trap 'log_error "Ошибка на строке $LINENO. Скрипт прекращает выполнение."' ERR

echo "Перезапуск проекта: остановка контейнеров..."
if ! docker-compose down; then
  log_error "Не удалось остановить контейнеры!"
fi

echo "Удаление старых образов..."
docker images -q aquastream-* | xargs -r docker rmi || log_error "Ошибка при удалении старых Docker образов."

echo "Сборка Docker образов..."
if ! docker-compose build; then
  log_error "Ошибка при сборке Docker образов!"
fi

echo "Запуск контейнеров в фоновом режиме..."
if ! docker-compose up -d; then
  log_error "Ошибка при запуске контейнеров!"
fi

echo "Статус запущенных контейнеров:"
docker-compose ps 