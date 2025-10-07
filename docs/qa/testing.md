---
title: Testing
summary: Comprehensive testing plans: backend, frontend, integration, E2E, automation, manual
tags: [qa, testing, automation, manual]
---

# Testing

## Обзор

Планы тестирования для всех компонентов системы AquaStream: backend (7 микросервисов), frontend (Next.js), integration, E2E и manual testing.

## Backend Testing

### Микросервисы

| Сервис | Порт | Критичность | Test Coverage Goal |
|--------|------|-------------|-------------------|
| **User** | 8101 | Высокая | ≥75% |
| **Event** | 8102 | Критическая | ≥75% |
| **Crew** | 8103 | Средняя | ≥70% |
| **Payment** | 8104 | Критическая | ≥75% |
| **Notification** | 8105 | Высокая | ≥70% |
| **Media** | 8106 | Средняя | ≥65% |
| **Gateway** | 8080 | Критическая | ≥70% |

### Уровни тестирования

| Уровень | Охват | Инструменты | Запуск | Время |
|---------|-------|-------------|--------|-------|
| **Unit Tests** | Service layer, repositories, utilities, mappers | JUnit 5, Mockito, AssertJ | `./gradlew test` | <5 мин |
| **Integration Tests** | REST API endpoints, БД, Redis, MinIO | Spring Boot Test, Testcontainers, RestAssured | `./gradlew integrationTest` | <15 мин |
| **Architecture Tests** | Layered architecture, naming conventions | ArchUnit | Автоматически с unit tests | <1 мин |
| **Contract Tests** | OpenAPI спецификации, межсервисное взаимодействие | Spring Cloud Contract (планируется) | - | - |

### Тестовые данные

| Аспект | Реализация |
|--------|------------|
| **Подготовка** | SQL-скрипты в `src/test/resources/data.sql`, builders для фикстур |
| **Изоляция** | Testcontainers + PostgreSQL/Redis для каждого теста |
| **Очистка** | `@Transactional` + `@Rollback` (unit), Testcontainers автоудаление (integration) |

### Метрики

| Метрика | Цель | Мониторинг |
|---------|------|------------|
| **Code Coverage** | ≥70% | Jacoco reports в `build/reports/jacoco/` |
| **Test Success Rate** | 100% | GitHub Actions badge |
| **Execution Time** | Unit <5 мин, Integration <15 мин | CI/CD logs |

## Frontend Testing

### Технологический стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Next.js** | 15 (App Router) | Framework |
| **React** | 18 | UI library |
| **Tailwind CSS** | 3.4.18 | Styling |
| **shadcn/ui** | Latest | UI components |
| **Playwright** | Latest | E2E testing |
| **Node test runner** | Built-in | Unit testing |

### Уровни тестирования

| Уровень | Охват | Инструменты | Запуск | Критерий |
|---------|-------|-------------|--------|----------|
| **Unit Tests** | Утилиты, хуки, изолированные компоненты | Node test runner | `pnpm test:unit` | 100% для утилит |
| **Component Tests** | UI компоненты, композитные, layouts | React Testing Library (планируется) | - | - |
| **E2E Tests** | Auth, навигация, формы, критичные пути | Playwright | `pnpm test:e2e` | Smoke-тесты для всех страниц |

### Качественные проверки

| Проверка | Команда | Критерий |
|----------|---------|----------|
| **Линтинг** | `pnpm lint` | 0 errors |
| **Типизация** | `pnpm typecheck` | 0 errors |
| **Сборка** | `pnpm build` | Успешная сборка |

### Браузеры и разрешения

| Аспект | Поддержка |
|--------|-----------|
| **Браузеры** | Chrome, Firefox, Safari, Edge (последние 2 версии) |
| **Разрешения** | 375px (mobile), 768px (tablet), 1024px, 1280px, 1920px (desktop) |

### Метрики

| Метрика | Цель |
|---------|------|
| **E2E Test Success Rate** | 100% |
| **Lighthouse Performance** | ≥90 |
| **Lighthouse Accessibility** | ≥95 |
| **Build Success Rate** | 100% |

## Integration Testing

### Области интеграции

| Интеграция | Инструменты | Сценарии |
|------------|-------------|----------|
| **Backend ↔ Database** | Testcontainers + PostgreSQL | CRUD, транзакционность, миграции |
| **Service ↔ Service** | MockServer, WireMock | REST взаимодействие через Gateway |
| **Backend ↔ Redis** | Testcontainers + Redis | Кэширование, TTL, rate limiting |
| **Frontend ↔ Backend** | Playwright + Mock Backend | REST API, JWT auth, CORS |

### Критичные сценарии

| Сценарий | Путь |
|----------|------|
| **Регистрация пользователя** | Frontend → Gateway → User Service → PostgreSQL → Event queue → Notification Service |
| **Бронирование события** | Frontend → Event Service (блокировка места) → Payment Service → Event Service (подтверждение) → Notification |

### Запуск

```bash
./gradlew integrationTest  # Backend
pnpm test:e2e              # Frontend + Backend
```

### Метрики

- Integration Test Coverage: ≥60%
- Success Rate: 100%
- Execution Time: <20 мин

## E2E Testing

### Критичные сценарии

| ID | Сценарий | Шаги |
|----|----------|------|
| **E2E-01** | Регистрация и онбординг | Регистрация → Email подтверждение → Заполнение профиля → Личный кабинет |
| **E2E-02** | Поиск и просмотр события | Главная → Поиск/фильтры → Выбор события → Детали |
| **E2E-03** | Бронирование билета | Выбор события → Выбор мест → Корзина → Оформление → Оплата (mock) → Билет → Email |
| **E2E-04** | Создание события (организатор) | Вход как организатор → Мои события → Создать → Детали → Изображения → Публикация |
| **E2E-05** | Отмена бронирования | Мои бронирования → Выбор → Запрос отмены → Подтверждение → Возврат средств → Email |

### Типы тестов

| Тип | Время | Файлы | Запуск |
|-----|-------|-------|--------|
| **Smoke Tests** | <5 мин | `*.smoke.spec.ts` | `pnpm test:e2e:smoke` |
| **Regression Tests** | <30 мин | Полный набор | `pnpm test:e2e:regression` |
| **All E2E** | <30 мин | Все тесты | `pnpm test:e2e` |

### Best Practices

| Практика | ✅ Хорошо | ❌ Плохо |
|----------|----------|---------|
| **Селекторы** | `page.getByRole('button', { name: /sign in/i })` | `page.locator('.btn-primary')` |
| **Ожидания** | `await page.waitForLoadState('networkidle')` | `await page.waitForTimeout(5000)` |
| **Проверки** | `await expect(element).toBeVisible()` | Hardcoded delays |

### Метрики

- Test Success Rate: ≥98%
- Flakiness Rate: <2%
- Execution Time: <30 мин

## API Tests

### Структура тестов

```
src/integrationTest/java/
├── api/              # Тесты REST endpoints
├── integration/      # Интеграционные тесты
└── testcontainers/   # Конфигурация Testcontainers
```

### Технологии

- Spring Boot Test, Testcontainers, MockMvc

### Best Practices

- ✅ Testcontainers для реальной БД
- ✅ Проверка всех HTTP статусов (200, 400, 401, 403, 404, 409, 422)
- ✅ Тестирование валидации входных данных
- ✅ Проверка структуры ответов (JSON schema validation)

### Запуск

```bash
./gradlew integrationTest
./gradlew :backend-user:backend-user-api:integrationTest  # Конкретный сервис
```

## Manual Testing

### Структура тест-кейса

| Поле | Описание |
|------|----------|
| **TC-ID** | Уникальный идентификатор (TC-001, TC-002) |
| **Приоритет** | Критичный / Высокий / Средний / Низкий |
| **Предусловия** | Что должно быть выполнено до теста |
| **Шаги** | Пошаговые действия |
| **Ожидаемый результат** | Что должно произойти |
| **Фактический результат** | Что произошло (фиксируется при выполнении) |

### Regression Suite

| Категория | Тест-кейсы |
|-----------|------------|
| **Аутентификация** | Регистрация, вход, выход, восстановление пароля, подтверждение email |
| **Управление событиями** | Создание, редактирование, публикация, отмена, удаление |
| **Бронирование** | Просмотр событий, выбор места, оформление, оплата, отмена |
| **Платежи** | Добавление метода, проведение платежа, возврат средств, история |

**Частота выполнения**:
- Полный regression: перед каждым релизом
- Соответствующий раздел: после критичных изменений
- Smoke-тесты: еженедельно

### Exploratory Testing

| Аспект | Детали |
|--------|--------|
| **Методология** | Session-Based Testing (60-90 минут) |
| **Чартер** | Конкретная цель исследования |
| **Техники** | Boundary Testing, Negative Testing, User Journey Testing |
| **Отчет** | Найденные проблемы и наблюдения |

**Чек-лист**:
- ✅ Все формы проверены с невалидными данными
- ✅ Протестированы все навигационные пути
- ✅ Проверена обработка ошибок
- ✅ Протестирована работа без JavaScript
- ✅ Проверена работа на разных разрешениях
- ✅ Протестирована доступность (accessibility)

## CI/CD Integration

### GitHub Actions Workflows

| Workflow | Запуск | Команды |
|----------|--------|---------|
| **Backend CI** | При каждом commit | `./gradlew test`, `./gradlew integrationTest`, ArchUnit validation, Jacoco coverage |
| **Frontend CI** | При каждом commit | `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e`, `pnpm build` |
| **Security CI** | При каждом PR | OWASP Dependency Check, Trivy image scanning, SBOM generation (Syft) |

### График запуска

| Тесты | Триггер |
|-------|---------|
| **Unit tests** | При каждом commit |
| **Integration tests** | При каждом PR |
| **E2E tests** | При каждом PR |
| **Smoke tests** | При каждом PR |
| **Regression suite** | При merge в main |
| **Full E2E** | Перед релизом |

---

См. [Test Strategy](test-strategy.md), [Bug Management](bug-management.md), [Performance](performance.md), [CI/CD Pipeline](../operations/ci-cd.md).