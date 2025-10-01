# Тестовая стратегия

---
title: Test Strategy
summary: Общая стратегия тестирования проекта AquaStream
tags: [qa, testing, strategy, quality-assurance]
---

## Обзор

Тестовая стратегия определяет подходы, уровни, инструменты и процессы тестирования для проекта AquaStream.

## Цели тестирования

1. **Качество**: обеспечение высокого качества кода и функциональности
2. **Надежность**: проверка стабильности системы при различных нагрузках
3. **Безопасность**: выявление уязвимостей и проблем безопасности
4. **Производительность**: контроль performance метрик
5. **Совместимость**: проверка работы в различных окружениях

## Уровни тестирования

### 1. Unit Tests (Юнит-тесты)

**Цель**: тестирование изолированных компонентов

**Охват**:
- Service layer: бизнес-логика
- Repository layer: работа с БД (моки)
- Utility classes: вспомогательные классы
- Domain entities: валидация, поведение
- Mappers/Converters: трансформация данных

**Инструменты**:
- Backend: JUnit 5, Mockito, AssertJ
- Frontend: Vitest, Testing Library

**Критерии**:
- Code Coverage ≥ 70%
- Время выполнения < 5 минут
- Изоляция: без внешних зависимостей

**Запуск**:
```bash
# Backend
./gradlew test

# Frontend
pnpm test:unit
```

### 2. Integration Tests (Интеграционные тесты)

**Цель**: проверка взаимодействия компонентов

**Охват**:
- REST API endpoints
- Database operations (реальная БД через Testcontainers)
- Redis cache operations
- MinIO storage operations
- Liquibase migrations

**Инструменты**:
- Spring Boot Test
- Testcontainers (PostgreSQL, Redis, MinIO)
- RestAssured для API тестирования

**Критерии**:
- Все критичные API endpoints покрыты
- Время выполнения < 15 минут
- Изоляция: каждый тест в отдельной транзакции

**Запуск**:
```bash
./gradlew integrationTest
```

### 3. Contract Tests (Контрактное тестирование)

**Цель**: проверка контрактов между сервисами

**Охват**:
- OpenAPI спецификации
- Межсервисное взаимодействие
- API Gateway routing

**Инструменты**:
- Spring Cloud Contract (планируется)
- OpenAPI Validator

**Критерии**:
- Все публичные API покрыты контрактами
- Контракты версионируются вместе с кодом

### 4. E2E Tests (End-to-End тесты)

**Цель**: проверка пользовательских сценариев

**Охват**:
- Критичные user journeys
- Взаимодействие frontend ↔ backend
- Полный стек: UI → Gateway → Services → Database

**Инструменты**:
- Frontend: Playwright
- Backend API: RestAssured + Testcontainers

**Критерии**:
- Покрыты все критичные сценарии (регистрация, бронирование, оплата)
- Время выполнения < 30 минут
- Стабильность: flaky rate < 2%

**Запуск**:
```bash
# Frontend E2E
pnpm test:e2e

# Backend API E2E (через integration tests)
./gradlew integrationTest
```

### 5. Architecture Tests (Архитектурные тесты)

**Цель**: проверка соблюдения архитектурных правил

**Охват**:
- Layered architecture (api → service → repository)
- Package dependencies
- Naming conventions
- Security constraints

**Инструменты**:
- ArchUnit

**Критерии**:
- Все правила проходят на 100%
- Запуск при каждом commit

**Пример правил**:
```java
// Service classes должны быть в пакете .service
classes().that().haveSimpleNameEndingWith("Service")
    .should().resideInAPackage("..service..")

// Repository должен использоваться только из Service
noClasses().that().resideInAPackage("..api..")
    .should().dependOnClassesThat().resideInAPackage("..repository..")
```

### 6. Performance Tests (Нагрузочное тестирование)

**Цель**: проверка производительности под нагрузкой

**Охват**:
- Latency: p50, p95, p99
- Throughput: requests/sec
- Resource usage: CPU, memory
- Database query performance

**Инструменты**:
- K6 для HTTP load testing
- JMeter (опционально)

**Критерии**:
- Gateway p95 latency < 200ms
- Service p95 latency < 100ms
- Throughput: минимум 100 rps на сервис
- No errors при load testing

**Типы тестов**:
- **Smoke test**: минимальная нагрузка (1-5 VUs)
- **Load test**: нормальная нагрузка (10-50 VUs)
- **Stress test**: повышенная нагрузка (до 100 VUs)
- **Soak test**: длительная нагрузка (1 час+)

### 7. Security Tests (Тесты безопасности)

**Цель**: выявление уязвимостей

**Охват**:
- Dependency vulnerabilities (OWASP)
- Docker image scanning (Trivy)
- SQL injection, XSS
- Authentication & Authorization
- Rate limiting

**Инструменты**:
- OWASP Dependency Check
- Trivy (Docker images)
- ZAP Proxy (планируется)

**Критерии**:
- No HIGH/CRITICAL vulnerabilities в dependencies
- No HIGH/CRITICAL в Docker images
- JWT validation покрыт тестами

## Типы тестирования

### Функциональное тестирование

**Охват**:
- CRUD операции для всех entities
- Бизнес-логика (создание событий, бронирование, оплата)
- Валидация данных (input validation)
- Обработка ошибок (exceptions, error responses)

**User journeys** (E2E):
1. Регистрация → Вход → Просмотр событий → Бронирование → Оплата
2. Создание события (admin) → Публикация → Назначение команды
3. Отмена бронирования → Возврат средств

### Нефункциональное тестирование

**Производительность**:
- Load testing: K6
- Database query optimization: EXPLAIN ANALYZE
- Caching effectiveness: Redis hit rate

**Безопасность**:
- Vulnerability scanning: OWASP, Trivy
- Penetration testing: ручное (quarterly)

**Отказоустойчивость**:
- Service degradation: Circuit Breaker (Resilience4j)
- Database failover: PostgreSQL replication
- Redis persistence: AOF

**Масштабируемость**:
- Horizontal scaling: Docker Compose scale
- Database connection pooling: HikariCP
- Resource limits: memory, CPU constraints

## Автоматизация

### CI/CD Integration

**GitHub Actions workflows**:
- Backend CI: `./gradlew clean build` (unit + integration tests)
- Frontend CI: `pnpm lint && pnpm typecheck && pnpm test:e2e`
- Docker CI: build + Trivy scan + SBOM generation
- CodeQL: security analysis

**Запуск тестов**:
- Unit tests: при каждом commit
- Integration tests: при каждом PR
- E2E tests: при каждом PR
- Performance tests: по расписанию (еженедельно)
- Security scan: при каждом PR (информативный режим)

**Артефакты**:
- JUnit XML reports
- Jacoco coverage reports
- Trivy SARIF reports
- SBOM (SPDX JSON)

### Test Data Management

**Подготовка**:
- SQL-скрипты для тестовых данных: `backend-*/src/test/resources/data.sql`
- Testcontainers: изолированная БД для каждого теста
- Фикстуры: повторяемые объекты через builders

**Очистка**:
- `@Transactional` + `@Rollback` для unit tests
- `@DirtiesContext` для integration tests (при необходимости)
- Testcontainers: автоматическое удаление контейнеров

**Пример**:
```java
@BeforeEach
void setUp() {
    // Подготовка тестовых данных
    User user = UserBuilder.aUser()
        .withEmail("test@example.com")
        .withRole(Role.USER)
        .build();
    userRepository.save(user);
}
```

## Метрики качества

### Целевые KPI

| Метрика | Цель | Текущее значение |
|---------|------|------------------|
| Code Coverage | ≥ 70% | TBD |
| Test Success Rate | 100% | TBD |
| Bug Density | < 1 bug/100 LOC | TBD |
| Flaky Test Rate | < 2% | TBD |
| Build Time | < 10 мин | TBD |
| Deployment Frequency | ≥ 1/week | TBD |

### Отслеживание метрик

**Code Coverage**:
- Инструмент: Jacoco
- Отчет: `build/reports/jacoco/test/html/index.html`
- CI: загрузка coverage report в GitHub Artifacts

**Test Success Rate**:
- GitHub Actions: badge в README
- История: GitHub Actions dashboard

**Flaky Tests**:
- Мониторинг через повторные запуски
- Отчет: ручной анализ failed builds

## Процесс тестирования

### 1. Планирование

**Вход**: новый feature, bug fix, refactoring

**Действия**:
- Определение scope тестирования
- Выбор уровней тестирования
- Оценка трудозатрат

**Выход**: Test Plan (по шаблону `qa-test-plan.md`)

### 2. Разработка тестов

**Вход**: Test Plan

**Действия**:
- Написание unit tests (TDD рекомендуется)
- Написание integration tests
- Написание E2E tests (если применимо)
- Code review тестов

**Выход**: Automated tests + manual test cases

### 3. Выполнение

**Вход**: Automated tests

**Действия**:
- Запуск в локальном окружении
- Запуск в CI/CD
- Ручное тестирование (при необходимости)

**Выход**: Test results, bug reports

### 4. Отчетность

**Вход**: Test results

**Действия**:
- Анализ failures
- Создание bug reports (GitHub Issues)
- Обновление Test Strategy

**Выход**: Test summary, bug reports

### 5. Улучшение

**Вход**: Test summary, bugs

**Действия**:
- Анализ flaky tests
- Оптимизация медленных тестов
- Увеличение coverage
- Обновление тестов под изменения

**Выход**: Improved test suite

## Инструменты

### Backend

| Инструмент | Назначение | Версия |
|------------|-----------|--------|
| JUnit 5 | Unit testing | 5.10+ |
| Mockito | Mocking | 5.x |
| AssertJ | Fluent assertions | 3.x |
| Spring Boot Test | Integration testing | 3.x |
| Testcontainers | Docker-based integration tests | 1.19+ |
| RestAssured | API testing | 5.x |
| ArchUnit | Architecture testing | 1.x |
| Jacoco | Code coverage | 0.8.x |

### Frontend

| Инструмент | Назначение |
|------------|-----------|
| Vitest | Unit testing |
| Testing Library | Component testing |
| Playwright | E2E testing |
| ESLint | Static analysis |
| TypeScript | Type checking |

### Infrastructure

| Инструмент | Назначение |
|------------|-----------|
| K6 | Load testing |
| OWASP Dependency Check | Dependency vulnerabilities |
| Trivy | Docker image scanning |
| Syft | SBOM generation |

## Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Нестабильные тесты (flaky) | Средняя | Высокое | Изоляция через Testcontainers, retry logic |
| Медленные тесты | Средняя | Среднее | Параллелизация, моки для unit tests |
| Устаревшие тесты | Низкая | Высокое | Code review, документация, regression suite |
| Низкое покрытие | Средняя | Высокое | Обязательные тесты для новых features, CI fail при снижении coverage |
| Пропущенные баги | Средняя | Высокое | Exploratory testing, peer review, production monitoring |

## График тестирования

### Регулярные активности

**Ежедневно**:
- Unit tests: при каждом commit
- Integration tests: при каждом PR

**Еженедельно**:
- Full regression suite
- Performance tests (K6 load testing)
- Security scan review

**Ежемесячно**:
- Exploratory testing
- Test strategy review
- Test data cleanup

**Квартально**:
- Penetration testing
- Disaster recovery testing
- Architecture review

## Критерии выхода

### Для релизов

**Обязательно**:
- ✅ Все unit tests passed
- ✅ Все integration tests passed
- ✅ E2E smoke tests passed
- ✅ Code coverage ≥ 70%
- ✅ No HIGH/CRITICAL security vulnerabilities
- ✅ Performance tests passed (latency, throughput)

**Желательно**:
- ✅ Exploratory testing выполнено
- ✅ Regression suite passed
- ✅ Documentation updated

### Для hotfix

**Обязательно**:
- ✅ Unit tests для исправления passed
- ✅ Integration tests для затронутых компонентов passed
- ✅ Smoke tests passed

**Допустимо**:
- ⚠️ Пропустить full regression (выполнить после hotfix)

## См. также

- [Backend Testing Plan](test-plans/backend-testing.md)
- [Frontend Testing Plan](test-plans/frontend-testing.md)
- [Bug Management](bug-management.md)
- [CI/CD Pipeline](../operations/ci-cd.md)
- [Architecture](../architecture.md)