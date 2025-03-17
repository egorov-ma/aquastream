import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import authReducer from '@/modules/auth/store/authSlice';
import eventsReducer from '@/modules/events/store/eventsSlice';
// Импортируем другие редьюсеры по мере создания

/**
 * Корневое хранилище Redux
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    // Добавляем другие редьюсеры по мере создания
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем некоторые пути для проверки сериализуемости
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
        ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt'],
      },
    }),
});

// Типы для хранилища и диспетчера
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Создаем типизированные хуки
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
