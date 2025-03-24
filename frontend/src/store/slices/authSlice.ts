import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { apiService } from '@/services/api';

/**
 * Интерфейс пользователя
 */
export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Интерфейс данных для входа
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Интерфейс данных для регистрации
 */
export interface RegisterData extends LoginCredentials {
  username: string;
  name?: string;
}

/**
 * Интерфейс ответа API для аутентификации
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Интерфейс состояния аутентификации
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Начальное состояние аутентификации
 */
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Асинхронный Thunk для входа пользователя
 */
export const login = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiService.post<AuthResponse>(
        '/auth/login',
        credentials as unknown as Record<string, unknown>
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data || { message: 'Ошибка входа в систему' });
    }
  }
);

/**
 * Асинхронный Thunk для регистрации пользователя
 */
export const register = createAsyncThunk<AuthResponse, RegisterData>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post<AuthResponse>(
        '/auth/register',
        data as unknown as Record<string, unknown>
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(axiosError.response?.data || { message: 'Ошибка регистрации' });
    }
  }
);

/**
 * Асинхронный Thunk для выхода пользователя
 */
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await apiService.post('/auth/logout');
    return null;
  } catch (error) {
    const axiosError = error as AxiosError;
    return rejectWithValue(axiosError.response?.data || { message: 'Ошибка выхода из системы' });
  }
});

/**
 * Слайс для управления состоянием аутентификации
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Обработка login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload
          ? (action.payload as { message: string }).message
          : 'Ошибка входа';
      });

    // Обработка register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload
          ? (action.payload as { message: string }).message
          : 'Ошибка регистрации';
      });

    // Обработка logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload
          ? (action.payload as { message: string }).message
          : 'Ошибка выхода';
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
