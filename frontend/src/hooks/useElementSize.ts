import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface Size {
  width: number;
  height: number;
}

/**
 * Хук для отслеживания размеров DOM-элемента с оптимизацией производительности
 *
 * @returns Кортеж из реф-объекта для привязки к элементу и текущих размеров
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const [ref, size] = useElementSize();
 *
 *   return (
 *     <div ref={ref}>
 *       Width: {size.width}px, Height: {size.height}px
 *     </div>
 *   );
 * };
 * ```
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  React.RefObject<T>,
  Size,
] {
  // Создаем стабильный ref объект
  const ref = useRef<T>(null);

  // Инициализируем состояние размеров с нулевыми значениями
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });

  // Мемоизированная функция для измерения размеров элемента
  const updateSize = useCallback(() => {
    const element = ref.current;
    if (element) {
      // Используем getBoundingClientRect для более точных результатов
      const { width, height } = element.getBoundingClientRect();

      // Обновляем состояние только если размеры действительно изменились
      // для предотвращения лишних ререндеров
      setSize((prevSize) => {
        if (Math.abs(prevSize.width - width) > 0.01 || Math.abs(prevSize.height - height) > 0.01) {
          return { width, height };
        }
        return prevSize;
      });
    }
  }, []);

  // Устанавливаем observer и обработчики событий
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Инициализируем размеры при монтировании
    updateSize();

    // Используем ResizeObserver для отслеживания изменений размера
    // Это более эффективно, чем слушать window resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        updateSize();
      }
    });

    resizeObserver.observe(element);

    // Отключаем observer при размонтировании
    return () => {
      resizeObserver.disconnect();
    };
  }, [updateSize]);

  // Мемоизируем возвращаемый результат
  return useMemo(() => [ref, size], [size]);
}
