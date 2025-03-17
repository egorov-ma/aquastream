/**
 * Модели данных приложения
 */

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  organizerId: string;
  status: EventStatus;
  participants: string[];
  price?: number;
  maxParticipants?: number;
  difficulty?: EventDifficulty;
  createdAt: string;
  updatedAt: string;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum EventDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
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

export interface Participation {
  id: string;
  userId: string;
  eventId: string;
  status: ParticipationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export enum ParticipationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
} 