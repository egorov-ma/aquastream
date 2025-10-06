# Troubleshooting

---
title: Troubleshooting Guide
summary: Быстрая диагностика проблем и ссылки на runbooks для инфраструктуры AquaStream.
tags: [operations, troubleshooting]
---

## Как пользоваться

1. Найдите симптом в таблице Quick Reference — там указаны первые проверки и ссылка на раздел.
2. Выполните базовую диагностику (логи, метрики, docker ps).
3. Если требуется план действий, перейдите в соответствующий runbook.

## Quick Reference

| Проблема | Быстрая проверка | Следующий шаг |
|----------|-----------------|---------------|
| Сервис не стартует | `docker ps -a`, `make logs` | [Startup issues](#startup-issues) |
| DB connection refused | `docker ps \| grep postgres`, `pg_isready` | [Database](#database-issues) |
| Redis PING не отвечает | `docker exec aquastream-redis redis-cli -a $REDIS_PASSWORD PING` | [Redis](#redis-issues) |
| MinIO выдаёт 403/404 | `curl http://localhost:9000/minio/health/live` | [MinIO](#minio-issues) |
| Health check красный | `make smoke`, `curl /actuator/health` | [Health checks](#health-checks) |
| Высокая задержка API | Grafana → `http_server_requests_seconds` | [Performance](#performance-issues) |
| Заканчивается место | `df -h`, `docker system df` | [Disk space](#disk-space) |
| CI падает на lock-файлах | артефакт `lock-check` | [CI/CD](#ci-cd-issues) |

## Базовая диагностика

```bash
make ps                     # статус контейнеров
make logs [SERVICE=...]      # логи сервиса
make smoke                   # health gateway
curl http://localhost:8102/actuator/health   # health конкретного сервиса
```

Дополнительно держите под рукой `docker stats`, `docker network inspect aquastream-net`, `docker system df`.

## Startup issues {#startup-issues}

**Симптомы:** контейнеры в статусе `Restarting/Exited`, health check `unhealthy`.

1. Проверить зависимости (`postgres`, `redis`, `minio`): `docker ps | grep -E "postgres|redis|minio"`.
2. Убедиться в корректности `.env` (`docker exec <svc> env | grep POSTGRES`).
3. Проверить порты на конфликт: `lsof -i :8080`.
4. При необходимости выполнить перезапуск через [Service Restart](runbooks/service-restart.md).

## Database {#database-issues}

**Быстрая проверка:** `docker exec aquastream-postgres pg_isready -U aquastream`.

- Connection refused — проверьте сеть (`docker exec backend-user ping -c1 postgres`) и креды.
- Too many connections — `docker exec aquastream-postgres psql -c "SELECT count(*) FROM pg_stat_activity"`; при необходимости уменьшите пул (`hikari.maximum-pool-size`).
- Ошибка миграции — смотрите логи Liquibase и используйте [Database Maintenance](runbooks/database-maintenance.md) для rollback.

## Redis {#redis-issues}

- `redis-cli -a $REDIS_PASSWORD PING` должен возвращать `PONG`.
- Проверить память: `redis-cli INFO memory`.
- При ошибках авторизации убедитесь, что пароль совпадает с `.env`.
- Для очистки dev-данных: `redis-cli FLUSHALL` (только в dev!).

## MinIO {#minio-issues}

- Health: `curl -f http://localhost:9000/minio/health/live`.
- Buckets: `make minio-buckets` или `mc ls local/`.
- Ошибки 404 → выполните bootstrap (`make minio-bootstrap`).
- Проверить access key/secret в `.env` и сервисах.

## Health checks {#health-checks}

- `make smoke` проверяет gateway + основные сервисы.
- Если конкретный сервис unhealthy — смотрите его логи и зависимости.
- Повторно задеплойте или перезапустите сервис через [Service Restart](runbooks/service-restart.md).

## Disk space {#disk-space}

- Системный диск: `df -h`.
- Docker уровни: `docker system df`.
- Очистка: `docker system prune -a --volumes` (убедиться, что бэкапы сняты).
- Если разросся `pgdata` — проверьте [Database Maintenance](runbooks/database-maintenance.md) (VACUUM).

## Performance {#performance-issues}

- Метрики ответов: Grafana Dashboard **Performance** или promQL `histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))`.
- Проверить медленные SQL: `docker logs <service> | grep "duration:"`.
- Heap/CPU: `docker stats`, `jmap`, `jstack` (для JVM в dev).
- При устойчивых проблемах задействуйте [Incident Response](runbooks/incident-response.md).

## Monitoring stack {#monitoring-stack}

<a id="prometheus-issues"></a>
<a id="loki-issues"></a>

- Prometheus не собирает метрики → `docker logs aquastream-prometheus`.
- Loki без логов → `docker logs aquastream-promtail`, проверить права на docker.sock.
- Перезапустить наблюдение: `docker compose restart prometheus grafana loki promtail` (dev).
- Детали по настройке: [Monitoring](monitoring.md).

## CI/CD {#ci-cd-issues}

- `backend-ci`/`frontend-ci` — открывайте артефакты с логами.
- Lock check упал → `make deps-lock` и закоммитить обновлённые lock-файлы.
- `ci-images` ругается на уязвимости → устраните или добавьте исключение, затем перезапустите workflow.
- Guidelines и ссылки на workflow'ы см. в [CI/CD](ci-cd.md).

## Когда эскалировать

- Инциденты P0/P1 — немедленно переходите к [Incident Response](runbooks/incident-response.md).
- Неустранимые инфраструктурные проблемы — создайте ticket и задокументируйте шаги, приложив логи и метрики.

## См. также

- [Deployment](deployment.md)
- [Infrastructure](infrastructure.md)
- [Monitoring](monitoring.md)
- Runbooks: [Service Restart](runbooks/service-restart.md), [Database Maintenance](runbooks/database-maintenance.md), [Incident Response](runbooks/incident-response.md)
