# Troubleshooting

---
title: Troubleshooting Guide
summary: Руководство по устранению типичных проблем в системе AquaStream
tags: [operations, troubleshooting, debugging, problems]
---

## Обзор

Руководство по диагностике и решению типичных проблем при эксплуатации AquaStream.

## Общий подход к диагностике

### 1. Сбор информации

```bash
# Статус всех контейнеров
docker ps -a

# Логи всех сервисов
make logs

# Health checks
make smoke

# Resource usage
docker stats

# Disk space
df -h
```

### 2. Изоляция проблемы

**Вопросы для определения scope**:
- Проблема касается одного сервиса или всех?
- Проблема воспроизводится стабильно или периодически?
- Когда проблема началась? Были ли изменения?
- Есть ли ошибки в логах?
- Какие метрики аномальные?

### 3. Проверка зависимостей

```bash
# PostgreSQL
docker exec aquastream-postgres pg_isready -U aquastream

# Redis
docker exec aquastream-redis redis-cli -a ${REDIS_PASSWORD} PING

# MinIO
curl -f http://localhost:9000/minio/health/live

# Network
docker network inspect aquastream-net
```

## Проблемы запуска

### Сервисы не стартуют

**Симптомы**:
- Контейнеры в статусе `Restarting` или `Exited`
- Health check failures
- Ошибки в логах при старте

**Диагностика**:
```bash
# Проверить логи
make logs

# Проверить конкретный сервис
docker logs aquastream-backend-event

# Проверить зависимости
docker ps | grep -E "postgres|redis|minio"
```

**Решения**:

**1. Postgres не готов**:
```bash
# Проверить статус
docker exec aquastream-postgres pg_isready

# Если не готов - подождать или пересоздать
make down
make up-dev
```

**2. Неверные credentials**:
```bash
# Проверить environment variables
docker exec aquastream-backend-event env | grep -E "POSTGRES|REDIS"

# Проверить .env файл
cat backend-infra/docker/compose/.env.dev
```

**3. Port conflicts**:
```bash
# Проверить занятые порты
lsof -i :8080
lsof -i :5432

# Решение: изменить маппинг в docker-compose.override.dev.yml
ports:
  - "8081:8080"  # Использовать другой внешний порт
```

**4. Memory issues**:
```bash
# Проверить OOM kills
docker inspect aquastream-backend-event | grep OOMKilled

# Решение: увеличить memory limit
mem_limit: 1024m  # в docker-compose.yml
```

### Медленный старт сервисов

**Симптомы**:
- Контейнеры долго в статусе `starting` (health: starting)
- Timeout при старте

**Причины и решения**:

**1. Liquibase migrations**:
```bash
# Проверить логи миграций
docker logs aquastream-backend-event | grep liquibase

# Если миграции долгие - проверить индексы БД
# Или выполнить миграции вручную перед запуском
```

**2. Холодный старт JVM**:
```bash
# Normal для первого запуска (30-60 секунд)
# Если > 2 минут - проверить resources
docker stats
```

**3. Network issues**:
```bash
# Проверить DNS resolution
docker exec aquastream-backend-event ping -c 1 postgres

# Проверить network
docker network inspect aquastream-net
```

### Контейнеры постоянно перезапускаются

**Симптомы**:
- STATUS: `Restarting (1) X seconds ago`
- Логи показывают циклические ошибки

**Диагностика**:
```bash
# Проверить restart count
docker ps -a | grep Restarting

# Полные логи с начала
docker logs aquastream-backend-event --since 1h
```

**Частые причины**:

**1. Неверная конфигурация**:
- Проверить application.yml
- Проверить environment variables
- Проверить connection strings

**2. Database unavailable**:
```bash
# Проверить что Postgres поднялся
docker logs aquastream-postgres | grep "ready to accept connections"
```

**3. Port binding errors**:
- Проверить что порт не занят другим процессом
- Проверить что нет дублирующихся контейнеров

## Проблемы с базой данных

### Connection refused

**Симптомы**:
```
Connection to localhost:5432 refused
```

**Решения**:

**1. Postgres контейнер не запущен**:
```bash
docker ps | grep postgres

# Если отсутствует - запустить
make up-dev
```

**2. Неверный host**:
```bash
# Внутри Docker network используй имя контейнера
jdbc:postgresql://postgres:5432/aquastream

# Не localhost!
```

**3. Firewall блокирует порт**:
```bash
# macOS/Linux
sudo lsof -i :5432

# Проверить что порт доступен
nc -zv localhost 5432
```

### Too many connections

**Симптомы**:
```
FATAL: sorry, too many clients already
```

**Решения**:

**1. Проверить текущие подключения**:
```bash
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT count(*) FROM pg_stat_activity;"
```

**2. Проверить connection pool settings**:
```yaml
# application.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20  # Уменьшить если слишком много
```

**3. Connection leaks**:
```bash
# Проверить открытые connections
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT application_name, count(*) FROM pg_stat_activity GROUP BY application_name;"

# Убить idle connections (осторожно!)
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';"
```

**4. Увеличить max_connections**:
```bash
# В docker-compose.yml
command: postgres -c max_connections=200
```

### Slow queries

**Симптомы**:
- Высокий response time
- Timeout errors
- Логи показывают долгие запросы

**Диагностика**:
```bash
# Включить slow query log
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "ALTER SYSTEM SET log_min_duration_statement = 1000;" # 1 second

# Перезагрузить конфигурацию
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT pg_reload_conf();"

# Проверить медленные запросы в логах
docker logs aquastream-postgres | grep "duration:"
```

**Решения**:

**1. Missing indexes**:
```sql
-- Проверить какие индексы используются
EXPLAIN ANALYZE SELECT * FROM events WHERE status = 'PUBLISHED';

-- Создать недостающий индекс
CREATE INDEX idx_events_status ON events(status);
```

**2. Неоптимальные запросы**:
- Избегать SELECT *
- Использовать pagination (LIMIT/OFFSET)
- Избегать N+1 queries (use JOIN или fetch)

**3. Table bloat**:
```bash
# VACUUM для очистки
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "VACUUM ANALYZE;"
```

### Backup/Restore issues

**Проблема**: Backup fails

**Решения**:
```bash
# Проверить disk space
df -h

# Проверить permissions
ls -la backend-infra/backup/artifacts/

# Создать директорию если отсутствует
mkdir -p backend-infra/backup/artifacts/

# Manual backup
docker exec aquastream-postgres pg_dump -U aquastream -d aquastream \
  --schema=event --format=c --file=/tmp/event.dump
docker cp aquastream-postgres:/tmp/event.dump ./event.dump
```

**Проблема**: Restore fails

**Решения**:
```bash
# Проверить формат dump файла
file event.dump.gz

# Распаковать если gzipped
gunzip event.dump.gz

# Проверить что схема существует
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "\dn"

# Restore
docker cp event.dump aquastream-postgres:/tmp/
docker exec aquastream-postgres pg_restore -U aquastream -d aquastream \
  --schema=event /tmp/event.dump
```

## Проблемы с Redis

### Connection refused

**Симптомы**:
```
Cannot get Jedis connection; nested exception is redis.clients.jedis.exceptions.JedisConnectionException
```

**Решения**:

**1. Redis не запущен**:
```bash
docker ps | grep redis

# Запустить
make up-dev
```

**2. Неверный password**:
```bash
# Проверить password
echo $REDIS_PASSWORD

# Проверить подключение
docker exec aquastream-redis redis-cli -a ${REDIS_PASSWORD} PING
# Должно вернуть: PONG
```

**3. Неверный host**:
```yaml
# Должно быть имя контейнера
spring:
  data:
    redis:
      host: redis  # НЕ localhost
      port: 6379
```

### Out of memory

**Симптомы**:
```
OOM command not allowed when used memory > 'maxmemory'
```

**Решения**:

**1. Проверить memory usage**:
```bash
docker exec aquastream-redis redis-cli -a ${REDIS_PASSWORD} INFO memory
```

**2. Увеличить maxmemory**:
```bash
# В docker-compose.yml
command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb
```

**3. Настроить eviction policy**:
```bash
docker exec aquastream-redis redis-cli -a ${REDIS_PASSWORD} \
  CONFIG SET maxmemory-policy allkeys-lru
```

**4. Очистить старые данные**:
```bash
# Осторожно! Удаляет все данные
docker exec aquastream-redis redis-cli -a ${REDIS_PASSWORD} FLUSHALL
```

## Проблемы с MinIO

### Buckets не созданы

**Симптомы**:
- 404 Not Found при загрузке файлов
- Ошибки `The specified bucket does not exist`

**Решения**:

**1. Проверить buckets**:
```bash
make minio-buckets

# Или вручную
docker exec aquastream-minio mc ls local/
```

**2. Создать buckets**:
```bash
make minio-bootstrap

# Или вручную
docker exec aquastream-minio mc mb local/aquastream-media --ignore-existing
docker exec aquastream-minio mc mb local/aquastream-payment --ignore-existing
```

**3. Проверить permissions**:
```bash
# Сделать buckets public (для dev)
docker exec aquastream-minio mc anonymous set download local/aquastream-media
```

### Connection issues

**Симптомы**:
- Timeout при обращении к MinIO
- Connection refused

**Решения**:

**1. Проверить статус**:
```bash
docker ps | grep minio
curl -f http://localhost:9000/minio/health/live
```

**2. Проверить credentials**:
```bash
# В application.yml
minio:
  url: http://minio:9000  # Внутри Docker network
  access-key: ${MINIO_ROOT_USER}
  secret-key: ${MINIO_ROOT_PASSWORD}
```

**3. Проверить network**:
```bash
docker exec aquastream-backend-media ping -c 1 minio
```

## Проблемы с Docker

### Disk space exhausted

**Симптомы**:
```
no space left on device
```

**Решения**:

**1. Проверить usage**:
```bash
docker system df
df -h
```

**2. Очистить неиспользуемые resources**:
```bash
# Удалить stopped контейнеры
docker container prune

# Удалить unused images
docker image prune -a

# Удалить unused volumes
docker volume prune

# Всё вместе (осторожно!)
docker system prune -a --volumes
```

**3. Очистить build cache**:
```bash
docker builder prune -a
```

### Out of memory

**Симптомы**:
- Контейнеры killed
- OOMKilled в docker inspect

**Решения**:

**1. Проверить memory usage**:
```bash
docker stats

# Проверить OOM kills
docker inspect aquastream-backend-event | grep OOMKilled
```

**2. Увеличить limits**:
```yaml
# В docker-compose.yml
mem_limit: 1024m
memswap_limit: 1024m
```

**3. Tune JVM heap**:
```yaml
environment:
  - JAVA_OPTS=-Xms512m -Xmx768m
```

**4. Увеличить Docker Desktop memory**:
- Docker Desktop → Settings → Resources → Memory
- Рекомендуется: минимум 8GB для full stack

### Network issues

**Симптомы**:
- Контейнеры не могут обращаться друг к другу
- DNS resolution fails

**Решения**:

**1. Проверить network**:
```bash
docker network ls
docker network inspect aquastream-net
```

**2. Пересоздать network**:
```bash
make down
docker network rm aquastream-net
make up-dev
```

**3. Проверить DNS**:
```bash
docker exec aquastream-backend-event nslookup postgres
docker exec aquastream-backend-event ping -c 1 postgres
```

## Проблемы с Build

### Gradle build fails

**Симптомы**:
- `./gradlew build` fails
- Dependency resolution errors
- Compilation errors

**Решения**:

**1. Очистить кэши**:
```bash
./gradlew clean --no-daemon
rm -rf ~/.gradle/caches/
```

**2. Dependency lock issues**:
```bash
# Обновить locks
make deps-lock

# Или вручную
./gradlew dependencies --write-locks
```

**3. Version conflicts**:
```bash
# Проверить dependency tree
./gradlew dependencies
./gradlew :backend-event:backend-event-api:dependencies
```

**4. Проверить Java version**:
```bash
java -version  # Должна быть 21

# Установить Java 21 если нужно (через SDKMAN)
sdk install java 21-tem
sdk use java 21-tem
```

### Docker image build fails

**Симптомы**:
- `make build-images` fails
- Dockerfile errors

**Решения**:

**1. Проверить JAR файлы**:
```bash
# JAR должны быть собраны перед docker build
./gradlew assemble

# Проверить наличие
ls */backend-*-api/build/libs/*.jar
```

**2. Проверить Dockerfile**:
```bash
# Build конкретного образа
docker build -f backend-infra/docker/images/event.Dockerfile -t aquastream/backend-event:dev .

# С выводом деталей
docker build --progress=plain -f backend-infra/docker/images/event.Dockerfile .
```

**3. Очистить build cache**:
```bash
docker builder prune -a
```

## Проблемы с Performance

### High CPU usage

**Диагностика**:
```bash
# Проверить usage
docker stats

# Top processes внутри контейнера
docker exec aquastream-backend-event top

# Thread dump для Java
docker exec aquastream-backend-event jstack 1
```

**Решения**:
- Проверить infinite loops
- Проверить inefficient algorithms
- Tune GC: `-XX:+UseG1GC -XX:MaxGCPauseMillis=200`
- Scale horizontally если нужно

### High memory usage

**Диагностика**:
```bash
# Memory usage
docker stats

# Heap dump (Java)
docker exec aquastream-backend-event jmap -dump:live,format=b,file=/tmp/heap.bin 1
docker cp aquastream-backend-event:/tmp/heap.bin ./heap.bin

# Analyze с VisualVM или Eclipse MAT
```

**Решения**:
- Проверить memory leaks
- Tune heap size
- Проверить caching strategy
- Optimize queries (избегать loading больших datasets)

### Slow response time

**Диагностика**:
```bash
# Проверить latency
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8102/actuator/health

# curl-format.txt:
# time_total: %{time_total}\n

# Проверить database queries
docker logs aquastream-backend-event | grep "duration:"

# Проверить метрики
curl http://localhost:8102/actuator/metrics/http.server.requests
```

**Решения**:
- Add database indexes
- Optimize queries
- Enable caching (Redis)
- Connection pooling optimization
- Async processing для heavy operations

## Проблемы с CI/CD

### GitHub Actions workflow fails

**Backend CI fails**:
```bash
# Локально воспроизвести
./gradlew clean build

# Проверить dependency locks
./gradlew dependencies --write-locks
git diff */gradle.lockfile
```

**Frontend CI fails**:
```bash
cd frontend
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
```

**Docker CI fails**:
- Проверить что JAR файлы собираются
- Проверить Dockerfiles
- Локально: `make build-images`

### Commitlint fails

**Симптомы**:
```
Commit message does not follow Conventional Commits
```

**Решение**:
- Формат: `type(scope): subject`
- Примеры: `feat(user): add email verification`, `fix(event): capacity check`

## Когда обращаться за помощью

**Создай GitHub Issue если**:
- Проблема воспроизводится стабильно
- Ты следовал troubleshooting guide но проблема не решилась
- Нашел потенциальный баг

**Предоставь**:
- Описание проблемы
- Steps to reproduce
- Версия (git commit или tag)
- Environment (dev/stage/prod)
- Логи (sanitized, без секретов!)
- Конфигурация (sanitized)

## См. также

- [Infrastructure](infrastructure.md) - компоненты инфраструктуры
- [Deployment](deployment.md) - процесс развертывания
- [Monitoring](monitoring.md) - мониторинг и логи
- [Backend Infrastructure README](../../backend-infra/README.md) - детали реализации