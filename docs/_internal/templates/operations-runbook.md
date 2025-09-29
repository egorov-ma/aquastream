# Operations Runbook: {Service/Component Name}

---
title: Runbook - {Service/Component Name}
summary: Операционные процедуры для {краткое описание компонента}
tags: [operations, runbook, {service-name}]
---

## Общая информация

**Сервис:** {Service Name}
**Команда:** {Team Name}
**Критичность:** High/Medium/Low
**SLA:** {99.9% uptime, <2s response time}

## Мониторинг

### Ключевые метрики

**Производительность:**
- `http_request_duration_seconds` - время ответа API
- `http_requests_total` - общее количество запросов
- `http_requests_errors_total` - количество ошибок

**Ресурсы:**
- `jvm_memory_used_bytes` - использование памяти JVM
- `system_cpu_usage` - загрузка CPU
- `database_connections_active` - активные соединения с БД

**Бизнес-метрики:**
- `{business_metric_1}` - {описание}
- `{business_metric_2}` - {описание}

### Дашборды

| Dashboard | URL | Назначение |
|-----------|-----|-----------|
| Service Overview | http://grafana.aquastream.org/d/{service-name} | Основные метрики сервиса |
| Infrastructure | http://grafana.aquastream.org/d/{service-name}-infra | Ресурсы и инфраструктура |
| Business Metrics | http://grafana.aquastream.org/d/{service-name}-business | Бизнес показатели |

### Алерты

| Alert | Threshold | Severity | Escalation |
|-------|-----------|----------|------------|
| High Error Rate | >5% (5min) | Critical | Immediate → Team Lead → Manager |
| High Response Time | >2s p95 (5min) | Warning | 15min → Team Lead |
| Memory Usage | >85% (10min) | Warning | 30min → Team Lead |
| DB Connection Pool | >90% (5min) | Critical | Immediate → DBA → Team Lead |
| Service Down | 0 healthy instances | Critical | Immediate → On-call → Manager |

## Логирование

### Уровни логирования
- **ERROR** - ошибки, требующие внимания
- **WARN** - предупреждения, потенциальные проблемы
- **INFO** - важные события (старт/стоп, API calls)
- **DEBUG** - детальная отладочная информация

### Ключевые события

**Жизненный цикл сервиса:**
- `SERVICE_STARTED` - сервис запущен
- `SERVICE_STOPPING` - сервис останавливается
- `HEALTH_CHECK_FAILED` - health check неуспешен

**API события:**
- `API_REQUEST_RECEIVED` - входящий запрос
- `API_REQUEST_COMPLETED` - запрос обработан
- `API_REQUEST_FAILED` - ошибка в обработке запроса

**Бизнес события:**
- `{BUSINESS_EVENT_1}` - {описание}
- `{BUSINESS_EVENT_2}` - {описание}

### Команды для работы с логами

```bash
# Просмотр логов сервиса
make logs-{service-name} ENV=production

# Фильтрация по уровню
make logs-{service-name} ENV=production LEVEL=ERROR

# Поиск по correlation ID
make logs-{service-name} ENV=production CORRELATION_ID={id}

# Логи за последний час
make logs-{service-name} ENV=production SINCE=1h
```

## Операционные процедуры

### Деплой

**Стандартный деплой:**
```bash
# 1. Подготовка
make pre-deploy-check SERVICE={service-name} ENV=production

# 2. Деплой
make deploy-{service-name} ENV=production VERSION={version}

# 3. Проверка
make post-deploy-check SERVICE={service-name} ENV=production
```

**Canary деплой:**
```bash
# Деплой на 10% трафика
make deploy-{service-name} ENV=production VERSION={version} CANARY=10

# Увеличение до 50%
make canary-{service-name} ENV=production TRAFFIC=50

# Полный rollout
make canary-{service-name} ENV=production TRAFFIC=100
```

### Откат

**Быстрый откат:**
```bash
# Откат к предыдущей версии
make rollback-{service-name} ENV=production

# Откат к конкретной версии
make rollback-{service-name} ENV=production VERSION={version}
```

**Проверка после отката:**
```bash
# Верификация работоспособности
make health-check SERVICE={service-name} ENV=production

# Проверка ключевых метрик
make metrics-check SERVICE={service-name} ENV=production
```

### Масштабирование

```bash
# Горизонтальное масштабирование
make scale-{service-name} ENV=production REPLICAS={count}

# Вертикальное масштабирование
make scale-{service-name} ENV=production CPU={cpu} MEMORY={memory}

# Автомасштабирование
make autoscale-{service-name} ENV=production MIN={min} MAX={max} CPU_TARGET={target}
```

## Troubleshooting

### Частые проблемы

**1. Высокая нагрузка (High Load)**

*Симптомы:*
- Время ответа > 2 секунд
- CPU utilization > 80%
- Очередь запросов растет

*Диагностика:*
```bash
# Проверка метрик
make metrics-check SERVICE={service-name}

# Анализ медленных запросов
make slow-queries SERVICE={service-name}

# Профилирование JVM
make profile-{service-name} ENV=production
```

*Действия:*
1. Масштабировать сервис: `make scale-{service-name} REPLICAS=+2`
2. Проверить медленные SQL запросы
3. Анализировать heap dump если проблема с памятью

**2. Ошибки подключения к БД (Database Connection Issues)**

*Симптомы:*
- Connection pool exhausted
- Database timeout errors
- `database_connections_active` близко к лимиту

*Диагностика:*
```bash
# Состояние connection pool
make db-pool-status SERVICE={service-name}

# Активные соединения
make db-connections SERVICE={service-name}

# Long-running queries
make db-long-queries SERVICE={service-name}
```

*Действия:*
1. Увеличить connection pool: конфиг `spring.datasource.hikari.maximum-pool-size`
2. Убить long-running queries
3. Перезапустить сервис если пул "завис"

**3. Memory Leak**

*Симптомы:*
- Постоянный рост `jvm_memory_used_bytes`
- OutOfMemoryError в логах
- GC паузы увеличиваются

*Диагностика:*
```bash
# Heap dump
make heap-dump SERVICE={service-name}

# GC статистика
make gc-stats SERVICE={service-name}

# Memory анализ
make memory-analyze SERVICE={service-name}
```

*Действия:*
1. Создать heap dump для анализа
2. Перезапустить affected instance
3. Анализировать dump с помощью Eclipse MAT

### Emergency procedures

**Полная недоступность сервиса:**
1. Проверить health endpoint: `make health-check SERVICE={service-name}`
2. Проверить логи: `make logs-{service-name} LEVEL=ERROR`
3. Перезапустить сервис: `make restart-{service-name} ENV=production`
4. Если не помогает - откат: `make rollback-{service-name} ENV=production`

**Критическая уязвимость:**
1. Немедленно уведомить Security team
2. Оценить необходимость экстренного отключения
3. Применить hotfix или откатиться
4. Документировать инцидент

## Контакты и эскалация

**On-call rotation:** {ссылка на PagerDuty/OpsGenie}

**Эскалация:**
1. **L1 (0-15 мин):** On-call engineer
2. **L2 (15-30 мин):** Team Lead
3. **L3 (30+ мин):** Engineering Manager
4. **L4 (Critical):** CTO

## Плановое обслуживание

### Еженедельные задачи
```bash
# Проверка логов на ошибки
make logs-review SERVICE={service-name}

# Анализ производительности
make performance-review SERVICE={service-name}

# Обновление зависимостей
make dependencies-check SERVICE={service-name}
```

### Ежемесячные задачи
```bash
# Ротация секретов
make secrets-rotate SERVICE={service-name}

# Обновление сертификатов
make certificates-renew SERVICE={service-name}

# Анализ capacity planning
make capacity-review SERVICE={service-name}
```

## См. также

- [Monitoring Strategy](../monitoring.md) - общая стратегия мониторинга
- [Incident Response](incident-response.md) - процедуры реагирования на инциденты
- [Backup & Recovery](../backup-recovery.md) - процедуры резервного копирования
- [Service Documentation](../../backend/{service-name}/) - техническая документация сервиса