---
title: Monitoring & Observability
summary: Как запускать и использовать observability stack AquaStream.
tags: [operations, monitoring, observability]
---

# Мониторинг и наблюдаемость

## Обзор

Observability стек (Prometheus, Grafana, Loki, Promtail) включён по умолчанию только в dev-профиле. Этот документ описывает как им пользоваться и какие проверки выполнять. Архитектурные решения и выбор инструментов описаны в [Architecture](../architecture.md#мониторинг-и-наблюдаемость).

## Быстрые ссылки (dev)

| Компонент | URL | Доступ |
|-----------|-----|--------|
| Grafana | `http://localhost:3001` | admin / admin (из `.env.dev`) |
| Prometheus | `http://localhost:9090` | открытый доступ |
| Loki API | `http://localhost:3100` | внутренняя сеть, через Grafana |
| Gateway health | `http://localhost:8080/actuator/health` | curl для smoke |
| Nginx status | `http://localhost/nginx-status` (если включено) | базовая статистика воркеров |

> Stage/Prod используют внешний мониторинг (например, Grafana Cloud). Поддерживайте паритет дашбордов.

## Запуск и проверка

```bash
make up-dev                # поднимает сервисы + observability
make ps | grep prometheus  # убедиться что контейнеры в статусе healthy
make smoke                 # проверить API Gateway
```

Если observability не нужен, используйте `make up-stage`/`make up-prod` — они не создают Prometheus/Grafana.

## Работа с метриками

- Prometheus собирает `/actuator/prometheus` со всех backend сервисов.
- Популярные запросы:
  ```promql
  rate(http_server_requests_seconds_count{status=~"5.."}[5m])
  histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))
  database_connections_active
  ```
- Для бизнес-метрик воспользуйтесь готовым Grafana Dashboard **Business Metrics** (provisioned из `backend-infra/docker/compose/grafana/provisioning/`).

## Работа с логами

- Логи собирает Promtail из Docker (`/var/run/docker.sock` read-only).
- В Grafana подключите datasource *Loki* и используйте примеры:
  ```logql
  {container_name="aquastream-backend-event"} |= "ERROR"
  {container_name=~"aquastream-backend-.*"} | json | duration > 1000
  ```
- При отладке пересекайте логи с trace-id (`correlationId` в JSON логах).

## Алерты

- Правила алертов держите в едином месте (Terraform/PrometheusRule). Базовые рекомендации:
  - Health check флапает > 2 минут.
  - Error rate > 5% (см. promQL выше).
  - Latency p95 > 2s.
  - Использование памяти > 85%, свободное место < 15%.
- Опишите адресатов и escalation chain в [Incident Response](runbooks/incident-response.md).

## Stage / Prod

- Настройте экспорт метрик (например, через remote_write) либо используйте Managed Prometheus.
- Логи из production рекомендуется отправлять в внешний сервис (ELK/Cloud Logging).
- Синхронизируйте дашборды: экспортируйте JSON из dev Grafana и загружайте в управляемый экземпляр.

## Диагностика

| Симптом | Что проверить | Runbook |
|---------|---------------|---------|
| Метрики не обновляются | `docker ps`, логи Prometheus | [Troubleshooting](troubleshooting.md#monitoring-stack) |
| В Grafana нет логов | `docker logs aquastream-promtail`, права на docker.sock | [Troubleshooting](troubleshooting.md#monitoring-stack) |
| Edge не отдаёт ответы | `docker logs nginx`, `curl -I http://localhost` | [Service Restart](runbooks/service-restart.md) |
| Health красный | `make smoke`, зависимые сервисы | [Service Restart](runbooks/service-restart.md) |

## См. также

- [Infrastructure](infrastructure.md)
- [Deployment](deployment.md)
- [Troubleshooting](troubleshooting.md)
- Runbooks: [Incident Response](runbooks/incident-response.md)
