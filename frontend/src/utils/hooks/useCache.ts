import { useState, useEffect, useCallback, useRef } from 'react';

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
 * Тип для зависимостей кэша
 */
type Dependencies = readonly unknown[];

/**
 * Проверяет валидность кэшированных данных
 * @param cachedData Кэшированные данные
 * @param ttl Время жизни кэша
 * @param version Версия кэша
 * @returns Валидны ли данные
 */
function isValidCache<T>(cachedData: CacheEntry<T> | null, ttl: number, version: string): boolean {
  if (!cachedData) return false;

  const now = Date.now();
  return now - cachedData.timestamp < ttl && cachedData.version === version;
}

/**
 * Пытается получить данные из кэша
 * @param key Ключ кэша
 * @returns Данные из кэша или null
 */
function getFromCache<T>(key: string): CacheEntry<T> | null {
  const cachedDataString = localStorage.getItem(key);
  if (!cachedDataString) return null;

  try {
    return JSON.parse(cachedDataString) as CacheEntry<T>;
  } catch (err) {
    console.warn('Ошибка при разборе кэша:', err);
    return null;
  }
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
  dependencies: Dependencies = [],
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

  // Используем useRef для хранения dependencies, чтобы избежать проблем с ESLint
  const depsRef = useRef(dependencies);
  depsRef.current = dependencies;

  // Настройки по умолчанию
  const {
    ttl = 5 * 60 * 1000, // 5 минут по умолчанию
    key = `cache-${JSON.stringify(dependencies)}`,
    version = '1.0',
  } = options;

  // Функция для загрузки данных
  const fetchData = useCallback(
    async (ignoreCache = false) => {
      setIsLoading(true);
      setError(null);

      // Проверяем кэш, если не игнорируем его
      if (!ignoreCache) {
        const cachedData = getFromCache<T>(key);

        if (cachedData && isValidCache(cachedData, ttl, version)) {
          setData(cachedData.data);
          setIsLoading(false);
          return;
        }
      }

      try {
        // Получаем новые данные
        const result = await fetcher();

        // Сохраняем в кэш
        const cacheEntry: CacheEntry<T> = {
          data: result,
          timestamp: Date.now(),
          version,
        };

        localStorage.setItem(key, JSON.stringify(cacheEntry));
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [key, ttl, version, fetcher]
  );

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
    void fetchData();
    // Используем depsRef.current явно, учитывая его изменения
  }, [fetchData, key, ttl, version]); // depsRef.current не нужно добавлять в зависимости, т.к. мы используем useCallback

  return { data, isLoading, error, refetch, clearCache };
}
