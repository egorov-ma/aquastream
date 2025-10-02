# Operations Overview

---
title: Operations Overview
summary: Документация по эксплуатации и администрированию системы AquaStream
tags: [operations, devops, infrastructure]
---

## Обзор

Документация по эксплуатации и администрированию системы AquaStream.

## Технологический стек

- **Containerization**: Docker + Docker Compose (профили: dev/stage/prod)
- **Orchestration**: Makefile-based automation
- **Database**: PostgreSQL 16 (multi-schema)
- **Cache**: Redis 7 (AOF persistence)
- **Object Storage**: MinIO (S3-compatible)
- **Build System**: Gradle 8.5 + Java 21
- **Monitoring**: Prometheus + Grafana + Loki + Promtail (dev only)
- **CI/CD**: GitHub Actions
- **Documentation**: MkDocs + Material

## Быстрый старт

### Development

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-org/aquastream.git
cd aquastream

# 2. Создать .env файл
cp backend-infra/docker/compose/.env.dev.example backend-infra/docker/compose/.env.dev

# 3. Запустить dev stack
make up-dev

# 4. Проверить health
make smoke
```

**Доступные сервисы:**
- Gateway: http://localhost:8080
- Grafana: http://localhost:3001 (admin/admin)
- MinIO Console: http://localhost:9001

### Production

```bash
# 1. Настроить .env.prod с сильными паролями
cp backend-infra/docker/compose/.env.prod.example backend-infra/docker/compose/.env.prod
# Редактировать секреты (POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET, etc.)

# 2. Запустить prod stack
make up-prod

# 3. Проверить все сервисы
curl -f https://your-domain.com/actuator/health
```

## Основные команды

### Управление окружениями

```bash
make up-dev      # Запуск dev (сборка jar + docker build + up)
make up-stage    # Запуск stage
make up-prod     # Запуск production
make down        # Остановка всех контейнеров + удаление volumes
make logs        # Просмотр логов всех сервисов
make ps          # Статус контейнеров
make smoke       # Smoke test (проверка gateway health)
```

### Backup & Restore

```bash
make backup                              # Backup всех схем PostgreSQL
make restore SCHEMA=event FILE=...       # Restore конкретной схемы
make restore SCHEMA=all FILE=...         # Restore полного backup
```

### Build & Deploy

```bash
./gradlew build                  # Полная сборка с тестами
make build-images                # Build Docker образов всех сервисов
make scan                        # Trivy security scan образов
make sbom                        # Генерация SBOM через Syft
make push-images                 # Push образов в registry
```

### Мониторинг и диагностика

```bash
make smoke                       # Smoke test Gateway
docker stats                     # Resource usage
docker logs <container>          # Логи конкретного сервиса
docker logs -f <container>       # Stream логов

# Health checks
curl http://localhost:8080/actuator/health        # Gateway
curl http://localhost:8102/actuator/health        # Event Service
```

### Разработка документации

```bash
make docs-setup       # Setup Python venv и зависимости
make docs-serve       # Запуск MkDocs dev сервера
make docs-build       # Сборка статического сайта
```

## Документация

### Core Operations

**[Infrastructure](infrastructure.md)** - Инфраструктура и компоненты
- Docker Compose архитектура
- Core services (PostgreSQL, Redis, MinIO)
- Backend services (7 микросервисов)
- Observability stack (Prometheus, Grafana, Loki)
- Volumes и сети
- Security hardening

**[Deployment](deployment.md)** - Развертывание и управление версиями
- Процесс развертывания (dev/stage/prod)
- Version management через `version.properties`
- Rollback стратегии
- Database migrations (Liquibase)
- Zero-downtime deployment

**[CI/CD](ci-cd.md)** - Continuous Integration и Delivery
- GitHub Actions workflows
- Backend CI (build, test, lock-check)
- Docker Images CI (build, scan, push)
- CodeQL, Commitlint, Labeler
- Release process
- Security scanning (Trivy, OWASP)

**[Backup & Recovery](backup-recovery.md)** - Резервное копирование
- Automated backup скрипты
- Retention policy (7 daily, 4 weekly, 3 monthly)
- Per-schema backup
- Recovery procedures
- Testing backups

### Service-Specific Operations

Каждый backend сервис имеет свою документацию operations:

- [Event Service Operations](../backend/event/operations.md) - scheduled jobs, TTL, waitlist
- [Crew Service Operations](../backend/crew/operations.md) - capacity validation, assignments
- User, Payment, Notification, Media - см. `docs/backend/*/operations.md`

## Архитектура

### Микросервисы

7 микросервисов: Gateway (8080), User (8101), Event (8102), Crew (8103), Payment (8104), Notification (8105), Media (8106).

См. полную таблицу с resource limits в [Infrastructure - Backend Services](infrastructure.md#backend-services).

### Infrastructure

**Core компоненты**: PostgreSQL (multi-schema), Redis (AOF persistence), MinIO (S3-compatible).

**Observability** (dev only): Prometheus, Grafana, Loki, Promtail.

См. детальные конфигурации, порты и resource limits в [Infrastructure](infrastructure.md#компоненты-инфраструктуры).

## Troubleshooting

**Быстрые решения**:
- Сервисы не стартуют: `make logs && make down && make up-dev`
- Порты заняты: изменить маппинг в `docker-compose.override.dev.yml`
- Disk space: `docker system prune -a --volumes`

См. полное руководство по диагностике проблем в [Troubleshooting Guide](troubleshooting.md).

## Полезные ссылки

### Внутренние

- [Backend Infrastructure README](../../backend-infra/README.md) - детали инфраструктуры
- [Makefile](../../backend-infra/make/Makefile) - все доступные команды
- [GitHub Workflows](../../.github/workflows/) - CI/CD pipelines
- [Build System](../../build.gradle) - Gradle конфигурация

### Внешние

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/16/)
- [Semantic Versioning](https://semver.org/)