import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '@/services/AuthService';
import { User, LoginData, RegisterData, AuthResponse, UpdateProfileData } from '@/types/user';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY } from '@/config';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Получение данных из localStorage
const getStoredAuthData = (): { user: User | null; token: string | null; refreshToken: string | null } => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userDataStr = localStorage.getItem(USER_DATA_KEY);
    const user = userDataStr ? JSON.parse(userDataStr) : null;
    
    return { user, token, refreshToken };
  } catch (error) {
    console.error('Ошибка при получении данных аутентификации из localStorage:', error);
    return { user: null, token: null, refreshToken: null };
  }
};

const { user, token, refreshToken } = getStoredAuthData();

const initialState: AuthState = {
  user,
  token,
  refreshToken,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

// Асинхронные thunk-действия
export const login = createAsyncThunk(
  'auth/login',
  async (loginData: LoginData, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(loginData);
      const authData = response.data as AuthResponse;
      
      // Сохранение данных в localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
      
      return authData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при входе в систему');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (registerData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(registerData);
      const authData = response.data as AuthResponse;
      
      // Сохранение данных в localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
      
      return authData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при регистрации');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout();
      
      // Удаление данных из localStorage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при выходе из системы');
    }
  }
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentRefreshToken = state.auth.refreshToken;
      
      if (!currentRefreshToken) {
        throw new Error('Отсутствует refresh token');
      }
      
      const response = await AuthService.refreshTokens(currentRefreshToken);
      const authData = response.data as AuthResponse;
      
      // Сохранение новых токенов в localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
      
      return authData;
    } catch (error: any) {
      // Удаление данных из localStorage при ошибке
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      
      return rejectWithValue(error.response?.data?.message || 'Ошибка при обновлении токенов');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: UpdateProfileData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;
      
      if (!userId) {
        throw new Error('Пользователь не авторизован');
      }
      
      const response = await AuthService.updateProfile(userId, profileData);
      const updatedUser = response.data as User;
      
      // Обновление данных пользователя в localStorage
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при обновлении профиля');
    }
  }
);

// Создание слайса
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Обработка login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Обработка register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Обработка logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Даже при ошибке выхода очищаем состояние
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Обработка refreshTokens
    builder
      .addCase(refreshTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshTokens.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Обработка updateProfile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer; 