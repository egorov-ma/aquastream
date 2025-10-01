# QA & Testing

---
title: QA & Testing Overview
summary: Comprehensive QA strategy, processes, and testing documentation for AquaStream
tags: [qa, testing, quality-assurance, strategy]
---

## Обзор

Документация по обеспечению качества (Quality Assurance) и тестированию проекта AquaStream. Этот раздел описывает стратегию тестирования, процессы QA, инструменты и best practices для поддержания высокого качества продукта.

**Цели QA в проекте:**
- Обеспечение качества кода и функциональности
- Предотвращение дефектов через раннее тестирование
- Автоматизация тестирования для быстрой обратной связи
- Continuous quality improvement

## Структура документации

### 📋 Стратегия и процессы

- **[Test Strategy](test-strategy.md)** - общая стратегия тестирования
  - Уровни тестирования (Unit, Integration, E2E, Performance, Security)
  - Типы тестирования (функциональное, нефункциональное)
  - Инструменты и фреймворки
  - Метрики качества и KPI
  - Процесс тестирования (планирование → разработка → выполнение → отчетность)

- **[Bug Management](bug-management.md)** - управление дефектами
  - Процесс обнаружения и создания bug reports
  - Триаж и приоритизация (Severity, Priority)
  - Lifecycle дефектов (обнаружение → исправление → валидация → закрытие)
  - Специальные случаи (Critical bugs, Security vulnerabilities)
  - Метрики и KPI

### 🧪 Тест-планы

Тест-планы для различных компонентов системы:

- **[Backend Testing](test-plans/backend-testing.md)** - план тестирования backend
  - Unit tests (JUnit 5, Mockito)
  - Integration tests (Testcontainers)
  - Architecture tests (ArchUnit)

- **[Frontend Testing](test-plans/frontend-testing.md)** - план тестирования frontend
  - Unit tests (Vitest)
  - Component tests (Testing Library)
  - E2E tests (Playwright)

- **[Integration Testing](test-plans/integration-testing.md)** - интеграционное тестирование
  - Backend ↔ Database
  - Service ↔ Service
  - Frontend ↔ Backend

- **[E2E Testing](test-plans/e2e-testing.md)** - end-to-end тестирование
  - Критичные user journeys
  - Smoke tests
  - Regression suite

### 🤖 Автоматизация

Документация по автоматизированному тестированию:

- **[Unit Tests](automation/unit-tests.md)** - юнит-тесты
  - Backend (Java/Kotlin + JUnit)
  - Frontend (TypeScript + Vitest)
  - Best practices

- **[API Tests](automation/api-tests.md)** - API тесты
  - REST API testing (Spring Boot Test, MockMvc)
  - Testcontainers для изоляции
  - Contract testing

- **[UI Tests](automation/ui-tests.md)** - UI тесты
  - Playwright для E2E
  - Селекторы и best practices
  - CI/CD integration

### ✋ Ручное тестирование

Документация для manual testing:

- **[Test Cases](manual-testing/test-cases.md)** - тест-кейсы
  - Структура тест-кейсов
  - Критичные сценарии
  - Отчетность

- **[Regression Suite](manual-testing/regression-suite.md)** - регрессионное тестирование
  - Чек-листы для релизов
  - Критичные пути
  - Частота запуска

- **[Exploratory Testing](manual-testing/exploratory-testing.md)** - исследовательское тестирование
  - Session-based testing
  - Техники исследования
  - Документирование находок

### ⚡ Производительность

Performance testing documentation:

- **[Load Testing](performance/load-testing.md)** - нагрузочное тестирование
  - Типы тестов (Smoke, Load, Stress, Spike, Soak)
  - K6 scenarios
  - Метрики и критерии успеха

- **[Performance Benchmarks](performance/performance-benchmarks.md)** - базовые показатели
  - Backend performance (API latency, throughput)
  - Frontend performance (Lighthouse scores, Core Web Vitals)
  - Database performance
  - Regression testing

## Быстрый старт

### Backend тесты

```bash
# Unit-тесты
./gradlew test

# Integration-тесты
./gradlew integrationTest

# Все тесты
./gradlew check

# С coverage report
./gradlew test jacocoTestReport
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

### Performance тесты

```bash
# K6 smoke test
k6 run k6-smoke.js

# K6 load test
k6 run k6-load.js
```

## Метрики качества

### Целевые KPI

| Метрика | Цель | Описание |
|---------|------|----------|
| **Code Coverage** | ≥ 70% | Line coverage для unit tests |
| **Test Success Rate** | 100% | Процент прошедших тестов |
| **Bug Density** | < 1 bug/100 LOC | Плотность дефектов |
| **Flaky Test Rate** | < 2% | Процент нестабильных тестов |
| **Time to Fix (Critical)** | < 4 hours | Время исправления критичных багов |
| **Time to Fix (High)** | < 3 days | Время исправления багов высокого приоритета |

### Текущие показатели

См. [Test Strategy](test-strategy.md#метрики-качества) для актуальных метрик.

## Процесс QA

```mermaid
graph LR
    A[Планирование] --> B[Разработка тестов]
    B --> C[Выполнение]
    C --> D[Отчетность]
    D --> E[Анализ]
    E --> F[Улучшение]
    F --> A
```

**Этапы процесса:**

1. **Планирование** - определение scope, выбор уровней тестирования
2. **Разработка тестов** - написание автотестов и тест-кейсов
3. **Выполнение** - запуск в локальном окружении и CI/CD
4. **Отчетность** - анализ результатов, создание bug reports
5. **Анализ** - выявление проблем, root cause analysis
6. **Улучшение** - оптимизация тестов, увеличение coverage

См. [Test Strategy - Процесс тестирования](test-strategy.md#процесс-тестирования) для деталей.

## Инструменты и технологии

### Backend Testing

| Инструмент | Назначение | Версия |
|------------|-----------|--------|
| **JUnit 5** | Unit testing | 5.10+ |
| **Mockito** | Mocking | 5.x |
| **AssertJ** | Fluent assertions | 3.x |
| **Spring Boot Test** | Integration testing | 3.x |
| **Testcontainers** | Docker-based integration tests | 1.19+ |
| **RestAssured** | API testing | 5.x |
| **ArchUnit** | Architecture testing | 1.x |
| **Jacoco** | Code coverage | 0.8.x |

### Frontend Testing

| Инструмент | Назначение |
|------------|-----------|
| **Vitest** | Unit testing |
| **Testing Library** | Component testing |
| **Playwright** | E2E testing |
| **ESLint** | Static analysis |
| **TypeScript** | Type checking |

### Infrastructure & Performance

| Инструмент | Назначение |
|------------|-----------|
| **K6** | Load testing |
| **OWASP Dependency Check** | Dependency vulnerabilities |
| **Trivy** | Docker image scanning |
| **Syft** | SBOM generation |
| **Lighthouse** | Frontend performance |

## Критерии выхода

### Для релизов (Release Criteria)

**Обязательные требования:**
- ✅ Все unit tests passed
- ✅ Все integration tests passed
- ✅ E2E smoke tests passed
- ✅ Code coverage ≥ 70%
- ✅ No HIGH/CRITICAL security vulnerabilities
- ✅ Performance tests passed (latency, throughput)
- ✅ All critical bugs resolved
- ✅ Regression suite passed

**Желательные требования:**
- ✅ Exploratory testing выполнено
- ✅ Documentation updated
- ✅ Known issues documented

### Для hotfix

**Обязательные требования:**
- ✅ Unit tests для исправления passed
- ✅ Integration tests для затронутых компонентов passed
- ✅ Smoke tests passed
- ✅ No regressions in affected area

**Допустимые исключения:**
- ⚠️ Пропустить full regression (выполнить после hotfix)

См. [Test Strategy - Критерии выхода](test-strategy.md#критерии-выхода) для полного списка.

## CI/CD Integration

### GitHub Actions Workflows

**Backend CI:**
```yaml
- Unit tests: ./gradlew test
- Integration tests: ./gradlew integrationTest
- Architecture tests: ArchUnit validation
- Coverage report: Jacoco
```

**Frontend CI:**
```yaml
- Lint: pnpm lint
- Type check: pnpm typecheck
- Unit tests: pnpm test:unit
- E2E tests: pnpm test:e2e
- Build: pnpm build
```

**Security CI:**
```yaml
- OWASP Dependency Check
- Trivy image scanning
- SBOM generation (Syft)
```

См. [CI/CD Pipeline](../operations/ci-cd.md) для деталей workflows.

## Best Practices

### Написание тестов

**Unit Tests:**
- Один тест - одна проверка (single assertion principle)
- Arrange-Act-Assert паттерн
- Понятные имена: `shouldCreateBookingWhenEventIsAvailable()`
- Моки для внешних зависимостей

**Integration Tests:**
- Используй Testcontainers для реальной БД
- Изоляция: каждый тест в отдельной транзакции
- Проверяй все HTTP статус-коды
- Тестируй валидацию входных данных

**E2E Tests:**
- Селекторы по ролям (Playwright `getByRole`)
- Явные ожидания (`waitForLoadState`, `toBeVisible`)
- Избегай хрупких селекторов (классы, id)
- Retry logic для нестабильных тестов

### Управление багами

**Создание bug report:**
- Четкое описание: Title, Description, Steps to reproduce
- Приложить логи, скриншоты
- Указать Environment (dev/stage/prod)
- Определить Severity и Priority

**Приоритизация:**
- **Critical**: Production down, security breach → hotfix немедленно
- **High**: Серьезная проблема, сложный workaround → текущий спринт
- **Medium**: Проблема с workaround → ближайшие спринты
- **Low**: Косметика, минимальное влияние → backlog

См. [Bug Management](bug-management.md) для полного процесса.

## Troubleshooting

### Тесты не запускаются

```bash
# Backend: проверить Gradle wrapper
./gradlew wrapper --gradle-version 8.5

# Frontend: очистить node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Testcontainers: проверить Docker
docker ps
docker system prune -a --volumes
```

### Нестабильные тесты (Flaky)

**Причины:**
- Race conditions (async операции)
- Жесткие задержки (`sleep`)
- Зависимость от внешних сервисов
- Недетерминированные данные

**Решения:**
- Явные ожидания вместо sleep
- Testcontainers для изоляции
- Retry logic в CI
- Фиксированные seed для random data

### Низкое покрытие тестами

```bash
# Проверить текущее coverage
./gradlew test jacocoTestReport

# Открыть HTML report
open build/reports/jacoco/test/html/index.html

# Найти непокрытый код
# Добавить unit tests для Service layer
```

## Дальнейшее развитие QA

### Краткосрочные цели (3 месяца)

- [ ] Достичь 70% code coverage для backend
- [ ] Настроить E2E tests в CI/CD
- [ ] Внедрить performance regression testing (K6)
- [ ] Создать базовые тест-планы для всех features
- [ ] Настроить автоматические bug reports из production monitoring

### Среднесрочные цели (6 месяцев)

- [ ] Contract testing между сервисами (Spring Cloud Contract)
- [ ] Visual regression testing (Percy/Chromatic)
- [ ] Chaos engineering (Netflix Chaos Monkey)
- [ ] Security testing automation (ZAP Proxy)
- [ ] Test environment management (dedicated staging)

### Долгосрочные цели (12 месяцев)

- [ ] 90% test automation coverage
- [ ] Production monitoring → automated test generation
- [ ] AI-powered test case generation
- [ ] Self-healing tests
- [ ] Continuous performance optimization

## См. также

### Внутренние ссылки

- [Architecture Overview](../architecture.md) - архитектура системы
- [Backend Documentation](../backend/) - детали backend сервисов
- [Frontend Documentation](../frontend/) - frontend архитектура
- [Operations Guide](../operations/) - deployment, CI/CD, infrastructure
- [Development Guide](../development/) - setup, workflows

### Внешние ресурсы

- [Testing Best Practices](https://martinfowler.com/testing/) - Martin Fowler
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) - Practical Guide
- [Playwright Documentation](https://playwright.dev/) - E2E testing
- [Testcontainers](https://www.testcontainers.org/) - Integration testing
- [K6 Documentation](https://k6.io/docs/) - Performance testing