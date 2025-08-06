# AquaStream Infrastructure

## Обзор

Этот каталог содержит инфраструктурную конфигурацию платформы AquaStream, включая Docker, мониторинг и конфигурации развертывания с усиленной безопасностью.

В `docker/compose` находятся два файла:
- `docker-compose.dev.yml` — минимальный набор сервисов для разработки;
- `docker-compose.full.yml` — полный стек с мониторингом и прочей инфраструктурой.

## Архитектура

AquaStream использует многоуровневую архитектуру с Nginx reverse proxy в качестве единой точки входа:

```
Internet → Nginx (HTTPS) → Internal Docker Network → Microservices
```

## Структура

```
infra/
├── docker/
│   ├── compose/
│   │   ├── docker-compose.dev.yml  # Лёгкая конфигурация для разработки
│   │   ├── docker-compose.full.yml # Полный стек со всеми сервисами
│   │   └── .env                    # Переменные окружения
│   └── images/
│       ├── Dockerfile.nginx        # Reverse proxy
│       ├── Dockerfile.backend-*    # Микросервисы
│       └── Dockerfile.frontend     # Веб-интерфейс
├── monitoring/
│   ├── nginx/                      # Конфигурация Nginx
│   ├── grafana/                    # Дашборды мониторинга
│   ├── prometheus/                 # Сбор метрик
│   └── logstash/                   # Обработка логов
├── docs/                           # Документация
│   ├── REVERSE_PROXY_NGINX.md      # Nginx reverse proxy
│   ├── ELASTICSEARCH_SECURITY.md   # Безопасность ELK
│   └── NETWORK_ARCHITECTURE.md     # Сетевая архитектура
└── README.md
```

## Быстрый старт

1. Сборка и запуск:
   ```bash
   ./run.sh build -f    # Полная сборка
   ./run.sh start       # Запуск всех сервисов
   ```

2. Проверка статуса:
   ```bash
   ./run.sh status      # Статус контейнеров
   ./run.sh logs        # Просмотр логов
   ```

3. Остановка:
   ```bash
   ./run.sh stop        # Остановка и очистка
   ```

## Доступ к сервисам

### 🌐 Публичные endpoints (через Nginx)
- **Веб-приложение**: https://localhost/
- **API**: https://localhost/api/
- **Мониторинг**: https://localhost/monitoring/ (требует авторизации)

### 🔐 Авторизация
- **Мониторинг** (Basic Auth): `admin:monitoring123`
- **Elasticsearch**: `elastic:<ELASTIC_PASSWORD>`
- **Grafana**: `admin:admin`

### 🛠️ Для разработки (прямой доступ)
- **PostgreSQL**: localhost:5432
- **Kafka**: localhost:19092

## Сервисы

### Основные сервисы
- **🔄 Nginx**: Reverse proxy, SSL терминация, безопасность
- **🚪 API Gateway**: Маршрутизация API и аутентификация
- **👤 User Service**: Управление пользователями
- **📅 Event Service**: Обработка событий
- **👥 Crew Service**: Управление командами
- **🔔 Notification Service**: Уведомления и алерты
- **🖥️ Frontend**: React веб-интерфейс

### Инфраструктура
- **🗄️ PostgreSQL**: Основная база данных
- **📨 Kafka**: Брокер сообщений
- **🔍 Elasticsearch**: Поиск и аналитика (с xpack.security)
- **📊 Grafana**: Дашборды мониторинга
- **📈 Prometheus**: Сбор метрик
- **📝 Kibana**: Визуализация логов
- **🔄 Logstash**: Обработка логов

## Безопасность

### ✅ Реализованные меры безопасности
- **SSL/TLS**: Шифрование всех соединений
- **Nginx Reverse Proxy**: Единая точка входа
- **Elasticsearch Security**: X-Pack аутентификация и SSL
- **Network Segmentation**: 4 изолированные Docker сети
- **Container Security**: no-new-privileges, cap-drop, read-only FS
- **Rate Limiting**: Защита от DDoS
- **Security Headers**: HSTS, XSS Protection, и др.
- **Basic Auth**: Защита мониторинг endpoints
- **Non-root Users**: Все сервисы под non-root пользователями

### 🔒 Закрытые порты
Прямой доступ к следующим сервисам **закрыт**:
- Elasticsearch (9200)
- Kibana (5601)
- Grafana (3000)
- Prometheus (9090)
- API Gateway (8080)
- Frontend (3000)

## Мониторинг

### Endpoints мониторинга
- **Grafana**: https://localhost/monitoring/grafana/
- **Prometheus**: https://localhost/monitoring/prometheus/
- **Kibana**: https://localhost/monitoring/kibana/
- **Nginx Health**: https://localhost/health

### Логирование
- **Центральное логирование**: ELK Stack
- **Структурированные логи**: JSON формат
- **SSL защита**: Логи передаются по HTTPS
- **Ротация**: Автоматическая ротация логов

## Документация

Подробная документация доступна в каталоге `docs/`:

- **[REVERSE_PROXY_NGINX.md](docs/REVERSE_PROXY_NGINX.md)**: Конфигурация Nginx reverse proxy
- **[ELASTICSEARCH_SECURITY.md](docs/ELASTICSEARCH_SECURITY.md)**: Настройка безопасности ELK
- **[NETWORK_ARCHITECTURE.md](docs/NETWORK_ARCHITECTURE.md)**: Сетевая архитектура
- **[PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)**: Общая документация проекта

## Среды развертывания

### Development
```bash
# Все порты открыты для разработки
export ENV=development
./run.sh start
```

### Production
```bash
# Только Nginx доступен извне
export ENV=production
# Смените пароли в .env файле
./run.sh start
```

## Устранение неполадок

### Проблемы с сетью
```bash
# Проверка Docker сети
docker network inspect aquastream_aquastream-network

# Проверка статуса сервисов
./run.sh status
```

### Проблемы с SSL
```bash
# Проверка сертификатов
docker exec aquastream-nginx-1 openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout
```

### Логи и отладка
```bash
# Логи конкретного сервиса
./run.sh logs nginx
./run.sh logs api-gateway

# Проверка health checks
curl -k https://localhost/health
```

## Требования

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **RAM**: минимум 5GB для всех сервисов (оптимизировано для небольшой нагрузки)
- **CPU**: минимум 4 ядра (рекомендуется)
- **Disk**: минимум 10GB свободного места

### 📊 Распределение ресурсов
- **Elasticsearch**: 1.5GB RAM, 0.8 CPU (поисковый движок)
- **PostgreSQL**: 768MB RAM, 0.6 CPU (основная БД)
- **Инфраструктура**: 1.9GB RAM, 1.8 CPU (Kafka, мониторинг, прокси)
- **Микросервисы**: 384MB RAM, 0.3 CPU (JVM приложения)

## Поддержка

При возникновении проблем:
1. Проверьте логи: `./run.sh logs`
2. Проверьте статус: `./run.sh status`
3. Обратитесь к документации в `docs/`
4. Создайте issue в репозитории 