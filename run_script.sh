#!/bin/bash
# Скрипт для запуска других скриптов из новой директории
# Используйте: ./run_script.sh <имя_скрипта> [аргументы]

# Определяем корневую директорию проекта и директорию скриптов
PROJECT_ROOT="/Users/egorovma/IdeaProjects/aquastream"
SCRIPT_DIR="${PROJECT_ROOT}/scripts"

# Переходим в корневую директорию проекта
cd "$PROJECT_ROOT" || { echo "Ошибка: не могу перейти в директорию ${PROJECT_ROOT}"; exit 1; }

# Функция для отображения подробной справки
show_help() {
  echo "Использование: $0 <имя_скрипта|команда> [аргументы]"
  echo
  echo "Команды:"
  echo "  help                    Показать эту справку"
  echo "  list                    Показать список доступных скриптов"
  echo
  echo "Опции:"
  echo "  -h, --help              Показать эту справку"
  echo
  echo "Доступные скрипты:"
  for script in "$SCRIPT_DIR"/*.sh; do
    basename "${script%.sh}"
  done
  echo
  echo "Примеры:"
  echo "  $0 status               Запустить скрипт status.sh"
  echo "  $0 build --help         Показать справку по скрипту build.sh"
  echo "  $0 help                 Показать эту справку"
  echo "  $0 list                 Показать список доступных скриптов"
  echo
  echo "Справка по конкретному скрипту: $0 <имя_скрипта> --help"
  exit 0
}

# Функция для отображения списка скриптов
list_scripts() {
  echo "Доступные скрипты:"
  for script in "$SCRIPT_DIR"/*.sh; do
    basename "${script%.sh}"
  done
  exit 0
}

# Если нет аргументов или указан флаг help, показываем справку
if [ $# -eq 0 ]; then
  show_help
fi

# Проверяем первый аргумент на команды help и list
if [ "$1" = "help" ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  show_help
fi

if [ "$1" = "list" ]; then
  list_scripts
fi

SCRIPT="$1"
shift

# Добавляем расширение .sh, если его нет
if [[ ! "$SCRIPT" == *.sh ]]; then
  SCRIPT_WITH_EXT="${SCRIPT}.sh"
else
  SCRIPT_WITH_EXT="$SCRIPT"
fi

if [ ! -f "$SCRIPT_DIR/$SCRIPT_WITH_EXT" ]; then
  echo "Ошибка: Скрипт $SCRIPT не найден"
  echo "Доступные скрипты:"
  for script in "$SCRIPT_DIR"/*.sh; do
    basename "${script%.sh}"
  done
  exit 1
fi

# Создаем временную символическую ссылку в корне проекта
TEMP_SCRIPT_LINK="${PROJECT_ROOT}/${SCRIPT_WITH_EXT}"
ln -sf "${SCRIPT_DIR}/${SCRIPT_WITH_EXT}" "${TEMP_SCRIPT_LINK}"

# Запускаем требуемый скрипт через символическую ссылку с переданными аргументами
"${TEMP_SCRIPT_LINK}" "$@"
STATUS=$?

# Удаляем временную символическую ссылку
rm -f "${TEMP_SCRIPT_LINK}"

# Возвращаем статус выполнения скрипта
exit $STATUS 