import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { combineReducers } from 'redux';

// Импорт редьюсеров для создания моковых данных
import authReducer from '@/modules/auth/store/authSlice';
import eventsReducer from '@/modules/events/store/eventsSlice';
import uiReducer from '@/modules/ui/store/uiSlice';
import userReducer from '@/store/slices/userSlice';

// Создаем тип состояния для тестирования
interface RootState {
  auth: ReturnType<typeof authReducer>;
  events: ReturnType<typeof eventsReducer>;
  ui: ReturnType<typeof uiReducer>;
  user: ReturnType<typeof userReducer>;
}

// Создаем мок для корневого редьюсера
const testReducer = combineReducers({
  auth: authReducer,
  events: eventsReducer,
  ui: uiReducer,
  user: userReducer,
});

/**
 * Расширенные опции рендеринга, включающие дополнительные параметры
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: EnhancedStore;
  routes?: {
    path: string;
    element: ReactElement;
  }[];
  initialEntry?: string;
}

/**
 * Функция для рендеринга компонентов с полным окружением:
 * - Redux store
 * - React Router
 * - Любые провайдеры контекста
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    // Автоматически создает store на основе testReducer и preloadedState
    store = configureStore({ reducer: testReducer, preloadedState }),
    routes,
    initialEntry = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  // Функция для обертывания компонентов в Redux Provider
  function Wrapper({ children }: PropsWithChildren): ReactElement {
    if (routes) {
      // Если указаны маршруты, используем RouterProvider
      const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });

      return (
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      );
    }

    // Если маршруты не указаны, просто оборачиваем в Provider
    return <Provider store={store}>{children}</Provider>;
  }

  const user = userEvent.setup();

  return {
    store,
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Функция для создания мока Redux store с заданным состоянием
 */
export function createMockStore(preloadedState: Partial<RootState> = {}) {
  return configureStore({
    reducer: testReducer,
    preloadedState,
  });
}
