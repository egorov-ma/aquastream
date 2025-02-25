#!/bin/bash

# Вывод текста с заданным цветом
print_colored_text() {
    local color_code=$1
    local text=$2
    echo -e "\033[${color_code}m${text}\033[0m"
}

# Функция для вывода подсказки
show_help() {
    echo "Использование: $0 [опции]"
    echo "Опции:"
    echo "  -h, --help            Показать эту подсказку"
    echo "  -s, --service СЕРВИС  Сделать резервную копию только указанного сервиса (например: postgres)"
    echo "  -o, --output DIR      Директория для сохранения резервных копий (по умолчанию: ./backups)"
    echo "  -c, --compress        Сжать резервные копии для экономии места"
    echo "  -d, --db-only         Резервное копирование только баз данных"
    echo "  -v, --volumes-only    Резервное копирование только томов"
    echo "  -f, --filename ИМЯ    Пользовательское имя файла резервной копии"
    echo "  -n, --no-timestamp    Не добавлять временную метку к имени резервной копии"
    echo
    echo "Примеры:"
    echo "  $0                   Резервное копирование всех данных"
    echo "  $0 -s postgres       Резервное копирование только PostgreSQL"
    echo "  $0 -c                Резервное копирование с компрессией"
    echo "  $0 -o /mnt/backups   Сохранить резервные копии в указанной директории"
}

# Инициализация переменных
SERVICE=""
OUTPUT_DIR="./backups"
COMPRESS=false
DB_ONLY=false
VOLUMES_ONLY=false
CUSTOM_FILENAME=""
NO_TIMESTAMP=false

# Получение текущей даты и времени
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -c|--compress)
            COMPRESS=true
            shift
            ;;
        -d|--db-only)
            DB_ONLY=true
            shift
            ;;
        -v|--volumes-only)
            VOLUMES_ONLY=true
            shift
            ;;
        -f|--filename)
            CUSTOM_FILENAME="$2"
            shift 2
            ;;
        -n|--no-timestamp)
            NO_TIMESTAMP=true
            shift
            ;;
        *)
            print_colored_text "31" "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Переход в директорию со скриптом
cd "$(dirname "$0")"

# Создание директории для резервных копий
mkdir -p "$OUTPUT_DIR"

# Формирование команды docker compose
CMD="docker compose -f ../compose/docker-compose.yml -f ../compose/docker-compose.override.yml"

# Функция для резервного копирования PostgreSQL
backup_postgres() {
    local db_container="aquastream-postgres"
    local db_user="postgres"
    local db_name="aquastream"
    
    if [ "$NO_TIMESTAMP" = true ] && [ -n "$CUSTOM_FILENAME" ]; then
        local backup_filename="${OUTPUT_DIR}/${CUSTOM_FILENAME}"
    else
        local backup_filename="${OUTPUT_DIR}/postgres_${TIMESTAMP}.sql"
        if [ -n "$CUSTOM_FILENAME" ]; then
            backup_filename="${OUTPUT_DIR}/${CUSTOM_FILENAME}_${TIMESTAMP}.sql"
        fi
    fi
    
    print_colored_text "36" "Создание резервной копии PostgreSQL (БД: $db_name)..."
    
    if [ "$COMPRESS" = true ]; then
        backup_filename="${backup_filename}.gz"
        if ! docker exec -t "$db_container" pg_dump -U "$db_user" "$db_name" | gzip > "$backup_filename"; then
            print_colored_text "31" "Ошибка при создании резервной копии PostgreSQL!"
            return 1
        fi
    else
        if ! docker exec -t "$db_container" pg_dump -U "$db_user" "$db_name" > "$backup_filename"; then
            print_colored_text "31" "Ошибка при создании резервной копии PostgreSQL!"
            return 1
        fi
    fi
    
    print_colored_text "32" "Резервная копия PostgreSQL создана: $backup_filename"
    return 0
}

# Функция для резервного копирования томов
backup_volumes() {
    local volume_name
    
    if [ "$NO_TIMESTAMP" = true ] && [ -n "$CUSTOM_FILENAME" ]; then
        local backup_filename="${OUTPUT_DIR}/${CUSTOM_FILENAME}"
    else
        local backup_filename="${OUTPUT_DIR}/volumes_${TIMESTAMP}.tar"
        if [ -n "$CUSTOM_FILENAME" ]; then
            backup_filename="${OUTPUT_DIR}/${CUSTOM_FILENAME}_${TIMESTAMP}.tar"
        fi
    fi
    
    if [ -n "$SERVICE" ]; then
        # Поиск томов для указанного сервиса
        print_colored_text "36" "Поиск томов для сервиса $SERVICE..."
        
        # Получаем список томов для указанного сервиса
        local service_volumes=$(docker volume ls --filter "name=aquastream_${SERVICE}" --format "{{.Name}}")
        
        if [ -z "$service_volumes" ]; then
            print_colored_text "33" "Томы для сервиса $SERVICE не найдены!"
            return 1
        fi
        
        print_colored_text "36" "Создание резервной копии томов сервиса $SERVICE..."
        
        # Создание временной директории для резервного копирования
        local temp_dir=$(mktemp -d)
        
        for volume_name in $service_volumes; do
            print_colored_text "36" "Копирование тома $volume_name..."
            local volume_dir="${temp_dir}/${volume_name}"
            mkdir -p "$volume_dir"
            
            # Создание временного контейнера для копирования данных из тома
            docker run --rm -v "${volume_name}:/source" -v "${temp_dir}:/backup" alpine \
                sh -c "cp -a /source/. /backup/${volume_name}/"
        done
        
        # Создание архива с томами
        print_colored_text "36" "Создание архива с томами..."
        
        if [ "$COMPRESS" = true ]; then
            backup_filename="${backup_filename}.gz"
            tar -czf "$backup_filename" -C "$temp_dir" .
        else
            tar -cf "$backup_filename" -C "$temp_dir" .
        fi
        
        # Удаление временной директории
        rm -rf "$temp_dir"
        
    else
        # Резервное копирование всех томов
        print_colored_text "36" "Создание резервной копии всех томов..."
        
        # Получаем список всех томов, связанных с проектом
        local volumes=$(docker volume ls --filter "name=aquastream" --format "{{.Name}}")
        
        if [ -z "$volumes" ]; then
            print_colored_text "33" "Томы проекта не найдены!"
            return 1
        fi
        
        # Создание временной директории для резервного копирования
        local temp_dir=$(mktemp -d)
        
        for volume_name in $volumes; do
            print_colored_text "36" "Копирование тома $volume_name..."
            local volume_dir="${temp_dir}/${volume_name}"
            mkdir -p "$volume_dir"
            
            # Создание временного контейнера для копирования данных из тома
            docker run --rm -v "${volume_name}:/source" -v "${temp_dir}:/backup" alpine \
                sh -c "cp -a /source/. /backup/${volume_name}/"
        done
        
        # Создание архива с томами
        print_colored_text "36" "Создание архива с томами..."
        
        if [ "$COMPRESS" = true ]; then
            backup_filename="${backup_filename}.gz"
            tar -czf "$backup_filename" -C "$temp_dir" .
        else
            tar -cf "$backup_filename" -C "$temp_dir" .
        fi
        
        # Удаление временной директории
        rm -rf "$temp_dir"
    fi
    
    print_colored_text "32" "Резервная копия томов создана: $backup_filename"
    return 0
}

# Выполнение резервного копирования
print_colored_text "36" "=== Резервное копирование данных проекта AquaStream ==="
print_colored_text "36" "Директория для сохранения резервных копий: $OUTPUT_DIR"

# Резервное копирование баз данных
if [ "$VOLUMES_ONLY" != true ]; then
    if [ -z "$SERVICE" ] || [ "$SERVICE" = "postgres" ]; then
        backup_postgres
    fi
fi

# Резервное копирование томов
if [ "$DB_ONLY" != true ]; then
    backup_volumes
fi

print_colored_text "32" "=== Резервное копирование успешно завершено ===" 