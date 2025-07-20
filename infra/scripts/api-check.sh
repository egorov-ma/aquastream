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