# База данных

## Обзор

PostgreSQL 16, одна база данных с разделением по схемам для каждого сервиса. Миграции управляются через Liquibase.

## Подключение

### Development

```bash
Host: localhost
Port: 5432
Database: aquastream
User: aquastream
Password: password123

# JDBC URL
jdbc:postgresql://localhost:5432/aquastream

# psql
psql -h localhost -p 5432 -U aquastream -d aquastream
```

### Из контейнера

```bash
# Подключение к PostgreSQL контейнеру
docker exec -it aquastream-postgres psql -U aquastream -d aquastream

# Список схем
\dn

# Список таблиц в схеме
\dt user.*
```

## Схемы и ключевые таблицы

### user
```sql
users (id, username, password_hash, role, active)
profiles (user_id, phone, telegram, is_telegram_verified, extra)
refresh_sessions (jti, user_id, issued_at, expires_at, revoked_at)
recovery_codes (user_id, code_hash, used_at, expires_at)
audit_log (id, actor_user_id, action, target_type, target_id, payload)
```

### event
```sql
organizers (id, slug, name, logo_url, description, contacts, brand_color)
events (id, organizer_id, type, title, date_start, date_end, location, price, capacity, available, status)
bookings (id, event_id, user_id, status, amount, payment_status, payment_id, expires_at, created_by)
booking_logs (id, booking_id, action, old_value, new_value, actor_user_id)
waitlist (id, event_id, user_id, priority, notified_at, notification_expires_at)
favorites (user_id, event_id)
team_members (id, organizer_id, name, role, photo_url, bio)
faq_items (id, organizer_id, question, answer)
```

### crew
```sql
crews (id, event_id, name, type, capacity)
crew_assignments (id, crew_id, user_id, booking_id, seat_number, assigned_by)
team_preferences (user_id, event_id, prefers_with_user_ids[], avoids_user_ids[])
```

### payment
```sql
payments (id, booking_id, method, amount, currency, status, provider, provider_payment_id)
payment_receipts (id, payment_id, proof_url, reviewed_by, reviewed_at)
webhook_events (idempotency_key, provider, raw_payload, status, processed_at)
```

### notification
```sql
notification_prefs (user_id, category, channel, enabled)
telegram_subscriptions (user_id, telegram_username, telegram_chat_id, verified_at)
outbox (id, user_id, category, payload, status, attempts, sent_at)
```

### media
```sql
files (id, owner_type, owner_id, file_key, content_type, size_bytes, storage_url, expires_at)
```

## Миграции (Liquibase)

### Структура миграций

Каждый сервис управляет миграциями своей схемы:

```
backend-[service]-db/
└── src/main/resources/
    └── db/changelog/
        ├── db.changelog-master.xml          # Главный файл
        ├── changesets/
        │   ├── 001-initial-schema.sql       # Создание схемы и таблиц
        │   ├── 002-add-indexes.sql          # Индексы
        │   ├── 003-add-constraints.sql      # Ограничения
        │   └── ...
        └── data/
            └── seed-data.sql                # Начальные данные (dev)
```

### Запуск миграций

```bash
# Автоматически при старте сервиса
# Настроено в application.yml:
spring:
  liquibase:
    enabled: true
    change-log: classpath:db/changelog/db.changelog-master.xml
    default-schema: [service_schema]

# Вручную через Gradle
./gradlew :backend-user:backend-user-db:update

# Откат последнего changeset
./gradlew :backend-user:backend-user-db:rollback-count -Pcount=1
```

### Best Practices

- Каждый changeset - атомарная операция
- ID формата: `YYYYMMDD-HHmm-description`
- Никогда не изменять примененные changesets
- Использовать rollback стратегии
- Тестировать миграции на копии prod данных

## Индексы и оптимизация

### Ключевые индексы

#### user схема
```sql
CREATE INDEX idx_users_username ON user.users(username);
CREATE INDEX idx_users_active ON user.users(active) WHERE active = true;
CREATE INDEX idx_refresh_sessions_jti ON user.refresh_sessions(jti);
CREATE INDEX idx_refresh_sessions_user_id ON user.refresh_sessions(user_id);
```

#### event схема
```sql
CREATE INDEX idx_events_organizer_id ON event.events(organizer_id);
CREATE INDEX idx_events_status ON event.events(status);
CREATE INDEX idx_events_date_start ON event.events(date_start);
CREATE INDEX idx_bookings_event_id ON event.bookings(event_id);
CREATE INDEX idx_bookings_user_id ON event.bookings(user_id);
CREATE INDEX idx_bookings_status ON event.bookings(status);
CREATE INDEX idx_waitlist_event_id ON event.waitlist(event_id);
```

#### payment схема
```sql
CREATE INDEX idx_payments_booking_id ON payment.payments(booking_id);
CREATE INDEX idx_payments_status ON payment.payments(status);
CREATE INDEX idx_payments_provider_payment_id ON payment.payments(provider_payment_id);
CREATE INDEX idx_webhook_events_idempotency ON payment.webhook_events(idempotency_key);
```

### Query optimization

```sql
-- Использование EXPLAIN ANALYZE
EXPLAIN ANALYZE 
SELECT * FROM event.events 
WHERE status = 'PUBLISHED' 
  AND date_start > CURRENT_DATE
ORDER BY date_start;

-- Проверка использования индексов
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'event'
ORDER BY idx_scan DESC;
```

## Connection Pooling

### HikariCP настройки (application.yml)

```yaml
spring:
  datasource:
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      pool-name: AquaStreamHikariCP
```

### Мониторинг пула

```bash
# Через Actuator
curl http://localhost:8101/actuator/metrics/hikaricp.connections.active

# Логи HikariCP
logging:
  level:
    com.zaxxer.hikari: DEBUG
```

## Типы данных и ограничения

### Общие enum типы (в backend-common)

```java
// Статусы централизованы
public enum BookingStatus {
    PENDING,
    CONFIRMED,
    CANCELLED,
    COMPLETED
}

public enum PaymentStatus {
    PENDING,
    PROCESSING,
    SUCCEEDED,
    FAILED,
    REFUNDED
}

public enum EventStatus {
    DRAFT,
    PUBLISHED,
    CANCELLED,
    COMPLETED
}
```

### PostgreSQL constraints

```sql
-- Check constraints
ALTER TABLE event.events 
ADD CONSTRAINT check_capacity 
CHECK (capacity > 0);

ALTER TABLE event.events 
ADD CONSTRAINT check_dates 
CHECK (date_end >= date_start);

-- Unique constraints
ALTER TABLE user.users 
ADD CONSTRAINT unique_username 
UNIQUE (username);

-- Foreign keys
ALTER TABLE event.bookings 
ADD CONSTRAINT fk_event 
FOREIGN KEY (event_id) 
REFERENCES event.events(id) 
ON DELETE CASCADE;
```

## Backup & Restore

См. [Backup & Recovery Guide](../operations/backup-recovery.md) для детальной информации.

### Быстрый backup

```bash
# Backup всей БД
pg_dump -h localhost -U aquastream -d aquastream > backup.sql

# Backup конкретной схемы
pg_dump -h localhost -U aquastream -d aquastream -n event > event_schema.sql

# Restore
psql -h localhost -U aquastream -d aquastream < backup.sql
```

## Примечания

- Статусы и enum'ы централизованы в `backend-common`
- Истечение pending-броней и обработка waitlist реализованы планировщиком в `backend-event`
- Все даты хранятся в UTC
- Soft delete используется для audit trail (поле `deleted_at`)
- Миграции применяются автоматически при старте сервиса
