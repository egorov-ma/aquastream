# QA & Testing

---
title: QA Overview
summary: Обзор процессов тестирования, стратегий QA и инструментов обеспечения качества в AquaStream.
---

## Стратегия тестирования

AquaStream использует многоуровневую стратегию тестирования для обеспечения высокого качества продукта:

1. **Unit Tests** - тестирование отдельных компонентов
2. **Integration Tests** - тестирование взаимодействия сервисов
3. **API Tests** - тестирование REST API endpoints
4. **E2E Tests** - сквозное тестирование пользовательских сценариев
5. **Performance Tests** - нагрузочное тестирование
6. **Security Tests** - тестирование безопасности

## Структура тестирования

### [Test Plans](test-plans/)
- [Backend Testing](test-plans/backend-testing.md) - тестирование микросервисов
- [Frontend Testing](test-plans/frontend-testing.md) - тестирование UI/UX
- [Integration Testing](test-plans/integration-testing.md) - тестирование взаимодействий
- [E2E Testing](test-plans/e2e-testing.md) - сквозное тестирование

### [Automation](automation/)
- [Unit Tests](automation/unit-tests.md) - автоматические unit тесты
- [API Tests](automation/api-tests.md) - автотесты API
- [UI Tests](automation/ui-tests.md) - автотесты интерфейса

### [Manual Testing](manual-testing/)
- [Test Cases](manual-testing/test-cases.md) - ручные тест-кейсы
- [Regression Suite](manual-testing/regression-suite.md) - регрессионное тестирование
- [Exploratory Testing](manual-testing/exploratory-testing.md) - исследовательское тестирование

### [Performance](performance/)
- [Load Testing](performance/load-testing.md) - нагрузочное тестирование
- [Performance Benchmarks](performance/performance-benchmarks.md) - бенчмарки производительности

## Инструменты

**Backend Testing:**
- JUnit 5 - unit тесты Java
- TestContainers - интеграционные тесты с БД
- Postman/Newman - API тестирование

**Frontend Testing:**
- Jest - unit тесты React
- Testing Library - компонентные тесты
- Cypress - E2E тестирование

**Performance:**
- JMeter - нагрузочное тестирование
- Artillery - API load testing

**CI/CD:**
- GitHub Actions - автозапуск тестов
- SonarQube - анализ качества кода

## Метрики качества

**Цели покрытия:**
- Unit tests: >80%
- Integration tests: >70%
- E2E critical paths: 100%

**Критерии готовности релиза:**
- Все автотесты проходят
- Critical/High severity дефекты исправлены
- Performance тесты в пределах SLA
- Security scan пройден

## Процессы

### Definition of Done
- [ ] Unit тесты написаны и проходят
- [ ] Integration тесты обновлены
- [ ] API тесты покрывают новую функциональность
- [ ] Manual тестирование выполнено
- [ ] Performance impact оценен

### Bug Management
См. [Bug Management](bug-management.md)

## См. также

- [Test Strategy](test-strategy.md) - детальная стратегия тестирования
- [Security Testing](security-testing.md) - тестирование безопасности
- [Development Guide](../development/) - гайды для разработчиков