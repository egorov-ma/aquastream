# Тестирование

## Обзор

Стратегия тестирования включает несколько уровней:
- Unit-тесты
- Integration-тесты  
- E2E-тесты

См. также: [QA Test Strategy](../qa/test-strategy.md)

## Backend тестирование

### Unit-тесты

```bash
# Запуск всех тестов
./gradlew test

# Запуск тестов конкретного модуля
./gradlew :backend-user:backend-user-service:test
```

### Integration-тесты

```bash
# Запуск интеграционных тестов
./gradlew integrationTest
```

### Архитектурные тесты (ArchUnit)

```bash
# Проверка архитектурных правил
./gradlew test --tests "*LayerRulesTest"
```

## Frontend тестирование

### Линтеры и типизация

```bash
# ESLint
pnpm lint

# TypeScript
pnpm typecheck

# Сборка
pnpm build
```

### Unit-тесты

```bash
# Node test runner
pnpm test:unit
```

### E2E-тесты (Playwright)

```bash
# Установка браузеров (один раз)
pnpm exec playwright install --with-deps chromium

# Запуск тестов
pnpm test:e2e
```

## Полезные команды

```bash
# Все проверки backend
make backend-test

# Все проверки frontend
make frontend-test

# Отчёты
# Backend: build/reports/tests/test/index.html
# Frontend: test-results/
```

## Рекомендации

- Пишите тесты для новой функциональности
- Поддерживайте покрытие выше 70%
- Используйте Testcontainers для интеграционных тестов
- Следуйте паттернам существующих тестов
