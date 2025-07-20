# Архитектура Redux в AquaStream

## Общая структура
В проекте AquaStream используется Redux вместе с Redux Toolkit для управления глобальным состоянием приложения. Это позволяет централизовать управление данными и упростить поток информации между компонентами.

## Структура хранилища

Наше Redux-хранилище разделено на следующие срезы (slices):

- **auth** - управление авторизацией пользователя
- **user** - данные о текущем пользователе
- **trips** - данные о сплавах и маршрутах
- **ui** - состояние интерфейса (модальные окна, уведомления)

## Организация директорий

```
src/store/
  ├── index.ts              # Конфигурация хранилища
  ├── hooks.ts              # Типизированные хуки (useAppDispatch, useAppSelector)
  ├── slices/               # Срезы хранилища
  │   ├── auth/
  │   │   ├── authSlice.ts  # Слайс для авторизации
  │   │   ├── selectors.ts  # Селекторы для auth
  │   │   └── thunks.ts     # Thunk-действия для auth
  │   ├── user/
  │   ├── trips/
  │   └── ui/
  └── middlewares/          # Промежуточные обработчики
```

## Пример организации среза

Каждый срез имеет следующую структуру:

### Slice-файл (authSlice.ts)

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, logout } from './thunks';
import { User } from '../../../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка входа';
      })
      // Аналогично для logout
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

### Thunks-файл (thunks.ts)

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../../services/auth';
import { Credentials, User } from '../../../types';

export const login = createAsyncThunk<User, Credentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials);
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Selectors-файл (selectors.ts)

```typescript
import { RootState } from '../../index';

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
```

## Конфигурация хранилища (store/index.ts)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice';
import userReducer from './slices/user/userSlice';
import tripsReducer from './slices/trips/tripsSlice';
import uiReducer from './slices/ui/uiSlice';
import logger from './middlewares/logger';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    trips: tripsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Типизированные хуки (hooks.ts)

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## Использование в компонентах

```tsx
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../store/slices/auth/thunks';
import { selectAuthLoading, selectAuthError } from '../../store/slices/auth/selectors';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  
  const handleSubmit = (credentials) => {
    dispatch(login(credentials));
  };
  
  return (
    // компонент формы входа
  );
};
```

## Лучшие практики

1. **Нормализация данных**: Храните данные в нормализованном виде для эффективного обновления и доступа
2. **Типизация**: Всегда используйте TypeScript для типизации состояния и действий
3. **Селекторы**: Используйте селекторы для доступа к состоянию, что обеспечивает инкапсуляцию
4. **Memoization**: Используйте createSelector для мемоизации сложных вычислений
5. **Оптимизация**: Обновляйте только необходимые части состояния для предотвращения лишних рендеров

## Управление асинхронными запросами

Для асинхронных операций с API используем:

1. **createAsyncThunk** - для простых запросов
2. **RTK Query** - для более сложных случаев, когда нужно кэширование, дедупликация и оптимистичные обновления

## Структура асинхронных операций

Каждая асинхронная операция проходит через три состояния:
- **pending**: запрос отправлен
- **fulfilled**: запрос успешно выполнен
- **rejected**: запрос завершился ошибкой

Для каждого из этих состояний мы обновляем loading, данные и обработку ошибок.

## Debugging и DevTools

Redux DevTools Extension обеспечивает расширенные возможности для отладки:
- Просмотр истории действий
- Инспектирование состояния
- Time-travel debugging
- Action replay 