#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Получение пути к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к директории проекта
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');

// Убедимся, что директория dist существует и пуста
if (fs.existsSync(distDir)) {
  console.log('Cleaning dist directory...');
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Создаем директорию заново
fs.mkdirSync(distDir, { recursive: true });

console.log('Building project...');

// Запуск Vite для сборки
const buildProcess = spawn('vite', ['build', '--config', 'vite.config.ts'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
});

// Обработка выхода
buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Build completed successfully!');
  } else {
    console.error(`Build failed with code ${code}`);
  }
  process.exit(code);
}); 