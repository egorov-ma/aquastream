# Deployment

---
title: Deployment Guide
summary: Развертывание AquaStream через Docker Compose с управлением версиями
tags: [operations, deployment, docker-compose, versioning]
---

## Обзор

Развертывание AquaStream осуществляется через **Docker Compose** с централизованным управлением через **Makefile**. Поддерживаются три окружения: dev, stage, prod.

> См. [Infrastructure](infrastructure.md) для деталей компонентов и архитектуры.

## Version Management

### version.properties

Централизованное управление версиями всех модулей через `version.properties`:

```properties
# backend-infra/version.properties
version.major=1        # Breaking changes (API incompatibility)
version.minor=0        # New features (backward compatible)
version.patch=0        # Bug fixes
version.suffix=SNAPSHOT # "" для release, "SNAPSHOT" для dev
```

**Результирующая версия**: `1.0.0-SNAPSHOT`

**Semantic Versioning**:
- **MAJOR**: Breaking changes (например, изменение API contract)
- **MINOR**: Новый функционал с обратной совместимостью
- **PATCH**: Bug fixes без изменения функциональности

### Обновление версий

**Patch release** (1.0.0 → 1.0.1):
```bash
sed -i '' 's/version.patch=.*/version.patch=1/' version.properties
```

**Minor release** (1.0.0 → 1.1.0):
```bash
sed -i '' 's/version.minor=.*/version.minor=1/' version.properties
sed -i '' 's/version.patch=.*/version.patch=0/' version.properties
```

**Major release** (1.0.0 → 2.0.0):
```bash
sed -i '' 's/version.major=.*/version.major=2/' version.properties
sed -i '' 's/version.minor=.*/version.minor=0/' version.properties
sed -i '' 's/version.patch=.*/version.patch=0/' version.properties
```

**Release** (убрать SNAPSHOT):
```bash
sed -i '' 's/version.suffix=.*/version.suffix=/' version.properties
# Результат: 1.0.0
```

**Новый цикл разработки** (после release):
```bash
# Поднять patch и вернуть SNAPSHOT
sed -i '' 's/version.patch=.*/version.patch=1/' version.properties
sed -i '' 's/version.suffix=.*/version.suffix=SNAPSHOT/' version.properties
# Результат: 1.0.1-SNAPSHOT
```

### Git Tagging

```bash
# Создать git tag для release
version=$(grep version.major version.properties | cut -d= -f2).$(grep version.minor version.properties | cut -d= -f2).$(grep version.patch version.properties | cut -d= -f2)
git tag -a "v${version}" -m "Release version ${version}"
git push origin "v${version}"
```

## Environment Variables

### Обязательные секреты

**Database**:
```bash
POSTGRES_DB=aquastream
POSTGRES_USER=aquastream
POSTGRES_PASSWORD=<strong-password>  # Минимум 20 символов для prod
```

**Redis**:
```bash
REDIS_PASSWORD=<strong-password>
```

**MinIO**:
```bash
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=<strong-password>
MINIO_BOOTSTRAP_BUCKETS=aquastream-media aquastream-payment
```

**JWT**:
```bash
JWT_SECRET=<256-bit-secret>  # Генерация: openssl rand -base64 32
JWT_EXPIRATION_MS=3600000    # 1 час
```

**Application**:
```bash
SPRING_PROFILES_ACTIVE=dev|stage|prod
GATEWAY_CORS_ALLOWED_ORIGINS=http://localhost:3000  # Для dev
```

### Опциональные интеграции

**Telegram Bot** (для notification service):
```bash
TELEGRAM_BOT_TOKEN=<bot-token>
```

**YooKassa** (для payment service):
```bash
YOOKASSA_SHOP_ID=<shop-id>
YOOKASSA_SECRET_KEY=<secret-key>
```

**Observability** (для dev):
```bash
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=<password>
```

### Генерация секретов

```bash
# PostgreSQL password (20 chars, alphanumeric)
openssl rand -base64 20 | tr -d '/+=' | head -c 20

# JWT secret (32 bytes base64)
openssl rand -base64 32

# Redis password (hex)
openssl rand -hex 16
```

## Deployment Process

### 1. Pre-deployment Checks

```bash
# Убедиться что на правильной ветке
git status
git log --oneline -5

# Проверить версию
grep -E "^version\." version.properties

# Запустить все тесты
./gradlew clean build test

# OWASP dependency check
./gradlew dependencyCheckAnalyze

# Проверить структуру модулей
./gradlew validateModuleStructure

# Обновить lockfiles если нужно
make deps-lock
git diff */gradle.lockfile
```

### 2. Build

```bash
# Backend services (jar файлы)
./gradlew clean assemble

# Docker images
make build-images

# Security scan образов
make scan

# Генерация SBOM
make sbom
```

**Артефакты**:
- JAR файлы: `*/backend-*-api/build/libs/*.jar`
- Docker images: `aquastream/backend-*:dev`
- Scan reports: `backend-infra/reports/scan/`
- SBOM files: `backend-infra/reports/sbom/`

### 3. Push Images (опционально)

```bash
# Push в Docker registry
make push-images

# Или manually
docker tag aquastream/backend-user:dev registry.example.com/aquastream/backend-user:1.0.0
docker push registry.example.com/aquastream/backend-user:1.0.0
```

### 4. Deploy

#### Development

```bash
# Создать .env из template
cp backend-infra/docker/compose/.env.dev.example backend-infra/docker/compose/.env.dev

# Запустить (автоматическая сборка jar + images)
make up-dev

# Проверить health
make smoke
```

#### Stage/Production

```bash
# Подготовить .env файл
cp backend-infra/docker/compose/.env.prod.example backend-infra/docker/compose/.env.prod
# Редактировать секреты вручную

# Backup перед deploy
make backup

# Deploy
make up-prod

# Health check
curl -f https://your-domain.com/actuator/health
```

### 5. Post-deployment Verification

```bash
# Health check всех сервисов
for port in 8080 8101 8102 8103 8104 8105 8106; do
  echo "Checking port $port:"
  curl -sf http://localhost:$port/actuator/health | jq '.status'
done

# Smoke tests
make smoke

# Проверить логи на ошибки
make logs | grep -i error | head -20

# Проверить метрики (если доступно)
curl http://localhost:8080/actuator/metrics | jq '.names[]' | head -10
```

## Rollback

### Git-based Rollback

```bash
# 1. Определить предыдущий рабочий commit/tag
git log --oneline --decorate | head -10
git tag -l | tail -5

# 2. Checkout предыдущей версии
git checkout v1.0.0

# 3. Rebuild и redeploy
make build-images
make up-prod

# 4. Verify
make smoke
```

### Docker Image Rollback

```bash
# 1. Остановить текущие контейнеры
make down

# 2. Pull предыдущей версии из registry
docker pull registry.example.com/aquastream/backend-user:v1.0.0

# 3. Tag as current
docker tag registry.example.com/aquastream/backend-user:v1.0.0 aquastream/backend-user:dev

# 4. Recreate контейнеры
make up-prod

# 5. Verify
make smoke
```

### Database Rollback

Если проблема в миграциях БД:

```bash
# 1. Остановить сервисы
make down

# 2. Restore backup
make restore SCHEMA=all FILE=backend-infra/backup/artifacts/all_20250930.dump.gz

# 3. Checkout предыдущей версии кода
git checkout v1.0.0

# 4. Запуск
make up-prod
```

## Database Migrations

### Liquibase

Все миграции применяются **автоматически** при старте сервисов через Spring Boot Liquibase integration.

**Changelog location**: `*/backend-*-db/src/main/resources/migration/liquibase/master.xml`

**Manual migrations** (если нужно):

```bash
# Показать SQL без применения
make liq-user-sql

# Применить миграции вручную
make liq-user-update
```

### Migration Best Practices

1. **Backward compatible**: Новая версия кода должна работать со старой схемой БД
2. **Forward compatible**: Старая версия кода должна работать с новой схемой (для rollback)
3. **Two-phase migrations** для breaking changes:

**Phase 1** (релиз N):
```sql
-- Добавить новую колонку (nullable)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
```

**Deploy new code** использующий `email_verified`

**Phase 2** (релиз N+1):
```sql
-- Сделать NOT NULL
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

-- Удалить старые колонки (если были)
ALTER TABLE users DROP COLUMN old_column;
```

4. **Тестирование миграций**:
```bash
# На dev окружении
make up-dev
# Проверить что сервисы стартуют
make logs | grep liquibase
```

## Zero-Downtime Deployment

### Blue-Green Strategy

**Требует**: Load balancer (nginx, traefik)

```bash
# 1. Deploy новой версии (green) параллельно с текущей (blue)
docker-compose -f docker-compose.blue-green.yml up -d backend-user-green

# 2. Health check green
curl -f http://backend-user-green:8101/actuator/health

# 3. Switch load balancer на green
# Обновить nginx.conf или traefik rules

# 4. Удалить blue контейнеры после проверки
docker-compose -f docker-compose.blue-green.yml rm -s backend-user-blue
```

### Rolling Update

Для multi-instance deployments:

```bash
# 1. Scale up с новой версией
docker-compose up -d --scale backend-user=3 --no-recreate

# 2. Wait для health checks
sleep 30

# 3. Graceful shutdown старых instances
# (реализуется через orchestrator: Docker Swarm, Kubernetes)
```

## Deployment Checklist

### Pre-deployment

- [ ] All tests pass (`./gradlew test`)
- [ ] Security scan clean (`./gradlew dependencyCheckAnalyze`, `make scan`)
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] version.properties bumped
- [ ] Git tag created
- [ ] Backup created (`make backup`)
- [ ] Team notified
- [ ] Rollback plan prepared

### Deployment

- [ ] Images built (`make build-images`)
- [ ] Images pushed (если используется registry)
- [ ] Services deployed (`make up-prod`)
- [ ] All health checks passed
- [ ] Database migrations applied successfully
- [ ] MinIO buckets configured

### Post-deployment

- [ ] Smoke tests passed (`make smoke`)
- [ ] Manual smoke tests (critical user journeys)
- [ ] Error rate < baseline
- [ ] Latency p95 < baseline
- [ ] No critical errors in logs
- [ ] Monitoring alerts configured
- [ ] Team notified of completion

## Troubleshooting

### Services won't start

```bash
# Проверить логи
make logs

# Проверить env variables
docker exec aquastream-backend-event env | grep SPRING

# Проверить health checks
docker ps -a | grep backend
```

### Database connection errors

```bash
# Проверить PostgreSQL
docker exec aquastream-postgres pg_isready -U aquastream

# Проверить credentials
echo $POSTGRES_PASSWORD

# Проверить сеть
docker network inspect aquastream-net
```

### Out of memory

```bash
# Проверить memory usage
docker stats

# Увеличить limits в docker-compose.yml
mem_limit: 1024m
```

### Slow startup

```bash
# Проверить Liquibase migrations
docker logs aquastream-backend-event | grep liquibase

# Проверить зависимости (postgres, redis)
docker ps | grep -E "postgres|redis"
```

## См. также

- [Infrastructure](infrastructure.md) - компоненты инфраструктуры
- [CI/CD](ci-cd.md) - continuous integration workflows
- [Backup & Recovery](backup-recovery.md) - резервное копирование