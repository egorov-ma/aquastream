import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Тип уведомления
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Интерфейс уведомления
 */
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  autoClose?: boolean;
}

/**
 * Интерфейс состояния UI
 */
export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  isLoading: boolean;
}

/**
 * Начальное состояние UI
 */
const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
  isLoading: false,
};

/**
 * Слайс для управления состоянием UI
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({ ...action.payload, id });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((item) => item.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
