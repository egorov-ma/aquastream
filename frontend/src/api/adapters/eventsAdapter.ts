/**
 * Адаптер для преобразования между интерфейсами событий и сгенерированными моделями API
 */

import { CreateEventRequest } from '../generated/models/CreateEventRequest';
import { EventDto } from '../generated/models/EventDto';
import { UpdateEventRequest } from '../generated/models/UpdateEventRequest';

import { Event, EventFilters, CreateEventData, UpdateEventData } from '@/modules/events/types';

/**
 * Параметры фильтрации для API событий
 */
export interface EventFilterParams {
  type?: string;
  upcoming?: boolean;
  limit?: number;
  search?: string;
  // Добавьте другие параметры по мере необходимости
}

/**
 * Преобразование API Event объекта в Event приложения
 */
export function apiToEvent(apiEvent: EventDto): Event {
  return {
    id: apiEvent.id || '',
    title: apiEvent.title || '',
    description: apiEvent.description || '',
    shortDescription: apiEvent.shortDescription || '',
    imageUrl: apiEvent.imageUrl || '',
    coverImage: apiEvent.coverImage || '',
    startDate: apiEvent.startDate || '',
    endDate: apiEvent.endDate || '',
    location: apiEvent.location || '',
    price: apiEvent.price || 0,
    capacity: apiEvent.capacity || 0,
    maxParticipants: apiEvent.capacity || 0,
    currentParticipants: apiEvent.currentParticipants || 0,
    organizer: {
      id: apiEvent.organizerId || '',
      name: apiEvent.organizer?.username || 'Unknown',
      email: apiEvent.organizer?.email || '',
    },
    organizerId: apiEvent.organizerId || '',
    difficulty: apiEvent.difficulty?.toString() || '',
    type: apiEvent.type?.toString() || '',
    tags: apiEvent.tags || [],
    status: apiEvent.status?.toString() || '',
    createdAt: apiEvent.createdAt || '',
    updatedAt: apiEvent.updatedAt || '',
  };
}

/**
 * Преобразование массива API Event объектов в массив Event приложения
 */
export function apiToEvents(apiEvents: EventDto[]): Event[] {
  return apiEvents.map(apiToEvent);
}

/**
 * Преобразование фильтров Event приложения в параметры API запроса
 */
export function filtersToApiParams(filters?: EventFilters): EventFilterParams {
  if (!filters) return {};

  return {
    type: filters.type,
    upcoming: filters.upcoming,
    limit: filters.limit,
    search: filters.search,
    // Добавьте другие необходимые параметры по мере необходимости
  };
}

/**
 * Преобразование данных создания Event приложения в API запрос
 */
export function createEventToApi(eventData: CreateEventData): CreateEventRequest {
  return {
    title: eventData.title,
    description: eventData.description,
    shortDescription: eventData.shortDescription,
    imageUrl: eventData.imageUrl,
    coverImage: eventData.coverImage,
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    location:
      typeof eventData.location === 'string'
        ? eventData.location
        : JSON.stringify(eventData.location),
    price: eventData.price,
    capacity: eventData.capacity,
    difficulty: eventData.difficulty as CreateEventRequest.difficulty,
    type: eventData.type as CreateEventRequest.type,
    tags: eventData.tags || [],
  };
}

/**
 * Преобразование данных обновления Event приложения в API запрос
 */
export function updateEventToApi(eventData: UpdateEventData): UpdateEventRequest {
  const result: UpdateEventRequest = {};

  if (eventData.title !== undefined) result.title = eventData.title;
  if (eventData.description !== undefined) result.description = eventData.description;
  if (eventData.shortDescription !== undefined)
    result.shortDescription = eventData.shortDescription;
  if (eventData.startDate !== undefined) result.startDate = eventData.startDate;
  if (eventData.endDate !== undefined) result.endDate = eventData.endDate;

  if (eventData.location !== undefined) {
    result.location =
      typeof eventData.location === 'string'
        ? eventData.location
        : JSON.stringify(eventData.location);
  }

  if (eventData.price !== undefined) result.price = eventData.price;
  if (eventData.capacity !== undefined) result.capacity = eventData.capacity;
  if (eventData.difficulty !== undefined)
    result.difficulty = eventData.difficulty as CreateEventRequest.difficulty;
  if (eventData.type !== undefined) result.type = eventData.type as CreateEventRequest.type;
  if (eventData.tags !== undefined) result.tags = eventData.tags;
  if (eventData.imageUrl !== undefined) result.imageUrl = eventData.imageUrl;
  if (eventData.coverImage !== undefined) result.coverImage = eventData.coverImage;

  return result;
}
