/// <reference types="node" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'form': ['react-hook-form', 'zod'],
          'utils': ['axios', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  css: {
    devSourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@types': path.resolve(__dirname, './src/types'),
      '@theme': path.resolve(__dirname, './src/theme'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
    },
  },
});
