import { describe, it, expect, vi } from 'vitest';

import eventsReducer, {
  clearCurrentEvent,
  fetchEvents,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  fetchFeaturedEvents,
} from '../store/eventsSlice';
import { EventsState } from '../types';

describe('eventsSlice', () => {
  const initialState: EventsState = {
    events: [],
    featuredEvents: [],
    currentEvent: null,
    isLoading: false,
    error: null,
  };

  // Моковые данные для событий
  const mockEvents = [
    {
      id: '1',
      title: 'Сплав по реке Быстрая',
      description: 'Описание сплава',
      shortDescription: 'Короткое описание',
      imageUrl: 'image.jpg',
      coverImage: 'cover.jpg',
      startDate: '2023-07-15',
      endDate: '2023-07-17',
      location: 'Река Быстрая',
      price: 5000,
      capacity: 20,
      maxParticipants: 20,
      currentParticipants: 5,
      organizer: {
        id: 'org-1',
        name: 'Организатор',
        email: 'org@example.com',
      },
      organizerId: 'org-1',
      difficulty: 'medium',
      type: 'rafting',
      tags: ['рафтинг', 'активный отдых'],
      status: 'published',
      createdAt: '2023-01-15',
      updatedAt: '2023-01-15',
    },
    {
      id: '2',
      title: 'Каякинг на озере Тихое',
      description: 'Описание каякинга',
      shortDescription: 'Короткое описание',
      imageUrl: 'image2.jpg',
      coverImage: 'cover2.jpg',
      startDate: '2023-08-10',
      endDate: '2023-08-12',
      location: 'Озеро Тихое',
      price: 3000,
      capacity: 15,
      maxParticipants: 15,
      currentParticipants: 3,
      organizer: {
        id: 'org-2',
        name: 'Организатор 2',
        email: 'org2@example.com',
      },
      organizerId: 'org-2',
      difficulty: 'easy',
      type: 'kayaking',
      tags: ['каякинг', 'озеро'],
      status: 'published',
      createdAt: '2023-02-20',
      updatedAt: '2023-02-20',
    },
  ];

  describe('reducer', () => {
    it('should return the initial state', () => {
      expect(eventsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearCurrentEvent', () => {
      // Создаем состояние с текущим событием
      const stateWithCurrentEvent = {
        ...initialState,
        currentEvent: mockEvents[0],
      };

      const action = clearCurrentEvent();
      const newState = eventsReducer(stateWithCurrentEvent, action);

      expect(newState.currentEvent).toBe(null);
    });
  });

  describe('async thunks', () => {
    describe('fetchEvents', () => {
      it('should handle fetchEvents.pending', () => {
        const action = { type: fetchEvents.pending.type };
        const newState = eventsReducer(initialState, action);

        expect(newState.isLoading).toBe(true);
        expect(newState.error).toBe(null);
      });

      it('should handle fetchEvents.fulfilled', () => {
        const action = {
          type: fetchEvents.fulfilled.type,
          payload: mockEvents,
        };
        const newState = eventsReducer(initialState, action);

        expect(newState.events).toEqual(mockEvents);
        expect(newState.isLoading).toBe(false);
      });

      it('should handle fetchEvents.rejected', () => {
        const errorMessage = 'Ошибка при загрузке событий';
        const action = {
          type: fetchEvents.rejected.type,
          payload: errorMessage,
        };
        const newState = eventsReducer(initialState, action);

        expect(newState.error).toBe(errorMessage);
        expect(newState.isLoading).toBe(false);
      });
    });

    describe('fetchFeaturedEvents', () => {
      it('should handle fetchFeaturedEvents.fulfilled', () => {
        const action = {
          type: fetchFeaturedEvents.fulfilled.type,
          payload: mockEvents,
        };
        const newState = eventsReducer(initialState, action);

        expect(newState.featuredEvents).toEqual(mockEvents);
        expect(newState.isLoading).toBe(false);
      });
    });

    describe('fetchEventById', () => {
      it('should handle fetchEventById.fulfilled', () => {
        const mockEvent = mockEvents[0];
        const action = {
          type: fetchEventById.fulfilled.type,
          payload: mockEvent,
        };
        const newState = eventsReducer(initialState, action);

        expect(newState.currentEvent).toEqual(mockEvent);
        expect(newState.isLoading).toBe(false);
      });
    });

    describe('createEvent', () => {
      it('should handle createEvent.fulfilled', () => {
        const newEvent = mockEvents[0];
        const action = {
          type: createEvent.fulfilled.type,
          payload: newEvent,
        };
        const newState = eventsReducer(initialState, action);

        expect(newState.events).toHaveLength(1);
        expect(newState.events[0]).toEqual(newEvent);
        expect(newState.isLoading).toBe(false);
      });
    });

    describe('updateEvent', () => {
      it('should handle updateEvent.fulfilled', () => {
        // Состояние с существующим событием
        const stateWithEvents = {
          ...initialState,
          events: [mockEvents[0]],
        };

        // Обновленные данные события
        const updatedEvent = {
          ...mockEvents[0],
          title: 'Новое название',
          price: 6000,
        };

        const action = {
          type: updateEvent.fulfilled.type,
          payload: updatedEvent,
        };

        const newState = eventsReducer(stateWithEvents, action);

        expect(newState.events[0]).toEqual(updatedEvent);
        expect(newState.events[0].title).toBe('Новое название');
        expect(newState.events[0].price).toBe(6000);
      });
    });

    describe('deleteEvent', () => {
      it('should handle deleteEvent.fulfilled', () => {
        // Состояние с существующими событиями
        const stateWithEvents = {
          ...initialState,
          events: [...mockEvents],
        };

        const eventIdToRemove = mockEvents[0].id;
        const action = {
          type: deleteEvent.fulfilled.type,
          payload: eventIdToRemove,
        };

        const newState = eventsReducer(stateWithEvents, action);

        expect(newState.events).toHaveLength(mockEvents.length - 1);
        expect(newState.events.find((e) => e.id === eventIdToRemove)).toBeUndefined();
      });
    });

    describe('registerForEvent', () => {
      it('should handle registerForEvent.fulfilled', () => {
        // Состояние с существующим событием
        const stateWithEvents = {
          ...initialState,
          events: [mockEvents[0]],
        };

        // Обновленные данные события после регистрации
        const updatedEvent = {
          ...mockEvents[0],
          currentParticipants: 6, // +1 участник
        };

        const action = {
          type: registerForEvent.fulfilled.type,
          payload: updatedEvent,
        };

        const newState = eventsReducer(stateWithEvents, action);

        expect(newState.events[0]).toEqual(updatedEvent);
        expect(newState.events[0].currentParticipants).toBe(6);
      });
    });

    describe('cancelRegistration', () => {
      it('should handle cancelRegistration.fulfilled', () => {
        // Состояние с существующим событием
        const stateWithEvents = {
          ...initialState,
          events: [mockEvents[0]],
        };

        // Обновленные данные события после отмены регистрации
        const updatedEvent = {
          ...mockEvents[0],
          currentParticipants: 4, // -1 участник
        };

        const action = {
          type: cancelRegistration.fulfilled.type,
          payload: updatedEvent,
        };

        const newState = eventsReducer(stateWithEvents, action);

        expect(newState.events[0]).toEqual(updatedEvent);
        expect(newState.events[0].currentParticipants).toBe(4);
      });
    });
  });
});
