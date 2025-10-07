---
title: Bug Management
summary: Процесс управления дефектами в проекте AquaStream
tags: [qa, bugs, defects, issue-tracking]
---

# Управление багами

## Обзор

Процесс управления дефектами от обнаружения до закрытия. **Инструмент**: GitHub Issues.

## Определения

| Термин | Описание |
|--------|----------|
| **Bug (Дефект)** | Несоответствие между ожидаемым и фактическим поведением системы |
| **Severity** | Серьезность дефекта (влияние на систему) |
| **Priority** | Приоритет исправления (срочность) |
| **Bug Density** | Количество багов на 100 строк кода |
| **Time to Fix** | Время от обнаружения до закрытия |
| **Reopen Rate** | Процент багов, которые были переоткрыты |

### Типы дефектов

| Тип | Описание | Метка |
|-----|----------|-------|
| **Functional** | Ошибки в бизнес-логике | `bug` |
| **UI/UX** | Проблемы интерфейса | `bug`, `frontend` |
| **Performance** | Проблемы производительности | `bug`, `performance` |
| **Security** | Уязвимости безопасности | `bug`, `security` |
| **Data** | Проблемы с данными | `bug`, `backend` |
| **Documentation** | Ошибки в документации | `documentation` |

## GitHub Issues Labels

| Метка | Назначение |
|-------|------------|
| `bug` | Дефект |
| `priority: critical` | Критический приоритет |
| `priority: high` | Высокий приоритет |
| `priority: medium` | Средний приоритет |
| `priority: low` | Низкий приоритет |
| `backend` / `frontend` | Компонент |
| `security` | Уязвимость безопасности |
| `performance` | Проблема производительности |
| `good first issue` | Подходит для новичков |

## Процесс управления багами

### Этапы процесса

| Этап | Ответственный | Действия | Выход |
|------|---------------|----------|-------|
| **1. Обнаружение** | QA, Dev, Users | Воспроизвести баг, собрать логи/скриншоты | Информация для issue |
| **2. Создание Issue** | QA, Dev | Заполнить шаблон, присвоить метки | GitHub Issue |
| **3. Триаж** | QA Lead, Tech Lead | Определить severity/priority, назначить | Приоритизированный issue |
| **4. Разработка Fix** | Developer | Создать ветку, написать failing test, исправить код, PR | Pull Request |
| **5. Валидация (QA)** | QA | Retest на stage, regression testing, exploratory testing | Verified или Reopened |
| **6. Закрытие** | QA | Комментарий, закрыть issue, deploy на prod | Closed issue |
| **7. Мониторинг** | Ops, QA | Мониторинг логов/метрик после deploy | Подтверждение fix |

### Источники обнаружения

- ✅ Automated tests (unit, integration, E2E)
- ✅ Manual testing (exploratory, regression)
- ✅ Code review
- ✅ Production monitoring
- ✅ User reports

## Bug Report Template

Обязательные поля в GitHub Issue:

| Поле | Описание | Пример |
|------|----------|--------|
| **Title** | Краткое описание | "User registration fails with special characters in email" |
| **Description** | Подробное описание | См. шаблон ниже |
| **Steps to Reproduce** | Пошаговые действия | 1. Go to /register<br>2. Enter email: test+alias@example.com<br>3. Click "Submit" |
| **Expected Behavior** | Ожидаемое поведение | User should be registered successfully |
| **Actual Behavior** | Фактическое поведение | Error: "Invalid email format" |
| **Environment** | Окружение | Version: 1.0.0, Browser: Chrome 120, OS: macOS 14, Env: dev |
| **Severity** | Серьезность | Critical / High / Medium / Low |
| **Priority** | Приоритет | Critical / High / Medium / Low |
| **Screenshots/Logs** | Приложения | Скриншоты, логи, видео |

## Severity vs Priority

| Severity | Описание | Priority | SLA |
|----------|----------|----------|-----|
| **Critical** | Система не работает, блокирует основной функционал | Critical | Hotfix немедленно (<4 часа) |
| **High** | Серьезная проблема, сложный workaround | High | Текущий спринт (<3 дня) |
| **Medium** | Проблема с workaround | Medium | Ближайшие спринты (<2 недели) |
| **Low** | Косметическая проблема, минимальное влияние | Low | Backlog (когда будет время) |

### Примеры приоритизации

| Сценарий | Severity | Priority | Действие |
|----------|----------|----------|----------|
| Production down | Critical | Critical | Hotfix немедленно |
| Security vulnerability (CVSS > 7) | High | Critical | Hotfix ASAP |
| Регистрация не работает | High | High | Исправить в текущем спринте |
| UI кнопка не центрирована | Low | Low | Backlog |
| Медленный ответ API (> 2s) | Medium | High | Оптимизировать в текущем спринте |

## Разработка Fix - Best Practices

| Этап | Best Practice |
|------|---------------|
| **Ветка** | `fix/issue-123-user-registration-email` |
| **Test** | ✅ Написать failing test, который воспроизводит баг |
| **Fix** | ✅ Минимальное исправление (не делать рефакторинг в том же PR) |
| **Commit** | ✅ Reference на issue: `fix: user registration email validation (#123)` |
| **Tests** | ✅ Запустить unit + integration tests |
| **PR** | ✅ PR description с `Fixes #123` |
| **Changelog** | ✅ Обновить CHANGELOG.md |

### QA Verification Checklist

- ✅ Баг не воспроизводится
- ✅ Regression testing смежной функциональности
- ✅ Проверка edge cases
- ✅ Automated tests passed
- ✅ Документация обновлена (если нужно)

## Специальные случаи

### Critical Bugs (Hotfix Process)

| Шаг | Действие | SLA |
|-----|----------|-----|
| **1. Hotfix ветка** | Создать от production: `hotfix/v1.0.1` | Немедленно |
| **2. Fix** | Минимальное исправление (только баг) | <2 часа |
| **3. Review** | Ускоренный code review | <1 час |
| **4. Tests** | Smoke tests + regression затронутой области | <30 мин |
| **5. Deploy** | Deploy на production | ASAP |
| **6. Post-Mortem** | Анализ причин и prevention мер | В течение дня |

**Коммуникация**:
- Обновить Incident Issue (статус, таймлайн)
- Сообщить пользователям (комментарий в Issue или email)
- Подготовить post-mortem заметку

### Security Vulnerabilities

| CVSS Score | Severity | SLA | Процесс |
|------------|----------|-----|---------|
| 9.0-10.0 | Critical | Hotfix немедленно | GitHub Security Advisory |
| 7.0-8.9 | High | Hotfix <24 часа | GitHub Security Advisory |
| 4.0-6.9 | Medium | Исправить <1 неделя | GitHub Security Advisory или Issue |
| 0.1-3.9 | Low | Следующий релиз | GitHub Issue |

**Процесс**:
1. Использовать **GitHub Security Advisories** (не публичные issues)
2. CVSS scoring для оценки severity
3. Координация с DevOps для патча dependencies
4. Security bulletin для пользователей (если public facing)

### Performance Issues

| Метрика | Baseline | Target | Процесс |
|---------|----------|--------|---------|
| **Latency** | p50, p95, p99 | Улучшение ≥20% | Профилирование → Оптимизация → Performance testing |
| **Throughput** | requests/sec | Улучшение ≥30% | Baseline → Fix → Compare |
| **Resource Usage** | CPU, memory | Снижение ≥15% | Monitoring → Optimization → Verification |

## Метрики и отчетность

### KPI

| Метрика | Цель | Текущее | Мониторинг |
|---------|------|---------|------------|
| **Bug Density** | <1 bug/100 LOC | TBD | Еженедельно |
| **Time to Fix (Critical)** | <4 hours | TBD | Per issue |
| **Time to Fix (High)** | <3 days | TBD | Per issue |
| **Time to Fix (Medium)** | <2 weeks | TBD | Per issue |
| **Reopen Rate** | <5% | TBD | Ежемесячно |
| **Bug Escape Rate (to prod)** | <2% | TBD | Per release |

### Отчеты

| Отчет | Частота | Содержание |
|-------|---------|------------|
| **Weekly Bug Report** | Еженедельно | Новые баги, исправленные, открытые, severity distribution |
| **Monthly Quality Report** | Ежемесячно | Bug density по компонентам, root cause analysis, prevention actions |

## Best Practices

### Для QA

| При создании bug report | При валидации fix |
|-------------------------|-------------------|
| ✅ Воспроизвести баг минимум 2 раза | ✅ Тестировать на том же окружении |
| ✅ Проверить на последней версии | ✅ Regression testing |
| ✅ Поиск дубликатов перед созданием | ✅ Проверить edge cases |
| ✅ Четкие steps to reproduce | ✅ Проверить смежную функциональность |
| ✅ Приложить логи, скриншоты, видео | ✅ Убедиться что automated tests passed |

### Для Developers

| При исправлении | Code review |
|-----------------|-------------|
| ✅ Написать failing test | ✅ Проверить что баг действительно исправлен |
| ✅ Исправить минимально | ✅ Проверить наличие tests |
| ✅ Reference на issue в commit | ✅ Проверить отсутствие side effects |
| ✅ Обновить CHANGELOG.md | ✅ Проверить что нет regression |

## Автоматизация

### GitHub Actions Integration

| Автоматизация | Триггер | Действие |
|---------------|---------|----------|
| **Auto-labeling** | Issue created | Метки по ключевым словам в title/description |
| **Auto-assignment** | Issue created | Назначение по затронутому компоненту |
| **PR → Issue comment** | PR created | "Fix in progress" в issue |
| **Merge → Issue comment** | PR merged | "Fix deployed to stage" в issue |
| **Release → Issue close** | Release created | Автоматическое закрытие с `status: released` |
| **Stale issue bot** | Daily | Закрывать неактивные issues (>60 дней) |

### Monitoring Alerts

- **Prometheus**: Error rate spikes
- **Grafana**: Visualize error trends
- **Sentry/Rollbar**: Automatic bug reporting (планируется)

---

См. [Test Strategy](test-strategy.md), [Testing](testing.md), [CI/CD Pipeline](../operations/ci-cd.md).