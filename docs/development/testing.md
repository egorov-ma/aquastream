# Тестирование

## Обзор

Стратегия включает: Unit-тесты, Integration-тесты, E2E-тесты. См. [QA Test Strategy](../qa/test-strategy.md).

## Backend

```bash
# Unit-тесты
./gradlew test                                    # Все тесты
./gradlew :backend-user:backend-user-service:test # Конкретный модуль

# Integration-тесты
./gradlew integrationTest

# Архитектурные тесты (ArchUnit)
./gradlew test --tests "*LayerRulesTest"
```

## Frontend

```bash
# Линтеры и типизация
pnpm lint && pnpm typecheck && pnpm build

# Unit-тесты (Node test runner)
pnpm test:unit

# E2E-тесты (Playwright)
pnpm exec playwright install --with-deps chromium  # Установка браузеров (один раз)
pnpm test:e2e
```

## Команды

```bash
# Все проверки
make backend-test   # Backend
make frontend-test  # Frontend

# Отчёты
# Backend: build/reports/tests/test/index.html
# Frontend: test-results/
```

## Рекомендации

- Пишите тесты для новой функциональности
- Поддерживайте покрытие ≥ 70%
- Используйте Testcontainers для интеграционных тестов
- Следуйте паттернам существующих тестов