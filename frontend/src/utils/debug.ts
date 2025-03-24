/**
 * Утилиты для отладки приложения
 * Используйте эти функции только в режиме разработки
 */

/**
 * Замеряет время выполнения участка кода
 * @param label Метка для измерения
 * @returns Функция, вызов которой завершает измерение и выводит результат
 * @example
 * const end = debugTime('Rendering component');
 * // ... код, время выполнения которого нужно измерить
 * end(); // Выведет "Rendering component: X ms"
 */
export function debugTime(label: string): () => void {
  if (process.env.NODE_ENV !== 'development') {
    return () => {};
  }

  // eslint-disable-next-line no-console
  console.time(label);
  // eslint-disable-next-line no-console
  return () => console.timeEnd(label);
}

/**
 * Тип для интерфейса memory в Performance
 */
interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

/**
 * Расширенный интерфейс Performance с поддержкой memory
 */
interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

/**
 * Выводит информацию о состоянии памяти
 * @param label Метка для лога
 */
export function debugMemory(label: string): void {
  if (process.env.NODE_ENV !== 'development' || !window.performance) {
    return;
  }

  const performance = window.performance as PerformanceWithMemory;
  const memory = performance.memory;

  if (memory) {
    // eslint-disable-next-line no-console
    console.log(`${label} - Used JS Heap: ${Math.round(memory.usedJSHeapSize / 1048576)} MB`);
  }
}

/**
 * Отладочный вывод информации о рендере компонента и его пропсах
 * @param componentName Имя компонента
 * @param props Пропсы компонента
 * @example
 * debugRenders('UserProfile', { id: 1, name: 'John' });
 */
export function debugRenders<T extends Record<string, unknown>>(
  componentName: string,
  props: T
): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // eslint-disable-next-line no-console
  console.group(`Render: ${componentName}`);
  // eslint-disable-next-line no-console
  console.log('Props:', props);
  // eslint-disable-next-line no-console
  console.groupEnd();
}

/**
 * Выводит информацию о повторных рендерах компонента и о том, какие пропсы изменились
 * @param componentName Имя компонента
 * @param prevProps Предыдущие пропсы
 * @param nextProps Новые пропсы
 */
export function debugPropsChanges<T extends Record<string, unknown>>(
  componentName: string,
  prevProps: T,
  nextProps: T
): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // eslint-disable-next-line no-console
  console.group(`Props changed in ${componentName}`);

  // Проверяем все ключи обоих объектов
  const allKeys = new Set([...Object.keys(prevProps), ...Object.keys(nextProps)]);

  for (const key of allKeys) {
    if (prevProps[key] !== nextProps[key]) {
      // eslint-disable-next-line no-console
      console.log(`${key}:`, {
        from: prevProps[key],
        to: nextProps[key],
      });
    }
  }

  // eslint-disable-next-line no-console
  console.groupEnd();
}

/**
 * Оценивает производительность участка кода, выполняя его несколько раз и возвращая статистику
 * @param fn Функция для тестирования
 * @param iterations Количество повторений
 * @returns Объект с результатами тестирования
 */
export function debugPerformance<T>(
  fn: () => T,
  iterations = 100
): { min: number; max: number; avg: number; result: T } {
  if (process.env.NODE_ENV !== 'development') {
    return { min: 0, max: 0, avg: 0, result: fn() };
  }

  const times: number[] = [];
  let result: T | undefined;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    result = fn();
    const end = performance.now();
    times.push(end - start);
  }

  const min = Math.min(...times);
  const max = Math.max(...times);
  const avg = times.reduce((sum, time) => sum + time, 0) / times.length;

  // eslint-disable-next-line no-console
  console.table({
    min: `${min.toFixed(3)} ms`,
    max: `${max.toFixed(3)} ms`,
    avg: `${avg.toFixed(3)} ms`,
    iterations,
  });

  if (result === undefined) {
    throw new Error('Result is undefined');
  }

  return { min, max, avg, result };
}
