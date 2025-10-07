# Crew Service - Operations

## Обзор

Crew Service управляет группами участников (crews), назначениями, лодками и палатками.

**Порт**: 8103
**Контейнер**: `aquastream-backend-crew`
**Resources**: 512MB RAM, 0.75 CPU

> **Общая инфраструктура**: См. [Operations Guide](../../operations/README.md)

## Запуск сервиса

```bash
# Development stack
make up-dev

# Health check
curl http://localhost:8103/actuator/health

# Логи
docker logs -f aquastream-backend-crew

# Перезапуск
docker compose restart backend-crew
docker compose up -d --build backend-crew  # с rebuild
```

## Конфигурация

### Environment Variables

| Переменная | Значение | Описание |
|------------|----------|----------|
| `POSTGRES_DB` | aquastream | База данных |
| `POSTGRES_USER` | aquastream | Пользователь |
| `SPRING_PROFILES_ACTIVE` | dev \| prod | Профиль |

### Application Profiles

| Параметр | dev | prod |
|----------|-----|------|
| `capacity-validation.strict` | false | true |
| `capacity-validation.allow-overbook` | true | false |

## Database

**Схема**: `crew`

**Таблицы**: crews, crew_assignments, boats, tents, team_preferences

### Миграции

```bash
# Liquibase changelog
backend-crew/backend-crew-db/src/main/resources/migration/liquibase/master.xml

# Применить миграции
make liq-crew-update

# Показать SQL
make liq-crew-sql

# Backup & Restore
make backup
make restore SCHEMA=crew FILE=backend-infra/backup/artifacts/crew_20250930.dump.gz
```

## Мониторинг

### Health Checks

```bash
# Basic
curl http://localhost:8103/actuator/health

# Detailed
curl -H "X-User-Role: ADMIN" http://localhost:8103/actuator/health

# Docker Compose: interval 10s, timeout 5s, retries 10
```

### Метрики

```bash
# JVM memory
curl http://localhost:8103/actuator/metrics/jvm.memory.used | jq

# HTTP requests
curl http://localhost:8103/actuator/metrics/http.server.requests | jq

# DB connections
curl http://localhost:8103/actuator/metrics/hikaricp.connections.active | jq
```

### Логи

```bash
# Stream
docker logs -f aquastream-backend-crew

# Последние 100 строк
docker logs --tail 100 aquastream-backend-crew

# Ошибки
docker logs aquastream-backend-crew | grep ERROR

# Capacity violations
docker logs aquastream-backend-crew | grep "capacity exceeded"
```

## Troubleshooting

### Сервис не стартует

```bash
# 1. Логи
docker logs aquastream-backend-crew

# 2. Зависимости
docker ps | grep postgres

# 3. Environment
docker exec aquastream-backend-crew env | grep -E "POSTGRES|SPRING"

# 4. БД
docker exec aquastream-postgres pg_isready -U aquastream
```

### Database connection errors

```bash
# PostgreSQL
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "SELECT 1"

# Схема crew
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "\dt crew.*"
```

### Capacity validation issues

**Проблема**: `CrewCapacityExceededException` при назначении

```bash
# 1. Проверить capacity vs currentSize
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, name, capacity, current_size FROM crew.crews WHERE id='<crew-uuid>';"

# 2. Активные назначения
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT COUNT(*) FROM crew.crew_assignments WHERE crew_id='<crew-uuid>' AND status='ACTIVE';"

# 3. Ручное исправление inconsistency
docker exec aquastream-postgres psql -U aquastream -d aquastream <<EOF
UPDATE crew.crews c
SET current_size = (
  SELECT COUNT(*) FROM crew.crew_assignments a
  WHERE a.crew_id = c.id AND a.status = 'ACTIVE'
)
WHERE c.id = '<crew-uuid>';
EOF
```

### Race condition на assignments

```bash
# Проверить version field (optimistic locking)
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, name, capacity, current_size, version FROM crew.crews WHERE id='<crew-uuid>';"

# Version инкрементируется автоматически, OptimisticLockException → retry
```

### Seat number conflicts

**Проблема**: Два участника на одном месте

```bash
# Проверить дубликаты
docker exec aquastream-postgres psql -U aquastream -d aquastream <<EOF
SELECT crew_id, seat_number, COUNT(*)
FROM crew.crew_assignments
WHERE status = 'ACTIVE' AND seat_number IS NOT NULL
GROUP BY crew_id, seat_number
HAVING COUNT(*) > 1;
EOF
```

### High memory usage

```bash
# 1. Memory stats
docker stats aquastream-backend-crew

# 2. Heap size
curl http://localhost:8103/actuator/metrics/jvm.memory.used | jq

# 3. Увеличить limit (docker-compose.yml)
mem_limit: 768m

# 4. N+1 queries (частая причина) - SQL logging
logging:
  level:
    org.hibernate.SQL: DEBUG
```

### Slow queries

```bash
# 1. Индексы
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "\di crew.*"

# 2. EXPLAIN ANALYZE
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "EXPLAIN ANALYZE SELECT * FROM crew.crew_assignments WHERE user_id='<uuid>';"
```

## Performance Optimization

### Критичные индексы

```sql
-- Crews
CREATE INDEX idx_crews_event_id ON crew.crews(event_id);

-- Assignments
CREATE INDEX idx_crew_assignments_crew_id ON crew.crew_assignments(crew_id);
CREATE INDEX idx_crew_assignments_user_event ON crew.crew_assignments(user_id, crew_id);
CREATE INDEX idx_crew_assignments_booking ON crew.crew_assignments(booking_id);
CREATE INDEX idx_crew_assignments_status ON crew.crew_assignments(status);
```

### N+1 Query Optimization

```java
// ✅ Fetch Join
@Query("SELECT c FROM CrewEntity c " +
       "LEFT JOIN FETCH c.assignments a " +
       "WHERE c.eventId = :eventId AND a.status = 'ACTIVE'")
List<CrewEntity> findByEventIdWithAssignments(@Param("eventId") UUID eventId);
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
```

### Кэширование (опционально)

```java
@Cacheable(value = "event-crews", key = "#eventId")
public List<CrewDto> getCrews(UUID eventId) { }

@CacheEvict(value = "event-crews", key = "#crew.eventId")
public CrewDto updateCrew(CrewEntity crew) { }
```

## Security

### Container Hardening

- Non-root user (UID 1000)
- Read-only filesystem
- Tmpfs для `/tmp`
- All capabilities dropped
- `no-new-privileges`

См. [Infrastructure Security](../../operations/infrastructure.md#security)

### API Security

- **Authentication**: JWT через Gateway
- **Authorization**: ORGANIZER/ADMIN для всех write operations
- **Rate Limiting**: Bucket4j через backend-common

**Critical endpoints** (ORGANIZER only):
- POST/PUT/DELETE crews
- POST/DELETE assignments

### Audit

История изменений:
- `unassigned_at`, `status` transitions в assignments
- Application logs для критичных операций

## Specific Scenarios

### Переназначение участника между crews

```bash
# 1. DELETE старое assignment → status REMOVED
# 2. POST новое assignment → status ACTIVE
```

### Удаление crew с активными assignments

**Проблема**: Нельзя удалить crew с ACTIVE assignments

**Решение**: Сначала удалить все assignments, затем crew.

### Изменение capacity crew

**Проблема**: Нельзя уменьшить capacity ниже currentSize

**Решение**: Сначала удалить лишние assignments.

---

См. [README](README.md), [API Documentation](api.md), [Business Logic](business-logic.md), [Operations Infrastructure](../../operations/infrastructure.md), [Deployment Guide](../../operations/deployment.md).