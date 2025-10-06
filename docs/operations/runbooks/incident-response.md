# Runbook: Incident Response

---
title: Incident Response Runbook
summary: Шаги реагирования на инциденты в продуктивной среде AquaStream.
tags: [operations, runbook, incident]
---

## Подготовка

- Шаблон для фикса инцидента: [Incident Report](https://github.com/egorov-ma/aquastream/blob/main/.github/ISSUE_TEMPLATE/incident-report.md).
- Список сервисов и доступов: `.env.*`, `backend-infra/make/Makefile`.
- Инструменты мониторинга: Grafana, Loki, `make smoke`.

## Поток реагирования (P0/P1)

1. **Детектирование**
   - Источник: мониторинг, GitHub Issue, письмо.
   - Оцените приоритет (см. Support Guide).

2. **Активация команды**
   - Создайте/обновите Incident Issue (описание, приоритет, статус).

3. **Стабилизация**
   - Первые 15 минут: собрать факты (что, когда, кого затронуло).
   - При необходимости отключить проблемные компоненты (feature flag, rollback).

4. **Коммуникация**
   - Обновляйте комментарии в Incident Issue.
   - Если есть пользователи, предупредите их через выбранный канал (например, GitHub Discussions).

5. **Решение**
   - Применить фикс (hotfix, rollback, конфигурация).
   - Подтвердить восстановление сервиса (метрики, health checks).

6. **Post-Incident**
   - Записать таймлайн и корневую причину в Incident Issue.
   - Обновить документацию/Runbook при необходимости.

## Инструменты

- Обнаружение: Grafana, Alertmanager, Sentry.
- Диагностика: Kibana/Loki, Jaeger, kubectl/docker.
- Команды восстановления: `make rollback`, `make restore`, `make deploy`.

## Документация

- [Support Policy](../policies/support.md)
- [Security Policy](../policies/security.md)
- [Runbook: Service Restart](service-restart.md)
- [Troubleshooting Guide](../troubleshooting.md)
