# Nginx Reverse Proxy Configuration

## Обзор архитектуры

Nginx выступает как единая точка входа для всех веб-сервисов AquaStream, обеспечивая:
- SSL терминацию и шифрование
- Ограничение доступа к внутренним сервисам
- Rate limiting и защиту от DDoS
- Централизованное логирование и мониторинг

## Схема доступа

```
Internet → Nginx (80/443) → Internal Services
```

### Публичные endpoints
- **HTTP**: http://localhost:80 → автоматически перенаправляется на HTTPS
- **HTTPS**: https://localhost:443 → основной доступ

### Маршрутизация

| URL Path | Destination | Description |
|----------|-------------|-------------|
| `/` | frontend:80 | Главное веб-приложение |
| `/api/` | api-gateway:8080 | REST API для всех микросервисов |
| `/monitoring/kibana/` | kibana:5601 | Логи и аналитика (требует авторизации) |
| `/monitoring/grafana/` | grafana:3000 | Метрики и дашборды (требует авторизации) |
| `/monitoring/prometheus/` | prometheus:9090 | Система мониторинга (требует авторизации) |
| `/health` | nginx | Health check endpoint |

## Безопасность

### SSL/TLS конфигурация
- **Протоколы**: TLSv1.2, TLSv1.3
- **Шифры**: Современные ECDHE и DHE шифры
- **HSTS**: Включен с 1 годом действия
- **Сертификаты**: Самоподписанные (для production нужны настоящие)

### Basic Authentication
Мониторинг endpoints защищены Basic Auth:
- **Пользователь**: `admin`
- **Пароль**: `monitoring123`

### Rate Limiting
- **API endpoints**: 100 запросов/минуту на IP
- **Frontend**: 200 запросов/минуту на IP
- **Burst**: разрешается превышение лимитов кратковременно

### HTTP Security Headers
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Конфигурация upstream сервисов

### Load Balancing
```nginx
upstream api-gateway {
    server api-gateway:8080 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

### Health Checks
- **Метод**: Passive health checks
- **Timeout**: 30 секунд
- **Retries**: 3 попытки перед маркировкой как недоступный

## Логирование

### Access Logs
Формат логов включает:
- IP адрес клиента
- Время запроса
- HTTP метод и URL
- Статус ответа
- Размер ответа
- User-Agent
- Время ответа сервера
- Время подключения к upstream

### Расположение логов
```
/var/log/nginx/access.log - логи доступа
/var/log/nginx/error.log  - логи ошибок
```

В Docker контейнере логи сохраняются в volume `nginx_logs`.

## Мониторинг

### Health Check
```bash
curl -f http://localhost/health
# Ответ: "healthy"
```

### Проверка upstream сервисов
```bash
# Через Nginx
curl -k https://localhost/api/actuator/health
curl -k https://localhost/monitoring/grafana/api/health
```

### Статистика Nginx
```bash
# Вход в контейнер
docker exec -it aquastream-nginx-1 sh

# Проверка статуса
nginx -t
nginx -s reload
```

## Управление доступом

### Ограничение по IP (опционально)
В `nginx.conf` можно раскомментировать блок для ограничения доступа к мониторингу:
```nginx
location /monitoring/ {
    allow 127.0.0.1;      # localhost
    allow 10.0.0.0/8;     # внутренняя сеть
    deny all;             # остальные запрещены
    # ...
}
```

### Смена паролей Basic Auth
```bash
# В контейнере nginx
htpasswd -c /etc/nginx/.htpasswd admin
# Введите новый пароль
nginx -s reload
```

## Production рекомендации

### SSL сертификаты
1. Получите настоящие SSL сертификаты от Let's Encrypt или CA
2. Замените самоподписанные сертификаты в `/etc/nginx/ssl/`
3. Настройте автоматическое обновление сертификатов

### Безопасность
1. Смените пароль для monitoring доступа
2. Настройте IP whitelist для административных endpoint'ов
3. Используйте сильные DH parameters (4096 bit)
4. Включите OCSP stapling для SSL

### Производительность
1. Увеличьте `worker_connections` для высокой нагрузки
2. Настройте кеширование статических файлов
3. Включите HTTP/2 push для критических ресурсов
4. Настройте CDN для статических ресурсов

### Мониторинг
1. Интегрируйте логи Nginx с ELK stack
2. Настройте алерты на высокий error rate
3. Мониторьте время ответа upstream сервисов
4. Отслеживайте SSL сертификаты на истечение

## Устранение неполадок

### Nginx не запускается
```bash
# Проверка конфигурации
docker exec aquastream-nginx-1 nginx -t

# Просмотр логов
docker logs aquastream-nginx-1
```

### Upstream недоступен
```bash
# Проверка статуса сервисов
docker compose ps

# Проверка сети
docker exec aquastream-nginx-1 nslookup api-gateway
```

### SSL проблемы
```bash
# Проверка сертификатов
docker exec aquastream-nginx-1 openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Тест SSL соединения
openssl s_client -connect localhost:443 -servername localhost
```

### Rate limiting
```bash
# Просмотр активных ограничений
docker exec aquastream-nginx-1 cat /var/log/nginx/error.log | grep "limiting requests"
```

## Файлы конфигурации

### Основные файлы
- `infra/monitoring/nginx/nginx.conf` - основная конфигурация
- `infra/docker/images/Dockerfile.nginx` - образ контейнера
 - `infra/docker/compose/.env` - переменные окружения (или используйте переменные окружения с `run.sh --use-env`, храните секреты в GitHub Secrets)

### Переменные окружения
```bash
NGINX_HTTP_PORT=80      # HTTP порт
NGINX_HTTPS_PORT=443    # HTTPS порт
```

### Volume mappings
```yaml
volumes:
  - nginx_logs:/var/log/nginx  # Логи nginx
```