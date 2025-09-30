# Event Service - Operations

## Обзор

Документация по развертыванию, конфигурации и обслуживанию Event Service в различных окружениях.

## Deployment

### Docker

**Image**: `aquastream/backend-event:dev`
**Container**: `aquastream-backend-event`
**Порт**: 8102
**Сеть**: `aquastream-net`

```yaml
# docker-compose.yml
backend-event:
  image: aquastream/backend-event:dev
  container_name: aquastream-backend-event
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
    test: ["CMD", "curl", "-f", "http://localhost:8102/actuator/health"]
    interval: 10s
    timeout: 5s
    retries: 10
  restart: unless-stopped
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "5"
  mem_limit: 768m
  cpus: "1.0"
  networks: [aquastream-net]
```

### Зависимости

**Обязательные**:
- PostgreSQL (схема `event`)

**Интеграции**:
- **Payment Service** (backend-payment) - обработка платежей
- **Notification Service** (backend-notification) - email и Telegram уведомления
- **User Service** (future) - валидация профилей

**Опциональные**:
- Redis (для rate limiting через backend-common)

### Запуск

```bash
# Dev окружение
docker compose --profile dev up -d backend-event

# Stage окружение
docker compose --profile stage up -d backend-event

# Production окружение
docker compose --profile prod up -d backend-event
```

## Конфигурация

### application.yml

```yaml
server:
  port: 8102

spring:
  application:
    name: backend-event
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
        default_schema: event

  liquibase:
    change-log: classpath:migration/liquibase/master.xml
    contexts: ${LIQUIBASE_CONTEXTS:dev}
    default-schema: event

  task:
    scheduling:
      pool:
        size: 2  # Пул для scheduled jobs

# Application-specific configuration
app:
  event:
    booking:
      ttl-minutes: 30                      # TTL для PENDING брони
      expiration-check-interval: 60000     # Проверка каждую минуту (60 сек)
      grace-period-minutes: 5              # Grace period перед истечением

    waitlist:
      notification-window-minutes: 30      # Окно для подтверждения waitlist
      cleanup-interval-minutes: 5          # Очистка expired уведомлений
      auto-process: true                   # Автообработка waitlist

    completion:
      check-interval-cron: "0 0 * * * *"   # Каждый час (проверка завершенных событий)
      auto-complete: true                  # Автозавершение событий

    capacity:
      atomic-decrement: true               # Атомарный decrement capacity
      race-condition-protection: true      # Защита от race conditions

    audit:
      enabled: true                        # Логирование всех изменений
      retain-days: 90                      # Хранить audit logs 90 дней

# Service URLs для интеграций
services:
  payment:
    url: ${PAYMENT_SERVICE_URL:http://backend-payment:8104}
    timeout-ms: 5000
  notification:
    url: ${NOTIFICATION_SERVICE_URL:http://backend-notification:8105}
    timeout-ms: 3000
  user:
    url: ${USER_SERVICE_URL:http://backend-user:8101}
    timeout-ms: 2000

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,scheduledtasks
  endpoint:
    health:
      show-details: when-authorized
    scheduledtasks:
      enabled: true

logging:
  level:
    org.aquastream.event: INFO
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

# Service URLs
PAYMENT_SERVICE_URL=http://backend-payment:8104
NOTIFICATION_SERVICE_URL=http://backend-notification:8105
USER_SERVICE_URL=http://backend-user:8101

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
  event:
    booking:
      ttl-minutes: 5           # Короткий TTL для тестирования
      grace-period-minutes: 1
    waitlist:
      notification-window-minutes: 10
    capacity:
      race-condition-protection: false  # Упрощенная логика для dev

logging:
  level:
    org.aquastream.event: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.orm.jdbc.bind: TRACE
```

#### stage

```yaml
# application-stage.yml
spring:
  liquibase:
    contexts: stage

app:
  event:
    booking:
      ttl-minutes: 30
      grace-period-minutes: 5
    waitlist:
      notification-window-minutes: 30
    capacity:
      race-condition-protection: true

logging:
  level:
    org.aquastream.event: INFO
    org.hibernate.SQL: WARN
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
  event:
    booking:
      ttl-minutes: 30
      grace-period-minutes: 5
    waitlist:
      notification-window-minutes: 30
      auto-process: true
    completion:
      auto-complete: true
    capacity:
      atomic-decrement: true
      race-condition-protection: true
    audit:
      enabled: true
      retain-days: 90

logging:
  level:
    org.aquastream.event: WARN
    org.hibernate.SQL: ERROR
```

## Database Management

### Liquibase Migrations

**Changelog**: `backend-event-db/src/main/resources/migration/liquibase/master.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.21.xsd">

    <include file="sql/0001_create_tables.sql" relativeToChangelogFile="true"/>
    <include file="sql/0002_indexes_constraints.sql" relativeToChangelogFile="true"/>
    <include file="sql/0003_add_audit_tables.sql" relativeToChangelogFile="true"/>

</databaseChangeLog>
```

### Схема event

**Таблицы**:
- `event.events` - основная таблица событий
- `event.bookings` - бронирования с TTL
- `event.booking_logs` - audit trail для bookings
- `event.waitlist` - очередь ожидания (FIFO)
- `event.waitlist_audit` - история waitlist
- `event.organizers` - организаторы событий
- `event.team_members` - команда события
- `event.favorites` - избранные события пользователей
- `event.faq_items` - FAQ для событий

### Применение миграций

```bash
# Автоматически при старте сервиса
docker compose up -d backend-event

# Ручное применение (если нужно)
docker exec -it aquastream-backend-event \
  java -jar app.jar \
  --spring.liquibase.contexts=dev \
  --liquibase.command=update
```

### Rollback миграций

```bash
# Откат последней миграции
docker exec -it aquastream-backend-event \
  java -jar app.jar \
  --liquibase.command=rollback \
  --liquibase.rollback-count=1

# Откат к конкретной дате
docker exec -it aquastream-backend-event \
  java -jar app.jar \
  --liquibase.command=rollback \
  --liquibase.rollback-date=2024-01-15
```

### Проверка состояния

```bash
# Список примененных changesets
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, author, filename, dateexecuted FROM event.databasechangelog ORDER BY orderexecuted;"

# Структура таблиц
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "\dt event.*"

# Индексы
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "\di event.*"
```

## Scheduled Jobs

Event Service выполняет критичные фоновые задачи для поддержания консистентности данных.

### 1. Expire Pending Bookings

**Задача**: Истечение PENDING брони через 30 минут

```java
@Scheduled(fixedDelayString = "${app.event.booking.expiration-check-interval}")
public void expirePendingBookings() {
    // Каждую минуту проверяет PENDING брони с expiresAt < NOW()
    // Меняет status на EXPIRED
    // Увеличивает available на 1
    // Запускает waitlist processing
}
```

**Конфигурация**:

```yaml
app:
  event:
    booking:
      expiration-check-interval: 60000  # 60 секунд (1 минута)
```

**Мониторинг**:

```bash
# Проверить последний запуск
curl http://localhost:8102/actuator/scheduledtasks

# Логи
docker logs aquastream-backend-event | grep "Expiring pending bookings"

# Метрика
curl http://localhost:8102/actuator/metrics/aquastream.bookings.expired
```

**Алерт**: Если > 100 брони истекают за раз → проблема с payment service

### 2. Cleanup Expired Waitlist Notifications

**Задача**: Очистка просроченных уведомлений waitlist

```java
@Scheduled(fixedDelayString = "${app.event.waitlist.cleanup-interval-minutes}")
public void cleanupExpiredWaitlistNotifications() {
    // Каждые 5 минут проверяет NOTIFIED записи
    // Если notificationWindowEnd < NOW() → status = EXPIRED
    // Освобождает место для следующего в очереди
}
```

**Конфигурация**:

```yaml
app:
  event:
    waitlist:
      cleanup-interval-minutes: 5
      notification-window-minutes: 30
```

**Мониторинг**:

```bash
# Логи
docker logs aquastream-backend-event | grep "Cleanup expired waitlist"

# Метрика
curl http://localhost:8102/actuator/metrics/aquastream.waitlist.expired
```

### 3. Complete Finished Events

**Задача**: Автозавершение прошедших событий

```java
@Scheduled(cron = "${app.event.completion.check-interval-cron}")
public void completeFinishedEvents() {
    // Каждый час проверяет события
    // Если status=PUBLISHED и dateEnd < NOW() → status=COMPLETED
    // Меняет bookings: CONFIRMED → COMPLETED
    // Обновляет waitlist: снимает всех
}
```

**Конфигурация**:

```yaml
app:
  event:
    completion:
      check-interval-cron: "0 0 * * * *"  # Каждый час
      auto-complete: true
```

**Мониторинг**:

```bash
# Логи
docker logs aquastream-backend-event | grep "Completing finished events"

# Метрика
curl http://localhost:8102/actuator/metrics/aquastream.events.completed
```

### Проверка всех scheduled tasks

```bash
# Все задачи и их статус
curl http://localhost:8102/actuator/scheduledtasks | jq

# Output:
{
  "cron": [
    {
      "runnable": {
        "target": "org.aquastream.event.service.EventCompletionService.completeFinishedEvents"
      },
      "expression": "0 0 * * * *"
    }
  ],
  "fixedDelay": [
    {
      "runnable": {
        "target": "org.aquastream.event.service.BookingExpirationService.expirePendingBookings"
      },
      "initialDelay": 0,
      "interval": 60000
    },
    {
      "runnable": {
        "target": "org.aquastream.event.service.WaitlistCleanupService.cleanupExpiredWaitlistNotifications"
      },
      "initialDelay": 0,
      "interval": 300000
    }
  ]
}
```

## Monitoring

### Health Checks

**Endpoint**: `http://localhost:8102/actuator/health`

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
    "paymentService": {
      "status": "UP",
      "details": {
        "url": "http://backend-payment:8104",
        "responseTime": "120ms"
      }
    },
    "notificationService": {
      "status": "UP",
      "details": {
        "url": "http://backend-notification:8105",
        "responseTime": "85ms"
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
curl http://localhost:8102/actuator/health

# Детальный статус (с авторизацией)
curl -H "X-User-Role: ADMIN" \
     http://localhost:8102/actuator/health
```

### Метрики

**Endpoint**: `http://localhost:8102/actuator/metrics`

**Доступные метрики**:

```bash
# JVM memory
curl http://localhost:8102/actuator/metrics/jvm.memory.used

# Database connections
curl http://localhost:8102/actuator/metrics/hikaricp.connections.active

# HTTP requests
curl http://localhost:8102/actuator/metrics/http.server.requests

# Custom metrics (через backend-common)
curl http://localhost:8102/actuator/metrics/aquastream.requests.total
curl http://localhost:8102/actuator/metrics/aquastream.latency.p95

# Business metrics
curl http://localhost:8102/actuator/metrics/aquastream.bookings.expired
curl http://localhost:8102/actuator/metrics/aquastream.bookings.confirmed
curl http://localhost:8102/actuator/metrics/aquastream.waitlist.processed
curl http://localhost:8102/actuator/metrics/aquastream.events.completed
```

### Логи

```bash
# Просмотр логов
docker logs aquastream-backend-event

# Последние 100 строк
docker logs --tail 100 aquastream-backend-event

# Follow mode
docker logs -f aquastream-backend-event

# С временными метками
docker logs -t aquastream-backend-event

# Фильтрация по уровню
docker logs aquastream-backend-event 2>&1 | grep ERROR
docker logs aquastream-backend-event 2>&1 | grep WARN
```

**Формат логов**:

```
2024-01-15 10:23:45.123 INFO  [backend-event,abc123xyz] o.a.event.service.BookingService - Booking created: id=550e8400-e29b-41d4-a716-446655440000, status=PENDING, expiresAt=2024-01-15T10:53:45.123Z
2024-01-15 10:24:12.456 WARN  [backend-event,def456uvw] o.a.event.service.BookingService - Event capacity exceeded: eventId=123, available=0
2024-01-15 10:25:33.789 ERROR [backend-event,ghi789rst] o.a.event.api.controller.BookingController - Payment service unavailable: timeout after 5000ms
2024-01-15 10:30:00.000 INFO  [backend-event,jkl012mno] o.a.event.scheduler.BookingExpirationService - Expiring pending bookings: found 15 expired bookings
2024-01-15 11:00:00.000 INFO  [backend-event,pqr345stu] o.a.event.scheduler.EventCompletionService - Completing finished events: found 3 events to complete
```

### Алерты

**Рекомендуемые алерты**:

1. **Service Down**
   ```bash
   # Health check failed
   curl -f http://localhost:8102/actuator/health || echo "ALERT: Event service is down"
   ```

2. **High Error Rate**
   ```bash
   # Более 5% запросов с ошибками за последние 5 минут
   docker logs --since 5m aquastream-backend-event 2>&1 | grep ERROR | wc -l
   ```

3. **Database Connection Issues**
   ```bash
   # HikariCP connection timeout
   docker logs --since 5m aquastream-backend-event 2>&1 | grep "HikariPool.*timeout"
   ```

4. **High Memory Usage**
   ```bash
   # JVM heap > 80%
   curl http://localhost:8102/actuator/metrics/jvm.memory.used
   ```

5. **Payment Service Integration Failure**
   ```bash
   # Payment service недоступен
   docker logs --since 5m aquastream-backend-event 2>&1 | grep "Payment service unavailable"
   ```

6. **Scheduled Jobs Stuck**
   ```bash
   # Expire bookings не выполнялся > 5 минут
   docker logs --since 10m aquastream-backend-event 2>&1 | grep "Expiring pending bookings" | tail -1
   ```

7. **Capacity Race Condition**
   ```bash
   # Частые BookingConflictException
   docker logs --since 5m aquastream-backend-event 2>&1 | grep "BookingConflictException" | wc -l
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
- **GUEST**: просмотр опубликованных событий (GET /api/v1/events)
- **USER**: создание брони, просмотр своих броней, waitlist, favorites
- **ORGANIZER**: создание/редактирование событий, управление участниками
- **ADMIN**: полный доступ, внутренние endpoints

**Rate Limiting**:

```java
// Защита от злоупотребления
@RateLimit(key = "booking-create", limit = 10, window = "1m")
public BookingDto createBooking(...) { ... }

@RateLimit(key = "event-list", limit = 100, window = "1m")
public Page<EventDto> getEvents(...) { ... }
```

### Secrets Management

**Секреты через environment**:

```bash
# .env (не коммитить в Git!)
POSTGRES_PASSWORD=secure_password_here
JWT_SECRET=your-jwt-secret-key
PAYMENT_API_KEY=payment-service-api-key

# Docker secrets (production)
echo "secure_password" | docker secret create db_password -
echo "payment-api-key" | docker secret create payment_api_key -
```

**Best practices**:
- ✅ Используйте `.env.example` с плейсхолдерами
- ✅ Ротация паролей каждые 90 дней
- ✅ Разные пароли для dev/stage/prod
- ❌ Никогда не коммитьте секреты в Git

### Audit Logging

**Все критичные операции логируются**:

```sql
-- Пример audit записи в booking_logs
INSERT INTO event.booking_logs (
  booking_id,
  user_id,
  action,
  old_status,
  new_status,
  details,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440000',
  'STATUS_CHANGE',
  'PENDING',
  'CONFIRMED',
  '{"payment_id": "pay_123", "amount": 1500.00}'::jsonb,
  NOW()
);
```

**Хранение**:

```yaml
app:
  event:
    audit:
      enabled: true
      retain-days: 90  # 90 дней для compliance
```

## Troubleshooting

### Сервис не стартует

**Проблема**: Container exits immediately

**Решение**:

```bash
# 1. Проверить логи
docker logs aquastream-backend-event

# 2. Проверить зависимости
docker ps | grep postgres

# 3. Проверить переменные окружения
docker exec aquastream-backend-event env | grep POSTGRES

# 4. Проверить подключение к БД
docker exec aquastream-backend-event \
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
docker network inspect aquastream-net | grep backend-event
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
  -c "SELECT * FROM event.databasechangelog ORDER BY orderexecuted DESC LIMIT 5;"

# 2. Проверить locks
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT * FROM event.databasechangeloglock;"

# 3. Разблокировать (если залочено)
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "UPDATE event.databasechangeloglock SET locked=false, lockgranted=null, lockedby=null WHERE id=1;"

# 4. Пересоздать сервис
docker compose restart backend-event
```

### Race condition на capacity

**Проблема**: `BookingConflictException` при одновременных бронированиях

**Решение** (уже реализовано):

```java
// Atomic decrement с проверкой
@Modifying
@Query("UPDATE EventEntity e SET e.available = e.available - 1 " +
       "WHERE e.id = :eventId AND e.available > 0")
int decrementAvailableIfPositive(@Param("eventId") UUID eventId);

// В BookingService
int updated = eventRepository.decrementAvailableIfPositive(event.getId());
if (updated == 0) {
    bookingRepository.delete(booking);
    throw new BookingConflictException("Event is at full capacity");
}
```

**Проверка**:

```bash
# Проверить available field
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, title, capacity, available FROM event.events WHERE id='event-uuid';"

# Проверить активные bookings
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT COUNT(*) FROM event.bookings WHERE event_id='event-uuid' AND status IN ('PENDING', 'CONFIRMED');"
```

### Scheduled jobs не выполняются

**Проблема**: Expire bookings / Waitlist cleanup / Event completion не работают

**Решение**:

```bash
# 1. Проверить что scheduled tasks включены
curl http://localhost:8102/actuator/scheduledtasks

# 2. Проверить логи
docker logs aquastream-backend-event | grep "Scheduled"

# 3. Проверить конфигурацию
docker exec aquastream-backend-event env | grep "app.event"

# 4. Проверить pool size
# application.yml:
spring:
  task:
    scheduling:
      pool:
        size: 2  # Должно быть >= количества задач

# 5. Перезапустить сервис
docker compose restart backend-event
```

### Payment Service Integration Issues

**Проблема**: Bookings застревают в PENDING из-за недоступности Payment Service

**Решение**:

```bash
# 1. Проверить Payment Service health
curl http://localhost:8104/actuator/health

# 2. Проверить connectivity
docker exec aquastream-backend-event curl -f http://backend-payment:8104/actuator/health

# 3. Проверить timeout настройки
# application.yml:
services:
  payment:
    timeout-ms: 5000  # Увеличить если нужно

# 4. Проверить stuck bookings
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, event_id, user_id, status, payment_status, expires_at FROM event.bookings WHERE status='PENDING' AND payment_status='PROCESSING' AND expires_at < NOW();"

# 5. Ручное исправление (если Payment Service восстановился)
# Запустить expire bookings job вручную
curl -X POST http://localhost:8102/internal/jobs/expire-bookings
```

### Waitlist не обрабатывается

**Проблема**: После отмены брони waitlist не активируется

**Решение**:

```bash
# 1. Проверить waitlist записи
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, event_id, user_id, status, priority, notification_sent_at FROM event.waitlist WHERE event_id='event-uuid' ORDER BY priority;"

# 2. Проверить auto-process enabled
# application.yml:
app:
  event:
    waitlist:
      auto-process: true

# 3. Проверить cleanup job
curl http://localhost:8102/actuator/scheduledtasks | jq '.fixedDelay[] | select(.runnable.target | contains("WaitlistCleanup"))'

# 4. Ручная обработка waitlist
curl -X POST http://localhost:8102/internal/jobs/process-waitlist?eventId=event-uuid
```

### High memory usage

**Проблема**: Container использует > 768MB memory

**Решение**:

```bash
# 1. Проверить memory usage
docker stats aquastream-backend-event

# 2. Проверить heap size
curl http://localhost:8102/actuator/metrics/jvm.memory.used

# 3. Увеличить memory limit (если нужно)
# В docker-compose.yml:
mem_limit: 1024m

# 4. Настроить JVM heap (application.yml)
JAVA_OPTS="-Xms512m -Xmx768m"

# 5. Проверить memory leaks
# Heap dump
docker exec aquastream-backend-event jmap -dump:format=b,file=/tmp/heapdump.hprof <PID>
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
docker logs aquastream-backend-event | grep "SELECT"

# 3. Проверить индексы
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "\di event.*"

# 4. EXPLAIN ANALYZE медленного запроса
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "EXPLAIN ANALYZE SELECT * FROM event.bookings WHERE user_id='uuid' AND status='CONFIRMED';"

# 5. Добавить недостающие индексы (через Liquibase)
CREATE INDEX idx_bookings_user_status ON event.bookings(user_id, status);
```

### Booking TTL Issues

**Проблема**: PENDING брони не истекают через 30 минут

**Решение**:

```bash
# 1. Проверить expiresAt field
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, status, expires_at, NOW() FROM event.bookings WHERE status='PENDING' ORDER BY expires_at;"

# 2. Проверить scheduled job
docker logs aquastream-backend-event | grep "Expiring pending bookings"

# 3. Проверить конфигурацию TTL
# application.yml:
app:
  event:
    booking:
      ttl-minutes: 30
      expiration-check-interval: 60000

# 4. Ручное истечение (если нужно)
docker exec -it aquastream-postgres psql -U aquastream -d aquastream <<EOF
UPDATE event.bookings
SET status = 'EXPIRED'
WHERE status = 'PENDING' AND expires_at < NOW();

UPDATE event.events e
SET available = available + (
  SELECT COUNT(*) FROM event.bookings b
  WHERE b.event_id = e.id AND b.status = 'EXPIRED'
);
EOF
```

## Backup & Recovery

### Backup базы данных

```bash
# Backup только схемы event
docker exec aquastream-postgres pg_dump \
  -U aquastream -d aquastream -n event \
  --format=custom --file=/tmp/event_backup.dump

# Скопировать backup
docker cp aquastream-postgres:/tmp/event_backup.dump ./backups/

# С сжатием
docker exec aquastream-postgres pg_dump \
  -U aquastream -d aquastream -n event \
  --format=custom --compress=9 --file=/tmp/event_backup.dump.gz
```

### Restore базы данных

```bash
# Копировать backup в контейнер
docker cp ./backups/event_backup.dump aquastream-postgres:/tmp/

# Restore
docker exec aquastream-postgres pg_restore \
  -U aquastream -d aquastream \
  --clean --if-exists \
  /tmp/event_backup.dump

# С подтверждением
docker exec -it aquastream-postgres pg_restore \
  -U aquastream -d aquastream \
  --clean --if-exists --verbose \
  /tmp/event_backup.dump
```

### Backup расписание

**Production рекомендация**:

```bash
# Crontab для ежедневного backup
0 2 * * * docker exec aquastream-postgres pg_dump \
  -U aquastream -d aquastream -n event \
  --format=custom --compress=9 \
  --file=/backups/event_$(date +\%Y\%m\%d).dump

# Удаление старых backups (> 30 дней)
0 3 * * * find /backups -name "event_*.dump" -mtime +30 -delete
```

### Disaster Recovery Plan

**1. Полная потеря БД**:

```bash
# 1. Остановить сервис
docker compose stop backend-event

# 2. Восстановить последний backup
docker cp ./backups/event_20240115.dump aquastream-postgres:/tmp/
docker exec aquastream-postgres pg_restore \
  -U aquastream -d aquastream --clean /tmp/event_20240115.dump

# 3. Запустить сервис (Liquibase применит недостающие миграции)
docker compose up -d backend-event

# 4. Проверить health
curl http://localhost:8102/actuator/health
```

**2. Corruption отдельной таблицы**:

```bash
# Restore только конкретной таблицы
docker exec aquastream-postgres pg_restore \
  -U aquastream -d aquastream \
  --table=bookings \
  /tmp/event_backup.dump
```

## Performance Optimization

### JPA/Hibernate

**Fetch Join для устранения N+1**:

```java
@Query("SELECT e FROM EventEntity e " +
       "LEFT JOIN FETCH e.organizer o " +
       "WHERE e.status = 'PUBLISHED'")
List<EventEntity> findPublishedEventsWithOrganizers();

@Query("SELECT b FROM BookingEntity b " +
       "LEFT JOIN FETCH b.event e " +
       "LEFT JOIN FETCH e.organizer " +
       "WHERE b.userId = :userId")
List<BookingEntity> findUserBookingsWithDetails(@Param("userId") UUID userId);
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
      maximum-pool-size: 15       # Больше чем у crew из-за scheduled jobs
      minimum-idle: 3
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000  # Detect connection leaks
```

### Индексы

**Критичные** (уже применены через Liquibase):

```sql
-- Events
CREATE INDEX idx_events_status_date ON event.events(status, date_start);
CREATE INDEX idx_events_organizer ON event.events(organizer_id);
CREATE INDEX idx_events_published_date ON event.events(status, date_start) WHERE status = 'PUBLISHED';

-- Bookings (критичные для performance)
CREATE INDEX idx_bookings_user_status ON event.bookings(user_id, status);
CREATE INDEX idx_bookings_event_status ON event.bookings(event_id, status);
CREATE INDEX idx_bookings_expires_at ON event.bookings(expires_at) WHERE status = 'PENDING';
CREATE INDEX idx_bookings_payment_status ON event.bookings(payment_status);

-- Waitlist (для FIFO обработки)
CREATE INDEX idx_waitlist_event_priority ON event.waitlist(event_id, priority);
CREATE INDEX idx_waitlist_status_notified ON event.waitlist(status, notification_sent_at);

-- Audit (для запросов истории)
CREATE INDEX idx_booking_logs_booking ON event.booking_logs(booking_id, created_at);
CREATE INDEX idx_waitlist_audit_user ON event.waitlist_audit(user_id, event_id);

-- Favorites (composite key оптимизация)
CREATE INDEX idx_favorites_user ON event.favorites(user_id);
```

### Кэширование

**Candidate для кэша** (будущее улучшение):

```java
@Cacheable(value = "published-events", key = "#root.methodName")
public List<EventDto> getPublishedEvents() {
    // Часто запрашиваемый список, редко меняется
}

@Cacheable(value = "event-details", key = "#eventId")
public EventDto getEventById(UUID eventId) {
    // ...
}

@CacheEvict(value = {"event-details", "published-events"}, allEntries = true)
public EventDto updateEvent(UUID eventId, UpdateEventRequest request) {
    // Инвалидация кэша при изменении
}
```

**Redis конфигурация**:

```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 300000  # 5 минут
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

### Query optimization для Scheduled Jobs

**Проблема**: Expire bookings сканирует всю таблицу

**Решение**: Partial index

```sql
-- Только PENDING брони с expires_at
CREATE INDEX idx_bookings_expires_pending
ON event.bookings(expires_at)
WHERE status = 'PENDING';

-- Query использует index
SELECT * FROM event.bookings
WHERE status = 'PENDING' AND expires_at < NOW();
```

### Pagination для больших списков

```java
// Используйте Pageable для всех списков
@GetMapping("/api/v1/events")
public Page<EventDto> getEvents(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    Pageable pageable) {
    return eventService.getEvents(pageable);
}

// Ограничьте max page size
@PageableDefault(size = 20, sort = "dateStart")
Pageable pageable
```

## Maintenance

### Обновление сервиса

```bash
# 1. Собрать новый image
cd backend-event
./gradlew clean build
docker build -t aquastream/backend-event:dev .

# 2. Остановить старый контейнер
docker compose stop backend-event

# 3. Запустить новый
docker compose up -d backend-event

# 4. Проверить логи
docker logs -f aquastream-backend-event

# 5. Health check
curl http://localhost:8102/actuator/health

# 6. Проверить scheduled tasks
curl http://localhost:8102/actuator/scheduledtasks
```

### Rolling update (zero downtime)

```bash
# 1. Запустить второй экземпляр
docker compose up -d --scale backend-event=2

# 2. Подождать health check
sleep 30

# 3. Удалить старый
docker stop aquastream-backend-event-old

# 4. Вернуть scale=1
docker compose up -d --scale backend-event=1
```

### Очистка данных

```bash
# 1. Удалить старые audit logs (> 90 дней)
docker exec -it aquastream-postgres psql -U aquastream -d aquastream <<EOF
DELETE FROM event.booking_logs
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM event.waitlist_audit
WHERE created_at < NOW() - INTERVAL '90 days';
EOF

# 2. Удалить EXPIRED/CANCELLED брони (> 1 год)
docker exec -it aquastream-postgres psql -U aquastream -d aquastream <<EOF
DELETE FROM event.bookings
WHERE status IN ('EXPIRED', 'CANCELLED')
  AND updated_at < NOW() - INTERVAL '1 year';
EOF

# 3. Удалить COMPLETED события (> 2 года)
docker exec -it aquastream-postgres psql -U aquastream -d aquastream <<EOF
DELETE FROM event.events
WHERE status = 'COMPLETED'
  AND date_end < NOW() - INTERVAL '2 years';
EOF

# 4. Очистка waitlist (старше 6 месяцев)
docker exec -it aquastream-postgres psql -U aquastream -d aquastream <<EOF
DELETE FROM event.waitlist
WHERE status IN ('EXPIRED', 'CANCELLED')
  AND created_at < NOW() - INTERVAL '6 months';
EOF

# 5. Vacuum для освобождения места
docker exec -it aquastream-postgres psql -U aquastream -d aquastream <<EOF
VACUUM FULL event.bookings;
VACUUM FULL event.booking_logs;
VACUUM FULL event.waitlist;
VACUUM FULL event.waitlist_audit;
EOF
```

### Мониторинг размера таблиц

```bash
# Размер всех таблиц schema event
docker exec -it aquastream-postgres psql -U aquastream -d aquastream <<EOF
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'event'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
EOF

# Output:
 schemaname | tablename      | size
------------+----------------+--------
 event      | bookings       | 150 MB
 event      | events         | 45 MB
 event      | booking_logs   | 98 MB
 event      | waitlist       | 12 MB
 event      | favorites      | 8 MB
```

### Reindex для производительности

```bash
# Reindex всех индексов schema event
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "REINDEX SCHEMA event;"

# Или отдельных таблиц
docker exec -it aquastream-postgres psql -U aquastream -d aquastream \
  -c "REINDEX TABLE event.bookings;"
```

## См. также

- [README](README.md) - обзор сервиса
- [API Documentation](api.md) - детальное описание API
- [Business Logic](business-logic.md) - бизнес-правила и валидации
- [Database Schema](../database.md) - схема event в PostgreSQL
- [Backend Common Operations](../common/README.md) - общие backend инструменты