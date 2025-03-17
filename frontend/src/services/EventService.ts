import { apiService } from './api';

import { Event, EventStatus } from '@/types/event';

/**
 * Сервис для работы с API событий
 */
export class EventService {
  /**
   * Получить список событий с возможностью фильтрации
   * @param params - параметры запроса
   * @returns Promise с ответом от API
   */
  static async getEvents(params?: { status?: EventStatus; limit?: number; page?: number }) {
    return apiService.get('/events', { params });
  }

  /**
   * Получить событие по ID
   * @param id - идентификатор события
   * @returns Promise с ответом от API
   */
  static async getEventById(id: string) {
    return apiService.get(`/events/${id}`);
  }

  /**
   * Создать новое событие
   * @param eventData - данные события
   * @returns Promise с ответом от API
   */
  static async createEvent(eventData: Partial<Event>) {
    return apiService.post('/events', eventData);
  }

  /**
   * Обновить существующее событие
   * @param id - идентификатор события
   * @param eventData - данные для обновления
   * @returns Promise с ответом от API
   */
  static async updateEvent(id: string, eventData: Partial<Event>) {
    return apiService.put(`/events/${id}`, eventData);
  }

  /**
   * Удалить событие
   * @param id - идентификатор события
   * @returns Promise с ответом от API
   */
  static async deleteEvent(id: string) {
    return apiService.delete(`/events/${id}`);
  }

  /**
   * Зарегистрироваться на событие
   * @param eventId - идентификатор события
   * @returns Promise с ответом от API
   */
  static async registerForEvent(eventId: string) {
    return apiService.post(`/events/${eventId}/register`);
  }

  /**
   * Отменить регистрацию на событие
   * @param eventId - идентификатор события
   * @returns Promise с ответом от API
   */
  static async cancelRegistration(eventId: string) {
    return apiService.delete(`/events/${eventId}/register`);
  }

  /**
   * Получить список участников события
   * @param eventId - идентификатор события
   * @returns Promise с ответом от API
   */
  static async getEventParticipants(eventId: string) {
    return apiService.get(`/events/${eventId}/participants`);
  }
}
