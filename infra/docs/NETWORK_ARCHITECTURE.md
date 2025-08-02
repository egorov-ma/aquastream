# Сетевая архитектура AquaStream

## Обзор архитектуры

AquaStream использует многосегментную сетевую архитектуру с Nginx в качестве единой точки входа и изолированными контейнерными сетями для разных типов сервисов.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Internet                                      │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Nginx Reverse Proxy                                  │
│                       (ports: 80, 443)                                     │
│                     SSL Termination & Security                             │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ public-network   │ │  api-network     │ │monitoring-network│
│ (172.20.0.0/24)  │ │ (172.21.0.0/24)  │ │ (172.23.0.0/24)  │
│                  │ │                  │ │                  │
│ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌──────────────┐ │
│ │   Frontend   │ │ │ │ API Gateway  │ │ │ │   Kibana     │ │
│ │   (port 80)  │ │ │ │ (port 8080)  │ │ │ │ (port 5601)  │ │
│ └──────────────┘ │ │ └──────────────┘ │ │ └──────────────┘ │
│                  │ │                  │ │                  │
│                  │ │ ┌──────────────┐ │ │ ┌──────────────┐ │
│                  │ │ │Microservices │ │ │ │  Grafana     │ │
│                  │ │ │ user:8081    │ │ │ │ (port 3000)  │ │
│                  │ │ │ crew:8083    │ │ │ └──────────────┘ │
│                  │ │ │ event:8082   │ │ │                  │
│                  │ │ │notification  │ │ │ ┌──────────────┐ │
│                  │ │ │    :8084     │ │ │ │ Prometheus   │ │
│                  │ │ └──────────────┘ │ │ │ (port 9090)  │ │
│                  │ │                  │ │ └──────────────┘ │
└──────────────────┘ └──────────────────┘ └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         infra-network (172.22.0.0/24)                      │
│                                                                             │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────────┐  │
│ │   PostgreSQL   │ │     Kafka      │ │ Elasticsearch  │ │   Logstash   │  │
│ │ (port 5432)    │ │ (port 9092)    │ │ (port 9200)    │ │(ports 5000,  │  │
│ └────────────────┘ │ ┌────────────┐ │ └────────────────┘ │    9600)     │  │
│                    │ │ Zookeeper  │ │                    └──────────────┘  │
│                    │ │(port 2181) │ │                                      │
│                    │ └────────────┘ │                                      │
│                    └────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Уровни доступа

### Публичный уровень (External Access)
- **Nginx Reverse Proxy**: Единственная точка входа извне
- **Порты**: 80 (HTTP → HTTPS redirect), 443 (HTTPS)
- **Безопасность**: SSL/TLS, Rate limiting, Basic Auth для monitoring

### Сегментированная архитектура (Network Segmentation)
#### 🌐 Public Network (172.20.0.0/24)
- **Frontend сервисы**: Статический контент и SPA
- **Доступ**: Только через Nginx reverse proxy
- **Безопасность**: Максимальная изоляция

#### 🔗 API Network (172.21.0.0/24)
- **API Gateway**: Центральная точка для API запросов
- **Микросервисы**: user, crew, event, notification
- **Доступ**: Через API Gateway из Nginx
- **Мониторинг**: Prometheus может собирать метрики

#### 🏗️ Infrastructure Network (172.22.0.0/24)
- **База данных**: PostgreSQL
- **Брокер сообщений**: Kafka + Zookeeper  
- **Поисковый движок**: Elasticsearch
- **Обработка логов**: Logstash
- **Доступ**: Только от связанных сервисов

#### 📊 Monitoring Network (172.23.0.0/24)
- **Визуализация логов**: Kibana
- **Дашборды**: Grafana
- **Сбор метрик**: Prometheus
- **Доступ**: Через Nginx с Basic Auth

### Служебный уровень (Development Access)
Для разработки оставлены прямые порты:
- **Kafka**: 19092 (для внешних клиентов)
- **PostgreSQL**: 5432 (для database management)

## Маршрутизация трафика

### Web трафик
```
Browser → Nginx:443 → {
  /                    → frontend:80
  /api/*              → api-gateway:8080 → microservices
  /monitoring/kibana/ → kibana:5601
  /monitoring/grafana/→ grafana:3000
  /monitoring/prometheus/ → prometheus:9090
}
```

### API трафик
```
API Gateway → {
  /api/users/*         → user-service:8081
  /api/crews/*         → crew-service:8083
  /api/events/*        → event-service:8082
  /api/notifications/* → notification-service:8084
}
```

### Логирование
```
Microservices → Logstash:5000 → Elasticsearch:9200 → Kibana:5601
```

### Мониторинг
```
Microservices → Prometheus:9090 → Grafana:3000
```

## Политики безопасности

### Сетевая изоляция
1. **Внешний доступ**: Только через Nginx (порты 80/443)
2. **Сегментированные сети**: 4 изолированные Docker bridge сети
3. **Межсервисная коммуникация**: Только через назначенные сети  
4. **База данных**: Доступна только из infra-network и api-network
5. **Мониторинг**: Изолирован в отдельной monitoring-network

### Контейнерная безопасность
#### 🔐 Security Options
- **no-new-privileges**: Блокировка повышения привилегий
- **cap-drop: ALL**: Удаление всех capabilities
- **cap-add**: Только необходимые capabilities
- **read-only**: Файловая система только для чтения

#### 👤 User Security
- **Non-root users**: Все сервисы запускаются под non-root пользователями
- **Dedicated users**: postgres:postgres, nginx:nginx, etc.
- **User namespaces**: Изоляция UID/GID

#### 📁 Filesystem Security
- **Read-only volumes**: Конфигурации смонтированы как ro
- **tmpfs**: Временные файлы в памяти (noexec, nosuid)
- **Volume permissions**: Строгие права доступа к данным

#### 🛡️ Resource Limits
- **Memory limits**: Ограничения памяти для всех контейнеров
- **CPU limits**: Ограничения CPU
- **ulimits**: Настройки для файловых дескрипторов
- **shm_size**: Ограничения shared memory

### SSL/TLS
- **Терминация SSL**: На уровне Nginx
- **Внутренние соединения**: 
  - Elasticsearch ↔ Kibana: HTTPS
  - Logstash ↔ Elasticsearch: HTTPS
  - Остальные: HTTP (внутри защищенной сети)

### Аутентификация и авторизация
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Public Web    │────▶│  Nginx (Basic)  │────▶│   Monitoring    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   API Clients   │────▶│  API Gateway    │────▶│  Microservices  │
│                 │     │  (JWT/OAuth)    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   ELK Stack     │────▶│  Elasticsearch  │────▶│     Kibana      │
│                 │     │  (X-Pack Auth)  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Мониторинг сети

### Health Checks
Каждый сервис имеет health check endpoint:
- **Frontend**: `/`
- **API Gateway**: `/actuator/health`
- **Microservices**: `/actuator/health`
- **Elasticsearch**: `/_cluster/health`
- **Kibana**: `/api/status`
- **Prometheus**: `/`
- **Grafana**: `/api/health`
- **Nginx**: `/health`

### Network Monitoring
```bash
# Проверка сетевой связности
docker network inspect aquastream_aquastream-network

# Статистика трафика через Nginx
docker exec aquastream-nginx-1 cat /var/log/nginx/access.log

# Проверка межсервисного взаимодействия
docker exec aquastream-api-gateway-1 curl http://user-service:8081/actuator/health
```

## Ports Summary

### External Ports (Host → Container)
| Service | Host Port | Container Port | Protocol | Access |
|---------|-----------|----------------|----------|---------|
| Nginx | 80 | 80 | HTTP | Public (redirect to HTTPS) |
| Nginx | 443 | 443 | HTTPS | Public |
| Kafka | 19092 | 19092 | TCP | Development |
| PostgreSQL | 5432 | 5432 | TCP | Development |

### Internal Ports (Container → Container)
| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| frontend | 80 | HTTP | Web server |
| api-gateway | 8080 | HTTP | API Gateway |
| user-service | 8081 | HTTP | User API |
| event-service | 8082 | HTTP | Event API |
| crew-service | 8083 | HTTP | Crew API |
| notification-service | 8084 | HTTP | Notification API |
| elasticsearch | 9200 | HTTPS | Search engine |
| kibana | 5601 | HTTPS | Log visualization |
| logstash | 5000, 9600 | TCP, HTTP | Log processing |
| prometheus | 9090 | HTTP | Metrics collection |
| grafana | 3000 | HTTP | Metrics visualization |
| kafka | 9092 | TCP | Message broker (internal) |
| zookeeper | 2181 | TCP | Kafka coordination |

## Volumes и Storage

### Persistent Volumes
```yaml
volumes:
  postgres_data:        # База данных
  elasticsearch_data:   # Индексы поиска
  elasticsearch_certs:  # SSL сертификаты
  zookeeper_data:      # Kafka метаданные
  kafka_data:          # Сообщения Kafka
  nginx_logs:          # Логи Nginx
```

### Backup Strategy
1. **Database**: Регулярные дампы PostgreSQL
2. **Logs**: Ротация и архивирование через Elasticsearch
3. **Configuration**: Version control в Git
4. **Certificates**: Backup SSL сертификатов

## Развертывание и масштабирование

### Horizontal Scaling
Для масштабирования можно добавить:
- Несколько экземпляров API Gateway за Nginx load balancer
- Replica sets для микросервисов
- Elasticsearch cluster вместо single node
- Redis для кеширования сессий

### High Availability
Для production среды рекомендуется:
- Несколько экземпляров Nginx за внешним load balancer
- Database clustering (PostgreSQL HA)
- Kafka cluster с несколькими brokers
- External certificate management (Let's Encrypt)

## Устранение неполадок

### Сетевые проблемы
```bash
# Проверка Docker сети
docker network ls
docker network inspect aquastream_aquastream-network

# Проверка DNS разрешения
docker exec aquastream-nginx-1 nslookup api-gateway

# Проверка портов
docker exec aquastream-api-gateway-1 netstat -tlnp
```

### Connectivity Issues
```bash
# Тест связности между сервисами
docker exec aquastream-nginx-1 curl -f http://api-gateway:8080/actuator/health
docker exec aquastream-api-gateway-1 curl -f http://user-service:8081/actuator/health

# Проверка Nginx upstream
docker exec aquastream-nginx-1 nginx -T | grep upstream -A 5
```