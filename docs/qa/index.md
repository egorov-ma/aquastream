---
title: QA & Testing Overview
summary: Стратегия тестирования, процессы QA и документация для AquaStream
tags: [qa, testing, quality-assurance]
---

# QA & Testing

## Обзор

Документация по обеспечению качества и тестированию проекта AquaStream.

**Цели QA:**
- Качество кода и функциональности
- Предотвращение дефектов
- Автоматизация для быстрой обратной связи
- Continuous improvement

## Документация

- **[Test Strategy](test-strategy.md)** - стратегия, уровни, инструменты, метрики
- **[Testing](testing.md)** - планы тестирования (backend, frontend, E2E, automation, manual)
- **[Bug Management](bug-management.md)** - процесс управления дефектами
- **[Performance](performance.md)** - нагрузочное тестирование и бенчмарки

## Быстрый старт

### Команды тестирования

```bash
# Backend
./gradlew test                    # Unit-тесты всех сервисов
./gradlew integrationTest         # Integration-тесты с Testcontainers
./gradlew check                   # Все тесты + архитектурные
./gradlew test jacocoTestReport   # Coverage report (Jacoco)

# Frontend
cd frontend
pnpm lint                         # ESLint + Prettier
pnpm typecheck                    # TypeScript проверка
pnpm test:unit                    # Node test runner
pnpm test:e2e                     # Playwright E2E tests
```

Подробнее: [Testing Guide](testing.md)

## Метрики качества

### Целевые KPI

| Метрика | Цель |
|---------|------|
| **Code Coverage** | ≥ 70% |
| **Test Success Rate** | 100% |
| **Bug Density** | < 1 bug/100 LOC |
| **Flaky Test Rate** | < 2% |
| **Time to Fix (Critical)** | < 4 hours |
| **Time to Fix (High)** | < 3 days |

См. [Test Strategy - QA Metrics](test-strategy.md#qa-metrics) для актуальных показателей.

## Процесс QA

| Этап | Действия | Выход |
|------|----------|-------|
| **1. Планирование** | Определение scope, выбор уровней тестирования | Test Plan |
| **2. Разработка тестов** | Написание автотестов и тест-кейсов | Automated tests + manual test cases |
| **3. Выполнение** | Запуск в локальном окружении и CI/CD | Test results |
| **4. Отчетность** | Анализ результатов, создание bug reports | Test summary, bug reports |
| **5. Анализ** | Выявление проблем, root cause analysis | Issues identified |
| **6. Улучшение** | Оптимизация тестов, увеличение coverage | Improved test suite |

См. [Test Strategy - QA Process](test-strategy.md#qa-process) для деталей.

## Release Criteria

| Категория | Требование |
|-----------|------------|
| **Tests** | ✅ Все unit tests passed |
| **Tests** | ✅ Все integration tests passed |
| **Tests** | ✅ E2E smoke tests passed |
| **Coverage** | ✅ Code coverage ≥ 70% |
| **Security** | ✅ No HIGH/CRITICAL vulnerabilities |
| **Performance** | ✅ Performance tests passed |
| **Bugs** | ✅ All critical bugs resolved |

### Hotfix Criteria

- ✅ Unit tests для исправления passed
- ✅ Integration tests для затронутых компонентов passed
- ✅ Smoke tests passed
- ✅ No regressions in affected area

## CI/CD Integration

### GitHub Actions Workflows

| Workflow | Триггер | Проверки |
|----------|---------|----------|
| **Backend CI** | Каждый commit | Unit tests, Integration tests, ArchUnit, Jacoco coverage |
| **Frontend CI** | Каждый commit | Lint, Type check, Unit tests, E2E tests, Build |
| **Security CI** | Каждый PR | OWASP Dependency Check, Trivy scan, SBOM generation |

Подробнее: [CI/CD Pipeline](../operations/ci-cd.md)

## См. также

- [Test Strategy](test-strategy.md) - полная стратегия тестирования
- [Testing](testing.md) - планы и команды
- [Bug Management](bug-management.md) - процесс управления дефектами
- [Performance](performance.md) - нагрузочное тестирование
- [Architecture](../architecture.md) - архитектурный контекст
- [Backend Docs](../backend/README.md) - backend сервисы
- [Operations](../operations/README.md) - deployment и monitoring