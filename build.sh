#!/bin/bash
# Скрипт для сборки проекта (backend и frontend)
# При возникновении ошибки скрипт завершается (set -e)
set -e

# Переход в директорию, где расположен скрипт (корень проекта)
cd "$(dirname "$0")"

echo "Сборка Backend..."
# Собираем backend с помощью Gradle Wrapper
./gradlew clean build

echo "Сборка Frontend..."
# Переходим в директорию frontend
cd frontend
# Устанавливаем зависимости и собираем проект
npm install
npm run build

# Возвращаемся в корневую директорию
cd ..

echo "Сборка проекта завершена." 