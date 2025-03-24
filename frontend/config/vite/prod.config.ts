/// <reference types="node" />

import { mergeConfig } from 'vite';
import baseConfig from './base.config';

// Конфигурация для продакшена
export default mergeConfig(baseConfig, {
  mode: 'production',
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
}); 