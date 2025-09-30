# Deployment

## Обзор

Процесс развертывания AquaStream через Docker Compose для различных окружений.

## Окружения

### Development (local)

```bash
# Запуск
make up-dev

# Или через docker-compose
docker compose -f backend-infra/docker/compose/docker-compose.yml --profile dev up -d
```

**Особенности**:
- Weak passwords
- Debug logging
- All Actuator endpoints
- CORS для localhost
- Observability stack (Prometheus/Grafana/Loki)

### Staging

```bash
# Настроить .env.stage
cp backend-infra/docker/compose/.env.stage.example .env.stage
# Редактировать реальные секреты

# Запуск
make up-stage
```

**Особенности**:
- Реальные секреты
- Ограниченное логирование
- Базовая безопасность
- Без observability stack

### Production

```bash
# Настроить .env.prod
cp backend-infra/docker/compose/.env.prod.example .env.prod
# Редактировать production секреты

# Запуск
make up-prod
```

**Особенности**:
- Сильные пароли
- Минимальное логирование
- Полная безопасность
- HTTPS обязательно
- Security headers
- Rate limiting строгий

## Version Management

### version.properties

Централизованное управление версиями:

```properties
version.major=1        # Breaking changes
version.minor=0        # Новый функционал
version.patch=0        # Bug fixes
version.suffix=SNAPSHOT # "" для релиза
```

### Обновление версий

**Patch** (1.0.0 → 1.0.1):
```bash
sed -i '' 's/version.patch=.*/version.patch=1/' version.properties
```

**Minor** (1.0.0 → 1.1.0):
```bash
sed -i '' 's/version.minor=.*/version.minor=1/' version.properties
sed -i '' 's/version.patch=.*/version.patch=0/' version.properties
```

**Major** (1.0.0 → 2.0.0):
```bash
sed -i '' 's/version.major=.*/version.major=2/' version.properties
sed -i '' 's/version.minor=.*/version.minor=0/' version.properties
sed -i '' 's/version.patch=.*/version.patch=0/' version.properties
```

### Release vs Snapshot

**Release** (suffix пустой):
```bash
version.suffix=
# Результат: 1.0.0
```

**Snapshot** (разработка):
```bash
version.suffix=SNAPSHOT
# Результат: 1.0.0-SNAPSHOT
```

**Release Candidate**:
```bash
version.suffix=RC1
# Результат: 1.0.0-RC1
```

## Deployment Steps

### 1. Pre-deployment

```bash
# Проверить версию
grep -E "version\." version.properties

# Запустить тесты
./gradlew clean build test

# Security scan
./gradlew dependencyCheckAnalyze

# Build образов
make build-images

# Trivy scan
make scan
```

### 2. Сборка

```bash
# Backend
./gradlew clean bootJar

# Frontend
cd frontend
pnpm build

# Docker images
make build-images
```

### 3. Deploy

```bash
# Push образов в registry
make push-images

# На сервере
git pull origin main
make up-prod

# Проверить health
make health-check
```

### 4. Smoke Tests

```bash
# Health check всех сервисов
curl https://api.aquastream.com/actuator/health

# Тестовый запрос
curl https://api.aquastream.com/api/events

# Frontend
curl https://aquastream.com
```

### 5. Мониторинг

```bash
# Проверить логи
make logs

# Проверить метрики
# Grafana: http://monitoring.aquastream.com

# Проверить alerts
# Alertmanager
```

## Rollback

### Откат на предыдущую версию

```bash
# 1. Определить предыдущий тег
git tag -l | tail -2

# 2. Checkout предыдущего тега
git checkout v1.0.0

# 3. Rebuild образов
make build-images

# 4. Redeploy
make up-prod

# 5. Smoke tests
make health-check
```

### Откат через Docker

```bash
# Pull предыдущей версии из registry
docker pull ghcr.io/org/backend-user:v1.0.0

# Tag as latest
docker tag ghcr.io/org/backend-user:v1.0.0 ghcr.io/org/backend-user:latest

# Recreate контейнеры
docker-compose up -d --force-recreate
```

## Blue-Green Deployment (опционально)

```yaml
# docker-compose.yml
services:
  backend-user-blue:
    image: ghcr.io/org/backend-user:v1.0.0
    
  backend-user-green:
    image: ghcr.io/org/backend-user:v1.1.0
    
  nginx:
    # Switch между blue/green через конфиг
```

## Checklist деплоя

### Pre-deployment

- [ ] Все тесты проходят
- [ ] Security scan чист
- [ ] Документация обновлена
- [ ] Changelog заполнен
- [ ] Backup создан
- [ ] Team уведомлена

### Deployment

- [ ] Version bumped
- [ ] Tag created
- [ ] Docker images built
- [ ] Images pushed to registry
- [ ] Services deployed
- [ ] Health check passed

### Post-deployment

- [ ] Smoke tests пройдены
- [ ] Метрики нормальные
- [ ] Логи без ошибок
- [ ] Rollback plan готов
- [ ] Monitoring алерты настроены

## См. также

- [CI/CD](ci-cd.md) - continuous integration
- [Infrastructure](infrastructure.md) - инфраструктура
- [Monitoring](monitoring.md) - мониторинг
- [Backup & Recovery](backup-recovery.md) - резервное копирование
