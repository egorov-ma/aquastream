# Стандарты работы с API в AquaStream

## Общая архитектура

В проекте AquaStream используется клиент-серверная архитектура с RESTful API. Клиентская часть взаимодействует с серверной через HTTP-запросы, используя стандартные методы (GET, POST, PUT, DELETE) и форматы данных (JSON).

## Структура директорий для работы с API

```
src/
  ├── services/             # Сервисы для работы с API
  │   ├── api/              # Базовые настройки API-клиента
  │   │   ├── client.ts     # Базовый API-клиент (Axios)
  │   │   ├── endpoints.ts  # Константы URL-эндпоинтов
  │   │   └── types.ts      # Типы для API-запросов
  │   ├── auth/             # Сервисы авторизации
  │   ├── trips/            # Сервисы для работы со сплавами
  │   └── user/             # Сервисы для работы с пользователями
  └── utils/
      ├── api-helpers.ts    # Вспомогательные функции для API
      └── error-handling.ts # Обработка ошибок API
```

## Базовый API-клиент

Мы используем Axios для HTTP-запросов. Базовая конфигурация клиента:

```typescript
// src/services/api/client.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../config';
import { handleApiError } from '../../utils/error-handling';
import { getToken, clearToken } from '../../utils/auth';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  // Добавление токена авторизации к каждому запросу
  client.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Обработка ответов и ошибок
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Обработка 401 - Unauthorized
      if (error.response?.status === 401) {
        clearToken();
        window.location.href = '/login';
      }
      return Promise.reject(handleApiError(error));
    }
  );

  return client;
};

export const apiClient = createApiClient();
```

## Структура сервисов API

Каждый сервис отвечает за конкретную область функциональности и экспортирует методы для работы с API:

```typescript
// src/services/auth/index.ts
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { Credentials, RegistrationData, User, AuthResponse } from '../api/types';

export const authService = {
  login: async (credentials: Credentials): Promise<User> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    // Сохранение токена в localStorage или cookies
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  },

  register: async (data: RegistrationData): Promise<User> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      data
    );
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.logout);
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.auth.me);
    return response.data;
  },
};
```

## Обработка ошибок

Централизованная обработка ошибок API:

```typescript
// src/utils/error-handling.ts
import { AxiosError } from 'axios';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export const handleApiError = (error: AxiosError): ApiError => {
  // Ошибка сети (нет соединения)
  if (!error.response) {
    return {
      status: 0,
      message: 'Нет соединения с сервером. Проверьте подключение к интернету.',
    };
  }

  // Серверная ошибка с ответом
  const { status, data } = error.response;
  
  // Типовые ошибки HTTP
  switch (status) {
    case 400:
      return {
        status,
        message: 'Неверный запрос. Проверьте правильность введенных данных.',
        details: data.errors,
      };
    case 401:
      return {
        status,
        message: 'Необходима авторизация. Пожалуйста, войдите в систему.',
      };
    case 403:
      return {
        status,
        message: 'Доступ запрещен. У вас нет прав для выполнения этого действия.',
      };
    case 404:
      return {
        status,
        message: 'Ресурс не найден.',
      };
    case 500:
    case 502:
    case 503:
      return {
        status,
        message: 'Ошибка сервера. Пожалуйста, попробуйте позже.',
      };
    default:
      return {
        status,
        message: data.message || 'Произошла неизвестная ошибка.',
        code: data.code,
        details: data.details,
      };
  }
};
```

## Стратегии кэширования

Мы используем несколько стратегий кэширования данных:

### 1. Кэширование с помощью RTK Query

```typescript
// src/services/api/rtkQueryApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../config';
import { getToken } from '../../utils/auth';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Trip', 'Route'],
  endpoints: (builder) => ({
    // Эндпоинты будут определены в отдельных файлах
  }),
});
```

### 2. Пример эндпоинта с кэшированием

```typescript
// src/services/trips/tripsApi.ts
import { api } from '../api/rtkQueryApi';
import { Trip, TripListResponse, TripDetailsResponse } from '../api/types';

export const tripsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTrips: builder.query<TripListResponse, void>({
      query: () => 'trips',
      providesTags: (result) =>
        result
          ? [
              ...result.trips.map(({ id }) => ({ type: 'Trip' as const, id })),
              { type: 'Trip', id: 'LIST' },
            ]
          : [{ type: 'Trip', id: 'LIST' }],
    }),
    
    getTripById: builder.query<TripDetailsResponse, string>({
      query: (id) => `trips/${id}`,
      providesTags: (result, error, id) => [{ type: 'Trip', id }],
    }),
    
    createTrip: builder.mutation<Trip, Partial<Trip>>({
      query: (data) => ({
        url: 'trips',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
    }),
    
    updateTrip: builder.mutation<Trip, { id: string; data: Partial<Trip> }>({
      query: ({ id, data }) => ({
        url: `trips/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Trip', id },
        { type: 'Trip', id: 'LIST' },
      ],
    }),
    
    deleteTrip: builder.mutation<void, string>({
      query: (id) => ({
        url: `trips/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Trip', id },
        { type: 'Trip', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTripsQuery,
  useGetTripByIdQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
} = tripsApi;
```

### 3. Локальное кэширование для оффлайн-режима

```typescript
// src/utils/offline-cache.ts
import localforage from 'localforage';

// Настройка хранилища
localforage.config({
  name: 'AquaStream',
  storeName: 'api_cache',
});

export const offlineCache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await localforage.getItem<{
        data: T;
        timestamp: number;
      }>(key);
      
      if (!cachedData) return null;
      
      // Проверка истечения срока кэша (24 часа)
      const isExpired = Date.now() - cachedData.timestamp > 24 * 60 * 60 * 1000;
      
      return isExpired ? null : cachedData.data;
    } catch (error) {
      console.error('Error accessing cache:', error);
      return null;
    }
  },
  
  async set<T>(key: string, data: T): Promise<void> {
    try {
      await localforage.setItem(key, {
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  },
  
  async remove(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  },
  
  async clear(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};
```

## Мониторинг и логирование API-запросов

Для мониторинга API-запросов и отладки используем middleware:

```typescript
// src/store/middlewares/api-logger.ts
import { Middleware } from 'redux';
import { isRejectedWithValue } from '@reduxjs/toolkit';

export const apiLogger: Middleware = () => (next) => (action) => {
  // Логирование ошибок API-запросов
  if (isRejectedWithValue(action)) {
    console.group('API Error');
    console.log('Action:', action.type);
    console.log('Payload:', action.payload);
    console.log('Meta:', action.meta);
    console.groupEnd();
    
    // Здесь можно добавить отправку логов на сервер
  }
  
  return next(action);
};
```

## Проверка состояния соединения

```typescript
// src/utils/connectivity.ts
export const checkConnectivity = () => {
  return new Promise<boolean>((resolve) => {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      resolve(navigator.onLine);
    } else {
      // Fallback - пробуем загрузить favicon
      fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
        .then(() => resolve(true))
        .catch(() => resolve(false));
    }
  });
};

// Отслеживание статуса соединения
export const setupConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};
```

## Лучшие практики работы с API

1. **Типизация данных** - используйте TypeScript для всех API-запросов и ответов
2. **Централизованная обработка ошибок** - все ошибки обрабатываются в одном месте
3. **Абстракция API-клиента** - не используйте axios напрямую в компонентах
4. **Отложенная загрузка и кэширование** - минимизируйте количество запросов
5. **Мониторинг и логирование** - отслеживайте все API-вызовы для диагностики

## Обработка состояний загрузки и ошибок в UI

Для консистентной обработки состояний загрузки и ошибок в UI используйте хуки:

```typescript
// src/hooks/useApiState.ts
import { useState, useEffect } from 'react';

interface UseApiStateProps<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch?: () => void;
}

interface UseApiStateReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  retry: () => void;
}

export const useApiState = <T>({
  data,
  isLoading,
  isError,
  error,
  refetch,
}: UseApiStateProps<T>): UseApiStateReturn<T> => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    if (isError && error) {
      setErrorMessage(
        error.message || 'Произошла ошибка. Пожалуйста, попробуйте еще раз.'
      );
    } else {
      setErrorMessage('');
    }
  }, [isError, error]);
  
  const retry = () => {
    if (refetch) {
      refetch();
    }
  };
  
  return {
    data,
    isLoading,
    isError,
    errorMessage,
    retry,
  };
};
```

Использование хука в компоненте:

```tsx
import { useGetTripByIdQuery } from '../../services/trips/tripsApi';
import { useApiState } from '../../hooks/useApiState';

const TripDetails = ({ tripId }) => {
  const query = useGetTripByIdQuery(tripId);
  const { data, isLoading, isError, errorMessage, retry } = useApiState(query);
  
  if (isLoading) return <Loader />;
  
  if (isError) {
    return (
      <ErrorMessage
        message={errorMessage}
        onRetry={retry}
      />
    );
  }
  
  return (
    // Отображение данных о поездке
  );
};
``` 