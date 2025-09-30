# QA & Testing

## Обзор

Документация по обеспечению качества и тестированию в проекте AquaStream.

## Структура

- **[Test Strategy](test-strategy.md)** - общая стратегия тестирования
- **[Bug Management](bug-management.md)** - управление дефектами

### Планы тестирования

- **[Backend Testing](test-plans/backend-testing.md)** - план тестирования backend
- **[Frontend Testing](test-plans/frontend-testing.md)** - план тестирования frontend
- **[Integration Testing](test-plans/integration-testing.md)** - интеграционное тестирование
- **[E2E Testing](test-plans/e2e-testing.md)** - end-to-end тестирование

### Автоматизация

- **[Unit Tests](automation/unit-tests.md)** - юнит-тесты
- **[API Tests](automation/api-tests.md)** - API тесты
- **[UI Tests](automation/ui-tests.md)** - UI тесты

### Ручное тестирование

- **[Test Cases](manual-testing/test-cases.md)** - тест-кейсы
- **[Regression Suite](manual-testing/regression-suite.md)** - регрессионное тестирование
- **[Exploratory Testing](manual-testing/exploratory-testing.md)** - исследовательское тестирование

### Производительность

- **[Load Testing](performance/load-testing.md)** - нагрузочное тестирование
- **[Performance Benchmarks](performance/performance-benchmarks.md)** - базовые показатели

## Быстрый старт

### Backend тесты

```bash
# Unit-тесты
./gradlew test

# Integration-тесты
./gradlew integrationTest

# Все тесты
./gradlew check
```

### Frontend тесты

```bash
# Линтеры и типизация
pnpm lint
pnpm typecheck

# Unit-тесты
pnpm test:unit

# E2E-тесты
pnpm test:e2e
```

### Нагрузочное тестирование

```bash
# K6 smoke test
k6 run k6-smoke.js

# K6 load test
k6 run k6-load.js
```

## Метрики качества

### Цели

- **Code Coverage**: ≥ 70%
- **Test Success Rate**: 100%
- **Bug Density**: < 1 bug/100 LOC
- **Flaky Test Rate**: < 2%

### Текущие показатели

См. [Test Strategy](test-strategy.md) для актуальных метрик.

## Процесс QA

1. **Планирование**: определение объема тестирования
2. **Разработка тестов**: создание автоматизированных и ручных тестов
3. **Выполнение**: запуск тестов
4. **Отчетность**: документирование результатов
5. **Улучшение**: анализ и оптимизация

## Инструменты

- **JUnit 5**: unit-тесты Java
- **Testcontainers**: integration-тесты с Docker
- **Playwright**: E2E тесты frontend
- **K6**: нагрузочное тестирование
- **ArchUnit**: архитектурные тесты

## См. также

- [Development Testing](../development/testing.md)
- [Backend Testing Guides](../backend/)
- [Frontend Testing Guide](../frontend/testing.md)
