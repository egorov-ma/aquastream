import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEvents,
  fetchFeaturedEvents,
  fetchEventById,
  createEvent as createEventAction,
  updateEvent as updateEventAction,
  deleteEvent as deleteEventAction,
  clearCurrentEvent,
  clearEventsError
} from '../store/eventsSlice';
import {
  Event,
  CreateEventData,
  UpdateEventData,
  EventFilters
} from '../types';
import { RootState, AppDispatch } from '@/store';

/**
 * Хук для работы с событиями
 * Предоставляет доступ к состоянию событий и методам для работы с ними
 */
export const useEvents = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, featuredEvents, currentEvent, isLoading, error } = useSelector(
    (state: RootState) => state.events
  );

  // Получение всех событий
  const getEvents = useCallback(
    async (filters?: EventFilters) => {
      await dispatch(fetchEvents(filters));
    },
    [dispatch]
  );

  // Получение избранных событий
  const getFeaturedEvents = useCallback(
    async (limit?: number) => {
      await dispatch(fetchFeaturedEvents(limit ?? 3));
    },
    [dispatch]
  );

  // Получение события по ID
  const getEventById = useCallback(
    async (id: string) => {
      await dispatch(fetchEventById(id));
    },
    [dispatch]
  );

  // Создание события
  const createEvent = useCallback(
    async (eventData: CreateEventData) => {
      await dispatch(createEventAction(eventData));
    },
    [dispatch]
  );

  // Обновление события
  const updateEvent = useCallback(
    async (id: string, eventData: UpdateEventData) => {
      await dispatch(updateEventAction({ id, eventData }));
    },
    [dispatch]
  );

  // Удаление события
  const deleteEvent = useCallback(
    async (id: string) => {
      await dispatch(deleteEventAction(id));
    },
    [dispatch]
  );

  // Очистка текущего события
  const clearEvent = useCallback(
    () => {
      dispatch(clearCurrentEvent());
    },
    [dispatch]
  );

  // Очистка ошибок
  const clearError = useCallback(
    () => {
      dispatch(clearEventsError());
    },
    [dispatch]
  );

  return {
    events,
    featuredEvents,
    currentEvent,
    isLoading,
    error,
    getEvents,
    getFeaturedEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    clearEvent,
    clearError
  };
}; 