// import type { Preview } from '@storybook/react'; // Временно убираем тип
import '../src/index.css'; // импортируем глобальные стили, включая Tailwind CSS
import { themes } from '@storybook/theming';

// Конфигурация preview с поддержкой темной темы
const preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a202c' },
      ],
    },
    darkMode: {
      // Override the default dark theme
      dark: { ...themes.dark, appBg: '#1a202c', appContentBg: '#1a202c', barBg: '#171923' },
      // Override the default light theme
      light: { ...themes.normal },
      current: 'light'
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'centered',
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
      },
    },
  },
};

export default preview; 