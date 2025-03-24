import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { combineReducers } from 'redux';

import eventsReducer from './slices/eventsSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';

import authReducer from '@/modules/auth/store/authSlice';
// Импортируем другие редьюсеры по мере создания

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

// Создаем типизированные хуки
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
