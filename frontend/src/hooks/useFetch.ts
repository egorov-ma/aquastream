import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions<T, B = unknown> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: B;
  headers?: Record<string, string>;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  skipInitialFetch?: boolean;
  dependencies?: unknown[];
}

interface UseFetchResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<T | void>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}

export function useFetch<T, B = unknown>({
  url,
  method = 'GET',
  body,
  headers,
  initialData,
  onSuccess,
  onError,
  skipInitialFetch = false,
  dependencies = [],
}: UseFetchOptions<T, B>): UseFetchResult<T> {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(!skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = (await response.json()) as T;
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, method, body, headers, onSuccess, onError, ...(dependencies || [])]);

  useEffect(() => {
    if (!skipInitialFetch) {
      fetchData().catch(console.error);
    }
  }, [fetchData, skipInitialFetch]);

  return { data, loading, error, refetch: fetchData, setData };
}
