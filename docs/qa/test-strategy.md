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

### Unit Tests

**Охват**: Service layer, Repository layer (моки), Utility classes, Domain entities, Mappers

**Инструменты**: JUnit 5, Mockito, AssertJ (backend); Vitest, Testing Library (frontend)

**Критерии**: Coverage ≥70%, время <5 мин, изоляция

**Запуск**: `./gradlew test` (backend), `pnpm test:unit` (frontend)

### Integration Tests

**Охват**: REST API endpoints, Database (Testcontainers), Redis, MinIO, Liquibase migrations

**Инструменты**: Spring Boot Test, Testcontainers, RestAssured

**Критерии**: Все критичные endpoints, время <15 мин, изоляция транзакций

**Запуск**: `./gradlew integrationTest`

### Contract Tests

**Охват**: OpenAPI спецификации, межсервисное взаимодействие

**Инструменты**: Spring Cloud Contract (планируется), OpenAPI Validator

### E2E Tests

**Охват**: Критичные user journeys, полный стек UI → Gateway → Services → DB

**Инструменты**: Playwright (frontend), RestAssured + Testcontainers (backend)

**Критерии**: Критичные сценарии покрыты, время <30 мин, flaky rate <2%

**Запуск**: `pnpm test:e2e`

### Architecture Tests

**Охват**: Layered architecture, package dependencies, naming conventions

**Инструменты**: ArchUnit

**Критерии**: 100% compliance, запуск при каждом commit

### Performance Tests

**Охват**: Latency (p50/p95/p99), throughput, resource usage

**Инструменты**: K6, JMeter (опционально)

**Критерии**: Gateway p95 <200ms, Service p95 <100ms, throughput ≥100 rps

**Типы**: Smoke (1-5 VUs), Load (10-50 VUs), Stress (до 100 VUs), Soak (1 час+)

### Security Tests

**Охват**: Dependency vulnerabilities, image scanning, SQL injection, auth, rate limiting

**Инструменты**: OWASP Dependency Check, Trivy, ZAP Proxy (планируется)

**Критерии**: No HIGH/CRITICAL vulnerabilities

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

## Метрики качества {#qa-metrics}

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

## Процесс тестирования {#qa-process}

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

## Критерии выхода {#qa-exit-criteria}

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
