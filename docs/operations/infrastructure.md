# Инфраструктура

---
title: Infrastructure
summary: Практическое руководство по управлению Compose-инфраструктурой AquaStream.
tags: [operations, infrastructure, docker, compose]
---

## Обзор

Инфраструктура AquaStream развёрнута на Docker Compose и управляется через Makefile в `backend-infra/make/Makefile`. Высокоуровневую архитектуру и обоснования ищите в [Architecture](../architecture.md); здесь собраны ежедневные операционные задачи.

## Структура

```
backend-infra/
├── docker/
│   ├── compose/               # docker-compose.yml и overrides
│   ├── images/                # Dockerfile для сервисов
│   └── scripts/               # bootstrap-скрипты
└── make/Makefile              # единая точка входа команд
```

## Профили Compose

| Профиль | Команда | Особенности |
|---------|---------|-------------|
| `dev`   | `make up-dev` | Автосборка jar/образов, включён Prometheus/Grafana/Loki/Promtail, открыты все порты |
| `stage` | `make up-stage` | Требует `.env.stage`, observability выносится наружу, ограничены порты |
| `prod`  | `make up-prod` | Только базовые сервисы, обязательный HTTPS, сильные секреты, логирование WARN |

> Все профили используют одну сеть `aquastream-net`. Проверить состояние: `docker network inspect aquastream-net`.

## Инвентарь сервисов (операционный минимум)

| Сервис | Порт | Назначение | Where to look |
|--------|------|------------|----------------|
| Nginx | 80/443 | TLS terminator, CORS, edge rate limiting | `backend-infra/docker/compose/nginx.conf` |
| Gateway | 8080 | JWT валидация, маршрутизация к сервисам | `docs/backend/gateway/operations.md` |
| User | 8101 | Пользователи, auth | `docs/backend/user/operations.md` |
| Event | 8102 | События, бронирования | `docs/backend/event/operations.md` |
| Crew | 8103 | Команды | `docs/backend/crew/operations.md` |
| Payment | 8104 | Платежи | `docs/backend/payment/operations.md` |
| Notification | 8105 | Уведомления | `docs/backend/notification/operations.md` |
| Media | 8106 | Файловое хранилище | `docs/backend/media/operations.md` |
| PostgreSQL | 5432 | Общая БД (multi-schema) | [Database Maintenance](runbooks/database-maintenance.md) |
| Redis | 6379 | Cache / rate limiting | [Troubleshooting](troubleshooting.md#redis-issues) |
| MinIO | 9000/9001 | Объектное хранилище | [Backup & Recovery](backup-recovery.md) |

## Данные и тома

| Том | Что хранит | Команда проверки |
|-----|------------|------------------|
| `pgdata` | PostgreSQL данные | `docker volume inspect pgdata` |
| `redisdata` | Redis AOF | `docker exec aquastream-redis redis-cli INFO persistence` |
| `miniodata` | Объекты MinIO | `docker exec aquastream-minio mc ls local/` |
| `prometheusdata` | Метрики (dev) | `docker exec aquastream-prometheus ls /prometheus` |
| `grafanadata` | Dashboards (dev) | `docker exec aquastream-grafana ls /var/lib/grafana` |
| `lokidata` | Логи Loki (dev) | `docker exec aquastream-loki ls /loki` |

> Backup политики и restore сценарии описаны в [Backup & Recovery](backup-recovery.md).

## Частые операции

| Задача | Команда |
|--------|---------|
| Запуск профиля | `make up-<env>` |
| Остановка и очистка | `make down` (контейнеры + volumes) |
| Рестарт сервиса | `make restart SERVICE=backend-event` (`make restart-all`) |
| Просмотр логов | `make logs [SERVICE=backend-event]` |
| Статус контейнеров | `make ps` |
| Проверка здоровья | `make smoke` или `curl http://localhost:8080/actuator/health` |
| Обновление зависимостей Docker | `make build-images` + `make scan` |

Дополнительные сценарии разобраны в runbooks ([Service Restart](runbooks/service-restart.md), [Incident Response](runbooks/incident-response.md)).

## Ресурсы и лимиты

- Память и CPU задаются в `docker-compose.yml` → секция `deploy.resources.limits`.
- Рекомендуемые пороги: JVM сервисы 512–768 MB RAM, 0.75–1 vCPU; observability (dev) ≤ 0.5 vCPU.
- Мониторинг: `docker stats`, Grafana → Dashboard *Infrastructure*.
- При OOM см. [Troubleshooting](troubleshooting.md#performance-issues).

## Безопасность контейнеров {#security}

- Все backend-образы запускаются под пользователем `appuser` (UID/GID 1000), rootfs read-only.
- Dropped capabilities (`cap_drop: [ALL]`) и `no-new-privileges` включены.
- Проверка:
  ```bash
  docker exec aquastream-backend-event whoami            # → appuser
  docker exec aquastream-backend-event cat /proc/1/status | grep Cap
  ```
- Регулярно выполняйте `make scan` (Trivy) и отслеживайте отчёты.

## Сети и доступы

- Внутренняя сеть: `aquastream-net` (bridge). Сервисы доступны по именам контейнеров.
- Внешний трафик принимает Nginx и проксирует в gateway — см. [Deployment](deployment.md).
- Проверка DNS внутри сети: `docker exec backend-user ping -c1 postgres`.

## Чек-лист обновления инфраструктуры

1. Проверьте изменения Dockerfile/compose в PR (код + docs).
2. Локально выполните `make up-dev`, удостоверитесь что health checks зелёные.
3. Запустите `make scan` и `make sbom`.
4. Обновите документацию (этот файл + соответствующие runbooks).
5. Внесите изменения в `docs/architecture.md`, если затронута схема.

## См. также

- [Deployment](deployment.md)
- [Monitoring](monitoring.md)
- [Backup & Recovery](backup-recovery.md)
- Runbooks: [Database Maintenance](runbooks/database-maintenance.md), [Service Restart](runbooks/service-restart.md)
- [Nginx Edge Proxy](nginx.md)
