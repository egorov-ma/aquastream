import axios from 'axios';
import { 
  LoginData, 
  RegisterData, 
  UpdateProfileData, 
  ChangePasswordData 
} from '../types';
import { API_URL } from '@/config';

// Создаем инстанс axios с общей конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Если ошибка 401 и запрос не на обновление токена
    if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Обновляем токены
        const { data } = await api.post('/auth/refresh', { refreshToken });
        
        // Сохраняем новые токены
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токены - разлогиниваем пользователя
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Редирект на страницу логина
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * API для работы с аутентификацией
 */
export const authApi = {
  /**
   * Вход пользователя в систему
   * @param loginData - данные для входа
   */
  login: (loginData: LoginData) => {
    return api.post('/auth/login', loginData);
  },

  /**
   * Регистрация нового пользователя
   * @param registerData - данные для регистрации
   */
  register: (registerData: RegisterData) => {
    return api.post('/auth/register', registerData);
  },

  /**
   * Выход пользователя из системы
   */
  logout: () => {
    return api.post('/auth/logout');
  },

  /**
   * Обновление токенов доступа
   * @param refreshToken - токен обновления
   */
  refreshTokens: (refreshToken: string) => {
    return api.post('/auth/refresh', { refreshToken });
  },

  /**
   * Получение данных текущего пользователя
   */
  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  /**
   * Обновление профиля пользователя
   * @param userId - идентификатор пользователя
   * @param profileData - данные для обновления
   */
  updateProfile: (userId: string, profileData: UpdateProfileData) => {
    return api.put(`/users/${userId}`, profileData);
  },

  /**
   * Изменение пароля пользователя
   * @param userId - идентификатор пользователя
   * @param passwordData - данные для смены пароля
   */
  changePassword: (userId: string, passwordData: ChangePasswordData) => {
    return api.put(`/users/${userId}/password`, passwordData);
  },

  /**
   * Запрос на сброс пароля
   * @param email - email пользователя
   */
  requestPasswordReset: (email: string) => {
    return api.post('/auth/password-reset', { email });
  },

  /**
   * Сброс пароля
   * @param token - токен сброса пароля
   * @param newPassword - новый пароль
   */
  resetPassword: (token: string, newPassword: string) => {
    return api.post(`/auth/password-reset/${token}`, { newPassword });
  }
}; 