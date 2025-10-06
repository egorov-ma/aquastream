---
title: Bug Management
summary: Процесс управления дефектами в проекте AquaStream
tags: [qa, bugs, defects, issue-tracking]
---

# Управление багами

## Обзор

Документ описывает процесс управления дефектами (багами) в проекте AquaStream: от обнаружения до закрытия.

## Определения

**Bug (Дефект)** - несоответствие между ожидаемым и фактическим поведением системы, вызванное ошибкой в коде, конфигурации или документации.

**Типы дефектов**:
- **Functional**: ошибки в бизнес-логике
- **UI/UX**: проблемы интерфейса
- **Performance**: проблемы производительности
- **Security**: уязвимости безопасности
- **Data**: проблемы с данными
- **Documentation**: ошибки в документации

## Инструменты

**GitHub Issues** - основной инструмент для отслеживания багов

**Метки (Labels)**:
- `bug` - дефект
- `priority: critical` - критический приоритет
- `priority: high` - высокий приоритет
- `priority: medium` - средний приоритет
- `priority: low` - низкий приоритет
- `backend` / `frontend` - компонент
- `security` - уязвимость безопасности
- `performance` - проблема производительности
- `good first issue` - подходит для новичков

## Процесс управления багами

### 1. Обнаружение

**Источники**:
- Automated tests (unit, integration, E2E)
- Manual testing (exploratory, regression)
- Code review
- Production monitoring
- User reports

**Действия**:
- Воспроизвести баг
- Собрать информацию (логи, скриншоты, steps to reproduce)

### 2. Создание Issue

**Обязательные поля**:
- **Title**: краткое описание (например, "User registration fails with special characters in email")
- **Description**: подробное описание с использованием шаблона
- **Steps to reproduce**: шаги для воспроизведения
- **Expected behavior**: ожидаемое поведение
- **Actual behavior**: фактическое поведение
- **Environment**: окружение (dev/stage/prod), версия, браузер
- **Severity**: серьезность дефекта
- **Priority**: приоритет исправления

**Шаблон Issue**:
```markdown
## Description
[Краткое описание проблемы]

## Steps to Reproduce
1. Перейти на страницу регистрации
2. Ввести email: test+alias@example.com
3. Нажать "Зарегистрироваться"

## Expected Behavior
Пользователь должен быть успешно зарегистрирован

## Actual Behavior
Появляется ошибка: "Invalid email format"

## Environment
- **Version**: 1.0.0
- **Browser**: Chrome 120
- **OS**: macOS 14
- **Environment**: dev

## Screenshots/Logs
[Приложить скриншоты или логи]

## Additional Context
Email с символом '+' является валидным по RFC 5322
```

**Присвоение меток**:
```bash
# Пример
Labels: bug, priority: high, backend, backend-user
```

### 3. Триаж (Triage)

**Ответственный**: QA Lead, Tech Lead

**Действия**:
1. Проверка дублирования (search existing issues)
2. Определение severity
3. Определение priority
4. Назначение компонента (backend/frontend/infra)
5. Назначение ответственного (assignee)

**Severity (Серьезность)**:
- **Critical**: система не работает, блокирует основной функционал
- **High**: серьезная проблема, обходное решение сложное
- **Medium**: проблема влияет на функциональность, есть обходной путь
- **Low**: косметическая проблема, минимальное влияние

**Priority (Приоритет)**:
- **Critical**: исправить немедленно (hotfix)
- **High**: исправить в текущем спринте
- **Medium**: исправить в ближайших спринтах
- **Low**: исправить когда будет время (backlog)

**Примеры приоритизации**:

| Сценарий | Severity | Priority | Действие |
|----------|----------|----------|----------|
| Production down | Critical | Critical | Hotfix немедленно |
| Security vulnerability (CVSS > 7) | High | Critical | Hotfix ASAP |
| Регистрация не работает | High | High | Исправить в текущем спринте |
| UI кнопка не центрирована | Low | Low | Backlog |
| Медленный ответ API (> 2s) | Medium | High | Оптимизировать в текущем спринте |

### 4. Разработка Fix

**Действия разработчика**:
1. Создать ветку: `fix/issue-123-user-registration-email`
2. Воспроизвести баг локально
3. Написать failing test, который воспроизводит баг
4. Исправить код
5. Убедиться что test passed
6. Запустить все unit + integration tests
7. Создать PR с reference на issue: `Fixes #123`

**Code review**:
- Проверка корректности исправления
- Проверка покрытия тестами
- Проверка отсутствия регрессий

### 5. Валидация (QA Verification)

**Действия QA**:
1. Deploy фикса на stage окружение
2. Проверить что баг исправлен (retest)
3. Проверить steps to reproduce из issue
4. Regression testing: проверить смежную функциональность
5. Exploratory testing вокруг исправленной области

**Критерии валидации**:
- ✅ Баг не воспроизводится
- ✅ Нет новых багов (regression)
- ✅ Automated tests passed
- ✅ Документация обновлена (если нужно)

### 6. Закрытие Issue

**Действия**:
1. Оставить комментарий с результатом валидации
2. Закрыть issue с меткой `status: verified`
3. Deploy на production

**Комментарий**:
```markdown
✅ **Verified on stage**

- Environment: stage
- Version: 1.0.1
- Test result: баг не воспроизводится, регрессий не обнаружено

Ready for production deployment.
```

### 7. Мониторинг

**После deploy на production**:
- Мониторинг логов на наличие ошибок
- Мониторинг метрик (error rate, latency)
- User feedback

**Reopening**:
Если баг воспроизводится снова:
1. Reopen issue
2. Добавить комментарий с деталями
3. Повторить процесс

## Специальные случаи

### Критичные баги (Critical Priority)

**Hotfix процесс**:
1. Создать hotfix ветку от production: `hotfix/v1.0.1`
2. Минимальное исправление (только баг, без дополнительных изменений)
3. Ускоренный code review (< 1 час)
4. Smoke tests + regression tests затронутой области
5. Deploy на production ASAP
6. Post-mortem: анализ причин и prevention мер

**Коммуникация**:
- Обновить соответствующий Incident Issue (статус, таймлайн)
- Сообщить заинтересованным пользователям через выбранный канал (например, комментарий в Issue или email)
- Подготовить короткий пост-мортем заметку

### Security Vulnerabilities

**Процесс**:
1. Использовать **GitHub Security Advisories** (не публичные issues)
2. CVSS scoring для оценки severity
3. Приоритет: Critical/High → немедленный hotfix
4. Координация с DevOps для патча dependencies
5. Security bulletin для пользователей (если public facing)

**CVSS Scoring**:
- **9.0-10.0**: Critical → hotfix немедленно
- **7.0-8.9**: High → hotfix в течение 24 часов
- **4.0-6.9**: Medium → исправить в течение недели
- **0.1-3.9**: Low → исправить в следующем релизе

### Performance Issues

**Процесс**:
1. Профилирование для определения bottleneck
2. Baseline метрики (до исправления)
3. Исправление + оптимизация
4. Performance testing для верификации улучшения
5. Сравнение метрик (до/после)

**Метрики**:
- Latency: p50, p95, p99
- Throughput: requests/sec
- Resource usage: CPU, memory

## Метрики и отчетность

### KPI

| Метрика | Цель | Текущее |
|---------|------|---------|
| Bug density | < 1 bug/100 LOC | TBD |
| Time to fix (Critical) | < 4 hours | TBD |
| Time to fix (High) | < 3 days | TBD |
| Time to fix (Medium) | < 2 weeks | TBD |
| Reopen rate | < 5% | TBD |
| Bug escape rate (to prod) | < 2% | TBD |

### Отчеты

**Weekly Bug Report**:
- Новые баги: количество, severity distribution
- Исправленные баги: количество, average time to fix
- Открытые баги: total, по приоритетам
- Тренды: увеличение/уменьшение количества багов

**Monthly Quality Report**:
- Bug density по компонентам
- Most buggy components (top 5)
- Root cause analysis: топ причины багов
- Prevention actions

## Best Practices

### Для QA

**При создании bug report**:
- ✅ Воспроизвести баг минимум 2 раза
- ✅ Проверить на последней версии (возможно уже исправлено)
- ✅ Поиск дубликатов перед созданием
- ✅ Четкие steps to reproduce
- ✅ Приложить логи, скриншоты, видео
- ✅ Указать severity и предложить priority

**При валидации fix**:
- ✅ Тестировать на том же окружении где был обнаружен
- ✅ Regression testing смежной функциональности
- ✅ Проверить edge cases

### Для Developers

**При исправлении**:
- ✅ Написать failing test который воспроизводит баг
- ✅ Исправить минимально (не делать рефакторинг в том же PR)
- ✅ Reference на issue в commit message: `fix: user registration email validation (#123)`
- ✅ Обновить CHANGELOG.md
- ✅ Добавить regression test если баг критичный

**Code review**:
- ✅ Проверить что баг действительно исправлен
- ✅ Проверить наличие tests
- ✅ Проверить отсутствие side effects

## Инструменты и автоматизация

### GitHub Issues

**Автоматизация через GitHub Actions**:
- Auto-labeling по ключевым словам в title/description
- Auto-assignment по затронутому компоненту
- Stale issue bot: закрывать неактивные issues (> 60 дней)

**Issue templates**:
- `.github/ISSUE_TEMPLATE/bug_report.yml` - шаблон для багов
- Автоматическая валидация required fields

### Integration с CI/CD

**Автоматическое комментирование**:
- PR → Issue: автоматический комментарий "Fix in progress"
- Merge → Issue: автоматический комментарий "Fix deployed to stage"
- Release → Issue: автоматическое закрытие с меткой `status: released`

### Мониторинг

**Alerting**:
- Prometheus alerting для error rate spikes
- Grafana dashboards для визуализации error trends
- Sentry/Rollbar для automatic bug reporting (планируется)

## Примеры

### Functional Bug

**Title**: "Event booking fails when event is at full capacity"

**Labels**: `bug`, `priority: high`, `backend`, `backend-event`

**Description**:
```markdown
При попытке забронировать событие которое уже заполнено, система возвращает 500 вместо 400.

Steps to Reproduce:
1. POST /api/events с capacity=10
2. POST /api/bookings 10 раз
3. POST /api/bookings 11-й раз

Expected: HTTP 400 "Event is fully booked"
Actual: HTTP 500 Internal Server Error
```

**Fix**: Заменить `IllegalStateException` на `EventFullException`

### Security Vulnerability

**Title**: "SQL Injection in user search endpoint"

**Labels**: `bug`, `priority: critical`, `security`, `backend`

**CVSS Score**: 9.8 (Critical)

**Description**:
```markdown
Endpoint `/api/users/search?name=` уязвим к SQL injection.

Proof: GET /api/users/search?name=admin' OR '1'='1

Impact: Получение всех данных из БД, GDPR violation risk
```

**Fix**: Использовать параметризованные запросы через `@Query` с `@Param`

**Hotfix process**: Создать hotfix ветку → исправить → security scan → deploy ASAP

## См. также

- [Test Strategy](test-strategy.md)
- [Testing](testing.md)
- [CI/CD Pipeline](../operations/ci-cd.md)
- [GitHub Issues Best Practices](https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues)
