import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

// Создаем базовые настройки для светлой и темной темы
const brandingSettings = {
  brandTitle: 'AquaStream UI',
  brandUrl: 'https://aquastream.io',
  brandTarget: '_self',
  colorPrimary: '#4338ca', // Indigo-700 из Tailwind
  colorSecondary: '#6366f1', // Indigo-500 из Tailwind
};

// Проверяем текущую предпочитаемую тему пользователя
const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Применяем настройки с учетом темы
addons.setConfig({
  theme: {
    ...(prefersDarkMode ? themes.dark : themes.light),
    ...brandingSettings,
  },
}); 