// Объявление типов для модулей Node.js в ESM-контексте
// @ts-ignore
import type {} from 'node:path';
// @ts-ignore
import type {} from 'node:url';

import type { StorybookConfig } from "@storybook/react-vite";

// Максимально упрощенная конфигурация
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  // Добавляем явную конфигурацию TypeScript
  typescript: {
    check: false, // Отключаем проверку типов во время сборки Storybook (опционально, ускоряет)
    reactDocgen: 'react-docgen-typescript', // Рекомендуемый генератор документации для TS
    reactDocgenTypescriptOptions: {
      // Опции для react-docgen-typescript, если нужны
      // Например, для обработки пропсов из сторонних библиотек или сложных типов
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  // Возвращаем webpackFinal и добавляем правило для TS/TSX и алиасы
  webpackFinal: async (config) => {
    try {
      // --- Правило для TS/TSX файлов --- 
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      const hasTsxRule = config.module.rules.some(
        (rule) => typeof rule === 'object' && rule?.test instanceof RegExp && rule.test.test('.tsx')
      );

      if (!hasTsxRule) {
        console.log('Explicitly adding babel-loader rule for TS/TSX in Storybook webpack config.');
        config.module.rules.push({
          test: /\.(ts|tsx)$/,
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { node: 'current' } }],
              '@babel/preset-typescript',
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
          },
          exclude: /node_modules/,
        });
      } else {
         console.log('Skipping babel-loader rule addition, existing rule found.');
      }

      // --- Правило для CSS (с PostCSS/Tailwind) --- 
      const cssRuleIndex = config.module.rules.findIndex(
         (rule) => typeof rule === 'object' && rule?.test instanceof RegExp && rule.test.test('.css')
      );
      if (cssRuleIndex !== -1) {
        config.module.rules.splice(cssRuleIndex, 1);
        console.log('Removed existing CSS rule from Storybook webpack config.');
      }
      
      // Для избежания проблем с типами, используем динамический импорт
      // Оборачиваем в try-catch на случай проблем с ESM/CJS
      let tailwindcss, autoprefixer;
      try {
        const tailwindModule = await import('tailwindcss');
        const autoprefixerModule = await import('autoprefixer');
        tailwindcss = tailwindModule.default || tailwindModule;
        autoprefixer = autoprefixerModule.default || autoprefixerModule;
      } catch (error) {
        console.warn('Error importing PostCSS plugins dynamically, trying require:', error);
        // Fallback на require если динамический импорт не сработал
        // @ts-ignore
        tailwindcss = require('tailwindcss');
        // @ts-ignore
        autoprefixer = require('autoprefixer');
      }
      
      config.module.rules.push({
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [tailwindcss, autoprefixer],
              },
            },
          },
        ],
      });

      // --- Алиасы --- 
      config.resolve = config.resolve || {};
      
      // Используем относительные пути для алиасов (без path.resolve)
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@': './src',
        '@utils': './src/utils',
      };
      
      config.resolve.extensions = config.resolve.extensions || ['.js', '.jsx', '.ts', '.tsx'];
      if (!config.resolve.extensions.includes('.ts')) config.resolve.extensions.push('.ts');
      if (!config.resolve.extensions.includes('.tsx')) config.resolve.extensions.push('.tsx');

      console.log('Final Storybook Webpack config resolve:', JSON.stringify(config.resolve, null, 2));

    } catch (error) {
      console.error("Error configuring Storybook Webpack:", error);
    }
    return config;
  },
};

export default config; 