/// <reference types="node" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';

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
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    cssCodeSplit: true,
  },
  css: {
    devSourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@services': resolve(__dirname, './src/services'),
      '@store': resolve(__dirname, './src/store'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@assets': resolve(__dirname, './src/assets'),
      '@modules': resolve(__dirname, './src/modules'),
      '@shared': resolve(__dirname, './src/shared'),
      '@types': resolve(__dirname, './src/types'),
      '@theme': resolve(__dirname, './src/theme'),
      '@styles': resolve(__dirname, './src/styles'),
      '@routes': resolve(__dirname, './src/routes'),
      '@lib': resolve(__dirname, './src/lib'),
      '@layouts': resolve(__dirname, './src/layouts'),
    },
  },
});
