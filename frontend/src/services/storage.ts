import { z } from 'zod';

import { STORAGE_KEYS } from '@/shared/config';

/**
 * Схема для валидации хранимых данных с меткой времени
 */
const TimestampedDataSchema = z.object({
  timestamp: z.number(),
  data: z.unknown(),
});

/**
 * Параметры для хранения данных
 */
interface StorageOptions {
  /** Время жизни кеша в миллисекундах */
  ttl?: number;
}

/**
 * Сервис для работы с локальным хранилищем (localStorage и sessionStorage)
 * Предоставляет простой и типизированный доступ к хранилищу данных
 */
class StorageService {
  /**
   * Получить значение из localStorage
   * @param key Ключ для получения
   * @returns Значение, хранимое по ключу, или null если оно не существует
   */
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  /**
   * Получить JSON-значение из localStorage
   * @param key Ключ для получения
   * @returns Распарсенный объект или null если он не существует или невалиден
   */
  getJSON<T>(key: string): T | null {
    const item = this.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Ошибка парсинга JSON из localStorage по ключу "${key}"`, error);
      return null;
    }
  }

  /**
   * Установить значение в localStorage
   * @param key Ключ для сохранения
   * @param value Значение для сохранения
   */
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * Установить JSON-значение в localStorage
   * @param key Ключ для сохранения
   * @param value Объект для сохранения
   */
  setJSON<T>(key: string, value: T): void {
    try {
      const stringValue = JSON.stringify(value);
      this.setItem(key, stringValue);
    } catch (error) {
      console.error(`Ошибка сохранения JSON в localStorage по ключу "${key}"`, error);
    }
  }

  /**
   * Удалить значение из localStorage
   * @param key Ключ для удаления
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Очистить весь localStorage
   */
  clear(): void {
    localStorage.clear();
  }

  /**
   * Получить значение из sessionStorage
   * @param key Ключ для получения
   * @returns Значение, хранимое по ключу, или null если оно не существует
   */
  getSessionItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  /**
   * Установить значение в sessionStorage
   * @param key Ключ для сохранения
   * @param value Значение для сохранения
   */
  setSessionItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  /**
   * Удалить значение из sessionStorage
   * @param key Ключ для удаления
   */
  removeSessionItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   * Очистить весь sessionStorage
   */
  clearSession(): void {
    sessionStorage.clear();
  }

  // Вспомогательные методы для работы с аутентификацией

  /**
   * Сохранить данные аутентификации в localStorage
   * @param accessToken Токен доступа
   * @param refreshToken Токен обновления
   * @param user Данные пользователя
   */
  setAuthData(accessToken: string, refreshToken: string, user: Record<string, unknown>): void {
    this.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    this.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    this.setJSON(STORAGE_KEYS.USER, user);
  }

  /**
   * Получить токен доступа
   * @returns Токен доступа или null
   */
  getAccessToken(): string | null {
    return this.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Получить токен обновления
   * @returns Токен обновления или null
   */
  getRefreshToken(): string | null {
    return this.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Получить данные пользователя
   * @returns Данные пользователя или null
   */
  getUser<T>(): T | null {
    return this.getJSON<T>(STORAGE_KEYS.USER);
  }

  /**
   * Очистить данные аутентификации
   */
  clearAuthData(): void {
    this.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    this.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Получить данные из хранилища
   * @param key Ключ для получения данных
   * @returns Полученные данные или null, если данных нет
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const result = TimestampedDataSchema.safeParse(parsed);

      if (!result.success) {
        return parsed as T;
      }

      // Если успешно распарсили объект с timestamp, возвращаем только данные
      return result.data.data as T;
    } catch (error) {
      console.error(`Error getting item from storage: ${error}`);
      return null;
    }
  }

  /**
   * Получить данные из хранилища с проверкой TTL
   * @param key Ключ для получения данных
   * @param ttl Время жизни данных в миллисекундах
   * @returns Полученные данные или null, если данных нет или они устарели
   */
  getWithExpiry<T>(key: string, ttl: number): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const result = TimestampedDataSchema.safeParse(parsed);

      if (!result.success) {
        return null;
      }

      const { timestamp, data } = result.data;
      const now = new Date().getTime();

      if (now - timestamp > ttl) {
        this.removeItem(key);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error(`Error getting item with expiry from storage: ${error}`);
      return null;
    }
  }

  /**
   * Сохранить данные в хранилище
   * @param key Ключ для сохранения данных
   * @param data Данные для сохранения
   * @param options Дополнительные опции
   */
  set<T>(key: string, data: T, options: StorageOptions = {}): void {
    try {
      const valueToStore = options.ttl
        ? {
            timestamp: new Date().getTime(),
            data,
          }
        : data;

      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting item to storage: ${error}`);
    }
  }

  /**
   * Удалить данные из хранилища
   * @param key Ключ для удаления данных
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error: unknown) {
      console.error(
        `Error removing item from storage: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Очистить хранилище
   */
  clearAll(): void {
    try {
      localStorage.clear();
    } catch (error: unknown) {
      console.error(
        `Error clearing storage: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
export const storageService = new StorageService();
