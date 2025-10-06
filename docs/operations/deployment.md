# Deployment

---
title: Deployment Guide
summary: Сценарии выката AquaStream для dev/stage/prod окружений.
tags: [operations, deployment, docker-compose, release]
---

## Обзор

AquaStream разворачивается через **Docker Compose** и Makefile-обвязку. Этот документ описывает подготовку, запуск и проверку релизов в разных окружениях. Детали инфраструктуры см. в [Infrastructure](infrastructure.md), управление версиями — в [Version Management](version-management.md).

## Процесс релиза

1. **Запланировать релиз** — проверить backlog, наличие открытых инцидентов, синхронизацию версий.
2. **Повысить версию** — использовать Gradle задачи из [Version Management](version-management.md) (`releasePatch|releaseMinor|releaseMajor`).
3. **Подготовить ветку** — `release/x.y.z`, freeze на новые фичи, обновление changelog.
4. **Пройти проверки** — CI/CD (`backend-ci`, `frontend-ci`, `docs-ci`), security (`make scan`, `dependencyCheckAnalyze`).
5. **Выкатить** — шаги ниже для нужного окружения.
6. **Проверить** — smoke, метрики, алерты.
7. **Завершить** — теги, релиз-ноты, пострелизный мониторинг.

## Окружения

| Окружение | Команда | Compose файлы | Что ещё учесть |
|-----------|---------|---------------|----------------|
| **Dev** | `make up-dev` | base + `docker-compose.override.dev.yml` | Автосборка артефактов, observability stack включён |
| **Stage** | `make up-stage` | base + `docker-compose.override.stage.yml` | Секреты из `.env.stage`, наблюдение через внешний мониторинг |
| **Prod** | `make up-prod` | base | Сильные пароли, закрытые порты, обязательный HTTPS |

> Шаблоны переменных окружения: `backend-infra/docker/compose/.env.<env>.example`. Используйте их как единственный источник правды.

## Подготовка перед выкатыванием

- Обновить `version.properties` через Gradle задачи.
- Убедиться, что `.env.<env>` заполнен и не закоммичен.
- Запустить локально `./gradlew clean build` и `pnpm lint && pnpm build` (frontend).
- Выполнить security проверки: `make scan`, `./gradlew dependencyCheckAnalyze`.
- Сделать бэкап (`make backup`) перед stage/prod выката.
- Сообщить о начале релиза в `#deployments`.

## Выполнение

### Development

```bash
cp backend-infra/docker/compose/.env.dev.example backend-infra/docker/compose/.env.dev
make up-dev
make smoke
```

Используйте dev окружение для интеграционного тестирования и проверки миграций.

### Stage / Production

```bash
cp backend-infra/docker/compose/.env.prod.example backend-infra/docker/compose/.env.prod
# Заполнить секреты вручную
make backup                     # перед выкатыванием
make build-images               # при необходимости пересобрать образа
make up-stage                   # или make up-prod
make smoke
```

После старта:
- Проверить health всех сервисов (`curl -f https://<env>/actuator/health`).
- Открыть основные пользовательские сценарии (booking, payment).
- Убедиться в отсутствии ошибок в `make logs` и алертов мониторинга.

## Проверки после релиза

- Smoke-тесты (`make smoke`, ручные сценарии).
- Метрики: latency p95, error rate, ресурсы (`docker stats`, Grafana).
- Логи: `make logs | grep -i error`.
- Подтверждение от продуктовой команды.

## Rollback

| Стратегия | Когда использовать | Как выполнить |
|-----------|--------------------|---------------|
| **Git tag** | Проблема в коде, без миграций | Checkout предыдущего тега → `make build-images` → `make up-<env>` |
| **Docker образ** | Образы в registry | Pull предыдущего образа, retag → перезапуск | 
| **Бэкап БД** | Ошибка миграции | См. [Database Maintenance](runbooks/database-maintenance.md) |
| **Service restart** | Отдельный сервис деградирует | См. [Service Restart](runbooks/service-restart.md) |

## Миграции БД

- Liquibase запускается автоматически при старте сервиса.
- Поддерживайте **blue-green** миграции: 
  1. Релиз N — добавить новые объекты, сделать nullable поля.
  2. Релиз N+1 — ужесточить ограничения, удалять старые поля.
- Проверка: `docker logs <service> | grep liquibase` и smoke-тесты после миграции.
- Для ручного применения используйте make-таргеты (`make liq-*-update`).

## Zero-downtime

Поддерживается стратегией blue-green через отдельный compose файл. Обновлённую последовательность действий см. в `backend-infra/docker/compose/docker-compose.blue-green.yml` и согласуйте с DevOps перед применением.

## См. также

- [Infrastructure](infrastructure.md)
- [Version Management](version-management.md)
- [CI/CD](ci-cd.md)
- [Backup & Recovery](backup-recovery.md)
- Runbooks: [Service Restart](runbooks/service-restart.md), [Incident Response](runbooks/incident-response.md)
