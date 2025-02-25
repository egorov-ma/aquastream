# Обновления скриптов управления Docker

## Обзор изменений

В рамках улучшения инфраструктуры Docker проекта AquaStream были внесены следующие ключевые изменения:

1. **Усовершенствована система зависимостей между сервисами**
   - Добавлены явные зависимости между контейнерами
   - Реализовано поэтапное развертывание с ожиданием готовности критических сервисов
   - Обеспечен правильный порядок запуска сервисов

2. **Улучшена система проверки работоспособности**
   - Добавлены проверки HTTP-эндпоинтов через Frontend-прокси
   - Реализована проверка зависимостей между контейнерами
   - Добавлено отображение подробных логов при ошибках

3. **Создан новый инструмент быстрой диагностики**
   - Разработан новый скрипт `api-check.sh` для оперативной проверки ключевых сервисов
   - Реализованы детальные проверки сетевых настроек и конфигурации
   - Улучшено отображение результатов с цветовой дифференциацией

4. **Улучшена документация**
   - Обновлены описания и примеры использования всех скриптов
   - Добавлена подробная документация по диагностике типичных проблем
   - Создана детальная справка по новому скрипту `api-check.sh`

## Подробное описание изменений

### 1. Улучшения в скрипте restart.sh

#### Рациональный порядок запуска сервисов

Изменен порядок запуска контейнеров для обеспечения правильной последовательности инициализации:

```bash
# Порядок запуска:
1. Базовые сервисы (postgres, zookeeper)
2. Ожидание готовности PostgreSQL
3. Запуск Kafka
4. Ожидание готовности Kafka
5. Запуск микросервисов (user, crew, notification, planning)
6. Ожидание запуска микросервисов
7. Запуск API Gateway
8. Ожидание запуска API Gateway
9. Запуск фронтенда и сервисов мониторинга
```

#### Ожидание готовности сервисов

Добавлено ожидание полной готовности критических сервисов перед запуском зависимых сервисов:

```bash
# Пример ожидания готовности PostgreSQL
max_attempts=30
attempts=0
while ! $CMD exec postgres pg_isready -U postgres &>/dev/null; do
    attempts=$((attempts+1))
    if [ $attempts -ge $max_attempts ]; then
        log_message "ERROR" "PostgreSQL не готов после $max_attempts попыток!"
        break
    fi
    sleep 1
done
```

#### Усовершенствованная система отображения статуса

Добавлено более подробное отображение статуса всех контейнеров после перезапуска:

```bash
# Отображение статуса всех контейнеров, включая остановленные
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

### 2. Улучшения в скрипте check.sh

#### Обновленные URL для HTTP-проверок

Изменены URL адреса для HTTP-проверок, чтобы использовать проксирование через Frontend:

```bash
http_urls=(
  "http://localhost:3000"
  "http://localhost:3000/api/actuator/health"
  "http://localhost:8083/api/crew/health"
  "http://localhost:8084/api/notification/health"
  "http://localhost:8082/api/planning/health"
)
```

#### Система проверки зависимостей

Добавлена система для проверки зависимостей между контейнерами:

```bash
# Зависимости между контейнерами
container_dependencies=(
  "aquastream-frontend:aquastream-api"
  "aquastream-api:aquastream-user"
  "aquastream-api:aquastream-crew"
  "aquastream-api:aquastream-notification"
  "aquastream-api:aquastream-planning"
  "aquastream-user:aquastream-postgres"
  "aquastream-crew:aquastream-postgres"
  "aquastream-notification:aquastream-postgres"
  "aquastream-notification:aquastream-kafka"
  "aquastream-kafka:aquastream-zookeeper"
)

# Функция для проверки зависимостей контейнера
check_container_dependencies() {
  local container=$1
  local has_dependency=false
  
  for dep in "${container_dependencies[@]}"; do
    local dependent="${dep%%:*}"
    local dependency="${dep##*:}"
    
    if [ "$dependent" = "$container" ]; then
      has_dependency=true
      
      # Проверяем, запущен ли контейнер, от которого зависит
      if ! docker ps --format "{{.Names}}" | grep -q "$dependency"; then
        print_colored_text "31" "ОШИБКА: Контейнер $container зависит от $dependency, но $dependency не запущен!"
        return 1
      fi
    fi
  done
  
  return 0
}
```

#### Улучшенная проверка контейнеров

Модифицирована функция проверки контейнера для учета зависимостей:

```bash
# Сначала проверим зависимости
if ! check_container_dependencies "$container_name"; then
    print_colored_text "31" "[ERROR] Проблемы с зависимостями для контейнера $container_name!"
    return 1
fi
```

### 3. Новый скрипт api-check.sh

Создан новый скрипт для быстрой диагностики доступности API и Frontend:

```bash
#!/bin/bash

# Определяем цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
print_colored_text() {
    local color_code=$1
    local text=$2
    echo -e "${color_code}${text}${NC}"
}

# Проверка frontend
echo "Проверка доступности frontend (http://localhost:3000)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200"; then
    print_colored_text "$GREEN" "✅ Frontend доступен на http://localhost:3000"
else
    print_colored_text "$RED" "❌ Frontend недоступен на http://localhost:3000"
    print_colored_text "$YELLOW" "Проверьте статус контейнера: docker logs aquastream-frontend"
fi

# Проверка API через frontend
echo "Проверка доступности API через frontend proxy (http://localhost:3000/api/actuator/health)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/actuator/health | grep -q "200"; then
    print_colored_text "$GREEN" "✅ API доступен через frontend proxy на http://localhost:3000/api/actuator/health"
else
    print_colored_text "$RED" "❌ API недоступен через frontend proxy на http://localhost:3000/api/actuator/health"
    print_colored_text "$YELLOW" "Проверьте статус API: docker logs aquastream-api"
    
    # Проверяем прямой доступ к API
    echo "Проверка прямого доступа к API (http://localhost:8080/actuator/health)..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health | grep -q "200"; then
        print_colored_text "$GREEN" "✅ API доступен напрямую на http://localhost:8080/actuator/health"
        print_colored_text "$YELLOW" "👉 Проблема в настройке проксирования в Nginx"
    else
        print_colored_text "$RED" "❌ API недоступен напрямую на http://localhost:8080/actuator/health"
        print_colored_text "$YELLOW" "👉 Проблема с запуском API"
    fi
fi

# Проверка сетевых настроек Docker
echo "Проверка сетевых настроек Docker..."
echo "Контейнеры в сети docker_aquastream-network:"
docker network inspect docker_aquastream-network -f '{{ range .Containers }}{{ .Name }} {{ .IPv4Address }}{{ println }}{{ end }}'

echo "Проверка Nginx-конфигурации в контейнере frontend:"
docker exec -it aquastream-frontend cat /etc/nginx/nginx.conf 2>/dev/null || print_colored_text "$RED" "❌ Не удалось прочитать конфигурацию Nginx"
```

## Как использовать улучшенные скрипты

### Запуск проекта с учетом зависимостей

```bash
# Запуск с полным удалением предыдущего состояния и пересборкой образов
./restart.sh -r -b

# Проверка доступности ключевых сервисов
./api-check.sh

# Полная проверка всех сервисов, включая HTTP-проверки
./check.sh -p
```

### Работа с отдельными сервисами

```bash
# Перезапуск только frontend после изменений
./restart.sh -s frontend -b

# Проверка только сервиса пользователей
./check.sh -s user -p
```

## Заключение

Внесенные улучшения значительно повышают надежность и удобство работы с Docker-инфраструктурой проекта AquaStream. Основные преимущества:

1. **Повышенная надежность запуска** за счет правильного порядка инициализации сервисов
2. **Улучшенная диагностика проблем** благодаря более подробным проверкам и логам
3. **Ускоренная разработка** благодаря быстрым диагностическим инструментам
4. **Подробная документация** для более эффективной работы с проектом 