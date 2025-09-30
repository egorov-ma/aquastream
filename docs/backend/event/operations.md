# Event Service - Operations

## Обзор

Event Service управляет событиями, бронированиями, waitlist и избранным. Включает критичные scheduled jobs для TTL управления.

**Порт**: 8102
**Контейнер**: `aquastream-backend-event`
**Образ**: `aquastream/backend-event:dev`
**Memory**: 768MB
**CPU**: 1.0

> **Общая инфраструктура**: См. [Operations Guide](../../operations/README.md) для команд развертывания через Makefile

## Запуск сервиса

### Development

```bash
# Запустить весь dev stack (включая event service)
make up-dev

# Проверить health
curl http://localhost:8102/actuator/health

# Логи
docker logs -f aquastream-backend-event
```

### Отдельный перезапуск

```bash
# Перезапустить только event service
docker compose restart backend-event

# С rebuild образа
docker compose up -d --build backend-event
```

## Конфигурация

### Environment Variables

Основные переменные из `.env.dev`:

```bash
# Database (используется схема event)
POSTGRES_DB=aquastream
POSTGRES_USER=aquastream
POSTGRES_PASSWORD=postgres

# Application
SPRING_PROFILES_ACTIVE=dev

# Service URLs для интеграций
PAYMENT_SERVICE_URL=http://backend-payment:8104
NOTIFICATION_SERVICE_URL=http://backend-notification:8105
```

### Application Profiles

**dev**:
```yaml
app:
  event:
    booking:
      ttl-minutes: 5           # Короткий TTL для тестирования
      grace-period-minutes: 1
    waitlist:
      notification-window-minutes: 10
```

**prod**:
```yaml
app:
  event:
    booking:
      ttl-minutes: 30
      grace-period-minutes: 5
    waitlist:
      notification-window-minutes: 30
      auto-process: true
    audit:
      enabled: true
      retain-days: 90
```

## Database

### Схема

PostgreSQL схема: `event`

**Таблицы**:
- `events` - события
- `bookings` - бронирования с TTL
- `booking_logs` - audit trail
- `waitlist` - очередь ожидания (FIFO)
- `waitlist_audit` - история waitlist
- `organizers` - организаторы
- `team_members` - команда события
- `favorites` - избранные события
- `faq_items` - FAQ

### Миграции

**Liquibase** применяется автоматически при старте:

```bash
# Changelog location
backend-event/backend-event-db/src/main/resources/migration/liquibase/master.xml

# Ручное применение (если нужно)
make liq-event-update

# Показать SQL без применения
make liq-event-sql
```

### Backup & Restore

```bash
# Backup схемы event (через общий скрипт)
make backup

# Restore конкретной схемы
make restore SCHEMA=event FILE=backend-infra/backup/artifacts/event_20250930.dump.gz
```

## Scheduled Jobs

Event Service выполняет **3 критичных фоновых задачи**:

### 1. Expire Pending Bookings

**Частота**: Каждую минуту (60 секунд)
**Задача**: Истечение PENDING брони через 30 минут

```java
@Scheduled(fixedDelayString = "${app.event.booking.expiration-check-interval}")
public void expirePendingBookings() {
    // 1. Найти PENDING с expiresAt < NOW()
    // 2. Изменить status на EXPIRED
    // 3. Увеличить available на 1
    // 4. Запустить waitlist processing
    // 5. Создать audit log
}
```

**Мониторинг**:
```bash
# Проверить последний запуск
curl http://localhost:8102/actuator/scheduledtasks | jq '.fixedDelay[] | select(.runnable.target | contains("expirePendingBookings"))'

# Логи
docker logs aquastream-backend-event | grep "Expiring pending bookings"
```

**Алерт**: Если > 100 брони истекают за раз → проблема с payment service

### 2. Cleanup Expired Waitlist Notifications

**Частота**: Каждые 5 минут
**Задача**: Очистка просроченных уведомлений waitlist (30-minute window)

```java
@Scheduled(fixedDelayString = "${app.event.waitlist.cleanup-interval-minutes}")
public void cleanupExpiredWaitlistNotifications() {
    // 1. Найти NOTIFIED с notificationWindowEnd < NOW()
    // 2. Изменить status на EXPIRED
    // 3. Освободить место для следующего в очереди
}
```

**Мониторинг**:
```bash
# Логи
docker logs aquastream-backend-event | grep "Cleanup expired waitlist"
```

### 3. Complete Finished Events

**Частота**: Каждый час (cron: `0 0 * * * *`)
**Задача**: Автозавершение прошедших событий

```java
@Scheduled(cron = "${app.event.completion.check-interval-cron}")
public void completeFinishedEvents() {
    // 1. Найти PUBLISHED с dateEnd < NOW()
    // 2. Изменить status на COMPLETED
    // 3. Обновить bookings: CONFIRMED → COMPLETED
    // 4. Очистить waitlist
}
```

**Мониторинг**:
```bash
# Логи
docker logs aquastream-backend-event | grep "Completing finished events"
```

### Проверка всех scheduled tasks

```bash
# Список всех задач с расписанием
curl http://localhost:8102/actuator/scheduledtasks | jq
```

## Мониторинг

### Health Checks

```bash
# Basic health
curl http://localhost:8102/actuator/health

# Detailed (с авторизацией)
curl -H "X-User-Role: ADMIN" http://localhost:8102/actuator/health

# В Docker Compose (автоматический)
# interval: 10s, timeout: 5s, retries: 10
```

### Метрики

```bash
# JVM memory
curl http://localhost:8102/actuator/metrics/jvm.memory.used | jq

# HTTP requests
curl http://localhost:8102/actuator/metrics/http.server.requests | jq

# Business metrics
curl http://localhost:8102/actuator/metrics/aquastream.bookings.expired | jq
curl http://localhost:8102/actuator/metrics/aquastream.bookings.confirmed | jq
curl http://localhost:8102/actuator/metrics/aquastream.waitlist.processed | jq
```

### Логи

```bash
# Stream логов
docker logs -f aquastream-backend-event

# Последние 100 строк
docker logs --tail 100 aquastream-backend-event

# Поиск ошибок
docker logs aquastream-backend-event | grep ERROR

# Scheduled job executions
docker logs aquastream-backend-event | grep -E "Expiring|Cleanup|Completing"
```

## Troubleshooting

### Сервис не стартует

```bash
# 1. Проверить логи
docker logs aquastream-backend-event

# 2. Проверить зависимости (postgres, redis)
docker ps | grep -E "postgres|redis"

# 3. Проверить переменные окружения
docker exec aquastream-backend-event env | grep -E "POSTGRES|SPRING"

# 4. Проверить подключение к БД
docker exec aquastream-postgres pg_isready -U aquastream
```

### Database connection errors

```bash
# Проверить PostgreSQL
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "SELECT 1"

# Проверить схему event
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "\dt event.*"

# Проверить credentials
echo $POSTGRES_PASSWORD
```

### Scheduled jobs не выполняются

```bash
# 1. Проверить что scheduled tasks включены
curl http://localhost:8102/actuator/scheduledtasks

# 2. Проверить логи на ошибки в jobs
docker logs aquastream-backend-event | grep -E "Scheduled|@Scheduled|expiring"

# 3. Проверить конфигурацию
docker exec aquastream-backend-event env | grep "app.event"

# 4. Проверить task pool size
# В application.yml должно быть:
spring:
  task:
    scheduling:
      pool:
        size: 2  # >= количества scheduled jobs
```

### Bookings не истекают

```bash
# 1. Проверить expiresAt field в БД
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, status, expires_at, NOW() FROM event.bookings WHERE status='PENDING' ORDER BY expires_at LIMIT 10;"

# 2. Проверить job execution logs
docker logs aquastream-backend-event --since 5m | grep "Expiring pending bookings"

# 3. Ручное истечение (emergency)
docker exec aquastream-postgres psql -U aquastream -d aquastream <<EOF
UPDATE event.bookings SET status = 'EXPIRED' WHERE status = 'PENDING' AND expires_at < NOW();
UPDATE event.events e SET available = available + (SELECT COUNT(*) FROM event.bookings b WHERE b.event_id = e.id AND b.status = 'EXPIRED');
EOF
```

### Payment Service Integration Issues

```bash
# 1. Проверить Payment Service health
curl http://localhost:8104/actuator/health

# 2. Проверить connectivity из event service
docker exec aquastream-backend-event curl -f http://backend-payment:8104/actuator/health

# 3. Проверить stuck bookings
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, status, payment_status, expires_at FROM event.bookings WHERE status='PENDING' AND payment_status='PROCESSING' AND expires_at < NOW();"
```

### Waitlist не обрабатывается

```bash
# 1. Проверить waitlist записи
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, event_id, user_id, status, priority FROM event.waitlist WHERE event_id='<event-uuid>' ORDER BY priority;"

# 2. Проверить auto-process config
# В application.yml:
app:
  event:
    waitlist:
      auto-process: true

# 3. Проверить cleanup job
docker logs aquastream-backend-event --since 10m | grep "Cleanup expired waitlist"
```

### Race condition на capacity

```bash
# 1. Проверить available vs активные bookings
docker exec aquastream-postgres psql -U aquastream -d aquastream <<EOF
SELECT e.id, e.title, e.capacity, e.available,
       (SELECT COUNT(*) FROM event.bookings b WHERE b.event_id = e.id AND b.status IN ('PENDING', 'CONFIRMED')) as active_bookings
FROM event.events e
WHERE e.id = '<event-uuid>';
EOF

# 2. Если available != capacity - active_bookings, то есть проблема
# Ручное исправление:
docker exec aquastream-postgres psql -U aquastream -d aquastream <<EOF
UPDATE event.events e
SET available = capacity - (SELECT COUNT(*) FROM event.bookings b WHERE b.event_id = e.id AND b.status IN ('PENDING', 'CONFIRMED'))
WHERE e.id = '<event-uuid>';
EOF
```

### High memory usage

```bash
# 1. Проверить memory usage
docker stats aquastream-backend-event

# 2. Проверить heap size
curl http://localhost:8102/actuator/metrics/jvm.memory.used | jq

# 3. Увеличить memory limit (в docker-compose.yml)
mem_limit: 1024m

# 4. Heap dump для анализа
docker exec aquastream-backend-event jmap -dump:format=b,file=/tmp/heapdump.hprof 1
docker cp aquastream-backend-event:/tmp/heapdump.hprof ./
```

### Slow queries

```bash
# 1. Включить SQL logging (для dev)
# В application-dev.yml:
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.orm.jdbc.bind: TRACE

# 2. Проверить индексы
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "\di event.*"

# 3. EXPLAIN ANALYZE медленного запроса
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "EXPLAIN ANALYZE SELECT * FROM event.bookings WHERE user_id='<uuid>' AND status='CONFIRMED';"
```

## Performance Optimization

### Критичные индексы

Следующие индексы критичны для performance (автоматически создаются через Liquibase):

```sql
-- Bookings (для scheduled jobs)
CREATE INDEX idx_bookings_expires_at ON event.bookings(expires_at) WHERE status = 'PENDING';
CREATE INDEX idx_bookings_user_status ON event.bookings(user_id, status);
CREATE INDEX idx_bookings_event_status ON event.bookings(event_id, status);

-- Waitlist (для FIFO обработки)
CREATE INDEX idx_waitlist_event_priority ON event.waitlist(event_id, priority);
CREATE INDEX idx_waitlist_status_notified ON event.waitlist(status, notification_sent_at);

-- Events (для запросов)
CREATE INDEX idx_events_status_date ON event.events(status, date_start);
CREATE INDEX idx_events_published_date ON event.events(status, date_start) WHERE status = 'PUBLISHED';
```

### Connection Pool

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 15       # Больше из-за scheduled jobs
      minimum-idle: 3
      connection-timeout: 30000
      leak-detection-threshold: 60000
```

### Scheduled Job Optimization

**Проблема**: Expire bookings сканирует всю таблицу

**Решение**: Partial index используется автоматически
```sql
CREATE INDEX idx_bookings_expires_pending
ON event.bookings(expires_at)
WHERE status = 'PENDING';
```

Query planner автоматически использует этот index для:
```sql
SELECT * FROM event.bookings WHERE status = 'PENDING' AND expires_at < NOW();
```

## Security

### Container Hardening

Event Service контейнер использует все стандартные меры безопасности:
- Non-root user (UID 1000)
- Read-only filesystem
- Tmpfs для `/tmp`
- All capabilities dropped
- `no-new-privileges` security option

См. [Infrastructure Security](../../operations/infrastructure.md#security)

### API Security

- **Authentication**: JWT через Gateway
- **Authorization**: Role-based (GUEST/USER/ORGANIZER/ADMIN)
- **Rate Limiting**: Bucket4j через backend-common

**Critical endpoints** (только ORGANIZER):
- POST /api/v1/events
- PUT /api/v1/events/{id}
- DELETE /api/v1/events/{id}

### Audit Logging

Все критичные операции логируются в `booking_logs`:
```sql
SELECT * FROM event.booking_logs
WHERE booking_id = '<uuid>'
ORDER BY created_at DESC;
```

**Retention**: 90 дней (configurable)

## См. также

- [README](README.md) - обзор сервиса
- [API Documentation](api.md) - детальное описание API
- [Business Logic](business-logic.md) - бизнес-правила и валидации
- [Operations Infrastructure](../../operations/infrastructure.md) - общая инфраструктура
- [Deployment Guide](../../operations/deployment.md) - процесс развертывания
- [Backup & Recovery](../../operations/backup-recovery.md) - резервное копирование