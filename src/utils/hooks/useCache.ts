import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  /** Время жизни кэша в миллисекундах */
  ttl?: number;
  /** Ключ для сохранения в localStorage */
  key?: string;
  /** Версия кэша - при изменении старый кэш будет инвалидирован */
  version?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Хук для кэширования данных с использованием localStorage
 * @param fetcher Функция для загрузки данных
 * @param dependencies Зависимости для повторной загрузки данных
 * @param options Дополнительные параметры (ttl, key, version)
 * @returns Объект с данными, состоянием загрузки, ошибкой и функцией для принудительной загрузки
 */
export function useCache<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  options: CacheOptions = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Настройки по умолчанию
  const {
    ttl = 5 * 60 * 1000, // 5 минут по умолчанию
    key = `cache-${JSON.stringify(dependencies)}`,
    version = '1.0'
  } = options;
  
  // Функция для загрузки данных
  const fetchData = useCallback(async (ignoreCache = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Проверяем кэш, если не игнорируем его
      if (!ignoreCache) {
        const cachedDataString = localStorage.getItem(key);
        if (cachedDataString) {
          try {
            const parsed = JSON.parse(cachedDataString) as CacheEntry<T>;
            const now = Date.now();
            
            // Проверяем время жизни и версию
            if (now - parsed.timestamp < ttl && parsed.version === version) {
              setData(parsed.data);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            // Если ошибка при разборе кэша, просто продолжаем загрузку
            console.warn('Ошибка при разборе кэша:', err);
          }
        }
      }
      
      // Получаем новые данные
      const result = await fetcher();
      
      // Сохраняем в кэш
      const cacheEntry: CacheEntry<T> = {
        data: result,
        timestamp: Date.now(),
        version
      };
      
      localStorage.setItem(key, JSON.stringify(cacheEntry));
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [key, ttl, version, fetcher]);
  
  // Функция для принудительной загрузки данных
  const refetch = useCallback(async () => {
    return fetchData(true);
  }, [fetchData]);
  
  // Функция для очистки кэша
  const clearCache = useCallback(() => {
    localStorage.removeItem(key);
    setData(null);
  }, [key]);
  
  // Загружаем данные при изменении зависимостей
  useEffect(() => {
    fetchData();
  }, [...dependencies, key, ttl, version]);
  
  return { data, isLoading, error, refetch, clearCache };
} 