import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { authApi } from '../api/authApi';
import {
  AuthState,
  LoginData,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  User,
} from '../types';

import { ApiError } from '@/shared/types/api';

// Начальное состояние
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
};

// Асинхронный action для входа
export const login = createAsyncThunk(
  'auth/login',
  async (loginData: LoginData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(loginData);
      const jwtRes = response.data.data as {
        token: string;
        id: string;
        username: string;
        name: string;
        role: string;
        refreshToken: string;
      };
      const accessToken = jwtRes.token;
      const refreshToken = jwtRes.refreshToken || '';
      const user: User = {
        id: jwtRes.id,
        email: jwtRes.username,
        displayName: jwtRes.name,
        role: jwtRes.role,
        createdAt: '',
        updatedAt: '',
      } as unknown as User;

      // Сохраняем токены в localStorage
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, accessToken, refreshToken };
    } catch (error: unknown) {
      const authError = error as ApiError;
      return rejectWithValue(authError.response?.data?.message || 'Ошибка входа');
    }
  }
);

// Асинхронный action для регистрации
export const register = createAsyncThunk(
  'auth/register',
  async (registerData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(registerData);
      const jwtRes = response.data.data as {
        token: string;
        id: string;
        username: string;
        name: string;
        role: string;
        refreshToken: string;
      };
      const accessToken = jwtRes.token;
      const refreshToken = jwtRes.refreshToken || '';
      const user: User = {
        id: jwtRes.id,
        email: jwtRes.username,
        displayName: jwtRes.name,
        role: jwtRes.role,
        createdAt: '',
        updatedAt: '',
      } as unknown as User;

      // Сохраняем токены в localStorage
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, accessToken, refreshToken };
    } catch (error: unknown) {
      const authError = error as ApiError;
      return rejectWithValue(authError.response?.data?.message || 'Ошибка регистрации');
    }
  }
);

// Асинхронный action для выхода
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();

    // Удаляем токены из localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    return null;
  } catch (error: unknown) {
    // Даже если API вернул ошибку, мы всё равно очищаем локальные данные
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    const authError = error as ApiError;
    return rejectWithValue(authError.response?.data?.message || 'Ошибка выхода');
  }
});

// Асинхронный action для обновления профиля
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    { userId, profileData }: { userId: string; profileData: UpdateProfileData },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.updateProfile(userId, profileData);
      const updatedUser = response.data.data;

      // Обновляем данные пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error: unknown) {
      const authError = error as ApiError;
      return rejectWithValue(authError.response?.data?.message || 'Ошибка обновления профиля');
    }
  }
);

// Асинхронный action для смены пароля
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { userId, passwordData }: { userId: string; passwordData: ChangePasswordData },
    { rejectWithValue }
  ) => {
    try {
      await authApi.changePassword(userId, passwordData);
      return null;
    } catch (error: unknown) {
      const authError = error as ApiError;
      return rejectWithValue(authError.response?.data?.message || 'Ошибка смены пароля');
    }
  }
);

// Слайс для аутентификации
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Редьюсер для инициализации состояния из localStorage при загрузке приложения
    initAuth: (state) => {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const parsedUser = JSON.parse(userString) as User;
          state.user = parsedUser;
          state.isAuthenticated = true;
        } catch {
          localStorage.removeItem('user');
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Обработка входа
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Обработка регистрации
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Обработка выхода
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    });

    // Обработка обновления профиля
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload as User;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Обработка смены пароля
    builder.addCase(changePassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(changePassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUser, clearError, initAuth } = authSlice.actions;

// Селекторы для получения данных из состояния
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthTokens = (state: { auth: AuthState }) => ({
  accessToken: state.auth.accessToken,
  refreshToken: state.auth.refreshToken,
});

export default authSlice.reducer;
