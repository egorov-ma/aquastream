import axios from 'axios';
import { API_URL } from '@/config';
import { 
  CreateEventData, 
  UpdateEventData, 
  EventFilters, 
  BookingData 
} from '../types';

// Создаем инстанс axios с общей конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * API для работы с событиями
 */
export const eventsApi = {
  /**
   * Получение всех событий с возможностью фильтрации
   * @param filters - фильтры для событий
   */
  getEvents: (filters?: EventFilters) => {
    return api.get('/events', { params: filters });
  },

  /**
   * Получение избранных событий для главной страницы
   * @param limit - максимальное количество событий
   */
  getFeaturedEvents: (limit = 3) => {
    return api.get('/events/featured', { params: { limit } });
  },

  /**
   * Получение события по ID
   * @param id - идентификатор события
   */
  getEvent: (id: string) => {
    return api.get(`/events/${id}`);
  },

  /**
   * Создание нового события
   * @param eventData - данные события
   */
  createEvent: (eventData: CreateEventData) => {
    return api.post('/events', eventData);
  },

  /**
   * Обновление события
   * @param id - идентификатор события
   * @param eventData - данные для обновления
   */
  updateEvent: (id: string, eventData: UpdateEventData) => {
    return api.put(`/events/${id}`, eventData);
  },

  /**
   * Удаление события
   * @param id - идентификатор события
   */
  deleteEvent: (id: string) => {
    return api.delete(`/events/${id}`);
  },

  /**
   * Публикация события
   * @param id - идентификатор события
   */
  publishEvent: (id: string) => {
    return api.put(`/events/${id}/publish`);
  },

  /**
   * Отмена события
   * @param id - идентификатор события
   */
  cancelEvent: (id: string) => {
    return api.put(`/events/${id}/cancel`);
  },

  /**
   * Бронирование места на событии
   * @param bookingData - данные бронирования
   */
  bookEvent: (bookingData: BookingData) => {
    return api.post('/bookings', bookingData);
  },

  /**
   * Получение бронирований пользователя
   * @param userId - идентификатор пользователя
   */
  getUserBookings: (userId: string) => {
    return api.get(`/users/${userId}/bookings`);
  },

  /**
   * Отмена бронирования
   * @param bookingId - идентификатор бронирования
   */
  cancelBooking: (bookingId: string) => {
    return api.delete(`/bookings/${bookingId}`);
  }
}; 