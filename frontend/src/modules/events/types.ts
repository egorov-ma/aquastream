// Типы для модуля событий

// Перечисление типов событий
export enum EventType {
  RAFTING = 'Сплав',
  KAYAKING = 'Каякинг',
  SUP = 'Сап-борд',
  DIVING = 'Дайвинг',
  SURFING = 'Серфинг',
  SAILING = 'Парусный спорт',
  OTHER = 'Другое',
}

// Перечисление статусов событий
export enum EventStatus {
  DRAFT = 'draft',
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PUBLISHED = 'published',
}

// Интерфейс для организатора события
export interface EventOrganizer {
  id: string;
  name: string;
  email: string;
}

// Интерфейс для локации события
export interface EventLocation {
  city: string;
  address: string;
}

// Интерфейс для события
export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  imageUrl?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  location: string | EventLocation;
  price: number;
  capacity: number;
  maxParticipants?: number;
  currentParticipants: number;
  organizer: EventOrganizer;
  organizerId?: string;
  difficulty: string;
  type: string;
  tags: string[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// Интерфейс для создания нового события
export interface CreateEventData {
  title: string;
  description: string;
  shortDescription?: string;
  imageUrl?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  location: string | EventLocation;
  price: number;
  capacity: number;
  maxParticipants?: number;
  organizer?: EventOrganizer;
  organizerId?: string;
  difficulty: string;
  type: string;
  tags?: string[];
}

// Интерфейс для обновления события
export type UpdateEventData = Partial<CreateEventData>;

// Интерфейс для фильтрации событий
export interface EventFilters {
  type?: string;
  difficulty?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  status?: string;
  search?: string;
  limit?: number;
}

// Интерфейс для бронирования события
export interface BookingData {
  eventId: string;
  userId: string;
  participants: number;
  comment?: string;
}

// Интерфейс для состояния событий в хранилище
export interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}
