import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Импортируем редьюсеры из модулей
import authReducer from '@/modules/auth/store/authSlice';
import eventsReducer from '@/modules/events/store/eventsSlice';
import uiReducer from '@/modules/ui/store/uiSlice';
import userReducer from '@/store/slices/userSlice';

/**
 * Корневой редюсер, объединяющий все слайсы
 */
const rootReducer = combineReducers({
  user: userReducer,
  events: eventsReducer,
  ui: uiReducer,
  auth: authReducer,
  // Добавляем другие редьюсеры по мере создания
});

/**
 * Корневое хранилище Redux
 */
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем специфичные действия или пути для проверки сериализуемости
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['ui.notifications'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Типы для хранилища и диспетчера
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
