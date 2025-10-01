# E2E Testing Plan

---
title: E2E Testing Plan
summary: План end-to-end тестирования полных пользовательских сценариев в системе AquaStream
tags: [qa, testing, e2e, playwright]
---

## Обзор

План end-to-end тестирования полных пользовательских сценариев в системе AquaStream.

## Цели E2E тестирования

- Проверка критичных пользовательских путей
- Валидация интеграции frontend + backend + БД
- Обнаружение проблем на уровне системы
- Проверка бизнес-процессов

## Инструменты

- **Playwright**: основной фреймворк
- **Браузер**: Chromium
- **Окружение**: Docker Compose (все сервисы)

## Критичные пользовательские сценарии

### 1. Регистрация и онбординг

**Шаги**:
1. Открыть страницу регистрации
2. Заполнить форму регистрации
3. Подтвердить email (mock)
4. Завершить профиль

**Проверки**:
- Пользователь создан в БД
- Email отправлен
- Профиль заполнен
- Перенаправление в личный кабинет

### 2. Поиск и просмотр события

**Шаги**:
1. Открыть главную страницу
2. Использовать поиск/фильтры
3. Выбрать событие из списка
4. Просмотреть детали события

**Проверки**:
- События отображаются
- Фильтры работают
- Детали корректны
- Изображения загружаются

### 3. Бронирование билета

**Шаги**:
1. Выбрать событие
2. Выбрать места
3. Добавить в корзину
4. Оформить заказ
5. Ввести платежные данные (mock)
6. Подтвердить покупку

**Проверки**:
- Места заблокированы
- Заказ создан
- Платеж обработан
- Билет сгенерирован
- Email с билетом отправлен

### 4. Создание события (организатор)

**Шаги**:
1. Войти как организатор
2. Перейти в "Мои события"
3. Создать новое событие
4. Заполнить детали
5. Загрузить изображения
6. Опубликовать событие

**Проверки**:
- Событие создано
- Изображения загружены
- Событие доступно публично
- Статус "Опубликовано"

### 5. Отмена бронирования

**Шаги**:
1. Войти в систему
2. Перейти в "Мои бронирования"
3. Выбрать активное бронирование
4. Запросить отмену
5. Подтвердить отмену

**Проверки**:
- Бронирование отменено
- Места освобождены
- Возврат средств инициирован
- Email с подтверждением отправлен

## Smoke Tests

Минимальный набор для быстрой проверки:

```typescript
// tests/e2e/smoke/
- auth-login.smoke.spec.ts       ✓
- homepage.smoke.spec.ts
- event-list.smoke.spec.ts
- booking-flow.smoke.spec.ts
```

**Время выполнения**: <5 минут

## Regression Tests

Полный набор критичных сценариев:

```typescript
// tests/e2e/regression/
- user-registration.spec.ts
- user-login.spec.ts
- event-search.spec.ts
- booking-create.spec.ts
- booking-cancel.spec.ts
- organizer-event-create.spec.ts
- payment-flow.spec.ts
```

**Время выполнения**: <30 минут

## Подготовка окружения

### Docker Compose

```bash
# Запуск всех сервисов
make infra-up
make backend-up
make frontend-dev

# Проверка готовности
make health-check
```

### Тестовые данные

```bash
# Загрузка test fixtures
make test-data-load
```

## Запуск тестов

```bash
# Smoke tests
pnpm test:e2e:smoke

# Regression suite
pnpm test:e2e:regression

# Все E2E тесты
pnpm test:e2e

# С UI (headed mode)
pnpm exec playwright test --headed

# Debug конкретного теста
pnpm exec playwright test --debug tests/e2e/booking-flow.spec.ts
```

## Отчеты

### HTML Report

```bash
# Генерация отчета
pnpm exec playwright show-report

# Локация: playwright-report/index.html
```

### CI Reports

- JUnit XML для интеграции с CI
- Screenshots при падении тестов
- Видео записи неуспешных тестов
- Trace файлы для детального анализа

## Best Practices

### Селекторы

```typescript
// ✅ Хорошо - по ролям
await page.getByRole('button', { name: /sign in/i })
await page.getByRole('textbox', { name: /email/i })

// ❌ Плохо - хрупкие селекторы
await page.locator('.btn-primary')
await page.locator('#email-input')
```

### Ожидания

```typescript
// ✅ Хорошо - явные ожидания
await page.waitForLoadState('networkidle')
await expect(element).toBeVisible()

// ❌ Плохо - жесткие задержки
await page.waitForTimeout(5000)
```

### Организация тестов

```typescript
test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should create booking', async ({ page }) => {
    // Test
  });

  test.afterEach(async ({ page }) => {
    // Cleanup
  });
});
```

## Метрики

### KPI
- Test Success Rate: ≥98%
- Flakiness Rate: <2%
- Execution Time: <30 мин (full suite)
- Code Coverage: н/д (E2E не для coverage)

### Мониторинг
- Trend analysis (успешность тестов)
- Performance metrics (время выполнения)
- Flaky test detection

## Обработка нестабильности

### Retry стратегия

```typescript
test('flaky test', async ({ page }) => {
  // Playwright auto-retry failed tests
});
```

### Retry конфигурация

```typescript
// playwright.config.ts
retries: process.env.CI ? 2 : 0
```

## CI Integration

```yaml
# .github/workflows/e2e.yml
- name: Run E2E Tests
  run: |
    make infra-up
    make backend-up
    pnpm test:e2e
```

## График

- **Smoke tests**: при каждом PR
- **Regression suite**: при каждом merge в main
- **Full E2E**: перед каждым релизом
- **Ночные запуски**: для мониторинга стабильности
