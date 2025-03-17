import { apiService } from './api';

import {
  Event,
  EventFilters,
  CreateEventData,
  UpdateEventData,
  EventStatus,
} from '@/modules/events/types';
import { ApiResponse } from '@/shared/types/api';

// Моковые данные для событий
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Сплав по реке Волга',
    description: 'Трехдневное путешествие по живописным местам реки Волги',
    shortDescription: 'Трехдневное путешествие по Волге',
    imageUrl: 'https://example.com/volga.jpg',
    coverImage: '/images/events/rafting1.jpg',
    startDate: new Date('2023-06-10').toISOString(),
    endDate: new Date('2023-06-13').toISOString(),
    location: {
      city: 'Тверская область',
      address: 'Берег реки Волга',
    },
    price: 12000,
    capacity: 15,
    currentParticipants: 8,
    organizer: {
      id: '101',
      name: 'Михаил Водный',
      email: 'mihail@aquastream.ru',
    },
    difficulty: 'Средний',
    type: 'Сплав',
    tags: ['Рафтинг', 'Активный отдых', 'Природа'],
    status: EventStatus.PUBLISHED,
  },
  {
    id: '2',
    title: 'Дайвинг в Чёрном море',
    description: 'Погружение с инструктором к затонувшим кораблям времён Второй мировой войны',
    shortDescription: 'Погружение к затонувшим кораблям',
    imageUrl: 'https://example.com/diving.jpg',
    coverImage: '/images/events/diving1.jpg',
    startDate: new Date('2023-07-05').toISOString(),
    endDate: new Date('2023-07-07').toISOString(),
    location: {
      city: 'Крым',
      address: 'Балаклава',
    },
    price: 18000,
    capacity: 10,
    currentParticipants: 6,
    organizer: {
      id: '102',
      name: 'Елена Морская',
      email: 'elena@aquastream.ru',
    },
    difficulty: 'Продвинутый',
    type: 'Дайвинг',
    tags: ['Подводное плавание', 'Морская фауна', 'История'],
    status: EventStatus.PUBLISHED,
  },
  {
    id: '3',
    title: 'Серфинг на Балтике',
    description: 'Интенсивный курс серфинга для новичков на побережье Балтийского моря',
    shortDescription: 'Курс серфинга для новичков',
    imageUrl: 'https://example.com/surfing.jpg',
    coverImage: '/images/events/surfing1.jpg',
    startDate: new Date('2023-08-15').toISOString(),
    endDate: new Date('2023-08-20').toISOString(),
    location: {
      city: 'Калининградская область',
      address: 'Зеленоградск',
    },
    price: 15000,
    capacity: 12,
    currentParticipants: 3,
    organizer: {
      id: '103',
      name: 'Алексей Волнов',
      email: 'alexey@aquastream.ru',
    },
    difficulty: 'Начинающий',
    type: 'Серфинг',
    tags: ['Волны', 'Обучение', 'Балтийское море'],
    status: EventStatus.PUBLISHED,
  },
];

/**
 * API для работы с событиями
 */
export const eventsApi = {
  /**
   * Получение списка событий
   * @param filters Фильтры для событий
   */
  getEvents: (filters?: EventFilters) => {
    return apiService.get<ApiResponse<Event[]>>('/events', { params: filters });
  },

  /**
   * Получение избранных событий
   * @param limit Ограничение количества событий
   */
  getFeaturedEvents: (limit?: number) => {
    return apiService.get<ApiResponse<Event[]>>('/events/featured', { params: { limit } });
  },

  /**
   * Получение события по ID
   * @param id ID события
   */
  getEventById: (id: string) => {
    return apiService.get<ApiResponse<Event>>(`/events/${id}`);
  },

  /**
   * Создание нового события
   * @param eventData Данные для создания события
   */
  createEvent: (eventData: CreateEventData) => {
    return apiService.post<ApiResponse<Event>, CreateEventData>('/events', eventData);
  },

  /**
   * Обновление события
   * @param id ID события
   * @param eventData Данные для обновления события
   */
  updateEvent: (id: string, eventData: UpdateEventData) => {
    return apiService.put<ApiResponse<Event>, UpdateEventData>(`/events/${id}`, eventData);
  },

  /**
   * Удаление события
   * @param id ID события
   */
  deleteEvent: (id: string) => {
    return apiService.delete<ApiResponse<null>>(`/events/${id}`);
  },

  /**
   * Регистрация на событие
   * @param eventId ID события
   */
  registerForEvent: (eventId: string) => {
    return apiService.post<ApiResponse<Event>>(`/events/${eventId}/register`);
  },

  /**
   * Отмена регистрации на событие
   * @param eventId ID события
   */
  cancelRegistration: (eventId: string) => {
    return apiService.delete<ApiResponse<Event>>(`/events/${eventId}/register`);
  },

  /**
   * Получение списка участников события
   * @param eventId ID события
   * @returns Promise со списком участников
   */
  async getEventParticipants(eventId: string) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const event = mockEvents.find((event) => event.id === eventId);

    if (!event) {
      throw new Error('Событие не найдено');
    }

    // Здесь в реальном приложении будет запрос за участниками
    const mockParticipants = Array.from({ length: event.currentParticipants }).map((_, index) => ({
      id: `participant-${eventId}-${index}`,
      userId: `user-${index}`,
      eventId,
      status: 'confirmed',
      registeredAt: new Date().toISOString(),
    }));

    return { data: mockParticipants };
  },

  /**
   * Бронирование места на событие
   * @param eventId ID события
   * @param userId ID пользователя
   * @param participants Количество бронируемых мест
   * @returns Promise с данными бронирования
   */
  async bookEvent(eventId: string, userId: string, participants: number) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const eventIndex = mockEvents.findIndex((event) => event.id === eventId);

    if (eventIndex === -1) {
      throw new Error('Событие не найдено');
    }

    const event = mockEvents[eventIndex];

    if (event.currentParticipants + participants > event.capacity) {
      throw new Error('Недостаточно мест для бронирования');
    }

    const updatedEvent = {
      ...event,
      currentParticipants: event.currentParticipants + participants,
    };

    mockEvents[eventIndex] = updatedEvent;

    return {
      data: {
        event: updatedEvent,
        booking: {
          id: Math.floor(Math.random() * 1000).toString(),
          eventId,
          userId,
          participants,
          createdAt: new Date().toISOString(),
        },
      },
      message: 'Бронирование успешно создано',
    };
  },
};
