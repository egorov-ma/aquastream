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

| Категория | Команда | Описание |
|-----------|---------|----------|
| **Backend Unit** | `./gradlew test` | Unit-тесты всех сервисов |
| **Backend Integration** | `./gradlew integrationTest` | Integration-тесты с Testcontainers |
| **Backend All** | `./gradlew check` | Все тесты + архитектурные |
| **Backend Coverage** | `./gradlew test jacocoTestReport` | Coverage report (Jacoco) |
| **Frontend Lint** | `pnpm lint` | ESLint + Prettier |
| **Frontend Types** | `pnpm typecheck` | TypeScript проверка |
| **Frontend Unit** | `pnpm test:unit` | Node test runner |
| **Frontend E2E** | `pnpm test:e2e` | Playwright E2E tests |
| **Performance Smoke** | `k6 run k6-smoke.js` | K6 smoke test |
| **Performance Load** | `k6 run k6-load.js` | K6 load test |

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

### Release Criteria

| Категория | Требование | Критичность |
|-----------|------------|-------------|
| **Tests** | ✅ Все unit tests passed | Обязательно |
| **Tests** | ✅ Все integration tests passed | Обязательно |
| **Tests** | ✅ E2E smoke tests passed | Обязательно |
| **Tests** | ✅ Regression suite passed | Обязательно |
| **Coverage** | ✅ Code coverage ≥ 70% | Обязательно |
| **Security** | ✅ No HIGH/CRITICAL vulnerabilities | Обязательно |
| **Performance** | ✅ Performance tests passed (latency, throughput) | Обязательно |
| **Bugs** | ✅ All critical bugs resolved | Обязательно |
| **Exploratory** | ✅ Exploratory testing выполнено | Желательно |
| **Docs** | ✅ Documentation updated | Желательно |

### Hotfix Criteria

- ✅ Unit tests для исправления passed
- ✅ Integration tests для затронутых компонентов passed
- ✅ Smoke tests passed
- ✅ No regressions in affected area
- ⚠️ Full regression можно пропустить (выполнить после hotfix)

## CI/CD Integration

### GitHub Actions Workflows

| Workflow | Триггер | Проверки |
|----------|---------|----------|
| **Backend CI** | Каждый commit | Unit tests, Integration tests, ArchUnit, Jacoco coverage |
| **Frontend CI** | Каждый commit | Lint, Type check, Unit tests, E2E tests, Build |
| **Security CI** | Каждый PR | OWASP Dependency Check, Trivy scan, SBOM generation |

### График запуска тестов

| Тесты | Триггер |
|-------|---------|
| Unit tests | При каждом commit |
| Integration tests | При каждом PR |
| E2E tests | При каждом PR |
| Smoke tests | При каждом PR |
| Regression suite | При merge в main |
| Full E2E | Перед релизом |
| Performance tests | Еженедельно |
| Security scan | При каждом PR |

## Best Practices

### Написание тестов

| Тип теста | Best Practices |
|-----------|----------------|
| **Unit Tests** | ✅ Один тест - одна проверка<br>✅ Arrange-Act-Assert паттерн<br>✅ Понятные имена: `shouldCreateBookingWhenEventIsAvailable()`<br>✅ Моки для внешних зависимостей |
| **Integration Tests** | ✅ Testcontainers для реальной БД<br>✅ Изоляция: каждый тест в отдельной транзакции<br>✅ Проверка всех HTTP статус-кодов<br>✅ Тестирование валидации входных данных |
| **E2E Tests** | ✅ Селекторы по ролям (`getByRole`)<br>✅ Явные ожидания (`waitForLoadState`, `toBeVisible`)<br>✅ Избегать хрупких селекторов (классы, id)<br>✅ Retry logic для нестабильных тестов |

### Управление багами

| Аспект | Best Practice |
|--------|---------------|
| **Bug Report** | ✅ Четкое описание: Title, Description, Steps to reproduce<br>✅ Приложить логи, скриншоты<br>✅ Указать Environment (dev/stage/prod)<br>✅ Определить Severity и Priority |
| **Приоритизация** | **Critical**: Production down, security breach → hotfix немедленно<br>**High**: Серьезная проблема, сложный workaround → текущий спринт<br>**Medium**: Проблема с workaround → ближайшие спринты<br>**Low**: Косметика, минимальное влияние → backlog |

См. [Bug Management](bug-management.md) для полного процесса.

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| **Тесты не запускаются (Backend)** | 1. `./gradlew wrapper --gradle-version 8.5`<br>2. Проверить Docker: `docker ps`<br>3. Очистить: `./gradlew clean` |
| **Тесты не запускаются (Frontend)** | 1. `rm -rf node_modules pnpm-lock.yaml`<br>2. `pnpm install`<br>3. Playwright: `pnpm exec playwright install --with-deps chromium` |
| **Testcontainers не работают** | 1. `docker ps` (Docker должен быть запущен)<br>2. `docker system prune -a --volumes`<br>3. Проверить Docker Desktop настройки |
| **Нестабильные тесты (Flaky)** | **Причины**: Race conditions, жесткие задержки, зависимость от внешних сервисов<br>**Решения**: Явные ожидания вместо sleep, Testcontainers для изоляции, retry logic в CI, фиксированные seed |
| **Низкое покрытие тестами** | 1. `./gradlew test jacocoTestReport`<br>2. `open build/reports/jacoco/test/html/index.html`<br>3. Добавить unit tests для Service layer |

## Дальнейшее развитие QA

| Период | Цели |
|--------|------|
| **Краткосрочные (3 месяца)** | ✅ 70% code coverage для backend<br>✅ E2E tests в CI/CD<br>✅ Performance regression testing (K6)<br>✅ Базовые тест-планы для всех features |
| **Среднесрочные (6 месяцев)** | ✅ Contract testing (Spring Cloud Contract)<br>✅ Visual regression testing (Percy/Chromatic)<br>✅ Chaos engineering (Chaos Monkey)<br>✅ Security testing automation (ZAP Proxy) |
| **Долгосрочные (12 месяцев)** | ✅ 90% test automation coverage<br>✅ Production monitoring → automated test generation<br>✅ AI-powered test case generation<br>✅ Self-healing tests |

---

См. [Test Strategy](test-strategy.md), [Testing](testing.md), [Bug Management](bug-management.md), [Performance](performance.md), [Architecture](../architecture.md), [Backend Docs](../backend/README.md), [Operations](../operations/README.md).