import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Хук для создания отложенного значения, которое обновляется только после
 * истечения таймаута с момента последнего изменения исходного значения.
 *
 * @param value Исходное значение, которое нужно отложить
 * @param delay Задержка в миллисекундах (по умолчанию 500 мс)
 * @returns Отложенное значение
 *
 * @example
 * ```tsx
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 *   useEffect(() => {
 *     // Выполнить поиск с debouncedSearchTerm
 *     // Этот эффект будет запускаться только когда debouncedSearchTerm изменится
 *   }, [debouncedSearchTerm]);
 *
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={e => setSearchTerm(e.target.value)}
 *     />
 *   );
 * };
 * ```
 */
export function useDebounce<T>(value: T, delay = 500): T {
  // Состояние для отложенного значения
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // Запоминаем последние значения для очистки таймера
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef<T>(value);

  useEffect(() => {
    // Обновляем текущее значение в ref
    valueRef.current = value;

    // Очищаем предыдущий таймер при изменении значения
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Устанавливаем новый таймер
    timerRef.current = setTimeout(() => {
      setDebouncedValue(valueRef.current);
    }, delay);

    // Очищаем таймер при размонтировании компонента
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Хук для создания отложенной функции, которая вызывается только после
 * истечения таймаута с момента последнего вызова.
 *
 * @param callback Функция, которую нужно отложить
 * @param delay Задержка в миллисекундах (по умолчанию 500 мс)
 * @returns Отложенная функция
 *
 * @example
 * ```tsx
 * const FilterComponent = () => {
 *   const [filter, setFilter] = useState('');
 *
 *   const handleSearch = (term: string) => {
 *     // Дорогостоящая операция поиска
 *     console.log('Searching for:', term);
 *   };
 *
 *   const debouncedSearch = useDebouncedCallback(handleSearch, 300);
 *
 *   return (
 *     <input
 *       value={filter}
 *       onChange={e => {
 *         setFilter(e.target.value);
 *         debouncedSearch(e.target.value);
 *       }}
 *     />
 *   );
 * };
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 500
): T {
  // Сохраняем последний таймер в ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Сохраняем последний callback в ref, чтобы всегда иметь актуальную функцию
  const callbackRef = useRef<T>(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Создаем отложенную функцию
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Отменяем предыдущий таймер
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Устанавливаем новый таймер
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  // Очищаем таймер при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
