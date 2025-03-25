/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateEventRequest } from '../models/CreateEventRequest';
import type { EventDto } from '../models/EventDto';
import type { EventResponse } from '../models/EventResponse';
import type { UpdateEventRequest } from '../models/UpdateEventRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EventsService {
  /**
   * Получение списка событий
   * @returns EventResponse Успешный ответ
   * @throws ApiError
   */
  public static getEvents({
    type,
    upcoming,
  }: {
    /**
     * Тип события
     */
    type?: string;
    /**
     * Только предстоящие события
     */
    upcoming?: boolean;
  }): CancelablePromise<EventResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/events',
      query: {
        type: type,
        upcoming: upcoming,
      },
    });
  }
  /**
   * Создание нового события
   * @returns EventDto Событие создано
   * @throws ApiError
   */
  public static createEvent({
    requestBody,
  }: {
    /**
     * Данные события
     */
    requestBody: CreateEventRequest;
  }): CancelablePromise<EventDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/events',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Неверный запрос`,
      },
    });
  }
  /**
   * Получение события по ID
   * @returns EventDto Успешный ответ
   * @throws ApiError
   */
  public static getEventById({
    id,
  }: {
    /**
     * ID события
     */
    id: string;
  }): CancelablePromise<EventDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/events/{id}',
      path: {
        id: id,
      },
      errors: {
        404: `Событие не найдено`,
      },
    });
  }
  /**
   * Обновление события
   * @returns EventDto Событие обновлено
   * @throws ApiError
   */
  public static updateEvent({
    id,
    requestBody,
  }: {
    /**
     * ID события
     */
    id: string;
    /**
     * Данные для обновления
     */
    requestBody: UpdateEventRequest;
  }): CancelablePromise<EventDto> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/events/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        404: `Событие не найдено`,
      },
    });
  }
  /**
   * Удаление события
   * @returns void
   * @throws ApiError
   */
  public static deleteEvent({
    id,
  }: {
    /**
     * ID события
     */
    id: string;
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/events/{id}',
      path: {
        id: id,
      },
      errors: {
        404: `Событие не найдено`,
      },
    });
  }
}
