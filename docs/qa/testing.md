---
title: Testing
summary: Comprehensive testing plans: backend, frontend, integration, E2E, automation, manual
tags: [qa, testing, automation, manual]
---

# Testing

## Обзор

Планы тестирования для всех компонентов системы AquaStream.

## Backend Testing

### Объем тестирования

**Микросервисы**: User (8101), Event (8102), Crew (8103), Payment (8104), Notification (8105), Media (8106), Gateway (8080)

### Уровни

**Unit Tests**
- Охват: Service layer, Repository layer, Utility classes, Architecture tests (ArchUnit)
- Инструменты: JUnit 5, Mockito
- Критерий: покрытие ≥70%
- Запуск: `./gradlew test`

**Integration Tests**
- Охват: REST API endpoints, Database operations, Message queuing, Redis caching
- Инструменты: Spring Boot Test, Testcontainers
- Критерий: все критичные API endpoints
- Запуск: `./gradlew integrationTest`

**Contract Tests**
- Охват: OpenAPI спецификации, Межсервисное взаимодействие
- Инструменты: Spring Cloud Contract (планируется)

### Тестовые данные

- SQL-скрипты: `backend-*/src/test/resources/data.sql`
- Testcontainers для изоляции БД
- Автоочистка через `@Transactional` + `@Rollback`

### Метрики

- Code Coverage: ≥70%
- Test Success Rate: 100%
- Execution Time: <5 мин (unit), <15 мин (integration)

## Frontend Testing

### Технологический стек

- Framework: Next.js 15 (App Router), React 18
- Styling: Tailwind CSS 3.4 (3.4.18) + shadcn/ui
- Testing: Playwright, Node test runner

### Уровни

**Unit Tests**
- Охват: Утилиты, хуки, изолированные компоненты
- Инструменты: Node test runner
- Запуск: `pnpm test:unit`
- Критерий: покрытие утилит 100%

**Component Tests**
- Охват: UI компоненты, композитные компоненты, layouts
- Инструменты: React Testing Library (планируется)

**E2E Tests**
- Охват: Аутентификация, навигация, формы, критичные пути
- Инструменты: Playwright
- Запуск: `pnpm test:e2e`
- Критерий: smoke-тесты для всех страниц

### Качество

```bash
# Линтеры и типизация
pnpm lint
pnpm typecheck

# Сборка
pnpm build
```

### Браузеры

- Chrome, Firefox, Safari, Edge (последние 2 версии)
- Разрешения: 375px, 768px, 1024px, 1280px, 1920px

### Метрики

- E2E Test Success Rate: 100%
- Lighthouse Performance: ≥90
- Lighthouse Accessibility: ≥95
- Build Success Rate: 100%

## Integration Testing

### Области интеграции

**Backend ↔ Database**
- CRUD через JPA, транзакционность, миграции
- Инструменты: Testcontainers + PostgreSQL

**Service ↔ Service**
- REST взаимодействие, API Gateway ↔ Services
- Инструменты: MockServer, WireMock

**Backend ↔ Redis**
- Кэширование, инвалидация, TTL, rate limiting
- Инструменты: Testcontainers + Redis

**Frontend ↔ Backend**
- REST API, JWT auth, CORS
- Инструменты: Playwright + Mock Backend

### Сценарии

**Создание пользователя**:
Frontend → Gateway → User Service → PostgreSQL → Event queue → Notification Service

**Бронирование события**:
Frontend → Event Service (блокировка места) → Payment Service → Event Service (подтверждение) → Notification

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

### Инструменты

- Playwright (основной)
- Браузер: Chromium
- Окружение: Docker Compose

### Критичные сценарии

**1. Регистрация и онбординг**
- Регистрация → Email подтверждение → Заполнение профиля → Личный кабинет

**2. Поиск и просмотр события**
- Главная → Поиск/фильтры → Выбор события → Детали

**3. Бронирование билета**
- Выбор события → Выбор мест → Корзина → Оформление → Оплата (mock) → Билет → Email

**4. Создание события (организатор)**
- Вход как организатор → Мои события → Создать → Детали → Изображения → Публикация

**5. Отмена бронирования**
- Мои бронирования → Выбор → Запрос отмены → Подтверждение → Возврат средств → Email

### Smoke Tests

Минимальный набор (<5 минут):
- `auth-login.smoke.spec.ts`
- `homepage.smoke.spec.ts`
- `event-list.smoke.spec.ts`
- `booking-flow.smoke.spec.ts`

### Regression Tests

Полный набор (<30 минут):
- user-registration, user-login
- event-search, booking-create, booking-cancel
- organizer-event-create, payment-flow

### Запуск

```bash
pnpm test:e2e:smoke       # Smoke tests
pnpm test:e2e:regression  # Regression suite
pnpm test:e2e             # Все E2E
pnpm exec playwright test --headed  # С UI
```

### Best Practices

```typescript
// ✅ Хорошо - селекторы по ролям
await page.getByRole('button', { name: /sign in/i })

// ✅ Явные ожидания
await page.waitForLoadState('networkidle')
await expect(element).toBeVisible()

// ❌ Плохо - хрупкие селекторы и жесткие задержки
await page.locator('.btn-primary')
await page.waitForTimeout(5000)
```

### Метрики

- Test Success Rate: ≥98%
- Flakiness Rate: <2%
- Execution Time: <30 мин

## API Tests

### Технологии

- Spring Boot Test, Testcontainers, MockMvc

### Структура

```
src/integrationTest/java/
  ├── api/              # Тесты REST endpoints
  ├── integration/      # Интеграционные тесты
  └── testcontainers/   # Конфигурация Testcontainers
```

### Запуск

```bash
./gradlew integrationTest
./gradlew :backend-user:backend-user-api:integrationTest
```

### Best Practices

- Testcontainers для реальной БД
- Проверка всех HTTP статусов
- Тестирование валидации
- Проверка структуры ответов

## UI Tests

### Технологии

- Playwright (E2E framework)
- Chromium

### Установка

```bash
cd frontend
pnpm exec playwright install --with-deps chromium
```

### Структура

```
frontend/tests/e2e/
  ├── auth-login.smoke.spec.ts
  └── ... (будущие тесты)
```

### Запуск

```bash
pnpm test:e2e                       # Все тесты
pnpm exec playwright test <file>    # Конкретный тест
pnpm exec playwright test --debug   # Debug режим
```

## Manual Testing

### Test Cases

**Структура тест-кейса**:
- **TC-ID**: Уникальный идентификатор
- **Приоритет**: Критичный / Высокий / Средний / Низкий
- **Предусловия**: Что должно быть выполнено
- **Шаги**: Пошаговые действия
- **Ожидаемый результат**: Что должно произойти
- **Фактический результат**: Что произошло (фиксируется при выполнении)

**Примеры**:
- TC-001: Регистрация нового пользователя
- TC-002: Авторизация пользователя
- TC-003: Создание события

**Отчетность**: Issue tracker с меткой `qa-manual`

### Regression Suite

Критичные сценарии для проверки перед релизом:

**Аутентификация**:
- [ ] Регистрация нового пользователя
- [ ] Вход в систему
- [ ] Выход из системы
- [ ] Восстановление пароля
- [ ] Подтверждение email

**Управление событиями**:
- [ ] Создание события
- [ ] Редактирование события
- [ ] Публикация события
- [ ] Отмена события
- [ ] Удаление события

**Бронирование**:
- [ ] Просмотр доступных событий
- [ ] Выбор места
- [ ] Оформление бронирования
- [ ] Оплата бронирования
- [ ] Отмена бронирования

**Платежи**:
- [ ] Добавление платежного метода
- [ ] Проведение платежа
- [ ] Возврат средств
- [ ] Просмотр истории платежей

**Частота**: Полный regression перед каждым релизом, после критичных изменений — соответствующий раздел, еженедельно — smoke-тесты

### Exploratory Testing

**Методология**: Session-Based Testing
- Длительность: 60-90 минут
- Чартер: конкретная цель исследования
- Отчет: найденные проблемы и наблюдения

**Техники**:
- **Boundary Testing**: граничные значения, пустые поля, специальные символы
- **Negative Testing**: невалидные данные, неожиданные последовательности
- **User Journey Testing**: типичные пути, альтернативные сценарии

**Чек-лист**:
- [ ] Все формы проверены с невалидными данными
- [ ] Протестированы все навигационные пути
- [ ] Проверена обработка ошибок
- [ ] Протестирована работа без JavaScript
- [ ] Проверена работа на разных разрешениях экрана
- [ ] Протестирована доступность (accessibility)

**Документирование**:
```markdown
## Сессия: [Название]
**Дата**: YYYY-MM-DD
**Тестировщик**: Имя
**Чартер**: Описание цели

### Найденные проблемы
1. [Описание]

### Наблюдения
- [Наблюдение]

### Следующие шаги
- [Рекомендация]
```

## CI/CD Integration

### GitHub Actions

**Backend CI**:
- Unit tests: `./gradlew test`
- Integration tests: `./gradlew integrationTest`
- Architecture tests: ArchUnit validation
- Coverage report: Jacoco

**Frontend CI**:
- Lint: `pnpm lint`
- Type check: `pnpm typecheck`
- Unit tests: `pnpm test:unit`
- E2E tests: `pnpm test:e2e`
- Build: `pnpm build`

**Security CI**:
- OWASP Dependency Check
- Trivy image scanning
- SBOM generation (Syft)

### График запуска

- Unit tests: при каждом commit
- Integration tests: при каждом PR
- E2E tests: при каждом PR
- Smoke tests: при каждом PR
- Regression suite: при merge в main
- Full E2E: перед релизом

## См. также

- [Test Strategy](test-strategy.md) - общая стратегия тестирования
- [Bug Management](bug-management.md) - управление дефектами
- [Performance](performance.md) - нагрузочное тестирование
- [CI/CD Pipeline](../operations/ci-cd.md) - детали workflows
- [Architecture](../architecture.md) - архитектура системы
