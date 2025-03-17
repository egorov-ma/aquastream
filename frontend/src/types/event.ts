/**
 * Статус события
 */
export enum EventStatus {
  DRAFT = 'DRAFT', // Черновик
  PUBLISHED = 'PUBLISHED', // Опубликовано
  CANCELED = 'CANCELED', // Отменено
  COMPLETED = 'COMPLETED', // Завершено
}

/**
 * Тип события
 */
export enum EventType {
  ONLINE = 'ONLINE', // Онлайн
  OFFLINE = 'OFFLINE', // Оффлайн
  HYBRID = 'HYBRID', // Гибридный формат
}

/**
 * Категория события
 */
export interface EventCategory {
  id: string;
  name: string;
  description?: string;
}

/**
 * Место проведения события
 */
export interface EventLocation {
  address: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  venueDetails?: string;
}

/**
 * Участник события
 */
export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  registrationDate: string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELED';
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

/**
 * Интерфейс события
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: EventStatus;
  type: EventType;
  location?: EventLocation;
  onlineUrl?: string;
  categoryId?: string;
  category?: EventCategory;
  organizerId: string;
  organizer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  coverImage?: string;
  price?: number;
  currency?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  participants?: EventParticipant[];
  isRegistered?: boolean;
}
