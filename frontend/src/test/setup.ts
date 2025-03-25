import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { expect, afterEach, beforeAll, afterAll } from 'vitest';

// Расширяем expect для Testing Library
expect.extend(matchers);

// Очищаем после каждого теста
afterEach(() => {
  cleanup();
});

// Создаем тестовый сервер для перехвата запросов
export const server = setupServer();

// Настраиваем сервер перед тестами
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Сбрасываем обработчики между тестами
afterEach(() => server.resetHandlers());

// Закрываем сервер после всех тестов
afterAll(() => server.close());

// Полифиллы и моки для браузерного API, если нужно
// например, window.matchMedia
if (!window.matchMedia) {
  window.matchMedia = () =>
    ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList;
}

// Мок для localStorage
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

// Заменяем localStorage на мок для тестов
Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
});
