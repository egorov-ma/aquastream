/**
 * Типы для модуля событий
 */

import { ApiError } from '@/shared/types/api';

/**
 * Статусы событий
 */
export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}

/**
 * Типы событий
 */
export enum EventType {
  RAFTING = 'rafting',
  KAYAKING = 'kayaking',
  CANOEING = 'canoeing',
  SUP = 'sup',
  OTHER = 'other',
}

/**
 * Интерфейс местоположения события
 */
export interface EventLocation {
  city: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Интерфейс участника события
 */
export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  registeredAt: string;
}

/**
 * Интерфейс события
 */
export interface Event {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  startDate: string;
  endDate?: string;
  location?: EventLocation;
  type: EventType;
  status: EventStatus;
  maxParticipants?: number;
  currentParticipants: number;
  price?: number;
  coverImage?: string;
  gallery?: string[];
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Фильтры для событий
 */
export interface EventFilters {
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  sort?: string;
}

/**
 * Данные для создания события
 */
export interface CreateEventData {
  title: string;
  description?: string;
  shortDescription?: string;
  startDate: string;
  endDate?: string;
  location?: EventLocation;
  type: EventType;
  maxParticipants?: number;
  price?: number;
  coverImage?: string;
  gallery?: string[];
}

/**
 * Данные для обновления события
 */
export interface UpdateEventData {
  title?: string;
  description?: string;
  shortDescription?: string;
  startDate?: string;
  endDate?: string;
  location?: EventLocation;
  type?: EventType;
  status?: EventStatus;
  maxParticipants?: number;
  price?: number;
  coverImage?: string;
  gallery?: string[];
}

/**
 * Состояние событий в хранилище
 */
export interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}

export interface BookingData {
  eventId: string;
  userId: string;
  numberOfSpots: number;
  additionalInfo?: string;
}

/**
 * Тип для ошибок API событий
 */
export interface EventsError extends ApiError {}
