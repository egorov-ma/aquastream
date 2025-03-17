import axios from 'axios';
import { Event, EventStatus } from '@/types/event';
import { API_URL } from '@/config';

/**
 * Сервис для работы с API событий
 */
export class EventService {
  /**
   * Получить список событий с возможностью фильтрации
   * @param params - параметры запроса
   * @returns Promise с ответом от API
   */
  static async getEvents(params?: {
    status?: EventStatus;
    limit?: number;
    page?: number;
  }) {
    return axios.get(`${API_URL}/events`, { params });
  }

  /**
   * Получить событие по ID
   * @param id - идентификатор события
   * @returns Promise с ответом от API
   */
  static async getEventById(id: string) {
    return axios.get(`${API_URL}/events/${id}`);
  }

  /**
   * Создать новое событие
   * @param eventData - данные события
   * @returns Promise с ответом от API
   */
  static async createEvent(eventData: Partial<Event>) {
    return axios.post(`${API_URL}/events`, eventData);
  }

  /**
   * Обновить существующее событие
   * @param id - идентификатор события
   * @param eventData - данные для обновления
   * @returns Promise с ответом от API
   */
  static async updateEvent(id: string, eventData: Partial<Event>) {
    return axios.put(`${API_URL}/events/${id}`, eventData);
  }

  /**
   * Удалить событие
   * @param id - идентификатор события
   * @returns Promise с ответом от API
   */
  static async deleteEvent(id: string) {
    return axios.delete(`${API_URL}/events/${id}`);
  }

  /**
   * Зарегистрироваться на событие
   * @param eventId - идентификатор события
   * @returns Promise с ответом от API
   */
  static async registerForEvent(eventId: string) {
    return axios.post(`${API_URL}/events/${eventId}/register`);
  }

  /**
   * Отменить регистрацию на событие
   * @param eventId - идентификатор события
   * @returns Promise с ответом от API
   */
  static async cancelRegistration(eventId: string) {
    return axios.delete(`${API_URL}/events/${eventId}/register`);
  }

  /**
   * Получить список участников события
   * @param eventId - идентификатор события
   * @returns Promise с ответом от API
   */
  static async getEventParticipants(eventId: string) {
    return axios.get(`${API_URL}/events/${eventId}/participants`);
  }
}