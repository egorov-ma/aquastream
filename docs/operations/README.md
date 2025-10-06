# Operations Overview

---
title: Operations Overview
summary: Документация по эксплуатации и администрированию системы AquaStream
tags: [operations, devops, infrastructure]
---

## Обзор

Документация по эксплуатации и администрированию системы AquaStream.

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

## Куда идти дальше

| Документ | Вопросы которые закрывает | Примечание |
|----------|---------------------------|------------|
| [Infrastructure](infrastructure.md) | Подготовка окружений, сети, ресурсы | Архитектурный контекст см. в [Architecture](../architecture.md) |
| [Deployment](deployment.md) | Как выполнять релизы dev/stage/prod | Повышение версий → [Version Management](version-management.md) |
| [CI/CD](ci-cd.md) | Какие workflow'ы есть и как их запускать | Ссылки на GitHub Actions файлы и best practices |
| [Monitoring](monitoring.md) | Как смотреть метрики, логи, алерты | Dev stack, для stage/prod — внешний мониторинг |
| [Backup & Recovery](backup-recovery.md) | Создание и проверка бэкапов | PostgreSQL + MinIO процедуры |
| Runbooks | Пошаговые инструкции (рестарт, инциденты) | [Service Restart](runbooks/service-restart.md), [Incident Response](runbooks/incident-response.md), [Database Maintenance](runbooks/database-maintenance.md) |
| [Troubleshooting](troubleshooting.md) | Быстрая диагностика и ссылки на runbooks | Содержит quick reference и переходы |

### Service-Specific Operations

- [Event Service](../backend/event/operations.md)
- [Crew Service](../backend/crew/operations.md)
- Остальные сервисы — см. `docs/backend/<service>/operations.md`

## Архитектурный контекст

Высокоуровневые решения, взаимосвязи сервисов и ограничения описаны в [Architecture](../architecture.md). При изменении архитектуры сначала обновляем её описание, затем вносим правки в специализированные руководства из раздела Operations.

## Troubleshooting

- Для быстрых проверок используйте раздел Quick Reference в [Troubleshooting](troubleshooting.md).
- Повторяемые процедуры вынесены в runbooks, например [Service Restart](runbooks/service-restart.md) и [Incident Response](runbooks/incident-response.md).

## Дополнительные материалы

- [backend-infra/README.md](https://github.com/egorov-ma/aquastream/blob/main/backend-infra/README.md) — содержимое инфраструктурного пакета
- [backend-infra/make/Makefile](https://github.com/egorov-ma/aquastream/blob/main/backend-infra/make/Makefile) — полный список make-команд
- [GitHub Workflows](https://github.com/egorov-ma/aquastream/tree/main/.github/workflows) — исходники CI/CD
- [Docker Compose docs](https://docs.docker.com/compose/), [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html), [Semantic Versioning](https://semver.org/)
