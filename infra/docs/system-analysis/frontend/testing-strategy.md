# Стратегия тестирования AquaStream Frontend

## Обзор

В проекте AquaStream используется многоуровневый подход к тестированию, который обеспечивает надежность и качество кода. Наша стратегия тестирования включает в себя модульные тесты, интеграционные тесты и end-to-end тесты.

## Инструменты тестирования

- **Vitest** - основной инструмент для модульного тестирования
- **React Testing Library** - для тестирования React-компонентов
- **MSW (Mock Service Worker)** - для мокирования API-запросов
- **Playwright** - для end-to-end тестирования

## Уровни тестирования

### 1. Модульные тесты

Модульные тесты проверяют изолированные единицы кода (функции, компоненты) на корректность их работы.

#### Особенности модульных тестов:

- Быстрые в выполнении
- Изолированные (не зависят от внешних систем)
- Проверяют конкретную функциональность
- Запускаются автоматически при разработке и в CI/CD

#### Пример модульного теста:

```tsx
// Input.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input component', () => {
  test('renders with default props', () => {
    render(<Input />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
  });

  test('applies correct variant styles', () => {
    const { rerender } = render(<Input variant="outlined" />);
    let input = screen.getByRole('textbox');
    expect(input.closest('div')).toHaveClass('border-2');

    rerender(<Input variant="filled" />);
    input = screen.getByRole('textbox');
    expect(input.closest('div')).toHaveClass('bg-gray-100');
  });
});
```

### 2. Интеграционные тесты

Интеграционные тесты проверяют взаимодействие между различными компонентами и модулями приложения.

#### Особенности интеграционных тестов:

- Проверяют взаимодействие между компонентами
- Могут включать в себя мокирование API-запросов
- Более медленные, чем модульные тесты
- Запускаются реже, чем модульные тесты

#### Пример интеграционного теста:

```tsx
// LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { BrowserRouter } from 'react-router-dom';

describe('LoginForm integration', () => {
  test('submits form with correct values', async () => {
    const mockSubmit = vi.fn();
    
    render(
      <BrowserRouter>
        <LoginForm onSubmit={mockSubmit} />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: '<password>' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '<password>'
      });
    });
  });
});
```

### 3. End-to-End тесты (E2E)

E2E-тесты проверяют работу всего приложения в условиях, максимально приближенных к реальным.

#### Особенности E2E-тестов:

- Тестируют всю систему целиком
- Работают с реальным UI и имитируют действия пользователя
- Самые медленные, но наиболее приближенные к реальному использованию
- Запускаются в CI/CD перед деплоем

#### Пример E2E-теста:

```ts
// auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {
  // Мокируем API-ответ
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: '1', email: 'test@example.com', name: 'Тестовый Пользователь' },
        token: 'fake-jwt-token'
      })
    });
  });

  await page.goto('/login');
  
  // Заполняем форму
  await page.getByLabel(/Email/).fill('test@example.com');
  await page.getByLabel(/Пароль/).fill('<password>');
  await page.getByRole('button', { name: /Войти/ }).click();
  
  // Проверяем, что после успешного входа происходит редирект
  await expect(page).toHaveURL(/dashboard|home/);
  
  // Проверяем, что имя пользователя отображается на странице
  await expect(page.getByText('Тестовый Пользователь')).toBeVisible();
});
```

## Организация тестов

Структура тестов в проекте:

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Input/
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Input.test.tsx
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── LoginForm.test.tsx
│   │   │   └── ui/
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── components/
│   │       │   │   ├── LoginForm.tsx
│   │       │   │   └── LoginForm.test.tsx
│   ├── tests/
│   │   ├── integration/
│   │   │   └── LoginForm.test.tsx
│   │   ├── e2e/
│   │   │   ├── auth.spec.ts
│   │   │   ├── navigation.spec.ts
│   │   │   └── registration.spec.ts
```

## Запуск тестов

### Модульные и интеграционные тесты

```bash
# Запуск всех тестов
npm test

# Запуск тестов в режиме watch
npm run test:watch

# Запуск тестов с отчетом о покрытии
npm run test:coverage
```

### E2E тесты

```bash
# Запуск всех E2E тестов
npm run test:e2e

# Запуск E2E тестов в UI-режиме
npm run test:e2e:ui

# Просмотр отчета о E2E тестах
npm run test:e2e:report
```

## CI/CD интеграция

Тесты запускаются автоматически в пайплайне CI/CD:

1. **Pull Request** - запускаются модульные и интеграционные тесты
2. **Перед деплоем** - запускаются все тесты, включая E2E
3. **Ночной билд** - запускаются все тесты с отчетом о покрытии

## Покрытие кода тестами

Целевое покрытие кода:
- UI компоненты: не менее 90%
- Бизнес-логика: не менее 80%
- Утилиты: не менее 95%

## Мок-данные и фикстуры

Для тестов используются:
- Статические мок-данные в `/src/mocks/data`
- MSW для мокирования API
- Фикстуры для часто используемых объектов

## Лучшие практики

1. **Принцип AAA**: Arrange (подготовка), Act (действие), Assert (проверка)
2. **Тестирование поведения, а не реализации**
3. **Избегание лишних снимков (snapshots)**
4. **Фокус на пользовательских сценариях**
5. **Изоляция тестов друг от друга**

## Разработка через тестирование (TDD)

Для критически важных компонентов рекомендуется подход TDD:
1. Написать тест, который не проходит
2. Реализовать минимальный код для прохождения теста
3. Рефакторинг кода с сохранением прохождения тестов

## Дополнительные ресурсы

- [Vitest документация](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright документация](https://playwright.dev/docs/intro)
- [MSW документация](https://mswjs.io/docs/) 