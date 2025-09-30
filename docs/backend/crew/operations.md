# Crew Service - Operations

## Обзор

Crew Service управляет группами участников (crews), назначениями в команды, лодками и палатками.

**Порт**: 8103
**Контейнер**: `aquastream-backend-crew`
**Образ**: `aquastream/backend-crew:dev`
**Memory**: 512MB
**CPU**: 0.75

> **Общая инфраструктура**: См. [Operations Guide](../../operations/README.md) для команд развертывания через Makefile

## Запуск сервиса

### Development

```bash
# Запустить весь dev stack (включая crew service)
make up-dev

# Проверить health
curl http://localhost:8103/actuator/health

# Логи
docker logs -f aquastream-backend-crew
```

### Отдельный перезапуск

```bash
# Перезапустить только crew service
docker compose restart backend-crew

# С rebuild образа
docker compose up -d --build backend-crew
```

## Конфигурация

### Environment Variables

Основные переменные из `.env.dev`:

```bash
# Database (используется схема crew)
POSTGRES_DB=aquastream
POSTGRES_USER=aquastream
POSTGRES_PASSWORD=postgres

# Application
SPRING_PROFILES_ACTIVE=dev
```

### Application Profiles

**dev**:
```yaml
app:
  crew:
    capacity-validation:
      strict: false          # Разрешен overbooking для тестирования
      allow-overbook: true
```

**prod**:
```yaml
app:
  crew:
    capacity-validation:
      strict: true           # Строгая валидация capacity
      allow-overbook: false
```

## Database

### Схема

PostgreSQL схема: `crew`

**Таблицы**:
- `crews` - основная таблица групп (crews)
- `crew_assignments` - назначения участников
- `boats` - детали лодок (для type=CREW)
- `tents` - детали палаток (для type=TENT)
- `team_preferences` - предпочтения участников (в разработке)

### Миграции

**Liquibase** применяется автоматически при старте:

```bash
# Changelog location
backend-crew/backend-crew-db/src/main/resources/migration/liquibase/master.xml

# Ручное применение (если нужно)
make liq-crew-update

# Показать SQL без применения
make liq-crew-sql
```

### Backup & Restore

```bash
# Backup схемы crew (через общий скрипт)
make backup

# Restore конкретной схемы
make restore SCHEMA=crew FILE=backend-infra/backup/artifacts/crew_20250930.dump.gz
```

## Мониторинг

### Health Checks

```bash
# Basic health
curl http://localhost:8103/actuator/health

# Detailed (с авторизацией)
curl -H "X-User-Role: ADMIN" http://localhost:8103/actuator/health

# В Docker Compose (автоматический)
# interval: 10s, timeout: 5s, retries: 10
```

### Метрики

```bash
# JVM memory
curl http://localhost:8103/actuator/metrics/jvm.memory.used | jq

# HTTP requests
curl http://localhost:8103/actuator/metrics/http.server.requests | jq

# Database connections
curl http://localhost:8103/actuator/metrics/hikaricp.connections.active | jq
```

### Логи

```bash
# Stream логов
docker logs -f aquastream-backend-crew

# Последние 100 строк
docker logs --tail 100 aquastream-backend-crew

# Поиск ошибок
docker logs aquastream-backend-crew | grep ERROR

# Capacity violations
docker logs aquastream-backend-crew | grep "capacity exceeded"
```

## Troubleshooting

### Сервис не стартует

```bash
# 1. Проверить логи
docker logs aquastream-backend-crew

# 2. Проверить зависимости (postgres)
docker ps | grep postgres

# 3. Проверить переменные окружения
docker exec aquastream-backend-crew env | grep -E "POSTGRES|SPRING"

# 4. Проверить подключение к БД
docker exec aquastream-postgres pg_isready -U aquastream
```

### Database connection errors

```bash
# Проверить PostgreSQL
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "SELECT 1"

# Проверить схему crew
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "\dt crew.*"

# Проверить credentials
echo $POSTGRES_PASSWORD
```

### Capacity validation issues

**Проблема**: `CrewCapacityExceededException` при назначении

```bash
# 1. Проверить capacity vs currentSize
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, name, capacity, current_size FROM crew.crews WHERE id='<crew-uuid>';"

# 2. Проверить активные назначения
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT COUNT(*) FROM crew.crew_assignments WHERE crew_id='<crew-uuid>' AND status='ACTIVE';"

# 3. Если currentSize != количество ACTIVE assignments, то есть inconsistency
# Ручное исправление:
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
# Проверить version field для optimistic locking
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT id, name, capacity, current_size, version FROM crew.crews WHERE id='<crew-uuid>';"

# Version field автоматически инкрементируется при конкурентных изменениях
# Если видите OptimisticLockException в логах, это нормально - retry происходит автоматически
```

### Seat number conflicts

**Проблема**: Два участника на одном месте

```bash
# Проверить дубликаты seat_number
docker exec aquastream-postgres psql -U aquastream -d aquastream <<EOF
SELECT crew_id, seat_number, COUNT(*)
FROM crew.crew_assignments
WHERE status = 'ACTIVE' AND seat_number IS NOT NULL
GROUP BY crew_id, seat_number
HAVING COUNT(*) > 1;
EOF

# Unique constraint должен предотвращать это, но если произошло:
# Найти дубликаты и удалить один из них
```

### High memory usage

```bash
# 1. Проверить memory usage
docker stats aquastream-backend-crew

# 2. Проверить heap size
curl http://localhost:8103/actuator/metrics/jvm.memory.used | jq

# 3. Увеличить memory limit (в docker-compose.yml)
mem_limit: 768m

# 4. Проверить N+1 queries (частая причина memory issues)
# Включить SQL logging в application-dev.yml
logging:
  level:
    org.hibernate.SQL: DEBUG
```

### Slow queries

```bash
# 1. Проверить индексы
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "\di crew.*"

# 2. EXPLAIN ANALYZE медленного запроса
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "EXPLAIN ANALYZE SELECT * FROM crew.crew_assignments WHERE user_id='<uuid>';"

# 3. Проверить N+1 queries
# Используйте FETCH JOIN в queries для загрузки связанных entities
```

## Performance Optimization

### Критичные индексы

Следующие индексы критичны для performance (автоматически создаются через Liquibase):

```sql
-- Crews
CREATE INDEX idx_crews_event_id ON crew.crews(event_id);

-- Assignments (для частых запросов)
CREATE INDEX idx_crew_assignments_crew_id ON crew.crew_assignments(crew_id);
CREATE INDEX idx_crew_assignments_user_event ON crew.crew_assignments(user_id, crew_id);
CREATE INDEX idx_crew_assignments_booking ON crew.crew_assignments(booking_id);
CREATE INDEX idx_crew_assignments_status ON crew.crew_assignments(status);
```

### Fetch Join для устранения N+1

```java
// Вместо N+1 queries
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
// Crews события редко меняются - candidate для кэша
@Cacheable(value = "event-crews", key = "#eventId")
public List<CrewDto> getCrews(UUID eventId) {
    // ...
}

// Инвалидация при изменениях
@CacheEvict(value = "event-crews", key = "#crew.eventId")
public CrewDto updateCrew(CrewEntity crew) {
    // ...
}
```

## Security

### Container Hardening

Crew Service контейнер использует все стандартные меры безопасности:
- Non-root user (UID 1000)
- Read-only filesystem
- Tmpfs для `/tmp`
- All capabilities dropped
- `no-new-privileges` security option

См. [Infrastructure Security](../../operations/infrastructure.md#security)

### API Security

- **Authentication**: JWT через Gateway
- **Authorization**: Role-based (ORGANIZER/ADMIN only)
- **Rate Limiting**: Bucket4j через backend-common

**All endpoints** требуют ORGANIZER роли:
- POST /api/v1/events/{eventId}/crews
- PUT /api/v1/crews/{crewId}
- DELETE /api/v1/crews/{crewId}
- POST /api/v1/crews/{crewId}/assignments
- DELETE /api/v1/assignments/{assignmentId}

### Audit

История всех изменений хранится через:
- `unassigned_at` field в assignments (когда удалён)
- `status` transitions (ACTIVE → REMOVED → TRANSFERRED)
- Application logs для всех критичных операций

## Specific Scenarios

### Переназначение участника между crews

```bash
# Проверить текущее назначение
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT * FROM crew.crew_assignments WHERE user_id='<uuid>' AND status='ACTIVE';"

# Процесс переназначения (через API):
# 1. DELETE /api/v1/assignments/{oldAssignmentId}  # status → REMOVED
# 2. POST /api/v1/crews/{newCrewId}/assignments    # создать новое ACTIVE
```

### Удаление crew с активными assignments

**Проблема**: Нельзя удалить crew пока есть ACTIVE assignments

```bash
# 1. Сначала удалить все assignments
curl -X DELETE http://localhost:8103/api/v1/assignments/{assignment-id-1}
curl -X DELETE http://localhost:8103/api/v1/assignments/{assignment-id-2}
# ...

# 2. Затем удалить crew
curl -X DELETE http://localhost:8103/api/v1/crews/{crew-id}
```

### Изменение capacity crew

```bash
# Нельзя уменьшить capacity ниже currentSize
# Проверить перед изменением:
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT name, capacity, current_size FROM crew.crews WHERE id='<crew-uuid>';"

# Если нужно уменьшить capacity: сначала удалить лишние assignments
```

## См. также

- [README](README.md) - обзор сервиса
- [API Documentation](api.md) - детальное описание API
- [Business Logic](business-logic.md) - бизнес-правила и валидации
- [Operations Infrastructure](../../operations/infrastructure.md) - общая инфраструктура
- [Deployment Guide](../../operations/deployment.md) - процесс развертывания
- [Backup & Recovery](../../operations/backup-recovery.md) - резервное копирование