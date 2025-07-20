#!/bin/bash
#
# AquaStream - Скрипт для сборки проекта (backend и frontend)
# Версия: 2.0.0
#

# Установка строгого режима
set -eo pipefail

# Определение корневой директории проекта
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Функция для логирования
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Переходим в корневую директорию проекта
cd "$PROJECT_ROOT" || { log "[ERROR] Не могу перейти в директорию ${PROJECT_ROOT}"; exit 1; }

log "[INFO] Начинаем сборку проекта..."

# Проверяем наличие Gradle wrapper
if [ ! -f "$PROJECT_ROOT/gradlew" ]; then
    log "[ERROR] Gradle wrapper не найден!"
    exit 1
fi

# Делаем gradlew исполняемым, если он еще не исполняемый
chmod +x "$PROJECT_ROOT/gradlew"

# Запускаем сборку всех модулей
log "[INFO] Сборка всех бэкенд-модулей..."
"$PROJECT_ROOT/gradlew" clean build -x test || { log "[ERROR] Ошибка при сборке проекта!"; exit 1; }

# Проверяем наличие Node.js и npm
if ! command -v node > /dev/null; then
    log "[ERROR] Node.js не установлен! Требуется для сборки фронтенда"
    exit 1
fi

if ! command -v npm > /dev/null; then
    log "[ERROR] npm не установлен! Требуется для сборки фронтенда"
    exit 1
fi

# Сборка фронтенда
log "[INFO] Начинаем сборку фронтенда..."

# Переходим в директорию frontend
cd "$PROJECT_ROOT/frontend" || { log "[ERROR] Не могу перейти в директорию ${PROJECT_ROOT}/frontend"; exit 1; }

# Проверяем наличие package.json
if [ ! -f "$PROJECT_ROOT/frontend/package.json" ]; then
    log "[ERROR] package.json не найден в директории frontend!"
    exit 1
fi

# Устанавливаем зависимости
log "[INFO] Установка зависимостей фронтенда..."
npm install || { log "[ERROR] Ошибка при установке зависимостей фронтенда!"; exit 1; }

# Собираем фронтенд
log "[INFO] Сборка фронтенда..."
npm run build || { log "[ERROR] Ошибка при сборке фронтенда!"; exit 1; }

# Возвращаемся в корневую директорию
cd "$PROJECT_ROOT" || { log "[ERROR] Не могу перейти в директорию ${PROJECT_ROOT}"; exit 1; }

log "[INFO] Сборка проекта успешно завершена!"

exit 0 