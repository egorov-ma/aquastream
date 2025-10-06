# Runbook: Service Restart

---
title: Service Restart Runbook
summary: Безопасная перезагрузка сервисов AquaStream в разных окружениях.
tags: [operations, runbook]
---

## Предусловия

- Убедитесь, что все зависимости сервиса доступны (DB, очереди, внешние API).
- Проверьте активные деплой/миграции.
- Есть доступ в нужное окружение (dev/stage/prod).

## Общий алгоритм

1. Зафиксировать задачу в Issue/журнале (дата, сервис, причина).
2. Снять текущее состояние: метрики, активные запросы, логи.
3. Выполнить рестарт.
4. Проверить health checks и метрики.
5. Добавить итоговую заметку в Issue.

## Команды

### Docker Compose (dev/stage)

```bash
# Перезапуск backend-event
make restart SERVICE=backend-event

# Рестарт всех сервисов
make restart-all
```

Команда вызывает `docker compose restart <service>` и ждёт успешного health check.

### Production (systemd/kubernetes)

```bash
# systemd
sudo systemctl restart aquastream-backend-event
sudo systemctl status aquastream-backend-event

# Kubernetes
kubectl rollout restart deployment backend-event
kubectl rollout status deployment backend-event
```

## Проверки после рестарта

- Health check: `curl -f https://<env>/actuator/health`.
- Логи: `make logs SERVICE=backend-event --since 5m`.
- Метрики: Grafana dashboard `Service Health`.
- Business checks: провести smoke тесты.

## Откат

Если сервис не восстанавливается:

1. Просмотреть логи, определить причину.
2. Выполнить rollback: `make rollback SERVICE=backend-event`.
3. При необходимости восстановить из бэкапа.
4. Эскалировать по [Incident Response Runbook](incident-response.md).

## SLA

- Dev: 5 минут.
- Stage: 10 минут.
- Prod: 15 минут.

## Связанные материалы

- [Deployment Guide](../deployment.md)
- [Support Policy](../policies/support.md)
- [Troubleshooting Guide](../troubleshooting.md)
