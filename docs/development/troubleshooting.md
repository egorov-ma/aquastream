# Troubleshooting

## Backend проблемы

**Сервис не запускается**:
```bash
docker logs aquastream-backend-user                     # Проверить логи
docker exec aquastream-postgres psql -U aquastream -c "\l"  # Проверить БД
docker compose restart backend-user                      # Перезапуск
make backend-clean && make backend-build && make backend-up  # Пересборка
```

**Liquibase миграции**:
```bash
# Проверить состояние
docker exec aquastream-postgres psql -U aquastream -d aquastream \
  -c "SELECT * FROM databasechangelog ORDER BY dateexecuted DESC LIMIT 5;"

# Откат (только dev!)
./gradlew :backend-user:backend-user-db:liquibaseRollbackCount -Pcount=1
```

**Port already in use**:
```bash
lsof -i :8101 && kill -9 <PID>  # Найти и убить процесс
docker compose down              # Остановить контейнеры
```

**Out of Memory**:
```yaml
# docker-compose.yml
services:
  backend-user:
    mem_limit: 1g
    environment:
      JAVA_OPTS: "-Xms512m -Xmx1024m"
```

## Frontend проблемы

**Node modules ошибки**:
```bash
cd frontend
rm -rf node_modules pnpm-lock.yaml && pnpm install
node --version  # должна быть 18+
```

**Build fails**:
```bash
pnpm typecheck && pnpm lint  # Проверить ошибки
rm -rf .next && pnpm build   # Очистить и пересобрать
```

**Playwright тесты**:
```bash
pnpm exec playwright install --with-deps chromium  # Переустановить браузеры
pnpm exec playwright test --headed --debug         # Debug режим
```

## Docker проблемы

**Контейнеры не запускаются**:
```bash
docker compose config                # Проверить конфиг
docker compose down -v && docker compose up -d  # Пересоздать
docker system prune -a               # Очистить неиспользуемые ресурсы
```

**Network issues**:
```bash
docker network inspect aquastream_default  # Проверить network
docker exec backend-user ping postgres     # Проверить connectivity
docker compose down && docker network prune && docker compose up -d  # Пересоздать
```

## База данных

**Connection refused**:
```bash
docker ps | grep postgres              # Проверить что запущен
docker logs aquastream-postgres         # Логи
psql -h localhost -p 5432 -U aquastream -d aquastream  # Подключение
```

**Медленные запросы**:
```sql
-- Проверить медленные запросы
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;

-- Добавить индексы
CREATE INDEX idx_events_status_date ON event.events(status, date_start)
WHERE status = 'PUBLISHED';
```

## Gradle проблемы

**Build fails**:
```bash
./gradlew clean build --no-build-cache  # Очистить и пересобрать
java -version  # должна быть 21
./gradlew build --stacktrace --debug    # Debug mode
```

**Dependency conflicts**:
```bash
./gradlew :backend-common:dependencyInsight --dependency jackson-core  # Проверить конфликты
make deps-lock  # Обновить все locks
```

**Tests fail**:
```bash
./gradlew :backend-user:backend-user-service:test --tests "UserServiceTest"  # Конкретный тест
open build/reports/tests/test/index.html  # Проверить отчеты
```

## IDE проблемы

**IntelliJ IDEA не видит классы**:
- File → Invalidate Caches → Invalidate and Restart
- Build → Rebuild Project
- Проверить SDK: Java 21

**VS Code TypeScript ошибки**:
- CMD/CTRL + Shift + P → TypeScript: Restart TS Server
- `rm -rf node_modules && pnpm install`

## Production Issues

**Service crashes**:
```bash
docker logs aquastream-backend-user --tail 1000  # Логи
curl http://localhost:8101/actuator/health       # Health check
docker compose up -d --force-recreate backend-user  # Откатить версию
docker logs nginx --tail 200                     # Если недоступен edge
```

**Database connection pool exhausted**:
```sql
-- Активные connections
SELECT count(*) FROM pg_stat_activity;

-- Утекающие connections
SELECT pid, usename, state, state_change
FROM pg_stat_activity
WHERE state = 'idle in transaction'
  AND state_change < now() - interval '10 minutes';
```

## Получить помощь

- **Документация**: [docs/](../index.md)
- **Issues**: создайте issue в GitHub с меткой `help wanted`
- **Runbooks**: [Service Restart](../operations/runbooks/service-restart.md), [Database Maintenance](../operations/runbooks/database-maintenance.md), [Incident Response](../operations/runbooks/incident-response.md)