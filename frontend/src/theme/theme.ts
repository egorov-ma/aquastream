/**
 * Типы для работы с темой
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Получение текущей темы из localStorage
 */
export const getStoredTheme = (): Theme => {
  const theme = localStorage.getItem('theme') as Theme | null;
  return theme || 'system';
};

/**
 * Сохранение выбранной темы в localStorage
 */
export const storeTheme = (theme: Theme): void => {
  localStorage.setItem('theme', theme);
};

/**
 * Определение системной темы через медиа-запрос
 */
export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Применение выбранной темы к HTML элементу (добавление/удаление класса 'dark')
 */
export const applyTheme = (theme: Theme): void => {
  const root = window.document.documentElement;

  // Очистка предыдущих классов темы
  root.classList.remove('light', 'dark');

  // Применение темы
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;

  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }
};

/**
 * Инициализация темы при загрузке приложения
 */
export const initializeTheme = (): (() => void) | void => {
  const storedTheme = getStoredTheme();
  applyTheme(storedTheme);

  // Добавляем слушатель событий для изменения системной темы
  if (storedTheme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);

    // Возвращаем функцию очистки, которая удаляет обработчик
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }
};

/**
 * Переключение между темами
 */
export const toggleTheme = (): void => {
  const currentTheme = getStoredTheme();
  let newTheme: Theme;

  switch (currentTheme) {
    case 'light':
      newTheme = 'dark';
      break;
    case 'dark':
      newTheme = 'system';
      break;
    default:
      newTheme = 'light';
      break;
  }

  storeTheme(newTheme);
  applyTheme(newTheme);
};

/**
 * Хук для работы с темой (для использования в компонентах)
 */
export const useTheme = () => {
  const currentTheme = getStoredTheme();

  return {
    theme: currentTheme,
    effectiveTheme: currentTheme === 'system' ? getSystemTheme() : currentTheme,
    setTheme: (theme: Theme) => {
      storeTheme(theme);
      applyTheme(theme);
    },
    toggleTheme,
  };
};
