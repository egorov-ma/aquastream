#!/bin/bash

# Переход в директорию, где находится файл docker-compose.yml
cd "$(dirname "$0")"

COMPOSE_FILE="docker-compose.yml"
echo "Выполняется проверка контейнеров с использованием файла: $COMPOSE_FILE"
output=$(docker-compose -f "$COMPOSE_FILE" ps)
echo "$output"
echo 

# Ожидаемые контейнеры и их портовые маппинги (часть строки, например "3000->80")
declare -A required_containers=(
  ["aquastream-frontend"]="3000->80"
  ["aquastream-api"]="8080->8080"
  ["aquastream-crew"]="8083->8083"
  ["aquastream-notification"]="8084->8084"
  ["aquastream-planning"]="8082->8082"
  ["aquastream-user"]="8081->8081"
  ["aquastream-postgres"]="5432->5432"
  ["aquastream-zookeeper"]="2181"
  ["aquastream-kafka"]="9092->9092"
  ["aquastream-prometheus"]="9091->9090"
  ["aquastream-grafana"]="3001->3000"
)

error=0

echo "Проверка обязательных контейнеров:"
for container in "${!required_containers[@]}"; do
    expected_port="${required_containers[$container]}"
    # Находим строку с именем контейнера в выводе docker-compose ps
    line=$(echo "$output" | grep -F "$container")
    if [ -z "$line" ]; then
        echo "[ERROR] Контейнер $container не найден!"
        error=1
    else
        # Проверяем, что контейнер в состоянии "Up"
        if ! echo "$line" | grep -q "Up"; then
            echo "[ERROR] Контейнер $container найден, но не работает (не в состоянии 'Up')!"
            error=1
        fi
        # Проверяем наличие ожидаемого отображения портов
        if ! echo "$line" | grep -q "$expected_port"; then
            echo "[ERROR] Для контейнера $container ожидаемые порты '$expected_port' не найдены. Строка: $line"
            error=1
        fi
    fi
done

if [ $error -ne 0 ]; then
    echo "Проверка состояния контейнеров обнаружила ошибки."
    exit 1
else
    echo "Все необходимые контейнеры запущены и их порты соответствуют ожидаемым значениям."
    exit 0
fi 