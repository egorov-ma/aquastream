# Инфраструктура

## Обзор

AquaStream использует контейнеризованную инфраструктуру на базе Docker Compose с централизованным управлением через Makefile.

## Архитектура

```
aquastream/
├── backend-infra/          # Инфраструктурные компоненты
│   ├── docker/
│   │   ├── compose/        # Docker Compose конфигурации
│   │   │   ├── docker-compose.yml
│   │   │   ├── docker-compose.override.dev.yml
│   │   │   └── docker-compose.override.stage.yml
│   │   ├── images/         # Dockerfiles для сервисов
│   │   └── scripts/        # Вспомогательные скрипты
│   ├── make/
│   │   └── Makefile        # Центральный Makefile с командами
│   └── backup/             # Скрипты резервного копирования
├── build-logic/            # Gradle convention plugins
└── .github/                # CI/CD workflows
```

## Компоненты инфраструктуры

### Core Services

**PostgreSQL 16**
- **Порт**: 5432
- **Контейнер**: `aquastream-postgres`
- **Volume**: `pgdata` (named volume)
- **Схемы**: `user`, `event`, `crew`, `payment`, `notification`, `media`
- **Max connections**: 200
- **Init script**: `init-schemas.sql` автоматически создаёт схемы при первом запуске
- **Encoding**: UTF-8
- **Timezone**: UTC

**Redis 7**
- **Порт**: 6379
- **Контейнер**: `aquastream-redis`
- **Volume**: `redisdata` (named volume)
- **Persistence**: AOF (Append-Only File) для durability
- **Использование**:
  - Session storage
  - Rate limiting (Bucket4j)
  - Metrics aggregation
  - Cache

**MinIO**
- **API порт**: 9000
- **Console порт**: 9001
- **Контейнер**: `aquastream-minio`
- **Volume**: `miniodata` (named volume)
- **Buckets**:
  - `aquastream-media` - загруженные файлы пользователей
  - `aquastream-payment` - чеки и платёжные документы
- **Bootstrap**: автоматический через `minio-bootstrap.sh`
- **Access**: S3-compatible API

### Backend Services

Все backend сервисы запущены с security hardening:
- **User**: Non-privileged (`1000:1000`)
- **Filesystem**: Read-only root filesystem
- **Tmpfs**: Writable `/tmp` через tmpfs
- **Capabilities**: All Linux capabilities dropped
- **Security opt**: `no-new-privileges`
- **Health checks**: Spring Boot Actuator `/actuator/health`
- **Ulimits**: `nofile: 65536`

| Сервис | Порт | Контейнер | Memory | CPU | Описание |
|--------|------|-----------|--------|-----|----------|
| Gateway | 8080 | aquastream-backend-gateway | 512MB | 0.75 | API Gateway, routing, CORS |
| User | 8101 | aquastream-backend-user | 512MB | 0.75 | Управление пользователями, JWT |
| Event | 8102 | aquastream-backend-event | 768MB | 1.0 | События, бронирования, waitlist |
| Crew | 8103 | aquastream-backend-crew | 512MB | 0.75 | Команды, назначения, capacity |
| Payment | 8104 | aquastream-backend-payment | 512MB | 0.75 | Платежи, refunds, YooKassa |
| Notification | 8105 | aquastream-backend-notification | 512MB | 0.75 | Email, Telegram уведомления |
| Media | 8106 | aquastream-backend-media | 512MB | 0.75 | Загрузка файлов в MinIO |

**Memory limits**: Включают heap + metaspace + native memory
**CPU limits**: В единицах vCPU (0.75 = 75% одного ядра)

### Observability Stack (dev окружение)

**Prometheus 2.45**
- **Порт**: 9090
- **Контейнер**: `aquastream-prometheus`
- **Volume**: `prometheusdata`
- **Конфигурация**: `prometheus.yml`
- **Scrape targets**: Spring Boot Actuator endpoints всех сервисов
- **Retention**: 15 дней
- **Scrape interval**: 15 секунд

**Grafana 10**
- **Порт**: 3001
- **Контейнер**: `aquastream-grafana`
- **Volume**: `grafanadata`
- **Provisioning**: автоматическая настройка datasources и dashboards через `provisioning/`
- **Credentials**: `${GRAFANA_ADMIN_USER}/${GRAFANA_ADMIN_PASSWORD}` (по умолчанию admin/admin)
- **Datasources**: Prometheus, Loki

**Loki 2.8**
- **Порт**: 3100
- **Контейнер**: `aquastream-loki`
- **Volume**: `lokidata`
- **Конфигурация**: `loki-config.yml`
- **Retention**: 7 дней
- **Использование**: централизованное хранилище логов

**Promtail 2.8**
- **Контейнер**: `aquastream-promtail`
- **Volume**: `/var/run/docker.sock` (read-only)
- **Конфигурация**: `promtail-config.yml`
- **Использование**: сбор логов из Docker контейнеров через docker driver

> ⚠️ **Важно**: Observability stack включен только в **dev** профиле. Для production используйте внешний мониторинг.

## Docker Compose профили

### dev - Development

```bash
make up-dev
```

**Что включает**:
- ✅ Core services (Postgres, Redis, MinIO)
- ✅ Все 7 backend services
- ✅ Observability stack (Prometheus, Grafana, Loki, Promtail)

**Compose файлы**: `docker-compose.yml` + `docker-compose.override.dev.yml`

**Особенности**:
- Ports exposed для localhost (можно обращаться напрямую к сервисам)
- Debug logging (TRACE/DEBUG level в Spring Boot)
- Все Actuator endpoints доступны без авторизации
- CORS enabled для `localhost:3000` (frontend)
- Weak passwords (безопасность не критична)
- Automatic jar build + docker build перед запуском
- Hot reload не поддерживается (требуется rebuild контейнера)

### stage - Staging

```bash
make up-stage
```

**Что включает**:
- ✅ Core services
- ✅ Backend services
- ❌ Observability stack (используйте внешний мониторинг)

**Compose файлы**: `docker-compose.yml` + `docker-compose.override.stage.yml`

**Особенности**:
- Ограниченные Actuator endpoints (health, info, metrics)
- INFO level logging
- Реальные секреты из `.env.stage` (не weak passwords!)
- Security headers enabled
- Rate limiting moderate

### prod - Production

```bash
make up-prod
```

**Что включает**:
- ✅ Core services
- ✅ Backend services
- ❌ Observability stack

**Compose файл**: только `docker-compose.yml` (без overrides)

**Особенности**:
- Минимальные Actuator endpoints (только health)
- WARN level logging
- Сильные пароли обязательны
- Security headers strict
- Rate limiting strict
- HTTPS обязательно (через reverse proxy: nginx/traefik)
- No port exposure (только через gateway)

## Сеть

**Network**: `aquastream-net` (bridge driver)

Все сервисы находятся в одной Docker сети и могут обращаться друг к другу по имени контейнера:

```yaml
# Пример использования в application.yml
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/aquastream
  data:
    redis:
      host: redis
      port: 6379
```

**Внутренние адреса** (доступны только внутри Docker сети):
- `postgres:5432`
- `redis:6379`
- `minio:9000`
- `backend-user:8101`
- `backend-event:8102`
- и т.д.

## Volumes

**Named volumes** для персистентности данных:

```yaml
volumes:
  pgdata:              # PostgreSQL database files
  redisdata:           # Redis AOF и RDB файлы
  miniodata:           # MinIO object storage
  prometheusdata:      # Prometheus metrics (dev only)
  grafanadata:         # Grafana dashboards (dev only)
  lokidata:            # Loki logs (dev only)
  promtailpositions:   # Promtail state (dev only)
```

**Bind mounts** (для development):
- `./backend-infra/docker/scripts:/scripts` - вспомогательные скрипты
- `/var/run/docker.sock` (Promtail) - для сбора логов

**Best practices**:
- Named volumes для production data
- Bind mounts только для конфигов и скриптов
- Регулярные backup'ы через `make backup`

## Gradle Build System

### Convention Plugins

Проект использует **included build** `build-logic/` с convention plugins:

**`com.aquastream.java-library-conventions`**:
- Применяется ко всем subprojects
- Java 21, UTF-8 encoding
- Common dependencies: Lombok, validation, testing
- Версионирование через `version.properties`

**`com.aquastream.spring-boot-api-conventions`**:
- Применяется только к `*-api` модулям и `backend-gateway`
- Spring Boot plugin
- `jar.enabled = false`, `bootJar.enabled = true`
- Actuator + management endpoints

### Version Management

Проект использует централизованное управление версиями через `version.properties` в корне. Все модули используют единую версию.

> Детали управления версиями и release process см. в [Deployment](deployment.md#version-management)

### Dependency Locking

Включен **dependency locking** (`LockMode.STRICT`) для воспроизводимых сборок:

- Lockfiles: `gradle.lockfile` в каждом модуле
- Обновление: `make deps-lock` или `./gradlew dependencies --write-locks`
- CI/CD проверяет актуальность lockfiles

## Security

### Container Hardening

Все backend контейнеры настроены с:
- ✅ Non-root user (UID 1000, GID 1000)
- ✅ Read-only root filesystem
- ✅ Tmpfs для `/tmp` (размер: 256MB)
- ✅ All Linux capabilities dropped (`cap_drop: [ALL]`)
- ✅ `security_opt: [no-new-privileges:true]`
- ✅ ulimit nofile: 65536

**Проверка**:
```bash
# Проверить что контейнер работает от non-root
docker exec aquastream-backend-event whoami
# Вывод: appuser

# Проверить capabilities
docker exec aquastream-backend-event cat /proc/1/status | grep Cap
# Все должны быть 0000000000000000
```

### Image Scanning

**Trivy** - сканирование образов на уязвимости:
```bash
make scan
```

Проверяет все образы aquastream/* на HIGH/CRITICAL уязвимости.
Отчёты сохраняются в `backend-infra/reports/scan/`.

**SBOM** - Software Bill of Materials:
```bash
make sbom
```

Генерация SBOM через Syft в формате SPDX JSON.
Отчёты в `backend-infra/reports/sbom/`.

### Secret Management

**Development**:
- Секреты в `.env.dev` (gitignored)
- Weak passwords допустимы
- Файл создаётся из `.env.dev.example`

**Production**:
- Использовать `.env.prod` с сильными паролями
- Ротация паролей каждые 90 дней
- Опционально: Docker secrets или HashiCorp Vault

**Best practices**:
- ✅ Никогда не коммитить `.env` файлы
- ✅ Использовать `.env.example` как шаблоны
- ✅ Разные пароли для каждого окружения
- ✅ Минимум 20 символов для production паролей

## Health Checks

Все сервисы имеют Docker health checks:

**PostgreSQL**:
```bash
pg_isready -U aquastream -d aquastream
# interval: 10s, timeout: 5s, retries: 5
```

**Redis**:
```bash
redis-cli -a ${REDIS_PASSWORD} PING
# interval: 10s, timeout: 5s, retries: 5
```

**MinIO**:
```bash
curl -f http://localhost:9000/minio/health/live
# interval: 30s, timeout: 10s, retries: 3
```

**Backend services**:
```bash
curl -f http://localhost:<port>/actuator/health
# interval: 10s, timeout: 5s, retries: 10
```

**Проверка статуса**:
```bash
docker ps
# STATUS должен быть "healthy" для всех сервисов
```

## Logging

**Driver**: `json-file` (Docker default)

**Rotation**:
```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"   # Максимальный размер файла
    max-file: "5"     # Количество ротированных файлов
```

**Total log size per container**: 50MB (10MB × 5 файлов)

**Просмотр логов**:
```bash
# Все сервисы
make logs

# Конкретный сервис
docker logs aquastream-backend-event

# Streaming
docker logs -f aquastream-backend-event

# Последние N строк
docker logs --tail 100 aquastream-backend-event

# С временными метками
docker logs -t aquastream-backend-event
```

**Структурированные логи**: JSON через Logback в Spring Boot

**Centralized logging** (dev): Loki + Promtail для агрегации и поиска логов

## Resource Limits

Все сервисы имеют memory и CPU limits для предотвращения resource exhaustion:

| Component | Memory Limit | CPU Limit | Notes |
|-----------|--------------|-----------|-------|
| Postgres | 768MB | 0.75 | Includes shared_buffers |
| Redis | 256MB | 0.50 | Maxmemory policy: allkeys-lru |
| MinIO | 512MB | 0.75 | S3 API overhead |
| Backend services | 512-768MB | 0.75-1.0 | JVM heap + metaspace |
| Prometheus | 512MB | 0.50 | Dev only |
| Grafana | 256MB | 0.25 | Dev only |
| Loki | 256MB | 0.25 | Dev only |

**Мониторинг**:
```bash
docker stats
```

**Best practices**:
- Memory limits = heap size × 1.5 (для JVM overhead)
- CPU limits = load testing results + 20% buffer
- Monitor OOM kills: `docker inspect <container> | grep OOMKilled`

## Troubleshooting

### Порты заняты

```bash
# Проверить занятые порты
lsof -i :5432
lsof -i :8080

# Изменить маппинг портов в docker-compose.override.dev.yml
ports:
  - "5433:5432"  # Использовать другой внешний порт
```

### Контейнеры не стартуют

```bash
# Проверить логи
make logs

# Проверить health checks
docker ps -a

# Пересоздать с чистыми volumes
make down
make up-dev
```

### MinIO buckets не созданы

```bash
# Пересоздать buckets
make minio-bootstrap

# Проверить
make minio-buckets
```

### Проблемы с зависимостями Gradle

```bash
# Очистить кэши
./gradlew clean --no-daemon

# Обновить lockfiles
make deps-lock

# Проверить конфликты
./gradlew dependencies
```

### Out of disk space

```bash
# Очистить неиспользуемые resources
docker system prune -a --volumes

# Проверить disk usage
docker system df

# Проверить volumes
docker volume ls
docker volume prune
```

## См. также

- [Deployment](deployment.md) - процесс развертывания
- [CI/CD](ci-cd.md) - continuous integration
- [Backup & Recovery](backup-recovery.md) - резервное копирование
- [Backend Infrastructure README](../../backend-infra/README.md) - детали реализации
- [Makefile](../../backend-infra/make/Makefile) - все доступные команды