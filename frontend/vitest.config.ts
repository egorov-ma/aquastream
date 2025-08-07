import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    includeSource: ['src/**/*.{js,ts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/test/**',
        '**/*.d.ts',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/dist/**',
        '**/types/**',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        '**/.storybook/**',
        '**/stories/**',
        '**/mocks/**'
      ],
      thresholds: {
        statements: 15,
        branches: 8,
        functions: 12,
        lines: 15
      }
    },
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
      '@routes': resolve(__dirname, './src/routes'),
      '@lib': resolve(__dirname, './src/lib'),
      '@test': resolve(__dirname, './src/test'),
    },
  },
});