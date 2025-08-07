import { Event, EventFilters, CreateEventData, UpdateEventData, BookingData } from '../types';

import {
  apiToEvent,
  apiToEvents,
  createEventToApi,
  filtersToApiParams,
  updateEventToApi,
} from '@/api/adapters/eventsAdapter';
import { apiService, logger } from '@/services';
import { ApiResponse } from '@/shared/types/api';
import { EventDto } from '@/api/generated/models/EventDto';

/**
 * API для работы с событиями
 * Адаптирует сгенерированный API-клиент для существующих типов в приложении
 */
export const eventsApi = {
  /**
   * Получение списка событий с возможностью фильтрации
   * @param filters - фильтры для событий
   * @returns Promise с ответом от API
   */
  getEvents: async (filters?: EventFilters) => {
    logger.debug('Getting events list', { filters });

    try {
      const params = filtersToApiParams(filters);
      const response = await apiService.get<ApiResponse<EventDto[]>>('/events', {
        params,
      });

      const events = apiToEvents(response.data.data || []);

      return { ...response, data: { ...response.data, data: events } };
    } catch (error) {
      logger.error('Error getting events', error);
      throw error;
    }
  },

  /**
   * Получение избранных событий для главной страницы
   * @param limit - максимальное количество событий
   * @returns Promise с ответом от API
   */
  getFeaturedEvents: async (limit = 3) => {
    logger.debug('Getting featured events', { limit });

    try {
      const response = await apiService.get<ApiResponse<EventDto[]>>('/events');

      const events = apiToEvents(response.data.data || []);
      const featuredEvents = events.slice(0, limit);

      return { ...response, data: { ...response.data, data: featuredEvents } };
    } catch (error) {
      logger.error('Error getting featured events', error);
      throw error;
    }
  },

  /**
   * Получение события по ID
   * @param id - идентификатор события
   * @returns Promise с ответом от API
   */
  getEventById: async (id: string) => {
    logger.debug('Getting event by ID', { id });

    try {
      const response = await apiService.get<ApiResponse<EventDto>>(`/events/${id}`);
      const event = apiToEvent(response.data.data as EventDto);

      return { ...response, data: { ...response.data, data: event } };
    } catch (error) {
      logger.error('Error getting event by ID', error);
      throw error;
    }
  },

  /**
   * Создание нового события
   * @param eventData - данные для создания события
   * @returns Promise с ответом от API
   */
  createEvent: async (eventData: CreateEventData) => {
    logger.debug('Creating new event', eventData);

    try {
      const apiEventData = createEventToApi(eventData);
      const response = await apiService.post<ApiResponse<EventDto>>('/events', apiEventData);
      const event = apiToEvent(response.data.data as EventDto);

      return { ...response, data: { ...response.data, data: event } };
    } catch (error) {
      logger.error('Error creating event', error);
      throw error;
    }
  },

  /**
   * Обновление события
   * @param id - идентификатор события
   * @param eventData - данные для обновления
   * @returns Promise с ответом от API
   */
  updateEvent: async (id: string, eventData: UpdateEventData) => {
    logger.debug('Updating event', { id, eventData });

    try {
      const apiEventData = updateEventToApi(eventData);
      const response = await apiService.put<ApiResponse<EventDto>>(`/events/${id}`, apiEventData);
      const event = apiToEvent(response.data.data as EventDto);

      return { ...response, data: { ...response.data, data: event } };
    } catch (error) {
      logger.error('Error updating event', error);
      throw error;
    }
  },

  /**
   * Удаление события
   * @param id - идентификатор события
   * @returns Promise с ответом от API
   */
  deleteEvent: async (id: string) => {
    logger.debug('Deleting event', { id });

    try {
      const response = await apiService.delete<ApiResponse<void>>(`/events/${id}`);
      return response;
    } catch (error) {
      logger.error('Error deleting event', error);
      throw error;
    }
  },

  /**
   * Публикация события
   * @param id - идентификатор события
   * @returns Promise с ответом от API
   */
  publishEvent: async (id: string) => {
    logger.debug('Publishing event', { id });
    const response = await apiService.put<ApiResponse<EventDto>>(`/events/${id}/publish`);
    const event = apiToEvent(response.data.data as EventDto);
    return { ...response, data: event };
  },

  /**
   * Отмена события
   * @param id - идентификатор события
   * @returns Promise с ответом от API
   */
  cancelEvent: async (id: string) => {
    logger.debug('Canceling event', { id });
    const response = await apiService.put<ApiResponse<EventDto>>(`/events/${id}/cancel`);
    const event = apiToEvent(response.data.data as EventDto);
    return { ...response, data: event };
  },

  /**
   * Регистрация на событие
   * @param eventId - идентификатор события
   * @returns Promise с ответом от API
   */
  registerForEvent: async (eventId: string) => {
    logger.debug('Registering for event', { eventId });
    const response = await apiService.post<ApiResponse<EventDto>>(`/events/${eventId}/register`);
    const event = apiToEvent(response.data.data as EventDto);
    return { ...response, data: event };
  },

  /**
   * Отмена регистрации на событие
   * @param eventId - идентификатор события
   * @returns Promise с ответом от API
   */
  cancelRegistration: async (eventId: string) => {
    logger.debug('Canceling registration', { eventId });
    const response = await apiService.delete<ApiResponse<EventDto>>(`/events/${eventId}/register`);
    const event = apiToEvent(response.data.data as EventDto);
    return { ...response, data: event };
  },

  /**
   * Получение списка участников события
   * @param eventId - идентификатор события
   * @returns Promise с ответом от API
   */
  getEventParticipants: (eventId: string) => {
    logger.debug('Getting event participants', { eventId });
    return apiService.get<ApiResponse<unknown[]>>(`/events/${eventId}/participants`);
  },

  /**
   * Бронирование места на событии
   * @param eventId - идентификатор события
   * @param bookingData - данные бронирования
   * @returns Promise с ответом от API
   */
  bookEvent: (eventId: string, bookingData: BookingData) => {
    logger.debug('Booking event', { eventId, bookingData });
    // Безопасное преобразование типа через unknown
    const bookingDataObj = JSON.parse(JSON.stringify(bookingData)) as Record<string, unknown>;
    return apiService.post<ApiResponse<unknown>>(`/events/${eventId}/book`, bookingDataObj);
  },

  /**
   * Получение бронирований пользователя
   * @param userId - идентификатор пользователя
   * @returns Promise с ответом от API
   */
  getUserBookings: (userId: string) => {
    logger.debug('Getting user bookings', { userId });
    return apiService.get<ApiResponse<unknown[]>>(`/users/${userId}/bookings`);
  },

  /**
   * Отмена бронирования
   * @param bookingId - идентификатор бронирования
   * @returns Promise с ответом от API
   */
  cancelBooking: (bookingId: string) => {
    logger.debug('Canceling booking', { bookingId });
    return apiService.delete<ApiResponse<unknown>>(`/bookings/${bookingId}`);
  },
};
