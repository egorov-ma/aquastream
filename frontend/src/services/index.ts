/**
 * Экспорт сервисов для приложения
 *
 * Этот файл предоставляет единую точку импорта для всех сервисов
 * в слое services.
 */

// Экспортируем основные сервисы
export { apiService } from './api';
export { storageService } from './storage';
export { logger } from './logger';

// В будущем здесь могут быть дополнительные экспорты, например:
// export { analyticsService } from './analytics';
// export { notificationService } from './notification';
