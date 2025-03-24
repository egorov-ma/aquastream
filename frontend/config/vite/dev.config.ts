/// <reference types="node" />

import { mergeConfig } from 'vite';
import { loadEnv } from 'vite';
import baseConfig from './base.config';

// Конфигурация для разработки
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return mergeConfig(baseConfig, {
    mode: 'development',
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts'],
      passWithNoTests: true,
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: ['node_modules/', 'test/setup.ts'],
      },
      environmentOptions: {
        jsdom: {
          // Опции для jsdom окружения
        }
      },
      deps: {
        optimizer: {
          web: {
            include: ['react-router-dom']
          }
        }
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'public/**',
        'test/e2e/**',
        '**/*.e2e.{test,spec}.{ts,tsx}',
      ],
      include: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'test/**/*.{test,spec}.{ts,tsx}'
      ]
    },
  });
}; 