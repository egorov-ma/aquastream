# Backend Infra Overview

AquaStream инфраструктура покрывает локальную разработку (Docker Compose), резервное копирование, CI/CD и observability.

## Быстрый старт
- Склонируйте репозиторий и создайте файлы окружений: `cd backend-infra/docker/compose && cp .env.dev.example .env.dev`.
- Поднимите dev-стек: `make -C ../../make up-dev`.
- Перейдите в наблюдаемость: Prometheus `http://localhost:9090`, Grafana `http://localhost:3001` (см. `.env.dev`).

Дополнительные подробности:
- [Developer Guide](./DEVELOPER.md) — переменные окружения, профили, CI/CD.
- [Docker Compose](./docker/README.md) — описание сервисов и оверлеев.
- [Backup & Restore](./backup/README.md) — стратегия резервирования PostgreSQL.

## Состав каталога

```
backend-infra/
├── docker/
│   ├── compose/   # docker-compose.yaml, observability конфиги
│   └── images/    # Dockerfile.* для сервисов
├── backup/        # backup.sh / restore.sh
└── make/          # Makefile с целями (up-down, backup, restore)
```

## Основные команды

```bash
make -C backend-infra/make up-dev      # поднять локальную инфраструктуру
make -C backend-infra/make down        # остановить контейнеры и очистить volumes
make -C backend-infra/make logs        # собрать логи всех сервисов
make -C backend-infra/make backup      # создать PostgreSQL бэкапы
make -C backend-infra/make restore \  # восстановление (SCHEMA=user|all)
  SCHEMA=user FILE=backend-infra/backup/artifacts/user_YYYYMMDD.dump.gz
```

## CI/CD и автоматизация
- Docker-образы собирает `ci-images.yml` (Trivy + Syft).
- Бэкапы можно запускать по cron: `0 2 * * * backend-infra/backup/backup.sh` (см. Developer Guide).
- Инфра pre-commit хук (`.githooks/infra-pre-commit-hook`) проверяет docker-compose, YAML и Dockerfile.
