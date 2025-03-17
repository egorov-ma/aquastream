/**
 * Общие типы для работы с API
 */

/**
 * Базовый интерфейс для API-ответа
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Базовый интерфейс для API-ошибки
 */
export interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}

/**
 * Базовый интерфейс для параметров API-запроса с пагинацией
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Базовый интерфейс для ответа API с пагинацией
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
