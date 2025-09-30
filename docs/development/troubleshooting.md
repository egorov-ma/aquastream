# Troubleshooting

Руководство по решению типичных проблем при разработке и эксплуатации AquaStream.

## Проблемы с Backend

### Сервис не запускается

**Проблема**: Backend сервис падает при старте

**Решения**:

```bash
# 1. Проверьте логи
docker logs aquastream-backend-user

# 2. Проверьте подключение к БД
docker exec aquastream-postgres psql -U aquastream -d aquastream -c "\l"

# 3. Проверьте переменные окружения
docker exec aquastream-backend-user env | grep POSTGRES

# 4. Пересоздайте контейнер
docker-compose restart backend-user

# 5. Если не помогает - пересоберите
make backend-clean && make backend-build && make backend-up
```

### Ошибки Liquibase миграций

```bash
# Проверьте состояние миграций
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT * FROM databasechangelog ORDER BY dateexecuted DESC LIMIT 5;"

# Откатите последний changeset (только dev!)
./gradlew :backend-user:backend-user-db:liquibaseRollbackCount -Pcount=1
```

### Port already in use

```bash
# Найти процесс на порту
lsof -i :8101

# Убить процесс
kill -9 <PID>

# Остановить все Docker контейнеры
docker-compose down
```

### Out of Memory

```yaml
# Увеличьте memory в docker-compose.yml
services:
  backend-user:
    mem_limit: 1g
    environment:
      JAVA_OPTS: "-Xms512m -Xmx1024m"
```

## Проблемы с Frontend

### Node modules ошибки

```bash
cd frontend

# Удалить и переустановить
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Проверить версию Node
node --version  # должна быть 18+
```

### Build fails

```bash
# Проверить TypeScript и линтеры
pnpm typecheck
pnpm lint

# Очистить .next и пересобрать
rm -rf .next
pnpm build
```

### Playwright тесты падают

```bash
# Переустановить браузеры
pnpm exec playwright install --with-deps chromium

# Debug режим
pnpm exec playwright test --headed --debug
```

## Проблемы с Docker

### Контейнеры не запускаются

```bash
# Проверить docker-compose.yml
docker-compose config

# Пересоздать контейнеры
docker-compose down -v
docker-compose up -d

# Очистить неиспользуемые ресурсы
docker system prune -a
```

### Network issues

```bash
# Проверить Docker network
docker network inspect aquastream_default

# Проверить connectivity
docker exec backend-user ping postgres

# Пересоздать network
docker-compose down && docker network prune && docker-compose up -d
```

## Проблемы с БД

### Connection refused

```bash
# Проверить что PostgreSQL запущен
docker ps | grep postgres

# Проверить логи
docker logs aquastream-postgres

# Подключиться вручную
psql -h localhost -p 5432 -U aquastream -d aquastream
```

### Медленные запросы

```sql
-- Проверить медленные запросы
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Добавить индексы
CREATE INDEX idx_events_status_date 
ON event.events(status, date_start) 
WHERE status = 'PUBLISHED';
```

## Проблемы с Gradle

### Build fails

```bash
# Очистить и пересобрать
./gradlew clean build --no-build-cache

# Проверить Java версию
java -version  # должна быть 21

# Debug mode
./gradlew build --stacktrace --debug
```

### Dependency conflicts

```bash
# Проверить конфликты
./gradlew :backend-common:dependencyInsight --dependency jackson-core

# Обновить locks
./gradlew dependencies --write-locks
```

### Tests fail

```bash
# Запустить конкретный тест
./gradlew :backend-user:backend-user-service:test --tests "UserServiceTest"

# Проверить отчеты
open build/reports/tests/test/index.html
```

## Проблемы с IDE

### IntelliJ IDEA не видит классы

```bash
# File → Invalidate Caches → Invalidate and Restart
# Build → Rebuild Project
# Проверить SDK: должна быть Java 21
```

### VS Code TypeScript ошибки

```bash
# CMD/CTRL + Shift + P → TypeScript: Restart TS Server
# Переустановить зависимости
rm -rf node_modules && pnpm install
```

## Production Issues

### Service crashes

```bash
# 1. Проверить логи
docker logs aquastream-backend-user --tail 1000

# 2. Проверить health
curl http://localhost:8101/actuator/health

# 3. Откатить версию
docker-compose up -d --force-recreate backend-user
```

### Database connection pool exhausted

```sql
-- Проверить активные connections
SELECT count(*) FROM pg_stat_activity;

-- Найти утекающие connections
SELECT pid, usename, state, state_change
FROM pg_stat_activity
WHERE state = 'idle in transaction'
  AND state_change < now() - interval '10 minutes';
```

## Получить помощь

- **Документация**: [docs/](../index.md)
- **Issues**: создайте issue в GitHub с меткой `help wanted`
- **Runbooks**: [Operations Runbooks](../operations/runbooks/)
- **Incident Response**: [runbooks/incident-response.md](../operations/runbooks/incident-response.md)
