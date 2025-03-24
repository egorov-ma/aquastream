import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

addons.setConfig({
  theme: {
    ...themes.light,
    brandTitle: 'AquaStream UI',
    brandUrl: 'https://aquastream.io',
    brandTarget: '_self',
    colorPrimary: '#4338ca', // Indigo-700 из Tailwind
    colorSecondary: '#6366f1', // Indigo-500 из Tailwind
  },
}); 