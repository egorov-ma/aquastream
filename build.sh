#!/bin/bash
# Скрипт для сборки проекта (backend и frontend)
# При возникновении ошибки скрипт завершается (set -e)
set -e

# Переход в корневую директорию проекта
cd "$(dirname "$0")"

# Проверка наличия файла settings.gradle в корневой директории
if [ ! -f "settings.gradle" ]; then
  echo "Ошибка: скрипт должен быть запущен из корневой директории проекта."
  exit 1
fi

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