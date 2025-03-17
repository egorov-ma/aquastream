import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { STORAGE_KEYS, API_URL } from '@/shared/config';

// Расширяем тип AxiosRequestConfig для обработки повторных запросов
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Интерфейс для ответа API с рефреш-токеном
 */
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Таймаут запросов
const TIMEOUT = 10000; // 10 секунд

/**
 * Базовый API сервис для работы с axios
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Настройка перехватчиков запросов и ответов
   */
  private setupInterceptors(): void {
    // Перехватчик запросов
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Перехватчик ответов
    this.api.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        // Проверяем, что error имеет нужную структуру
        if (error && typeof error === 'object' && 'config' in error) {
          const originalRequest = error.config as ExtendedAxiosRequestConfig;

          // Проверяем, что error.response существует и имеет свойство status
          if (
            error &&
            typeof error === 'object' &&
            'response' in error &&
            error.response &&
            typeof error.response === 'object' &&
            'status' in error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
          ) {
            originalRequest._retry = true;

            try {
              // Получаем refresh token
              const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

              if (!refreshToken) {
                // Если нет refresh token, выходим из системы
                this.logout();
                return Promise.reject(error);
              }

              // Пытаемся обновить токен
              const response = await axios.post<RefreshTokenResponse>(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data;

              // Сохраняем новые токены
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

              // Обновляем заголовок и повторяем запрос
              this.api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${accessToken}`,
              };

              return this.api(originalRequest);
            } catch (refreshError) {
              // Если не удалось обновить токен, выходим из системы
              this.logout();
              return Promise.reject(refreshError);
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Выход из системы (очистка localStorage)
   */
  private logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);

    // Перенаправление на страницу входа
    window.location.href = '/login';
  }

  /**
   * GET запрос
   * @param url URL запроса
   * @param config Конфигурация запроса
   * @returns Promise с ответом
   */
  public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  /**
   * POST запрос
   * @param url URL запроса
   * @param data Данные запроса
   * @param config Конфигурация запроса
   * @returns Promise с ответом
   */
  public post<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  /**
   * PUT запрос
   * @param url URL запроса
   * @param data Данные запроса
   * @param config Конфигурация запроса
   * @returns Promise с ответом
   */
  public put<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  /**
   * DELETE запрос
   * @param url URL запроса
   * @param config Конфигурация запроса
   * @returns Promise с ответом
   */
  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  /**
   * PATCH запрос
   * @param url URL запроса
   * @param data Данные запроса
   * @param config Конфигурация запроса
   * @returns Promise с ответом
   */
  public patch<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }
}

// Экспортируем экземпляр сервиса
export const apiService = new ApiService();
