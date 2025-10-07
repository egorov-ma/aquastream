# Event Service - Operations

## Обзор

Event Service — критичный сервис с автоматическим управлением TTL бронирований и FIFO waitlist.

**Порт**: 8102
**Контейнер**: `aquastream-backend-event`
**Образ**: `aquastream/backend-event:dev`
**Resources**: 768MB RAM, 1.0 CPU

> **Общая инфраструктура**: См. [Operations Guide](../../operations/README.md)

## Запуск сервиса

```bash
# Development stack
make up-dev

# Health check
curl http://localhost:8102/actuator/health

# Логи
docker logs -f aquastream-backend-event

# Перезапуск
docker compose restart backend-event
docker compose up -d --build backend-event  # с rebuild
```

## Конфигурация

### Environment Variables

| Переменная | Значение | Описание |
|------------|----------|----------|
| `POSTGRES_DB` | aquastream | База данных |
| `POSTGRES_USER` | aquastream | Пользователь |
| `SPRING_PROFILES_ACTIVE` | dev \| prod | Профиль |
| `PAYMENT_SERVICE_URL` | http://backend-payment:8104 | Payment Service |
| `NOTIFICATION_SERVICE_URL` | http://backend-notification:8105 | Notification Service |

### Application Profiles

| Параметр | dev | prod |
|----------|-----|------|
| `booking.ttl-minutes` | 5 | 30 |
| `booking.grace-period-minutes` | 1 | 5 |
| `waitlist.notification-window-minutes` | 10 | 30 |
| `waitlist.auto-process` | true | true |
| `audit.retain-days` | - | 90 |

## Database

**Схема**: `event`

**Таблицы**: events, bookings, booking_logs, waitlist, waitlist_audit, organizers, team_members, favorites, faq_items

### Миграции

```bash
# Liquibase changelog
backend-event/backend-event-db/src/main/resources/migration/liquibase/master.xml

# Применить миграции
make liq-event-update

# Показать SQL (без применения)
make liq-event-sql

# Backup & Restore
make backup
make restore SCHEMA=event FILE=backend-infra/backup/artifacts/event_20250930.dump.gz
```

## Scheduled Jobs

Event Service выполняет **3 критичных фоновых задачи**:

| Job | Частота | Задача | Мониторинг |
|-----|---------|--------|------------|
| **Expire Pending Bookings** | Каждую минуту | PENDING → EXPIRED, вернуть места, обработать waitlist | `grep "Expiring pending bookings"` |
| **Cleanup Waitlist Notifications** | Каждые 5 минут | Удалить expired уведомления (30 мин окно) | `grep "Cleanup expired waitlist"` |
| **Complete Finished Events** | Каждый час | События с `dateEnd < now` → COMPLETED | `grep "Completing finished events"` |

### Проверка scheduled tasks

```bash
# Список всех задач
curl http://localhost:8102/actuator/scheduledtasks | jq

# Логи jobs
docker logs aquastream-backend-event | grep -E "Expiring|Cleanup|Completing"
```

**Алерт**: Если > 100 брони истекают за раз → проблема с Payment Service

## Мониторинг

### Health Checks

```bash
# Basic
curl http://localhost:8102/actuator/health

# Detailed (с авторизацией)
curl -H "X-User-Role: ADMIN" http://localhost:8102/actuator/health

# Docker Compose: interval 10s, timeout 5s, retries 10
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
# Stream
docker logs -f aquastream-backend-event

# Последние 100 строк
docker logs --tail 100 aquastream-backend-event

# Ошибки
docker logs aquastream-backend-event | grep ERROR

# Scheduled jobs
docker logs aquastream-backend-event | grep -E "Expiring|Cleanup|Completing"
```

## Troubleshooting

### Сервис не стартует

```bash
# 1. Логи
docker logs aquastream-backend-event

# 2. Зависимости
docker ps | grep -E "postgres|redis"

# 3. Environment
docker exec aquastream-backend-event env | grep -E "POSTGRES|SPRING"

# 4. БД
docker exec aquastream-postgres pg_isready -U aquastream
```

### Database connection errors

```bash
# Проверить PostgreSQL
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "SELECT 1"

# Схема event
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "\dt event.*"
```

### Scheduled jobs не выполняются

```bash
# 1. Проверить tasks
curl http://localhost:8102/actuator/scheduledtasks

# 2. Логи jobs
docker logs aquastream-backend-event | grep -E "Scheduled|@Scheduled|expiring"

# 3. Конфигурация
docker exec aquastream-backend-event env | grep "app.event"

# 4. Task pool size (должен быть >= количества jobs)
# В application.yml:
spring:
  task:
    scheduling:
      pool:
        size: 2
```

### Bookings не истекают

```bash
# 1. Проверить expiresAt
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, status, expires_at, NOW() FROM event.bookings WHERE status='PENDING' ORDER BY expires_at LIMIT 10;"

# 2. Job logs
docker logs aquastream-backend-event --since 5m | grep "Expiring pending bookings"

# 3. Ручное истечение (emergency)
docker exec aquastream-postgres psql -U aquastream -d aquastream <<EOF
UPDATE event.bookings SET status = 'EXPIRED' WHERE status = 'PENDING' AND expires_at < NOW();
UPDATE event.events e SET available = available + (
  SELECT COUNT(*) FROM event.bookings b WHERE b.event_id = e.id AND b.status = 'EXPIRED'
);
EOF
```

### Payment Service Integration Issues

```bash
# 1. Payment Service health
curl http://localhost:8104/actuator/health

# 2. Connectivity
docker exec aquastream-backend-event curl -f http://backend-payment:8104/actuator/health

# 3. Stuck bookings
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, status, payment_status, expires_at FROM event.bookings WHERE status='PENDING' AND payment_status='PROCESSING' AND expires_at < NOW();"
```

### Waitlist не обрабатывается

```bash
# 1. Записи waitlist
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, event_id, user_id, status, priority FROM event.waitlist WHERE event_id='<event-uuid>' ORDER BY priority;"

# 2. Конфигурация auto-process
# В application.yml:
app:
  event:
    waitlist:
      auto-process: true

# 3. Cleanup job
docker logs aquastream-backend-event --since 10m | grep "Cleanup expired waitlist"
```

### Race condition на capacity

```bash
# Проверить available vs активные bookings
docker exec aquastream-postgres psql -U aquastream -d aquastream <<EOF
SELECT e.id, e.title, e.capacity, e.available,
  (SELECT COUNT(*) FROM event.bookings b WHERE b.event_id = e.id AND b.status IN ('PENDING', 'CONFIRMED')) as active_bookings
FROM event.events e WHERE e.id = '<event-uuid>';
EOF

# Ручное исправление
docker exec aquastream-postgres psql -U aquastream -d aquastream <<EOF
UPDATE event.events e
SET available = capacity - (
  SELECT COUNT(*) FROM event.bookings b WHERE b.event_id = e.id AND b.status IN ('PENDING', 'CONFIRMED')
)
WHERE e.id = '<event-uuid>';
EOF
```

### High memory usage

```bash
# 1. Memory stats
docker stats aquastream-backend-event

# 2. Heap size
curl http://localhost:8102/actuator/metrics/jvm.memory.used | jq

# 3. Увеличить limit (docker-compose.yml)
mem_limit: 1024m

# 4. Heap dump
docker exec aquastream-backend-event jmap -dump:format=b,file=/tmp/heapdump.hprof 1
docker cp aquastream-backend-event:/tmp/heapdump.hprof ./
```

### Slow queries

```bash
# 1. SQL logging (application-dev.yml)
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.orm.jdbc.bind: TRACE

# 2. Индексы
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "\di event.*"

# 3. EXPLAIN ANALYZE
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "EXPLAIN ANALYZE SELECT * FROM event.bookings WHERE user_id='<uuid>' AND status='CONFIRMED';"
```

## Performance Optimization

### Критичные индексы

```sql
-- Bookings (для scheduled jobs)
CREATE INDEX idx_bookings_expires_at ON event.bookings(expires_at) WHERE status = 'PENDING';
CREATE INDEX idx_bookings_user_status ON event.bookings(user_id, status);
CREATE INDEX idx_bookings_event_status ON event.bookings(event_id, status);

-- Waitlist (для FIFO)
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

## Security

### Container Hardening

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

```sql
-- Все операции логируются в booking_logs
SELECT * FROM event.booking_logs
WHERE booking_id = '<uuid>'
ORDER BY created_at DESC;
```

**Retention**: 90 дней (configurable)

---

См. [README](README.md), [API Documentation](api.md), [Business Logic](business-logic.md), [Operations Infrastructure](../../operations/infrastructure.md), [Deployment Guide](../../operations/deployment.md), [Backup & Recovery](../../operations/backup-recovery.md).