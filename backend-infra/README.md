# Backend Infrastructure

Мини-гайд по запуску и обслуживанию локальной инфраструктуры AquaStream.

## Структура каталога

```
backend-infra/
├── docker/          # docker-compose, конфиги и образы
├── make/            # Makefile с целями для запуска/обслуживания
└── backup/          # Скрипты резервного копирования и восстановления
```

## Быстрый старт

```bash
# Перейдите в каталог с compose-файлами
cd backend-infra/docker/compose

# Создайте файлы окружений
cp .env.dev.example .env.dev
cp .env.stage.example .env.stage
cp .env.prod.example  .env.prod

# Запустите dev-стек (инфра + сервисы + observability)
make -C ../../make up-dev
```

Основные сервисы:
- Postgres — `localhost:5432`
- Redis — `localhost:6379`
- MinIO — `http://localhost:9000`
- Prometheus — `http://localhost:9090`
- Grafana — `http://localhost:3001` (`${GRAFANA_ADMIN_USER}/${GRAFANA_ADMIN_PASSWORD}`)

## Основные Make цели

```bash
make -C backend-infra/make up-dev      # поднять dev-стек
make -C backend-infra/make down        # остановить и удалить контейнеры/volumes
make -C backend-infra/make logs        # потоковые логи всех сервисов
make -C backend-infra/make backup      # резервное копирование PostgreSQL
make -C backend-infra/make restore \  # восстановление (см. SCHEMA/FILE)
  SCHEMA=user FILE=backend-infra/backup/artifacts/user_YYYYMMDD.dump.gz
```

Полный список команд: `make -C backend-infra/make help` (если будет добавлен target) либо смотрите `backend-infra/make/Makefile`.

## Документация

Подробные инструкции и FAQ — в разделе `docs/modules/backend-infra/`:
- [Developer Guide](../docs/modules/backend-infra/DEVELOPER.md)
- [Docker Compose guide](../docs/modules/backend-infra/docker/README.md)
- [Backup & Restore](../docs/modules/backend-infra/backup/README.md)
