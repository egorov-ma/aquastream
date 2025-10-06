---
title: Test Plan - {Feature/Module Name}
summary: План тестирования для {краткое описание функциональности}
tags: [qa, testing, test-plan, {module}]
---

# Test Plan: {Feature/Module Name}

## Цель тестирования

{Описание что тестируем и зачем}

## Область тестирования

**В области тестирования:**
- ✅ {Функция 1}
- ✅ {Функция 2}
- ✅ {Функция 3}

**Вне области тестирования:**
- ❌ {Что не тестируем}
- ❌ {Исключения}

## Тестовые среды

| Среда | URL | Назначение | Доступ |
|-------|-----|-----------|--------|
| Development | http://localhost:3000 | Разработка | Локально |
| Staging | https://staging.aquastream.org | Тестирование | VPN |
| Production | https://aquastream.org | Продакшн | Только чтение |

## Стратегия тестирования

### Unit тесты
**Цель:** Тестирование отдельных компонентов
**Инструменты:** Jest, JUnit 5, TestContainers
**Покрытие:** >80%

```bash
# Запуск unit тестов
make test-unit MODULE={module-name}
```

### Integration тесты
**Цель:** Тестирование взаимодействия между модулями
**Инструменты:** TestContainers, Testcontainers for Node.js

```bash
# Запуск integration тестов
make test-integration MODULE={module-name}
```

### API тесты
**Цель:** Тестирование REST API endpoints
**Инструменты:** Postman/Newman, REST Assured

```bash
# Запуск API тестов
make test-api SERVICE={service-name}
```

### E2E тесты
**Цель:** Тестирование пользовательских сценариев
**Инструменты:** Cypress, Playwright

```bash
# Запуск E2E тестов
make test-e2e SUITE={suite-name}
```

## Тест-кейсы

### Позитивные сценарии

**TC-001: {Название тест-кейса}**
- **Предусловия:** {описание}
- **Шаги:**
  1. {Шаг 1}
  2. {Шаг 2}
  3. {Шаг 3}
- **Ожидаемый результат:** {результат}
- **Приоритет:** High/Medium/Low

### Негативные сценарии

**TC-002: {Название негативного тест-кейса}**
- **Предусловия:** {описание}
- **Шаги:**
  1. {Неправильный ввод}
  2. {Проверка обработки ошибки}
- **Ожидаемый результат:** {корректная обработка ошибки}

### Граничные значения

**TC-003: {Тестирование границ}**
- **Описание:** Тестирование минимальных/максимальных значений
- **Значения:** {список граничных значений}

## Тестовые данные

**Пользователи:**
```bash
# Создание тестовых пользователей
make test-data-users ENV=staging
```

**Контент:**
```bash
# Загрузка тестового контента
make test-data-content ENV=staging
```

**База данных:**
```bash
# Сброс и инициализация тестовой БД
make test-db-reset ENV=staging
```

## Критерии приемки

**Функциональные требования:**
- [ ] Все позитивные сценарии проходят
- [ ] Негативные сценарии обрабатываются корректно
- [ ] Валидация данных работает правильно

**Нефункциональные требования:**
- [ ] Время ответа API < 2сек (p95)
- [ ] UI отзывается < 1сек
- [ ] Поддержка 100 одновременных пользователей

**Качество кода:**
- [ ] Unit test coverage > 80%
- [ ] Нет критических issues в SonarQube
- [ ] Все integration тесты проходят

## Процедуры тестирования

### Ежедневное тестирование
```bash
# Smoke тесты
make test-smoke

# Regression suite (критический путь)
make test-regression-critical
```

### Перед релизом
```bash
# Полный regression suite
make test-regression-full

# Performance тесты
make test-performance

# Security тесты
make test-security
```

## Дефекты и риски

### Известные ограничения
- {Ограничение 1}
- {Ограничение 2}

### Риски
| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| {Описание риска} | High/Medium/Low | High/Medium/Low | {План действий} |

## Метрики тестирования

**Отслеживаемые метрики:**
- Test execution rate
- Test pass rate
- Defect detection rate
- Test coverage

**Дашборды:**
- [QA Metrics Dashboard](http://grafana.aquastream.org/d/qa-metrics)
- [Test Results Dashboard](http://grafana.aquastream.org/d/test-results)

## Автоматизация

### CI/CD интеграция
```yaml
# GitHub Actions
- name: Run Tests
  run: |
    make test-unit
    make test-integration
    make test-api
```

### Регулярные прогоны
```bash
# Ночные E2E тесты
make test-e2e-nightly

# Еженедельные performance тесты
make test-performance-weekly
```

## См. также

- QA Strategy: `qa/test-strategy.md` - общая стратегия тестирования
- Test Automation: `qa/automation/` - документация по автотестам
- Bug Management: `qa/bug-management.md` - процесс управления дефектами
- Performance Testing: `qa/performance/` - нагрузочное тестирование
