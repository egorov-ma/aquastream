/**
 * Утилиты для улучшения доступности (a11y)
 */

/**
 * Селектор для фокусируемых элементов
 */
export const focusableElementsSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Проверяет, может ли элемент получить фокус
 * @param element HTML элемент для проверки
 * @returns true, если элемент может получить фокус
 */
export function isFocusable(element: HTMLElement): boolean {
  return element.matches(focusableElementsSelector);
}

/**
 * Устанавливает "ловушку" для фокуса внутри элемента
 * Полезно для модальных окон и диалогов, чтобы пользователи
 * с клавиатурой или скринридерами не могли выйти за пределы
 * @param element Элемент, внутри которого должен оставаться фокус
 * @returns Функция для удаления ловушки фокуса
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = Array.from(
    element.querySelectorAll<HTMLElement>(focusableElementsSelector)
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Устанавливаем начальный фокус на первый элемент, если не установлен другой
  if (firstElement && !element.contains(document.activeElement)) {
    firstElement.focus();
  }
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Если фокус на первом элементе и нажат Shift+Tab, 
      // переходим к последнему элементу
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Если фокус на последнем элементе и нажат Tab,
      // переходим к первому элементу
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Проверяет доступность контраста между цветами
 * @param foreground Цвет текста в формате HEX (#ffffff)
 * @param background Цвет фона в формате HEX (#000000)
 * @returns Отношение контрастности (>= 4.5 считается хорошим для обычного текста)
 */
export function getContrastRatio(foreground: string, background: string): number {
  // Преобразуем HEX в RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  
  // Вычисляем относительную яркость
  const getLuminance = (rgb: [number, number, number]): number => {
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const foregroundRgb = hexToRgb(foreground);
  const backgroundRgb = hexToRgb(background);
  
  const foregroundLuminance = getLuminance(foregroundRgb);
  const backgroundLuminance = getLuminance(backgroundRgb);
  
  // Вычисляем контрастность
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Добавляет обработчики клавиатуры для ролей кнопок на элементах без встроенной доступности
 * @param element Элемент, который должен вести себя как кнопка
 * @param onClick Функция-обработчик клика
 * @returns Функция для удаления обработчиков
 */
export function addKeyboardSupport(element: HTMLElement, onClick: () => void): () => void {
  // Установка правильных атрибутов для доступности
  if (!element.getAttribute('role')) {
    element.setAttribute('role', 'button');
  }
  
  if (!element.getAttribute('tabindex')) {
    element.setAttribute('tabindex', '0');
  }
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onClick();
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
} 