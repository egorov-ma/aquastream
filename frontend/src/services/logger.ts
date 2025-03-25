import { IS_DEV, IS_PROD } from '@/shared/config';

/**
 * Уровни логирования
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Опции для настройки логгера
 */
interface LoggerOptions {
  /**
   * Разрешить логирование в production
   */
  enabledInProduction?: boolean;

  /**
   * Минимальный уровень логирования
   */
  minLevel?: LogLevel;

  /**
   * Включить отображение временной метки
   */
  showTimestamp?: boolean;
}

/**
 * Тип для данных логирования
 */
type LogData = unknown[];

/**
 * Тип для ошибки API
 */
interface ApiErrorData {
  url?: string;
  method?: string;
  status?: number;
  message?: string;
  data?: unknown;
}

/**
 * Сервис для логирования
 * Предоставляет унифицированный интерфейс для логирования в приложении
 */
class LoggerService {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      enabledInProduction: false,
      minLevel: LogLevel.INFO,
      showTimestamp: true,
      ...options,
    };
  }

  /**
   * Проверяет, нужно ли логировать сообщение
   * @param level Уровень логирования
   * @returns true если нужно логировать, false если нет
   */
  private shouldLog(level: LogLevel): boolean {
    // Не логируем в production, если опция не включена
    if (IS_PROD && !this.options.enabledInProduction) {
      return false;
    }

    // Логируем только сообщения с уровнем не ниже минимального
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minLevelIndex = levels.indexOf(this.options.minLevel || LogLevel.INFO);
    const currentLevelIndex = levels.indexOf(level);

    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Форматирует сообщение для логирования
   * @param level Уровень логирования
   * @param message Сообщение
   * @returns Отформатированное сообщение
   */
  private formatMessage(level: LogLevel, message: string): string {
    if (!this.options.showTimestamp) {
      return `[${level.toUpperCase()}] ${message}`;
    }

    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * Логирование информационного сообщения
   * @param message Сообщение для логирования
   * @param data Дополнительные данные
   */
  info(message: string, ...data: LogData): void {
    if (!this.shouldLog(LogLevel.INFO)) {
      return;
    }

    // eslint-disable-next-line no-console
    console.info(this.formatMessage(LogLevel.INFO, message), ...data);
  }

  /**
   * Логирование отладочного сообщения
   * @param message Сообщение для логирования
   * @param data Дополнительные данные
   */
  debug(message: string, ...data: LogData): void {
    if (!this.shouldLog(LogLevel.DEBUG)) {
      return;
    }

    // eslint-disable-next-line no-console
    console.debug(this.formatMessage(LogLevel.DEBUG, message), ...data);
  }

  /**
   * Логирование предупреждения
   * @param message Сообщение для логирования
   * @param data Дополнительные данные
   */
  warn(message: string, ...data: LogData): void {
    if (!this.shouldLog(LogLevel.WARN)) {
      return;
    }

    console.warn(this.formatMessage(LogLevel.WARN, message), ...data);
  }

  /**
   * Логирование ошибки
   * @param message Сообщение для логирования
   * @param data Дополнительные данные
   */
  error(message: string, ...data: LogData): void {
    if (!this.shouldLog(LogLevel.ERROR)) {
      return;
    }

    console.error(this.formatMessage(LogLevel.ERROR, message), ...data);
  }

  /**
   * Логирование ошибки API
   * @param error Объект ошибки
   * @param context Контекст, в котором произошла ошибка
   */
  apiError(error: unknown, context: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) {
      return;
    }

    const errorData: ApiErrorData = {};

    // Собираем информацию об ошибке
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;

      if (errorObj.config) {
        const config = errorObj.config as Record<string, unknown>;
        errorData.url = config.url as string;
        errorData.method = config.method as string;
      }

      if (errorObj.response) {
        const response = errorObj.response as Record<string, unknown>;
        errorData.status = response.status as number;
        errorData.data = response.data;
      }

      if (errorObj.message) {
        errorData.message = errorObj.message as string;
      }
    }

    console.error(this.formatMessage(LogLevel.ERROR, `API Error [${context}]`), errorData);
  }

  /**
   * Создает группу сообщений в консоли
   * @param name Название группы
   * @param fn Функция, в которой будут логи группы
   */
  group(name: string, fn: () => void): void {
    if (!IS_DEV) {
      fn();
      return;
    }

    // eslint-disable-next-line no-console
    console.group(name);
    try {
      fn();
    } finally {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  /**
   * Измеряет время выполнения функции
   * @param label Метка для логирования
   * @param fn Функция для измерения
   * @returns Результат выполнения функции
   */
  time<T>(label: string, fn: () => T): T {
    if (!IS_DEV) {
      return fn();
    }

    // eslint-disable-next-line no-console
    console.time(label);
    try {
      return fn();
    } finally {
      // eslint-disable-next-line no-console
      console.timeEnd(label);
    }
  }

  /**
   * Измеряет время выполнения асинхронной функции
   * @param label Метка для логирования
   * @param fn Асинхронная функция для измерения
   * @returns Promise с результатом выполнения функции
   */
  async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!IS_DEV) {
      return fn();
    }

    // eslint-disable-next-line no-console
    console.time(label);
    try {
      return await fn();
    } finally {
      // eslint-disable-next-line no-console
      console.timeEnd(label);
    }
  }
}

// Создаем и экспортируем экземпляр логгера по-умолчанию
export const logger = new LoggerService({
  enabledInProduction: false,
  minLevel: IS_DEV ? LogLevel.DEBUG : LogLevel.INFO,
});

export default logger;
