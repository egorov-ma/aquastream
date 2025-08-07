/// <reference types="node" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';

// Базовая конфигурация Vite для проекта
export default defineConfig({
  plugins: [
    react(),
    svgr({ 
      svgrOptions: {
        icon: true,
      },
      include: '**/*.svg',
    }),
  ],
  root: '.', // Корневая директория проекта
  publicDir: 'public', // Директория с публичными файлами
  build: {
    outDir: 'dist',
    cssCodeSplit: true,
  },
  css: {
    devSourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@components': resolve(__dirname, '../../src/components'),
      '@pages': resolve(__dirname, '../../src/pages'),
      '@services': resolve(__dirname, '../../src/services'),
      '@store': resolve(__dirname, '../../src/store'),
      '@utils': resolve(__dirname, '../../src/utils'),
      '@hooks': resolve(__dirname, '../../src/hooks'),
      '@assets': resolve(__dirname, '../../src/assets'),
      '@modules': resolve(__dirname, '../../src/modules'),
      '@shared': resolve(__dirname, '../../src/shared'),
      '@types': resolve(__dirname, '../../src/types'),
      '@theme': resolve(__dirname, '../../src/theme'),
      '@routes': resolve(__dirname, '../../src/routes'),
      '@lib': resolve(__dirname, '../../src/lib'),
      '@test': resolve(__dirname, '../../test'),
      '@layouts': resolve(__dirname, '../../src/layouts'),
    },
  },
});