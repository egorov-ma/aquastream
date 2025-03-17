import { User, Event, TeamMember, ContactInfo, FAQ, Feedback } from './models';

/**
 * Типы для Redux store
 */

// Стейт авторизации
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Стейт событий
export interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}

// Стейт команды
export interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
}

// Стейт контактов
export interface ContactsState {
  contactInfo: ContactInfo | null;
  isLoading: boolean;
  error: string | null;
}

// Стейт профиля
export interface ProfileState {
  participations: {
    upcoming: Event[];
    past: Event[];
  };
  feedback: Feedback[];
  isLoading: boolean;
  error: string | null;
}

// Стейт для участников
export interface ParticipantState {
  faqs: FAQ[];
  isLoading: boolean;
  error: string | null;
}

// Объединенный стейт приложения
export interface RootState {
  auth: AuthState;
  events: EventsState;
  team: TeamState;
  contacts: ContactsState;
  profile: ProfileState;
  participant: ParticipantState;
} 