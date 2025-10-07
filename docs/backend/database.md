# База данных

## Обзор

PostgreSQL 16, одна база данных с разделением по схемам для каждого сервиса. Миграции управляются через Liquibase.

**Подключение** (dev):
```bash
Host: localhost:5432
Database: aquastream
User: aquastream
Password: password123

# psql
psql -h localhost -U aquastream -d aquastream

# Docker
docker exec -it aquastream-postgres psql -U aquastream -d aquastream
```

## Схемы и таблицы

| Схема | Ключевые таблицы | Описание |
|-------|------------------|----------|
| **user** | `users`, `profiles`, `refresh_sessions`, `recovery_codes`, `audit_log` | Пользователи, профили, JWT sessions, audit |
| **event** | `organizers`, `events`, `bookings`, `booking_logs`, `waitlist`, `favorites`, `team_members`, `faq_items` | События, бронирования, waitlist, организаторы |
| **crew** | `crews`, `crew_assignments`, `team_preferences` | Экипажи, назначения, предпочтения |
| **payment** | `payments`, `payment_receipts`, `webhook_events` | Оплата, QR-receipts, webhooks |
| **notification** | `notification_prefs`, `telegram_subscriptions`, `outbox` | Настройки уведомлений, Telegram, очередь |
| **media** | `files` | Загруженные файлы, S3 keys |

### Детали ключевых таблиц

**user.users**: `id`, `username` (unique), `password_hash`, `role`, `active`
**user.profiles**: `user_id` (PK, FK), `phone`, `telegram`, `is_telegram_verified`, `extra` (JSONB)

**event.events**: `id`, `organizer_id`, `type`, `title`, `date_start`, `date_end`, `location`, `price`, `capacity`, `available`, `status`
**event.bookings**: `id`, `event_id`, `user_id`, `status`, `amount`, `payment_status`, `payment_id`, `expires_at`
**event.waitlist**: `id`, `event_id`, `user_id`, `priority`, `notified_at`, `notification_expires_at`

**crew.crews**: `id`, `event_id`, `name`, `type` (CREW/TENT/TABLE/BUS), `capacity`, `current_size`

**payment.payments**: `id`, `booking_id`, `method`, `amount`, `status`, `provider`, `provider_payment_id`

## Миграции (Liquibase)

### Структура

```
backend-[service]-db/src/main/resources/db/changelog/
├── db.changelog-master.xml       # Главный файл
├── changesets/
│   ├── 001-initial-schema.sql
│   ├── 002-add-indexes.sql
│   └── ...
└── data/
    └── seed-data.sql             # Dev only
```

### Запуск

**Автоматически** при старте сервиса (настроено в `application.yml`):
```yaml
spring:
  liquibase:
    enabled: true
    change-log: classpath:db/changelog/db.changelog-master.xml
    default-schema: [service_schema]
```

**Вручную**:
```bash
# Применить миграции
./gradlew :backend-user:backend-user-db:update

# Откат последнего changeset
./gradlew :backend-user:backend-user-db:rollback-count -Pcount=1
```

### Best Practices

| Правило | Описание |
|---------|----------|
| Атомарность | Каждый changeset - одна операция |
| ID формат | `YYYYMMDD-HHmm-description` |
| Неизменность | Никогда не изменять примененные changesets |
| Rollback | Всегда предусматривать rollback стратегию |
| Тестирование | На копии prod данных |

## Индексы

### Критичные индексы

| Схема | Индекс | Цель |
|-------|--------|------|
| **user** | `idx_users_username` | Login lookup |
| | `idx_refresh_sessions_jti`, `idx_refresh_sessions_user_id` | JWT refresh |
| **event** | `idx_events_organizer_id`, `idx_events_status`, `idx_events_date_start` | Events filtering |
| | `idx_bookings_event_id`, `idx_bookings_user_id`, `idx_bookings_status` | Bookings queries |
| | `idx_waitlist_event_id` | Waitlist processing |
| **crew** | `idx_crews_event_id`, `idx_crew_assignments_crew_id`, `idx_crew_assignments_user_id` | Crew queries |
| **payment** | `idx_payments_booking_id`, `idx_payments_status`, `idx_payments_provider_payment_id` | Payment tracking |
| | `idx_webhook_events_idempotency` | Webhook deduplication |

### Query optimization

```sql
-- EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM event.events
WHERE status = 'PUBLISHED' AND date_start > CURRENT_DATE
ORDER BY date_start;

-- Индексная статистика
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'event'
ORDER BY idx_scan DESC;
```

## Connection Pooling

### HikariCP настройки

```yaml
spring:
  datasource:
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

**Мониторинг**: `curl http://localhost:8101/actuator/metrics/hikaricp.connections.active`

## Constraints

### PostgreSQL constraints

| Тип | Примеры |
|-----|---------|
| **Check** | `event.events`: `capacity > 0`, `date_end >= date_start` |
| **Unique** | `user.users`: `username`, `event.crews`: `(event_id, name)` |
| **Foreign Keys** | `event.bookings.event_id` → `event.events.id` ON DELETE CASCADE |
| **Partial indexes** | `user.refresh_sessions`: WHERE `revoked_at IS NULL` |

## Enum типы

**Централизованы в `backend-common`**:

| Enum | Значения |
|------|----------|
| `BookingStatus` | PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW, EXPIRED |
| `PaymentStatus` | PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED |
| `EventStatus` | DRAFT, PUBLISHED, CANCELLED, COMPLETED |
| `CrewType` | CREW, TENT, TABLE, BUS |

## Backup & Restore

См. [Backup & Recovery Guide](../operations/backup-recovery.md) для детальной информации.

**Быстрый backup**:
```bash
# Вся БД
pg_dump -h localhost -U aquastream aquastream > backup.sql

# Конкретная схема
pg_dump -h localhost -U aquastream -n event aquastream > event_schema.sql

# Restore
psql -h localhost -U aquastream aquastream < backup.sql
```

## Примечания

- ✅ Все даты хранятся в UTC
- ✅ Soft delete для audit trail (поле `deleted_at`)
- ✅ Миграции применяются автоматически при старте
- ✅ Статусы и enum'ы централизованы в `backend-common`
- ✅ Истечение pending-броней обрабатывает планировщик в `backend-event`

---

См. [Operations Guide](../operations/README.md), [Deployment](../operations/deployment.md), [Monitoring](../operations/monitoring.md).