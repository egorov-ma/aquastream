# Crew Service - Operations

## Обзор

Документация по развертыванию, конфигурации и обслуживанию Crew Service в различных окружениях.

## Deployment

### Docker

**Image**: `aquastream/backend-crew:dev`
**Container**: `aquastream-backend-crew`
**Порт**: 8103
**Сеть**: `aquastream-net`

```yaml
# docker-compose.yml
backend-crew:
  image: aquastream/backend-crew:dev
  container_name: aquastream-backend-crew
  profiles: [dev, stage, prod]
  depends_on:
    - postgres
  env_file:
    - ${ENV_FILE:-.env}
  user: "1000:1000"
  read_only: true
  tmpfs:
    - /tmp
  cap_drop:
    - ALL
  security_opt:
    - no-new-privileges:true
  ulimits:
    nofile:
      soft: 65536
      hard: 65536
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8103/actuator/health"]
    interval: 10s
    timeout: 5s
    retries: 10
  restart: unless-stopped
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "5"
  mem_limit: 512m
  cpus: "0.75"
  networks: [aquastream-net]
```

### Зависимости

**Обязательные**:
- PostgreSQL (схема `crew`)

**Опциональные**:
- Redis (для rate limiting через backend-common)

### Запуск

```bash
# Dev окружение
docker compose --profile dev up -d backend-crew

# Stage окружение
docker compose --profile stage up -d backend-crew

# Production окружение
docker compose --profile prod up -d backend-crew
```

## Конфигурация

### application.yml

```yaml
server:
  port: 8103

spring:
  application:
    name: backend-crew
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}

  datasource:
    url: jdbc:postgresql://postgres:5432/aquastream
    username: ${POSTGRES_USER}
    password: ${POSTGRES_PASSWORD}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: none  # Liquibase управляет схемой
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        default_schema: crew

  liquibase:
    change-log: classpath:migration/liquibase/master.xml
    contexts: ${LIQUIBASE_CONTEXTS:dev}
    default-schema: crew

# Application-specific configuration
app:
  crew:
    auto-assignment:
      enabled: true               # Автоматическое назначение (будущее)
      prefer-friends: true        # Учитывать предпочтения
      avoid-conflicts: true       # Избегать конфликтов
    capacity-validation:
      strict: true                # Строгая валидация capacity
      allow-overbook: false       # Запретить overbooking

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized

logging:
  level:
    org.aquastream.crew: INFO
    org.hibernate.SQL: WARN
    org.hibernate.orm.jdbc.bind: WARN
```

### Переменные окружения

```bash
# Database
POSTGRES_USER=aquastream
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=aquastream

# Spring profiles
SPRING_PROFILES_ACTIVE=dev

# Liquibase
LIQUIBASE_CONTEXTS=dev

# Rate limiting (наследуется от backend-common)
AQUASTREAM_RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=INFO
```

### Профили

#### dev

```yaml
# application-dev.yml
spring:
  jpa:
    show-sql: true
  liquibase:
    contexts: dev

app:
  crew:
    capacity-validation:
      strict: false
      allow-overbook: true

logging:
  level:
    org.aquastream.crew: DEBUG
    org.hibernate.SQL: DEBUG
```

#### stage

```yaml
# application-stage.yml
spring:
  liquibase:
    contexts: stage

app:
  crew:
    capacity-validation:
      strict: true
      allow-overbook: false

logging:
  level:
    org.aquastream.crew: INFO
```

#### prod

```yaml
# application-prod.yml
spring:
  jpa:
    show-sql: false
  liquibase:
    contexts: prod

app:
  crew:
    capacity-validation:
      strict: true
      allow-overbook: false

logging:
  level:
    org.aquastream.crew: WARN
    org.hibernate.SQL: WARN
```

## Database Management

### Liquibase Migrations

**Changelog**: `backend-crew-db/src/main/resources/migration/liquibase/master.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.21.xsd">

    <include file="sql/0001_create_tables.sql" relativeToChangelogFile="true"/>
    <include file="sql/0002_indexes_constraints.sql" relativeToChangelogFile="true"/>

</databaseChangeLog>
```

### Схема crew

**Таблицы**:
- `crew.crews` - основная таблица групп
- `crew.crew_assignments` - назначения участников
- `crew.boats` - детали лодок
- `crew.tents` - детали палаток
- `crew.team_preferences` - предпочтения участников

### Применение миграций

```bash
# Автоматически при старте сервиса
docker compose up -d backend-crew

# Ручное применение (если нужно)
docker exec -it aquastream-backend-crew \
  java -jar app.jar \
  --spring.liquibase.contexts=dev \
  --liquibase.command=update
```

### Rollback миграций

```bash
# Откат последней миграции
docker exec -it aquastream-backend-crew \
  java -jar app.jar \
  --liquibase.command=rollback \
  --liquibase.rollback-count=1

# Откат к конкретной дате
docker exec -it aquastream-backend-crew \
  java -jar app.jar \
  --liquibase.command=rollback \
  --liquibase.rollback-date=2024-01-15
```

### Проверка состояния

```bash
# Список примененных changesets
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, author, filename, dateexecuted FROM crew.databasechangelog ORDER BY orderexecuted;"

# Структура таблиц
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "\dt crew.*"

# Индексы
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "\di crew.*"
```

## Monitoring

### Health Checks

**Endpoint**: `http://localhost:8103/actuator/health`

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 500107862016,
        "free": 123456789012,
        "threshold": 10485760
      }
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

**Проверка**:

```bash
# Статус сервиса
curl http://localhost:8103/actuator/health

# Детальный статус (с авторизацией)
curl -H "X-User-Role: ADMIN" \
     http://localhost:8103/actuator/health
```

### Метрики

**Endpoint**: `http://localhost:8103/actuator/metrics`

**Доступные метрики**:

```bash
# JVM memory
curl http://localhost:8103/actuator/metrics/jvm.memory.used

# Database connections
curl http://localhost:8103/actuator/metrics/hikaricp.connections.active

# HTTP requests
curl http://localhost:8103/actuator/metrics/http.server.requests

# Custom metrics (через backend-common)
curl http://localhost:8103/actuator/metrics/aquastream.requests.total
curl http://localhost:8103/actuator/metrics/aquastream.latency.p95
```

### Логи

```bash
# Просмотр логов
docker logs aquastream-backend-crew

# Последние 100 строк
docker logs --tail 100 aquastream-backend-crew

# Follow mode
docker logs -f aquastream-backend-crew

# С временными метками
docker logs -t aquastream-backend-crew

# Фильтрация по уровню
docker logs aquastream-backend-crew 2>&1 | grep ERROR
docker logs aquastream-backend-crew 2>&1 | grep WARN
```

**Формат логов**:

```
2024-01-15 10:23:45.123 INFO  [backend-crew,abc123xyz] o.a.crew.service.CrewService - Created crew 'Катамаран #1' for event 550e8400-e29b-41d4-a716-446655440000
2024-01-15 10:24:12.456 WARN  [backend-crew,def456uvw] o.a.crew.service.AssignmentService - Crew capacity exceeded: crewId=123, capacity=6, currentSize=6
2024-01-15 10:25:33.789 ERROR [backend-crew,ghi789rst] o.a.crew.api.controller.CrewController - Failed to delete crew: has active assignments
```

### Алерты

**Рекомендуемые алерты**:

1. **Service Down**
   ```bash
   # Health check failed
   curl -f http://localhost:8103/actuator/health || echo "ALERT: Crew service is down"
   ```

2. **High Error Rate**
   ```bash
   # Более 5% запросов с ошибками за последние 5 минут
   docker logs --since 5m aquastream-backend-crew 2>&1 | grep ERROR | wc -l
   ```

3. **Database Connection Issues**
   ```bash
   # HikariCP connection timeout
   docker logs --since 5m aquastream-backend-crew 2>&1 | grep "HikariPool.*timeout"
   ```

4. **High Memory Usage**
   ```bash
   # JVM heap > 80%
   curl http://localhost:8103/actuator/metrics/jvm.memory.used
   ```

## Security

### Контейнер

**Hardening** (применяется автоматически):
- ✅ Неprivileged user (`1000:1000`)
- ✅ Read-only filesystem
- ✅ Tmpfs для `/tmp`
- ✅ Dropped all capabilities
- ✅ `no-new-privileges` security option

### Доступ к API

- **Authentication**: JWT через Gateway (header `X-User-Id`)
- **Authorization**: Role-based (header `X-User-Role`)
- **Rate Limiting**: Bucket4j через backend-common

**Защита endpoints**:
- ORGANIZER только: создание/изменение/удаление crews
- ORGANIZER только: назначение/удаление участников
- USER/ORGANIZER: просмотр crews и назначений
- GUEST: нет доступа

### Secrets Management

**Секреты через environment**:

```bash
# .env (не коммитить в Git!)
POSTGRES_PASSWORD=secure_password_here
JWT_SECRET=your-jwt-secret-key

# Docker secrets (production)
echo "secure_password" | docker secret create db_password -
```

**Best practices**:
- ✅ Используйте `.env.example` с плейсхолдерами
- ✅ Ротация паролей каждые 90 дней
- ✅ Разные пароли для dev/stage/prod
- ❌ Никогда не коммитьте секреты в Git

## Troubleshooting

### Сервис не стартует

**Проблема**: Container exits immediately

**Решение**:

```bash
# 1. Проверить логи
docker logs aquastream-backend-crew

# 2. Проверить зависимости
docker ps | grep postgres

# 3. Проверить переменные окружения
docker exec aquastream-backend-crew env | grep POSTGRES

# 4. Проверить подключение к БД
docker exec aquastream-backend-crew \
  psql -h postgres -U aquastream -d aquastream -c "SELECT 1"
```

### Database connection errors

**Проблема**: `Connection refused` или `Connection timeout`

**Решение**:

```bash
# 1. Проверить что PostgreSQL запущен
docker ps | grep postgres

# 2. Проверить health check PostgreSQL
docker exec aquastream-postgres pg_isready -U aquastream

# 3. Проверить сеть
docker network inspect aquastream-net | grep backend-crew
docker network inspect aquastream-net | grep postgres

# 4. Проверить credentials
echo $POSTGRES_PASSWORD
```

### Liquibase migration failed

**Проблема**: Migration changesets не применяются

**Решение**:

```bash
# 1. Проверить таблицу changesets
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT * FROM crew.databasechangelog ORDER BY orderexecuted DESC LIMIT 5;"

# 2. Проверить locks
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT * FROM crew.databasechangeloglock;"

# 3. Разблокировать (если залочено)
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "UPDATE crew.databasechangeloglock SET locked=false, lockgranted=null, lockedby=null WHERE id=1;"

# 4. Пересоздать сервис
docker compose restart backend-crew
```

### Race condition на capacity

**Проблема**: `CrewCapacityExceededException` при одновременных назначениях

**Решение** (уже реализовано):

```java
// Оптимистичная блокировка на crew entity
@Entity
public class CrewEntity {
    @Version
    private Long version;
}
```

**Проверка**:

```bash
# Проверить version field в таблице
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, name, capacity, current_size, version FROM crew.crews WHERE id='crew-uuid';"
```

### High memory usage

**Проблема**: Container использует > 512MB memory

**Решение**:

```bash
# 1. Проверить memory usage
docker stats aquastream-backend-crew

# 2. Проверить heap size
curl http://localhost:8103/actuator/metrics/jvm.memory.used

# 3. Увеличить memory limit (если нужно)
# В docker-compose.yml:
mem_limit: 768m

# 4. Настроить JVM heap (application.yml)
JAVA_OPTS="-Xms256m -Xmx512m"
```

### Slow queries

**Проблема**: Endpoints отвечают медленно

**Решение**:

```bash
# 1. Включить SQL логи
# application.yml:
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.orm.jdbc.bind: TRACE

# 2. Проверить N+1 queries
docker logs aquastream-backend-crew | grep "SELECT"

# 3. Проверить индексы
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "\di crew.*"

# 4. EXPLAIN ANALYZE медленного запроса
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "EXPLAIN ANALYZE SELECT * FROM crew.crew_assignments WHERE crew_id='uuid';"
```

## Backup & Recovery

### Backup базы данных

```bash
# Backup только схемы crew
docker exec aquastream-postgres pg_dump \
  -U aquastream -d aquastream -n crew \
  --format=custom --file=/tmp/crew_backup.dump

# Скопировать backup
docker cp aquastream-postgres:/tmp/crew_backup.dump ./backups/

# С сжатием
docker exec aquastream-postgres pg_dump \
  -U aquastream -d aquastream -n crew \
  --format=custom --compress=9 --file=/tmp/crew_backup.dump.gz
```

### Restore базы данных

```bash
# Копировать backup в контейнер
docker cp ./backups/crew_backup.dump aquastream-postgres:/tmp/

# Restore
docker exec aquastream-postgres pg_restore \
  -U aquastream -d aquastream \
  --clean --if-exists \
  /tmp/crew_backup.dump

# С подтверждением
docker exec -it aquastream-postgres pg_restore \
  -U aquastream -d aquastream \
  --clean --if-exists --verbose \
  /tmp/crew_backup.dump
```

### Backup расписание

**Production рекомендация**:

```bash
# Crontab для ежедневного backup
0 2 * * * docker exec aquastream-postgres pg_dump \
  -U aquastream -d aquastream -n crew \
  --format=custom --compress=9 \
  --file=/backups/crew_$(date +\%Y\%m\%d).dump

# Удаление старых backups (> 30 дней)
0 3 * * * find /backups -name "crew_*.dump" -mtime +30 -delete
```

## Performance Optimization

### JPA/Hibernate

**Fetch Join для устранения N+1**:

```java
@Query("SELECT c FROM CrewEntity c " +
       "LEFT JOIN FETCH c.assignments a " +
       "WHERE c.eventId = :eventId AND a.status = 'ACTIVE'")
List<CrewEntity> findByEventIdWithAssignments(@Param("eventId") UUID eventId);
```

**Batch размер**:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
```

### Connection Pool

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### Индексы

**Критичные** (уже применены через Liquibase):

```sql
CREATE INDEX idx_crews_event_id ON crew.crews(event_id);
CREATE INDEX idx_crew_assignments_crew_id ON crew.crew_assignments(crew_id);
CREATE INDEX idx_crew_assignments_user_event ON crew.crew_assignments(user_id, crew_id);
CREATE INDEX idx_crew_assignments_booking ON crew.crew_assignments(booking_id);
CREATE INDEX idx_crew_assignments_status ON crew.crew_assignments(status);
```

### Кэширование

**Candidate для кэша** (будущее улучшение):

```java
@Cacheable(value = "event-crews", key = "#eventId")
public List<CrewDto> getCrews(UUID eventId, String type, boolean availableOnly) {
    // ...
}
```

**Redis конфигурация**:

```yaml
spring:
  cache:
    type: redis
  data:
    redis:
      host: redis
      port: 6379
      password: ${REDIS_PASSWORD}
      lettuce:
        pool:
          max-active: 10
          max-idle: 5
          min-idle: 2
```

## Maintenance

### Обновление сервиса

```bash
# 1. Собрать новый image
cd backend-crew
./gradlew clean build
docker build -t aquastream/backend-crew:dev .

# 2. Остановить старый контейнер
docker compose stop backend-crew

# 3. Запустить новый
docker compose up -d backend-crew

# 4. Проверить логи
docker logs -f aquastream-backend-crew

# 5. Health check
curl http://localhost:8103/actuator/health
```

### Rolling update (zero downtime)

```bash
# 1. Запустить второй экземпляр
docker compose up -d --scale backend-crew=2

# 2. Подождать health check
sleep 30

# 3. Удалить старый
docker stop aquastream-backend-crew-old

# 4. Вернуть scale=1
docker compose up -d --scale backend-crew=1
```

### Очистка данных

```bash
# Удалить REMOVED assignments (старше 90 дней)
docker exec -it aquastream-postgres psql -U aquastream -d aquastream <<EOF
DELETE FROM crew.crew_assignments
WHERE status = 'REMOVED'
  AND unassigned_at < NOW() - INTERVAL '90 days';
EOF

# Удалить crews прошедших событий (старше 1 года)
docker exec -it aquastream-postgres psql -U aquastream -d aquastream <<EOF
DELETE FROM crew.crews
WHERE event_id IN (
  SELECT e.id FROM event.events e
  WHERE e.date_end < NOW() - INTERVAL '1 year'
);
EOF
```

## См. также

- [README](README.md) - обзор сервиса
- [API Documentation](api.md) - детальное описание API
- [Business Logic](business-logic.md) - бизнес-правила и валидации
- [Database Schema](../database.md) - схема crew в PostgreSQL
- [Backend Common Operations](../common/README.md) - общие backend инструменты