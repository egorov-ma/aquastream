import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { logger } from './logger';
import { storageService } from './storage';

import { STORAGE_KEYS, API_URL } from '@/shared/config';

/**
 * Расширение интерфейса AxiosRequestConfig для добавления метаданных и признака повторного запроса
 */
export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _metadata?: {
    startTime: number;
    method: string;
    url: string;
  };
  _retry?: boolean;
}

/**
 * Интерфейс для ответа от сервера при обновлении токена
 */
interface RefreshTokenResponseData {
  token: string;
  refreshToken: string;
}

/**
 * API-сервис для взаимодействия с сервером
 */
export class ApiService {
  private readonly instance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * Создает экземпляр ApiService
   * @param baseURL - базовый URL для API
   */
  constructor(baseURL: string) {
    logger.debug('Initializing API service', { baseURL });

    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    this.setupInterceptors();
  }

  /**
   * Настраивает перехватчики запросов и ответов
   */
  private setupInterceptors(): void {
    // Перехватчик запросов
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storageService.getAccessToken();
        const extendedConfig = config as unknown as ExtendedAxiosRequestConfig;

        extendedConfig._metadata = {
          startTime: Date.now(),
          method: config.method?.toUpperCase() || 'UNKNOWN',
          url: config.url || 'UNKNOWN',
        };

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Перехватчик ответов
    this.instance.interceptors.response.use(
      (response) => {
        const config = response.config as ExtendedAxiosRequestConfig;
        const metadata = config._metadata;

        if (metadata) {
          const duration = Date.now() - metadata.startTime;
          logger.debug(`${metadata.method} ${metadata.url} - ${response.status} (${duration}ms)`);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        if (!originalRequest) {
          return Promise.reject(error);
        }

        const metadata = originalRequest._metadata;
        if (metadata) {
          const duration = Date.now() - metadata.startTime;
          logger.error(
            `${metadata.method} ${metadata.url} - ${error.response?.status || 'ERROR'} (${duration}ms)`,
            error
          );
        }

        // Проверка на ошибку 401 (Unauthorized)
        if (
          error.response &&
          error.response.status === 401 &&
          originalRequest.url !== '/auth/refresh' &&
          !originalRequest._retry
        ) {
          if (this.isRefreshing) {
            try {
              const token = await new Promise<string>((resolve) => {
                this.addRefreshSubscriber((token) => {
                  resolve(token);
                });
              });

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.instance(originalRequest);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = storageService.getRefreshToken();

            if (!refreshToken) {
              this.logout();
              return Promise.reject(new Error('No refresh token available'));
            }

            const response = await this.instance.post<{ data: RefreshTokenResponseData }>(
              '/auth/refresh',
              {
                refreshToken,
              }
            );

            const { token: accessToken, refreshToken: newRefreshToken } = response.data.data;

            storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            storageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            this.onRefreshSuccess(accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return this.instance(originalRequest);
          } catch (refreshError) {
            this.onRefreshFailure(refreshError as Error);
            this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Добавляет подписчика для обновления токена
   * @param callback - функция обратного вызова
   */
  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Вызывается при успешном обновлении токена
   * @param token - новый токен
   */
  private onRefreshSuccess(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
    this.isRefreshing = false;
  }

  /**
   * Вызывается при ошибке обновления токена
   * @param error - объект ошибки
   */
  private onRefreshFailure(error: Error): void {
    logger.error('Token refresh failed', error);
    this.refreshSubscribers = [];
    this.isRefreshing = false;
  }

  /**
   * Выполняет GET-запрос к API
   * @param url - URL-адрес
   * @param config - конфигурация запроса
   * @returns Promise с ответом
   */
  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get<T, AxiosResponse<T>>(url, config).then((response) => response.data);
  }

  /**
   * Выполняет POST-запрос к API
   * @param url - URL-адрес
   * @param data - данные для отправки
   * @param config - конфигурация запроса
   * @returns Promise с ответом
   */
  public post<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance
      .post<T, AxiosResponse<T>, D>(url, data, config)
      .then((response) => response.data);
  }

  /**
   * Выполняет PUT-запрос к API
   * @param url - URL-адрес
   * @param data - данные для отправки
   * @param config - конфигурация запроса
   * @returns Promise с ответом
   */
  public put<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance
      .put<T, AxiosResponse<T>, D>(url, data, config)
      .then((response) => response.data);
  }

  /**
   * Выполняет PATCH-запрос к API
   * @param url - URL-адрес
   * @param data - данные для отправки
   * @param config - конфигурация запроса
   * @returns Promise с ответом
   */
  public patch<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance
      .patch<T, AxiosResponse<T>, D>(url, data, config)
      .then((response) => response.data);
  }

  /**
   * Выполняет DELETE-запрос к API
   * @param url - URL-адрес
   * @param config - конфигурация запроса
   * @returns Promise с ответом
   */
  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete<T, AxiosResponse<T>>(url, config).then((response) => response.data);
  }

  /**
   * Выполняет выход пользователя
   */
  public logout(): void {
    logger.debug('Logging out user (API service)');
    storageService.clearAuthData();
    window.location.href = '/login';
  }
}

// Экспортируем singleton-экземпляр
export const apiService = new ApiService(API_URL);
