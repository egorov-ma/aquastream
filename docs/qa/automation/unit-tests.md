# Unit Tests

---
title: Unit Tests
summary: Unit-тесты для backend и frontend компонентов
tags: [qa, testing, unit-tests, junit, vitest]
---

## Обзор

Unit-тесты проверяют отдельные компоненты системы в изоляции.

## Backend Unit-тесты

### Структура

```
src/test/java/
  ├── architecture/      # ArchUnit тесты
  ├── service/          # Тесты сервисного слоя
  ├── repository/       # Тесты репозиториев
  └── util/             # Тесты утилит
```

### Запуск

```bash
# Все unit-тесты
./gradlew test

# Конкретный модуль
./gradlew :backend-user:backend-user-service:test
```

### Требования

- Покрытие кода не менее 70%
- Изоляция от внешних зависимостей (моки)
- Быстрое выполнение (<1 сек на тест)

## Frontend Unit-тесты

### Запуск

```bash
pnpm test:unit
```

### Покрытие

- Утилиты (100%)
- Компоненты (минимум 80%)
- Хуки (минимум 80%)

## Best Practices

- Один тест - одна проверка
- Понятные имена тестов
- Arrange-Act-Assert паттерн
- Избегайте дублирования кода в тестах
