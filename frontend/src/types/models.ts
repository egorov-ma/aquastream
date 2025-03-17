/**
 * Модели данных приложения
 */

/**
 * Роли пользователей
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ORGANIZER = 'ORGANIZER',
  GUEST = 'GUEST',
}

/**
 * Модель пользователя
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Модель события (сплава)
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  difficulty: EventDifficulty;
  type: EventType;
  status: EventStatus;
  organizerId: string;
  organizer?: User;
  createdAt: string;
  updatedAt: string;
}

/**
 * Сложность события
 */
export enum EventDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXTREME = 'EXTREME',
}

/**
 * Тип события
 */
export enum EventType {
  KAYAKING = 'KAYAKING',
  RAFTING = 'RAFTING',
  SAILING = 'SAILING',
  CANOEING = 'CANOEING',
  OTHER = 'OTHER',
}

/**
 * Статус события
 */
export enum EventStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Модель участия в событии
 */
export interface Participation {
  id: string;
  userId: string;
  eventId: string;
  status: ParticipationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  event?: Event;
}

/**
 * Статус участия
 */
export enum ParticipationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

/**
 * Статус оплаты
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  imageUrl?: string;
  socialLinks?: {
    vk?: string;
    instagram?: string;
    facebook?: string;
    telegram?: string;
  };
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  socialLinks?: {
    vk?: string;
    instagram?: string;
    facebook?: string;
    telegram?: string;
  };
  mapCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  eventId?: string;
  eventTitle?: string;
  rating: number;
  text: string;
  date: string;
  imageUrl?: string;
}
