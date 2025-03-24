import type { Preview } from '@storybook/react';
import '../src/index.css'; // импортируем глобальные стили, включая Tailwind CSS

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#f8fafc', // светлый фон, соответствует Tailwind slate-50
        },
        {
          name: 'dark',
          value: '#0f172a', // темный фон, соответствует Tailwind slate-900
        },
        {
          name: 'gray',
          value: '#e2e8f0', // серый фон, соответствует Tailwind slate-200
        },
      ],
    },
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