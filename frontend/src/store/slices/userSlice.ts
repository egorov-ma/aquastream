import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

import { authApi } from '@/modules/auth/api/authApi';
import type { LoginData, RegisterData } from '@/modules/auth/types';
import { UserRole } from '@/shared/config/menu';
import type { RootState } from '@/store';

// Локальный интерфейс User для sliceUser, чтобы избежать конфликта с импортом
interface UserData {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  role?: UserRole; // Роль пользователя
}

interface UserState {
  currentUser: UserData | null;
  isLoading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

// Асинхронные actions
export const loginUser = createAsyncThunk(
  'user/login',
  async (loginData: LoginData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(loginData);
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка при входе');
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (registerData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(registerData);
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка при регистрации');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка при получении данных пользователя');
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Обработчики для входа
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Безопасное преобразование из API ответа
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userData = (action.payload as any).data?.user as UserData;
        state.currentUser = userData;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Обработчики для регистрации
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Безопасное преобразование из API ответа
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userData = (action.payload as any).data?.user as UserData;
        state.currentUser = userData;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Обработчики для получения текущего пользователя
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Безопасное преобразование из API ответа
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userData = (action.payload as any).data as UserData;
        state.currentUser = userData;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Экспорт actions и reducer
export const { setUser, clearUser, clearError } = userSlice.actions;
export default userSlice.reducer;

// Селекторы
export const selectUserState = (state: RootState) => state.user;

export const selectCurrentUser = createSelector(
  [selectUserState],
  (userState) => userState.currentUser
);

export const selectIsLoading = createSelector(
  [selectUserState],
  (userState) => userState.isLoading
);

export const selectError = createSelector([selectUserState], (userState) => userState.error);

// Селектор для получения роли текущего пользователя (гость, если не авторизован)
export const selectUserRole = createSelector([selectCurrentUser], (currentUser): UserRole => {
  if (!currentUser) return UserRole.GUEST;
  return currentUser.role || UserRole.USER; // По умолчанию обычный пользователь
});

// Селектор для получения простых данных пользователя
export const selectUserBasicInfo = createSelector([selectCurrentUser], (currentUser) => {
  if (!currentUser) return null;

  return {
    id: currentUser.id,
    name: currentUser.username,
    email: currentUser.email,
    avatar: currentUser.avatar,
    role: currentUser.role || UserRole.USER,
  };
});
