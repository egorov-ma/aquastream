/// <reference types="node" />

import { defineConfig } from 'vite';
import devConfig from './dev.config';
import prodConfig from './prod.config';

// Выбор конфигурации в зависимости от режима
export default defineConfig(({ mode, command }) => {
  if (command === 'serve' || mode === 'development') {
    return devConfig({ mode });
  }
  
  return prodConfig;
}); 