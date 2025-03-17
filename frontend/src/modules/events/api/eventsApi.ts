import { CreateEventData, UpdateEventData, EventFilters, BookingData } from '../types';

import { apiService } from '@/services/api';

/**
 * API для работы с событиями
 */
export const eventsApi = {
  /**
   * Получение всех событий с возможностью фильтрации
   * @param filters - фильтры для событий
   */
  getEvents: (filters?: EventFilters) => {
    return apiService.get('/events', { params: filters });
  },

  /**
   * Получение избранных событий для главной страницы
   * @param limit - максимальное количество событий
   */
  getFeaturedEvents: (limit = 3) => {
    return apiService.get('/events/featured', { params: { limit } });
  },

  /**
   * Получение события по ID
   * @param id - идентификатор события
   */
  getEvent: (id: string) => {
    return apiService.get(`/events/${id}`);
  },

  /**
   * Создание нового события
   * @param eventData - данные события
   */
  createEvent: (eventData: CreateEventData) => {
    return apiService.post('/events', eventData);
  },

  /**
   * Обновление события
   * @param id - идентификатор события
   * @param eventData - данные для обновления
   */
  updateEvent: (id: string, eventData: UpdateEventData) => {
    return apiService.put(`/events/${id}`, eventData);
  },

  /**
   * Удаление события
   * @param id - идентификатор события
   */
  deleteEvent: (id: string) => {
    return apiService.delete(`/events/${id}`);
  },

  /**
   * Публикация события
   * @param id - идентификатор события
   */
  publishEvent: (id: string) => {
    return apiService.put(`/events/${id}/publish`);
  },

  /**
   * Отмена события
   * @param id - идентификатор события
   */
  cancelEvent: (id: string) => {
    return apiService.put(`/events/${id}/cancel`);
  },

  /**
   * Бронирование места на событии
   * @param bookingData - данные бронирования
   */
  bookEvent: (bookingData: BookingData) => {
    return apiService.post('/bookings', bookingData);
  },

  /**
   * Получение бронирований пользователя
   * @param userId - идентификатор пользователя
   */
  getUserBookings: (userId: string) => {
    return apiService.get(`/users/${userId}/bookings`);
  },

  /**
   * Отмена бронирования
   * @param bookingId - идентификатор бронирования
   */
  cancelBooking: (bookingId: string) => {
    return apiService.delete(`/bookings/${bookingId}`);
  },
};
