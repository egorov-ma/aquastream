import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // Временно отключаем аддоны, которые вызывают проблемы
    // // // // // // // '@storybook/addon-links',
    // // // // // // // '@storybook/addon-essentials',
    // // // // // // // '@storybook/addon-onboarding',
    // // // // // // // '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    if (config.module?.rules) {
      // Добавляем поддержку Tailwind CSS
      config.module.rules.push({
        test: /\.css$/,
        use: [
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      });
    }
    return config;
  },
};

export default config; 